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
import { createEmployee } from "@/lib/supabase/people"
import { toast } from "sonner"

export default function NewEmployeePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      // Collect form data
      const employeeData = {
        name: formData.get("name") as string,
        document: formData.get("cpf") as string,
        email: (formData.get("email") as string) || "",
        phone: formData.get("phone") as string,
        address: (formData.get("address") as string) || "",
        city: (formData.get("city") as string) || "",
        state: (formData.get("state") as string) || "",
        zip_code: (formData.get("cep") as string) || "",
        position: formData.get("position") as string,
        salary: Number.parseFloat(formData.get("salary") as string) || 0,
        hire_date: formData.get("hire_date") as string,
        license_number: (formData.get("cnh_number") as string) || null,
        license_category: (formData.get("cnh_category") as string) || null,
        license_expiry: (formData.get("cnh_expiry") as string) || null,
        status: formData.get("status") as string,
      }

      console.log("[v0] Tentando cadastrar funcionário:", employeeData)

      await createEmployee(employeeData)

      console.log("[v0] Funcionário cadastrado com sucesso")
      toast.success("Funcionário cadastrado com sucesso!")
      router.push("/dashboard/people/employees")
    } catch (error) {
      console.error("[v0] Erro ao cadastrar funcionário:", error)
      toast.error("Erro ao cadastrar funcionário. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/people/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Novo Funcionário</h2>
        <p className="text-muted-foreground">Cadastre um novo funcionário no sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados pessoais do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" name="name" placeholder="Nome completo do funcionário" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input id="birth_date" name="birth_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" name="phone" placeholder="(00) 00000-0000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="funcionario@jbtransportes.com.br" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Profissionais</CardTitle>
            <CardDescription>Dados relacionados ao trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo *</Label>
                <Select name="position" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorista">Motorista</SelectItem>
                    <SelectItem value="ajudante">Ajudante</SelectItem>
                    <SelectItem value="mecanico">Mecânico</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Select name="department">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="administrativo">Administrativo</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hire_date">Data de Admissão *</Label>
                <Input id="hire_date" name="hire_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salário</Label>
                <Input id="salary" name="salary" type="number" step="0.01" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="ativo" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="demitido">Demitido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos (Para Motoristas)</CardTitle>
            <CardDescription>Informações sobre CNH e outros documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnh_number">Número da CNH</Label>
                <Input id="cnh_number" name="cnh_number" placeholder="Número da CNH" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnh_category">Categoria CNH</Label>
                <Select name="cnh_category">
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnh_expiry">Vencimento CNH</Label>
                <Input id="cnh_expiry" name="cnh_expiry" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mopp_expiry">Vencimento MOPP</Label>
                <Input id="mopp_expiry" name="mopp_expiry" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aso_expiry">Vencimento ASO</Label>
                <Input id="aso_expiry" name="aso_expiry" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Endereço residencial do funcionário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" name="cep" placeholder="00000-000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" name="address" placeholder="Rua, número" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" placeholder="Nome da cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select name="state">
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
                <Input id="neighborhood" name="neighborhood" placeholder="Nome do bairro" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
            <CardDescription>Informações adicionais sobre o funcionário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                name="observations"
                placeholder="Informações adicionais sobre o funcionário..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/people/employees">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Salvando..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Funcionário
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
