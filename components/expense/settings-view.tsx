'use client'

import { useState } from 'react'
import { useExpenseStore } from '@/lib/expense-store'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertTriangle } from 'lucide-react'

export function SettingsView() {
  const { deleteYearData, deleteAllData, getAvailableYears } = useExpenseStore()
  const { toast } = useToast()

  const [deleteYearDialogOpen, setDeleteYearDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [confirmationText, setConfirmationText] = useState('')

  const availableYears = getAvailableYears()

  const handleDeleteYear = () => {
    if (!selectedYear) return

    deleteYearData(selectedYear)
    setDeleteYearDialogOpen(false)
    setSelectedYear('')

    toast({
      title: 'Dados deletados',
      description: `Todos os dados de ${selectedYear} foram removidos com sucesso.`,
    })
  }

  const handleDeleteAll = () => {
    if (confirmationText !== 'DELETAR TUDO') return

    deleteAllData()
    setDeleteAllDialogOpen(false)
    setConfirmationText('')

    toast({
      title: 'Todos os dados foram deletados',
      description: 'O aplicativo foi resetado para o estado inicial.',
    })
  }

  return (
    <>
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        {/* Header Section (sticky) */}
        <div className="border-b p-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus dados e preferências do sistema
            </p>
          </div>
        </div>

        {/* Content Section (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Seção: Gerenciamento de Dados */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-6 text-xl font-semibold">Gerenciamento de Dados</h2>

              <div className="space-y-4">
                {/* Card: Deletar Ano Específico */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-base font-medium">Deletar dados de um ano</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Remove todos os dados (receitas, despesas, parcelamentos) de um ano específico
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-muted-foreground mb-2 block text-sm">
                        Selecione o ano
                      </label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um ano..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteYearDialogOpen(true)}
                      disabled={!selectedYear}
                    >
                      Deletar Ano
                    </Button>
                  </div>
                </div>

                {/* Card: Deletar Todos os Dados */}
                <div className="border-destructive/50 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-destructive mb-2 text-base font-medium">
                        Zona de Perigo
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Deleta TODOS os dados do aplicativo. Esta ação não pode ser desfeita.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteAllDialogOpen(true)}
                        className="w-full sm:w-auto"
                      >
                        Deletar Todos os Dados
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmação - Deletar Ano */}
      <AlertDialog open={deleteYearDialogOpen} onOpenChange={setDeleteYearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Ano {selectedYear}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Tem certeza que deseja excluir todos os dados de <strong>{selectedYear}</strong>?
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium">Serão deletados:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Todas as receitas de {selectedYear}</li>
                    <li>• Todas as despesas fixas e variáveis</li>
                    <li>• Todos os parcelamentos iniciados neste ano</li>
                  </ul>
                </div>
                <p className="text-destructive font-medium">Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteYear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Ano
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Confirmação - Deletar Todos os Dados */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Atenção: Deletar Todos os Dados
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Esta é uma ação <strong className="text-destructive">IRREVERSÍVEL</strong>.
                </p>
                <div className="bg-destructive/10 border-destructive/50 rounded-lg border p-3">
                  <p className="text-sm font-medium">Serão deletados permanentemente:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Todos os dados de receitas e despesas</li>
                    <li>• Todos os parcelamentos</li>
                    <li>• Todas as configurações de categorias</li>
                    <li>• Todas as configurações de cartões de crédito</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Digite <code className="bg-muted rounded px-2 py-1">DELETAR TUDO</code> para
                    confirmar:
                  </p>
                  <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Digite DELETAR TUDO"
                    className="font-mono"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmationText('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={confirmationText !== 'DELETAR TUDO'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Deletar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
