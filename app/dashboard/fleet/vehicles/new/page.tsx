"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createVehicleClient } from "@/lib/supabase/client/vehicle.client"
import { CreateVehicleData } from "@/lib/supabase/types/vehicle.type"
import { isNativeError } from "util/types"

export default function NewVehiclePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [vehicleType, setVehicleType] = useState<string>("")
  const [fuelType, setFuelType] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [driverId, setDriverId] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Cria um objeto FormData a partir do formulário.
      // Funciona apenas para campos que possuem o atributo 'name'.
      const formData = new FormData(e.target as HTMLFormElement)

      // Combina os dados capturados do FormData com os valores dos Selects
      // que são gerenciados pelo estado.

      const vehicle: CreateVehicleData = {
        plate: formData.get("plate") as string,
        // O valor 'type' vem do estado do Select
        type: vehicleType,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        year: formData.get("year") ? Number(formData.get("year")) : 0,
        color: formData.get("color") as string || "",
        chassis: formData.get("chassis") as string || "",
        renavam: formData.get("renavam") as string || "",
        crlv_expiry: formData.get("crlv_expiry") as string || "",
        insurance_expiry: formData.get("insurance_expiry") as string || "",
        inspection_expiry: formData.get("inspection_expiry") as string || "",
        capacity: formData.get("capacity") ? Number(formData.get("capacity")) : 0,
        // O valor 'fuel_type' vem do estado do Select
        fuel_type: fuelType,
        mileage: formData.get("mileage") ? Number(formData.get("mileage")) : 0,
        // O valor 'status' vem do estado do Select
        status: status,
        // O valor 'driver_id' vem do estado do Select
        driver_id: driverId,
        observations: formData.get("observations") as string || ""
      }

      console.log("[v1] Dados do veículo prontos para envio:", vehicle)

      // Chama a função de criação do veículo
      await createVehicleClient(vehicle)

      console.log("[v1] Veículo cadastrado com sucesso")
      router.push("/dashboard/fleet/vehicles")
    } catch (error) {
      console.error("[v1] Erro ao cadastrar veículo:", error)
      // Você pode adicionar um toast ou mensagem de erro para o usuário aqui.
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/fleet/vehicles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Novo Veículo</h2>
        <p className="text-muted-foreground">Cadastre um novo veículo na frota</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
            <CardDescription>Dados básicos do veículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate">Placa *</Label>
                <Input id="plate" name="plate" placeholder="ABC-1234" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Veículo *</Label>
                <Select required value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caminhao">Caminhão</SelectItem>
                    <SelectItem value="carreta">Carreta</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="utilitario">Utilitário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input id="brand" name="brand" placeholder="Ex: Volvo, Scania" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input id="model" name="model" placeholder="Ex: FH 540" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano *</Label>
                <Input id="year" name="year" type="number" placeholder="2020" min="1990" max="2025" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input id="color" name="color" placeholder="Ex: Branco" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chassis">Chassi</Label>
                <Input id="chassis" name="chassis" placeholder="Número do chassi" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
            <CardDescription>Informações sobre documentos do veículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="renavam">RENAVAM</Label>
                <Input id="renavam" name="renavam" placeholder="Número do RENAVAM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crlv_expiry">Vencimento CRLV</Label>
                <Input id="crlv_expiry" name="crlv_expiry" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance_expiry">Vencimento Seguro</Label>
                <Input id="insurance_expiry" name="insurance_expiry" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspection_expiry">Vencimento Vistoria</Label>
                <Input id="inspection_expiry" name="inspection_expiry" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especificações Técnicas</CardTitle>
            <CardDescription>Dados técnicos do veículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (kg)</Label>
                <Input id="capacity" name="capacity" type="number" placeholder="Ex: 15000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Tipo de Combustível</Label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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
                <Label htmlFor="mileage">Quilometragem Atual</Label>
                <Input id="mileage" name="mileage" type="number" placeholder="Ex: 150000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status e Observações</CardTitle>
            <CardDescription>Status atual e informações adicionais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">Motorista Responsável</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Santos</SelectItem>
                    <SelectItem value="3">Carlos Oliveira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" name="observations" placeholder="Informações adicionais sobre o veículo..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/fleet/vehicles">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Salvando..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Veículo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
