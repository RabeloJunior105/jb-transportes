"use client";


import RecordForm from "@/components/RecordForm/form.record";
import { createCrudClient } from "@/lib/supabase-crud/client/client";
import { CreateEmployee } from "@/lib/supabase-crud/types";
import type { Employee } from "@/lib/supabase/types/people.types";
import { z } from "zod";
import { employeeFormConfig } from "../config";

const Employees = createCrudClient<Employee, CreateEmployee>({
  table: "employees",
  select: "*",
  defaultOrder: { column: "updated_at", ascending: false },
});

export const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().min(8, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),

  address: z.string().optional(),
  city: z.string().optional(),
  state: z.enum(["SP", "RJ", "MG", "RS", "PR", "SC"], {
    errorMap: () => ({ message: "Selecione um estado válido (SP, RJ, MG, RS, PR ou SC)" }),
  }).optional(),
  cep: z.string().optional(),

  position: z.enum(["motorista", "ajudante", "mecanico", "administrativo", "gerente", "diretor"], {
    errorMap: () => ({ message: "Selecione um cargo válido" }),
  }),
  hire_date: z.string().min(1, "Data de admissão é obrigatória"), // obrigatório: mantém string

  salary: z.coerce.number().optional(),
  status: z.enum(["active", "vacation", "inactive", "demitido"], {
    errorMap: () => ({ message: "Selecione um status válido" }),
  }),

  cnh_number: z.string().optional(),
  cnh_category: z.enum(["A", "B", "C", "D", "E"], {
    errorMap: () => ({ message: "Categoria de CNH inválida (A, B, C, D ou E)" }),
  }).optional(),
  cnh_expiry: z.string().optional().nullable(),
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
