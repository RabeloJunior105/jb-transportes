"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Fuel,
  Wrench,
  FileText,
  Truck,
  Route,
  RefreshCw,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnon)

function currency(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const PRIMARY = "hsl(var(--primary))"
const ACCENT = "hsl(var(--accent))"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [receitaVsCusto, setReceitaVsCusto] = useState<any[]>([])
  const [aging, setAging] = useState<any[]>([])
  const [combSemanas, setCombSemanas] = useState<any[]>([])
  const [manutencoes, setManutencoes] = useState<any[]>([])
  const [rotas, setRotas] = useState<any[]>([])
  const [utilizacaoFrota, setUtilizacaoFrota] = useState<any[]>([])

  async function loadData() {
    setLoading(true)
    const [kpiRes, receitaRes, agingRes, combRes, manRes, rotasRes, utilRes] = await Promise.all([
      supabase.from("vw_dash_kpis").select("*"),
      supabase.from("vw_dash_receita_vs_custo").select("*"),
      supabase.from("vw_dash_aging").select("*"),
      supabase.from("vw_dash_combustivel_semana").select("*"),
      supabase.from("vw_dash_manutencoes").select("*"),
      supabase.from("vw_dash_rotas").select("*"),
      supabase.from("vw_dash_utilizacao_frota").select("*"),
    ])
    setKpis(kpiRes.data?.[0] || null)
    setReceitaVsCusto(receitaRes.data || [])
    setAging(agingRes.data || [])
    setCombSemanas(combRes.data || [])
    setManutencoes(manRes.data || [])
    setRotas(rotasRes.data || [])
    setUtilizacaoFrota(utilRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const metaPct = useMemo(() => {
    if (!kpis) return 0
    const denom = kpis?.receita_meta || 0
    return denom === 0 ? 0 : Math.min(100, (kpis?.receita_mensal / denom) * 100)
  }, [kpis])

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das operações da JB Transportes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Hoje: {new Date().toLocaleDateString("pt-BR")}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1" onClick={loadData}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-32" /> : <div className="text-2xl font-bold text-primary">{currency(kpis?.receita_mensal || 0)}</div>}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Meta: {currency(kpis?.receita_meta || 0)}</span>
                <span>{metaPct.toFixed(0)}%</span>
              </div>
              <Progress value={metaPct} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold text-primary">{(kpis?.margem_lucro || 0).toFixed(1)}%</div>}
            <p className="text-xs text-muted-foreground">Lucro líquido: {currency(kpis?.lucro_liquido || 0)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Operacionais</CardTitle>
            <Fuel className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-32" /> : <div className="text-2xl font-bold text-accent">{currency(kpis?.custos_operacionais || 0)}</div>}
            <p className="text-xs text-muted-foreground">Combustível: {currency(kpis?.combustivel || 0)}</p>
            <div className="mt-2 text-xs text-muted-foreground">Manutenção: {currency(kpis?.manutencao || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-7 w-32" /> : <div className="text-2xl font-bold text-accent">{currency(kpis?.contas_receber || 0)}</div>}
            <p className="text-xs text-muted-foreground">Vencidas: {currency(kpis?.contas_vencidas || 0)}</p>
            <div className="mt-2 text-xs text-destructive">Ação necessária: {kpis?.faturas_criticas ?? 0} faturas</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Receita × Custo
            </CardTitle>
            <CardDescription>Últimos meses</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={receitaVsCusto} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cst" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(v) => currency(v)} width={80} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke={PRIMARY} fill="url(#rev)" />
                  <Area type="monotone" dataKey="custo" name="Custo" stroke={ACCENT} fill="url(#cst)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-accent" /> Alertas</CardTitle>
            <CardDescription>Financeiros críticos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{(kpis?.faturas_criticas ?? 0)} faturas vencidas há +30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Frota + Financeiro secundário */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Utilização da Frota</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={utilizacaoFrota} dataKey="value" nameKey="name" outerRadius={90} label>
                    {(utilizacaoFrota || []).map((_: any, i: number) => (
                      <Cell key={i} fill={i % 2 === 0 ? PRIMARY : ACCENT} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Aging Recebíveis</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aging}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="faixa" />
                  <YAxis tickFormatter={(v) => currency(v)} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Bar dataKey="valor">
                    {aging.map((_: any, i: number) => <Cell key={i} fill={i % 2 === 0 ? PRIMARY : ACCENT} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5" /> Combustível × Meta</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combSemanas}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="sem" />
                  <YAxis tickFormatter={(v) => currency(v)} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="gasto" stroke={ACCENT} />
                  <Line type="monotone" dataKey="meta" stroke={PRIMARY} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rotas + Manutenções */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" /> Rotas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rota</TableHead>
                    <TableHead className="text-right">Serviços</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Tempo Médio (h)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rotas || []).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.rota}</TableCell>
                      <TableCell className="text-right">{r.servicos}</TableCell>
                      <TableCell className="text-right">{currency(r.receita)}</TableCell>
                      <TableCell className="text-right">{currency(r.custo)}</TableCell>
                      <TableCell className="text-right">{r.tempoMedio}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(manutencoes || []).map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{m.placa}</TableCell>
                      <TableCell>{m.tipo}</TableCell>
                      <TableCell>{m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell className="text-right">{currency(m.custo)}</TableCell>
                      <TableCell>{m.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()} JB Transportes — Painel operacional & financeiro
      </div>
    </div>
  )
}
