import { z } from "zod";

/** Ajuste aqui se o nome da tabela for diferente */
export const FUEL_TABLE = "fuel" as const;

// ---------- Form Config ----------
export const fuelFormConfig = {
    title: "Abastecimento",
    description: "Registre e gerencie abastecimentos da frota",
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
                    type: "remote-select" as const,
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
                    // use "driver_id" OU "employee_id", conforme sua coluna
                    name: "driver_id", // ou "employee_id"
                    label: "Motorista",
                    type: "remote-select" as const,
                    remote: {
                        table: "employees",
                        valueKey: "id",
                        labelKey: "name",
                        searchKeys: ["name", "document"],
                        userScoped: true,
                    },
                },
                {
                    name: "supplier_id",
                    label: "Fornecedor",
                    type: "remote-select" as const,
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
            title: "Dados do Abastecimento",
            description: "Informações principais",
            fields: [
                {
                    name: "fuel_type",
                    label: "Combustível",
                    type: "select" as const,
                    required: true,
                    options: [
                        { label: "Diesel", value: "diesel" },
                        { label: "Gasolina", value: "gasolina" },
                        { label: "Etanol", value: "etanol" },
                        { label: "Flex", value: "flex" },
                        { label: "GNV", value: "gnv" },
                        { label: "Elétrico", value: "eletrico" },
                    ],
                },
                { name: "liters", label: "Litros", type: "number" as const, required: true },
                { name: "price_per_liter", label: "Preço por Litro (R$)", type: "number" as const, required: true },
                { name: "total_cost", label: "Custo Total (R$)", type: "number" as const },
                { name: "mileage", label: "Odômetro (km)", type: "number" as const },
                { name: "fuel_date", label: "Data do Abastecimento", type: "date" as const, required: true },
                { name: "location", label: "Local", type: "text" as const },
            ],
        },
    ],
} as const;

// ---------- Schema (Zod) ----------
const fuelTypeEnum = z.enum(["diesel", "gasolina", "etanol", "flex", "gnv", "eletrico"], {
    errorMap: () => ({ message: "Selecione um combustível válido" }),
});

// helper pra aceitar "" -> undefined em relacionamentos opcionais
const uuidOrEmpty = z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined));

export const fuelSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().optional(),

    vehicle_id: z.string().uuid({ message: "vehicle_id deve ser UUID" }),
    driver_id: uuidOrEmpty,   // ou employee_id: uuidOrEmpty
    supplier_id: uuidOrEmpty,

    fuel_type: fuelTypeEnum,
    liters: z.coerce.number().positive("Informe os litros"),
    price_per_liter: z.coerce.number().positive("Informe o preço por litro"),
    total_cost: z.coerce.number().positive().optional(),
    mileage: z.coerce.number().nonnegative().optional(),

    fuel_date: z.coerce.date({ message: "Data inválida" }),
    location: z.string().optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type FuelForm = z.infer<typeof fuelSchema>;

// ---------- Type Hints ----------
export const fuelTypeHints = {
    id: "uuid" as const,
    user_id: "uuid" as const,

    vehicle_id: "uuid" as const,
    driver_id: "uuid" as const,      // ou employee_id: "uuid"
    supplier_id: "uuid" as const,

    fuel_date: "date" as const,
    liters: "number" as const,
    price_per_liter: "number" as const,
    total_cost: "number" as const,
    mileage: "number" as const,
    created_at: "date" as const,
    updated_at: "date" as const,
};

// ---------- Types ----------
export interface Fuel {
    id: string;
    user_id: string;
    vehicle_id: string;
    driver_id: string | null;    // ou employee_id
    supplier_id: string | null;
    fuel_type: "diesel" | "gasolina" | "etanol" | "flex" | "gnv" | "eletrico";
    liters: number;
    price_per_liter: number;
    total_cost: number;
    mileage: number | null;
    fuel_date: string; // ISO
    location: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateFuel {
    vehicle_id: string;
    driver_id?: string | null;   // ou employee_id?: string | null
    supplier_id?: string | null;
    fuel_type: Fuel["fuel_type"];
    liters: number;
    price_per_liter: number;
    total_cost?: number;
    mileage?: number | null;
    fuel_date: string; // ISO
    location?: string | null;
    user_id: string;
}

export type UpdateFuel = Partial<
    Omit<Fuel, "id" | "user_id" | "created_at" | "updated_at">
>;
