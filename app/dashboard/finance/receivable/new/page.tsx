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
import { getClientsClient } from "@/lib/supabase/client/people.client"
import { getServicesClient } from "@/lib/supabase/client/service.client"
import { createAccountClient } from "@/lib/supabase/client/account.client"

export default function NewReceivablePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, servicesData] = await Promise.all([getClientsClient(), getServicesClient()])

        setClients(clientsData || [])
        setServices(servicesData || [])
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

      const accountData: any = {
        type: "receivable" as const,
        client_id: formData.get("client") as string,
        service_id: (formData.get("service") as string) || null,
        invoice_number: (formData.get("invoice-number") as string) || null,
        issue_date: formData.get("issue-date") as string,
        due_date: formData.get("due-date") as string,
        amount: Number.parseFloat(formData.get("amount") as string),
        status: formData.get("status") as string,
        payment_method: (formData.get("payment-method") as string) || null,
        payment_date: (formData.get("payment-date") as string) || null,
        installments: Number.parseInt(formData.get("installments") as string) || 1,
        description: formData.get("description") as string,
        observations: (formData.get("observations") as string) || null,
      }

      await createAccountClient(accountData)

      toast({
        title: "Sucesso",
        description: "Conta a receber criada com sucesso!",
      })

      router.push("/dashboard/finance/receivable")
    } catch (error) {
      console.error("Error creating receivable account:", error)
      toast({
        title: "Erro",
        description: "Erro ao criar conta a receber. Tente novamente.",
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
          <Link href="/dashboard/finance/receivable">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Conta a Receber</h1>
          <p className="text-muted-foreground">Registre uma nova conta a receber</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Preencha os dados da conta a receber</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select name="client" required disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o cliente"} />
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
                <Label htmlFor="service">Serviço Relacionado</Label>
                <Select name="service" disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o serviço"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.service_code} - {service.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-number">Número da Nota Fiscal</Label>
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
                <Input id="amount" type="number" step="0.01" placeholder="Ex: 2500.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" required disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione o status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="overdue">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-method">Forma de Recebimento</Label>
                <Select name="payment-method" disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Carregando..." : "Selecione a forma"} />
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
                <Label htmlFor="payment-date">Data de Recebimento</Label>
                <Input id="payment-date" type="date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input id="installments" type="number" min="1" placeholder="Ex: 1" defaultValue="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea id="description" placeholder="Descreva o serviço ou motivo da cobrança..." rows={3} required />
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
                <Link href="/dashboard/finance/receivable">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
