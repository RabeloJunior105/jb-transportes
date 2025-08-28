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
import { useToast } from "@/hooks/use-toast"
import { getVehiclesClient } from "@/lib/supabase/client/vehicle.client"
import { getEmployeesClient } from "@/lib/supabase/client/people.client"
import { createFuelClient } from "@/lib/supabase/client/fuel.client"

export default function NewFuelPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehiclesData, employeesData] = await Promise.all([getVehiclesClient(), getEmployeesClient()])

        setVehicles(vehiclesData || [])
        // Filter only drivers (motoristas)
        setDrivers(employeesData?.filter((emp) => emp.position === "motorista") || [])
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Tente novamente.",
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

      const fuelData: any = {
        vehicle_id: formData.get("vehicle") as string,
        driver_id: formData.get("driver") as string,
        date: formData.get("date") as string,
        odometer: Number.parseInt(formData.get("odometer") as string),
        fuel_type: formData.get("fuel-type") as string,
        liters: Number.parseFloat(formData.get("liters") as string),
        unit_price: Number.parseFloat(formData.get("unit-price") as string),
        total_value: Number.parseFloat(formData.get("total-value") as string),
        gas_station: formData.get("gas-station") as string,
        payment_method: formData.get("payment-method") as string,
        observations: (formData.get("observations") as string) || null,
      }

      await createFuelClient(fuelData)

      toast({
        title: "Sucesso",
        description: "Abastecimento registrado com sucesso!",
      })

      router.push("/dashboard/fuel")
    } catch (error) {
      console.error("Error creating fuel record:", error)
      toast({
        title: "Erro",
        description: "Erro ao registrar abastecimento. Tente novamente.",
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
          <Link href="/dashboard/fuel">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Abastecimento</h1>
          <p className="text-muted-foreground">Registre um novo abastecimento de combustível</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Abastecimento</CardTitle>
          <CardDescription>Preencha os dados do abastecimento realizado</CardDescription>
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
                <Label htmlFor="driver">Motorista *</Label>
                <Select name="driver" required disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o motorista"} />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data do Abastecimento *</Label>
                <Input
                  name="date"
                  type="datetime-local"
                  required
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odometer">Quilometragem *</Label>
                <Input name="odometer" type="number" placeholder="Ex: 125000" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel-type">Tipo de Combustível *</Label>
                <Select name="fuel-type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="ethanol">Etanol</SelectItem>
                    <SelectItem value="gnv">GNV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="liters">Litros Abastecidos *</Label>
                <Input name="liters" type="number" step="0.01" placeholder="Ex: 150.50" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-price">Preço por Litro *</Label>
                <Input name="unit-price" type="number" step="0.001" placeholder="Ex: 5.899" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-value">Valor Total *</Label>
                <Input name="total-value" type="number" step="0.01" placeholder="Ex: 887.35" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas-station">Posto de Combustível *</Label>
                <Input name="gas-station" placeholder="Ex: Shell - Rodovia BR-101" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Forma de Pagamento *</Label>
                <Select name="payment-method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="fuel-card">Cartão Combustível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea name="observations" placeholder="Observações adicionais sobre o abastecimento..." rows={3} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading || loadingData}>
                <Save className="size-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Abastecimento"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/fuel">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
