// =============================================
// app/dashboard/suppliers/config.ts
// =============================================
import { z } from "zod";


export const SUPPLIERS_TABLE = "suppliers" as const;


export const supplierFormConfig = {
    title: "Fornecedor",
    description: "Cadastre e gerencie fornecedores",
    groups: [
        {
            title: "Dados Principais",
            description: "Identificação",
            fields: [
                { name: "name", label: "Nome/Razão Social", type: "text" as const, required: true, placeholder: "Ex.: Auto Peças Silva" },
                { name: "document", label: "CPF/CNPJ", type: "text" as const, placeholder: "00000000000 ou 00.000.000/0000-00" },
                {
                    name: "status", label: "Status", type: "select" as const, required: true, placeholder: "Selecione",
                    options: [{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }]
                },
            ],
        },
        {
            title: "Contato",
            description: "Informações de contato",
            fields: [
                { name: "email", label: "E-mail", type: "text" as const, placeholder: "contato@fornecedor.com.br" },
                { name: "phone", label: "Telefone", type: "text" as const, placeholder: "(00) 00000-0000" },
            ],
        },
        {
            title: "Endereço",
            description: "Localização",
            fields: [
                { name: "zip_code", label: "CEP", type: "text" as const, placeholder: "00000-000" },
                { name: "address", label: "Endereço", type: "text" as const, placeholder: "Rua, número" },
                { name: "city", label: "Cidade", type: "text" as const, placeholder: "São Paulo" },
                {
                    name: "state", label: "UF", type: "select" as const, placeholder: "Selecione o estado",
                    options: [
                        { label: "AC", value: "AC" }, { label: "AL", value: "AL" }, { label: "AM", value: "AM" }, { label: "AP", value: "AP" },
                        { label: "BA", value: "BA" }, { label: "CE", value: "CE" }, { label: "DF", value: "DF" }, { label: "ES", value: "ES" },
                        { label: "GO", value: "GO" }, { label: "MA", value: "MA" }, { label: "MG", value: "MG" }, { label: "MS", value: "MS" },
                        { label: "MT", value: "MT" }, { label: "PA", value: "PA" }, { label: "PB", value: "PB" }, { label: "PE", value: "PE" },
                        { label: "PI", value: "PI" }, { label: "PR", value: "PR" }, { label: "RJ", value: "RJ" }, { label: "RN", value: "RN" },
                        { label: "RO", value: "RO" }, { label: "RR", value: "RR" }, { label: "RS", value: "RS" }, { label: "SC", value: "SC" },
                        { label: "SE", value: "SE" }, { label: "SP", value: "SP" }, { label: "TO", value: "TO" }
                    ]
                },
            ],
        },
    ],
} as const;


export const supplierSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid().optional(),
    name: z.string().min(1, "Nome obrigatório"),
    document: z.string().min(5, "Documento inválido").optional().or(z.literal("")),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().length(2, "UF inválida").optional().or(z.literal("")),
    zip_code: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "inactive"]).default("active"),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});


export type Supplier = z.infer<typeof supplierSchema>;


export interface CreateSupplier {
    name: string;
    document?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    status?: "active" | "inactive";
}


export type UpdateSupplier = Partial<Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at">>;


export const supplierTypeHints = {
    created_at: "date" as const,
    updated_at: "date" as const,
};