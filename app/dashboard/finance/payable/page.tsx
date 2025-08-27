"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { deleteAccountClient, getAccountsClient, isOverdue, updateAccountClient } from "@/lib/supabase/client/account.client"
import { Account } from "@/lib/supabase/types/accounts.type"

const getStatusBadge = (status: string, dueDate: string) => {
  const overdue = isOverdue(dueDate, status)

  switch (status) {
    case "paid":
      return (
        <Badge className="bg-chart-1 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      )
    case "pending":
      return overdue ? (
        <Badge className="bg-destructive text-destructive-foreground">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      ) : (
        <Badge className="bg-chart-2 text-accent-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      )
    case "overdue":
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getCategoryBadge = (categoria: string) => {
  const colors = {
    fuel: "bg-blue-100 text-blue-800 border-blue-200",
    maintenance: "bg-orange-100 text-orange-800 border-orange-200",
    insurance: "bg-purple-100 text-purple-800 border-purple-200",
    toll: "bg-green-100 text-green-800 border-green-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const labels = {
    fuel: "Combustível",
    maintenance: "Manutenção",
    insurance: "Seguro",
    toll: "Pedágio",
    other: "Outros",
  }

  return (
    <Badge variant="outline" className={colors[categoria as keyof typeof colors] || colors.other}>
      {labels[categoria as keyof typeof labels] || categoria}
    </Badge>
  )
}

export default function PayablePage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const data = await getAccountsClient("payable")
      setAccounts(data)
    } catch (error) {
      console.error("Error loading accounts:", error)
      toast.error("Erro ao carregar contas a pagar")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return

    try {
      await deleteAccountClient(id)
      setAccounts(accounts.filter((account) => account.id !== id))
      toast.success("Conta excluída com sucesso")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Erro ao excluir conta")
    }
  }

  const handleMarkAsPaid = async (id: string) => {
    try {
      const updatedAccount = await updateAccountClient(id, {
        status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
      })

      setAccounts(accounts.map((account) => (account.id === id ? { ...account, ...updatedAccount } : account)))
      toast.success("Conta marcada como paga")
    } catch (error) {
      console.error("Error updating account:", error)
      toast.error("Erro ao atualizar conta")
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || account.status === statusFilter
    const matchesCategory = categoryFilter === "all" || account.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage)

  const totalValue = accounts.reduce((sum, p) => sum + p.amount, 0)
  const paidValue = accounts.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const pendingValue = accounts.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const overdueValue = accounts.filter((p) => isOverdue(p.due_date, p.status)).reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando contas a pagar...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
          <p className="text-muted-foreground">Gerencie todas as despesas e pagamentos</p>
        </div>
        <Link href="/dashboard/finance/payable/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              R$ {paidValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              R$ {pendingValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {overdueValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por fornecedor, descrição ou referência..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="insurance">Seguro</SelectItem>
                  <SelectItem value="toll">Pedágio</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Pagar</CardTitle>
          <CardDescription>{filteredAccounts.length} conta(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma conta encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.suppliers?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={account.description}>
                          {account.description}
                        </div>
                        {account.reference_number && (
                          <div className="text-xs text-muted-foreground">{account.reference_number}</div>
                        )}
                      </TableCell>
                      <TableCell>{getCategoryBadge(account.category)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          R$ {account.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(account.due_date).toLocaleDateString("pt-BR")}</div>
                          {account.payment_date && (
                            <div className="text-muted-foreground text-xs">
                              Pago: {new Date(account.payment_date).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status, account.due_date)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {account.status !== "paid" && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(account.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAccounts.length)} de{" "}
                {filteredAccounts.length} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
