"use client";

import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { CreateEmployee, Employee, employeeFormConfig, schema } from "../config";
import { z } from "zod";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

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
        license_expiry: "date",
        salary: "number",
      }}
      onSubmit={async (values) => {
        try {
          const sb = createBrowserClient();
          const { data: { user }, error } = await sb.auth.getUser();
          if (error) throw error;
          if (!user) throw new Error("Usuário não autenticado");

          delete (values as any).id; // não enviar id no insert

          values.license_category = Array.isArray(values.license_category)
            ? values.license_category.join(",")
            : values

          const payload = { ...values, user_id: user.id };

          console.log(payload)
          await Employees.create(payload as CreateEmployee);
        } catch (error) {
          console.log(error)
        }
      }}
      backHref="/dashboard/people/employees"
    />
  );
}
