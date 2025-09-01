// app/dashboard/profile/page.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, Shield, Edit, Camera, Save, Loader2 } from "lucide-react";

/**
 * Schema de profiles (conforme SQL):
 * id (uuid, = auth.users.id), first_name, last_name, email, phone, role, created_at, updated_at
 */

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
};

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export default function ProfilePage() {
  const sb = React.useMemo(() => createBrowserClient(), []);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changingPass, setChangingPass] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  // auth
  const [userId, setUserId] = React.useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = React.useState<string | null>(null);

  // form
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<string | null>(null);
  const [createdAt, setCreatedAt] = React.useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null);

  // password
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: authData, error: authErr } = await sb.auth.getUser();
        if (authErr) throw authErr;
        const user = authData.user;
        if (!user) {
          toast.error("Usuário não autenticado");
          setLoading(false);
          return;
        }
        setUserId(user.id);
        // @ts-ignore - supabase retorna esta prop
        setLastSignInAt((user as any)?.last_sign_in_at || null);

        // perfil
        const { data: prof, error: profErr, status } = await sb
          .from("profiles")
          .select("id, first_name, last_name, email, phone, role, created_at, updated_at")
          .eq("id", user.id)
          .maybeSingle();
        if (profErr && status !== 406) throw profErr;

        if (prof) {
          setFirstName(prof.first_name || "");
          setLastName(prof.last_name || "");
          setEmail(prof.email || user.email || "");
          setPhone(prof.phone || "");
          setRole(prof.role || "user");
          setCreatedAt(prof.created_at || null);
          setUpdatedAt(prof.updated_at || null);
        } else {
          // fallback — cria registro mínimo se trigger ainda não criou
          const { error: insErr } = await sb.from("profiles").insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name ?? "",
            last_name: user.user_metadata?.last_name ?? "",
          } as Partial<ProfileRow>);
          if (insErr) throw insErr;
          setFirstName(user.user_metadata?.first_name ?? "");
          setLastName(user.user_metadata?.last_name ?? "");
          setEmail(user.email ?? "");
          setRole("user");
        }
      } catch (e: any) {
        console.error(e);
        toast.error("Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sb]);

  const initials = (firstName?.[0] || "").toUpperCase() + (lastName?.[0] || "").toUpperCase();

  async function saveProfile() {
    if (!userId) return;
    try {
      setSaving(true);
      // 1) update profiles
      const { error: upErr } = await sb
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        })
        .eq("id", userId);
      if (upErr) throw upErr;

      // 2) sync email with auth if changed
      const { data: authCurrent } = await sb.auth.getUser();
      if (authCurrent?.user?.email && authCurrent.user.email !== email.trim()) {
        const { error: authErr } = await sb.auth.updateUser({ email: email.trim() });
        if (authErr) {
          // não bloquear o save; apenas reporta
          toast.warning("Perfil salvo, mas não foi possível atualizar o e-mail de login.");
        }
      }

      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!userId) return;
    if (!newPassword) {
      toast.message("Informe a nova senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.message("As senhas não conferem.");
      return;
    }
    try {
      setChangingPass(true);
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível alterar a senha.");
    } finally {
      setChangingPass(false);
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações de conta</p>
        </div>
        {isEditing ? (
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Salvar
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />Editar
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture & Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {/* Se tiver avatar_url no futuro, troque o src */}
                  <AvatarImage src={""} alt="Avatar" />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {initials || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-transparent"
                    onClick={() => toast.message("Upload de avatar ainda não configurado.")}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <CardTitle className="leading-tight">
              {loading ? "—" : [firstName, lastName].filter(Boolean).join(" ") || "Sem nome"}
            </CardTitle>
            <CardDescription>
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {role || "user"}
              </span>
            </CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Membro desde {fmtDate(createdAt)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Último acesso: {fmtDate(lastSignInAt)}
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>

            {/* Observações ou bio futura */}
            <div className="space-y-2">
              <Label htmlFor="address">Observações</Label>
              <Textarea
                id="address"
                placeholder="Anotações sobre sua conta (opcional)"
                disabled
                className="bg-muted"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Altere sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex items-end md:col-span-1">
                <Button type="button" onClick={changePassword} disabled={changingPass}>
                  {changingPass ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Alterando…
                    </>
                  ) : (
                    <>Alterar Senha</>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              * Para alterações de e-mail, salvamos o perfil e tentamos sincronizar com o login. Em alguns casos o provedor pode exigir nova confirmação de e-mail.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
