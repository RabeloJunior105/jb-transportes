"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Truck, User2, Building2, MapPin, CalendarDays, ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type ClientRef = { id: string; name: string | null } | null;
type VehicleRef = { id: string; plate: string; brand?: string | null; model?: string | null } | null;
type DriverRef = { id: string; name: string | null } | null;

type ServiceRow = {
    id: string;
    user_id: string;

    service_code: string;

    client_id: string | null;
    vehicle_id: string | null;
    driver_id: string | null;

    collection_date: string; // ISO
    delivery_date: string | null; // ISO

    origin: string | null;
    destination: string | null;
    description: string | null;

    service_value: number;
    toll_cost: number;
    fuel_cost: number;
    other_costs: number;

    status: "pending" | "in_progress" | "completed" | "canceled";

    created_at: string;
    updated_at: string;

    client?: ClientRef | ClientRef[] | null;
    vehicle?: VehicleRef | VehicleRef[] | null;
    driver?: DriverRef | DriverRef[] | null;
};

const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const one = <T,>(v: any): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null));

export default function ServiceViewPage() {
    const params = useParams();
    const rawId = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as string | undefined;

    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [row, setRow] = useState<ServiceRow | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID de serviço inválido.");
                    return;
                }

                const { data, error, status } = await sb
                    .from("services")
                    .select(`
            id, user_id, service_code,
            client_id, vehicle_id, driver_id,
            collection_date, delivery_date,
            origin, destination, description,
            service_value, toll_cost, fuel_cost, other_costs,
            status, created_at, updated_at,
            client:clients ( id, name ),
            vehicle:vehicles ( id, plate, brand, model ),
            driver:employees ( id, name )
          `)
                    .eq("id", rawId)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    setLoading(false);
                    toast.error("Serviço não encontrado ou sem permissão para visualizar.");
                    return;
                }

                setRow({
                    ...(data as any),
                    client: one<ClientRef>((data as any).client),
                    vehicle: one<VehicleRef>((data as any).vehicle),
                    driver: one<DriverRef>((data as any).driver),
                });
            } catch (e) {
                console.log(e);
                toast.error("Não foi possível carregar o serviço.");
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
                <p className="text-muted-foreground">Este serviço não existe ou você não tem permissão para vê-lo.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard/services">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a lista
                    </Link>
                </Button>
            </div>
        );
    }

    const statusMap: Record<ServiceRow["status"], { label: string; cls: string }> = {
        pending: { label: "Pendente", cls: "border" },
        in_progress: { label: "Em andamento", cls: "bg-blue-500 text-white" },
        completed: { label: "Concluído", cls: "bg-green-600 text-white" },
        canceled: { label: "Cancelado", cls: "bg-destructive text-destructive-foreground" },
    };

    const v = one<VehicleRef>(row.vehicle);
    const c = one<ClientRef>(row.client);
    const d = one<DriverRef>(row.driver);

    const custos = {
        total: Number(row.toll_cost ?? 0) + Number(row.fuel_cost ?? 0) + Number(row.other_costs ?? 0),
        pedagio: Number(row.toll_cost ?? 0),
        combustivel: Number(row.fuel_cost ?? 0),
        outros: Number(row.other_costs ?? 0),
    };

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Truck className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {row.service_code}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {`Coleta: ${fmtDate(row.collection_date)}${row.delivery_date ? ` • Entrega: ${fmtDate(row.delivery_date)}` : ""}`}
                            </span>
                            <Badge className={statusMap[row.status]?.cls || "border"}>
                                {statusMap[row.status]?.label || row.status}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{row.origin || "—"} <span className="opacity-60">→</span> {row.destination || "—"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/services">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/services/${row.id}/edit`}>
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
                            <CardDescription>Detalhes do serviço</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Valor do Serviço</div>
                                    <div className="text-lg font-semibold">{currencyBRL.format(Number(row.service_value ?? 0))}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Custos</div>
                                    <div className="text-lg font-semibold">{currencyBRL.format(custos.total)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Pedágio {currencyBRL.format(custos.pedagio)} • Comb. {currencyBRL.format(custos.combustivel)} • Outros {currencyBRL.format(custos.outros)}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="text-xs text-muted-foreground">Descrição</div>
                                    <div className="text-sm">{row.description || "—"}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Participantes</CardTitle>
                            <CardDescription>Cliente e Motorista</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        Cliente
                                    </div>
                                    {c ? (
                                        <Link href={`/dashboard/clients/${c.id}`} className="hover:underline font-medium">
                                            {c.name || "—"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User2 className="h-4 w-4" />
                                        Motorista
                                    </div>
                                    {d ? (
                                        <Link href={`/dashboard/people/employees/${d.id}`} className="hover:underline font-medium">
                                            {d.name || "—"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Veículo
                            </CardTitle>
                            <CardDescription>Informações do veículo vinculado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {v ? (
                                <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="block hover:underline">
                                    <div className="font-medium">
                                        {[v.brand, v.model].filter(Boolean).join(" ") || v.plate}
                                    </div>
                                    <div className="text-xs text-muted-foreground tracking-wide">{v.plate}</div>
                                </Link>
                            ) : (
                                <div className="text-sm text-muted-foreground">Sem veículo associado.</div>
                            )}
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
                                <span className="text-muted-foreground">Coleta</span>
                                <span className="font-medium">{fmtDate(row.collection_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Entrega</span>
                                <span className="font-medium">{fmtDate(row.delivery_date)}</span>
                            </div>
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
                        </CardContent>
                    </Card>

                    {v && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Atalhos</CardTitle>
                                <CardDescription>Ações rápidas</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/fleet/vehicles/${v.id}`}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Ver veículo
                                    </Link>
                                </Button>
                                {c && (
                                    <Button asChild variant="outline">
                                        <Link href={`/dashboard/clients/${c.id}`}>
                                            <Building2 className="mr-2 h-4 w-4" />
                                            Ver cliente
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
