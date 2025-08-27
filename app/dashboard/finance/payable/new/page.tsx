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
import { getSuppliers } from "@/lib/supabase/server/people.server"
import { getVehicles } from "@/lib/supabase/server/vehicle.server"
import { createAccount } from "@/lib/supabase/server/account.server"
import { CreateAccountData } from "@/lib/supabase/types/accounts.type"

export default function NewPayablePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, vehiclesData] = await Promise.all([getSuppliers(), getVehicles()])

        setSuppliers(suppliersData || [])
        setVehicles(vehiclesData || [])
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

      const accountData = {
        type: "payable" as const,
        supplier_id: formData.get("supplier") as string,
        vehicle_id: (formData.get("vehicle") as string) || null,
        category: formData.get("category") as string,
        invoice_number: (formData.get("invoice-number") as string) || null,
        issue_date: formData.get("issue-date") as string,
        due_date: formData.get("due-date") as string,
        amount: Number.parseFloat(formData.get("amount") as string),
        status: formData.get("status") as string,
        payment_method: (formData.get("payment-method") as string) || undefined,
        payment_date: (formData.get("payment-date") as string) || undefined,
        description: formData.get("description") as string,
        observations: (formData.get("observations") as string) || null,
      }

      await createAccount(accountData)

      toast({
        title: "Sucesso",
        description: "Conta a pagar criada com sucesso!",
      })

      router.push("/dashboard/finance/payable")
    } catch (error) {
      console.error("Error creating payable account:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar. Tente novamente.",
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
          <Link href="/dashboard/finance/payable">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Conta a Pagar</h1>
          <p className="text-muted-foreground">Registre uma nova conta a pagar</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Preencha os dados da conta a pagar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor *</Label>
                <Select name="supplier" required disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o fornecedor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel">Combustível</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="insurance">Seguro</SelectItem>
                    <SelectItem value="tolls">Pedágios</SelectItem>
                    <SelectItem value="salary">Salários</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-number">Número da Nota/Fatura</Label>
                <Input id="invoice-number" placeholder="Ex: NF-001234" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-date">Data de Emissão *</Label>
                <Input id="issue-date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Data de Vencimento *</Label>
                <Input id="due-date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor *</Label>
                <Input id="amount" type="number" step="0.01" placeholder="Ex: 1500.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Forma de Pagamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="bank-transfer">Transferência</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-date">Data de Pagamento</Label>
                <Input id="payment-date" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Veículo Relacionado</Label>
                <Select name="vehicle" disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o veículo"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.type} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea id="description" placeholder="Descreva o motivo da conta a pagar..." rows={3} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" placeholder="Observações adicionais..." rows={3} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading || loadingData}>
                <Save className="size-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Conta"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/finance/payable">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
