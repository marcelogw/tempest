import { z } from 'zod'

// Expense form validation schema
export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres')
    .trim(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser maior que zero')
    .max(999999999, 'Valor muito alto'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['fixed', 'variable']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

// Income form validation schema
export const incomeSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(100, 'Descrição deve ter no máximo 100 caracteres')
    .trim(),
  amount: z
    .number({ invalid_type_error: 'Valor deve ser um número' })
    .positive('Valor deve ser maior que zero')
    .max(999999999, 'Valor muito alto'),
})

export type IncomeFormData = z.infer<typeof incomeSchema>

// Investment/Savings validation
export const investmentSavingsSchema = z
  .number({ invalid_type_error: 'Valor deve ser um número' })
  .min(0, 'Valor não pode ser negativo')
  .max(999999999, 'Valor muito alto')

// Installment form validation schema
export const installmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  card: z.enum(['nubank_pri', 'nubank_ma', 'mercadopago', 'itau'], {
    errorMap: () => ({ message: 'Cartão inválido' }),
  }),
  totalInstallments: z
    .number({ invalid_type_error: 'Número de parcelas deve ser um número' })
    .int('Número de parcelas deve ser inteiro')
    .min(2, 'Mínimo de 2 parcelas')
    .max(48, 'Máximo de 48 parcelas'),
  amountPerInstallment: z
    .number({ invalid_type_error: 'Valor da parcela deve ser um número' })
    .positive('Valor deve ser maior que zero')
    .max(999999999, 'Valor muito alto'),
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
})

export type InstallmentFormData = z.infer<typeof installmentSchema>

// Category form validation schema
export const categorySchema = z.object({
  label: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().nullable(),
})

export type CategoryFormData = z.infer<typeof categorySchema>
