"use client";

import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { z } from "zod";

import {
  FUEL_TABLE,
  fuelSchema,
  fuelFormConfig,
  fuelTypeHints,
  Fuel as FuelType,
  CreateFuel,
} from "../config";
import RecordForm from "@/components/RecordForm";

// Tipagem do schema (opcional)
export type FuelFormType = z.infer<typeof fuelSchema>;

// CRUD client apontando para fuels
const FuelCrud = createCrudClient<FuelType, CreateFuel>({
  table: FUEL_TABLE,
  select: "*",
  defaultOrder: { column: "fuel_date", ascending: false },
});

export default function NewFuelPage() {
  return (
    <RecordForm
      config={fuelFormConfig}
      initialValues={{
        fuel_date: new Date().toISOString(),
      }}
      schema={fuelSchema}
      typeHints={{
        ...fuelTypeHints,
      }}
      onSubmit={async (values) => {
        const sb = createBrowserClient();
        const { data: { user }, error: userErr } = await sb.auth.getUser();
        if (userErr) throw userErr;
        if (!user) throw new Error("Usuário não autenticado");

        const liters = Number(values.liters ?? 0);
        const ppl = Number(values.price_per_liter ?? 0);
        const total = values.total_cost ? Number(values.total_cost) : liters * ppl;

        const payload: CreateFuel = {
          vehicle_id: values.vehicle_id,
          driver_id: values.driver_id || null,
          supplier_id: values.supplier_id || null,
          fuel_type: values.fuel_type,
          liters,
          price_per_liter: ppl,
          total_cost: total,
          mileage: values.mileage ?? null,
          fuel_date: new Date(values.fuel_date as unknown as string | Date).toISOString(),
          location: values.location || null,
          user_id: user.id
        };

        await FuelCrud.create({ ...payload, /* user_id: user.id */ } as any);
      }}
      backHref="/dashboard/fleet/fuel"
    />
  );
}
