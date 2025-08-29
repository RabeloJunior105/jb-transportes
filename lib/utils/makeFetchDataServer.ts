import { createClient } from "@/lib/supabase/server";

type FilterMap = Record<string, string>;

type MakeFetchDataServerArgs<T> = {
    table: string;
    select?: string;
    defaultOrder?: { column: string; ascending?: boolean };
    scopeByUserField?: string;   // ex: "user_id"
    searchFields?: string[];
    filterMap?: FilterMap;
    transformRow?: (row: any) => T;
};

export function makeFetchDataServer<T>({
    table,
    select = "*",
    defaultOrder,
    scopeByUserField,
    searchFields = [],
    filterMap = {},
    transformRow,
}: MakeFetchDataServerArgs<T>) {
    return async function fetchData({
        page,
        itemsPerPage,
        search,
        filters,
    }: {
        page: number;
        itemsPerPage: number;
        search?: string;
        filters?: Record<string, string>;
    }): Promise<{ data: T[]; total: number }> {
        const sb = await createClient();

        const {
            data: { user },
        } = await sb.auth.getUser();
        if (scopeByUserField && !user) throw new Error("User not authenticated");

        let list = sb.from(table).select(select, { count: "exact" });

        // Ownership
        if (scopeByUserField && user?.id) {
            list = list.eq(scopeByUserField, user.id);
        }

        // Filtros
        if (filters) {
            for (const [uiKey, value] of Object.entries(filters)) {
                if (!value || value === "all") continue;
                const col = filterMap[uiKey] ?? uiKey;
                list = list.eq(col, value);
            }
        }

        // Busca (OR ilike)
        if (search && searchFields.length > 0) {
            const pattern = `%${search}%`;
            const orParts = searchFields.map((c) => `${c}.ilike.${pattern}`);
            list = list.or(orParts.join(","));
        }

        // Ordenação
        if (defaultOrder?.column) {
            list = list.order(defaultOrder.column, {
                ascending: defaultOrder.ascending ?? false,
            });
        }

        // Paginação
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        list = list.range(from, to);

        const { data, error, count } = await list;
        if (error) throw error;

        const rows = (data ?? []).map((r) => (transformRow ? transformRow(r) : r));
        return { data: rows as T[], total: count ?? 0 };
    };
}
