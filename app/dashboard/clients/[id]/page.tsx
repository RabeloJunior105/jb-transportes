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
    CalendarDays,
    Truck,
    FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { CLIENTS_TABLE, type Client } from "../config";

const currencyBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Tipos auxiliares

type ServiceRow = {
    id: string;
    service_code: string | null;
    collection_date: string | null;
    delivery_date: string | null;
    origin: string | null;
    destination: string | null;
    service_value: number | null;
    status: "pending" | "in_progress" | "completed" | "canceled";
};

type ReceivableRow = {
    id: string;
    description: string | null;
    amount: number | null;
    status: "pending" | "paid" | "overdue" | "cancelled" | "canceled";
    due_date: string | null;
    payment_date: string | null;
};

const receivableBadge = (status: ReceivableRow["status"]) => {
    const map: Record<string, { label: string; cls: string }> = {
        pending: { label: "Pendente", cls: "border" },
        overdue: { label: "Vencido", cls: "bg-destructive text-destructive-foreground" },
        paid: { label: "Pago", cls: "bg-green-600 text-white" },
        canceled: { label: "Cancelado", cls: "bg-muted text-foreground" },
        cancelled: { label: "Cancelado", cls: "bg-muted text-foreground" },
    };
    const it = map[status] ?? map["pending"];
    return <Badge className={it.cls}>{it.label}</Badge>;
};

