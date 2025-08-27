import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
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

        {/* Success Message */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Conta Criada com Sucesso!</CardTitle>
            <CardDescription>Sua senha foi armazenada com segurança</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Confirme seu e-mail</p>
                  <p className="text-xs text-muted-foreground">
                    Enviamos um link de confirmação para seu e-mail. Clique no link para ativar sua conta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Senha armazenada com segurança</p>
                  <p className="text-xs text-muted-foreground">
                    Sua senha foi criptografada e armazenada de forma segura pelo sistema Supabase.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Próximos passos:</strong>
                <br />
                1. Verifique sua caixa de entrada
                <br />
                2. Clique no link de confirmação
                <br />
                3. Faça login com suas credenciais
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button asChild className="w-full">
                <Link href="/login">Ir para Login</Link>
              </Button>

              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/auth/resend-confirmation">Reenviar E-mail de Confirmação</Link>
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
