"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Plus, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecordList } from "@/components/ListForm/record-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";

import { Budget } from "./config";

const BUDGET_SELECT = `
  id, client_id, supplier_id, valid_until, status, total_value, created_at,
  clients ( id, name, document ),
  suppliers ( id, name, document )
`;

const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

const currencyBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const fetchBudgets = makeFetchDataClient<Budget>({
    table: "budgets",
    select: BUDGET_SELECT,
    defaultOrder: { column: "created_at", ascending: false },
    searchFields: ["notes"],
    filterMap: {
        status: "status",
    },
});

// ---------- Delete ----------
async function deleteBudget(id: string) {
    const sb = createBrowserClient();
    const { error } = await sb.from("budgets").delete().eq("id", id);
    if (error) throw error;
}

const statusBadge = (status: Budget["status"]) => {
    const map: Record<Budget["status"], { label: string; cls: string }> = {
        draft: { label: "Rascunho", cls: "border" },
        sent: { label: "Enviado", cls: "bg-blue-500 text-white" },
        accepted: { label: "Aceito", cls: "bg-green-600 text-white" },
        refused: { label: "Recusado", cls: "bg-red-600 text-white" },
        expired: { label: "Expirado", cls: "bg-muted text-foreground" },
    };
    const it = map[status] ?? { label: String(status), cls: "border" };
    return <Badge className={it.cls}>{it.label}</Badge>;
};

// ---------- Page ----------
export default function BudgetsPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [target, setTarget] = useState<Budget | null>(null);

    const openDeleteModal = (row: Budget) => {
        setTarget(row);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!target) return;
        setDeleting(true);
        try {
            await deleteBudget(target.id);
            toast.success(`Orçamento excluído com sucesso`);
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

    return (
        <div className="flex-1 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Orçamentos
                        </h1>
                        <p className="text-muted-foreground">
                            Gerencie os orçamentos emitidos e recebidos
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/finance/budgets/new">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Orçamento
                    </Button>
                </Link>
            </div>

            <RecordList<Budget>
                key={refreshKey}
                title="Lista de Orçamentos"
                description="Orçamentos cadastrados"
                itemsPerPage={10}
                fetchData={fetchBudgets}
                filters={[
                    {
                        name: "status",
                        label: "Status",
                        options: [
                            { label: "Rascunho", value: "draft" },
                            { label: "Enviado", value: "sent" },
                            { label: "Aceito", value: "accepted" },
                            { label: "Recusado", value: "refused" },
                            { label: "Expirado", value: "expired" },
                        ],
                    },
                ]}
                fields={[
                    {
                        name: "clients",
                        label: "Destinatário",
                        type: "text",
                        render: (_: any, row: any) => {
                            if (row.clients) {
                                return (
                                    <div>
                                        <Link href={`/dashboard/clients/${row.clients.id}`}>
                                            <p className="font-medium hover:underline">{row.clients.name}</p>
                                        </Link>
                                        <p className="text-xs text-muted-foreground">Cliente</p>
                                    </div>
                                );
                            }
                            if (row.suppliers) {
                                return (
                                    <div>
                                        <Link href={`/dashboard/suppliers/${row.suppliers.id}`}>
                                            <p className="font-medium hover:underline">{row.suppliers.name}</p>
                                        </Link>
                                        <p className="text-xs text-muted-foreground">Fornecedor</p>
                                    </div>
                                );
                            } 
                            return "—";
                        },
                    },
                    {
                        name: "created_at",
                        label: "Criado em",
                        type: "text",
                        render: (v) => fmtDate(String(v)),
                    },
                    {
                        name: "valid_until",
                        label: "Validade",
                        type: "text",
                        render: (v) => fmtDate(String(v)),
                    },
                    {
                        name: "total_value",
                        label: "Total",
                        type: "text",
                        render: (v) => (
                            <span className="font-semibold text-foreground">
                                {currencyBRL.format(Number(v ?? 0))}
                            </span>
                        ),
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
                        href: (row) => `/dashboard/finance/budgets/${row.id}`,
                    },
                    {
                        label: "Editar",
                        icon: <Edit className="h-4 w-4" />,
                        href: (row) => `/dashboard/finance/budgets/${row.id}/edit`,
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
                title="Excluir Orçamento"
                description={<>Tem certeza que deseja excluir este orçamento?</>}
                confirmText="Excluir"
                cancelText="Cancelar"
                destructive
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
