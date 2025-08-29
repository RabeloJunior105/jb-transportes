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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  ChevronDown,
  Filter,
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

// =====================================================
//  Supabase (browser) — substitua por '@/lib/supabase-browser' se já existir
// =====================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnon)

// Tipos — alinhe aos nomes/colunas reais das suas views/RPCs
interface KPIData {
  receita_mensal: number
  receita_meta: number
  margem_lucro: number
  lucro_liquido: number
  custos_operacionais: number
  combustivel: number
  manutencao: number
  contas_receber: number
  contas_vencidas: number
  faturas_criticas: number
}

interface SerieReceitaCusto { mes: string; receita: number; custo: number }
interface AgingItem { faixa: string; valor: number }
interface CombSemanal { sem: string; gasto: number; meta: number }
interface ManutencaoItem { placa: string; tipo: string; data: string; custo: number; status: string }
interface RotaItem { rota: string; servicos: number; receita: number; custo: number; tempoMedio: number }
interface Utilizacao { name: string; value: number }

// Helpers: somente primary/accent para manter o design pedido
const getVar = (name: string) => `hsl(var(${name}))`
const PRIMARY = getVar("--primary")
const ACCENT = getVar("--accent")

function currency(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function Zero() {
  return <span className="text-muted-foreground">0</span>
}

export default function DashboardPage() {
  // Filtros
  const [periodo, setPeriodo] = useState("mensal") // diário | semanal | mensal | trimestral
  const [deposito, setDeposito] = useState("todos") // sp | rj | mg | todos
  const [storage, setStorage] = useState("todos")  // CSS | NORMAL | todos

  // Estados (produção: sem mocks; fallback = zeros/arrays vazios)
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [receitaVsCusto, setReceitaVsCusto] = useState<SerieReceitaCusto[] | null>(null)
  const [aging, setAging] = useState<AgingItem[] | null>(null)
  const [combSemanas, setCombSemanas] = useState<CombSemanal[] | null>(null)
  const [manutencoes, setManutencoes] = useState<ManutencaoItem[] | null>(null)
  const [rotas, setRotas] = useState<RotaItem[] | null>(null)
  const [utilizacaoFrota, setUtilizacaoFrota] = useState<Utilizacao[] | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega dados do Supabase respeitando filtros básicos
  async function loadData() {
    setLoading(true)

    // Helper para anexar filtros se colunas existirem nas views (sem quebrar)
    const withFilters = <T,>(q: any) => {
      if (deposito !== "todos") q = q.eq?.("deposito", deposito) ?? q
      if (storage !== "todos") q = q.eq?.("storage_type", storage) ?? q
      if (periodo) q = q.eq?.("periodo", periodo) ?? q // só aplica se a view tiver coluna "periodo"
      return q
    }

    const [kpiRes, receitaRes, agingRes, combRes, manRes, rotasRes, utilRes] = await Promise.all([
      withFilters(supabase.from("vw_dash_kpis").select("*")) as any,
      withFilters(supabase.from("vw_dash_receita_vs_custo").select("mes, receita, custo")) as any,
      withFilters(supabase.from("vw_dash_aging").select("faixa, valor")) as any,
      withFilters(supabase.from("vw_dash_combustivel_semana").select("sem, gasto, meta")) as any,
      withFilters(supabase.from("vw_dash_manutencoes").select("placa, tipo, data, custo, status")) as any,
      withFilters(supabase.from("vw_dash_rotas").select("rota, servicos, receita, custo, tempoMedio")) as any,
      withFilters(supabase.from("vw_dash_utilizacao_frota").select("name, value")) as any,
    ])

    // KPIs (espera 1 linha). Se vier vazio/erro => zeros
    const kpiRow = (kpiRes?.data?.[0] ?? null) as KPIData | null
    setKpis(
      kpiRow ?? {
        receita_mensal: 0,
        receita_meta: 0,
        margem_lucro: 0,
        lucro_liquido: 0,
        custos_operacionais: 0,
        combustivel: 0,
        manutencao: 0,
        contas_receber: 0,
        contas_vencidas: 0,
        faturas_criticas: 0,
      }
    )

    setReceitaVsCusto(Array.isArray(receitaRes?.data) ? receitaRes.data : [])
    setAging(Array.isArray(agingRes?.data) ? agingRes.data : [])
    setCombSemanas(Array.isArray(combRes?.data) ? combRes.data : [])
    setManutencoes(Array.isArray(manRes?.data) ? manRes.data : [])
    setRotas(Array.isArray(rotasRes?.data) ? rotasRes.data : [])
    setUtilizacaoFrota(Array.isArray(utilRes?.data) ? utilRes.data : [])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, deposito, storage])

  const metaPct = useMemo(() => {
    if (!kpis) return 0
    const denom = kpis.receita_meta || 0
    return denom === 0 ? 0 : Math.min(100, (kpis.receita_mensal / denom) * 100)
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
          <div className="flex items-center gap-2">
            <Label className="text-xs">Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Depósito</Label>
            <Select value={deposito} onValueChange={setDeposito}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sp">São Paulo</SelectItem>
                <SelectItem value="rj">Rio de Janeiro</SelectItem>
                <SelectItem value="mg">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Storage Type</Label>
            <Select value={storage} onValueChange={setStorage}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="CSS">CSS</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ThemeToggle />
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Hoje: {new Date().toLocaleDateString("pt-BR")}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" /> Filtros <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Outros filtros</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cliente prioritário</DropdownMenuItem>
              <DropdownMenuItem>Somente rotas críticas</DropdownMenuItem>
              <DropdownMenuItem>Exibir custos ocultos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-primary">{currency(kpis?.receita_mensal || 0)}</div>
            )}
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
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{(kpis?.margem_lucro || 0).toFixed(1)}%</div>
            )}
            <p className="text-xs text-muted-foreground">Lucro líquido: {currency(kpis?.lucro_liquido || 0)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Operacionais</CardTitle>
            <Fuel className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-accent">{currency(kpis?.custos_operacionais || 0)}</div>
            )}
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
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div className="text-2xl font-bold text-accent">{currency(kpis?.contas_receber || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground">Vencidas: {currency(kpis?.contas_vencidas || 0)}</p>
            <div className="mt-2 text-xs text-destructive">Ação necessária: {kpis?.faturas_criticas ?? 0} faturas</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Alertas */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Receita vs Custo (Área) */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Tendência de Receita × Custo
            </CardTitle>
            <CardDescription>Consolidado por período</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={receitaVsCusto || []} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
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
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => currency(v)} width={80} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke={PRIMARY} fill="url(#rev)" />
                  <Area type="monotone" dataKey="custo" name="Custo" stroke={ACCENT} fill="url(#cst)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Alertas Financeiros */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Alertas Financeiros Críticos
            </CardTitle>
            <CardDescription>Itens que exigem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-md border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-destructive rounded-full" />
                <div>
                  <p className="text-sm font-medium">Faturas vencidas há mais de 30 dias</p>
                  <p className="text-xs text-muted-foreground">Total: {currency(kpis?.contas_vencidas || 0)}</p>
                </div>
              </div>
              <Button size="sm" variant="destructive">Cobrar</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-md border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-accent rounded-full" />
                <div>
                  <p className="text-sm font-medium">Combustível acima da média</p>
                  <p className="text-xs text-muted-foreground">Verificar desvios de consumo</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Investigar</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-md border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div>
                  <p className="text-sm font-medium">Oportunidades de otimização de rotas</p>
                  <p className="text-xs text-muted-foreground">Abrir análise de rotas</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Analisar</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frota + Financeiro secundário */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Utilização da Frota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Utilização da Frota</CardTitle>
            <CardDescription>Distribuição por nível de uso</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={utilizacaoFrota || []} dataKey="value" nameKey="name" outerRadius={90} label>
                    {(utilizacaoFrota || []).map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? PRIMARY : ACCENT} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Aging de Recebíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Aging de Recebíveis</CardTitle>
            <CardDescription>Distribuição por faixa de atraso</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aging || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="faixa" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => currency(v)} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {(aging || []).map((_, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? PRIMARY : ACCENT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Combustível x Meta (semanal) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5" /> Combustível × Meta (Semanal)</CardTitle>
            <CardDescription>Gasto real comparado à meta</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combSemanas || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => currency(v)} />
                  <Tooltip formatter={(v: number) => currency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="gasto" name="Gasto" stroke={ACCENT} strokeWidth={2} dot />
                  <Line type="monotone" dataKey="meta" name="Meta" stroke={PRIMARY} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas + Tabelas */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Ações Rápidas */}
        <Card className="xl:col-span-1">
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

        {/* Rotas e Performance */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" /> Rotas e Performance</CardTitle>
            <CardDescription>Serviços, receita, custo e tempo médio</CardDescription>
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
                    <TableHead className="text-right">Margem</TableHead>
                    <TableHead className="text-right">Tempo Médio (h)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rotas || []).length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">Sem dados</TableCell>
                    </TableRow>
                  )}
                  {(rotas || []).map((r, i) => {
                    const margem = r && r.receita ? (1 - (r.custo || 0) / (r.receita || 1)) * 100 : 0
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.rota}</TableCell>
                        <TableCell className="text-right">{r.servicos ?? 0}</TableCell>
                        <TableCell className="text-right">{currency(r.receita || 0)}</TableCell>
                        <TableCell className="text-right">{currency(r.custo || 0)}</TableCell>
                        <TableCell className="text-right">{margem.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{r.tempoMedio ?? 0}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manutenções & Atividade */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Manutenções programadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Manutenções Próximas</CardTitle>
            <CardDescription>Preventivas e corretivas</CardDescription>
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
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(manutencoes || []).length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">Sem dados</TableCell>
                    </TableRow>
                  )}
                  {(manutencoes || []).map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{m.placa}</TableCell>
                      <TableCell>{m.tipo}</TableCell>
                      <TableCell>{m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "-"}</TableCell>
                      <TableCell className="text-right">{currency(m.custo || 0)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={m.status === "Agendada" ? "secondary" : m.status === "A Aprovar" ? "outline" : "default"}>
                          {m.status || "-"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente (placeholder de produção: alimente de uma view se desejar) */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas movimentações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {/* Conecte a uma view vw_dash_atividade se existir; por enquanto, exibimos vazio quando não houver dados */}
            <div>Nenhuma atividade recente.</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()} JB Transportes — Painel operacional & financeiro
      </div>
    </div>
  )
}
