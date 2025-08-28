"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  User2,
  Fuel as FuelIcon,
  Truck,
  BadgeCheck,
  Pencil,
  Plus,
  MapPin,
  ChevronRight,
  Wrench,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

/** ======= TIPOS ======= */
type Employee = {
  id: string;
  user_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  document?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FuelRow = {
  id: string;
  fuel_date: string;
  fuel_type: "diesel" | "gasolina" | "etanol" | "flex" | "gnv" | "eletrico";
  liters: number;
  price_per_liter: number;
  total_cost: number | null;
  location: string | null;
  vehicle:
  | { id: string; plate: string; brand?: string | null; model?: string | null }
  | null;
  supplier: { id: string; name: string | null } | null;
};

type MaintenanceRow = {
  id: string;
  service_date: string; // ajuste se for "date"
  type: string | null;
  status: string | null;
  cost: number | null;
  odometer: number | null;
  vehicle:
  | { id: string; plate: string; brand?: string | null; model?: string | null }
  | null;
  supplier: { id: string; name: string | null } | null;
};

type ServiceRow = {
  id: string;
  service_date: string; // ajuste se for "date"
  status: string | null;
  price: number | null;
  vehicle:
  | { id: string; plate: string; brand?: string | null; model?: string | null }
  | null;
  client: { id: string; name: string | null } | null; // se tiver clients
};

/** ======= UTILS ======= */
const currencyBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

function RowKV({ k, v }: { k: string; v?: string | number | null }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{(v as any) ?? "—"}</span>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Ativo", className: "bg-chart-1 text-white" },
    inactive: { label: "Inativo", className: "border" },
  };
  const m = map[status ?? ""] ?? { label: status ?? "—", className: "border" };
  return <Badge className={m.className}>{m.label}</Badge>;
}

function VehicleCell({
  v,
  hrefBase = "/dashboard/fleet/vehicles",
}: {
  v:
  | { id: string; plate: string; brand?: string | null; model?: string | null }
  | null
  | undefined;
  hrefBase?: string;
}) {
  if (!v) return <span>—</span>;
  const brandModel = [v.brand, v.model].filter(Boolean).join(" ");
  return (
    <Link href={`${hrefBase}/${v.id}`} className="block hover:underline">
      <div className="font-medium">{brandModel || v.plate}</div>
      <div className="text-xs text-muted-foreground tracking-wide">{v.plate}</div>
    </Link>
  );
}

function AmountsFuelCell({ row }: { row: FuelRow }) {
  const liters = Number(row.liters ?? 0);
  const ppl = Number(row.price_per_liter ?? 0);
  const total = Number(row.total_cost ?? liters * ppl);

  return (
    <div className="leading-tight">
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">{liters.toLocaleString("pt-BR")} L</span>
        <span className="px-1">•</span>
        <span>{currencyBRL.format(ppl)}/L</span>
      </div>
      <div className="font-semibold">{currencyBRL.format(total)}</div>
    </div>
  );
}

