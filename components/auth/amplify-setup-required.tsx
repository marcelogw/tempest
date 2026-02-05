'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal, Rocket } from 'lucide-react'

/**
 * AmplifySetupRequired - Shown when Amplify backend is not yet configured
 *
 * Guides the user through the initial setup process
 */
export function AmplifySetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rocket className="text-primary h-6 w-6" />
            <CardTitle className="text-2xl">Configuração do Backend</CardTitle>
          </div>
          <CardDescription>
            O Amplify ainda não foi configurado. Siga os passos abaixo para iniciar o backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Passo 1: Iniciar o Sandbox Local</AlertTitle>
            <AlertDescription className="mt-2">
              <code className="bg-muted block rounded p-3 font-mono text-sm">npx ampx sandbox</code>
              <p className="text-muted-foreground mt-2 text-sm">
                Este comando irá:
                <br />
                • Criar recursos da AWS (DynamoDB, Cognito, AppSync)
                <br />• Gerar o arquivo <code className="text-xs">amplify_outputs.json</code>
                <br />• Ativar hot-reload para mudanças no schema
              </p>
            </AlertDescription>
          </Alert>

          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Passo 2: Recarregar a Aplicação</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="text-sm">
                Após o sandbox iniciar com sucesso, recarregue esta página. A autenticação e o banco
                de dados estarão disponíveis.
              </p>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">Primeira vez usando Amplify?</h4>
            <p className="text-muted-foreground text-sm">
              Você precisará ter credenciais AWS configuradas. O sandbox criará recursos na sua
              conta AWS. Para desenvolvimento local, todos os recursos são gratuitos (dentro do free
              tier).
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">Desenvolvimento sem Backend</h4>
            <p className="text-muted-foreground text-sm">
              A aplicação continua funcionando com o Zustand store local (localStorage). O Amplify é
              opcional e adiciona sincronização na nuvem e autenticação de usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
