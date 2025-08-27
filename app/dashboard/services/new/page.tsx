"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CreateServiceData } from "@/lib/supabase/types/services.type"
import { createServiceClient } from "@/lib/supabase/client/service.client"

interface Client {
  id: string
  name: string
}

interface Vehicle {
  id: string
  plate: string
  model: string
  brand: string
}

interface Employee {
  id: string
  name: string
  position: string
}

export default function NewServicePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    service_code: "",
    collection_date: "",
    delivery_date: "",
    origin: "",
    destination: "",
    description: "",
    service_value: "",
    toll_cost: "",
    fuel_cost: "",
    other_costs: "",
    status: "in_progress",
    client_id: "",
    vehicle_id: "",
    driver_id: "",
  })

  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    loadRelatedData()
  }, [])

  const loadRelatedData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Usuário não autenticado")
        router.push("/login")
        return
      }

      // Load clients, vehicles, and employees
      const [clientsResult, vehiclesResult, employeesResult] = await Promise.all([
        supabase.from("clients").select("id, name").eq("user_id", user.id).eq("status", "active"),
        supabase.from("vehicles").select("id, plate, model, brand").eq("user_id", user.id).eq("status", "active"),
        supabase.from("employees").select("id, name, position").eq("user_id", user.id).eq("status", "active"),
      ])

      if (clientsResult.data) setClients(clientsResult.data)
      if (vehiclesResult.data) setVehicles(vehiclesResult.data)
      if (employeesResult.data) setEmployees(employeesResult.data)

      // Generate service code
      const serviceCode = `SRV-${Date.now().toString().slice(-6)}`
      setFormData((prev) => ({ ...prev, service_code: serviceCode }))
    } catch (error) {
      console.error("Error loading related data:", error)
      toast.error("Erro ao carregar dados")
    } finally {
      setDataLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const serviceData: CreateServiceData = {
        service_code: formData.service_code,
        collection_date: formData.collection_date,
        delivery_date: formData.delivery_date || undefined,
        origin: formData.origin,
        destination: formData.destination,
        description: formData.description,
        service_value: Number.parseFloat(formData.service_value) || 0,
        toll_cost: Number.parseFloat(formData.toll_cost) || 0,
        fuel_cost: Number.parseFloat(formData.fuel_cost) || 0,
        other_costs: Number.parseFloat(formData.other_costs) || 0,
        status: formData.status,
        client_id: formData.client_id,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
      }

      await createServiceClient(serviceData)
      toast.success("Serviço criado com sucesso!")
      router.push("/dashboard/services")
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Erro ao criar serviço")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (dataLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/services">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Serviço</h1>
          <p className="text-muted-foreground">Cadastre um novo serviço de transporte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>Dados principais do serviço de transporte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_code">Código do Serviço</Label>
                <Input
                  id="service_code"
                  value={formData.service_code}
                  onChange={(e) => handleInputChange("service_code", e.target.value)}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection_date">Data de Coleta *</Label>
                <Input
                  id="collection_date"
                  type="date"
                  value={formData.collection_date}
                  onChange={(e) => handleInputChange("collection_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Data de Entrega</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange("delivery_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Serviço *</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o serviço a ser realizado..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origem *</Label>
                <Input
                  id="origin"
                  placeholder="Ex: São Paulo, SP"
                  value={formData.origin}
                  onChange={(e) => handleInputChange("origin", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destino *</Label>
                <Input
                  id="destination"
                  placeholder="Ex: Rio de Janeiro, RJ"
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Financeiras</CardTitle>
            <CardDescription>Valores relacionados ao serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_value">Valor do Serviço (R$) *</Label>
                <Input
                  id="service_value"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.service_value}
                  onChange={(e) => handleInputChange("service_value", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toll_cost">Pedágio (R$)</Label>
                <Input
                  id="toll_cost"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.toll_cost}
                  onChange={(e) => handleInputChange("toll_cost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_cost">Combustível (R$)</Label>
                <Input
                  id="fuel_cost"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.fuel_cost}
                  onChange={(e) => handleInputChange("fuel_cost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_costs">Outros Custos (R$)</Label>
                <Input
                  id="other_costs"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.other_costs}
                  onChange={(e) => handleInputChange("other_costs", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Atribuições</CardTitle>
            <CardDescription>Cliente, veículo e equipe responsável</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente *</Label>
                <Select value={formData.client_id} onValueChange={(value) => handleInputChange("client_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_id">Veículo *</Label>
                <Select value={formData.vehicle_id} onValueChange={(value) => handleInputChange("vehicle_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_id">Motorista *</Label>
                <Select value={formData.driver_id} onValueChange={(value) => handleInputChange("driver_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((emp) => emp.position?.toLowerCase().includes("motorista"))
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Serviço
              </>
            )}
          </Button>
          <Link href="/dashboard/services">
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
