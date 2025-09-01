"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { ConfirmDialog } from "@/components/confirm-dialog";

/** ================== SELECT (com embeds) ================== */
const MAINTENANCE_SELECT = `
  id, user_id, vehicle_id, supplier_id,
  maintenance_type, description, cost,
  maintenance_date, next_maintenance_date,
  mileage, status, created_at, updated_at,
  vehicle:vehicles ( id, plate, brand, model ),
  supplier:suppliers ( id, name )
`;

/** ================== TIPOS ================== */
type VehicleRef = {
  id: string;
  plate: string;
  brand?: string | null;
  model?: string | null;
} | null;

type SupplierRef = {
  id: string;
  name: string | null;
} | null;

export type MaintenanceRow = {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  supplier_id: string | null;

  maintenance_type: string;                // ex.: "preventive" | "corrective" | "inspection"
  description: string | null;
  cost: number;
  maintenance_date: string;               // ISO
  next_maintenance_date: string | null;   // ISO
  mileage: number | null;
  status: string;                         // ex.: "pending" | "in_progress" | "completed" | "canceled"

  created_at: string;
  updated_at: string;

  // embeds (podem vir como objeto ou array dependendo do FK name)
  vehicle: VehicleRef | VehicleRef[] | null;
  supplier: SupplierRef | SupplierRef[] | null;
};

/** ================== HELPERS ================== */
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const one = <T,>(v: any): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pendente", className: "border" },
    in_progress: { label: "Em andamento", className: "bg-blue-500 text-white" },
    completed: { label: "Concluída", className: "bg-green-600 text-white" },
    canceled: { label: "Cancelada", className: "bg-destructive text-destructive-foreground" },
  };
  const it = map[status] ?? { label: status, className: "border" };
  return <Badge className={it.className}>{it.label}</Badge>;
};

const getTypeBadge = (type: string) => {
  const map: Record<string, { label: string; className: string }> = {
    preventive: { label: "Preventiva", className: "bg-sky-500 text-white" },
    corrective: { label: "Corretiva", className: "bg-amber-500 text-white" },
    inspection: { label: "Inspeção", className: "bg-emerald-500 text-white" },
  };
  const it = map[type] ?? { label: type, className: "border" };
  return <Badge className={it.className}>{it.label}</Badge>;
};

/** ================== SUMMARY ================== */
async function getSummaryMaintenance() {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("maintenance")
    .select("status, cost, maintenance_date");
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length;
  const pending = rows.filter((r: any) => r.status === "pending").length;
  const inProgress = rows.filter((r: any) => r.status === "in_progress").length;
  const completed = rows.filter((r: any) => r.status === "completed").length;
  const totalCost = rows.reduce((acc: number, r: any) => acc + Number(r.cost ?? 0), 0);

  return {
    totalMaintenance: total,
    pendingMaintenance: pending,
    inProgressMaintenance: inProgress,
    completedMaintenance: completed,
    totalCost,
  };
}

/** ================== FETCH VIA makeFetchDataClient ================== */
const fetchMaintenance = makeFetchDataClient<MaintenanceRow>({
  table: "maintenance",
  select: MAINTENANCE_SELECT,
  defaultOrder: { column: "maintenance_date", ascending: false },
  // sem VIEW, busca server-side só em colunas da própria tabela
  searchFields: ["description"],
  filterMap: {
    status: "status",
    maintenance_type: "maintenance_type",
    vehicle_id: "vehicle_id",
    supplier_id: "supplier_id",
  },
});

/** ================== DELETE ================== */
async function deleteMaintenanceClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("maintenance").delete().eq("id", id);
  if (error) throw error;
}

/** ================== PAGE ================== */
export default function MaintenancePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // estado do ConfirmDialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<MaintenanceRow | null>(null);

  const openDeleteModal = (row: MaintenanceRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteMaintenanceClient(target.id);
      toast.success("Manutenção excluída com sucesso");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao excluir manutenção");
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
          <Wrench className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manutenções</h1>
            <p className="text-muted-foreground">Gerencie o histórico de manutenção da frota</p>
          </div>
        </div>
        <Link href="/dashboard/fleet/maintenance/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Manutenção
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        fetchData={getSummaryMaintenance}
        cards={[
          { title: "Total de Manutenções", icon: <Wrench />, valueKey: "totalMaintenance" },
          { title: "Pendentes", icon: <AlertTriangle />, valueKey: "pendingMaintenance", colorClass: "text-chart-2" },
          { title: "Em Andamento", icon: <CheckCircle />, valueKey: "inProgressMaintenance", colorClass: "text-chart-1" },
          { title: "Concluídas", icon: <CheckCircle />, valueKey: "completedMaintenance", colorClass: "text-chart-3" },
          // { title: "Custo Total", icon: <CreditCard />, valueKey: "totalCost", format: (v) => currencyBRL.format(Number(v || 0)) },
        ]}
      />

      {/* RecordList */}
      <RecordList<MaintenanceRow>
        key={refreshKey}
        title="Lista de Manutenções"
        description="Registros cadastrados"
        itemsPerPage={10}
        fetchData={fetchMaintenance}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Pendente", value: "pending" },
              { label: "Em andamento", value: "in_progress" },
              { label: "Concluída", value: "completed" },
              { label: "Cancelada", value: "canceled" },
            ],
          },
          {
            name: "maintenance_type",
            label: "Tipo",
            options: [
              { label: "Preventiva", value: "preventive" },
              { label: "Corretiva", value: "corrective" },
              { label: "Inspeção", value: "inspection" },
            ],
          },
        ]}
        fields={[
          {
            name: "vehicle",
            label: "Veículo",
            type: "text",
            render: (_: any, row) => {
              const v = one<VehicleRef>(row.vehicle);
              if (!v) return "—";
              const title = [v?.brand, v?.model].filter(Boolean).join(" ") || v?.plate;
              return (
                <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="block hover:underline">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground tracking-wide">{v.plate}</div>
                </Link>
              );
            },
          },
          {
            name: "maintenance_type",
            label: "Tipo",
            type: "badge",
            render: (val) => getTypeBadge(String(val)),
          },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (val) => getStatusBadge(String(val)),
          },
          {
            name: "cost",
            label: "Custo",
            type: "text",
            render: (v) => currencyBRL.format(Number(v ?? 0)),
          },
          {
            name: "supplier",
            label: "Fornecedor",
            type: "text",
            render: (_: any, row) => {
              const s = one<SupplierRef>(row.supplier);
              return s ? (
                <Link href={`/dashboard/suppliers/${s.id}`} className="hover:underline">
                  {s.name || "—"}
                </Link>
              ) : (
                "—"
              );
            },
          },
          {
            name: "maintenance_date",
            label: "Data",
            type: "text",
            render: (iso) => fmtDate(String(iso)),
          },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/fleet/maintenance/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/fleet/maintenance/${row.id}/edit` },
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
        title="Excluir manutenção"
        description={<>Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
