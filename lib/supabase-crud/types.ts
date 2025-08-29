export type Id = string | number;

export type ListParams<TFilter = Record<string, any>> = {
    page?: number;          // 1-based (default 1)
    pageSize?: number;      // default 20
    filters?: TFilter;      // { field: value } -> eq por padrão; array -> in()
    like?: Record<string, string>; // { field: "%foo%" } -> ilike
    order?: { column: string; ascending?: boolean };
    rangeHeaders?: boolean; // se true (default), usa .range() pra paginação
};

export type CrudOptions<TCreate, TUpdate = Partial<TCreate>> = {
    table: string;                                // nome da tabela
    select?: string;                              // ex: "*, clients(name)"
    defaultOrder?: { column: string; ascending?: boolean };
    softDeleteField?: string;                     // ex: "deleted_at"
    validate?: {
        create?: (data: TCreate) => TCreate;
        update?: (data: TUpdate) => TUpdate;
    };
};

export type ServerScopeOptions = {
    scopeByUserField?: string;                    // ex: "user_id"
    onMissingUser?: "throw" | "returnEmpty";
};

export type ClientScopeOptions = {
    attachUserIdOnCreate?: { field: string; userId: string | null };
};

export type CrudAPI<T, TCreate, TUpdate = Partial<TCreate>> = {
    list: (params?: ListParams) => Promise<T[]>;
    getById: (id: Id) => Promise<T>;
    create: (payload: TCreate) => Promise<T>;
    update: (id: Id, patch: TUpdate) => Promise<T>;
    remove: (id: Id) => Promise<void>;
};


export type Employee = {
    id: string;
    // pessoais
    name: string;
    cpf: string;
    phone: string;
    email?: string | null;

    // endereço
    address?: string | null;
    city?: string | null;
    state?: "SP" | "RJ" | "MG" | "RS" | "PR" | "SC" | null;
    cep?: string | null;

    // profissionais
    position: "motorista" | "ajudante" | "mecanico" | "administrativo" | "gerente" | "diretor";
    hire_date: string;          // ISO
    salary?: number | null;
    status: "active" | "vacation" | "inactive" | "demitido";

    // documentos
    cnh_number?: string | null;
    cnh_category?: "A" | "B" | "C" | "D" | "E" | null;
    cnh_expiry?: string | null; // ISO

    // metadados
    user_id?: string | null;
    created_at: string;
    updated_at?: string | null;
};

export type CreateEmployee = Omit<Employee, "id" | "created_at" | "updated_at">;
export type UpdateEmployee = Partial<CreateEmployee>;
