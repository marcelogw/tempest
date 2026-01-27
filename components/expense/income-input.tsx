'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react'

interface IncomeInputProps {
  income: number
  investments: number
  savings: number
  onIncomeChange: (value: number) => void
  onInvestmentsChange: (value: number) => void
  onSavingsChange: (value: number) => void
}

export function IncomeInput({
  income,
  investments,
  savings,
  onIncomeChange,
  onInvestmentsChange,
  onSavingsChange,
}: IncomeInputProps) {
  const [incomeValue, setIncomeValue] = useState(income.toString())
  const [investmentsValue, setInvestmentsValue] = useState(investments.toString())
  const [savingsValue, setSavingsValue] = useState(savings.toString())

  useEffect(() => {
    setIncomeValue(income.toString())
  }, [income])

  useEffect(() => {
    setInvestmentsValue(investments.toString())
  }, [investments])

  useEffect(() => {
    setSavingsValue(savings.toString())
  }, [savings])

  const handleIncomeBlur = () => {
    const value = parseFloat(incomeValue) || 0
    onIncomeChange(value)
  }

  const handleInvestmentsBlur = () => {
    const value = parseFloat(investmentsValue) || 0
    onInvestmentsChange(value)
  }

  const handleSavingsBlur = () => {
    const value = parseFloat(savingsValue) || 0
    onSavingsChange(value)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Renda e Alocacoes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="income"
            className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
          >
            <DollarSign className="text-accent h-4 w-4" />
            Renda Mensal
          </Label>
          <div className="relative">
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
              R$
            </span>
            <Input
              id="income"
              type="number"
              min="0"
              step="0.01"
              value={incomeValue}
              onChange={(e) => setIncomeValue(e.target.value)}
              onBlur={handleIncomeBlur}
              className="pl-10"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
              Poupanca
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
