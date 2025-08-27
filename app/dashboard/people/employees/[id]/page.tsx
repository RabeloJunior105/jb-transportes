"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import RecordForm from "@/components/RecordForm/form.record"
import { getEmployeeClient, updateEmployeeClient } from "@/lib/supabase/client/people.client"

const employeeFormConfig = {
  title: "Funcionário",
  description: "Gerencie os dados do funcionário",
  groups: [
    {
      title: "Informações Pessoais",
      description: "Dados pessoais do funcionário",
      fields: [
        { name: "name", label: "Nome Completo", type: "text" as const, required: true },
        { name: "cpf", label: "CPF", type: "text" as const, required: true },
        { name: "phone", label: "Telefone", type: "text" as const, required: true },
        { name: "email", label: "E-mail", type: "email" as const },
      ],
    },
    {
      title: "Endereço",
      description: "Endereço residencial do funcionário",
      fields: [
        { name: "address", label: "Endereço", type: "text" as const },
        { name: "city", label: "Cidade", type: "text" as const },
        {
          name: "state",
          label: "Estado",
          type: "select" as const,
          options: ["SP", "RJ", "MG", "RS", "PR", "SC"].map(uf => ({ label: uf, value: uf }))
        },
        { name: "cep", label: "CEP", type: "text" as const },
      ],
    },
    {
      title: "Informações Profissionais",
      description: "Dados relacionados ao trabalho",
      fields: [
        {
          name: "position",
          label: "Cargo",
          type: "select" as const,
          required: true,
          options: [
            { label: "Motorista", value: "motorista" },
            { label: "Ajudante", value: "ajudante" },
            { label: "Mecânico", value: "mecanico" },
            { label: "Administrativo", value: "administrativo" },
            { label: "Gerente", value: "gerente" },
            { label: "Diretor", value: "diretor" },
          ],
        },
        { name: "hire_date", label: "Data de Admissão", type: "date" as const, required: true },
        { name: "salary", label: "Salário", type: "number" as const },
        {
          name: "status",
          label: "Status",
          type: "select" as const,
          required: true,
          options: [
            { label: "Ativo", value: "active" },
            { label: "Férias", value: "vacation" },
            { label: "Afastado", value: "inactive" },
            { label: "Demitido", value: "demitido" },
          ],
        },
      ],
    },
    {
      title: "Documentos",
      description: "CNH e outros documentos",
      fields: [
        { name: "cnh_number", label: "Número da CNH", type: "text" as const },
        {
          name: "cnh_category",
          label: "Categoria CNH",
          type: "select" as const,
          options: ["A", "B", "C", "D", "E"].map(c => ({ label: c, value: c }))
        },
        { name: "cnh_expiry", label: "Vencimento CNH", type: "date" as const },
      ],
    },
  ],
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [employee, setEmployee] = useState<any>(null)

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const data = await getEmployeeClient(id)
        // Mapear campos do payload para o formulário
        const mapped = {
          ...data,
          cpf: data.document,
          cep: data.zip_code,
          cnh_number: data.license_number,
          cnh_category: data.license_category,
          cnh_expiry: data.license_expiry,
        }
        setEmployee(mapped)
      } catch {
        toast.error("Erro ao carregar funcionário.")
      }
    }
    fetchEmployee()
  }, [id])

  const handleSubmit = async (values: any) => {
    try {
      // Mapear de volta para os nomes do backend
      const payload = {
        ...values,
        document: values.cpf,
        zip_code: values.cep,
        license_number: values.cnh_number,
        license_category: values.cnh_category,
        license_expiry: values.cnh_expiry,
      }
      await updateEmployeeClient(id, payload)
      toast.success("Funcionário atualizado com sucesso!")
      router.push("/dashboard/people/employees")
    } catch {
      toast.error("Erro ao atualizar funcionário.")
    }
  }

  if (!employee) return <div className="p-8">Carregando...</div>

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <RecordForm
        config={employeeFormConfig}
        initialValues={employee}
        onSubmit={handleSubmit}
        backHref="/dashboard/people/employees"
      />
    </div>
  )
}
