"use client";


import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { SUPPLIERS_TABLE, supplierFormConfig, supplierSchema, supplierTypeHints, type Supplier, type CreateSupplier } from "../config";


const Suppliers = createCrudClient<Supplier, CreateSupplier>({
  table: SUPPLIERS_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});


export default function NewSupplierPage() {
  return (
    <RecordForm
      config={supplierFormConfig as any}
      initialValues={{ status: "active" }}
      schema={supplierSchema}
      typeHints={supplierTypeHints}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error } = await sb.auth.getUser();
        if (error) throw error; if (!user) throw new Error("Usuário não autenticado");
        delete (values as any).id;
        const payload = { ...values, user_id: user.id } as CreateSupplier & { user_id: string };
        await Suppliers.create(payload as any);
      }}
      backHref="/dashboard/suppliers"
    />
  );
}