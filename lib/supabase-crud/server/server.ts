import { createCrudCore } from "../core";
import type { CrudAPI, CrudOptions, ServerScopeOptions } from "../types";
import { createClient } from "@/lib/supabase/server";

export function createCrudServer<T, TCreate, TUpdate = Partial<TCreate>>(
    options: CrudOptions<TCreate, TUpdate>,
    scope?: ServerScopeOptions
): CrudAPI<T, TCreate, TUpdate> {
    return createCrudCore<T, TCreate, TUpdate>(
        async () => await createClient(),
        {
            getUserId: async () => {
                const sb = await createClient();
                const { data: { user } } = await sb.auth.getUser();
                return user?.id ?? null;
            },
            scopeByUserField: scope?.scopeByUserField ?? null,
            onMissingUser: scope?.onMissingUser ?? "throw",
            attachUserIdOnCreate: scope?.scopeByUserField
                ? { field: scope.scopeByUserField, userId: null }
                : null,
        },
        options
    );
}
