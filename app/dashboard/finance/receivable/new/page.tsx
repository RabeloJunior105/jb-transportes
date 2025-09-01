"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import {
  RECV_TABLE,
  receivableFormConfig,
  receivableSchema,
  receivableTypeHints,
  Receivable,
  CreateReceivable,
} from "../config";

const Receivables = createCrudClient<Receivable, CreateReceivable>({
  table: RECV_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

export default function NewReceivablePage() {
  return (
    <RecordForm
      config={receivableFormConfig as any}
      initialValues={{ status: "pending" }}
      schema={receivableSchema}
      typeHints={receivableTypeHints}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error } = await sb.auth.getUser();
        if (error) throw error;
        if (!user) throw new Error("Usuário não autenticado");

        delete (values as any).id;
        const payload = { ...values, user_id: user.id };
        await Receivables.create(payload as any);
      }}
      backHref="/dashboard/finance/receivable"
    />
  );
}
