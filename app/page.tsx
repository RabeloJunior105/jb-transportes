import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  MapPin,
  Clock,
  Shield,
  Users,
  Phone,
  Mail,
  Star,
  CheckCircle,
  ArrowRight,
  Package,
  Globe,
  Award,
} from "lucide-react"
import Link from "next/link"
import { createClient } from '@supabase/supabase-js'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">JB Transportes</span>
              <p className="text-xs text-muted-foreground">Conectando o Brasil</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#servicos" className="text-muted-foreground hover:text-primary transition-colors">
                Serviços
              </a>
              <a href="#sobre" className="text-muted-foreground hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </div>
            {/* Profile/Login Button */}
            {/* Mock user object for demonstration; replace with real authentication logic */}
            {(async () => {
              // Supabase authentication
              const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
              const { data: { user } } = await supabase.auth.getUser()

              return user ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="p-0 rounded-full w-9 h-9 flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-9 h-9 flex items-center justify-center font-bold text-lg">
                      {`${user.user_metadata.first_name?.[0] ?? ""}${user.user_metadata.last_name?.[0] ?? ""}`.toUpperCase()}
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
              );
            })()}
          </div>
        </div>
      </header >

      {/* Hero Section */}
      < section className="relative py-24 px-4 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden" >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto text-center max-w-6xl relative">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
            <Award className="h-4 w-4 mr-2" />
            Mais de 15 anos conectando o Brasil
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black text-foreground mb-8 leading-tight">
            Transporte de
            <span className="text-primary block">Carga Pesada</span>
            para todo o Brasil
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Especialistas em logística de carga pesada com frota própria, tecnologia avançada e cobertura nacional. Sua
            carga em segurança, no prazo certo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/quote">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
              >
                Solicitar Orçamento Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+5511999999999">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg bg-transparent">
                <Phone className="mr-2 h-5 w-5" />
                (11) 99999-9999
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Entregas Realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-sm text-muted-foreground">Veículos na Frota</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.8%</div>
              <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            </div>
          </div>
        </div>
      </section >

      {/* Services Section */}
      < section id="servicos" className="py-20 px-4 bg-muted/30" >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Nossos Serviços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Soluções Completas em
              <span className="text-primary block">Transporte de Carga Pesada</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Oferecemos serviços especializados para atender todas as necessidades de transporte da sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Carga Pesada Rodoviária</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Transporte especializado de equipamentos industriais, máquinas e cargas com peso superior a 10
                  toneladas.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Carretas especiais e pranchas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Escolta especializada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Licenças e autorizações
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Cargas Especiais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Movimentação de cargas indivisíveis, equipamentos industriais e projetos especiais.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Análise de rota personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Equipamentos de içamento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Seguro total da carga
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Logística Integrada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Soluções completas de armazenagem, distribuição e gestão logística para sua empresa.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Armazenagem especializada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Gestão de estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    Distribuição nacional
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section >

      {/* Why Choose Us */}
      < section className="py-20 px-4" >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Nossos Diferenciais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Por que escolher a<span className="text-primary block">JB Transportes?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Cobertura Nacional</h3>
              <p className="text-muted-foreground">
                Atendemos todos os estados brasileiros com rotas otimizadas e prazos garantidos.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Segurança Total</h3>
              <p className="text-muted-foreground">
                Frota moderna, rastreamento 24h e seguro completo para sua carga pesada.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Pontualidade</h3>
              <p className="text-muted-foreground">
                Compromisso com prazos e comunicação transparente durante todo o transporte.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Equipe Especializada</h3>
              <p className="text-muted-foreground">
                Profissionais experientes em transporte de carga pesada e projetos especiais.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* Testimonials */}
      < section className="py-20 px-4 bg-muted/30" >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              O que nossos clientes
              <span className="text-primary block">dizem sobre nós</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "Excelente serviço! Transportaram nossos equipamentos industriais com total segurança. Recomendo para
                  qualquer empresa que precise de transporte de carga pesada."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Carlos Silva</p>
                    <p className="text-sm text-muted-foreground">Diretor - Metalúrgica São Paulo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "Pontualidade e profissionalismo exemplares. A JB Transportes é nossa parceira há anos no transporte
                  de máquinas pesadas. Nunca nos decepcionaram."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Ana Costa</p>
                    <p className="text-sm text-muted-foreground">Gerente - Construtora Rio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <CardDescription className="text-base">
                  "Serviço impecável do início ao fim. Cuidado especial com nossa carga e comunicação constante sobre o
                  status do transporte. Muito satisfeitos!"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Roberto Lima</p>
                    <p className="text-sm text-muted-foreground">CEO - Indústria Mineira</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section id="contato" className="py-20 px-4 bg-primary text-primary-foreground" >
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para transportar sua carga pesada?</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Entre em contato conosco e receba um orçamento personalizado para suas necessidades de transporte. Nossa
            equipe está pronta para atender você 24 horas por dia.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/quote">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                Solicitar Orçamento Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="tel:+5511999999999">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Phone className="mr-2 h-5 w-5" />
                (11) 99999-9999
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Phone className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">Telefone</p>
                <p className="opacity-90">(11) 99999-9999</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Mail className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">E-mail</p>
                <p className="opacity-90">contato@jbtransportes.com.br</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">Atendimento</p>
                <p className="opacity-90">24 horas por dia</p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-card border-t border-border py-12 px-4" >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xl font-bold text-foreground">JB Transportes</span>
                  <p className="text-xs text-muted-foreground">Conectando o Brasil</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Especialistas em transporte de carga pesada com mais de 15 anos de experiência no mercado brasileiro.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Carga Pesada Rodoviária</li>
                <li>Cargas Especiais</li>
                <li>Logística Integrada</li>
                <li>Consultoria em Transporte</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Sobre Nós</li>
                <li>Nossa Frota</li>
                <li>Certificações</li>
                <li>Trabalhe Conosco</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>(11) 99999-9999</li>
                <li>contato@jbtransportes.com.br</li>
                <li>São Paulo - SP</li>
                <li>Atendimento 24h</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 JB Transportes. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
            </p>
          </div>
        </div>
      </footer >
    </div >
  )
}
