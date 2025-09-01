"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Wallet,
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

// ---------- Helpers ----------
type SupplierRef = { id: string; name: string | null } | null;

export type PayableRow = {
  id: string;
  user_id: string;

  supplier_id: string | null;
  description: string;
  category:
  | "maintenance"
  | "fuel"
  | "toll"
  | "parts"
  | "services"
  | "taxes"
  | "insurance"
  | "rent"
  | "other";

  amount: number;

  due_date: string; // ISO
  payment_date: string | null; // ISO

  payment_method: "pix" | "transfer" | "boleto" | "card" | "cash" | "other" | null;
  status: "pending" | "paid" | "overdue" | "canceled";

  created_at: string;
  updated_at: string;

  supplier: SupplierRef | SupplierRef[] | null;
};

const PAYABLE_SELECT = `
  id, user_id, supplier_id, description, category, amount, due_date, payment_date, payment_method, status, created_at, updated_at,
  supplier:suppliers ( id, name )
`;

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

const currencyBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const onlyDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const one = <T,>(v: any): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);

// ---------- Summary (reforçado) ----------
async function getSummaryPayables() {
  const sb = createBrowserClient();
  const { data, error } = await sb
    .from("accounts_payable")
    .select("status, amount, due_date, payment_date");
  if (error) throw error;

  const rows = (data ?? []).map((r: any) => ({
    status: r.status as "pending" | "paid" | "overdue" | "canceled",
    amount: Number(r.amount ?? 0),
    due_date: r.due_date ? new Date(r.due_date) : null,
    payment_date: r.payment_date ? new Date(r.payment_date) : null,
  }));

  const today = onlyDate(new Date());
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const paidRows = rows.filter((r) => r.status === "paid");
  const pendingRows = rows.filter((r) => r.status === "pending");

  const overdueRows = rows.filter((r) => {
    if (r.status === "paid" || r.status === "canceled") return false;
    return r.due_date ? onlyDate(r.due_date) < today : false;
  });

  const dueTodayRows = rows.filter((r) => {
    if (r.status === "paid" || r.status === "canceled") return false;
    return r.due_date ? onlyDate(r.due_date).getTime() === today.getTime() : false;
  });

  const next7Rows = rows.filter((r) => {
    if (r.status === "paid" || r.status === "canceled") return false;
    if (!r.due_date) return false;
    const d = onlyDate(r.due_date);
    return d >= today && d <= in7;
  });

  const paidValue = paidRows.reduce((s, r) => s + r.amount, 0);
  const pendingValue = pendingRows.reduce((s, r) => s + r.amount, 0);
  const overdueValue = overdueRows.reduce((s, r) => s + r.amount, 0);
  const openValue = pendingValue + overdueValue;
  const dueTodayValue = dueTodayRows.reduce((s, r) => s + r.amount, 0);
  const next7Value = next7Rows.reduce((s, r) => s + r.amount, 0);

  const mtdPaidValue = paidRows
    .filter(
      (r) =>
        r.payment_date &&
        r.payment_date >= monthStart &&
        r.payment_date <= new Date()
    )
    .reduce((s, r) => s + r.amount, 0);

  const paidWithDelay = paidRows.filter((r) => r.payment_date && r.due_date);
  const avgDelayDays = paidWithDelay.length
    ? Math.round(
      paidWithDelay
        .map((r) => {
          const ms =
            onlyDate(r.payment_date!).getTime() -
            onlyDate(r.due_date!).getTime();
          const days = Math.floor(ms / (24 * 3600 * 1000));
          return Math.max(0, days);
        })
        .reduce((a, b) => a + b, 0) / paidWithDelay.length
    )
    : 0;

  return {
    openValue,
    overdueValue,
    pendingValue,
    mtdPaidValue,
    dueTodayValue,
    next7Value,

    openPayables: pendingRows.length + overdueRows.length,
    overduePayables: overdueRows.length,
    dueTodayPayables: dueTodayRows.length,
    next7Payables: next7Rows.length,

    avgDelayDays,
  };
}

// ---------- Fetch (lista) ----------
const fetchPayables = makeFetchDataClient<PayableRow>({
  table: "accounts_payable",
  select: PAYABLE_SELECT,
  defaultOrder: { column: "due_date", ascending: true },
  searchFields: ["description", "category"],
  filterMap: {
    status: "status",
    category: "category",
  },
});

