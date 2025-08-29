"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Banknote, Building2, CalendarDays, ArrowLeft, Pencil, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { RECV_TABLE } from "../config";

type ClientRef = { id: string; name: string | null } | null;
type ServiceRef = { id: string; service_code: string | null } | null;

type ReceivableRow = {
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

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const one = <T,>(v: any): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

export default function ReceivableViewPage() {
    const params = useParams();
    const rawId = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as string | undefined;

    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [row, setRow] = useState<ReceivableRow | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID inválido.");
                    return;
                }

                const { data, error, status } = await sb
                    .from(RECV_TABLE)
                    .select(`
            id, user_id, client_id, service_id,
            description, amount, due_date, payment_date, payment_method, status,
            created_at, updated_at,
            client:clients ( id, name ),
            service:services ( id, service_code )
          `)
                    .eq("id", rawId)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    setLoading(false);
                    toast.error("Conta não encontrada ou sem permissão.");
                    return;
                }

                setRow({
                    ...(data as any),
                    client: one<ClientRef>((data as any).client),
                    service: one<ServiceRef>((data as any).service),
                });
            } catch (e) {
                console.log(e);
                toast.error("Não foi possível carregar a conta.");
            } finally {
                setLoading(false);
            }
        })();
    }, [rawId, sb]);

    if (loading) return null;
    if (!row) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Nada por aqui</h2>
                <p className="text-muted-foreground">Esta conta não existe ou você não tem permissão para vê-la.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard/finance/receivable">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a lista
                    </Link>
                </Button>
            </div>
        );
    }

    const statusMap: Record<ReceivableRow["status"], { label: string; cls: string }> = {
        pending: { label: "Pendente", cls: "border" },
        overdue: { label: "Vencido", cls: "bg-destructive text-destructive-foreground" },
        paid: { label: "Recebido", cls: "bg-green-600 text-white" },
        canceled: { label: "Cancelado", cls: "bg-muted text-foreground" },
    };

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Banknote className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {row.description}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {`Vencimento: ${fmtDate(row.due_date)}${row.payment_date ? ` • Pagamento: ${fmtDate(row.payment_date)}` : ""}`}
                            </span>
                            <Badge className={statusMap[row.status]?.cls || "border"}>
                                {statusMap[row.status]?.label || row.status}
                            </Badge>
                        </div>
                        {row.service && (
                            <div className="text-sm text-muted-foreground mt-1">
                                Serviço:{" "}
                                <Link href={`/dashboard/services/${(row.service as any).id}`} className="hover:underline">
                                    {(row.service as any).service_code || "—"}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/finance/receivable">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/finance/receivable/${row.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* esquerda */}
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo</CardTitle>
                            <CardDescription>Detalhes financeiros</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Valor</div>
                                    <div className="text-lg font-semibold">{currencyBRL.format(Number(row.amount ?? 0))}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Forma de Pagamento</div>
                                    <div className="text-sm">{row.payment_method || "—"}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="text-xs text-muted-foreground">Cliente</div>
                                    {row.client ? (
                                        <Link href={`/dashboard/clients/${(row.client as any).id}`} className="hover:underline font-medium">
                                            {(row.client as any).name || "—"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {row.service && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Serviço Vinculado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/dashboard/services/${(row.service as any).id}`} className="hover:underline font-medium">
                                    {(row.service as any).service_code || "—"}
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* direita */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Vencimento</span><span className="font-medium">{fmtDate(row.due_date)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span className="font-medium">{fmtDate(row.payment_date)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span className="font-medium">{fmtDate(row.created_at)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Atualizado em</span><span className="font-medium">{fmtDate(row.updated_at)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Usuário</span><span className="font-medium break-all">{row.user_id}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
