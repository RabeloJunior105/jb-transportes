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
  CheckCircle,
  Wrench,
  Fuel,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";

import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Vehicle } from "@/lib/supabase/types/vehicle.type";
import { ConfirmDialog } from "@/components/confirm-dialog";

// --- Fetch List ---
const fetchVehicles = makeFetchDataClient<Vehicle>({
  table: "vehicles",
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
  searchFields: ["plate", "model", "brand"],
  filterMap: {
    status: "status",
    fuel_type: "fuel_type",
  },
});

// --- Delete ---
async function deleteVehicleClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

// --- Summary direto aqui ---
async function getSummaryVehicles() {
  const sb = createBrowserClient();
  const { data, error } = await sb.from("vehicles").select("status,fuel_type");
  if (error) throw error;

  const rows = data ?? [];
  return {
    totalVehicles: rows.length,
    activeVehicles: rows.filter((v) => v.status === "active").length,
    maintenanceVehicles: rows.filter((v) => v.status === "maintenance").length,
    dieselVehicles: rows.filter((v) => v.fuel_type === "diesel").length,
  };
}

export default function VehiclesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // estado do ConfirmDialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<Vehicle | null>(null);

  const openDeleteModal = (row: Vehicle) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteVehicleClient(target.id);
      toast.success(`Veículo ${target.plate} excluído com sucesso`);
      setRefreshKey((k) => k + 1); // força recarregar a grid
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir veículo");
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
            <h1 className="text-3xl font-bold text-foreground">Gestão de Veículos</h1>
            <p className="text-muted-foreground">Gerencie a frota</p>
          </div>
        </div>
        <Link href="/dashboard/fleet/vehicles/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        fetchData={getSummaryVehicles}
        cards={[
          { title: "Total de Veículos", icon: <Truck />, valueKey: "totalVehicles" },
          { title: "Veículos Ativos", icon: <CheckCircle />, valueKey: "activeVehicles", colorClass: "text-chart-1" },
          { title: "Em Manutenção", icon: <Wrench />, valueKey: "maintenanceVehicles", colorClass: "text-chart-2" },
          { title: "Diesel", icon: <Fuel />, valueKey: "dieselVehicles", colorClass: "text-chart-3" },
        ]}
      />

      {/* RecordList */}
      <RecordList<Vehicle>
        key={refreshKey} // ← remonta e refaz o fetch após delete
        title="Lista de Veículos"
        description="Veículos cadastrados"
        itemsPerPage={10}
        fetchData={fetchVehicles}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Ativo", value: "active" },
              { label: "Inativo", value: "inactive" },
              { label: "Manutenção", value: "maintenance" },
            ],
          },
          {
            name: "fuel_type",
            label: "Combustível",
            options: [
              { label: "Diesel", value: "diesel" },
              { label: "Gasolina", value: "gasolina" },
              { label: "Etanol", value: "etanol" },
              { label: "Flex", value: "flex" },
              { label: "GNV", value: "gnv" },
              { label: "Elétrico", value: "eletrico" },
            ],
          },
        ]}
        fields={[
          { name: "plate", label: "Placa", type: "text" },
          { name: "model", label: "Modelo", type: "text" },
          { name: "brand", label: "Marca", type: "text" },
          { name: "year", label: "Ano", type: "text" },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (value) => {
              const statusMap: Record<string, { label: string; className: string }> = {
                active: { label: "Ativo", className: "bg-chart-1 text-white" },
                inactive: { label: "Inativo", className: "border" },
                maintenance: { label: "Manutenção", className: "bg-chart-2 text-accent-foreground" },
              };
              const mapped = statusMap[value] || { label: value, className: "border" };
              return <Badge className={mapped.className}>{mapped.label}</Badge>;
            },
          },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/fleet/vehicles/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/fleet/vehicles/${row.id}/edit` },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            color: "destructive",
            onClick: (row) => openDeleteModal(row), // ← abre modal
          },
        ]}
      />

      {/* Modal de confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={deleting}
        title="Excluir veículo"
        description={
          <>
            Tem certeza que deseja excluir o veículo{" "}
            <strong>{target?.plate}</strong>? Essa ação não pode ser desfeita.
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
