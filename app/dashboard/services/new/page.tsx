"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import {
  SERVICES_TABLE,
  servicesFormConfig,
  serviceSchema,
  serviceTypeHints,
  Service,
  CreateService,
} from "../config";

const Services = createCrudClient<Service, CreateService>({
  table: SERVICES_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

export default function NewServicePage() {
  const serviceCode = `SRV-${Date.now().toString().slice(-6)}`;

  return (
    <RecordForm
      config={servicesFormConfig as any}
      initialValues={{
        status: "pending",
        service_code: serviceCode,
        toll_cost: 0,
        fuel_cost: 0,
        other_costs: 0,
      }}
      schema={serviceSchema}
      typeHints={serviceTypeHints}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error } = await sb.auth.getUser();

        if (error) throw error;
        if (!user) throw new Error("Usuário não autenticado");

        (values as any).service_code = `SRV-${Date.now().toString().slice(-6)}`;

        delete (values as any).id; // limpar id antes do insert
        const payload: any = { ...values, user_id: user.id };

        await Services.create(payload);
      }}
      backHref="/dashboard/services"
    />
  );
}
