"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { CLIENTS_TABLE, clientsFormConfig, clientSchema, clientTypeHints, type Client } from "../config";

const Clients = createCrudClient<Client, Partial<Client>>({
  table: CLIENTS_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

export default function NewClientPage() {
  return (
    <RecordForm
      config={clientsFormConfig as any}
      initialValues={{ status: "active" }}
      schema={clientSchema}
      typeHints={clientTypeHints}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error } = await sb.auth.getUser();
        if (error) throw error;
        if (!user) throw new Error("Usuário não autenticado");

        delete (values as any).id;
        const payload = { ...values, user_id: user.id } as Partial<Client>;
        await Clients.create(payload as any);
      }}
      backHref="/dashboard/clients"
    />
  );
}