import { z } from "zod";

export const MAINT_TABLE = "maintenance" as const;

/** Form Config (alinhado ao schema real) */
export const maintenanceFormConfig = {
    title: "Manutenção",
    description: "Registre e gerencie manutenções da frota",
    groups: [
        {
            title: "Identificação (Sistema)",
            description: "Campos controlados pela aplicação",
            hidden: true,
            fields: [
                { name: "id", label: "ID", type: "hidden" as const, hidden: false },
                { name: "user_id", label: "User ID", type: "hidden" as const, hidden: false },
                { name: "created_at", label: "Criado em", type: "date" as const, hidden: false },
                { name: "updated_at", label: "Atualizado em", type: "date" as const, hidden: false },
            ],
        },
        {
            title: "Vínculos",
            description: "Relacionamentos com outros registros",
            fields: [
                {
                    name: "vehicle_id",
                    label: "Veículo",
                    type: "remote-select",
                    required: true,
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
                    name: "supplier_id",
                    label: "Fornecedor",
                    type: "remote-select",
                    remote: {
                        table: "suppliers",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document"],
                        userScoped: true,
                    },
                },
            ],
        },
        {
            title: "Dados da Manutenção",
            description: "Informações principais",
            fields: [
                {
                    name: "maintenance_type",
                    label: "Tipo",
                    type: "select" as const,
                    required: true,
                    options: [
                        { label: "Preventiva", value: "preventive" },
                        { label: "Corretiva", value: "corrective" },
                        { label: "Inspeção", value: "inspection" },
                    ],
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    options: [
                        { label: "Pendente", value: "pending" },
                        { label: "Em andamento", value: "in_progress" },
                        { label: "Concluída", value: "completed" },
                        { label: "Cancelada", value: "canceled" },
                    ],
                },
                { name: "cost", label: "Custo (R$)", type: "number" as const, required: true },
                { name: "mileage", label: "Odômetro (km)", type: "number" as const },
                { name: "maintenance_date", label: "Data da Manutenção", type: "date" as const, required: true },
                { name: "next_maintenance_date", label: "Próxima Manutenção", type: "date" as const },
                { name: "description", label: "Descrição", type: "textarea" as const },
            ],
        },
    ],
} as const;

/** Zod Schema (alinhado ao schema real) */
const maintTypeEnum = z.enum(["preventive", "corrective", "inspection"], {
    errorMap: () => ({ message: "Selecione um tipo válido" }),
});
const maintStatusEnum = z.enum(["pending", "in_progress", "completed", "canceled"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
});

export const maintenanceSchema = z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),

    vehicle_id: z.string().uuid({ message: "vehicle_id deve ser UUID" }),
    supplier_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),

    maintenance_type: maintTypeEnum,
    description: z.string().optional(),
    cost: z.coerce.number().min(0, "Custo inválido"),

    maintenance_date: z.coerce.date({ message: "Data inválida" }),
    next_maintenance_date: z.coerce.date().optional(),
    mileage: z.coerce.number().nonnegative().optional(),

    status: maintStatusEnum.default("pending"),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type MaintenanceForm = z.infer<typeof maintenanceSchema>;

/** Hints para o RecordForm */
export const maintenanceTypeHints = {
    vehicle_id: "uuid" as const,
    supplier_id: "uuid" as const,

    maintenance_date: "date" as const,
    next_maintenance_date: "date" as const,

    mileage: "number" as const,
    cost: "number" as const,

    created_at: "date" as const,
    updated_at: "date" as const,
};

/** Types (TS) — batendo com a tabela */
export interface Maintenance {
    id: string;
    user_id: string;

    vehicle_id: string;
    supplier_id: string | null;

    maintenance_type: "preventive" | "corrective" | "inspection";
    description: string | null;
    cost: number;

    maintenance_date: string;             // ISO
    next_maintenance_date: string | null; // ISO
    mileage: number | null;

    status: "pending" | "in_progress" | "completed" | "canceled";

    created_at: string;
    updated_at: string;
}

export interface CreateMaintenance {
    vehicle_id: string;
    supplier_id?: string | null;

    maintenance_type: Maintenance["maintenance_type"];
    description?: string | null;
    cost: number;

    maintenance_date: string;             // ISO
    next_maintenance_date?: string | null;
    mileage?: number | null;

    status?: Maintenance["status"];
}

export type UpdateMaintenance = Partial<
    Omit<Maintenance, "id" | "user_id" | "created_at" | "updated_at">
>;
