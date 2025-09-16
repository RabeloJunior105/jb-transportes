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
import { CreateReceivable, Receivable } from "../../finance/receivable/config";
import { CreatePayable, Payable } from "../../finance/payable/config";

const Services = createCrudClient<Service, CreateService>({
  table: SERVICES_TABLE,
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

const AccountsReceivable = createCrudClient<Receivable, CreateReceivable>({
  table: "accounts_receivable",
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

const Payables = createCrudClient<Payable, CreatePayable>({
  table: "accounts_payable",
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

        const service = await Services.create(payload);

        console.log("user,", payload, service)
        await AccountsReceivable.create({
          service_id: service?.id,
          client_id: payload.client_id,
          description: "Recebível gerado a partir do serviço", // 👈 obrigatório
          amount: payload.service_value ?? 0,
          due_date: new Date().toISOString(),
          status: "pending",
          user_id: payload.user_id
        });

        const payables: CreatePayable[] = [];

        if (payload.fuel_cost && payload.fuel_cost > 0) {
          payables.push({
            description: `Combustível - Serviço ${service?.service_code}`,
            category: "fuel",
            amount: payload.fuel_cost,
            due_date: new Date().toISOString(),
            status: "pending",
          });
        }

        if (payload.toll_cost && payload.toll_cost > 0) {
          payables.push({
            description: `Pedágio - Serviço ${service?.service_code}`,
            category: "toll",
            amount: payload.toll_cost,
            due_date: new Date().toISOString(),
            status: "pending",
          });
        }

        if (payload.other_costs && payload.other_costs > 0) {
          payables.push({
            description: `Outros custos - Serviço ${service?.service_code}`,
            category: "other",
            amount: payload.other_costs,
            due_date: new Date().toISOString(),
            status: "pending",
          });
        }

        // salva todos os payables
        for (const p of payables) {
          await Payables.create({ ...p, user_id: user.id });
        }

      }}
      backHref="/dashboard/services"
    />
  );
}
