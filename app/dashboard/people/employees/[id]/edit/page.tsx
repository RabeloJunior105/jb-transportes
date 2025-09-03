"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import RecordForm from "@/components/RecordForm/form.record";
import { Employee, employeeFormConfig, UpdateEmployee } from "../../config";

const Employees = createCrudClient<Employee, any>({
    table: "employees",
    select: "*",
    defaultOrder: { column: "created_at", ascending: false },
});

export default function EditEmployeePage() {
    const params = useParams() as { id: string };
    const [initial, setInitial] = useState<Employee | null>(null);

    useEffect(() => {
        (async () => {
            const data = await Employees.getById(params.id);
            setInitial(data);
        })();
    }, [params.id]);

    if (!initial) return <div className="p-6">Carregando…</div>;

    return (
        <RecordForm
            config={employeeFormConfig}
            initialValues={initial}
            typeHints={{
                hire_date: "date",
                license_expiry: "date",
                salary: "number",
            }}
            onSubmit={async (values: any) => {
                const patch: UpdateEmployee = {};

                for (const k of Object.keys(values)) {
                    const newVal = (values as any)[k];
                    const oldVal = (initial as any)[k];

                    // caso especial: cnh_category (array)
                    if (k === "license_category") {
                        const arr = Array.isArray(newVal) ? newVal : [];
                        const joined = arr.length ? arr.join(",") : null;
                        const oldJoined = initial.license_category ?? null;

                        if (joined !== oldJoined) {
                            (patch as any).license_category = joined;
                        }
                    } else if (newVal !== oldVal) {
                        (patch as any)[k] = newVal;
                    }
                }

                if (Object.keys(patch).length === 0) {
                    console.log("Nenhuma alteração detectada");
                    return;
                }

                await Employees.update(initial.id, patch);
            }}
            backHref="/dashboard/people/employees"
        />
    );
}
