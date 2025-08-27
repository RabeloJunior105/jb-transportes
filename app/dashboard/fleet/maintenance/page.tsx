"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, Wrench, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

// Mock data for maintenance records
const mockMaintenance = [
  {
    id: "MNT-001",
    veiculo: "ABC-1234",
    tipo: "Preventiva",
    descricao: "Troca de óleo e filtros",
    custo: 450.0,
    dataManutencao: "2024-01-15",
    quilometragem: 85000,
    status: "Concluída",
    oficina: "Oficina Central",
    proximaRevisao: "2024-04-15",
  },
  {
    id: "MNT-002",
    veiculo: "DEF-5678",
    tipo: "Corretiva",
    descricao: "Reparo no sistema de freios",
    custo: 1200.0,
    dataManutencao: "2024-01-20",
    quilometragem: 120000,
    status: "Em Andamento",
    oficina: "Freios & Cia",
    proximaRevisao: "2024-07-20",
  },
  {
    id: "MNT-003",
    veiculo: "GHI-9012",
    tipo: "Preventiva",
    descricao: "Revisão geral dos 45.000 km",
    custo: 800.0,
    dataManutencao: "2024-01-10",
    quilometragem: 45000,
    status: "Concluída",
    oficina: "Oficina Central",
    proximaRevisao: "2024-07-10",
  },
  {
    id: "MNT-004",
    veiculo: "JKL-3456",
    tipo: "Preventiva",
    descricao: "Troca de pneus e alinhamento",
    custo: 950.0,
    dataManutencao: "2024-01-05",
    quilometragem: 25000,
    status: "Concluída",
    oficina: "Pneus Express",
    proximaRevisao: "2024-10-05",
  },
  {
    id: "MNT-005",
    veiculo: "MNO-7890",
    tipo: "Corretiva",
    descricao: "Reparo no sistema elétrico",
    custo: 650.0,
    dataManutencao: "2024-01-25",
    quilometragem: 95000,
    status: "Agendada",
    oficina: "Elétrica Auto",
    proximaRevisao: "2024-04-25",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Concluída":
      return <Badge className="bg-chart-1 text-white">Concluída</Badge>
    case "Em Andamento":
      return <Badge className="bg-chart-2 text-accent-foreground">Em Andamento</Badge>
    case "Agendada":
      return <Badge className="bg-chart-3 text-accent-foreground">Agendada</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getTypeBadge = (tipo: string) => {
  switch (tipo) {
    case "Preventiva":
      return (
        <Badge variant="outline" className="border-chart-1 text-chart-1">
          Preventiva
        </Badge>
      )
    case "Corretiva":
      return (
        <Badge variant="outline" className="border-chart-4 text-chart-4">
          Corretiva
        </Badge>
      )
    default:
      return <Badge variant="outline">{tipo}</Badge>
  }
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredMaintenance = mockMaintenance.filter((maintenance) => {
    const matchesSearch =
      maintenance.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maintenance.oficina.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || maintenance.status === statusFilter
    const matchesType = typeFilter === "all" || maintenance.tipo === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredMaintenance.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMaintenance = filteredMaintenance.slice(startIndex, startIndex + itemsPerPage)

  const totalCost = mockMaintenance.reduce((sum, m) => sum + m.custo, 0)
  const preventiveCost = mockMaintenance.filter((m) => m.tipo === "Preventiva").reduce((sum, m) => sum + m.custo, 0)
  const correctiveCost = mockMaintenance.filter((m) => m.tipo === "Corretiva").reduce((sum, m) => sum + m.custo, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manutenção da Frota</h1>
          <p className="text-muted-foreground">Gerencie todas as manutenções dos veículos</p>
        </div>
        <Link href="/dashboard/fleet/maintenance/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Manutenção
          </Button>
        </Link>
      </div>

      {/* Maintenance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMaintenance.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preventiva</CardTitle>
            <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              R$ {preventiveCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corretiva</CardTitle>
            <div className="h-2 w-2 bg-chart-4 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">
              R$ {correctiveCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Buscar por veículo, descrição ou oficina..."
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
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Agendada">Agendada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Manutenções</CardTitle>
          <CardDescription>{filteredMaintenance.length} manutenção(ões) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaintenance.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell className="font-medium">{maintenance.id}</TableCell>
                    <TableCell>{maintenance.veiculo}</TableCell>
                    <TableCell>{getTypeBadge(maintenance.tipo)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={maintenance.descricao}>
                        {maintenance.descricao}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(maintenance.dataManutencao).toLocaleDateString("pt-BR")}</div>
                        <div className="text-muted-foreground">{maintenance.quilometragem.toLocaleString()} km</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {maintenance.custo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
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
                            <Calendar className="mr-2 h-4 w-4" />
                            Reagendar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredMaintenance.length)} de{" "}
                {filteredMaintenance.length} resultados
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
