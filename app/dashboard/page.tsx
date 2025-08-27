"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { DollarSign, AlertTriangle, TrendingUp, Calendar, Fuel, Wrench, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das operações da JB Transportes</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Hoje: {new Date().toLocaleDateString("pt-BR")}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ 145.230</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-chart-1" />
              +8% vs mês anterior (R$ 134.472)
            </p>
            <div className="mt-2 text-xs text-muted-foreground">Meta: R$ 150.000 (97% atingido)</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">23.5%</div>
            <p className="text-xs text-muted-foreground">Lucro líquido: R$ 34.109</p>
            <div className="mt-2 text-xs text-muted-foreground">Média do setor: 18-25%</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Operacionais</CardTitle>
            <Fuel className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">R$ 89.450</div>
            <p className="text-xs text-muted-foreground">Combustível: R$ 45.230 (50.6%)</p>
            <div className="mt-2 text-xs text-muted-foreground">Manutenção: R$ 18.900 (21.1%)</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <FileText className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">R$ 67.890</div>
            <p className="text-xs text-muted-foreground">Vencidas: R$ 12.340 (18.2%)</p>
            <div className="mt-2 text-xs text-destructive">Ação necessária: 8 faturas</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Alertas Financeiros Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-md border border-destructive/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-destructive rounded-full"></div>
              <div>
                <p className="text-sm font-medium">8 faturas vencidas há mais de 30 dias</p>
                <p className="text-xs text-muted-foreground">Total: R$ 12.340 - Risco de inadimplência</p>
              </div>
            </div>
            <Button size="sm" variant="destructive">
              Cobrar
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-md border border-accent/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-accent rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Combustível 15% acima da média</p>
                <p className="text-xs text-muted-foreground">Veículo ABC-1234 - Possível problema mecânico</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Investigar
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-md border border-chart-1/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Oportunidade: Rota SP-RJ otimizada</p>
                <p className="text-xs text-muted-foreground">Economia potencial: R$ 2.500/mês</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Analisar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start h-auto p-4 bg-transparent" variant="outline">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Novo Serviço</div>
                <div className="text-xs text-muted-foreground">Cadastrar novo frete</div>
              </div>
            </Button>

            <Button className="justify-start h-auto p-4 bg-transparent" variant="outline">
              <DollarSign className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Registrar Pagamento</div>
                <div className="text-xs text-muted-foreground">Baixar conta a receber</div>
              </div>
            </Button>

            <Button className="justify-start h-auto p-4 bg-transparent" variant="outline">
              <Fuel className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Registrar Abastecimento</div>
                <div className="text-xs text-muted-foreground">Controle de combustível</div>
              </div>
            </Button>

            <Button className="justify-start h-auto p-4 bg-transparent" variant="outline">
              <Wrench className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Agendar Manutenção</div>
                <div className="text-xs text-muted-foreground">Manutenção preventiva</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas movimentações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-chart-1 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pagamento recebido - R$ 8.500</p>
                <p className="text-xs text-muted-foreground">Cliente: Empresa ABC - há 1 hora</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-chart-2 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Serviço #1234 concluído</p>
                <p className="text-xs text-muted-foreground">São Paulo → Rio de Janeiro - há 2 horas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-chart-3 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Abastecimento registrado - R$ 450</p>
                <p className="text-xs text-muted-foreground">Veículo XYZ-5678 - há 4 horas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-chart-4 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Manutenção agendada - R$ 1.200</p>
                <p className="text-xs text-muted-foreground">Veículo DEF-9012 - há 6 horas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-destructive rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Alerta: Fatura vencida</p>
                <p className="text-xs text-muted-foreground">Cliente XYZ - R$ 3.200 - há 1 dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
