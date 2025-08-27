export const employeeFormConfig = {
    title: "Funcionário",
    description: "Gerencie os dados do funcionário",
    groups: [
        {
            title: "Informações Pessoais",
            description: "Dados pessoais do funcionário",
            fields: [
                { name: "name", label: "Nome Completo", type: "text" as const, required: true },
                { name: "cpf", label: "CPF", type: "text" as const, required: true },
                { name: "phone", label: "Telefone", type: "text" as const, required: true },
                { name: "email", label: "E-mail", type: "email" as const },
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
                    options: ["SP", "RJ", "MG", "RS", "PR", "SC"].map((uf) => ({ label: uf, value: uf })),
                },
                { name: "cep", label: "CEP", type: "text" as const },
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
                        { label: "Motorista", value: "motorista" },
                        { label: "Ajudante", value: "ajudante" },
                        { label: "Mecânico", value: "mecanico" },
                        { label: "Administrativo", value: "administrativo" },
                        { label: "Gerente", value: "gerente" },
                        { label: "Diretor", value: "diretor" },
                    ],
                },
                { name: "hire_date", label: "Data de Admissão", type: "date" as const, required: true },
                { name: "salary", label: "Salário", type: "number" as const },
                {
                    name: "status",
                    label: "Status",
                    type: "select" as const,
                    required: true,
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
                { name: "cnh_number", label: "Número da CNH", type: "text" as const },
                {
                    name: "cnh_category",
                    label: "Categoria CNH",
                    type: "select" as const,
                    options: ["A", "B", "C", "D", "E"].map((c) => ({ label: c, value: c })),
                },
                { name: "cnh_expiry", label: "Vencimento CNH", type: "date" as const },
            ],
        },
    ],
} as const;
