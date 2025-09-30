import { z } from "zod";

export const BUDGET_TABLE = "budgets" as const;
export const BUDGET_ITEM_TABLE = "budget_items" as const;

/** ---------- Form Config (com placeholders) ---------- */
export const budgetFormConfig = {
    title: "Orçamento",
    description: "Gerencie orçamentos para clientes e fornecedores",
    groups: [
        {
            title: "Dados do Orçamento",
            description: "Informações principais",
            fields: [
                {
                    name: "client_id",
                    label: "Cliente",
                    type: "remote-select",
                    placeholder: "Selecione o cliente",
                    remote: {
                        table: "clients",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document", "email"],
                        pageSize: 10,
                    },
                },
                {
                    name: "supplier_id",
                    label: "Fornecedor",
                    type: "remote-select",
                    placeholder: "Selecione o fornecedor",
                    remote: {
                        table: "suppliers",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document", "email"],
                        pageSize: 10,
                    },
                },
                {
                    name: "valid_until",
                    label: "Validade",
                    type: "date" as const,
                    required: true,
                    placeholder: "AAAA-MM-DD",
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    placeholder: "Selecione o status",
                    options: [
                        { label: "Rascunho", value: "draft" },
                        { label: "Enviado", value: "sent" },
                        { label: "Aceito", value: "accepted" },
                        { label: "Recusado", value: "refused" },
                        { label: "Expirado", value: "expired" },
                    ],
                },
            ],
        },
        {
            title: "Observações",
            description: "Condições ou anotações adicionais",
            fields: [
                {
                    name: "notes",
                    label: "Observações",
                    type: "textarea" as const,
                    placeholder: "Ex.: prazo de entrega, condições de pagamento...",
                },
            ],
        },
    ],
} as const;

/** ---------- Schema (Zod) ---------- */
const statusEnum = z.enum(
    ["draft", "sent", "accepted", "refused", "expired"],
    { errorMap: () => ({ message: "Selecione um status válido" }) }
);

export const budgetSchema = z.object({
    id: z.string().optional(),
    client_id: z.string().uuid({ message: "client_id deve ser UUID" }).optional().nullable(),
    supplier_id: z.string().uuid({ message: "supplier_id deve ser UUID" }).optional().nullable(),
    valid_until: z.coerce.date({ message: "Data de validade inválida" }),
    status: statusEnum.default("draft"),
    notes: z.string().optional(),
    total_value: z.coerce.number().optional(),
    pdf_url: z.string().optional(),
    created_at: z.string().optional(),
});

export const budgetItemSchema = z.object({
    id: z.string().optional(),
    budget_id: z.string().uuid(),
    description: z.string().min(1, "Descrição obrigatória"),
    quantity: z.coerce.number().min(1, "Quantidade mínima é 1"),
    unit_price: z.coerce.number().min(0, "Valor inválido"),
    total: z.coerce.number().optional(),
});

/** ---------- Types ---------- */
export type BudgetForm = z.infer<typeof budgetSchema>;
export type BudgetItemForm = z.infer<typeof budgetItemSchema>;

export interface Budget {
    id: string;
    client_id: string | null;
    supplier_id: string | null;
    valid_until: string;
    status: "draft" | "sent" | "accepted" | "refused" | "expired";
    notes: string | null;
    total_value: number;
    pdf_url: string | null;
    created_at: string;
}

export interface BudgetItem {
    id: string;
    budget_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export type CreateBudget = Omit<Budget, "id" | "created_at" | "total_value" | "pdf_url">;
export type UpdateBudget = Partial<Omit<Budget, "id" | "created_at">>;
