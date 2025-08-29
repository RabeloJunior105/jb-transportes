"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";

type FilterMap = Record<string, string>; // { filtroUI: colunaDB }

type MakeFetchDataClientArgs<T> = {
    table: string;
    select?: string;
    defaultOrder?: { column: string; ascending?: boolean };
    searchFields?: string[];     // ["name","email"] -> OR ilike em múltiplas colunas
    filterMap?: FilterMap;       // { status: "status", type: "type" }
    transformRow?: (row: any) => T; // opcional: pós-processamento
};

// Gera a função fetchData pedida pelo RecordList
export function makeFetchDataClient<T>({
    table,
    select = "*",
    defaultOrder,
    searchFields = [],
    filterMap = {},
    transformRow,
}: MakeFetchDataClientArgs<T>) {
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
        const sb = createBrowserClient();

        // ---------- BASE LIST ----------
        let list = sb.from(table).select(select, { count: "exact" });

        // Filtros (eq / ignorando "all")
        if (filters) {
            for (const [uiKey, value] of Object.entries(filters)) {
                if (!value || value === "all") continue;
                const col = filterMap[uiKey] ?? uiKey;
                list = list.eq(col, value);
            }
        }

        // Busca (OR ilike em várias colunas)
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
