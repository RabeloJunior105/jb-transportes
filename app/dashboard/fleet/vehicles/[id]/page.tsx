"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import RecordForm from "@/components/RecordForm/form.record";
import { UpdateVehicle, Vehicle, vehiclesFormConfig, vehicleTypeHints } from "../config";

const Vehicles = createCrudClient<Vehicle, any>({
  table: "vehicles",
  select: "*",
  defaultOrder: { column: "created_at", ascending: false },
});

export default function EditVehiclePage() {
  const params = useParams() as { id: string };
  const [initial, setInitial] = useState<Vehicle | null>(null);

  useEffect(() => {
    (async () => {
      const data = await Vehicles.getById(params.id);
      setInitial(data);
    })();
  }, [params.id]);

  if (!initial) return <div className="p-6">Carregando…</div>;

  return (
    <RecordForm
      config={vehiclesFormConfig}
      initialValues={initial}
      // schema={vehicleSchema} // <- se quiser validar no edit também, descomente
      typeHints={{
        id: "uuid",
        user_id: "uuid",
        ...vehicleTypeHints, // year, capacity, mileage, created_at, updated_at
      }}
      onSubmit={async (values: any) => {
        // normalização simples (mantém enum coerente)
        if (typeof values.fuel_type === "string") {
          values.fuel_type = values.fuel_type.toLowerCase();
        }

        // monta patch só com campos alterados
        const patch: UpdateVehicle = {};
        for (const k of Object.keys(values)) {
          const newVal = (values as any)[k];
          const oldVal = (initial as any)[k];
          if (newVal !== undefined && newVal !== oldVal) {
            (patch as any)[k] = newVal;
          }
        }

        if (Object.keys(patch).length === 0) {
          // nada mudou — evita ida ao banco
          return;
        }

        await Vehicles.update(initial.id, patch);
      }}
      backHref="/dashboard/fleet/vehicles"
    />
  );
}
