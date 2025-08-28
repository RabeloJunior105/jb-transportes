"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Truck,
    Fuel as FuelIcon,
    Wrench,
    BadgeCheck,
    Pencil,
    Plus,
    MapPin,
    Gauge,
    Cog,
    ChevronRight,
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
import { Vehicle } from "../config";

// --------- TIPOS AUXILIARES (ajuste se seu schema for diferente) ----------
type FuelRow = {
    id: string;
    fuel_date: string;
    fuel_type: "diesel" | "gasolina" | "etanol" | "flex" | "gnv" | "eletrico";
    liters: number;
    price_per_liter: number;
    total_cost: number | null;
    location: string | null;
    driver: { id: string; name: string | null } | null;
    supplier: { id: string; name: string | null } | null;
};

type MaintenanceRow = {
    id: string;
    service_date: string;
    type: string | null;     // ex: "Preventiva", "Corretiva"
    status: string | null;   // ex: "done", "pending"
    cost: number | null;
    odometer: number | null;
    supplier: { id: string; name: string | null } | null;
};

// --------- UTIS ----------
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

// --------- COMPONENTES MINI ----------
function StatusBadge({ status }: { status?: string | null }) {
    const map: Record<string, { label: string; className: string }> = {
        active: { label: "Ativo", className: "bg-chart-1 text-white" },
        inactive: { label: "Inativo", className: "border" },
        maintenance: { label: "Manutenção", className: "bg-chart-2 text-accent-foreground" },
    };
    const m = map[status ?? ""] ?? { label: status ?? "—", className: "border" };
    return <Badge className={m.className}>{m.label}</Badge>;
}

function RowKV({ k, v }: { k: string; v?: string | number | null }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">{k}</span>
            <span className="text-sm font-medium">{v ?? "—"}</span>
        </div>
    );
}

