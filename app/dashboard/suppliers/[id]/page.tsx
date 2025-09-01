"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    ArrowLeft,
    Pencil,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { SUPPLIERS_TABLE, type Supplier } from "../config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

const statusBadge = (status?: Supplier["status"]) => {
    const map: Record<NonNullable<Supplier["status"]>, { label: string; cls: string }> = {
        active: { label: "Ativo", cls: "bg-green-600 text-white" },
        inactive: { label: "Inativo", cls: "bg-muted text-foreground" },
    };
    const it = map[(status ?? "active") as NonNullable<Supplier["status"]>];
    return <Badge className={it.cls}>{it.label}</Badge>;
};

// Payable types (parciais) — evitamos importar tudo pra não acoplar
type PayableRow = {
    id: string;
    description: string | null;
    amount: number | null;
    status: "pending" | "paid" | "overdue" | "canceled";
    due_date: string | null;
    payment_date: string | null;
    created_at?: string;
};

const payableStatusBadge = (status: PayableRow["status"]) => {
    const map: Record<PayableRow["status"], { label: string; cls: string }> = {
        pending: { label: "Pendente", cls: "border" },
        overdue: { label: "Vencido", cls: "bg-destructive text-destructive-foreground" },
        paid: { label: "Pago", cls: "bg-green-600 text-white" },
        canceled: { label: "Cancelado", cls: "bg-muted text-foreground" },
    };
    const it = map[status];
    return <Badge className={it.cls}>{it.label}</Badge>;
};


