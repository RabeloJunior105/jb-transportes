"use client";

import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
(pdfMake as any).vfs = (pdfFonts as any).vfs;

import { toast } from "sonner";

type BudgetItem = {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    billing_type?: "daily" | "hourly" | "fixed";
};

type Party = {
    id: string;
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
};

export type Budget = {
    id: string;
    client_id: string | null;
    supplier_id: string | null;
    valid_until: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    client?: Party;
    supplier?: Party;
    items: BudgetItem[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

export async function buildDocDefinition(budget: Budget) {
    const logoBase64 = await fetch("/jb_logo.png")
        .then((res) => res.blob())
        .then(
            (blob) =>
                new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                })
        );

    const party = budget?.client || budget?.supplier || null;
    const total = budget.items.reduce(
        (sum, it) => sum + it.quantity * it.unit_price,
        0
    );

    return {
        pageSize: "A4",
        pageMargins: [40, 160, 40, 60],
        header: {
            margin: [40, 20, 40, 0],
            stack: [
                {
                    columns: [
                        { image: logoBase64, width: 80 },
                        {
                            stack: [
                                { text: "JB TRANSPORTES", style: "companyName" },
                                { text: "CNPJ: 39.665.140/0001-14", style: "companyInfo" },
                                {
                                    text: "Rua Nova Britânia, 12 - São Paulo/SP - CEP 04814-000",
                                    style: "companyInfo",
                                },
                                {
                                    text:
                                        "Telefone: (11) 97541-6618 • contato@jbtransportesmunck.com.br",
                                    style: "companyInfo",
                                },
                                { text: "Orçamento Comercial", style: "headerTitle" },
                            ],
                            alignment: "right",
                        },
                    ],
                },
                {
                    canvas: [
                        {
                            type: "line",
                            x1: 0,
                            y1: 0,
                            x2: 515,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: "#ccc",
                        },
                    ],
                    margin: [0, 10, 0, 0],
                },
            ],
        },
        footer: (currentPage: number, pageCount: number) => ({
            margin: [40, 10, 40, 0],
            columns: [
                {
                    text: `Página ${currentPage} de ${pageCount}`,
                    alignment: "right",
                    style: "footer",
                },
            ],
        }),
        content: [
            {
                text: budget?.client ? "Dados do Cliente" : "Dados do Fornecedor",
                style: "section",
                margin: [0, 10, 0, 6],
            },
            {
                table: {
                    widths: ["30%", "*"],
                    body: [
                        [{ text: "Nome:", bold: true }, party?.name || "—"],
                        [{ text: "Documento:", bold: true }, party?.document || "—"],
                        [{ text: "Email:", bold: true }, party?.email || "—"],
                        [{ text: "Telefone:", bold: true }, party?.phone || "—"],
                        [
                            { text: "Endereço:", bold: true },
                            party?.address
                                ? `${party.address}, ${party.city ?? ""} ${party.state ?? ""} - ${party.zip_code ?? ""}`
                                : "—",
                        ],
                    ],
                },
                layout: {
                    fillColor: function (rowIndex: number) {
                        return rowIndex % 2 === 0 ? "#f9f9f9" : null; // zebra suave
                    },
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                    paddingLeft: () => 4,
                    paddingRight: () => 4,
                    paddingTop: () => 3,
                    paddingBottom: () => 3,
                },
                margin: [0, 0, 0, 20],
            },
            {
                text: "Itens do Orçamento",
                style: "section",
            },
            {
                table: {
                    widths: ["*", "auto", "auto", "auto", "auto"],
                    body: [
                        [
                            { text: "Descrição", style: "tableHeader" },
                            { text: "Tipo", style: "tableHeader" },
                            { text: "Qtd", style: "tableHeader" },
                            { text: "Preço Unit.", style: "tableHeader" },
                            { text: "Total", style: "tableHeader" },
                        ],
                        ...budget.items.map((item: any) => [
                            item.description,
                            item.billing_type === "daily"
                                ? "Diária"
                                : item.billing_type === "hourly"
                                    ? "Hora"
                                    : "Fixo",
                            item.quantity,
                            { text: formatCurrency(item.unit_price), alignment: "right" },
                            {
                                text: formatCurrency(item.quantity * item.unit_price),
                                alignment: "right",
                            },
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
            },
            {
                text: `Total Geral: ${formatCurrency(total)}`,
                style: "total",
            },
            budget?.notes
                ? { text: `Observações: ${budget?.notes}`, margin: [0, 20, 0, 0] }
                : {},
        ],
        styles: {
            companyName: { fontSize: 16, bold: true, color: "#a90037" },
            headerTitle: {
                fontSize: 13,
                italics: true,
                color: "#555",
                margin: [0, 8, 0, 0],
            },
            companyInfo: { fontSize: 9, color: "#444" },
            section: { fontSize: 12, bold: true, margin: [0, 15, 0, 10] },
            tableHeader: {
                bold: true,
                fillColor: "#a90037",
                color: "#fff",
                margin: [0, 5, 0, 5],
            },
            total: {
                fontSize: 14,
                bold: true,
                alignment: "right",
                margin: [0, 20, 0, 0],
            },
            footer: { fontSize: 9, color: "#666" },
        },
    };
}

export async function generateBudgetPdf(budget: Budget, open = true) {
    try {
        const docDefinition = await buildDocDefinition(budget);
        const pdf = pdfMake.createPdf(docDefinition);
        if (open) pdf.open();
        else pdf.download(`orcamento-${budget?.id}.pdf`);
    } catch (e) {
        console.error(e);
        toast.error("Erro ao gerar PDF.");
    }
}
