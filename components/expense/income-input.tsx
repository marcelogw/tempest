'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TrendingUp, PiggyBank, DollarSign, Plus } from 'lucide-react'
import { IncomeList } from './income-list'
import { formatCurrency } from '@/lib/formatters'
import { type Income } from '@/lib/expense-store'

interface IncomeSectionProps {
  incomes: Income[]
  investments: number
  savings: number
  onAddIncome: (income: Omit<Income, 'id'>, replicate: boolean) => void
  onRemoveIncome: (id: string) => void
  onUpdateIncome: (income: Income, makeRecurring?: boolean) => void
  onInvestmentsChange: (value: number) => void
  onSavingsChange: (value: number) => void
}

function AddIncomeDialog({
  onSubmit,
  i,
}: {
  onSubmit: (income: Omit<Income, 'id'>, replicate: boolean) => void
  i: (key: string) => string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [replicate, setReplicate] = useState(false)

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setReplicate(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount.replace(',', '.')) || 0
    onSubmit({ description, amount: amountNum }, replicate)
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
          <Plus className="h-4 w-4" />
          {i('common.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{i('forms.income.newIncome')}</DialogTitle>
          <DialogDescription>{i('forms.income.addIncomeForMonth')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-description">{i('forms.income.description.label')}</Label>
            <Input
              id="new-description"
              placeholder={i('forms.income.description.placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-amount">{i('forms.income.amount.label')}</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                R$
              </span>
              <Input
                id="new-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder={i('forms.income.amountPlaceholder')}
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-3">
            <Checkbox
              id="new-replicate"
              checked={replicate}
              onCheckedChange={(checked) => setReplicate(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="new-replicate"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {i('forms.income.replicateLabel')}
              </Label>
              <p className="text-muted-foreground text-xs">{i('forms.income.replicateHelp')}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {i('common.cancel')}
            </Button>
            <Button type="submit">{i('common.add')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function IncomeSection({
  incomes,
  investments,
  savings,
  onAddIncome,
  onRemoveIncome,
  onUpdateIncome,
  onInvestmentsChange,
  onSavingsChange,
}: IncomeSectionProps) {
  const i = useTranslations()
  const [investmentsValue, setInvestmentsValue] = useState(investments.toString())
  const [savingsValue, setSavingsValue] = useState(savings.toString())

  useEffect(() => {
    setInvestmentsValue(investments.toString())
  }, [investments])

  useEffect(() => {
    setSavingsValue(savings.toString())
  }, [savings])

  const handleInvestmentsBlur = () => {
    const value = parseFloat(investmentsValue) || 0
    onInvestmentsChange(value)
  }

  const handleSavingsBlur = () => {
    const value = parseFloat(savingsValue) || 0
    onSavingsChange(value)
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-emerald-500/10 p-1.5">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-base font-semibold">{i('ui.income.title')}</CardTitle>
          </div>
          <AddIncomeDialog onSubmit={onAddIncome} i={i} />
        </div>
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">{incomes.length} itens</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncome)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <IncomeList incomes={incomes} onRemove={onRemoveIncome} onUpdate={onUpdateIncome} />

        <div className="grid grid-cols-2 gap-3 border-t pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="investments"
              className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
            >
              <TrendingUp className="text-primary h-4 w-4" />
              Investimentos
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                R$
              </span>
              <Input
                id="investments"
                type="number"
                min="0"
                step="0.01"
                value={investmentsValue}
                onChange={(e) => setInvestmentsValue(e.target.value)}
                onBlur={handleInvestmentsBlur}
                className="pl-10"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="savings"
              className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
            >
              <PiggyBank className="text-chart-2 h-4 w-4" />
              Poupança
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                R$
              </span>
              <Input
                id="savings"
                type="number"
                min="0"
                step="0.01"
                value={savingsValue}
                onChange={(e) => setSavingsValue(e.target.value)}
                onBlur={handleSavingsBlur}
                className="pl-10"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
