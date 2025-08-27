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
  defaultOrder: { column: "created_at", ascending: false },
});

const schema = z.object({
  // pessoais
  name: z.string().min(2, "Nome muito curto"),
  cpf: z.string().min(11, "CPF inválido"), // ajuste a validação conforme precisar
  phone: z.string().min(8, "Telefone inválido"),
  email: z.string().email().optional().or(z.literal("")),

  // endereço (opcionais)
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.enum(["SP", "RJ", "MG", "RS", "PR", "SC"]).optional(),
  cep: z.string().optional(),

  // profissionais
  position: z.enum(["motorista", "ajudante", "mecanico", "administrativo", "gerente", "diretor"]),
  hire_date: z.string().min(1, "Data de admissão é obrigatória"),
  salary: z.coerce.number().optional(),
  status: z.enum(["active", "vacation", "inactive", "demitido"]),

  // documentos
  cnh_number: z.string().optional(),
  cnh_category: z.enum(["A", "B", "C", "D", "E"]).optional(),
  cnh_expiry: z.string().optional(),
});

export default function NewEmployeePage() {
  return (
    <RecordForm
      config={employeeFormConfig}
      initialValues={{ status: "active" }}
      schema={schema}
      typeHints={{
        hire_date: "date",     // transforma para ISO antes de enviar
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
