"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.log("[v0] Google login error:", error)
      setError("Erro ao fazer login com Google. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminRole = async (userId: string) => {
    const supabase = createClient()

    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (error) {
      console.log("[v0] Error checking user role:", error)
      throw new Error("Erro ao verificar permissões do usuário")
    }

    if (profile?.role !== "admin") {
      throw new Error("Acesso negado. Apenas administradores podem acessar o sistema.")
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      console.log("[v0] Login successful:", data)
      if (data.user) {
        await checkAdminRole(data.user.id)
        console.log("[v0] Admin verification successful, redirecting to dashboard")
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.log("[v0] Authentication error:", error)
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais."

      if (error.message === "Invalid login credentials") {
        errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente."
      } else if (error.message === "Email not confirmed") {
        errorMessage =
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e clique no link de confirmação."
      } else if (error.message === "Too many requests") {
        errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos."
      } else if (error.message.includes("Acesso negado")) {
        errorMessage = error.message
      } else if (error.message.includes("verificar permissões")) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
            <Truck className="h-8 w-8 text-primary" />
            JB Transportes
          </Link>
          <p className="text-muted-foreground mt-2">Sistema de Gestão</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta para gerenciar suas operações</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                  {error}
                  {error.includes("e-mail ainda não foi confirmado") && (
                    <div className="mt-2">
                      <Link href="/auth/resend-confirmation" className="text-primary hover:underline text-sm">
                        Reenviar e-mail de confirmação
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
                disabled={isLoading}
                onClick={handleGoogleLogin}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/auth/sign-up" className="text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  )
}
