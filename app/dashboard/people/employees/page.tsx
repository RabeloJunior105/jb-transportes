"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, CheckCircle, AlertTriangle, CreditCard, Eye, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Employee } from "@/lib/supabase/types/people.types";
import { isLicenseExpired, isLicenseExpiring, getSummaryEmployees } from "@/lib/supabase/client/people.client";
import { RecordList } from "@/components/ListForm/record-list";
import { SummaryCards } from "@/components/SummaryCards/summary-cards";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { makeFetchDataClient } from "@/lib/utils/makeFetchDataClient";

const EMPLOYEE_SELECT = "*"; // ajuste se tiver relações (ex: "*, department(name)")

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-chart-1 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      );
    case "vacation":
      return <Badge className="bg-chart-2 text-accent-foreground">Férias</Badge>;
    case "leave":
      return <Badge className="bg-chart-3 text-accent-foreground">Afastado</Badge>;
    case "inactive":
      return <Badge variant="outline">Inativo</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Adaptador: busca, filtros, ordenação e paginação direto no Supabase
const fetchEmployees = makeFetchDataClient<Employee>({
  table: "employees",
  select: EMPLOYEE_SELECT,
  defaultOrder: { column: "created_at", ascending: false },
  searchFields: ["name", "email", "phone", "document"], // campos para ilike OR
  filterMap: {
    status: "status",
    position: "position",
  },
});

// Delete direto no Supabase (client-side). Se preferir, use server action ou soft-delete.
async function deleteEmployeeClient(id: string) {
  const sb = createBrowserClient();
  const { error } = await sb.from("employees").delete().eq("id", id);
  if (error) throw error;
}

export default function EmployeesPage() {
  const [_, setRefreshKey] = useState(0); // simples gatilho para recarregar RecordList se precisar

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Deseja realmente excluir ${employee.name}?`)) return;
    try {
      await deleteEmployeeClient(employee.id);
      toast.success("Funcionário excluído com sucesso");
      // dica: se quiser forçar reload, altere algum state que você passe pro RecordList (ex.: key)
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir funcionário");
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Funcionários</h1>
          <p className="text-muted-foreground">Gerencie todos os colaboradores da empresa</p>
        </div>
        <Link href="/dashboard/people/employees/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      {/* Summary Cards (mantidos) */}
      <SummaryCards
        fetchData={getSummaryEmployees}
        cards={[
          { title: "Total de Funcionários", icon: <Users />, valueKey: "totalEmployees" },
          { title: "Funcionários Ativos", icon: <CheckCircle />, valueKey: "activeEmployees", colorClass: "text-chart-1" },
          { title: "Motoristas", icon: <CreditCard />, valueKey: "drivers", colorClass: "text-chart-3" },
          { title: "CNH Vencendo", icon: <AlertTriangle />, valueKey: "licenseExpiring", colorClass: "text-chart-2" },
        ]}
      />

      {/* RecordList — agora usando fetchEmployees (Supabase faz o trabalho pesado) */}
      <RecordList<Employee>
        title="Lista de Funcionários"
        description={`Funcionários encontrados`}
        itemsPerPage={10}
        fetchData={fetchEmployees}
        filters={[
          {
            name: "status",
            label: "Status",
            options: [
              { label: "Ativo", value: "active" },
              { label: "Férias", value: "vacation" },
              { label: "Afastado", value: "leave" },
              { label: "Inativo", value: "inactive" },
            ],
          },
          {
            name: "position",
            label: "Cargo",
            options: [
              { label: "Motorista", value: "Motorista" },
              { label: "Coordenador", value: "Coordenador" },
              { label: "Mecânico", value: "Mecânico" },
              { label: "Administrativo", value: "Administrativo" },
            ],
          },
        ]}
        fields={[
          {
            name: "name",
            label: "Nome",
            type: "text",
            render: (_: any, row: Employee) => (
              <div>
                {row.name}
                <br />
                <span className="text-xs text-muted-foreground">{(row as any).document}</span>
              </div>
            ),
          },
          { name: "position", label: "Cargo", type: "text" },
          {
            name: "contact",
            label: "Contato",
            type: "text",
            render: (_: any, row: Employee) => (
              <div>
                {(row as any).phone}
                <br />
                {(row as any).email}
              </div>
            ),
          },
          {
            name: "license",
            label: "CNH",
            type: "text",
            render: (_: any, row: Employee) => (
              <div>
                {(row as any).license_number || "N/A"}
                <br />
                Categoria {(row as any).license_category || "N/A"}
              </div>
            ),
          },
          {
            name: "license_expiry",
            label: "Vencimento CNH",
            type: "date",
            render: (_: any, row: Employee) => {
              const exp = (row as any).license_expiry;
              if (!exp) return "N/A";
              const date = new Date(exp).toLocaleDateString("pt-BR");
              if (isLicenseExpired(exp)) return <span className="text-destructive">{date} (Vencida)</span>;
              if (isLicenseExpiring(exp)) return <span className="text-chart-2">{date} (Vencendo)</span>;
              return date;
            },
          },
          {
            name: "status",
            label: "Status",
            type: "badge",
            render: (_: any, row: Employee) => getStatusBadge((row as any).status as string),
          },
        ]}
        actions={[
          { label: "Visualizar", icon: <Eye className="h-4 w-4" />, href: (row) => `/dashboard/people/employees/${row.id}` },
          { label: "Editar", icon: <Edit className="h-4 w-4" />, href: (row) => `/dashboard/people/employees/${row.id}` },
          { label: "Excluir", icon: <Trash2 className="h-4 w-4" />, color: "destructive", onClick: handleDelete },
        ]}
      />
    </div>
  );
}
