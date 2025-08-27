"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, AlertCircle } from "lucide-react"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message") || "Ocorreu um erro durante a autenticação"

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

        {/* Error Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/20">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Erro de Autenticação</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/login">Tentar Novamente</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/resend-confirmation">Reenviar Confirmação</Link>
              </Button>
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
