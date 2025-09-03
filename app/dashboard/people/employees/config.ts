import { z } from "zod";

export const UF = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
    "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;
export type UFType = typeof UF[number];

// Cargos (values vindos do seu config)
export const POSITION_VALUES = [
    "Administrativo",
    "Gerente",
    "Diretor",
    "Operador de Guindauto",
    "Operador de Guindaste Articulado",
    "Motoristade carreta",
    "Serralheiro",
    "Motorista",
    "Mecanico",
    "Ajudante",
] as const;
export type Position = typeof POSITION_VALUES[number];

// Status
export const STATUS_VALUES = ["active", "vacation", "inactive", "demitido"] as const;
export type Status = typeof STATUS_VALUES[number];

// Categorias de CNH
export const LICENSE_CATEGORY_VALUES = ["A", "B", "C", "D", "E"] as const;
export type LicenseCategory = typeof LICENSE_CATEGORY_VALUES[number];
const CNHEnum = z.enum(["A","B","C","D","E"]);

/**
 * ======= Config (reutilizando constantes) =======
 */
export const employeeFormConfig = {
    title: "Funcionário",
    description: "Gerencie os dados do funcionário",
    groups: [
        {
            title: "Informações Pessoais",
            description: "Dados pessoais do funcionário",
            fields: [
                { name: "name", label: "Nome Completo", type: "text" as const, required: true },
                { name: "document", label: "Documento (CPF)", type: "text" as const, required: true },
                { name: "email", label: "E-mail", type: "email" as const },
                { name: "phone", label: "Telefone", type: "text" as const },
            ],
        },
        {
            title: "Endereço",
            description: "Endereço residencial do funcionário",
            fields: [
                { name: "address", label: "Endereço", type: "text" as const },
                { name: "city", label: "Cidade", type: "text" as const },
                {
                    name: "state",
                    label: "Estado",
                    type: "select" as const,
                    options: UF.map((uf) => ({ label: uf, value: uf })),
                },
                { name: "zip_code", label: "CEP", type: "text" as const },
            ],
        },
        {
            title: "Informações Profissionais",
            description: "Dados relacionados ao trabalho",
            fields: [
                {
                    name: "position",
                    label: "Cargo",
                    type: "select" as const,
                    required: true,
                    options: POSITION_VALUES.map((v) => ({ label: v.replaceAll("_", " "), value: v })),
                },
                { name: "salary", label: "Salário", type: "number" as const },
                { name: "hire_date", label: "Data de Admissão", type: "date" as const, required: true },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    options: STATUS_VALUES.map((v) => ({
                        label:
                            v === "active" ? "Ativo" :
                                v === "vacation" ? "Férias" :
                                    v === "inactive" ? "Afastado" :
                                        v === "demitido" ? "Demitido" : v,
                        value: v,
                    })),
                },
            ],
        },
        {
            title: "Documentos",
            description: "CNH e outros documentos",
            fields: [
                { name: "license_number", label: "Número da CNH", type: "text" as const },
                {
                    name: "license_category",
                    label: "Categoria CNH",
                    type: "multiselect" as const,
                    options: LICENSE_CATEGORY_VALUES.map((c) => ({ label: c, value: c })),
                },
                { name: "license_expiry", label: "Vencimento CNH", type: "date" as const },
            ],
        },  
    ],
} as const;

/**
 * ======= Schema (mantive como você enviou, só reusando constantes) =======
 * Obs: aqui você usa license_*; no config usa license_*
 */
export const schema = z.object({
    name: z.string().min(2, "Nome muito curto"),
    document: z.string().min(11, "CPF inválido"),
    phone: z.string().min(8, "Telefone inválido"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    user_id: z.string().optional(),

    address: z.string().optional(),
    city: z.string().optional(),
    state: z.enum(UF, { errorMap: () => ({ message: `Selecione um estado válido` }) }).optional(),
    zip_code: z.string().optional(),

    position: z.enum(POSITION_VALUES, { errorMap: () => ({ message: "Selecione um cargo válido" }) }),
    hire_date: z.string().min(1, "Data de admissão é obrigatória"), // string (converta com typeHints)

    salary: z.coerce.number().optional(),
    status: z.enum(STATUS_VALUES, { errorMap: () => ({ message: "Selecione um status válido" }) }),

    // ⚠ Aqui estão license_* (enquanto o config usa license_*)
    license_number: z.string().optional(),
    license_category: z.array(CNHEnum).optional() // .min(1, "Selecione pelo menos uma categoria")
    .or(CNHEnum.array().length(0)),
    license_expiry: z.string().optional().nullable(),
});

/**
 * ======= Tipos da Entidade (Employee / Create / Update) =======
 * Montei com base no schema acima. Ajuste timestamps/ids conforme seu DB real.
 */

// Campos “de negócio” (sem metadados de banco)
export type EmployeeCore = {
    // pessoais
    name: string;
    document: string;
    phone: string;
    email?: string | "";

    // endereço
    address?: string;
    city?: string;
    state?: UFType;
    zip_code?: string;

    // profissionais
    position: Position;
    hire_date: string;      // trate como Date/ISO via typeHints na UI
    salary?: number;
    status: Status;

    // CNH (schema usa license_*)
    license_number?: string;
    license_category?: LicenseCategory;
    license_expiry?: string | null;

    // ownership (RLS)
    user_id?: string;
};

// Linha completa do banco (inclui metadados)
export type Employee = EmployeeCore & {
    id: string;
    created_at?: string;
    updated_at?: string | null;
};

// Payload de criação (não inclui id/timestamps)
export type CreateEmployee = EmployeeCore;

// Payload de atualização parcial (tudo opcional)
export type UpdateEmployee = Partial<CreateEmployee>;
