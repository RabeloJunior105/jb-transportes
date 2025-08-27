import type { PostgrestError, PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import type { Id, ListParams, CrudOptions, CrudAPI } from "./types";

function applyBasicFilters(q: any, filters?: Record<string, any>, like?: Record<string, string>) {
    if (filters) {
        for (const [k, v] of Object.entries(filters)) {
            if (v === undefined) continue;
            if (Array.isArray(v)) q = q.in(k, v);
            else q = q.eq(k, v);
        }
    }
    if (like) {
        for (const [k, pattern] of Object.entries(like)) {
            if (pattern === undefined) continue;
            q = q.ilike(k, pattern);
        }
    }
    return q;
}

function applyOrder(q: any, order?: { column: string; ascending?: boolean }) {
    if (order?.column) return q.order(order.column, { ascending: order.ascending ?? false });
    return q;
}

export function createCrudCore<T, TCreate, TUpdate = Partial<TCreate>>(
    getSupabase: () => Promise<SupabaseClient> | SupabaseClient,
    env: {
        getUserId?: () => Promise<string | null> | string | null;
        scopeByUserField?: string | null;
        onMissingUser?: "throw" | "returnEmpty";
        attachUserIdOnCreate?: { field: string; userId: string | null } | null;
    },
    opts: CrudOptions<TCreate, TUpdate>
): CrudAPI<T, TCreate, TUpdate> {
    const { table, select = "*", defaultOrder, softDeleteField, validate } = opts;

    async function list(params: ListParams = {}): Promise<T[]> {
        const sb = await getSupabase();
        const userId = env.getUserId ? await env.getUserId() : null;

        if (env.scopeByUserField && !userId) {
            if (env.onMissingUser === "returnEmpty") return [] as T[];
            throw new Error("User not authenticated");
        }

        let q: any = sb.from(table).select(select);
        if (env.scopeByUserField && userId) q = q.eq(env.scopeByUserField, userId);

        q = applyBasicFilters(q, params.filters, params.like);
        q = applyOrder(q, params.order ?? defaultOrder);

        const page = params.page ?? 1;
        const size = params.pageSize ?? 20;
        if (params.rangeHeaders !== false) {
            const from = (page - 1) * size;
            const to = from + size - 1;
            q = q.range(from, to);
        }

        const { data, error } = (await q) as PostgrestSingleResponse<T[]>;
        if (error) throw error;
        return (data ?? []) as T[];
    }

    async function getById(id: Id): Promise<T> {
        const sb = await getSupabase();
        const userId = env.getUserId ? await env.getUserId() : null;

        let q: any = sb.from(table).select(select).eq("id", id).single();
        if (env.scopeByUserField && userId) q = q.eq(env.scopeByUserField, userId);

        const { data, error } = (await q) as PostgrestSingleResponse<T>;
        if (error) throw error;
        return data as T;
    }

    async function create(payload: TCreate): Promise<T> {
        const sb = await getSupabase();

        let toInsert: any = validate?.create ? validate.create(payload) : payload;

        if (env.attachUserIdOnCreate?.field) {
            const uid = env.attachUserIdOnCreate.userId;
            if (!uid && env.scopeByUserField) throw new Error("User not authenticated");
            toInsert = { ...toInsert, [env.attachUserIdOnCreate.field]: uid };
        }

        const { data, error } = (await sb.from(table).insert(toInsert).select().single()) as PostgrestSingleResponse<T>;
        if (error) throw error;
        return data as T;
    }

    async function update(id: Id, patch: TUpdate): Promise<T> {
        const sb = await getSupabase();
        const userId = env.getUserId ? await env.getUserId() : null;

        const toUpdate = validate?.update ? validate.update(patch) : patch;

        let q: any = sb.from(table).update(toUpdate).eq("id", id).select().single();
        if (env.scopeByUserField && userId) q = q.eq(env.scopeByUserField, userId);

        const { data, error } = (await q) as PostgrestSingleResponse<T>;
        if (error) throw error;
        return data as T;
    }

    async function remove(id: Id): Promise<void> {
        const sb = await getSupabase();
        const userId = env.getUserId ? await env.getUserId() : null;

        if (softDeleteField) {
            let q: any = sb.from(table).update({ [softDeleteField]: new Date().toISOString() }).eq("id", id);
            if (env.scopeByUserField && userId) q = q.eq(env.scopeByUserField, userId);
            const { error } = await q;
            if (error) throw error as PostgrestError;
            return;
        }

        let q: any = sb.from(table).delete().eq("id", id);
        if (env.scopeByUserField && userId) q = q.eq(env.scopeByUserField, userId);
        const { error } = await q;
        if (error) throw error as PostgrestError;
    }

    return { list, getById, create, update, remove };
}
