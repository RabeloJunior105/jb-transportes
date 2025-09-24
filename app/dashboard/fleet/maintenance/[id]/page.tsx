"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
    Wrench,
    Truck,
    Building2,
    Calendar,
    ArrowLeft,
    Pencil,
    FileDown,
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

import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
(pdfMake as any).vfs = pdfFonts.vfs;

type VehicleRef =
    | { id: string; plate: string; brand?: string | null; model?: string | null }
    | null;
type SupplierRef = { id: string; name: string | null } | null;

type MaintenanceRow = {
    id: string;
    user_id: string;
    vehicle_id: string | null;
    supplier_id: string | null;

    maintenance_type: "preventive" | "corrective" | "inspection";
    description: string | null;
    cost: number;
    maintenance_date: string; // ISO
    next_maintenance_date: string | null; // ISO
    mileage: number | null;

    status: "pending" | "in_progress" | "completed" | "canceled";

    created_at: string;
    updated_at: string;

    vehicle?: VehicleRef | VehicleRef[] | null;
    supplier?: SupplierRef | SupplierRef[] | null;
};

const currencyBRL = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function one<T>(v: any): T | null {
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

function generateMaintenanceReport(row: MaintenanceRow) {
    const v = row.vehicle as VehicleRef | null;
    const s = row.supplier as SupplierRef | null;

    // Exemplo: base64 da logo (troque pelo seu real)
    /* const logoBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." */

    const primaryColor = "#a90037"; // COR DO SISTEMA

    const isList =
        row.description &&
        (row.description.includes(",") || row.description.includes("\n"));

    let descriptionContent: any = row.description
        ? isList
            ? {
                table: {
                    widths: ["*"],
                    body: [
                        [{ text: "Itens Substituídos", style: "tableHeader" }],
                        ...row.description
                            .split(/,|\n/)
                            .map((item) => [{ text: item.trim(), style: "tableCell" }])
                            .filter((item) => item[0].text !== ""),
                    ],
                },
                layout: {
                    fillColor: (rowIndex: number) =>
                        rowIndex % 2 === 0 ? "#f9f9f9" : null,
                    hLineColor: "#ccc",
                    vLineColor: "#ccc",
                },
                margin: [0, 5, 0, 10],
            }
            : { text: row.description, margin: [0, 5, 0, 10] }
        : { text: "—", italics: true };

    const docDefinition: any = {
        pageSize: "A4",
        pageMargins: [40, 80, 40, 60],

        header: {
            margin: [40, 20, 40, 0],
            columns: [
                /* {
                    image: logoBase64,
                    width: 40,
                }, */
                {
                    text: "JB Transportes",
                    style: "companyName",
                    margin: [10, 8, 0, 0],
                },
                {
                    text: "Relatório de Manutenção",
                    style: "headerTitle",
                    alignment: "right",
                },
            ],
        },

        footer: function (currentPage: number, pageCount: number) {
            return {
                margin: [40, 10, 40, 0],
                columns: [
                    {
                        text: `Emitido em ${new Date().toLocaleDateString("pt-BR")} por ${row.user_id
                            }`,
                        style: "footer",
                    },
                    {
                        text: `Página ${currentPage} de ${pageCount}`,
                        alignment: "right",
                        style: "footer",
                    },
                ],
            };
        },

        content: [
            { text: "Informações do Veículo", style: "section" },
            {
                table: {
                    widths: ["30%", "70%"],
                    body: [
                        ["Placa", v?.plate || "—"],
                        ["Modelo", `${v?.brand || ""} ${v?.model || ""}`.trim() || "—"],
                        ["Quilometragem", row.mileage || "—"],
                    ],
                },
                layout: "lightHorizontalLines",
            },
            "\n",

            { text: "Detalhes da Manutenção", style: "section" },
            {
                table: {
                    widths: ["40%", "60%"],
                    body: [
                        ["Tipo", row.maintenance_type],
                        ["Status", row.status],
                        ["Data", fmtDate(row.maintenance_date)],
                        ["Próxima", fmtDate(row.next_maintenance_date)],
                        ["Custo", currencyBRL.format(Number(row.cost ?? 0))],
                    ],
                },
                layout: "lightHorizontalLines",
            },
            "\n",

            { text: "Descrição / Itens", style: "section" },
            descriptionContent,
            "\n",

            { text: "Fornecedor", style: "section" },
            {
                table: {
                    widths: ["100%"],
                    body: [[s?.name || "—"]],
                },
                layout: "lightHorizontalLines",
            },
        ],

        styles: {
            companyName: { fontSize: 16, bold: true, color: primaryColor },
            headerTitle: { fontSize: 14, bold: true, color: primaryColor },
            section: {
                fontSize: 13,
                bold: true,
                margin: [0, 15, 0, 5],
                color: primaryColor,
            },
            tableHeader: {
                bold: true,
                fillColor: primaryColor,
                color: "#fff",
                margin: [0, 5, 0, 5],
            },
            tableCell: { margin: [0, 5, 0, 5] },
            footer: { fontSize: 9, italics: true, color: "#666" },
        },
    };

    pdfMake.createPdf(docDefinition).open();
}




export default function MaintenanceViewPage() {
    const params = useParams();
    const rawId = (
        Array.isArray((params as any).id)
            ? (params as any).id[0]
            : (params as any).id
    ) as string | undefined;

    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [row, setRow] = useState<MaintenanceRow | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!rawId || !UUID_RE.test(rawId)) {
                    setLoading(false);
                    toast.error("ID de manutenção inválido.");
                    return;
                }
                const id = rawId;

                const { data, error, status } = await sb
                    .from("maintenance")
                    .select(
                        `
            id, user_id, vehicle_id, supplier_id,
            maintenance_type, description, cost,
            maintenance_date, next_maintenance_date,
            mileage, status,
            created_at, updated_at,
            vehicle:vehicles ( id, plate, brand, model ),
            supplier:suppliers ( id, name )
          `
                    )
                    .eq("id", id)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    setLoading(false);
                    toast.error(
                        "Manutenção não encontrada ou sem permissão para visualizar."
                    );
                    return;
                }

                setRow({
                    ...(data as any),
                    vehicle: one<VehicleRef>((data as any).vehicle),
                    supplier: one<SupplierRef>((data as any).supplier),
                });
            } catch (e) {
                console.log(e);
                toast.error("Não foi possível carregar a manutenção.");
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
                <p className="text-muted-foreground">
                    Esta manutenção não existe ou você não tem permissão para vê-la.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard/fleet/maintenance">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a lista
                    </Link>
                </Button>
            </div>
        );
    }

    const statusMap: Record<
        MaintenanceRow["status"],
        { label: string; cls: string }
    > = {
        pending: { label: "Pendente", cls: "border" },
        in_progress: { label: "Em andamento", cls: "bg-blue-500 text-white" },
        completed: { label: "Concluída", cls: "bg-green-600 text-white" },
        canceled: {
            label: "Cancelada",
            cls: "bg-destructive text-destructive-foreground",
        },
    };

    const typeMap: Record<
        MaintenanceRow["maintenance_type"],
        { label: string; cls: string }
    > = {
        preventive: { label: "Preventiva", cls: "bg-sky-500 text-white" },
        corrective: { label: "Corretiva", cls: "bg-amber-500 text-white" },
        inspection: { label: "Inspeção", cls: "bg-emerald-500 text-white" },
    };

    const v = one<VehicleRef>(row.vehicle);

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                            {v
                                ? [v.brand, v.model].filter(Boolean).join(" ") || v.plate
                                : "Manutenção"}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-1 items-center">
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {fmtDate(row.maintenance_date)}
                            </span>
                            <Badge className={typeMap[row.maintenance_type]?.cls || "border"}>
                                {typeMap[row.maintenance_type]?.label || row.maintenance_type}
                            </Badge>
                            <Badge className={statusMap[row.status]?.cls || "border"}>
                                {statusMap[row.status]?.label || row.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/fleet/maintenance">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/fleet/maintenance/${row.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => generateMaintenanceReport(row)}
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
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
                            <CardDescription>Detalhes principais da manutenção</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-muted-foreground">Custo</div>
                                    <div className="text-lg font-semibold">
                                        {currencyBRL.format(Number(row.cost ?? 0))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Odômetro</div>
                                    <div className="text-lg font-semibold">
                                        {row.mileage ?? "—"}
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
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Veículo
                            </CardTitle>
                            <CardDescription>Informações do veículo vinculado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {v ? (
                                <Link
                                    href={`/dashboard/fleet/vehicles/${v.id}`}
                                    className="block hover:underline"
                                >
                                    <div className="font-medium">
                                        {[v.brand, v.model].filter(Boolean).join(" ") || v.plate}
                                    </div>
                                    <div className="text-xs text-muted-foreground tracking-wide">
                                        {v.plate}
                                    </div>
                                </Link>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Sem veículo associado.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fornecedor</CardTitle>
                            <CardDescription>Origem do serviço</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {row.supplier ? (
                                <Link
                                    href={`/dashboard/suppliers/${(row.supplier as SupplierRef)!.id}`}
                                    className="hover:underline font-medium"
                                >
                                    {(row.supplier as SupplierRef)!.name || "—"}
                                </Link>
                            ) : (
                                <div className="text-sm text-muted-foreground">—</div>
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
                                <span className="text-muted-foreground">Data da manutenção</span>
                                <span className="font-medium">
                                    {fmtDate(row.maintenance_date)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Próxima manutenção
                                </span>
                                <span className="font-medium">
                                    {fmtDate(row.next_maintenance_date)}
                                </span>
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
                                {row.supplier && (
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/dashboard/suppliers/${(row.supplier as SupplierRef)!.id}`}
                                        >
                                            <Building2 className="mr-2 h-4 w-4" />
                                            Ver fornecedor
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
