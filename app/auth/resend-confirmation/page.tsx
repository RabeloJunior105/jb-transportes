"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Mail } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      setMessage("E-mail de confirmação reenviado! Verifique sua caixa de entrada.")
    } catch (error: any) {
      setError(error.message || "Erro ao reenviar e-mail de confirmação")
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

        {/* Resend Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reenviar Confirmação</CardTitle>
            <CardDescription>Digite seu e-mail para receber novamente o link de confirmação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResend} className="space-y-4">
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

              {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">{error}</div>}

              {message && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md">{message}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Reenviando..." : "Reenviar E-mail"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Lembrou da senha?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Fazer login
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
