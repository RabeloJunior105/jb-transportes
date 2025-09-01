"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Plus, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { RecordList } from "@/components/ListForm/record-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { CLIENTS_TABLE, type Client } from "./config";

// ---------- Helpers ----------
const statusBadge = (status?: Client["status"]) => {
  const map: Record<NonNullable<Client["status"]>, { label: string; cls: string }> = {
    active: { label: "Ativo", cls: "bg-green-600 text-white" },
    inactive: { label: "Inativo", cls: "bg-muted text-foreground" },
  };
  const it = map[(status ?? "active") as NonNullable<Client["status"]>];
  return <Badge className={it.cls}>{it.label}</Badge>;
};

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

// ---------- Summary ----------
async function getSummaryClients() {
  const sb = createBrowserClient();
  const { data, error } = await sb.from(CLIENTS_TABLE).select("status, state");
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length;
  const active = rows.filter((r: any) => r.status === "active").length;
  const inactive = rows.filter((r: any) => r.status === "inactive").length;
  const states = new Set(rows.map((r: any) => r.state).filter(Boolean)).size;

  return { total, active, inactive, states };
}

// ---------- Fetch (lista) ----------
export type ClientRow = Client;

const CLIENTS_SELECT = "id, name, document, email, phone, city, state, status, created_at";

const fetchClients = makeFetchDataClient<ClientRow>({
  table: CLIENTS_TABLE,
  select: CLIENTS_SELECT,
  defaultOrder: { column: "created_at", ascending: false },
  searchFields: ["name", "document", "email", "phone", "city", "state"],
  filterMap: { status: "status", state: "state" },
});

// ---------- Delete ----------
async function deleteClientClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from(CLIENTS_TABLE).delete().eq("id", id);
  if (error) throw error;
}

export default function ClientsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [target, setTarget] = React.useState<ClientRow | null>(null);

  const openDeleteModal = (row: ClientRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteClientClient(target.id);
      toast.success("Cliente excluído com sucesso");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao excluir cliente");
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
          <Users className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerencie os clientes da empresa</p>
          </div>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummaryClients}
        cards={[
          { title: "Total", icon: <Users />, valueKey: "total" },
          { title: "Ativos", icon: <CheckCircle />, valueKey: "active", colorClass: "text-green-600" },
          { title: "Inativos", icon: <XCircle />, valueKey: "inactive", colorClass: "text-muted-foreground" },
          { title: "UFs", icon: <Users />, valueKey: "states", colorClass: "text-chart-3" },
        ]}
      />

      {/* RecordList */}
      <RecordList<ClientRow>
        key={refreshKey}
        title="Lista de Clientes"
        description="Clientes cadastrados"
        itemsPerPage={10}
        fetchData={fetchClients}
        filters={[
          { name: "status", label: "Status", options: [{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }] },
          {
            name: "state", label: "UF", options: [
              { label: "SP", value: "SP" }, { label: "RJ", value: "RJ" }, { label: "MG", value: "MG" }, { label: "PR", value: "PR" }, { label: "RS", value: "RS" }, { label: "SC", value: "SC" },
            ]
          },
        ]}
        fields={[
          {
            name: "name",
            label: "Cliente",
            type: "text",
            render: (v, row) => (
              <Link href={`/dashboard/clients/${row.id}`} className="block hover:underline">
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.document}</div>
              </Link>
            ),
          },
          {
            name: "email",
            label: "Contato",
            type: "text",
            render: (_v, row) => (
              <div>
                <div className="text-sm">{row.email || "—"}</div>
                <div className="text-xs text-muted-foreground">{row.phone || "—"}</div>
              </div>
            ),
          },
          {
            name: "city",
            label: "Local",
            type: "text",
            render: (_v, row) => (
              <span>{row.city || "—"}{row.state ? `/${row.state}` : ""}</span>
            ),
          },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (val) => statusBadge(val as Client["status"]),
          },
          { name: "created_at", label: "Criado", type: "text", render: (v) => fmtDate(String(v)) },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/clients/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/clients/${row.id}/edit` },
          { label: "Excluir", icon: <Trash2 className="h-4 w-4" />, color: "destructive", onClick: (row) => openDeleteModal(row) },
        ]}
      />

      {/* Modal de confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={deleting}
        title="Excluir cliente"
        description={<>Tem certeza que deseja excluir este cliente?</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
