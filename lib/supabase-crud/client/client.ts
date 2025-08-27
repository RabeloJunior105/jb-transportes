import { createCrudCore } from "../core";
import type { CrudAPI, CrudOptions, ClientScopeOptions } from "../types";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export function createCrudClient<T, TCreate, TUpdate = Partial<TCreate>>(
    options: CrudOptions<TCreate, TUpdate>,
    scope?: ClientScopeOptions
): CrudAPI<T, TCreate, TUpdate> {
    return createCrudCore<T, TCreate, TUpdate>(
        () => createBrowserClient(),
        {
            getUserId: () => null,
            scopeByUserField: null,
            onMissingUser: "throw",
            attachUserIdOnCreate: scope?.attachUserIdOnCreate ?? null,
        },
        options
    );
}
