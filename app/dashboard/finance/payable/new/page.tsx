"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import {
  PAYABLE_TABLE,
  payableFormConfig,
  payableSchema,
  payableTypeHints,
  Payable,
  CreatePayable,
} from "../config";

const Payables = createCrudClient<Payable, CreatePayable>({
  table: PAYABLE_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

export default function NewPayablePage() {
  return (
    <RecordForm
      config={payableFormConfig as any}
      initialValues={{
        status: "pending",
      }}
      schema={payableSchema}
      typeHints={payableTypeHints}

      onSubmit={async (values) => {
        console.log("Submitting payable", values);
        const sb = createBrowserClient();
        const { data: { user }, error } = await sb.auth.getUser();
        if (error) throw error;
        if (!user) throw new Error("Usuário não autenticado");

        delete (values as any).id; // não enviar id no insert
        const payload = { ...values, user_id: user.id };

        await Payables.create(payload as any);
      }}
      backHref="/dashboard/finance/payable"
    />
  );
}
