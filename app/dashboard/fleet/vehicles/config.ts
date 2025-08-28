import { z } from "zod";

export const vehiclesFormConfig = {
    title: "Veículo",
    description: "Gerencie os dados do veículo",
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
            title: "Dados do Veículo",
            description: "Informações gerais",
            fields: [
                { name: "plate", label: "Placa", type: "text" as const, required: true },
                { name: "brand", label: "Marca", type: "text" as const, required: true },
                { name: "model", label: "Modelo", type: "text" as const, required: true },
                { name: "year", label: "Ano", type: "number" as const },
                { name: "color", label: "Cor", type: "text" as const },
            ],
        },
        {
            title: "Identificadores",
            description: "Chassi e RENAVAM",
            fields: [
                { name: "chassis", label: "Chassi", type: "text" as const },
                { name: "renavam", label: "RENAVAM", type: "text" as const },
            ],
        },
        {
            title: "Operação",
            description: "Uso e capacidade",
            fields: [
                {
                    name: "fuel_type",
                    label: "Combustível",
                    type: "select" as const,
                    options: [
                        { label: "Diesel", value: "diesel" },
                        { label: "Gasolina", value: "gasolina" },
                        { label: "Etanol", value: "etanol" },
                        { label: "Flex", value: "flex" },
                        { label: "GNV", value: "gnv" },
                        { label: "Elétrico", value: "eletrico" },
                    ],
                },
                { name: "capacity", label: "Capacidade (kg / pax)", type: "number" as const },
                { name: "mileage", label: "Odômetro (km)", type: "number" as const },
            ],
        },
        {
            title: "Status",
            description: "Situação do veículo",
            fields: [
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    options: [
                        { label: "Ativo", value: "active" },
                        { label: "Inativo", value: "inactive" },
                        { label: "Manutenção", value: "maintenance" },
                    ],
                },
            ],
        },
    ],
} as const;


// mensagens mais amigáveis para enums
const fuelType = z.enum(["diesel", "gasolina", "etanol", "flex", "gnv", "eletrico"], {
    errorMap: () => ({ message: "Selecione um combustível válido" }),
});
const vehicleStatus = z.enum(["active", "inactive", "maintenance"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
});

export const vehicleSchema = z.object({
    plate: z.string().min(3, "Placa inválida"),
    brand: z.string().min(1, "Marca obrigatória"),
    model: z.string().min(1, "Modelo obrigatório"),
    year: z.coerce.number().int().min(1900, "Ano inválido").max(2100, "Ano inválido").optional(),

    color: z.string().optional(),
    chassis: z.string().optional(),
    renavam: z.string().optional(),

    fuel_type: fuelType.optional(),
    capacity: z.coerce.number().optional(),
    mileage: z.coerce.number().default(0),

    status: vehicleStatus.default("active"),

    // campos de sistema opcionais
    id: z.string().optional(),
    user_id: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type VehicleForm = z.infer<typeof vehicleSchema>;

// Hints para o RecordForm converter tipos corretamente
export const vehicleTypeHints = {
    year: "number" as const,
    capacity: "number" as const,
    mileage: "number" as const,
    created_at: "date" as const,
    updated_at: "date" as const,
};


// types/vehicle.ts

export interface Vehicle {
    id: string;
    plate: string;
    renavam: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    chassis: string;
    capacity: number;
    mileage: number;
    fuel_type: string;
    status: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateVehicle {
    plate: string;
    renavam: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    chassis: string;
    capacity: number;
    mileage: number;
    fuel_type: string;
    status: string;
}

export type UpdateVehicle = Partial<
  Omit<Vehicle, "id" | "user_id" | "created_at" | "updated_at">
>;