// --------- PÁGINA ----------
export default function VehicleViewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [fuels, setFuels] = useState<FuelRow[]>([]);
    const [maintenances, setMaintenances] = useState<MaintenanceRow[]>([]);

    // KPIs
    const totalLiters = useMemo(
        () => fuels.reduce((acc, r) => acc + Number(r.liters ?? 0), 0),
        [fuels]
    );
    const totalFuelCost = useMemo(
        () => fuels.reduce((acc, r) => acc + Number(r.total_cost ?? r.liters * r.price_per_liter), 0),
        [fuels]
    );

    useEffect(() => {
        (async () => {
            try {
                // 1) Vehicle
                {
                    const { data, error } = await sb.from("vehicles").select("*").eq("id", id).single();
                    if (error) throw error;
                    setVehicle(data as Vehicle);
                }

                // 2) Fuels (últimos 10) com relacionamentos (driver/supplier)
                {
                    const { data, error } = await sb
                        .from("fuel")
                        .select(
                            `
              id, fuel_date, fuel_type, liters, price_per_liter, total_cost, location,
              driver:employees ( id, name ),
              supplier:suppliers ( id, name )
            `
                        )
                        .eq("vehicle_id", id)
                        .order("fuel_date", { ascending: false })
                        .limit(10);
                    if (error) throw error;
                    setFuels((data ?? []) as any[]);
                }

                // 3) Maintenances (últimas 10) — ajuste nomes de colunas se necessário
                {
                    const { data, error } = await sb
                        .from("maintenance") // se sua tabela tiver outro nome, ajuste aqui
                        .select(
                            `
              id, service_date, type, status, cost, odometer,
              supplier:suppliers ( id, name )
            `
                        )
                        .eq("vehicle_id", id)
                        .order("service_date", { ascending: false })
                        .limit(10);
                    // Se não existir a tabela, ignore silenciosamente:
                    if (!error) setMaintenances((data ?? []) as any[]);
                }
            } catch (e) {
                console.error(e);
                toast.error("Não foi possível carregar o veículo.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, sb]);

    if (loading) return null; // aqui você pode colocar skeletons se quiser
    if (!vehicle) return <div className="p-6">Veículo não encontrado.</div>;

    const titleBrandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Truck className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {titleBrandModel || vehicle.plate}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground tracking-wide">
                                Placa: <span className="font-medium text-foreground">{vehicle.plate || "—"}</span>
                            </span>
                            <StatusBadge status={vehicle.status} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/dashboard/fleet/vehicles/${vehicle.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/fleet/fuel/new?vehicle_id=${vehicle.id}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo abastecimento
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={`/dashboard/fleet/maintenance/new?vehicle_id=${vehicle.id}`}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Nova manutenção
                        </Link>
                    </Button>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* COLUNA ESQUERDA (2/3) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Abastecimentos */}
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FuelIcon className="h-5 w-5" />
                                    Abastecimentos recentes
                                </CardTitle>
                                <CardDescription>Últimos registros do veículo</CardDescription>
                            </div>
                            <Button asChild variant="ghost">
                                <Link href={`/dashboard/fleet/fuel?vehicle_id=${vehicle.id}`}>
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
                                        <th className="py-2 text-left">Combustível</th>
                                        <th className="py-2 text-left">Consumo</th>
                                        <th className="py-2 text-left">Motorista</th>
                                        <th className="py-2 text-left">Fornecedor</th>
                                        <th className="py-2 text-left">Local</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fuels.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-muted-foreground">
                                                Nenhum abastecimento encontrado.
                                            </td>
                                        </tr>
                                    )}
                                    {fuels.map((r) => {
                                        const liters = Number(r.liters ?? 0);
                                        const ppl = Number(r.price_per_liter ?? 0);
                                        const total = Number(r.total_cost ?? liters * ppl);
                                        return (
                                            <tr key={r.id} className="border-b last:border-b-0 align-top">
                                                <td className="py-2">{fmtDate(r.fuel_date)}</td>
                                                <td className="py-2">
                                                    <Badge variant="secondary" className="uppercase">
                                                        {r.fuel_type}
                                                    </Badge>
                                                </td>
                                                <td className="py-2">
                                                    <div className="leading-tight">
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="font-medium">{liters.toLocaleString("pt-BR")} L</span>
                                                            <span className="px-1">•</span>
                                                            <span>{currencyBRL.format(ppl)}/L</span>
                                                        </div>
                                                        <div className="font-semibold">{currencyBRL.format(total)}</div>
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    {r.driver ? (
                                                        <Link
                                                            href={`/dashboard/people/employees/${r.driver.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {r.driver.name || "—"}
                                                        </Link>
                                                    ) : (
                                                        "—"
                                                    )}
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
                                        );
                                    })}
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
                                    Manutenções recentes
                                </CardTitle>
                                <CardDescription>Histórico do veículo</CardDescription>
                            </div>
                            <Button asChild variant="ghost">
                                <Link href={`/dashboard/fleet/maintenance?vehicle_id=${vehicle.id}`}>
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
                                        <th className="py-2 text-left">Tipo</th>
                                        <th className="py-2 text-left">Status</th>
                                        <th className="py-2 text-left">Odômetro</th>
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
                                            <td className="py-2">{m.type ?? "—"}</td>
                                            <td className="py-2">
                                                <Badge variant="secondary">{m.status ?? "—"}</Badge>
                                            </td>
                                            <td className="py-2">{m.odometer ?? "—"}</td>
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
                                            <td className="py-2">{m.cost != null ? currencyBRL.format(m.cost) : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUNA DIREITA (1/3) */}
                <div className="space-y-6">
                    {/* Resumo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BadgeCheck className="h-5 w-5" />
                                Resumo rápido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RowKV k="Combustível" v={vehicle.fuel_type} />
                            <RowKV k="Odômetro (km)" v={vehicle.mileage} />
                            <RowKV k="Capacidade" v={vehicle.capacity} />
                            <div className="mt-3 h-px bg-border" />
                            <RowKV k="Abastecimentos" v={fuels.length} />
                            <RowKV k="Total de Litros" v={totalLiters.toLocaleString("pt-BR")} />
                            <RowKV k="Gasto total" v={currencyBRL.format(totalFuelCost)} />
                        </CardContent>
                    </Card>

                    {/* Dados do veículo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cog className="h-5 w-5" />
                                Dados do veículo
                            </CardTitle>
                            <CardDescription>Informações cadastrais</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RowKV k="Marca" v={vehicle.brand} />
                            <RowKV k="Modelo" v={vehicle.model} />
                            <RowKV k="Ano" v={vehicle.year} />
                            <RowKV k="Cor" v={vehicle.color} />
                            <RowKV k="Placa" v={vehicle.plate} />
                            <RowKV k="Chassi" v={vehicle.chassis} />
                            <RowKV k="RENAVAM" v={vehicle.renavam} />
                            <RowKV k="Status" v={<StatusBadge status={vehicle.status} /> as any} />
                            <div className="mt-3 h-px bg-border" />
                            <RowKV k="Criado em" v={fmtDate(vehicle.created_at)} />
                            <RowKV k="Atualizado em" v={fmtDate(vehicle.updated_at)} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
