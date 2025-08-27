"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Settings, Bell, Shield, Database, Mail, Smartphone, Save, Download, Upload } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema e preferências</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Escolha entre tema claro, escuro ou automático</p>
              </div>
              <ThemeToggle />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Idioma</Label>
                  <p className="text-sm text-muted-foreground">Selecione o idioma do sistema</p>
                </div>
                <Select defaultValue="pt-br">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (BR)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fuso Horário</Label>
                  <p className="text-sm text-muted-foreground">Configure o fuso horário do sistema</p>
                </div>
                <Select defaultValue="america-sao_paulo">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao_paulo">América/São Paulo</SelectItem>
                    <SelectItem value="america-rio_branco">América/Rio Branco</SelectItem>
                    <SelectItem value="america-manaus">América/Manaus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você deseja receber notificações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificações por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">Receba alertas importantes por email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Notificações Push
                  </Label>
                  <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Notificações sobre manutenções vencidas</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas Financeiros</Label>
                  <p className="text-sm text-muted-foreground">Notificações sobre contas a pagar/receber</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Documentos</Label>
                  <p className="text-sm text-muted-foreground">CNH, licenças e documentos vencendo</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistema
            </CardTitle>
            <CardDescription>Configurações avançadas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Backup Automático</Label>
                <div className="flex items-center gap-4">
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="disabled">Desabilitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Fazer Backup
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Importar/Exportar Dados</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Desabilita o acesso ao sistema para manutenção</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logs Detalhados</Label>
                  <p className="text-sm text-muted-foreground">Registra ações detalhadas do sistema</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Configurações de segurança e acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tempo de Sessão (minutos)</Label>
                <Input type="number" defaultValue="60" className="w-32" />
                <p className="text-sm text-muted-foreground">Tempo limite para logout automático</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Adiciona uma camada extra de segurança</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Forçar HTTPS</Label>
                  <p className="text-sm text-muted-foreground">Redireciona automaticamente para HTTPS</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>IPs Permitidos</Label>
                <Input placeholder="192.168.1.1, 10.0.0.1" />
                <p className="text-sm text-muted-foreground">
                  Lista de IPs com acesso permitido (deixe vazio para permitir todos)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
