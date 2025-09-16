import { z } from "zod";

export const RECV_TABLE = "accounts_receivable" as const; // ajuste aqui se necessário

// ---------- Form Config (com placeholders) ----------
export const receivableFormConfig = {
    title: "Conta a Receber",
    description: "Registre e gerencie receitas a receber",
    groups: [
        {
            title: "Identificação (Sistema)",
            description: "Campos controlados pela aplicação",
            hidden: false,
            fields: [
                { name: "id", label: "ID", type: "hidden" as const, hidden: false, placeholder: "—" },
                { name: "user_id", label: "User ID", type: "hidden" as const, hidden: false, placeholder: "—" },
                { name: "created_at", label: "Criado em", type: "date" as const, hidden: false, placeholder: "AAAA-MM-DD" },
                { name: "updated_at", label: "Atualizado em", type: "date" as const, hidden: false, placeholder: "AAAA-MM-DD" },
            ],
        },
        {
            title: "Vínculos",
            description: "Relacionamentos com outros registros",
            fields: [
                {
                    name: "client_id",
                    label: "Cliente",
                    type: "remote-select",
                    required: true,
                    placeholder: "Selecione o cliente",
                    remote: {
                        table: "clients",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document", "email"],
                        userScoped: true,
                        pageSize: 10,
                    },
                },
                {
                    name: "service_id",
                    label: "Serviço",
                    type: "remote-select",
                    required: false,
                    placeholder: "Vincular serviço (opcional)",
                    remote: {
                        table: "services",
                        valueKey: "id",
                        labelKey: "service_code",
                        searchKeys: ["service_code", "description"],
                        userScoped: true,
                        pageSize: 10,
                    },
                },
            ],
        },
        {
            title: "Dados da Receita",
            description: "Informações principais",
            fields: [
                {
                    name: "description",
                    label: "Descrição",
                    type: "textarea" as const,
                    required: true,
                    placeholder: "Ex.: Serviço de transporte SP → RJ...",
                },
                {
                    name: "amount",
                    label: "Valor (R$)",
                    type: "number" as const,
                    required: true,
                    placeholder: "0,00",
                },
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
            ],
        },
        {
            title: "Pagamento",
            description: "Forma e status",
            fields: [
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
                        { label: "Recebido", value: "paid" },
                        { label: "Vencido", value: "overdue" },
                        { label: "Cancelado", value: "canceled" },
                    ],
                },
            ],
        },
    ],
} as const;

// ---------- Schema (Zod) ----------
const methodEnum = z.enum(["pix", "transfer", "boleto", "card", "cash", "other"], {
    errorMap: () => ({ message: "Selecione uma forma de pagamento válida" }),
});

const statusEnum = z.enum(["pending", "paid", "overdue", "canceled"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
});

export const receivableSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),

    client_id: z.string().uuid({ message: "client_id deve ser UUID" }),
    service_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),

    description: z.string().min(1, "Descrição obrigatória"),
    amount: z.coerce.number().min(0, "Valor inválido"),

    due_date: z.coerce.date({ message: "Data de vencimento inválida" }),
    payment_date: z.coerce.date().optional(),

    payment_method: methodEnum.optional(),
    status: statusEnum.default("pending"),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ReceivableForm = z.infer<typeof receivableSchema>;

// ---------- Type Hints ----------
export const receivableTypeHints = {
    client_id: "uuid" as const,
    service_id: "uuid" as const,
    amount: "number" as const,
    due_date: "date" as const,
    payment_date: "date" as const,
    created_at: "date" as const,
    updated_at: "date" as const,
};

// ---------- Types ----------
export interface Receivable {
    id: string;
    user_id: string;

    client_id: string;
    service_id: string | null;

    description: string;
    amount: number;

    due_date: string;            // ISO
    payment_date: string | null; // ISO

    payment_method: "pix" | "transfer" | "boleto" | "card" | "cash" | "other" | null;
    status: "pending" | "paid" | "overdue" | "canceled";

    created_at: string;
    updated_at: string;
}

export interface CreateReceivable {
    client_id: string;
    service_id?: string | null;
    description: string;
    amount: number;
    due_date: string;            // ISO
    payment_date?: string | null;
    payment_method?: Receivable["payment_method"];
    status?: Receivable["status"];
    user_id?: string;   // 👉 adicionar aqui
}

export type UpdateReceivable = Partial<
    Omit<Receivable, "id" | "user_id" | "created_at" | "updated_at">
>;
