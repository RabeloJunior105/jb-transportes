"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Banknote,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";
import { RECV_TABLE } from "./config";

type ClientRef = { id: string; name: string | null } | null;
type ServiceRef = { id: string; service_code: string | null } | null;

export type ReceivableRow = {
  id: string;
  user_id: string;
  client_id: string;
  service_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  payment_method: "pix" | "transfer" | "boleto" | "card" | "cash" | "other" | null;
  status: "pending" | "paid" | "overdue" | "canceled";
  created_at: string;
  updated_at: string;
  client?: ClientRef | ClientRef[] | null;
  service?: ServiceRef | ServiceRef[] | null;
};

const RECEIVABLE_SELECT = `
  id, user_id, client_id, service_id, description, amount, due_date, payment_date, payment_method, status, created_at, updated_at,
  client:clients ( id, name ),
  service:services ( id, service_code )
`;

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const onlyDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const one = <T,>(v: any): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

// ---------- Summary ----------
async function getSummaryReceivables() {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from(RECV_TABLE)
    .select("status, amount, due_date, payment_date");
  if (error) throw error;

  const rows = (data ?? []).map((r: any) => ({
    status: r.status as "pending" | "paid" | "overdue" | "canceled",
    amount: Number(r.amount ?? 0),
    due_date: r.due_date ? new Date(r.due_date) : null,
    payment_date: r.payment_date ? new Date(r.payment_date) : null,
  }));

  const today = onlyDate(new Date());
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const paidRows = rows.filter(r => r.status === "paid");
  const pendingRows = rows.filter(r => r.status === "pending");

  const overdueRows = rows.filter(r => {
    if (r.status === "paid" || r.status === "canceled") return false;
    return r.due_date ? onlyDate(r.due_date) < today : false;
  });

  const dueTodayRows = rows.filter(r => {
    if (r.status === "paid" || r.status === "canceled") return false;
    return r.due_date ? onlyDate(r.due_date).getTime() === today.getTime() : false;
  });

  const next7Rows = rows.filter(r => {
    if (r.status === "paid" || r.status === "canceled") return false;
    if (!r.due_date) return false;
    const d = onlyDate(r.due_date);
    return d >= today && d <= in7;
  });

  const receivedValue = paidRows.reduce((s, r) => s + r.amount, 0);
  const pendingValue = pendingRows.reduce((s, r) => s + r.amount, 0);
  const overdueValue = overdueRows.reduce((s, r) => s + r.amount, 0);
  const openValue = pendingValue + overdueValue;
  const dueTodayValue = dueTodayRows.reduce((s, r) => s + r.amount, 0);
  const next7Value = next7Rows.reduce((s, r) => s + r.amount, 0);
  const mtdReceivedValue = paidRows
    .filter(r => r.payment_date && r.payment_date >= monthStart && r.payment_date <= new Date())
    .reduce((s, r) => s + r.amount, 0);

  return {
    openValue,
    overdueValue,
    pendingValue,
    receivedValue,
    mtdReceivedValue,
    dueTodayValue,
    next7Value,

    openReceivables: pendingRows.length + overdueRows.length,
    overdueReceivables: overdueRows.length,
    dueTodayReceivables: dueTodayRows.length,
    next7Receivables: next7Rows.length,
  };
}

// ---------- Fetch (lista) ----------
const fetchReceivables = makeFetchDataClient<ReceivableRow>({
  table: RECV_TABLE,
  select: RECEIVABLE_SELECT,
  defaultOrder: { column: "due_date", ascending: true },
  searchFields: ["description"],
  filterMap: { status: "status" },
});

