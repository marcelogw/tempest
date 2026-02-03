'use client'

import { useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  useExpenseStore,
  formatCurrencyBRL,
  formatShortCurrencyBRL,
  type ExpenseCategory,
  SYSTEM_CATEGORY_ID,
} from '@/lib/expense-store'
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
import { cn } from '@/lib/utils'

export function DashboardView() {
  const { monthlyData, currentYear, categories, getCategoryById } = useExpenseStore()

  // Get sorted months data
  const monthsData = useMemo(() => {
    const yearMonths = Object.values(monthlyData)
      .filter((month) => month.month.startsWith(currentYear))
      .sort((a, b) => a.month.localeCompare(b.month))

    return yearMonths.map((month) => {
      const fixedTotal = month.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
      const variableTotal = month.variableExpenses.reduce((sum, e) => sum + e.amount, 0)
      const totalExpenses = fixedTotal + variableTotal
      const totalIncome = month.incomes.reduce((sum, i) => sum + i.amount, 0)

      const date = new Date(month.month + '-01')
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })

      return {
        month: monthLabel,
        fullMonth: month.month,
        income: totalIncome,
        expenses: totalExpenses,
        fixed: fixedTotal,
        variable: variableTotal,
        investments: month.investments,
        savings: month.savings,
        net: totalIncome - totalExpenses - month.investments - month.savings,
      }
    })
  }, [monthlyData, currentYear])

  // Calculate category averages across all months
  const categoryAverages = useMemo(() => {
    // Initialize categoryTotals dynamically from store categories
    const categoryTotals: Record<ExpenseCategory, number[]> = {}
    categories.forEach((cat) => {
      categoryTotals[cat.id] = []
    })

    Object.values(monthlyData)
      .filter((month) => month.month.startsWith(currentYear))
      .forEach((month) => {
        // Initialize month category totals dynamically
        const monthCategoryTotals: Record<ExpenseCategory, number> = {}
        categories.forEach((cat) => {
          monthCategoryTotals[cat.id] = 0
        })
        ;[...month.fixedExpenses, ...month.variableExpenses].forEach((expense) => {
          // Use expense category or fallback to system category
          const categoryId =
            categoryTotals[expense.category] !== undefined ? expense.category : SYSTEM_CATEGORY_ID
          monthCategoryTotals[categoryId] = (monthCategoryTotals[categoryId] || 0) + expense.amount
        })

        Object.entries(monthCategoryTotals).forEach(([cat, total]) => {
          if (total > 0 && categoryTotals[cat]) {
            categoryTotals[cat].push(total)
          }
        })
      })

    return Object.entries(categoryTotals)
      .filter(([, values]) => values.length > 0)
      .map(([category, values]) => ({
        category,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
        total: values.reduce((sum, v) => sum + v, 0),
        months: values.length,
      }))
      .sort((a, b) => b.average - a.average)
  }, [monthlyData, currentYear, categories])

  // Calculate insights
  const insights = useMemo(() => {
    if (monthsData.length < 2) return null

    const currentMonth = monthsData[monthsData.length - 1]
    const previousMonth = monthsData[monthsData.length - 2]

    const expenseChange =
      previousMonth.expenses > 0
        ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
        : 0

    const avgMonthlyExpense = monthsData.reduce((sum, m) => sum + m.expenses, 0) / monthsData.length
    const avgMonthlySavings = monthsData.reduce((sum, m) => sum + m.savings, 0) / monthsData.length
    const avgMonthlyInvestments =
      monthsData.reduce((sum, m) => sum + m.investments, 0) / monthsData.length
    const totalSaved = monthsData.reduce((sum, m) => sum + m.savings + m.investments, 0)

    const savingsRate =
      currentMonth.income > 0
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
    return categoryAverages.slice(0, 6).map((item) => {
      const category = getCategoryById(item.category) || getCategoryById(SYSTEM_CATEGORY_ID)
      return {
        name: category?.label || 'Outros',
        value: item.average,
        color: category?.color || '#64748b',
      }
    })
  }, [categoryAverages, getCategoryById])

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
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-card flex-shrink-0 border-b px-6 py-4">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Painel</h1>
          <p className="text-muted-foreground text-sm">
            Visao geral da sua saude financeira e padroes de gastos
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {monthsData.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-foreground text-lg font-medium">
                  Nenhum dado para {currentYear}
                </p>
                <p className="text-muted-foreground text-sm">
                  Adicione despesas na visão mensal ou selecione outro ano
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Stats */}
              {insights && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            Media de Despesas Mensais
                          </p>
                          <p className="text-foreground mt-1 text-2xl font-bold">
                            {formatCurrencyBRL(insights.avgMonthlyExpense)}
                          </p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-2.5">
                          <Wallet className="text-destructive h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">Mes a Mes</p>
                          <p className="text-foreground mt-1 flex items-center gap-1 text-2xl font-bold">
                            {insights.expenseChange >= 0 ? (
                              <>
                                <ArrowUpRight className="text-destructive h-5 w-5" />
                                <span className="text-destructive">
                                  +{insights.expenseChange.toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="text-accent h-5 w-5" />
                                <span className="text-accent">
                                  {insights.expenseChange.toFixed(1)}%
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'rounded-lg p-2.5',
                            insights.expenseChange >= 0 ? 'bg-destructive/10' : 'bg-accent/10'
                          )}
                        >
                          {insights.expenseChange >= 0 ? (
                            <TrendingUp className="text-destructive h-5 w-5" />
                          ) : (
                            <TrendingDown className="text-accent h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            Total Guardado ({currentYear})
                          </p>
                          <p className="text-foreground mt-1 text-2xl font-bold">
                            {formatCurrencyBRL(insights.totalSaved)}
                          </p>
                        </div>
                        <div className="bg-chart-2/10 rounded-lg p-2.5">
                          <Target className="text-chart-2 h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm font-medium">
                            Taxa de Poupanca
                          </p>
                          <p className="text-foreground mt-1 text-2xl font-bold">
                            {insights.savingsRate.toFixed(1)}%
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">da renda mensal</p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-2.5">
                          <Calendar className="text-primary h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Income vs Expenses Trend */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Renda vs Despesas</CardTitle>
                    <CardDescription>Comparacao de {currentYear}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthsData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColors.income} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={chartColors.income} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={chartColors.expenses}
                                stopOpacity={0.3}
                              />
                              <stop offset="95%" stopColor={chartColors.expenses} stopOpacity={0} />
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
                    <CardTitle className="text-base font-semibold">
                      Despesas Fixas vs Variaveis
                    </CardTitle>
                    <CardDescription>Detalhamento mensal por tipo de despesa</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthsData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
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
                          <Bar
                            dataKey="fixed"
                            fill={chartColors.fixed}
                            name="Fixas"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="variable"
                            fill={chartColors.variable}
                            name="Variaveis"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Category Distribution Pie */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Distribuicao de Gastos
                    </CardTitle>
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
                            formatter={(value) => (
                              <span className="text-foreground text-xs">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Savings & Investments Trend */}
                <Card className="border-border/50 shadow-sm lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      Poupanca e Investimentos
                    </CardTitle>
                    <CardDescription>Tendencia de alocacao mensal</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthsData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
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
                  <CardTitle className="text-base font-semibold">
                    Media de Gastos por Categoria
                  </CardTitle>
                  <CardDescription>Baseado nos dados de {currentYear}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {categoryAverages.map((item) => {
                      const category =
                        getCategoryById(item.category) || getCategoryById(SYSTEM_CATEGORY_ID)
                      const IconComponent = category?.icon
                        ? (LucideIcons as unknown as Record<string, LucideIcon>)[category.icon]
                        : null
                      const color = category?.color || '#64748b'
                      const label = category?.label || 'Outros'

                      return (
                        <div
                          key={item.category}
                          className="bg-secondary/50 hover:bg-secondary rounded-lg p-4 transition-colors"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            {IconComponent ? (
                              <IconComponent className="h-4 w-4" style={{ color }} />
                            ) : (
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            )}
                            <span className="text-foreground text-sm font-medium">{label}</span>
                          </div>
                          <p className="text-foreground text-lg font-bold">
                            {formatCurrencyBRL(item.average)}
                          </p>
                          <p className="text-muted-foreground text-xs">media mensal</p>
                        </div>
                      )
                    })}
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
