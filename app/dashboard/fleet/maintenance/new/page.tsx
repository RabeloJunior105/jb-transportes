"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createMaintenanceRecord } from "@/lib/supabase/maintenance-fuel"
import { getVehicles } from "@/lib/supabase/vehicles"
import { useToast } from "@/hooks/use-toast"

export default function NewMaintenancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const vehiclesData = await getVehicles()
        setVehicles(vehiclesData || [])
      } catch (error) {
        console.error("Error loading vehicles:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar veículos. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      const maintenanceData = {
        vehicle_id: formData.get("vehicle") as string,
        type: formData.get("type") as string,
        date: formData.get("date") as string,
        odometer: Number.parseInt(formData.get("odometer") as string),
        service_provider: formData.get("service-provider") as string,
        status: formData.get("status") as string,
        cost: Number.parseFloat(formData.get("cost") as string),
        next_maintenance_km: formData.get("next-maintenance")
          ? Number.parseInt(formData.get("next-maintenance") as string)
          : null,
        description: formData.get("description") as string,
        parts_used: (formData.get("parts") as string) || null,
        observations: (formData.get("observations") as string) || null,
      }

      await createMaintenanceRecord(maintenanceData)

      toast({
        title: "Sucesso",
        description: "Manutenção registrada com sucesso!",
      })

      router.push("/dashboard/fleet/maintenance")
    } catch (error) {
      console.error("Error creating maintenance record:", error)
      toast({
        title: "Erro",
        description: "Erro ao registrar manutenção. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/fleet/maintenance">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Manutenção</h1>
          <p className="text-muted-foreground">Registre uma nova manutenção de veículo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Manutenção</CardTitle>
          <CardDescription>Preencha os dados da manutenção realizada ou agendada</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo *</Label>
                <Select name="vehicle" required disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o veículo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.type} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Manutenção *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="emergency">Emergencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data da Manutenção *</Label>
                <Input id="date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odometer">Quilometragem *</Label>
                <Input id="odometer" type="number" placeholder="Ex: 125000" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-provider">Prestador de Serviço *</Label>
                <Input id="service-provider" placeholder="Ex: Oficina Central Ltda" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Custo Total *</Label>
                <Input id="cost" type="number" step="0.01" placeholder="Ex: 1500.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-maintenance">Próxima Manutenção (km)</Label>
                <Input id="next-maintenance" type="number" placeholder="Ex: 135000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição dos Serviços *</Label>
              <Textarea
                id="description"
                placeholder="Descreva os serviços realizados ou a serem realizados..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parts">Peças Utilizadas</Label>
              <Textarea id="parts" placeholder="Liste as peças utilizadas na manutenção..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" placeholder="Observações adicionais sobre a manutenção..." rows={3} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading || loadingData}>
                <Save className="size-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Manutenção"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/fleet/maintenance">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
