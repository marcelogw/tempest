'use client'

import { useState } from 'react'
import { Plus, Trash2, CreditCard, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useExpenseStore, formatCurrencyBRL } from '@/lib/expense-store'

interface InstallmentsProps {
  currentMonth: string
  showAllInstallments?: boolean
}

export function Installments({ currentMonth, showAllInstallments = false }: InstallmentsProps) {
  const { creditCards, installments, addInstallment, removeInstallment, getInstallmentsForMonth } =
    useExpenseStore()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [card, setCard] = useState<string>('')
  const [totalInstallments, setTotalInstallments] = useState('')
  const [amount, setAmount] = useState('')

  const sortedCards = [...creditCards].sort((a, b) => a.order - b.order)

  const currentInstallments = getInstallmentsForMonth(currentMonth)

  // Calculate total installments amount for this month
  const totalInstallmentsAmount = currentInstallments.reduce(
    (sum, { installment }) => sum + installment.amountPerInstallment,
    0
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !totalInstallments || !amount) return

    addInstallment({
      name,
      card,
      totalInstallments: parseInt(totalInstallments),
      amountPerInstallment: parseFloat(amount),
      startMonth: currentMonth,
    })

    // Reset form
    setName('')
    setCard('nubank_pri')
    setTotalInstallments('')
    setAmount('')
    setIsOpen(false)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-4 w-4 text-purple-500" />
            Parcelamentos
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 bg-transparent text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Parcelamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="installment-name">Nome</Label>
                  <Input
                    id="installment-name"
                    placeholder="Ex: Tablet Samsung"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card">Cartão</Label>
                  <Select value={card} onValueChange={setCard} disabled={sortedCards.length === 0}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          sortedCards.length === 0
                            ? 'Crie um cartão primeiro'
                            : 'Selecione o cartão'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="48"
                      placeholder="10"
                      value={totalInstallments}
                      onChange={(e) => setTotalInstallments(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor por Parcela</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="150.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Parcelamento</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentInstallments.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            Nenhum parcelamento ativo este mes
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {currentInstallments.map(({ installment, currentNumber }) => {
                const card = creditCards.find((c) => c.id === installment.card)
                const cardColor = card?.color || '#64748b'
                const cardName = card?.name || 'Cartão desconhecido'

                return (
                  <div
                    key={installment.id}
                    className="bg-muted/50 border-border flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-2 rounded-full"
                        style={{ backgroundColor: cardColor }}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {installment.name} {currentNumber}/{installment.totalInstallments}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <CreditCard className="h-3 w-3" />
                          {cardName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-semibold">
                        {formatCurrencyBRL(installment.amountPerInstallment)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-7 w-7"
                        onClick={() => removeInstallment(installment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-border border-t pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Parcelamentos</span>
                <span className="font-semibold text-purple-600">
                  {formatCurrencyBRL(totalInstallmentsAmount)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Show all active installments overview */}
        {showAllInstallments && installments.length > 0 && (
          <div className="border-border border-t pt-3">
            <p className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Todos os parcelamentos ativos ({installments.length})
            </p>
            <div className="space-y-1">
              {installments.map((inst) => {
                const [startYear, startMonth] = inst.startMonth.split('-').map(Number)
                const endDate = new Date(startYear, startMonth - 1 + inst.totalInstallments - 1, 1)
                const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`

                return (
                  <div key={inst.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground max-w-[140px] truncate">
                      {inst.name}
                    </span>
                    <span className="text-muted-foreground">
                      {inst.startMonth.replace('-', '/')} - {endMonth.replace('-', '/')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
