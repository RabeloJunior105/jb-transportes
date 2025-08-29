"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { CreateEmployee } from "@/lib/supabase-crud/types";
import type { Employee } from "@/lib/supabase/types/people.types";
import { employeeFormConfig, schema } from "../config";
import { z } from "zod";

const Employees = createCrudClient<Employee, CreateEmployee>({
  table: "employees",
  select: "*",
  defaultOrder: { column: "updated_at", ascending: false },
});

export type EmployeeFormCpfCep = z.infer<typeof schema>;

export default function NewEmployeePage() {
  return (
    <RecordForm
      config={employeeFormConfig}
      initialValues={{ status: "active" }}
      schema={schema}
      typeHints={{
        hire_date: "date",
        cnh_expiry: "date",
        salary: "number",
      }}
      onSubmit={async (values) => {
        await Employees.create(values as CreateEmployee);
      }}
      backHref="/dashboard/people/employees"
    />
  );
}
