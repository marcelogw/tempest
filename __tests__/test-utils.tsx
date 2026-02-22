import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

// Mock messages for testing - Portuguese (pt) to match test expectations
const mockMessages = {
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
  },
  ui: {
    monthSelector: {
      selectMonth: 'Selecione o mês',
    },
    expenseEditDialog: {
      editFixed: 'Editar Despesa Fixa',
      editVariable: 'Editar Despesa Variável',
      description: 'Descrição',
      amount: 'Valor',
      category: 'Categoria',
      recurringInfo: 'Esta é uma despesa recorrente',
      makeRecurring: 'Tornar recorrente',
    },
  },
  months: {
    january: 'Janeiro',
    february: 'Fevereiro',
    march: 'Março',
    april: 'Abril',
    may: 'Maio',
    june: 'Junho',
    july: 'Julho',
    august: 'Agosto',
    september: 'Setembro',
    october: 'Outubro',
    november: 'Novembro',
    december: 'Dezembro',
  },
  monthsShort: {
    jan: 'Jan',
    feb: 'Fev',
    mar: 'Mar',
    apr: 'Abr',
    may: 'Mai',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Ago',
    sep: 'Set',
    oct: 'Out',
    nov: 'Nov',
    dec: 'Dez',
  },
  categories: {
    groceries: 'Mercado',
    transportation: 'Transporte',
    health: 'Saúde',
    leisure: 'Lazer',
    food: 'Alimentação',
    education: 'Educação',
    housing: 'Moradia',
    subscriptions: 'Assinaturas',
    'credit-card': 'Cartão de Crédito',
    installment: 'Parcelamento',
    other: 'Outros',
  },
}

interface AllTheProvidersProps {
  children: React.ReactNode
  locale?: string
  messages?: Record<string, unknown>
}

function AllTheProviders({
  children,
  locale = 'pt',
  messages = mockMessages,
}: AllTheProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    locale?: string
    messages?: Record<string, unknown>
  }
) {
  const { locale, messages, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders locale={locale} messages={messages}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render }
