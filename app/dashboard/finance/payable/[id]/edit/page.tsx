"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import {
    PAYABLE_TABLE,
    payableFormConfig,
    payableSchema,
    payableTypeHints,
    Payable,
} from "../../config";

const Payables = createCrudClient<Payable, Partial<Payable>>({
    table: PAYABLE_TABLE,
    select: "*",
    defaultOrder: { column: "updated_at", ascending: false },
});

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function EditPayablePage() {
    const params = useParams();
    const id = (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id) as string | undefined;

    const sb = useMemo(() => createBrowserClient(), []);
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState<Partial<Payable> | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!id || !UUID_RE.test(id)) {
                    toast.error("ID inválido.");
                    setLoading(false);
                    return;
                }

                const { data, error, status } = await sb
                    .from("accounts_payable")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

                if (error && status !== 406) throw error;
                if (!data) {
                    toast.error("Conta não encontrada.");
                    setLoading(false);
                    return;
                }

                setInitialValues(data as Payable);
            } catch (err) {
                console.log(err);
                toast.error("Erro ao carregar a conta.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, sb]);

    if (loading) return null;
    if (!initialValues) return null;

    return (
        <RecordForm
            config={payableFormConfig as any}
            initialValues={initialValues}
            schema={payableSchema}
            typeHints={payableTypeHints}
            onSubmit={async (values) => {
                delete (values as any).id;
                delete (values as any).user_id;
                delete (values as any).created_at;
                delete (values as any).updated_at;

                await Payables.update((params as any).id as string, values as Partial<Payable>);
            }}
            backHref="/dashboard/finance/payable"
        />
    );
}
