"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import {
  MAINT_TABLE,
  maintenanceFormConfig,
  maintenanceSchema,
  maintenanceTypeHints,
  type CreateMaintenance,
  type Maintenance,
} from "../config";

const MaintenanceCrud = createCrudClient<Maintenance, CreateMaintenance>({
  table: MAINT_TABLE,
  select: "*",
  defaultOrder: { column: "updated_at", ascending: false },
});

export default function NewMaintenancePage() {
  return (
    <RecordForm
      config={maintenanceFormConfig}
      initialValues={{ status: "open" }}
      schema={maintenanceSchema}
      typeHints={maintenanceTypeHints}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error: userErr } = await sb.auth.getUser();
        if (userErr) throw userErr;
        if (!user) throw new Error("Usuário não autenticado");

        delete values.id;
        const payload: any = { ...values, user_id: user.id };

        await MaintenanceCrud.create(payload as CreateMaintenance);
      }}
      backHref="/dashboard/fleet/maintenance"
    />
  );
}
