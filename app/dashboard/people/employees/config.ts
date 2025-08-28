// Lista completa de UFs BR (opcional; pode reduzir se quiser espelhar só o CSV)
const UF = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
    "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

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
                    options: [
                        { label: "Ajudante", value: "Ajudante" },
                        { label: "Motorista", value: "Motorista" },
                        { label: "Mecânico", value: "Mecanico" },
                        { label: "Administrativo", value: "Administrativo" },
                        { label: "Gerente", value: "Gerente" },
                        { label: "Diretor", value: "Diretor" },
                    ],
                },
                { name: "salary", label: "Salário", type: "number" as const },
                { name: "hire_date", label: "Data de Admissão", type: "date" as const, required: true },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
                    // Baseado no CSV (active, vacation)
                    options: [
                        { label: "Ativo", value: "active" },
                        { label: "Férias", value: "vacation" },
                        { label: "Afastado", value: "inactive" },
                        { label: "Demitido", value: "demitido" },
                    ],
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
                    type: "select" as const,
                    options: ["A", "B", "C", "D", "E"].map((c) => ({ label: c, value: c })),
                },
                { name: "license_expiry", label: "Vencimento CNH", type: "date" as const },
            ],
        },
    ],
} as const;
