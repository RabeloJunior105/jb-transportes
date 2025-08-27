"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, Truck, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Vehicle } from "@/lib/supabase/types/vehicle.type"
import { deleteVehicleClient, getVehiclesClient, getVehicleType } from "@/lib/supabase/client/vehicle.client"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-chart-1 text-white">Ativo</Badge>
    case "maintenance":
      return <Badge className="bg-chart-2 text-accent-foreground">Em Manutenção</Badge>
    case "inactive":
      return <Badge className="bg-muted text-muted-foreground">Inativo</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const isHighMileage = (mileage: number) => {
  return mileage > 80000
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const data = await getVehiclesClient()
      setVehicles(data)
    } catch (error) {
      console.error("Error loading vehicles:", error)
      toast.error("Erro ao carregar veículos")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return

    try {
      await deleteVehicleClient(id)
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
      toast.success("Veículo excluído com sucesso")
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      toast.error("Erro ao excluir veículo")
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const vehicleType = getVehicleType(vehicle.capacity)
    const matchesSearch =
      vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicleType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    const matchesType = typeFilter === "all" || vehicleType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage)

  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length
  const highMileageVehicles = vehicles.filter((v) => isHighMileage(v.mileage)).length

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando veículos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão da Frota</h1>
          <p className="text-muted-foreground">Gerencie todos os veículos da empresa</p>
        </div>
        <Link href="/dashboard/fleet/vehicles/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </Link>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
            <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{activeVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
            <div className="h-2 w-2 bg-chart-2 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{maintenanceVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Quilometragem</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{highMileageVehicles}</div>
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
                  placeholder="Buscar por placa, modelo ou marca..."
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
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
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
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Caminhão Pequeno">Caminhão Pequeno</SelectItem>
                  <SelectItem value="Caminhão Baú">Caminhão Baú</SelectItem>
                  <SelectItem value="Caminhão Refrigerado">Caminhão Refrigerado</SelectItem>
                  <SelectItem value="Carreta">Carreta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Veículos</CardTitle>
          <CardDescription>{filteredVehicles.length} veículo(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo/Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Quilometragem</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plate}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{getVehicleType(vehicle.capacity)}</div>
                          <div className="text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.capacity?.toLocaleString()} kg</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{vehicle.mileage?.toLocaleString()} km</div>
                          {isHighMileage(vehicle.mileage) && (
                            <div className="text-chart-2 text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Alta quilometragem
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{vehicle.fuel_type}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
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
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Agendar Manutenção
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredVehicles.length)} de{" "}
                {filteredVehicles.length} resultados
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
