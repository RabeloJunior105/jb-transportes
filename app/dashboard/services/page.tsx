"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Truck,
  MapPin,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { ConfirmDialog } from "@/components/confirm-dialog";

// ================== SELECT (com embeds) ==================
const SERVICES_SELECT = `
  id, user_id, service_code, client_id, vehicle_id, driver_id,
  collection_date, delivery_date,
  origin, destination, description,
  service_value, toll_cost, fuel_cost, other_costs,
  status, created_at, updated_at,
  client:clients ( id, name ),
  vehicle:vehicles ( id, plate, brand, model ),
  driver:employees ( id, name )
`;

// ================== TIPOS ==================
type ClientRef = { id: string; name: string | null } | null;
type VehicleRef = { id: string; plate: string; brand?: string | null; model?: string | null } | null;
type DriverRef = { id: string; name: string | null } | null;

export type ServiceRow = {
  id: string;
  user_id: string;
  service_code: string;
  client_id: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  collection_date: string; // ISO
  delivery_date: string | null; // ISO
  origin: string | null;
  destination: string | null;
  description: string | null;
  service_value: number;
  toll_cost: number;
  fuel_cost: number;
  other_costs: number;
  status: "pending" | "in_progress" | "completed" | "canceled";
  created_at: string;
  updated_at: string;

  client: ClientRef | ClientRef[] | null;
  vehicle: VehicleRef | VehicleRef[] | null;
  driver: DriverRef | DriverRef[] | null;
};

// ================== HELPERS ==================
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const one = <T,>(v: any): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

// ================== SUMMARY ==================
async function getSummaryServices() {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("services")
    .select("status, service_value, toll_cost, fuel_cost, other_costs");
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length;
  const pending = rows.filter((r: any) => r.status === "pending").length;
  const inProgress = rows.filter((r: any) => r.status === "in_progress").length;
  const completed = rows.filter((r: any) => r.status === "completed").length;

  const faturamento = rows.reduce((acc: number, r: any) => acc + Number(r.service_value ?? 0), 0);

  return {
    totalServices: total,
    pendingServices: pending,
    inProgressServices: inProgress,
    completedServices: completed,
    totalRevenue: faturamento,
  };
}

// ================== FETCH VIA makeFetchDataClient ==================
const fetchServices = makeFetchDataClient<ServiceRow>({
  table: "services",
  select: SERVICES_SELECT,
  defaultOrder: { column: "collection_date", ascending: false },
  searchFields: ["service_code", "origin", "destination", "description"],
  filterMap: {
    status: "status",
    client_id: "client_id",
    vehicle_id: "vehicle_id",
    driver_id: "driver_id",
  },
});

// ================== DELETE ==================
async function deleteServiceClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ================== BADGES ==================
const statusBadge = (status: ServiceRow["status"]) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "border" },
    in_progress: { label: "Em andamento", cls: "bg-blue-500 text-white" },
    completed: { label: "Concluído", cls: "bg-green-600 text-white" },
    canceled: { label: "Cancelado", cls: "bg-destructive text-destructive-foreground" },
  };
  const it = map[status] ?? { label: String(status), cls: "border" };
  return <Badge className={it.cls}>{it.label}</Badge>;
};

export default function ServicesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<ServiceRow | null>(null);

  const openDeleteModal = (row: ServiceRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteServiceClient(target.id);
      toast.success(`Serviço ${target.service_code} excluído com sucesso`);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao excluir serviço");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Truck className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
            <p className="text-muted-foreground">Gestão de serviços de transporte</p>
          </div>
        </div>
        <Link href="/dashboard/services/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummaryServices}
        cards={[
          { title: "Total de Serviços", icon: <Truck />, valueKey: "totalServices" },
          { title: "Pendentes", icon: <AlertTriangle />, valueKey: "pendingServices", colorClass: "text-chart-2" },
          { title: "Em Andamento", icon: <CheckCircle />, valueKey: "inProgressServices", colorClass: "text-chart-1" },
          { title: "Concluídos", icon: <CheckCircle />, valueKey: "completedServices", colorClass: "text-chart-3" },
          // { title: "Faturamento", icon: <CreditCard />, valueKey: "totalRevenue", format: (v) => currencyBRL.format(Number(v || 0)) }
        ]}
      />

      {/* RecordList */}
      <RecordList<ServiceRow>
        key={refreshKey}
        title="Lista de Serviços"
        description="Serviços cadastrados"
        itemsPerPage={10}
        fetchData={fetchServices}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Pendente", value: "pending" },
              { label: "Em andamento", value: "in_progress" },
              { label: "Concluído", value: "completed" },
              { label: "Cancelado", value: "canceled" },
            ],
          },
        ]}
        fields={[
          {
            name: "service_code",
            label: "Serviço",
            type: "text",
            render: (val, row) => (
              <Link href={`/dashboard/services/${row.id}`} className="block hover:underline">
                <div className="font-medium">{val}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {(row.origin || "—")} <span className="opacity-60">→</span> {(row.destination || "—")}
                </div>
              </Link>
            ),
          },
          {
            name: "client",
            label: "Cliente",
            type: "text",
            render: (_: any, row) => {
              const c = one<ClientRef>(row.client);
              return c ? (
                <Link href={`/dashboard/clients/${c.id}`} className="hover:underline">
                  {c.name || "—"}
                </Link>
              ) : "—";
            },
          },
          {
            name: "vehicle",
            label: "Veículo",
            type: "text",
            render: (_: any, row) => {
              const v = one<VehicleRef>(row.vehicle);
              if (!v) return "—";
              const title = [v.brand, v.model].filter(Boolean).join(" ") || v.plate;
              return (
                <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="block hover:underline">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground tracking-wide">{v.plate}</div>
                </Link>
              );
            },
          },
          {
            name: "driver",
            label: "Motorista",
            type: "text",
            render: (_: any, row) => {
              const d = one<DriverRef>(row.driver);
              return d ? (
                <Link href={`/dashboard/people/employees/${d.id}`} className="hover:underline">
                  {d.name || "—"}
                </Link>
              ) : "—";
            },
          },
          {
            name: "collection_date",
            label: "Coleta",
            type: "text",
            render: (v) => fmtDate(String(v)),
          },
          {
            name: "service_value",
            label: "Valor",
            type: "text",
            render: (v, row) => {
              const totalCosts = Number(row.toll_cost ?? 0) + Number(row.fuel_cost ?? 0) + Number(row.other_costs ?? 0);
              return (
                <div>
                  <div className="font-medium">{currencyBRL.format(Number(v ?? 0))}</div>
                  <div className="text-xs text-muted-foreground">Custos: {currencyBRL.format(totalCosts)}</div>
                </div>
              );
            },
          },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (val) => statusBadge(val),
          },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/services/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/services/${row.id}/edit` },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            color: "destructive",
            onClick: (row) => openDeleteModal(row),
          },
        ]}
      />

      {/* Modal de confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={deleting}
        title="Excluir serviço"
        description={
          <>
            Tem certeza que deseja excluir o serviço{" "}
            <strong>{target?.service_code}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