export default function ClientDetailPage() {
    // Next 15/React 19: params pode ser Promise — unwrap usando React.use
    const rawParams = useParams();
    // @ts-ignore
    const params = typeof (rawParams as any)?.then === "function" ? (React as any).use(rawParams as any) : rawParams;
    const rawId = (Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id) as string | undefined;

    const sb = React.useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = React.useState(true);
    const [row, setRow] = React.useState<Client | null>(null);
    const [services, setServices] = React.useState<ServiceRow[]>([]);
    const [receivables, setReceivables] = React.useState<ReceivableRow[]>([]);

    React.useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID de cliente inválido.");
                    return;
                }

                // Cliente
                const { data, error, status } = await sb
                    .from(CLIENTS_TABLE)
                    .select("*")
                    .eq("id", rawId)
                    .maybeSingle();
                if (error && status !== 406) throw error;
                if (!data) {
                    setLoading(false);
                    toast.error("Cliente não encontrado ou sem permissão para visualizar.");
                    return;
                }
                setRow(data as Client);

                // Serviços recentes do cliente
                const { data: svcs, error: e1 } = await sb
                    .from("services")
                    .select(
                        "id, service_code, collection_date, delivery_date, origin, destination, service_value, status"
                    )
                    .eq("client_id", rawId)
                    .order("collection_date", { ascending: false })
                    .limit(10);
                if (e1) throw e1;
                setServices((svcs ?? []) as ServiceRow[]);

                // Contas a receber do cliente
                const { data: recs, error: e2 } = await sb
                    .from("accounts")
                    .select("id, description, amount, status, due_date, payment_date")
                    .eq("type", "receivable")
                    .eq("client_id", rawId)
                    .order("due_date", { ascending: true })
                    .limit(20);
                if (e2) throw e2;
                setReceivables((recs ?? []) as any);
            } catch (e) {
                console.error(e);
                toast.error("Não foi possível carregar o cliente.");
            } finally {
                setLoading(false);
            }
        })();
    }, [rawId, sb]);

    if (loading) return <div className="p-6">Carregando…</div>;
    if (!row) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Nada por aqui</h2>
                <p className="text-muted-foreground">Este cliente não existe ou você não tem permissão para vê-lo.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a lista
                    </Link>
                </Button>
            </div>
        );
    }

    const statusMap: Record<NonNullable<Client["status"]>, { label: string; cls: string }> = {
        active: { label: "Ativo", cls: "bg-green-600 text-white" },
        inactive: { label: "Inativo", cls: "bg-muted text-foreground" },
    };

    const address = [row.address, row.city, row.state, row.zip_code]
        .filter(Boolean)
        .join(", ");

    // KPIs do cliente (simples)
    const totalServicos = services.length;
    const receitaServicos = services.reduce(
        (s, r) => s + Number(r.service_value || 0),
        0
    );
    const openReceivables = receivables.filter(
        (r) => r.status === "pending" || r.status === "overdue"
    );
    const valueOpenReceivables = openReceivables.reduce(
        (s, r) => s + Number(r.amount || 0),
        0
    );
    const valueOverdue = receivables
        .filter((r) => r.status === "overdue")
        .reduce((s, r) => s + Number(r.amount || 0), 0);

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {row.name}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Cadastrado em {fmtDate(row.created_at)}
                            </span>
                            <Badge className={statusMap[row.status ?? "active"].cls}>
                                {statusMap[row.status ?? "active"].label}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                                {row.city || "—"}
                                {row.state ? `/${row.state}` : ""}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/clients">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/clients/${row.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPIs rápidos do cliente */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-l-4 border-l-primary/80">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Serviços</CardTitle>
                        <CardDescription>Total vinculados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{totalServicos}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Receita</CardTitle>
                        <CardDescription>Somatório de serviços</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {currencyBRL.format(receitaServicos)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-accent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">A receber</CardTitle>
                        <CardDescription>Aberto (pendente + vencido)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {currencyBRL.format(valueOpenReceivables)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-accent/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Vencido</CardTitle>
                        <CardDescription>Em atraso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {currencyBRL.format(valueOverdue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* esquerda */}
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações</CardTitle>
                            <CardDescription>Detalhes do cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-xs text-muted-foreground">Documento</div>
                                    <div className="font-medium">{row.document || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">E-mail</div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        <a
                                            className="hover:underline"
                                            href={row.email ? `mailto:${row.email}` : undefined}
                                        >
                                            {row.email || "—"}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Telefone</div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3" />
                                        <a
                                            className="hover:underline"
                                            href={row.phone ? `tel:${row.phone}` : undefined}
                                        >
                                            {row.phone || "—"}
                                        </a>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <div className="text-xs text-muted-foreground">Endereço</div>
                                    <div className="text-sm">{address || "—"}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Últimos serviços */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" /> Últimos serviços
                            </CardTitle>
                            <CardDescription>Vinculados a este cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Rota</TableHead>
                                            <TableHead>Coleta</TableHead>
                                            <TableHead>Entrega</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.length ? (
                                            services.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/dashboard/services/${s.id}`}
                                                            className="hover:underline font-medium"
                                                        >
                                                            {s.service_code || s.id.slice(0, 8)}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(s.origin || "—") + " → " + (s.destination || "—")}
                                                    </TableCell>
                                                    <TableCell>{fmtDate(s.collection_date)}</TableCell>
                                                    <TableCell>{fmtDate(s.delivery_date)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {currencyBRL.format(Number(s.service_value || 0))}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                    Sem serviços para este cliente.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Últimas contas a receber */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Últimas contas a receber
                            </CardTitle>
                            <CardDescription>Vinculadas a este cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Vencimento</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receivables.length ? (
                                            receivables.slice(0, 10).map((r) => (
                                                <TableRow key={r.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/dashboard/finance/receivable/${r.id}`}
                                                            className="hover:underline font-medium"
                                                        >
                                                            {r.description || "—"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{fmtDate(r.due_date)}</TableCell>
                                                    <TableCell>{receivableBadge(r.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {currencyBRL.format(Number(r.amount || 0))}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                    Sem lançamentos recentes.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* direita */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Criado em</span>
                                <span className="font-medium">{fmtDate(row.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Atualizado em</span>
                                <span className="font-medium">{fmtDate(row.updated_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Usuário</span>
                                <span className="font-medium break-all">{row.user_id}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span>
                                    <Badge className={row.status === "active" ? "bg-green-600 text-white" : "bg-muted"}>
                                        {row.status === "active" ? "Ativo" : "Inativo"}
                                    </Badge>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ações rápidas</CardTitle>
                            <CardDescription>Atalhos úteis</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/clients/${row.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar cliente
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/services/new?client_id=${row.id}`}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Novo serviço
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={`/dashboard/finance/receivable/new?client_id=${row.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Nova conta a receber
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
