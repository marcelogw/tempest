'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

interface SummaryCardsProps {
  income: number
  totalExpenses: number
  investments: number
  savings: number
  previousMonthExpenses?: number
}

export function SummaryCards({
  income,
  totalExpenses,
  investments,
  savings,
  previousMonthExpenses,
}: SummaryCardsProps) {
  const i = useTranslations()
  const netBalance = income - totalExpenses - investments - savings
  const expenseChange = previousMonthExpenses
    ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    : 0

  const cards = [
    {
      title: i('ui.summary.totalIncome'),
      value: income,
      icon: Wallet,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: null,
    },
    {
      title: i('ui.summary.totalExpenses'),
      value: totalExpenses,
      icon: CreditCard,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      trend: expenseChange,
      trendLabel: i('ui.summary.vsPreviousMonth'),
    },
    {
      title: i('ui.summary.investments'),
      value: investments,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: null,
    },
    {
      title: i('ui.summary.savings'),
      value: savings,
      icon: PiggyBank,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-border/50 shadow-sm transition-shadow hover:shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                <p className="text-foreground text-2xl font-bold">{formatCurrency(card.value)}</p>
                {card.trend !== null && (
                  <div className="flex items-center gap-1 text-xs">
                    {card.trend >= 0 ? (
                      <>
                        <ArrowUpRight className="text-destructive h-3 w-3" />
                        <span className="text-destructive">+{card.trend.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="text-accent h-3 w-3" />
                        <span className="text-accent">{card.trend.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">{card.trendLabel}</span>
                  </div>
                )}
              </div>
              <div className={cn('rounded-lg p-2.5', card.bgColor)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card
        className={cn(
          'border-border/50 col-span-1 shadow-sm sm:col-span-2 lg:col-span-4',
          netBalance >= 0 ? 'bg-accent/5' : 'bg-destructive/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-2.5',
                  netBalance >= 0 ? 'bg-accent/10' : 'bg-destructive/10'
                )}
              >
                {netBalance >= 0 ? (
                  <TrendingUp className="text-accent h-5 w-5" />
                ) : (
                  <TrendingDown className="text-destructive h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {i('ui.summary.netBalance')}
                </p>
                <p className="text-muted-foreground text-xs">{i('ui.summary.balanceFormula')}</p>
              </div>
            </div>
            <p
              className={cn(
                'text-2xl font-bold',
                netBalance >= 0 ? 'text-accent' : 'text-destructive'
              )}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
