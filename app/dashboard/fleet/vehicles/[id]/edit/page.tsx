"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getVehicleClient, updateVehicleClient, type Vehicle } from "@/lib/supabase/vehicles"

interface EditVehiclePageProps {
  params: {
    id: string
  }
}

export default function EditVehiclePage({ params }: EditVehiclePageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    loadVehicle()
  }, [params.id])

  const loadVehicle = async () => {
    try {
      setLoading(true)
      const vehicleData = await getVehicleClient(params.id)
      setVehicle(vehicleData)
    } catch (error) {
      console.error("Error loading vehicle:", error)
      toast.error("Erro ao carregar dados do veículo")
      router.push("/dashboard/fleet/vehicles")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!vehicle) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)

    try {
      const updatedVehicle = {
        plate: formData.get("plate") as string,
        renavam: formData.get("renavam") as string,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        year: Number.parseInt(formData.get("year") as string),
        color: formData.get("color") as string,
        chassis: formData.get("chassis") as string,
        capacity: Number.parseFloat(formData.get("capacity") as string),
        mileage: Number.parseInt(formData.get("mileage") as string),
        fuel_type: formData.get("fuel_type") as string,
        status: formData.get("status") as string,
      }

      await updateVehicleClient(vehicle.id, updatedVehicle)
      toast.success("Veículo atualizado com sucesso!")
      router.push("/dashboard/fleet/vehicles")
    } catch (error) {
      console.error("Error updating vehicle:", error)
      toast.error("Erro ao atualizar veículo")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando veículo...</span>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Veículo não encontrado</p>
          <Link href="/dashboard/fleet/vehicles">
            <Button className="mt-4">Voltar para Veículos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fleet/vehicles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Veículo</h1>
          <p className="text-muted-foreground">Atualize as informações do veículo {vehicle.plate}</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Veículo</CardTitle>
          <CardDescription>Atualize os dados do veículo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plate">Placa</Label>
                <Input id="plate" name="plate" defaultValue={vehicle.plate} placeholder="Ex: ABC-1234" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renavam">RENAVAM</Label>
                <Input
                  id="renavam"
                  name="renavam"
                  defaultValue={vehicle.renavam}
                  placeholder="Ex: 12345678901"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" name="brand" defaultValue={vehicle.brand} placeholder="Ex: Mercedes-Benz" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" defaultValue={vehicle.model} placeholder="Ex: Atego 1719" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input id="year" name="year" type="number" min="1900" max="2030" defaultValue={vehicle.year} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input id="color" name="color" defaultValue={vehicle.color} placeholder="Ex: Branco" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassis">Chassi</Label>
                <Input
                  id="chassis"
                  name="chassis"
                  defaultValue={vehicle.chassis}
                  placeholder="Ex: 9BM979018KB123456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (kg)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={vehicle.capacity}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem</Label>
                <Input id="mileage" name="mileage" type="number" min="0" defaultValue={vehicle.mileage} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Tipo de Combustível</Label>
                <Select name="fuel_type" defaultValue={vehicle.fuel_type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="ethanol">Etanol</SelectItem>
                    <SelectItem value="cng">GNV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={vehicle.status} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Link href="/dashboard/fleet/vehicles">
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