/** ======= PÁGINA ======= */
export default function EmployeeViewPage() {
  const { id } = useParams<{ id: string }>();
  const sb = useMemo(() => createBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [fuels, setFuels] = useState<FuelRow[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);

  // KPIs de abastecimento
  const totalRefuels = fuels.length;
  const totalLiters = useMemo(
    () => fuels.reduce((acc, r) => acc + Number(r.liters ?? 0), 0),
    [fuels]
  );
  const totalFuelCost = useMemo(
    () =>
      fuels.reduce(
        (acc, r) =>
          acc + Number(r.total_cost ?? r.liters * r.price_per_liter ?? 0),
        0
      ),
    [fuels]
  );
  const vehiclesDriven = useMemo(() => {
    const s = new Set(fuels.map((r) => r.vehicle?.id).filter(Boolean) as string[]);
    return s.size;
  }, [fuels]);

  // KPIs de manutenção/serviços
  const totalMaintCost = useMemo(
    () => maintenances.reduce((acc, m) => acc + Number(m.cost ?? 0), 0),
    [maintenances]
  );
  const totalServicePrice = useMemo(
    () => services.reduce((acc, s) => acc + Number(s.price ?? 0), 0),
    [services]
  );

  useEffect(() => {
    (async () => {
      try {
        // 1) Employee
        {
          const { data, error } = await sb
            .from("employees")
            .select("*")
            .eq("id", id)
            .single();
          if (error) throw error;
          setEmployee(data as Employee);
        }

        // 2) Fuels como motorista
        let vehicleIds: string[] = [];
        {
          const { data, error } = await sb
            .from("fuel")
            .select(
              `
              id, fuel_date, fuel_type, liters, price_per_liter, total_cost, location,
              vehicle:vehicles ( id, plate, brand, model ),
              supplier:suppliers ( id, name )
            `
            )
            .eq("driver_id", id)
            .order("fuel_date", { ascending: false })
            .limit(10);

          if (error) throw error;

          const rows: FuelRow[] = (data ?? []).map((r: any) => ({
            ...r,
            vehicle: Array.isArray(r.vehicle) ? (r.vehicle[0] ?? null) : r.vehicle ?? null,
            supplier: Array.isArray(r.supplier) ? (r.supplier[0] ?? null) : r.supplier ?? null,
          }));

          setFuels(rows);
          vehicleIds = Array.from(
            new Set(rows.map((r) => r.vehicle?.id).filter(Boolean) as string[])
          );
        }

        // 3) Maintenances vinculadas ao employee (ou fallback por veículos)
        {
          // tentativa preferencial: tem coluna employee_id / driver_id?
          let mrows: MaintenanceRow[] = [];
          try {
            const { data, error } = await sb
              .from("maintenance") // ajuste se seu nome de tabela for outro
              .select(
                `
                id, service_date, type, status, cost, odometer,
                vehicle:vehicles ( id, plate, brand, model ),
                supplier:suppliers ( id, name )
              `
              )
              .or(`employee_id.eq.${id},driver_id.eq.${id}`) // cobre os 2 nomes
              .order("service_date", { ascending: false })
              .limit(10);

            if (!error) {
              mrows = (data ?? []).map((r: any) => ({
                ...r,
                vehicle: Array.isArray(r.vehicle) ? (r.vehicle[0] ?? null) : r.vehicle ?? null,
                supplier: Array.isArray(r.supplier) ? (r.supplier[0] ?? null) : r.supplier ?? null,
              }));
            }
          } catch (_) {
            // tabela pode não existir: ignora
          }

          // fallback: se nada veio e temos vehicles dirigidos por ele
          if (mrows.length === 0 && vehicleIds.length) {
            try {
              const { data, error } = await sb
                .from("maintenance")
                .select(
                  `
                  id, service_date, type, status, cost, odometer,
                  vehicle:vehicles ( id, plate, brand, model ),
                  supplier:suppliers ( id, name )
                `
                )
                .in("vehicle_id", vehicleIds)
                .order("service_date", { ascending: false })
                .limit(10);

              if (!error) {
                mrows = (data ?? []).map((r: any) => ({
                  ...r,
                  vehicle: Array.isArray(r.vehicle) ? (r.vehicle[0] ?? null) : r.vehicle ?? null,
                  supplier: Array.isArray(r.supplier) ? (r.supplier[0] ?? null) : r.supplier ?? null,
                }));
              }
            } catch (_) { }
          }

          setMaintenances(mrows);
        }

        // 4) Services vinculados ao employee (ou fallback por veículos)
        {
          let srows: ServiceRow[] = [];
          try {
            const { data, error } = await sb
              .from("services") // ajuste se o nome for outro
              .select(
                `
                id, service_date, status, price,
                vehicle:vehicles ( id, plate, brand, model ),
                client:clients ( id, name )
              `
              )
              .or(`employee_id.eq.${id},driver_id.eq.${id}`) // cobre ambos
              .order("service_date", { ascending: false })
              .limit(10);

            if (!error) {
              srows = (data ?? []).map((r: any) => ({
                ...r,
                vehicle: Array.isArray(r.vehicle) ? (r.vehicle[0] ?? null) : r.vehicle ?? null,
                client: Array.isArray(r.client) ? (r.client[0] ?? null) : r.client ?? null,
              }));
            }
          } catch (_) {
            // tabela pode não existir
          }

          if (srows.length === 0 && vehicleIds.length) {
            try {
              const { data, error } = await sb
                .from("services")
                .select(
                  `
                  id, service_date, status, price,
                  vehicle:vehicles ( id, plate, brand, model ),
                  client:clients ( id, name )
                `
                )
                .in("vehicle_id", vehicleIds)
                .order("service_date", { ascending: false })
                .limit(10);

              if (!error) {
                srows = (data ?? []).map((r: any) => ({
                  ...r,
                  vehicle: Array.isArray(r.vehicle) ? (r.vehicle[0] ?? null) : r.vehicle ?? null,
                  client: Array.isArray(r.client) ? (r.client[0] ?? null) : r.client ?? null,
                }));
              }
            } catch (_) { }
          }

          setServices(srows);
        }
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível carregar o funcionário.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, sb]);

  if (loading) return null; // pode trocar por skeletons
  if (!employee) return <div className="p-6">Funcionário não encontrado.</div>;

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User2 className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">
              {employee.name || "Funcionário"}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {employee.document && (
                <span className="text-sm text-muted-foreground tracking-wide">
                  Documento:{" "}
                  <span className="font-medium text-foreground">
                    {employee.document}
                  </span>
                </span>
              )}
              {employee.status && <StatusBadge status={employee.status} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/people/employees/${employee.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/fleet/fuel/new?driver_id=${employee.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Novo abastecimento
            </Link>
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ESQUERDA (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Abastecimentos */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FuelIcon className="h-5 w-5" />
                  Abastecimentos como motorista
                </CardTitle>
                <CardDescription>
                  Últimos registros em que {employee.name?.split(" ")[0] ?? "o funcionário"} foi o motorista
                </CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href={`/dashboard/fleet/fuel?driver_id=${employee.id}`}>
                  Ver todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 text-left">Data</th>
                    <th className="py-2 text-left">Veículo</th>
                    <th className="py-2 text-left">Consumo</th>
                    <th className="py-2 text-left">Fornecedor</th>
                    <th className="py-2 text-left">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {fuels.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Nenhum abastecimento encontrado.
                      </td>
                    </tr>
                  )}
                  {fuels.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0 align-top">
                      <td className="py-2">{fmtDate(r.fuel_date)}</td>
                      <td className="py-2">
                        <VehicleCell v={r.vehicle} />
                      </td>
                      <td className="py-2">
                        <AmountsFuelCell row={r} />
                      </td>
                      <td className="py-2">
                        {r.supplier ? (
                          <Link
                            href={`/dashboard/suppliers/${r.supplier.id}`}
                            className="hover:underline"
                          >
                            {r.supplier.name || "—"}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {r.location || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Manutenções */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Manutenções vinculadas
                </CardTitle>
                <CardDescription>Onde este funcionário esteve envolvido ou nos veículos que ele dirigiu</CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href={`/dashboard/fleet/maintenance?employee_id=${employee.id}`}>
                  Ver todas
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 text-left">Data</th>
                    <th className="py-2 text-left">Veículo</th>
                    <th className="py-2 text-left">Tipo</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="py-2 text-left">Fornecedor</th>
                    <th className="py-2 text-left">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Nenhuma manutenção encontrada.
                      </td>
                    </tr>
                  )}
                  {maintenances.map((m) => (
                    <tr key={m.id} className="border-b last:border-b-0 align-top">
                      <td className="py-2">{fmtDate(m.service_date)}</td>
                      <td className="py-2">
                        <VehicleCell v={m.vehicle} />
                      </td>
                      <td className="py-2">{m.type ?? "—"}</td>
                      <td className="py-2">
                        <Badge variant="secondary">{m.status ?? "—"}</Badge>
                      </td>
                      <td className="py-2">
                        {m.supplier ? (
                          <Link
                            href={`/dashboard/suppliers/${m.supplier.id}`}
                            className="hover:underline"
                          >
                            {m.supplier.name || "—"}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2">
                        {m.cost != null ? currencyBRL.format(m.cost) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Serviços */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Serviços vinculados
                </CardTitle>
                <CardDescription>Serviços em que este funcionário atuou ou em veículos dirigidos por ele</CardDescription>
              </div>
              <Button asChild variant="ghost">
                <Link href={`/dashboard/services?employee_id=${employee.id}`}>
                  Ver todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 text-left">Data</th>
                    <th className="py-2 text-left">Veículo</th>
                    <th className="py-2 text-left">Cliente</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="py-2 text-left">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Nenhum serviço encontrado.
                      </td>
                    </tr>
                  )}
                  {services.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0 align-top">
                      <td className="py-2">{fmtDate(s.service_date)}</td>
                      <td className="py-2">
                        <VehicleCell v={s.vehicle} />
                      </td>
                      <td className="py-2">
                        {s.client ? (
                          <Link
                            href={`/dashboard/clients/${s.client.id}`}
                            className="hover:underline"
                          >
                            {s.client.name || "—"}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2">
                        <Badge variant="secondary">{s.status ?? "—"}</Badge>
                      </td>
                      <td className="py-2">
                        {s.price != null ? currencyBRL.format(s.price) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* DIREITA (1/3) */}
        <div className="space-y-6">
          {/* Resumo rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" />
                Resumo rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RowKV k="Abastecimentos" v={totalRefuels} />
              <RowKV k="Total de Litros" v={totalLiters.toLocaleString("pt-BR")} />
              <RowKV k="Gasto com Combustível" v={currencyBRL.format(totalFuelCost)} />
              <div className="mt-3 h-px bg-border" />
              <RowKV k="Manutenções" v={maintenances.length} />
              <RowKV k="Custo em Manutenção" v={currencyBRL.format(totalMaintCost)} />
              <div className="mt-3 h-px bg-border" />
              <RowKV k="Serviços" v={services.length} />
              <RowKV k="Receita (Serviços)" v={currencyBRL.format(totalServicePrice)} />
              <div className="mt-3 h-px bg-border" />
              <RowKV k="Veículos dirigidos" v={vehiclesDriven} />
            </CardContent>
          </Card>

          {/* Dados do funcionário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 className="h-5 w-5" />
                Dados do funcionário
              </CardTitle>
              <CardDescription>Informações cadastrais</CardDescription>
            </CardHeader>
            <CardContent>
              <RowKV k="Nome" v={employee.name} />
              <RowKV k="Documento" v={employee.document} />
              <RowKV k="Cargo" v={employee.role} />
              <RowKV k="E-mail" v={employee.email} />
              <RowKV k="Telefone" v={employee.phone} />
              <RowKV k="Status" v={<StatusBadge status={employee.status} /> as any} />
              <div className="mt-3 h-px bg-border" />
              <RowKV k="Criado em" v={fmtDate(employee.created_at)} />
              <RowKV k="Atualizado em" v={fmtDate(employee.updated_at)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
