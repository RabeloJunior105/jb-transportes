"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getServiceClient, updateServiceClient, type Service } from "@/lib/supabase/services"
import { getClientsClient, type Client } from "@/lib/supabase/people"
import { getVehiclesClient, type Vehicle } from "@/lib/supabase/vehicles"
import { getEmployeesClient, type Employee } from "@/lib/supabase/people"

interface EditServicePageProps {
  params: {
    id: string
  }
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [service, setService] = useState<Service | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [serviceData, clientsData, vehiclesData, employeesData] = await Promise.all([
        getServiceClient(params.id),
        getClientsClient(),
        getVehiclesClient(),
        getEmployeesClient(),
      ])

      setService(serviceData)
      setClients(clientsData)
      setVehicles(vehiclesData)
      setEmployees(employeesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Erro ao carregar dados do serviço")
      router.push("/dashboard/services")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!service) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)

    try {
      const updatedService = {
        service_code: formData.get("service_code") as string,
        collection_date: formData.get("collection_date") as string,
        delivery_date: formData.get("delivery_date") as string,
        entry_time: formData.get("entry_time") as string,
        exit_time: formData.get("exit_time") as string,
        description: formData.get("description") as string,
        origin: formData.get("origin") as string,
        destination: formData.get("destination") as string,
        service_value: Number.parseFloat(formData.get("service_value") as string) || 0,
        toll_cost: Number.parseFloat(formData.get("toll_cost") as string) || 0,
        status: formData.get("status") as string,
        client_id: formData.get("client_id") as string,
        vehicle_id: formData.get("vehicle_id") as string,
        employee_id: formData.get("employee_id") as string,
      }

      await updateServiceClient(service.id, updatedService)
      toast.success("Serviço atualizado com sucesso!")
      router.push("/dashboard/services")
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Erro ao atualizar serviço")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando serviço...</span>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Serviço não encontrado</p>
          <Link href="/dashboard/services">
            <Button className="mt-4">Voltar para Serviços</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/services">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Serviço</h1>
          <p className="text-muted-foreground">Atualize as informações do serviço {service.service_code}</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Serviço</CardTitle>
          <CardDescription>Atualize os dados do serviço de transporte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_code">Código do Serviço</Label>
                <Input
                  id="service_code"
                  name="service_code"
                  defaultValue={service.service_code}
                  placeholder="Ex: SRV-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={service.status} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection_date">Data de Coleta</Label>
                <Input
                  id="collection_date"
                  name="collection_date"
                  type="date"
                  defaultValue={service.collection_date}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_date">Data de Entrega</Label>
                <Input id="delivery_date" name="delivery_date" type="date" defaultValue={service.delivery_date || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_time">Horário de Entrada</Label>
                <Input id="entry_time" name="entry_time" type="time" defaultValue={service.entry_time || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_time">Horário de Saída</Label>
                <Input id="exit_time" name="exit_time" type="time" defaultValue={service.exit_time || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Local de Origem</Label>
                <Input
                  id="origin"
                  name="origin"
                  defaultValue={service.origin}
                  placeholder="Ex: São Paulo, SP"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Local de Destino</Label>
                <Input
                  id="destination"
                  name="destination"
                  defaultValue={service.destination}
                  placeholder="Ex: Rio de Janeiro, RJ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_value">Valor do Serviço (R$)</Label>
                <Input
                  id="service_value"
                  name="service_value"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={service.service_value}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toll_cost">Custo de Pedágio (R$)</Label>
                <Input
                  id="toll_cost"
                  name="toll_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={service.toll_cost || 0}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente</Label>
                <Select name="client_id" defaultValue={service.client_id} required>
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
                <Label htmlFor="vehicle_id">Veículo</Label>
                <Select name="vehicle_id" defaultValue={service.vehicle_id} required>
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
                <Label htmlFor="employee_id">Motorista</Label>
                <Select name="employee_id" defaultValue={service.employee_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((emp) => emp.position === "Motorista")
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={service.description}
                placeholder="Descreva os detalhes do serviço..."
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Link href="/dashboard/services">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
