import { z } from "zod";

export const SERVICES_TABLE = "services" as const;

/** ---------- Form Config ---------- */
export const servicesFormConfig = {
    title: "Serviço",
    description: "Cadastre e gerencie serviços de transporte",
    groups: [
        {
            title: "Identificação (Sistema)",
            description: "Campos controlados pela aplicação",
            hidden: true,
            fields: [
                { name: "id", label: "ID", type: "hidden" as const, hidden: false, placeholder: "—" },
                { name: "user_id", label: "User ID", type: "hidden" as const, hidden: false, placeholder: "—" },
                { name: "created_at", label: "Criado em", type: "date" as const, hidden: false, placeholder: "AAAA-MM-DD" },
                { name: "updated_at", label: "Atualizado em", type: "date" as const, hidden: false, placeholder: "AAAA-MM-DD" },
            ],
        },
        {
            title: "Dados do Serviço",
            description: "Informações principais",
            fields: [
                {
                    name: "service_code",
                    label: "Código",
                    type: "text" as const,
                    required: true,
                    disabled: true,
                    placeholder: "Gerado automaticamente (ex.: SRV-123456)",
                    hidden: true,
                },
                {
                    name: "collection_date",
                    label: "Data de Coleta",
                    type: "date" as const,
                    required: true,
                    placeholder: "Selecione a data (AAAA-MM-DD)",
                },
                {
                    name: "delivery_date",
                    label: "Data de Entrega",
                    type: "date" as const,
                    placeholder: "Opcional (AAAA-MM-DD)",
                },
                {
                    name: "origin",
                    label: "Origem",
                    type: "text" as const,
                    required: true,
                    placeholder: "Ex.: São Paulo, SP",
                },
                {
                    name: "destination",
                    label: "Destino",
                    type: "text" as const,
                    required: true,
                    placeholder: "Ex.: Rio de Janeiro, RJ",
                },
                {
                    name: "description",
                    label: "Descrição",
                    type: "textarea" as const,
                    placeholder: "Descreva detalhadamente o serviço...",
                },
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
                    name: "vehicle_id",
                    label: "Veículo",
                    type: "remote-select",
                    required: true,
                    placeholder: "Selecione o veículo",
                    remote: {
                        table: "vehicles",
                        valueKey: "id",
                        labelKey: "plate",
                        searchKeys: ["plate", "brand", "model"],
                        userScoped: true,
                        pageSize: 10,
                    },
                },
                {
                    name: "driver_id",
                    label: "Motorista",
                    type: "remote-select",
                    required: true,
                    placeholder: "Selecione o motorista",
                    remote: {
                        table: "employees",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document"],
                        userScoped: true,
                        // filters: [{ column: "position", op: "ilike", value: "%motorista%" }],
                    },
                },
            ],
        },
        {
            title: "Valores",
            description: "Financeiro do serviço",
            fields: [
                {
                    name: "service_value",
                    label: "Valor do Serviço (R$)",
                    type: "number" as const,
                    required: true,
                    placeholder: "0,00",
                },
                { name: "toll_cost", label: "Pedágio (R$)", type: "number" as const, placeholder: "0,00" },
                { name: "fuel_cost", label: "Combustível (R$)", type: "number" as const, placeholder: "0,00" },
                { name: "other_costs", label: "Outros Custos (R$)", type: "number" as const, placeholder: "0,00" },
            ],
        },
        {
            title: "Status",
            description: "Situação atual do serviço",
            fields: [
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    placeholder: "Selecione o status",
                    options: [
                        { label: "Pendente", value: "pending" },
                        { label: "Em andamento", value: "in_progress" },
                        { label: "Concluído", value: "completed" },
                        { label: "Cancelado", value: "canceled" },
                    ],
                },
            ],
        },
    ],
} as const;


/** ---------- Schema (Zod) ---------- */
const statusEnum = z.enum(["pending", "in_progress", "completed", "canceled"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
});

export const serviceSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),

    service_code: z.string().min(1, "Código obrigatório"),

    client_id: z.string().uuid({ message: "client_id deve ser UUID" }),
    vehicle_id: z.string().uuid({ message: "vehicle_id deve ser UUID" }),
    driver_id: z.string().uuid({ message: "driver_id deve ser UUID" }),

    collection_date: z.coerce.date({ message: "Data de coleta inválida" }),
    delivery_date: z.coerce.date().optional(),

    origin: z.string().min(1, "Origem obrigatória"),
    destination: z.string().min(1, "Destino obrigatório"),
    description: z.string().optional(),

    service_value: z.coerce.number().min(0, "Valor inválido"),
    toll_cost: z.coerce.number().min(0).optional().default(0),
    fuel_cost: z.coerce.number().min(0).optional().default(0),
    other_costs: z.coerce.number().min(0).optional().default(0),

    status: statusEnum.default("pending"),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ServiceForm = z.infer<typeof serviceSchema>;

/** ---------- Type Hints (RecordForm) ---------- */
export const serviceTypeHints = {
    client_id: "uuid" as const,
    vehicle_id: "uuid" as const,
    driver_id: "uuid" as const,

    collection_date: "date" as const,
    delivery_date: "date" as const,

    service_value: "number" as const,
    toll_cost: "number" as const,
    fuel_cost: "number" as const,
    other_costs: "number" as const,

    created_at: "date" as const,
    updated_at: "date" as const,
};

/** ---------- Types TS ---------- */
export interface Service {
    id: string;
    user_id: string;

    service_code: string;

    client_id: string;
    vehicle_id: string;
    driver_id: string;

    collection_date: string;        // ISO
    delivery_date: string | null;   // ISO

    origin: string;
    destination: string;
    description: string | null;

    service_value: number;
    toll_cost: number;
    fuel_cost: number;
    other_costs: number;

    status: "pending" | "in_progress" | "completed" | "canceled";

    created_at: string;
    updated_at: string;
}

export interface CreateService {
    service_code: string;
    client_id: string;
    vehicle_id: string;
    driver_id: string;

    collection_date: string;       // ISO
    delivery_date?: string | null; // ISO

    origin: string;
    destination: string;
    description?: string | null;

    service_value: number;
    toll_cost?: number;
    fuel_cost?: number;
    other_costs?: number;

    status?: Service["status"];
}

export type UpdateService = Partial<
    Omit<Service, "id" | "user_id" | "created_at" | "updated_at">
>;