export default function SupplierDetailPage() {
    const rawParams = useParams();
    const params = (typeof (rawParams as any)?.then === "function" ? (React as any).use(rawParams as any) : rawParams) as any;
    const rawId = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string | undefined;

    const sb = React.useMemo(() => createBrowserClient(), []);

    const [loading, setLoading] = React.useState(true);
    const [supplier, setSupplier] = React.useState<Supplier | null>(null);
    const [recent, setRecent] = React.useState<PayableRow[]>([]);
    const [summary, setSummary] = React.useState<{
        total: number;
        openCount: number;
        openValue: number;
        overdueCount: number;
        overdueValue: number;
        paidMTDValue: number;
    }>({ total: 0, openCount: 0, openValue: 0, overdueCount: 0, overdueValue: 0, paidMTDValue: 0 });

    React.useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID de fornecedor inválido.");
                    return;
                }

                // 1) Supplier
                const { data: sup, error: e1, status: s1 } = await sb
                    .from(SUPPLIERS_TABLE)
                    .select("*")
                    .eq("id", rawId)
                    .maybeSingle();
                if (e1 && s1 !== 406) throw e1;
                if (!sup) {
                    setLoading(false);
                    toast.error("Fornecedor não encontrado ou sem permissão para visualizar.");
                    return;
                }
                setSupplier(sup as Supplier);

                // 2) Payables do fornecedor (para resumo)
                const { data: pays, error: e2 } = await sb
                    .from("accounts_payable")
                    .select("id, description, amount, status, due_date, payment_date, created_at")
                    .eq("supplier_id", rawId);
                if (e2) throw e2;

                const rows: PayableRow[] = (pays ?? []).map((r: any) => ({
                    id: r.id,
                    description: r.description,
                    amount: Number(r.amount ?? 0),
                    status: r.status,
                    due_date: r.due_date,
                    payment_date: r.payment_date,
                    created_at: r.created_at,
                }));

                // KPIs
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

                const open = rows.filter((r) => r.status === "pending" || r.status === "overdue");
                const paid = rows.filter((r) => r.status === "paid");

                const overdueCalc = rows.filter((r) => {
                    if (r.status === "paid" || r.status === "canceled") return false;
                    const d = r.due_date ? new Date(r.due_date) : null;
                    return d ? d < today : false;
                });

                const openValue = open.reduce((s, r) => s + Number(r.amount || 0), 0);
                const overdueValue = overdueCalc.reduce((s, r) => s + Number(r.amount || 0), 0);
                const paidMTDValue = paid
                    .filter((r) => r.payment_date && new Date(r.payment_date) >= monthStart && new Date(r.payment_date) <= today)
                    .reduce((s, r) => s + Number(r.amount || 0), 0);

                setSummary({
                    total: rows.length,
                    openCount: open.length,
                    openValue,
                    overdueCount: overdueCalc.length,
                    overdueValue,
                    paidMTDValue,
                });

                // 3) Recentes (5 últimos)
                const recent5 = [...rows]
                    .sort((a, b) => new Date(b.created_at || b.due_date || "1970").getTime() - new Date(a.created_at || a.due_date || "1970").getTime())
                    .slice(0, 5);
                setRecent(recent5);
            } catch (e) {
                console.error(e);
                toast.error("Não foi possível carregar o fornecedor.");
            } finally {
                setLoading(false);
            }
        })();
    }, [rawId, sb]);

    if (loading) return <div className="p-6">Carregando…</div>;
    if (!supplier) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Nada por aqui</h2>
                <p className="text-muted-foreground">Este fornecedor não existe ou você não tem permissão para vê-lo.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard/suppliers">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a lista
                    </Link>
                </Button>
            </div>
        );
    }

    const addressStr = [supplier.address, supplier.city, supplier.state, supplier.zip_code].filter(Boolean).join(", ");
    const mapsHref = addressStr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}` : undefined;

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">{supplier.name}</h1>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Cadastrado em {fmtDate(supplier.created_at)}
                            </span>
                            {statusBadge(supplier.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{supplier.city || "—"}{supplier.state ? `/${supplier.state}` : ""}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/suppliers">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Lançamentos</CardTitle>
                        <CardDescription>Contas a pagar vinculadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><Wallet className="h-4 w-4" /> Em aberto</CardTitle>
                        <CardDescription>Valor total</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{currencyBRL.format(summary.openValue)}</div>
                        <div className="text-xs text-muted-foreground">{summary.openCount} conta(s)</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Vencidos</CardTitle>
                        <CardDescription>Em atraso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{currencyBRL.format(summary.overdueValue)}</div>
                        <div className="text-xs text-muted-foreground">{summary.overdueCount} conta(s)</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Pagos no mês</CardTitle>
                        <CardDescription>MTD</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-accent">{currencyBRL.format(summary.paidMTDValue)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Coluna esquerda (info) */}
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações</CardTitle>
                            <CardDescription>Detalhes do fornecedor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">Documento</div>
                                    <div className="font-medium">{supplier.document || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">E-mail</div>
                                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><a className="hover:underline" href={supplier.email ? `mailto:${supplier.email}` : undefined}>{supplier.email || "—"}</a></div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Telefone</div>
                                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><a className="hover:underline" href={supplier.phone ? `tel:${supplier.phone}` : undefined}>{supplier.phone || "—"}</a></div>
                                </div>
                                <div className="md:col-span-3">
                                    <div className="text-xs text-muted-foreground">Endereço</div>
                                    {addressStr ? (
                                        <a className="text-sm hover:underline" href={mapsHref} target="_blank" rel="noreferrer">
                                            {addressStr}
                                        </a>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Últimas contas a pagar</CardTitle>
                            <CardDescription>Vinculadas a este fornecedor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recent.length ? recent.map((r) => (
                                            <TableRow key={r.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/finance/payable/${r.id}`} className="hover:underline font-medium">
                                                        {r.description || "—"}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right">{currencyBRL.format(Number(r.amount || 0))}</TableCell>
                                                <TableCell>{payableStatusBadge(r.status)}</TableCell>
                                                <TableCell>{fmtDate(r.due_date)}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">Sem lançamentos recentes.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna direita (metadados e atalhos) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span className="font-medium">{fmtDate(supplier.created_at)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Atualizado em</span><span className="font-medium">{fmtDate(supplier.updated_at)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Usuário</span><span className="font-medium break-all">{supplier.user_id}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{statusBadge(supplier.status)}</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Atalhos</CardTitle>
                            <CardDescription>Ações rápidas</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar fornecedor
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/finance/payable/new?supplier_id=${encodeURIComponent(supplier.id)}`}>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Nova conta a pagar
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
