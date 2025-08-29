"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Fuel, Eye, Edit, Trash2, Plus, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { ConfirmDialog } from "@/components/confirm-dialog";

import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { FUEL_TABLE, Fuel as FuelType } from "./config";
import { AmountsCell, VehicleCell } from "@/lib/helpers/currency";

// ====== Tipos com relacionamentos ======
type FuelRow = FuelType & {
  vehicle?: { id: string; plate: string; brand?: string | null; model?: string | null } | null;
  driver?: { id: string; name: string | null } | null;      // ou "employee"
  supplier?: { id: string; name: string | null } | null;
};

// --------- Fetch List com embeds ----------
const fetchFuels = makeFetchDataClient<FuelRow>({
  table: FUEL_TABLE,
  // se os FKs estão certinhos, isso funciona direto (LEFT JOIN):
  // alias amigável: vehicle:vehicles, driver:employees, supplier:suppliers
  select: `
    id, fuel_date, fuel_type, liters, price_per_liter, total_cost, location,
    vehicle:vehicles ( id, plate, brand, model ),
    driver:employees ( id, name ),
    supplier:suppliers ( id, name )
  `,
  defaultOrder: { column: "fuel_date", ascending: false },
  searchFields: ["location"], // buscar por nome do relacionado só via VIEW (ver nota abaixo)
  filterMap: {
    fuel_type: "fuel_type",
    vehicle_id: "vehicle_id",
    supplier_id: "supplier_id",
  },
});

// --------- Delete ----------
async function deleteFuelClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from(FUEL_TABLE).delete().eq("id", id);
  if (error) throw error;
}

// --------- Summary ----------
async function getSummaryFuels() {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from(FUEL_TABLE)
    .select("liters,total_cost,fuel_type");
  if (error) throw error;

  const rows = data ?? [];
  const totalRecords = rows.length;
  const totalLiters = rows.reduce((acc, r) => acc + (r.liters ?? 0), 0);
  const totalCost = rows.reduce((acc, r) => acc + (r.total_cost ?? 0), 0);
  const dieselCount = rows.filter((r) => r.fuel_type === "diesel").length;

  return { totalRecords, totalLiters, totalCost, dieselCount };
}

export default function FuelPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<FuelRow | null>(null);

  const openDeleteModal = (row: FuelRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteFuelClient(target.id);
      toast.success("Abastecimento excluído com sucesso");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.log(e);
      toast.error("Erro ao excluir abastecimento");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  const currency = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    []
  );

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Fuel className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Abastecimentos</h1>
            <p className="text-muted-foreground">Registros de abastecimento da frota</p>
          </div>
        </div>
        <Link href="/dashboard/fleet/fuel/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Abastecimento
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummaryFuels}
        cards={[
          { title: "Registros", icon: <Fuel />, valueKey: "totalRecords" },
          { title: "Total de Litros", icon: <Fuel />, valueKey: "totalLiters", colorClass: "text-chart-1" },
          { title: "Custo Total", icon: <Fuel />, valueKey: "totalCost", colorClass: "text-chart-2" },
          { title: "Diesel (Qtd)", icon: <Fuel />, valueKey: "dieselCount", colorClass: "text-chart-3" },
        ]}
      />

      {/* List */}
      <RecordList<FuelRow>
        key={refreshKey}
        title="Lista de Abastecimentos"
        description="Histórico de abastecimentos"
        itemsPerPage={10}
        fetchData={fetchFuels}
        filters={[
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
          {
            name: "fuel_date",
            label: "Data",
            type: "text",
            render: (iso) =>
              iso ? new Date(iso as string).toLocaleDateString("pt-BR") : "-",
          },
          {
            // VEÍCULO: marca/modelo em cima e placa embaixo
            name: "vehicle",
            label: "Veículo",
            type: "text",
            render: (v: any, _row: any) => {
              const brandModel = [v.brand, v.model].filter(Boolean).join(" ");

              return (
                <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="block hover:underline">
                  <div className="font-medium">
                    {brandModel || v.plate}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-wide">
                    {v.plate}
                  </div>
                </Link>
              )
            },
          },
          {
            name: "fuel_type",
            label: "Comb.",
            type: "badge",
            render: (value) => {
              const map: Record<string, { label: string; className: string }> = {
                diesel: { label: "Diesel", className: "bg-emerald-500 text-white" },
                gasolina: { label: "Gasolina", className: "bg-rose-600 text-white" },
                etanol: { label: "Etanol", className: "bg-lime-500 text-white" },
                flex: { label: "Flex", className: "bg-sky-500 text-white" },
                gnv: { label: "GNV", className: "bg-amber-500 text-white" },
                eletrico: { label: "Elétrico", className: "bg-indigo-500 text-white" },
              };
              const m = map[String(value)] ?? { label: String(value), className: "border" };
              return <Badge className={m.className}>{m.label}</Badge>;
            },
          },
          {
            // MONTANTE: Litros • R$/L + linha do Total
            name: "amounts",
            label: "Consumo",
            type: "text",
            render: (_v, row) => {
              return (
                <AmountsCell row={row} currency={currency} />
              )
            },
          },
          {
            // NOVO: Motorista (employee)
            name: "driver",
            label: "Motorista",
            type: "text",
            render: (_v, row) =>
              row?.driver ? (
                <Link
                  href={`/dashboard/people/employees/${row.driver.id}`}
                  className="hover:underline"
                >
                  {row.driver.name || "—"}
                </Link>
              ) : (
                "—"
              ),
          },
          {
            // NOVO: Fornecedor
            name: "supplier",
            label: "Fornecedor",
            type: "text",
            render: (_v, row) =>
              row?.supplier ? (
                <Link
                  href={`/dashboard/suppliers/${row.supplier.id}`}
                  className="hover:underline"
                >
                  {row.supplier.name || "—"}
                </Link>
              ) : (
                "—"
              ),
          },
          {
            name: "location",
            label: "Local",
            type: "text",
            render: (loc) => (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {loc || "-"}
              </span>
            ),
          },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/fleet/fuel/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/fleet/fuel/${row.id}/edit` },
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
        title="Excluir abastecimento"
        description={<>Essa ação não pode ser desfeita.</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
