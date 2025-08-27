"use client"

import { useState } from "react"
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
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

// Mock data for accounts receivable
const mockReceivables = [
  {
    id: "REC-001",
    cliente: "Empresa ABC Ltda",
    descricao: "Transporte de equipamentos industriais - SRV-001",
    valor: 2500.0,
    dataVencimento: "2024-02-20",
    dataRecebimento: null,
    status: "Pendente",
    servico: "SRV-001",
    formaPagamento: "Boleto",
    observacoes: "Pagamento em 30 dias",
  },
  {
    id: "REC-002",
    cliente: "Construtora XYZ",
    descricao: "Entrega de materiais de construção - SRV-002",
    valor: 1800.0,
    dataVencimento: "2024-02-15",
    dataRecebimento: "2024-02-14",
    status: "Recebido",
    servico: "SRV-002",
    formaPagamento: "PIX",
    observacoes: "Pagamento antecipado",
  },
  {
    id: "REC-003",
    cliente: "Alimentos Brasil S.A.",
    descricao: "Transporte de produtos alimentícios - SRV-003",
    valor: 3200.0,
    dataVencimento: "2024-02-01",
    dataRecebimento: null,
    status: "Vencido",
    servico: "SRV-003",
    formaPagamento: "Transferência",
    observacoes: "Cliente com histórico de atraso",
  },
  {
    id: "REC-004",
    cliente: "Cliente Particular",
    descricao: "Mudança residencial completa - SRV-004",
    valor: 1500.0,
    dataVencimento: "2024-02-25",
    dataRecebimento: null,
    status: "Pendente",
    servico: "SRV-004",
    formaPagamento: "Dinheiro",
    observacoes: "Pagamento à vista na entrega",
  },
  {
    id: "REC-005",
    cliente: "Loja de Móveis Premium",
    descricao: "Entrega de móveis e eletrodomésticos - SRV-005",
    valor: 800.0,
    dataVencimento: "2024-02-10",
    dataRecebimento: "2024-02-09",
    status: "Recebido",
    servico: "SRV-005",
    formaPagamento: "Cartão",
    observacoes: "Pagamento via cartão de crédito",
  },
]

const getStatusBadge = (status: string, dataVencimento: string) => {
  const today = new Date()
  const dueDate = new Date(dataVencimento)
  const isOverdue = today > dueDate && status === "Pendente"

  switch (status) {
    case "Recebido":
      return (
        <Badge className="bg-chart-1 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Recebido
        </Badge>
      )
    case "Pendente":
      return isOverdue ? (
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
    case "Vencido":
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

const getPaymentMethodBadge = (formaPagamento: string) => {
  const colors = {
    PIX: "bg-green-100 text-green-800 border-green-200",
    Boleto: "bg-blue-100 text-blue-800 border-blue-200",
    Transferência: "bg-purple-100 text-purple-800 border-purple-200",
    Cartão: "bg-orange-100 text-orange-800 border-orange-200",
    Dinheiro: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <Badge variant="outline" className={colors[formaPagamento as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
      {formaPagamento}
    </Badge>
  )
}

export default function ReceivablePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredReceivables = mockReceivables.filter((receivable) => {
    const matchesSearch =
      receivable.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.servico.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || receivable.status === statusFilter
    const matchesPayment = paymentFilter === "all" || receivable.formaPagamento === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const totalPages = Math.ceil(filteredReceivables.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReceivables = filteredReceivables.slice(startIndex, startIndex + itemsPerPage)

  const totalValue = mockReceivables.reduce((sum, r) => sum + r.valor, 0)
  const receivedValue = mockReceivables.filter((r) => r.status === "Recebido").reduce((sum, r) => sum + r.valor, 0)
  const pendingValue = mockReceivables.filter((r) => r.status === "Pendente").reduce((sum, r) => sum + r.valor, 0)
  const overdueValue = mockReceivables.filter((r) => r.status === "Vencido").reduce((sum, r) => sum + r.valor, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
          <p className="text-muted-foreground">Gerencie todos os recebimentos e faturamento</p>
        </div>
        <Link href="/dashboard/finance/receivable/new">
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
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
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
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              R$ {receivedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {((receivedValue / totalValue) * 100).toFixed(1)}% do total
            </p>
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
                  placeholder="Buscar por cliente, descrição ou serviço..."
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
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Forma de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Formas</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receivables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
          <CardDescription>{filteredReceivables.length} conta(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReceivables.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell className="font-medium">{receivable.id}</TableCell>
                    <TableCell>{receivable.cliente}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={receivable.descricao}>
                        {receivable.descricao}
                      </div>
                      <div className="text-xs text-muted-foreground">{receivable.servico}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {receivable.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(receivable.dataVencimento).toLocaleDateString("pt-BR")}</div>
                        {receivable.dataRecebimento && (
                          <div className="text-muted-foreground text-xs">
                            Recebido: {new Date(receivable.dataRecebimento).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentMethodBadge(receivable.formaPagamento)}</TableCell>
                    <TableCell>{getStatusBadge(receivable.status, receivable.dataVencimento)}</TableCell>
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
                          {receivable.status !== "Recebido" && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Recebido
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReceivables.length)} de{" "}
                {filteredReceivables.length} resultados
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
