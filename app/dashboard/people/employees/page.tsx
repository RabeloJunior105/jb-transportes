"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  CreditCard,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Employee } from "@/lib/supabase/types/people.types"
import { deleteEmployeeClient, getEmployeesClient, isLicenseExpired, isLicenseExpiring } from "@/lib/supabase/client/people.client"


const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-chart-1 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      )
    case "vacation":
      return <Badge className="bg-chart-2 text-accent-foreground">Férias</Badge>
    case "leave":
      return <Badge className="bg-chart-3 text-accent-foreground">Afastado</Badge>
    case "inactive":
      return <Badge variant="outline">Inativo</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployeesClient()
      setEmployees(data)
    } catch (error) {
      console.error("Error loading employees:", error)
      toast.error("Erro ao carregar funcionários")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return

    try {
      await deleteEmployeeClient(id)
      setEmployees(employees.filter((employee) => employee.id !== id))
      toast.success("Funcionário excluído com sucesso")
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast.error("Erro ao excluir funcionário")
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone?.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    const matchesPosition = positionFilter === "all" || employee.position === positionFilter

    return matchesSearch && matchesStatus && matchesPosition
  })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage)

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.status === "active").length
  const driversCount = employees.filter((e) => e.position?.toLowerCase().includes("motorista")).length
  const expiringLicenses = employees.filter(
    (e) => isLicenseExpiring(e.license_expiry) || isLicenseExpired(e.license_expiry),
  ).length

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando funcionários...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

      {/* Employee Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motoristas</CardTitle>
            <CreditCard className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{driversCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CNH Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{expiringLicenses}</div>
          </CardContent>
        </Card>
      </div>

      {/* CNH Expiry Alert */}
      {expiringLicenses > 0 && (
        <Card className="border-chart-2/50 bg-chart-2/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-chart-2">
              <AlertTriangle className="h-5 w-5" />
              Alerta de CNH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {expiringLicenses} funcionário(s) com CNH vencendo ou vencida. Verifique a lista abaixo e tome as
              providências necessárias.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="leave">Afastado</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Cargos</SelectItem>
                  <SelectItem value="Motorista">Motorista</SelectItem>
                  <SelectItem value="Coordenador">Coordenador</SelectItem>
                  <SelectItem value="Mecânico">Mecânico</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>{filteredEmployees.length} funcionário(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Vencimento CNH</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground">{employee.document}</div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {employee.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]" title={employee.email}>
                              {employee.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{employee.license_number || "N/A"}</div>
                          <div className="text-muted-foreground">Categoria {employee.license_category || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {employee.license_expiry
                              ? new Date(employee.license_expiry).toLocaleDateString("pt-BR")
                              : "N/A"}
                          </div>
                          {isLicenseExpired(employee.license_expiry) && (
                            <div className="text-destructive text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Vencida
                            </div>
                          )}
                          {isLicenseExpiring(employee.license_expiry) && !isLicenseExpired(employee.license_expiry) && (
                            <div className="text-chart-2 text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Vencendo
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Renovar CNH
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} de{" "}
                {filteredEmployees.length} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}