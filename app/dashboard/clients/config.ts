import { z } from "zod";

export const CLIENTS_TABLE = "clients" as const;

/** Util: valida CPF/CNPJ por comprimento (sem dígitos verificadores para manter leve). */
const cpfCnpjRefine = (val: string) => {
    const digits = (val || "").replace(/\D+/g, "");
    return digits.length === 11 || digits.length === 14; // 11 = CPF, 14 = CNPJ
};

export const clientsFormConfig = {
    title: "Cliente",
    description: "Cadastro de clientes da JB Transportes",
    groups: [
        {
            title: "Dados Básicos",
            description: "Identificação do cliente",
            fields: [
                {
                    name: "name",
                    label: "Nome/Razão Social",
                    type: "text",
                    required: true,
                    placeholder: "Ex.: Empresa XPTO Ltda",
                },
                {
                    name: "document",
                    label: "Documento (CPF/CNPJ)",
                    type: "text",
                    required: true,
                    placeholder: "00.000.000/0000-00",
                    help: "Aceita CPF ou CNPJ (com ou sem máscara)",
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    options: [
                        { label: "Ativo", value: "active" },
                        { label: "Inativo", value: "inactive" },
                    ],
                    defaultValue: "active",
                },
            ],
        },
        {
            title: "Contato",
            description: "Meios de contato",
            fields: [
                { name: "email", label: "E-mail", type: "text", placeholder: "contato@cliente.com" },
                { name: "phone", label: "Telefone", type: "text", placeholder: "(00) 00000-0000" },
            ],
        },
        {
            title: "Endereço",
            description: "Localização do cliente",
            fields: [
                { name: "address", label: "Endereço", type: "text", placeholder: "Rua, número" },
                { name: "city", label: "Cidade", type: "text", placeholder: "São Paulo" },
                { name: "state", label: "UF", type: "text", placeholder: "SP" },
                { name: "zip_code", label: "CEP", type: "text", placeholder: "00000-000" },
            ],
        },
    ],
} as const;

const statusEnum = z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
});

export const clientSchema = z
    .object({
        id: z.string().uuid().optional(),
        user_id: z.string().uuid().optional(),

        name: z.string().min(1, "Nome obrigatório").transform((s) => s.trim()),
        document: z
            .string()
            .min(1, "Documento obrigatório")
            .transform((s) => s.trim())
            .refine(cpfCnpjRefine, "Informe um CPF/CNPJ válido (11 ou 14 dígitos)"),

        email: z
            .string()
            .email("E-mail inválido")
            .optional()
            .or(z.literal(""))
            .optional(),
        phone: z.string().optional(),

        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2, "UF deve ter 2 caracteres").optional(),
        zip_code: z.string().optional(),

        status: statusEnum.default("active"),

        created_at: z.string().optional(),
        updated_at: z.string().optional(),
    })
    .strict();

export type Client = z.infer<typeof clientSchema>;

export const clientTypeHints = {
    created_at: "date" as const,
    updated_at: "date" as const,
};