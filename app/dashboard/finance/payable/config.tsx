import { z } from "zod";

export const PAYABLE_TABLE = "accounts_payable" as const; // ajuste aqui se o nome no DB for diferente

/** ---------- Form Config (com placeholders) ---------- */
export const payableFormConfig = {
    title: "Conta a Pagar",
    description: "Registre e gerencie despesas a pagar",
    groups: [
        {
            title: "Dados da Despesa",
            description: "Informações principais",
            fields: [
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
                        userScoped: true,
                        pageSize: 10,
                    },
                },
                {
                    name: "description",
                    label: "Descrição",
                    type: "textarea" as const,
                    required: true,
                    placeholder: "Ex.: Revisão preventiva do veículo, compra de peças...",
                },
                {
                    name: "category",
                    label: "Categoria",
                    type: "select" as const,
                    required: true,
                    placeholder: "Selecione a categoria",
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
                {
                    name: "amount",
                    label: "Valor (R$)",
                    type: "number" as const,
                    required: true,
                    placeholder: "0,00",
                },
            ],
        },
        {
            title: "Vencimento / Pagamento",
            description: "Datas e método de pagamento",
            fields: [
                {
                    name: "due_date",
                    label: "Data de Vencimento",
                    type: "date" as const,
                    required: true,
                    placeholder: "AAAA-MM-DD",
                },
                {
                    name: "payment_date",
                    label: "Data de Pagamento",
                    type: "date" as const,
                    placeholder: "AAAA-MM-DD (opcional)",
                },
                {
                    name: "payment_method",
                    label: "Forma de Pagamento",
                    type: "select" as const,
                    placeholder: "Selecione a forma de pagamento",
                    options: [
                        { label: "PIX", value: "pix" },
                        { label: "Transferência", value: "transfer" },
                        { label: "Boleto", value: "boleto" },
                        { label: "Cartão", value: "card" },
                        { label: "Dinheiro", value: "cash" },
                        { label: "Outro", value: "other" },
                    ],
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    placeholder: "Selecione o status",
                    options: [
                        { label: "Pendente", value: "pending" },
                        { label: "Pago", value: "paid" },
                        { label: "Vencido", value: "overdue" },
                        { label: "Cancelado", value: "canceled" },
                    ],
                },
            ],
        },
    ],
} as const;

/** ---------- Schema (Zod) ---------- */
const categoryEnum = z.enum(
    ["maintenance", "fuel", "toll", "parts", "services", "taxes", "insurance", "rent", "other"],
    { errorMap: () => ({ message: "Selecione uma categoria válida" }) }
);

const methodEnum = z.enum(
    ["pix", "transfer", "boleto", "card", "cash", "other"],
    { errorMap: () => ({ message: "Selecione uma forma de pagamento válida" }) }
);

const statusEnum = z.enum(
    ["pending", "paid", "overdue", "canceled"],
    { errorMap: () => ({ message: "Selecione um status válido" }) }
);

export const payableSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),

    supplier_id: z.string().uuid({ message: "supplier_id deve ser UUID" }).optional(), // pode ser null
    description: z.string().min(1, "Descrição obrigatória"),
    category: categoryEnum,

    amount: z.coerce.number().min(0, "Valor inválido"),

    due_date: z.coerce.date({ message: "Data de vencimento inválida" }),
    payment_date: z.coerce.date().optional(),

    payment_method: methodEnum.optional(),
    status: statusEnum.default("pending"),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type PayableForm = z.infer<typeof payableSchema>;

/** ---------- Type Hints ---------- */
export const payableTypeHints = {
    supplier_id: "uuid" as const,
    amount: "number" as const,
    due_date: "date" as const,
    payment_date: "date" as const,
    created_at: "date" as const,
    updated_at: "date" as const,
};

/** ---------- Types ---------- */
export interface Payable {
    id: string;
    user_id: string;

    supplier_id: string | null;
    description: string;
    category: "maintenance" | "fuel" | "toll" | "parts" | "services" | "taxes" | "insurance" | "rent" | "other";

    amount: number;

    due_date: string;            // ISO
    payment_date: string | null; // ISO

    payment_method: "pix" | "transfer" | "boleto" | "card" | "cash" | "other" | null;
    status: "pending" | "paid" | "overdue" | "canceled";

    created_at: string;
    updated_at: string;
}

export interface CreatePayable {
    supplier_id?: string | null;
    description: string;
    category: Payable["category"];

    amount: number;

    due_date: string;            // ISO
    payment_date?: string | null;

    payment_method?: Payable["payment_method"];
    status?: Payable["status"];
    user_id?: string
}

export type UpdatePayable = Partial<
    Omit<Payable, "id" | "user_id" | "created_at" | "updated_at">
>;
