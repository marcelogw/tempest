'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useExpenseStore, categoryLabels, categoryColors, formatCurrencyBRL, formatShortCurrencyBRL, type ExpenseCategory } from '@/lib/expense-store'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardView() {
  const { monthlyData, currentYear } = useExpenseStore()

  // Get sorted months data
  const monthsData = useMemo(() => {
    const yearMonths = Object.values(monthlyData)
      .filter((month) => month.month.startsWith(currentYear))
      .sort((a, b) => a.month.localeCompare(b.month))

    return yearMonths.map((month) => {
      const fixedTotal = month.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
      const variableTotal = month.variableExpenses.reduce((sum, e) => sum + e.amount, 0)
      const totalExpenses = fixedTotal + variableTotal
      
      const date = new Date(month.month + '-01')
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })

      return {
        month: monthLabel,
        fullMonth: month.month,
        income: month.income,
        expenses: totalExpenses,
        fixed: fixedTotal,
        variable: variableTotal,
        investments: month.investments,
        savings: month.savings,
        net: month.income - totalExpenses - month.investments - month.savings,
      }
    })
  }, [monthlyData, currentYear])

  // Calculate category averages across all months
  const categoryAverages = useMemo(() => {
    const categoryTotals: Record<ExpenseCategory, number[]> = {
      credit_card: [],
      groceries: [],
      utilities: [],
      entertainment: [],
      transportation: [],
      healthcare: [],
      dining: [],
      shopping: [],
      subscriptions: [],
      other: [],
    }

    Object.values(monthlyData)
      .filter((month) => month.month.startsWith(currentYear))
      .forEach((month) => {
      const monthCategoryTotals: Record<ExpenseCategory, number> = {
        credit_card: 0,
        groceries: 0,
        utilities: 0,
        entertainment: 0,
        transportation: 0,
        healthcare: 0,
        dining: 0,
        shopping: 0,
        subscriptions: 0,
        other: 0,
      }

      ;[...month.fixedExpenses, ...month.variableExpenses].forEach((expense) => {
        monthCategoryTotals[expense.category] += expense.amount
      })

      Object.entries(monthCategoryTotals).forEach(([cat, total]) => {
        if (total > 0) {
          categoryTotals[cat as ExpenseCategory].push(total)
        }
      })
    })

    return Object.entries(categoryTotals)
      .filter(([, values]) => values.length > 0)
      .map(([category, values]) => ({
        category: category as ExpenseCategory,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        total: values.reduce((sum, v) => sum + v, 0),
        months: values.length,
      }))
      .sort((a, b) => b.average - a.average)
  }, [monthlyData, currentYear])

  // Calculate insights
  const insights = useMemo(() => {
    if (monthsData.length < 2) return null

    const currentMonth = monthsData[monthsData.length - 1]
    const previousMonth = monthsData[monthsData.length - 2]

    const expenseChange = previousMonth.expenses > 0
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : 0

    const avgMonthlyExpense = monthsData.reduce((sum, m) => sum + m.expenses, 0) / monthsData.length
    const avgMonthlySavings = monthsData.reduce((sum, m) => sum + m.savings, 0) / monthsData.length
    const avgMonthlyInvestments = monthsData.reduce((sum, m) => sum + m.investments, 0) / monthsData.length
    const totalSaved = monthsData.reduce((sum, m) => sum + m.savings + m.investments, 0)

    const savingsRate = currentMonth.income > 0 
      ? ((currentMonth.savings + currentMonth.investments) / currentMonth.income) * 100
      : 0

    return {
      expenseChange,
      avgMonthlyExpense,
      avgMonthlySavings,
      avgMonthlyInvestments,
      totalSaved,
      savingsRate,
      currentMonth,
      previousMonth,
    }
  }, [monthsData])

  // Pie chart data
  const pieData = useMemo(() => {
    return categoryAverages.slice(0, 6).map((item) => ({
      name: categoryLabels[item.category],
      value: item.average,
      color: categoryColors[item.category],
    }))
  }, [categoryAverages])

  const chartColors = {
    income: '#22c55e',
    expenses: '#ef4444',
    fixed: '#3b82f6',
    variable: '#f59e0b',
    savings: '#14b8a6',
    investments: '#8b5cf6',
    net: '#06b6d4',
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel</h1>
          <p className="text-sm text-muted-foreground">
            Visao geral da sua saude financeira e padroes de gastos
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {monthsData.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Nenhum dado para {currentYear}</p>
                <p className="text-sm text-muted-foreground">
                  Adicione despesas na visão mensal ou selecione outro ano
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Stats */}
              {insights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Media de Despesas Mensais</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatCurrencyBRL(insights.avgMonthlyExpense)}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-destructive/10">
                      <Wallet className="h-5 w-5 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mes a Mes</p>
                      <p className="text-2xl font-bold text-foreground mt-1 flex items-center gap-1">
                        {insights.expenseChange >= 0 ? (
                          <>
                            <ArrowUpRight className="h-5 w-5 text-destructive" />
                            <span className="text-destructive">+{insights.expenseChange.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-5 w-5 text-accent" />
                            <span className="text-accent">{insights.expenseChange.toFixed(1)}%</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className={cn(
                      'p-2.5 rounded-lg',
                      insights.expenseChange >= 0 ? 'bg-destructive/10' : 'bg-accent/10'
                    )}>
                      {insights.expenseChange >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-destructive" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-accent" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Guardado ({currentYear})</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatCurrencyBRL(insights.totalSaved)}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-chart-2/10">
                      <Target className="h-5 w-5 text-chart-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Poupanca</p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {insights.savingsRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">da renda mensal</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Trend */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Renda vs Despesas</CardTitle>
                <CardDescription>Comparacao de {currentYear}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.income} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.income} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.expenses} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColors.expenses} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={formatShortCurrencyBRL}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => formatCurrencyBRL(value)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke={chartColors.income}
                        fill="url(#incomeGradient)"
                        strokeWidth={2}
                        name="Renda"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke={chartColors.expenses}
                        fill="url(#expenseGradient)"
                        strokeWidth={2}
                        name="Despesas"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Fixed vs Variable Expenses */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Despesas Fixas vs Variaveis</CardTitle>
                <CardDescription>Detalhamento mensal por tipo de despesa</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={formatShortCurrencyBRL}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => formatCurrencyBRL(value)}
                      />
                      <Legend />
                      <Bar dataKey="fixed" fill={chartColors.fixed} name="Fixas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="variable" fill={chartColors.variable} name="Variaveis" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution Pie */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Distribuicao de Gastos</CardTitle>
                <CardDescription>Media por categoria</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => formatCurrencyBRL(value)}
                      />
                      <Legend 
                        formatter={(value) => <span className="text-foreground text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Savings & Investments Trend */}
            <Card className="border-border/50 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Poupanca e Investimentos</CardTitle>
                <CardDescription>Tendencia de alocacao mensal</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={formatShortCurrencyBRL}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => formatCurrencyBRL(value)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke={chartColors.savings}
                        strokeWidth={2}
                        dot={{ fill: chartColors.savings, strokeWidth: 2 }}
                        name="Poupanca"
                      />
                      <Line
                        type="monotone"
                        dataKey="investments"
                        stroke={chartColors.investments}
                        strokeWidth={2}
                        dot={{ fill: chartColors.investments, strokeWidth: 2 }}
                        name="Investimentos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Averages Table */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Media de Gastos por Categoria</CardTitle>
              <CardDescription>Baseado nos dados de {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {categoryAverages.map((item) => (
                  <div
                    key={item.category}
                    className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryColors[item.category] }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {categoryLabels[item.category]}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrencyBRL(item.average)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      media mensal
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
