"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Calendar, Shield, Edit, Camera, Save } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações de conta</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "default" : "outline"}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture & Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/admin-avatar.png" alt="Admin JB" />
                  <AvatarFallback className="text-lg">AJ</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <CardTitle>Admin JB</CardTitle>
            <CardDescription>Administrador do Sistema</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Administrador
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Membro desde Janeiro 2024
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              São Paulo, SP
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Suas informações básicas e de contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  defaultValue="Admin"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" defaultValue="JB" disabled={!isEditing} className={!isEditing ? "bg-muted" : ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  defaultValue="admin@jbtransportes.com.br"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  defaultValue="(11) 99999-9999"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Configurações de Segurança</CardTitle>
            <CardDescription>Gerencie sua senha e configurações de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Atividade Recente</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Último login</span>
                  <span className="text-muted-foreground">Hoje às 08:30</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Alteração de senha</span>
                  <span className="text-muted-foreground">Há 30 dias</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Login de novo dispositivo</span>
                  <span className="text-muted-foreground">Há 45 dias</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
