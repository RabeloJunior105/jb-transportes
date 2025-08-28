"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Fuel as FuelIcon,
    Truck,
    User2,
    Building2,
    Gauge,
    Calendar,
    MapPin,
    Pencil,
    ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

/** ===== Types ===== */
type VehicleRef = { id: string; plate: string; brand?: string | null; model?: string | null } | null;
type PersonRef = { id: string; name: string | null } | null;

type FuelRow = {
    id: string;
    user_id: string;
    vehicle_id: string | null;
    driver_id: string | null;
    supplier_id: string | null;

    fuel_type: "diesel" | "gasolina" | "etanol" | "flex" | "gnv" | "eletrico";
    liters: number;
    price_per_liter: number;
    total_cost: number | null;
    mileage: number | null;
    fuel_date: string; // ISO
    location: string | null;

    created_at: string;
    updated_at: string;

    vehicle?: VehicleRef;
    driver?: PersonRef;     // employees
    supplier?: PersonRef;   // suppliers
};

/** ===== Utils ===== */
const currencyBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function one<T>(v: any): T | null {
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

function VehicleTitle({ v }: { v: VehicleRef }) {
    if (!v) return <span>—</span>;
    const title = [v.brand, v.model].filter(Boolean).join(" ") || v.plate;
    return (
        <Link href={`/dashboard/fleet/vehicles/${v.id}`} className="hover:underline">
            <div className="font-medium">{title}</div>
            <div className="text-xs text-muted-foreground tracking-wide">{v.plate}</div>
        </Link>
    );
}

/** ===== Page ===== */
export default function FuelViewPage() {
    const params = useParams();
    const router = useRouter();
    const rawId = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as
        | string
        | undefined;

    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [fuel, setFuel] = useState<FuelRow | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID de abastecimento inválido.");
                    return;
                }
                const id = rawId;

                // opcional: diagnóstico de auth
                const { data: authData } = await sb.auth.getUser();
                const uid = authData?.user?.id;

                // Busca do fuel com relacionamentos (embeds)
                // OBS: se seus FKs tiverem nomes específicos, você pode trocar por:
                // vehicle:vehicles!fuel_vehicle_id_fkey (...), driver:employees!fuel_driver_id_fkey (...), supplier:suppliers!fuel_supplier_id_fkey (...)
                const { data, error, status } = await sb
                    .from("fuel")
                    .select(
                        `
            id, user_id, vehicle_id, driver_id, supplier_id,
            fuel_type, liters, price_per_liter, total_cost, mileage, fuel_date, location,
            created_at, updated_at,
            vehicle:vehicles ( id, plate, brand, model ),
            driver:employees ( id, name ),
            supplier:suppliers ( id, name )
          `
                    )
                    .eq("id", id)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    setLoading(false);
                    toast.error(
                        uid
                            ? "Abastecimento não encontrado ou sem permissão para visualizar."
                            : "Você não está autenticado."
                    );
                    return;
                }

                // normaliza embeds caso venham como arrays
                const row: FuelRow = {
                    ...(data as any),
                    vehicle: one<VehicleRef>((data as any).vehicle),
                    driver: one<PersonRef>((data as any).driver),
                    supplier: one<PersonRef>((data as any).supplier),
                };

                setFuel(row);
            } catch (e) {
                console.error(e);
                toast.error("Não foi possível carregar o abastecimento.");
            } finally {
                setLoading(false);
            }
        })();
    }, [rawId, sb]);

    if (loading) return null;

    if (!fuel) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-2">Nada por aqui</h2>
                <p className="text-muted-foreground">
                    Este abastecimento não existe, não pertence ao seu workspace ou você não tem permissão para vê-lo.
                </p>
                <div className="mt-4 flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/fleet/fuel">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para a lista
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const liters = Number(fuel.liters ?? 0);
    const ppl = Number(fuel.price_per_liter ?? 0);
    const total = Number(fuel.total_cost ?? liters * ppl);

    const headerTitle =
        fuel.vehicle ? [fuel.vehicle?.brand, fuel.vehicle?.model].filter(Boolean).join(" ") || fuel.vehicle?.plate : "Abastecimento";
    const fuelTypeBadge = (
        <Badge variant="secondary" className="uppercase">
            {fuel.fuel_type}
        </Badge>
    );

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FuelIcon className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {headerTitle}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {fmtDate(fuel.fuel_date)}
                            </span>
                            {fuelTypeBadge}
                            {fuel.location && (
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    {fuel.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/fleet/fuel">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/fleet/fuel/${fuel.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* ESQUERDA (2/3) */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Quadro: Valores */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo do abastecimento</CardTitle>
                            <CardDescription>Detalhes financeiros e operacionais</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Litros</div>
                                    <div className="text-lg font-semibold">
                                        {liters.toLocaleString("pt-BR")} L
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Preço por litro</div>
                                    <div className="text-lg font-semibold">
                                        {currencyBRL.format(ppl)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                    <div className="text-lg font-semibold">
                                        {currencyBRL.format(total)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Odômetro</div>
                                    <div className="text-lg font-semibold">
                                        {fuel.mileage != null ? fuel.mileage : "—"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quadro: Veículo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Veículo
                            </CardTitle>
                            <CardDescription>Informações do veículo vinculado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fuel.vehicle ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Veículo</div>
                                        <VehicleTitle v={fuel.vehicle} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">ID do veículo</div>
                                        <div className="text-sm">{fuel.vehicle_id}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Sem veículo associado.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quadro: Motorista e Fornecedor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Participantes</CardTitle>
                            <CardDescription>Quem conduziu e quem forneceu</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User2 className="h-4 w-4" />
                                        Motorista
                                    </div>
                                    {fuel.driver ? (
                                        <Link
                                            href={`/dashboard/people/employees/${fuel.driver.id}`}
                                            className="hover:underline font-medium"
                                        >
                                            {fuel.driver.name || "—"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                    <div className="text-xs text-muted-foreground break-all">
                                        ID: {fuel.driver_id ?? "—"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        Fornecedor
                                    </div>
                                    {fuel.supplier ? (
                                        <Link
                                            href={`/dashboard/suppliers/${fuel.supplier.id}`}
                                            className="hover:underline font-medium"
                                        >
                                            {fuel.supplier.name || "—"}
                                        </Link>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">—</div>
                                    )}
                                    <div className="text-xs text-muted-foreground break-all">
                                        ID: {fuel.supplier_id ?? "—"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* DIREITA (1/3) */}
                <div className="space-y-6">
                    {/* Metadados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Data do abastecimento</span>
                                <span className="font-medium">{fmtDate(fuel.fuel_date)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Criado em</span>
                                <span className="font-medium">{fmtDate(fuel.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Atualizado em</span>
                                <span className="font-medium">{fmtDate(fuel.updated_at)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Usuário</span>
                                <span className="font-medium break-all">{fuel.user_id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ações rápidas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações</CardTitle>
                            <CardDescription>Atalhos úteis</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button asChild variant="secondary">
                                <Link href={`/dashboard/fleet/fuel/${fuel.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar abastecimento
                                </Link>
                            </Button>
                            {fuel.vehicle && (
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/fleet/vehicles/${fuel.vehicle.id}`}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Ver veículo
                                    </Link>
                                </Button>
                            )}
                            {fuel.driver && (
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/people/employees/${fuel.driver.id}`}>
                                        <User2 className="mr-2 h-4 w-4" />
                                        Ver motorista
                                    </Link>
                                </Button>
                            )}
                            {fuel.supplier && (
                                <Button asChild variant="outline">
                                    <Link href={`/dashboard/suppliers/${fuel.supplier.id}`}>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Ver fornecedor
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