// ---------- Mutations rápidas ----------
async function markAsPaid(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb
    .from(RECV_TABLE)
    .update({ status: "paid", payment_date: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

async function cancelReceivable(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb
    .from(RECV_TABLE)
    .update({ status: "canceled", payment_date: null })
    .eq("id", id);
  if (error) throw error;
}

const statusBadge = (status: ReceivableRow["status"]) => {
  const map: Record<ReceivableRow["status"], { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "border" },
    overdue: { label: "Vencido", cls: "bg-destructive text-destructive-foreground" },
    paid: { label: "Recebido", cls: "bg-green-600 text-white" },
    canceled: { label: "Cancelado", cls: "bg-muted text-foreground" },
  };
  const it = map[status] ?? { label: String(status), cls: "border" };
  return <Badge className={it.cls}>{it.label}</Badge>;
};

// ---------- Page ----------
export default function ReceivablesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<ReceivableRow | null>(null);

  const openDeleteModal = (row: ReceivableRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.from(RECV_TABLE).delete().eq("id", target.id);
      if (error) throw error;
      toast.success("Conta a receber excluída com sucesso");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao excluir registro");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setTarget(null);
    }
  };

  const doMarkAsPaid = async (row: ReceivableRow) => {
    try {
      if (row.status === "paid") {
        toast.message("Esta conta já está marcada como recebida.");
        return;
      }
      await markAsPaid(row.id);
      toast.success("Marcada como recebida!");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.log(e);
      toast.error("Não foi possível marcar como recebida.");
    }
  };

  const doCancel = async (row: ReceivableRow) => {
    try {
      if (row.status === "canceled") {
        toast.message("Esta conta já está cancelada.");
        return;
      }
      await cancelReceivable(row.id);
      toast.success("Conta cancelada!");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.log(e);
      toast.error("Não foi possível cancelar a conta.");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Banknote className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
            <p className="text-muted-foreground">Acompanhe as entradas previstas</p>
          </div>
        </div>
        <Link href="/dashboard/finance/receivable/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummaryReceivables}
        cards={[
          { title: "Em Aberto (R$)", icon: <Banknote />, valueKey: "openValue", colorClass: "text-chart-1", format: (v) => currencyBRL.format(Number(v || 0)) },
          { title: "Vencidos (R$)", icon: <AlertTriangle />, valueKey: "overdueValue", colorClass: "text-destructive", format: (v) => currencyBRL.format(Number(v || 0)) },
          { title: "Pendentes (R$)", icon: <Banknote />, valueKey: "pendingValue", colorClass: "text-chart-2", format: (v) => currencyBRL.format(Number(v || 0)) },
          { title: "Recebidos no Mês (R$)", icon: <CheckCircle />, valueKey: "mtdReceivedValue", colorClass: "text-chart-3", format: (v) => currencyBRL.format(Number(v || 0)) },
          /* { title: "Vencendo Hoje (R$)", icon: <CalendarDays />, valueKey: "dueTodayValue", colorClass: "text-foreground", format: (v) => currencyBRL.format(Number(v || 0)) },
          { title: "Próx. 7 dias (R$)", icon: <CalendarDays />, valueKey: "next7Value", colorClass: "text-foreground", format: (v) => currencyBRL.format(Number(v || 0)) }, */
        ]}
      />

      {/* RecordList */}
      <RecordList<ReceivableRow>
        key={refreshKey}
        title="Lista de Recebíveis"
        description="Contas a receber cadastradas"
        itemsPerPage={10}
        fetchData={fetchReceivables}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Pendente", value: "pending" },
              { label: "Vencido", value: "overdue" },
              { label: "Recebido", value: "paid" },
              { label: "Cancelado", value: "canceled" },
            ],
          },
        ]}
        fields={[
          {
            name: "description",
            label: "Descrição",
            type: "text",
            render: (v, row) => (
              <Link href={`/dashboard/finance/receivable/${row.id}`} className="block hover:underline">
                <div className="font-medium">{v}</div>
                <div className="text-xs text-muted-foreground">
                  Serviço: {one<ServiceRef>(row.service)?.service_code || "—"}
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
          { name: "due_date", label: "Vencimento", type: "text", render: (v) => fmtDate(String(v)) },
          { name: "amount", label: "Valor", type: "text", render: (v) => <span className="font-medium">{currencyBRL.format(Number(v ?? 0))}</span> },
          { name: "status", label: "Status", type: "badge", render: (val) => statusBadge(val) },
        ]}
        actions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4" />,
            href: (row) => `/dashboard/finance/receivable/${row.id}`,
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4" />,
            href: (row) => `/dashboard/finance/receivable/${row.id}/edit`,
            // opcional: não editar se cancelado
            disabled: (row) => row.status === "canceled",
          },
          {
            label: "Receber",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: (row) => doMarkAsPaid(row),
            // mostra só quando NÃO está pago nem cancelado
            visible: (row) => row.status !== "paid" && row.status !== "canceled",
          },
          {
            label: "Cancelar",
            icon: <XCircle className="h-4 w-4" />,
            color: "destructive",
            onClick: (row) => doCancel(row),
            // esconde se já cancelado
            visible: (row) => row.status !== "canceled",
            // opcional: não deixar cancelar se já pago
            disabled: (row) => row.status === "paid",
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4" />,
            color: "destructive",
            onClick: (row) => openDeleteModal(row),
            // opcional: permitir excluir só se não pago
            // visible: (row) => row.status !== "paid",
          },
        ]}
      />

      {/* Modal de confirmação */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={deleting}
        title="Excluir conta"
        description={<>Tem certeza que deseja excluir esta conta a receber?</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
