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
  Fuel,
  TrendingUp,
  BarChart3,
  Calendar,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { FuelRecord } from "@/lib/supabase/types/maintence.type"
import { calculateConsumption, deleteFuelClient, getFuelClient, getFuelTypeLabel } from "@/lib/supabase/client/fuel.client"

const getFuelTypeBadge = (tipo: string) => {
  const colors = {
    diesel: "bg-blue-100 text-blue-800 border-blue-200",
    gasoline: "bg-green-100 text-green-800 border-green-200",
    ethanol: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cng: "bg-purple-100 text-purple-800 border-purple-200",
  }

  return (
    <Badge variant="outline" className={colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
      {getFuelTypeLabel(tipo)}
    </Badge>
  )
}

const getConsumptionColor = (consumo: number, tipoCombustivel: string) => {
  // Diesel: bom < 3.5, médio 3.5-4.5, ruim > 4.5
  // Gasolina: bom < 9, médio 9-12, ruim > 12
  if (tipoCombustivel === "diesel") {
    if (consumo < 3.5) return "text-chart-1"
    if (consumo <= 4.5) return "text-chart-2"
    return "text-destructive"
  } else {
    if (consumo < 9) return "text-chart-1"
    if (consumo <= 12) return "text-chart-2"
    return "text-destructive"
  }
}

export default function FuelPage() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadFuelRecords()
  }, [])

  const loadFuelRecords = async () => {
    try {
      setLoading(true)
      const data = await getFuelClient()
      setFuelRecords(data)
    } catch (error) {
      console.error("Error loading fuel records:", error)
      toast.error("Erro ao carregar registros de combustível")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return

    try {
      await deleteFuelClient(id)
      setFuelRecords(fuelRecords.filter((record) => record.id !== id))
      toast.success("Registro excluído com sucesso")
    } catch (error) {
      console.error("Error deleting fuel record:", error)
      toast.error("Erro ao excluir registro")
    }
  }

  const filteredRecords = fuelRecords.filter((record) => {
    const matchesSearch =
      record.vehicles?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVehicle = vehicleFilter === "all" || record.vehicles?.plate === vehicleFilter
    const matchesFuelType = fuelTypeFilter === "all" || record.fuel_type === fuelTypeFilter

    return matchesSearch && matchesVehicle && matchesFuelType
  })

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage)

  const totalLiters = fuelRecords.reduce((sum, r) => sum + r.liters, 0)
  const totalCost = fuelRecords.reduce((sum, r) => sum + r.total_cost, 0)
  const averageConsumption =
    fuelRecords.length > 0
      ? fuelRecords.reduce((sum, r, index, arr) => {
        if (index === 0) return sum
        const prevRecord = arr[index - 1]
        const consumption = calculateConsumption(prevRecord.mileage, r.mileage, r.liters)
        return sum + consumption
      }, 0) / Math.max(fuelRecords.length - 1, 1)
      : 0
  const totalRefuels = fuelRecords.length

  const uniqueVehicles = Array.from(new Set(fuelRecords.map((r) => r.vehicles?.plate).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando registros de combustível...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Combustível</h1>
          <p className="text-muted-foreground">Gerencie todos os abastecimentos da frota</p>
        </div>
        <Link href="/dashboard/fuel/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Abastecimento
          </Button>
        </Link>
      </div>

      {/* Fuel Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Litros</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLiters.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}L
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{averageConsumption.toFixed(1)} km/L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRefuels}</div>
            <p className="text-xs text-muted-foreground">Total</p>
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
                  placeholder="Buscar por veículo ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Veículos</SelectItem>
                  {uniqueVehicles.map((plate) => (
                    <SelectItem key={plate} value={plate!}>
                      {plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="diesel">Diesel S10</SelectItem>
                  <SelectItem value="gasoline">Gasolina</SelectItem>
                  <SelectItem value="ethanol">Etanol</SelectItem>
                  <SelectItem value="cng">GNV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuel Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <CardDescription>{filteredRecords.length} abastecimento(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Quilometragem</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(record.fuel_date).toLocaleDateString("pt-BR")}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.vehicles?.plate || "N/A"}
                        <div className="text-xs text-muted-foreground">
                          {record.vehicles?.brand} {record.vehicles?.model}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={record.location}>
                          {record.location}
                        </div>
                        {record.suppliers?.name && (
                          <div className="text-xs text-muted-foreground">{record.suppliers.name}</div>
                        )}
                      </TableCell>
                      <TableCell>{getFuelTypeBadge(record.fuel_type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{record.liters.toFixed(1)}L</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          R$ {record.total_cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-muted-foreground">R$ {record.price_per_liter.toFixed(2)}/L</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.mileage.toLocaleString()} km</div>
                      </TableCell>
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
                              onClick={() => handleDeleteRecord(record.id)}
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
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRecords.length)} de{" "}
                {filteredRecords.length} resultados
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
