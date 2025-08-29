"use client";

import { useEffect, useMemo, useState } from "react";
import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
    MAINT_TABLE,
    maintenanceFormConfig,
    maintenanceSchema,
    maintenanceTypeHints,
    type Maintenance,
    type UpdateMaintenance,
} from "../../config";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const Crud = createCrudClient<Maintenance, UpdateMaintenance>({
    table: MAINT_TABLE,
    select: "*",
    defaultOrder: { column: "updated_at", ascending: false },
});

export default function EditMaintenancePage() {
    const { id } = useParams<{ id: string }>();
    const sb = useMemo(() => createBrowserClient(), []);
    const router = useRouter();
    const [initial, setInitial] = useState<Partial<Maintenance> | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const { data, error, status } = await sb
                    .from(MAINT_TABLE)
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();
                if (error && status !== 406) throw error;
                if (!data) {
                    toast.error("Manutenção não encontrada ou sem permissão.");
                    router.push("/dashboard/fleet/maintenance");
                    return;
                }
                setInitial(data as Maintenance);
            } catch (e) {
                console.error(e);
                toast.error("Erro ao carregar manutenção.");
            }
        })();
    }, [id, sb, router]);

    if (!initial) return null;

    return (
        <RecordForm
            config={maintenanceFormConfig}
            initialValues={initial}
            schema={maintenanceSchema}
            typeHints={maintenanceTypeHints}
            onSubmit={async (values) => {
                const payload = { ...values };
                delete payload.user_id;
                delete payload.id;

                await Crud.update(id, payload as UpdateMaintenance);
            }}
            backHref={`/dashboard/fleet/maintenance`}
        />
    );
}
