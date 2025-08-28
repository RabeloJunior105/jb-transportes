"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { CreateVehicle, Vehicle, vehicleSchema, vehiclesFormConfig, vehicleTypeHints } from "../config";
import { z } from "zod";

// Tipagem do schema (opcional)
export type VehicleForm = z.infer<typeof vehicleSchema>;

// CRUD client já apontando para vehicles
const Vehicles = createCrudClient<Vehicle, CreateVehicle>({
  table: "vehicles",
  select: "*",
  defaultOrder: { column: "updated_at", ascending: false },
});

export default function NewVehiclePage() {
  return (
    <RecordForm
      config={vehiclesFormConfig}
      initialValues={{ status: "active", mileage: 0 }}
      schema={vehicleSchema}
      typeHints={{
        // se id/user_id puderem aparecer em initialValues (edit), tipa como uuid:
        // id: "uuid",
        // user_id: "uuid",
        ...vehicleTypeHints,
      }}
      onSubmit={async (values) => {
        console.log("Submitting vehicle:", values);
        // RLS: exige user_id = auth.uid()
        delete values.id 
        const sb = createBrowserClient();
        const { data: { user }, error: userErr } = await sb.auth.getUser();

        if (userErr) throw userErr;
        if (!user) throw new Error("Usuário não autenticado");

        const payload: any = { ...values, user_id: user.id };

        // Normalizações opcionais
        if (payload.fuel_type) payload.fuel_type = String(payload.fuel_type).toLowerCase();

        await Vehicles.create(payload as CreateVehicle);
      }}
      backHref="/dashboard/fleet/vehicles"
    />
  );
}
