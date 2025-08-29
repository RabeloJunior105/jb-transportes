"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

import {
    FUEL_TABLE,
    fuelSchema,
    fuelFormConfig,
    fuelTypeHints,
    Fuel as FuelType,
    UpdateFuel,
} from "../../config";

const FuelCrud = createCrudClient<FuelType, UpdateFuel>({
    table: FUEL_TABLE,
    select: "*",
    defaultOrder: { column: "updated_at", ascending: false },
});

export default function FuelDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [record, setRecord] = useState<FuelType | null>(null);

    useEffect(() => {
        (async () => {
            const sb = createBrowserClient();
            const { data, error } = await sb.from(FUEL_TABLE).select("*").eq("id", id).single();
            if (error) {
                console.log(error);
                toast.error("Erro ao carregar abastecimento");
            } else {
                setRecord(data as FuelType);
            }
            setLoading(false);
        })();
    }, [id]);

    if (loading) return null; // ou skeleton

    if (!record) {
        return <div className="p-6">Registro não encontrado.</div>;
    }

    return (
        <RecordForm
            config={fuelFormConfig}
            initialValues={{
                ...record,
                fuel_date: record.fuel_date,
            }}
            schema={fuelSchema}
            typeHints={fuelTypeHints}
            onSubmit={async (values) => {
                // recalcula total se necessário
                const liters = Number(values.liters ?? record.liters ?? 0);
                const ppl = Number(values.price_per_liter ?? record.price_per_liter ?? 0);
                const total = values.total_cost ? Number(values.total_cost) : liters * ppl;

                const payload: UpdateFuel = {
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
                };

                await FuelCrud.update(id, payload);
                toast.success("Abastecimento atualizado");
                router.refresh();
            }}
            backHref="/dashboard/fleet/fuel"
        />
    );
}
