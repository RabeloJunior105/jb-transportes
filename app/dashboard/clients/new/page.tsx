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

export default function NewClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Cliente cadastrado com sucesso")
    setIsLoading(false)
    router.push("/dashboard/clients")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
        <p className="text-muted-foreground">Cadastre um novo cliente no sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Razão Social *</Label>
                <Input id="name" placeholder="Nome do cliente" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cliente *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ *</Label>
                <Input id="document" placeholder="000.000.000-00 ou 00.000.000/0000-00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select defaultValue="ativo" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>Dados para comunicação com o cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Nome do Contato *</Label>
                <Input id="contact" placeholder="Nome da pessoa de contato" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" placeholder="(00) 00000-0000" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" placeholder="contato@cliente.com.br" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" placeholder="(00) 00000-0000" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Localização do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Rua, número" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Nome da cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" placeholder="Nome do bairro" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Comerciais</CardTitle>
            <CardDescription>Dados relacionados aos negócios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="agronegocio">Agronegócio</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Prazo de Pagamento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avista">À Vista</SelectItem>
                    <SelectItem value="15dias">15 dias</SelectItem>
                    <SelectItem value="30dias">30 dias</SelectItem>
                    <SelectItem value="45dias">45 dias</SelectItem>
                    <SelectItem value="60dias">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Limite de Crédito</Label>
                <Input id="credit_limit" type="number" step="0.01" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Desconto Padrão (%)</Label>
                <Input id="discount" type="number" step="0.01" placeholder="0,00" min="0" max="100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
            <CardDescription>Informações adicionais sobre o cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea id="observations" placeholder="Informações adicionais sobre o cliente..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/clients">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Salvando..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
