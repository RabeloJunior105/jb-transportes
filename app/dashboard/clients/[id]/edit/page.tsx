"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { CLIENTS_TABLE, clientsFormConfig, clientSchema, clientTypeHints, type Client } from "../../config";

const Clients = createCrudClient<Client, Partial<Client>>({
    table: CLIENTS_TABLE,
    select: "*",
    defaultOrder: { column: "updated_at", ascending: false },
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function EditClientPage() {
    const rawParams = useParams();
    const params = (typeof (rawParams as any)?.then === "function" ? (React as any).use(rawParams as any) : rawParams) as any;
    const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) as string | undefined;

    const sb = React.useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = React.useState(true);
    const [initialValues, setInitialValues] = React.useState<Partial<Client> | null>(null);

    React.useEffect(() => {
        (async () => {
            try {
                if (!id || !UUID_RE.test(id)) {
                    toast.error("ID inválido.");
                    setLoading(false);
                    return;
                }

                const { data, error, status } = await sb
                    .from(CLIENTS_TABLE)
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    toast.error("Cliente não encontrado.");
                    setLoading(false);
                    return;
                }
                setInitialValues(data as Client);
            } catch (err) {
                console.log(err);
                toast.error("Erro ao carregar dados do cliente.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, sb]);

    if (loading) return null;
    if (!initialValues) return null;

    return (
        <RecordForm
            config={clientsFormConfig as any}
            initialValues={initialValues}
            schema={clientSchema}
            typeHints={clientTypeHints}
            onSubmit={async (values) => {
                delete (values as any).id;
                delete (values as any).user_id;
                delete (values as any).created_at;
                delete (values as any).updated_at;
                await Clients.update(id as string, values as Partial<Client>);
            }}
            backHref="/dashboard/clients"
        />
    );
}