// ---------- Mutations rápidas ----------
async function markAsPaid(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb
    .from("accounts_payable")
    .update({ status: "paid", payment_date: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

async function cancelPayable(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb
    .from("accounts_payable")
    .update({ status: "canceled", payment_date: null })
    .eq("id", id);
  if (error) throw error;
}

// ---------- Delete ----------
async function deletePayableClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("accounts_payable").delete().eq("id", id);
  if (error) throw error;
}

const statusBadge = (status: PayableRow["status"]) => {
  const map: Record<PayableRow["status"], { label: string; cls: string }> = {
    pending: { label: "Pendente", cls: "border" },
    overdue: { label: "Vencido", cls: "bg-destructive text-destructive-foreground" },
    paid: { label: "Pago", cls: "bg-green-600 text-white" },
    canceled: { label: "Cancelado", cls: "bg-muted text-foreground" },
  };
  const it = map[status] ?? { label: String(status), cls: "border" };
  return <Badge className={it.cls}>{it.label}</Badge>;
};

// ---------- Page ----------
export default function PayablesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<PayableRow | null>(null);

  const openDeleteModal = (row: PayableRow) => {
    setTarget(row);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deletePayableClient(target.id);
      toast.success(`Conta a pagar excluída com sucesso`);
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

  const doMarkAsPaid = async (row: PayableRow) => {
    try {
      if (row.status === "paid") {
        toast.message("Esta conta já está paga.");
        return;
      }
      await markAsPaid(row.id);
      toast.success("Marcada como paga!");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível marcar como paga.");
    }
  };

  const doCancel = async (row: PayableRow) => {
    try {
      if (row.status === "canceled") {
        toast.message("Esta conta já está cancelada.");
        return;
      }
      await cancelPayable(row.id);
      toast.success("Conta cancelada!");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível cancelar a conta.");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-7 w-7" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground">Controle os compromissos financeiros</p>
          </div>
        </div>
        <Link href="/dashboard/finance/payable/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <SummaryCards
        fetchData={getSummaryPayables}
        cards={[
          { title: "Em Aberto (R$)", icon: <Wallet />, valueKey: "openValue", colorClass: "text-chart-1", format: (v: any) => currencyBRL.format(Number(v || 0)) },
          { title: "Vencidos (R$)", icon: <AlertTriangle />, valueKey: "overdueValue", colorClass: "text-destructive", format: (v: any) => currencyBRL.format(Number(v || 0)) },
          { title: "Pendentes (R$)", icon: <Wallet />, valueKey: "pendingValue", colorClass: "text-chart-2", format: (v: any) => currencyBRL.format(Number(v || 0)) },
          { title: "Pagos no Mês (R$)", icon: <CheckCircle />, valueKey: "mtdPaidValue", colorClass: "text-chart-3", format: (v: any) => currencyBRL.format(Number(v || 0)) },
        ]}
      />

      {/* RecordList */}
      <RecordList<PayableRow>
        key={refreshKey}
        title="Lista de Contas"
        description="Contas a pagar cadastradas"
        itemsPerPage={10}
        fetchData={fetchPayables}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Pendente", value: "pending" },
              { label: "Vencido", value: "overdue" },
              { label: "Pago", value: "paid" },
              { label: "Cancelado", value: "canceled" },
            ],
          },
          {
            name: "category",
            label: "Categoria",
            options: [
              { label: "Manutenção", value: "maintenance" },
              { label: "Combustível", value: "fuel" },
              { label: "Pedágio", value: "toll" },
              { label: "Peças", value: "parts" },
              { label: "Serviços", value: "services" },
              { label: "Impostos", value: "taxes" },
              { label: "Seguro", value: "insurance" },
              { label: "Aluguel", value: "rent" },
              { label: "Outros", value: "other" },
            ],
          },
        ]}
        fields={[
          {
            name: "description",
            label: "Descrição",
            type: "text",
            render: (v, row) => (
              <Link href={`/dashboard/finance/payable/${row.id}`} className="block hover:underline">
                <div className="font-medium">{v}</div>
                <div className="text-xs text-muted-foreground">{row.category}</div>
              </Link>
            ),
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
            name: "due_date",
            label: "Vencimento",
            type: "text",
            render: (v) => fmtDate(String(v)),
          },
          {
            name: "amount",
            label: "Valor",
            type: "text",
            render: (v) => <span className="font-medium">{currencyBRL.format(Number(v ?? 0))}</span>,
          },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (val) => statusBadge(val),
          },
        ]}
        actions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4" />,
            href: (row) => `/dashboard/finance/payable/${row.id}`,
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4" />,
            href: (row) => `/dashboard/finance/payable/${row.id}/edit`,
            disabled: (row) => row.status === "canceled",
          },
          {
            label: "Pagar",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: (row) => doMarkAsPaid(row),
            visible: (row) => row.status !== "paid" && row.status !== "canceled",
          },
          {
            label: "Cancelar",
            icon: <XCircle className="h-4 w-4" />,
            color: "destructive",
            onClick: (row) => doCancel(row),
            visible: (row) => row.status !== "canceled",
            disabled: (row) => row.status === "paid",
          },
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
        title="Excluir conta"
        description={<>Tem certeza que deseja excluir esta conta a pagar?</>}
        confirmText="Excluir"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
