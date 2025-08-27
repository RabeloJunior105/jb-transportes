"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  DollarSign,
  Truck,
  Users,
  Fuel,
  Calendar,
  Filter,
} from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Relatório Financeiro Mensal",
      description: "Análise completa de receitas, despesas e lucro do mês",
      category: "Financeiro",
      period: "Janeiro 2024",
      status: "Disponível",
      icon: DollarSign,
      color: "text-chart-1",
    },
    {
      id: 2,
      title: "Performance da Frota",
      description: "Quilometragem, consumo e eficiência dos veículos",
      category: "Frota",
      period: "Últimos 30 dias",
      status: "Disponível",
      icon: Truck,
      color: "text-chart-2",
    },
    {
      id: 3,
      title: "Produtividade dos Funcionários",
      description: "Análise de serviços realizados por funcionário",
      category: "Recursos Humanos",
      period: "Janeiro 2024",
      status: "Processando",
      icon: Users,
      color: "text-chart-3",
    },
    {
      id: 4,
      title: "Controle de Combustível",
      description: "Consumo, custos e eficiência energética",
      category: "Combustível",
      period: "Últimos 7 dias",
      status: "Disponível",
      icon: Fuel,
      color: "text-chart-4",
    },
    {
      id: 5,
      title: "Análise de Clientes",
      description: "Ranking de clientes por volume e receita",
      category: "Comercial",
      period: "Últimos 90 dias",
      status: "Disponível",
      icon: BarChart3,
      color: "text-chart-5",
    },
    {
      id: 6,
      title: "Relatório de Manutenção",
      description: "Custos e frequência de manutenções por veículo",
      category: "Manutenção",
      period: "Últimos 6 meses",
      status: "Disponível",
      icon: FileText,
      color: "text-primary",
    },
  ]

  const quickStats = [
    {
      title: "Relatórios Gerados",
      value: "156",
      change: "+12%",
      period: "este mês",
      icon: FileText,
    },
    {
      title: "Economia Identificada",
      value: "R$ 23.450",
      change: "+8%",
      period: "este mês",
      icon: TrendingUp,
    },
    {
      title: "Alertas Ativos",
      value: "8",
      change: "-15%",
      period: "esta semana",
      icon: BarChart3,
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análises e insights para tomada de decisão</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Todos
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-1">{stat.change}</span> {stat.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Relatório</CardTitle>
          <CardDescription>Configure os parâmetros para gerar relatórios personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="fleet">Frota</SelectItem>
                  <SelectItem value="hr">Recursos Humanos</SelectItem>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Último mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Formato</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {report.category}
                    </Badge>
                  </div>
                </div>
                <Badge variant={report.status === "Disponível" ? "default" : "secondary"} className="text-xs">
                  {report.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {report.period}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" disabled={report.status !== "Disponível"}>
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
                <Button size="sm" variant="outline" disabled={report.status !== "Disponível"}>
                  Visualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
