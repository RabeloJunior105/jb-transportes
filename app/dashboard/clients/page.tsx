"use client"

import { useState } from "react"
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
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react"
import Link from "next/link"

// Mock data for clients
const mockClients = [
  {
    id: "CLI-001",
    nome: "Empresa ABC Ltda",
    tipo: "Pessoa Jurídica",
    documento: "12.345.678/0001-90",
    telefone: "(11) 3333-1111",
    email: "contato@empresaabc.com.br",
    endereco: "Rua das Empresas, 123 - São Paulo/SP",
    status: "Ativo",
    categoria: "Premium",
    totalServicos: 15,
    valorTotal: 45000.0,
    ultimoServico: "2024-01-20",
  },
  {
    id: "CLI-002",
    nome: "Construtora XYZ",
    tipo: "Pessoa Jurídica",
    documento: "23.456.789/0001-01",
    telefone: "(11) 3333-2222",
    email: "logistica@construtoraXYZ.com.br",
    endereco: "Av. Construção, 456 - Campinas/SP",
    status: "Ativo",
    categoria: "Corporativo",
    totalServicos: 8,
    valorTotal: 28000.0,
    ultimoServico: "2024-01-18",
  },
  {
    id: "CLI-003",
    nome: "Alimentos Brasil S.A.",
    tipo: "Pessoa Jurídica",
    documento: "34.567.890/0001-12",
    telefone: "(11) 3333-3333",
    email: "transporte@alimentosbrasil.com.br",
    endereco: "Rod. dos Alimentos, km 15 - Ribeirão Preto/SP",
    status: "Ativo",
    categoria: "Premium",
    totalServicos: 22,
    valorTotal: 78000.0,
    ultimoServico: "2024-01-22",
  },
  {
    id: "CLI-004",
    nome: "João da Silva",
    tipo: "Pessoa Física",
    documento: "123.456.789-01",
    telefone: "(11) 99999-4444",
    email: "joao.silva@email.com",
    endereco: "Rua das Flores, 789 - Sorocaba/SP",
    status: "Ativo",
    categoria: "Particular",
    totalServicos: 3,
    valorTotal: 4500.0,
    ultimoServico: "2024-01-15",
  },
  {
    id: "CLI-005",
    nome: "Loja de Móveis Premium",
    tipo: "Pessoa Jurídica",
    documento: "45.678.901/0001-23",
    telefone: "(11) 3333-5555",
    email: "entregas@moveisPremium.com.br",
    endereco: "Av. dos Móveis, 321 - Guarulhos/SP",
    status: "Inativo",
    categoria: "Corporativo",
    totalServicos: 12,
    valorTotal: 18000.0,
    ultimoServico: "2023-12-10",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Ativo":
      return <Badge className="bg-chart-1 text-white">Ativo</Badge>
    case "Inativo":
      return <Badge variant="outline">Inativo</Badge>
    case "Suspenso":
      return <Badge className="bg-chart-2 text-accent-foreground">Suspenso</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getCategoryBadge = (categoria: string) => {
  const colors = {
    Premium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Corporativo: "bg-blue-100 text-blue-800 border-blue-200",
    Particular: "bg-green-100 text-green-800 border-green-200",
  }

  return (
    <Badge variant="outline" className={colors[categoria as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
      {categoria === "Premium" && <Star className="h-3 w-3 mr-1" />}
      {categoria}
    </Badge>
  )
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.documento.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesCategory = categoryFilter === "all" || client.categoria === categoryFilter
    const matchesType = typeFilter === "all" || client.tipo === typeFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesType
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  const totalClients = mockClients.length
  const activeClients = mockClients.filter((c) => c.status === "Ativo").length
  const premiumClients = mockClients.filter((c) => c.categoria === "Premium").length
  const totalRevenue = mockClients.reduce((sum, c) => sum + c.valorTotal, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes da empresa</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Client Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Premium</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{premiumClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                  placeholder="Buscar por nome, documento ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Corporativo">Corporativo</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pessoa Jurídica">PJ</SelectItem>
                  <SelectItem value="Pessoa Física">PF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>{filteredClients.length} cliente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.nome}</div>
                      <div className="text-xs text-muted-foreground">{client.documento}</div>
                    </TableCell>
                    <TableCell>{client.tipo === "Pessoa Jurídica" ? "PJ" : "PF"}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {client.telefone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]" title={client.email}>
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(client.categoria)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{client.totalServicos} serviços</div>
                        <div className="text-muted-foreground">
                          Último: {new Date(client.ultimoServico).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {client.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
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
                            <MapPin className="mr-2 h-4 w-4" />
                            Ver Endereço
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredClients.length)} de{" "}
                {filteredClients.length} resultados
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
