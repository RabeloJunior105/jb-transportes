"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { Employee, UpdateEmployee } from "@/lib/supabase-crud/types";
import RecordForm from "@/components/RecordForm/form.record";
import { employeeFormConfig } from "../config";

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
        cnh_expiry: "date",
        salary: "number",
      }}
      onSubmit={async (values: any) => {
        // monta patch só com campos alterados (opcional)
        const patch: UpdateEmployee = {};
        for (const k of Object.keys(values)) {
          if ((values as any)[k] !== (initial as any)[k]) {
            (patch as any)[k] = (values as any)[k];
          }
        }
        await Employees.update(initial.id, patch);
      }}
      backHref="/dashboard/people/employees"
    />
  );
}
