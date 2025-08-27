"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Service } from "@/lib/supabase/types/services.type"
import { deleteServiceClient, getServicesClient } from "@/lib/supabase/client/service.client"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Concluído":
    case "completed":
      return <Badge className="bg-chart-1 text-white">Concluído</Badge>
    case "Em Andamento":
    case "in_progress":
      return <Badge className="bg-chart-2 text-accent-foreground">Em Andamento</Badge>
    case "Cancelado":
    case "cancelled":
      return <Badge className="bg-destructive text-destructive-foreground">Cancelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await getServicesClient()
      setServices(data)
    } catch (error) {
      console.error("Error loading services:", error)
      toast.error("Erro ao carregar serviços")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return

    try {
      await deleteServiceClient(id)
      setServices(services.filter((service) => service.id !== id))
      toast.success("Serviço excluído com sucesso")
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Erro ao excluir serviço")
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.service_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || service.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando serviços...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Serviços</h1>
          <p className="text-muted-foreground">Gerencie todos os serviços de transporte</p>
        </div>
        <Link href="/dashboard/services/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </Link>
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
                  placeholder="Buscar por código, descrição, local ou cliente..."
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
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>{filteredServices.length} serviço(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum serviço encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.service_code}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(service.collection_date).toLocaleDateString("pt-BR")}</div>
                          {service.delivery_date && (
                            <div className="text-muted-foreground">
                              Entrega: {new Date(service.delivery_date).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={service.description}>
                          {service.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{service.origin}</div>
                          <div className="text-muted-foreground">→ {service.destination}</div>
                        </div>
                      </TableCell>
                      <TableCell>{service.clients?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            R$ {service.service_value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                          </div>
                          <div className="text-muted-foreground">
                            Pedágio: R${" "}
                            {service.toll_cost?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
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
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteService(service.id)}
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredServices.length)} de{" "}
                {filteredServices.length} resultados
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
