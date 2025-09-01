"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, Plus, Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";

import type { Supplier } from "./config";

const SUPPLIER_SELECT = `
  id, user_id, name, document, email, phone, address, city, state, zip_code, status, created_at, updated_at
`;

const statusBadge = (status: Supplier["status"]) => {
  const map: Record<Supplier["status"], { label: string; cls: string }> = {
    active: { label: "Ativo", cls: "bg-green-600 text-white" },
    inactive: { label: "Inativo", cls: "bg-muted text-foreground" },
  };
  const it = map[status] ?? { label: String(status), cls: "border" } as any;
  return <Badge className={it.cls}>{it.label}</Badge>;
};

async function getSummarySuppliers() {
  const sb = createBrowserClient();
  const { data, error } = await sb.from("suppliers").select("status, state");
  if (error) throw error;
  const total = data?.length ?? 0;
  const active = data?.filter((d) => d.status === "active").length ?? 0;
  const inactive = total - active;
  const states = new Set((data ?? []).map((d: any) => d.state).filter(Boolean)).size;
  return { total, active, inactive, states };
}

const fetchSuppliers = makeFetchDataClient<Supplier>({
  table: "suppliers",
  select: SUPPLIER_SELECT,
  defaultOrder: { column: "created_at", ascending: false },
  searchFields: ["name", "document", "email", "phone", "city"],
  filterMap: {
    status: "status",
    state: "state",
  },
});

async function deleteSupplierClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}

export default function SuppliersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<Supplier | null>(null);

  const openDeleteModal = (row: Supplier) => { setTarget(row); setConfirmOpen(true); };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteSupplierClient(target.id);
      toast.success("Fornecedor excluído com sucesso");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir fornecedor");
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
          <Building2 className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie os fornecedores da empresa</p>
          </div>
        </div>
        <Link href="/dashboard/suppliers/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummarySuppliers}
        cards={[
          { title: "Total", valueKey: "total", icon: <Building2 />, colorClass: "text-primary" },
          { title: "Ativos", valueKey: "active", icon: <Building2 />, colorClass: "text-chart-1" },
          { title: "Inativos", valueKey: "inactive", icon: <Building2 />, colorClass: "text-destructive" },
          { title: "Estados", valueKey: "states", icon: <Building2 />, colorClass: "text-chart-3" },
        ]}
      />

      {/* Lista */}
      <RecordList<Supplier>
        key={refreshKey}
        title="Lista de Fornecedores"
        description="Fornecedores cadastrados"
        itemsPerPage={10}
        fetchData={fetchSuppliers}
        filters={[
          { name: "status", label: "Status", options: [{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }] },
          {
            name: "state", label: "UF", options: [
              { label: "SP", value: "SP" }, { label: "RJ", value: "RJ" }, { label: "MG", value: "MG" }, { label: "PR", value: "PR" }, { label: "RS", value: "RS" }, { label: "SC", value: "SC" }, { label: "BA", value: "BA" }, { label: "PE", value: "PE" }, { label: "CE", value: "CE" }, { label: "DF", value: "DF" },
            ]
          },
        ]}
        fields={[
          {
            name: "name", label: "Nome", type: "text", render: (v, row) => (
              <Link href={`/dashboard/suppliers/${row.id}`} className="hover:underline">{v}</Link>
            )
          },
          { name: "document", label: "Documento", type: "text" },
          { name: "city", label: "Cidade", type: "text", render: (v, row) => (<>{row.city ?? "—"}{row.state ? `/${row.state}` : ""}</>) },
          { name: "email", label: "E-mail", type: "text" },
          { name: "phone", label: "Telefone", type: "text" },
          { name: "status", label: "Status", type: "badge", render: (val) => statusBadge(val) },
        ]}
        actions={[
          { label: "Ver", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/suppliers/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/suppliers/${row.id}/edit` },
          { label: "Excluir", icon: <Trash2 className="h-4 w-4" />, color: "destructive", onClick: (row) => openDeleteModal(row) },
        ]}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={deleting}
        title="Excluir fornecedor"
        description={<>Tem certeza que deseja excluir este fornecedor?</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
