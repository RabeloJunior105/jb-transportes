"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Search, Plus, MoreHorizontal, Edit, Trash2, Phone, Mail } from "lucide-react"
import Link from "next/link"

// Mock data for suppliers
const suppliersData = [
  {
    id: 1,
    name: "Auto Peças Silva",
    cnpj: "12.345.678/0001-90",
    contact: "João Silva",
    phone: "(11) 98765-4321",
    email: "joao@autopecassilva.com.br",
    category: "Peças",
    status: "Ativo",
    city: "São Paulo",
    state: "SP",
  },
  {
    id: 2,
    name: "Posto Combustível Central",
    cnpj: "98.765.432/0001-10",
    contact: "Maria Santos",
    phone: "(11) 91234-5678",
    email: "maria@postocentral.com.br",
    category: "Combustível",
    status: "Ativo",
    city: "Campinas",
    state: "SP",
  },
  {
    id: 3,
    name: "Oficina Mecânica Rápida",
    cnpj: "11.222.333/0001-44",
    contact: "Carlos Oliveira",
    phone: "(11) 95555-1234",
    email: "carlos@oficinarapida.com.br",
    category: "Manutenção",
    status: "Inativo",
    city: "Santos",
    state: "SP",
  },
]

const statusColors = {
  Ativo: "bg-green-100 text-green-800 border-green-200",
  Inativo: "bg-red-100 text-red-800 border-red-200",
}

const categoryColors = {
  Peças: "bg-blue-100 text-blue-800 border-blue-200",
  Combustível: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Manutenção: "bg-purple-100 text-purple-800 border-purple-200",
}

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredSuppliers = suppliersData.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cnpj.includes(searchTerm) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">Gerencie os fornecedores da empresa</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/suppliers/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersData.length}</div>
            <p className="text-xs text-muted-foreground">Fornecedores cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {suppliersData.filter((s) => s.status === "Ativo").length}
            </div>
            <p className="text-xs text-muted-foreground">Em operação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{new Set(suppliersData.map((s) => s.category)).size}</div>
            <p className="text-xs text-muted-foreground">Tipos diferentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{new Set(suppliersData.map((s) => s.state)).size}</div>
            <p className="text-xs text-muted-foreground">Regiões atendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Use os filtros abaixo para encontrar fornecedores específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ ou contato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Peças">Peças</SelectItem>
                <SelectItem value="Combustível">Combustível</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>{filteredSuppliers.length} fornecedor(es) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome/CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">{supplier.cnpj}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.contact}</div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{supplier.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[supplier.category as keyof typeof categoryColors]}>
                      {supplier.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.city}</div>
                      <div className="text-sm text-muted-foreground">{supplier.state}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[supplier.status as keyof typeof statusColors]}>
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  )
}
