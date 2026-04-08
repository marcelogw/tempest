import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

// Singleton Amplify client
let _client: ReturnType<typeof generateClient<Schema>> | null = null

export function getAmplifyClient(): ReturnType<typeof generateClient<Schema>> {
  if (!_client) _client = generateClient<Schema>()
  return _client
}

// In-memory maps rebuilt on each fetchWorkspaceData call
// kebab-case key → Amplify UUID (or same kebab if client-created)
export let categoryKeyToCloudId: Record<string, string> = {}
export let categoryCloudIdToKey: Record<string, string> = {}
export let cardKeyToCloudId: Record<string, string> = {}
export let cardCloudIdToKey: Record<string, string> = {}

// ─── Input types ──────────────────────────────────────────────────────────────

export type CategoryInput = {
  workspaceGroup: string
  categoryId: string
  label: string
  color: string
  icon?: string | null
  isSystem: boolean
  order: number
}

export type CreditCardInput = {
  workspaceGroup: string
  cardId: string
  name: string
  color: string
  limit?: number | null
  order: number
}

export type IncomeInput = {
  id: string
  workspaceGroup: string
  description: string
  amount: number
  recurringGroupId?: string | null
  monthlyDataId: string
}

export type ExpenseInput = {
  id: string
  workspaceGroup: string
  description: string
  amount: number
  categoryId: string
  type: 'fixed' | 'variable'
  date: string
  installmentId?: string | null
  recurringGroupId?: string | null
  monthlyDataId: string
}

export type InstallmentInput = {
  id: string
  workspaceGroup: string
  name: string
  cardId: string
  totalInstallments: number
  amountPerInstallment: number
  startMonth: string
}

export type NoteInput = {
  id: string
  workspaceGroup: string
  text: string
  value?: number | null
  valueDirection?: string | null
  date: string
  persistent: boolean
  done: boolean
  noteCreatedAt: string
  createdMonth: string
}

// ─── WorkspaceData type ───────────────────────────────────────────────────────

export type WorkspaceData = {
  categories: Array<{
    id: string
    categoryId: string
    label: string
    color: string
    icon: string | null
    isSystem: boolean
    order: number
  }>
  creditCards: Array<{
    id: string
    cardId: string
    name: string
    color: string
    limit: number | null
    order: number
  }>
  monthlyDataList: Array<{
    id: string
    month: string
    investments: number
    savings: number
  }>
  incomes: Array<{
    id: string
    description: string
    amount: number
    recurringGroupId: string | null
    monthlyDataId: string
  }>
  expenses: Array<{
    id: string
    description: string
    amount: number
    categoryId: string
    type: 'fixed' | 'variable'
    date: string
    installmentId: string | null
    recurringGroupId: string | null
    monthlyDataId: string
  }>
  installments: Array<{
    id: string
    name: string
    cardId: string
    totalInstallments: number
    amountPerInstallment: number
    startMonth: string
  }>
  notes: Array<{
    id: string
    text: string
    value: number | null
    valueDirection: string | null
    date: string
    persistent: boolean
    done: boolean
    noteCreatedAt: string
    createdMonth: string
  }>
}

// ─── Pagination helper ────────────────────────────────────────────────────────

async function fetchAll<T>(
  listFn: (args: { filter?: Record<string, unknown>; nextToken?: string | null }) => Promise<{
    data: T[]
    nextToken?: string | null
  }>,
  filter?: Record<string, unknown>
): Promise<T[]> {
  const results: T[] = []
  let nextToken: string | null | undefined = null

  do {
    const response = await listFn({ filter, nextToken })
    results.push(...response.data)
    nextToken = response.nextToken
  } while (nextToken)

  return results
}

// ─── Workspace loading ────────────────────────────────────────────────────────

export async function fetchWorkspaceData(workspaceGroup: string): Promise<WorkspaceData> {
  const c = getAmplifyClient()
  const filter = { workspaceGroup: { eq: workspaceGroup } }

  const [
    rawCategories,
    rawCards,
    rawMonthlyData,
    rawIncomes,
    rawExpenses,
    rawInstallments,
    rawNotes,
  ] = await Promise.all([
    fetchAll((args) => c.models.Category.list(args), filter),
    fetchAll((args) => c.models.CreditCard.list(args), filter),
    fetchAll((args) => c.models.MonthlyData.list(args), filter),
    fetchAll((args) => c.models.Income.list(args), filter),
    fetchAll((args) => c.models.Expense.list(args), filter),
    fetchAll((args) => c.models.Installment.list(args), filter),
    fetchAll((args) => c.models.Note.list(args), filter),
  ])

  // Rebuild in-memory ID maps as side effects
  categoryKeyToCloudId = {}
  categoryCloudIdToKey = {}
  for (const cat of rawCategories) {
    const key = (cat as { categoryId: string }).categoryId
    const cloudId = (cat as { id: string }).id
    categoryKeyToCloudId[key] = cloudId
    categoryCloudIdToKey[cloudId] = key
  }

  cardKeyToCloudId = {}
  cardCloudIdToKey = {}
  for (const card of rawCards) {
    const key = (card as { cardId: string }).cardId
    const cloudId = (card as { id: string }).id
    cardKeyToCloudId[key] = cloudId
    cardCloudIdToKey[cloudId] = key
  }

  const categories = rawCategories.map((c) => {
    const cat = c as {
      id: string
      categoryId: string
      label: string
      color: string
      icon?: string | null
      isSystem: boolean
      order: number
    }
    return {
      id: cat.id,
      categoryId: cat.categoryId,
      label: cat.label,
      color: cat.color,
      icon: cat.icon ?? null,
      isSystem: cat.isSystem,
      order: cat.order,
    }
  })

  const creditCards = rawCards.map((c) => {
    const card = c as {
      id: string
      cardId: string
      name: string
      color: string
      limit?: number | null
      order: number
    }
    return {
      id: card.id,
      cardId: card.cardId,
      name: card.name,
      color: card.color,
      limit: card.limit ?? null,
      order: card.order,
    }
  })

  const monthlyDataList = rawMonthlyData.map((m) => {
    const md = m as { id: string; month: string; investments: number; savings: number }
    return {
      id: md.id,
      month: md.month,
      investments: md.investments ?? 0,
      savings: md.savings ?? 0,
    }
  })

  const incomes = rawIncomes.map((i) => {
    const inc = i as {
      id: string
      description: string
      amount: number
      recurringGroupId?: string | null
      monthlyDataId: string
    }
    return {
      id: inc.id,
      description: inc.description,
      amount: inc.amount,
      recurringGroupId: inc.recurringGroupId ?? null,
      monthlyDataId: inc.monthlyDataId,
    }
  })

  const expenses = rawExpenses.map((e) => {
    const exp = e as {
      id: string
      description: string
      amount: number
      categoryId: string
      type: string
      date: string
      installmentId?: string | null
      recurringGroupId?: string | null
      monthlyDataId: string
    }
    return {
      id: exp.id,
      description: exp.description,
      amount: exp.amount,
      categoryId: exp.categoryId,
      type: exp.type as 'fixed' | 'variable',
      date: exp.date,
      installmentId: exp.installmentId ?? null,
      recurringGroupId: exp.recurringGroupId ?? null,
      monthlyDataId: exp.monthlyDataId,
    }
  })

  const installments = rawInstallments.map((i) => {
    const inst = i as {
      id: string
      name: string
      cardId: string
      totalInstallments: number
      amountPerInstallment: number
      startMonth: string
    }
    return {
      id: inst.id,
      name: inst.name,
      cardId: inst.cardId,
      totalInstallments: inst.totalInstallments,
      amountPerInstallment: inst.amountPerInstallment,
      startMonth: inst.startMonth,
    }
  })

  const notes = rawNotes.map((n) => {
    const note = n as {
      id: string
      text: string
      value?: number | null
      valueDirection?: string | null
      date: string
      persistent: boolean
      done: boolean
      noteCreatedAt: string
      createdMonth: string
    }
    return {
      id: note.id,
      text: note.text,
      value: note.value ?? null,
      valueDirection: note.valueDirection ?? null,
      date: note.date,
      persistent: note.persistent,
      done: note.done,
      noteCreatedAt: note.noteCreatedAt,
      createdMonth: note.createdMonth,
    }
  })

  return { categories, creditCards, monthlyDataList, incomes, expenses, installments, notes }
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function createCategory(id: string, data: CategoryInput): Promise<void> {
  await getAmplifyClient().models.Category.create({
    id,
    workspaceGroup: data.workspaceGroup,
    categoryId: data.categoryId,
    label: data.label,
    color: data.color,
    icon: data.icon ?? undefined,
    isSystem: data.isSystem,
    order: data.order,
  })
}

export async function updateCategory(cloudId: string, data: Partial<CategoryInput>): Promise<void> {
  await getAmplifyClient().models.Category.update({
    id: cloudId,
    ...(data.label !== undefined && { label: data.label }),
    ...(data.color !== undefined && { color: data.color }),
    ...(data.icon !== undefined && { icon: data.icon ?? undefined }),
    ...(data.order !== undefined && { order: data.order }),
  })
}

export async function deleteCategory(cloudId: string): Promise<void> {
  await getAmplifyClient().models.Category.delete({ id: cloudId })
}

// ─── CreditCard CRUD ──────────────────────────────────────────────────────────

export async function createCreditCard(id: string, data: CreditCardInput): Promise<void> {
  await getAmplifyClient().models.CreditCard.create({
    id,
    workspaceGroup: data.workspaceGroup,
    cardId: data.cardId,
    name: data.name,
    color: data.color,
    limit: data.limit ?? undefined,
    order: data.order,
  })
}

export async function updateCreditCard(
  cloudId: string,
  data: Partial<CreditCardInput>
): Promise<void> {
  await getAmplifyClient().models.CreditCard.update({
    id: cloudId,
    ...(data.name !== undefined && { name: data.name }),
    ...(data.color !== undefined && { color: data.color }),
    ...(data.limit !== undefined && { limit: data.limit ?? undefined }),
    ...(data.order !== undefined && { order: data.order }),
  })
}

export async function deleteCreditCard(cloudId: string): Promise<void> {
  await getAmplifyClient().models.CreditCard.delete({ id: cloudId })
}

// ─── MonthlyData CRUD ─────────────────────────────────────────────────────────

export async function createMonthlyData(month: string, workspaceGroup: string): Promise<void> {
  await getAmplifyClient().models.MonthlyData.create({
    id: month,
    workspaceGroup,
    month,
    investments: 0,
    savings: 0,
  })
}

export async function updateMonthlyData(
  month: string,
  data: { investments?: number; savings?: number }
): Promise<void> {
  await getAmplifyClient().models.MonthlyData.update({
    id: month,
    ...(data.investments !== undefined && { investments: data.investments }),
    ...(data.savings !== undefined && { savings: data.savings }),
  })
}

// ─── Income CRUD ──────────────────────────────────────────────────────────────

export async function createIncome(data: IncomeInput): Promise<void> {
  await getAmplifyClient().models.Income.create({
    id: data.id,
    workspaceGroup: data.workspaceGroup,
    description: data.description,
    amount: data.amount,
    recurringGroupId: data.recurringGroupId ?? undefined,
    monthlyDataId: data.monthlyDataId,
  })
}

export async function updateIncome(id: string, data: Partial<IncomeInput>): Promise<void> {
  await getAmplifyClient().models.Income.update({
    id,
    ...(data.description !== undefined && { description: data.description }),
    ...(data.amount !== undefined && { amount: data.amount }),
  })
}

export async function deleteIncome(id: string): Promise<void> {
  await getAmplifyClient().models.Income.delete({ id })
}

// ─── Expense CRUD ─────────────────────────────────────────────────────────────

export async function createExpense(data: ExpenseInput): Promise<void> {
  await getAmplifyClient().models.Expense.create({
    id: data.id,
    workspaceGroup: data.workspaceGroup,
    description: data.description,
    amount: data.amount,
    categoryId: data.categoryId,
    type: data.type,
    date: data.date,
    installmentId: data.installmentId ?? undefined,
    recurringGroupId: data.recurringGroupId ?? undefined,
    monthlyDataId: data.monthlyDataId,
  })
}

export async function updateExpense(id: string, data: Partial<ExpenseInput>): Promise<void> {
  await getAmplifyClient().models.Expense.update({
    id,
    ...(data.description !== undefined && { description: data.description }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    ...(data.date !== undefined && { date: data.date }),
  })
}

export async function deleteExpense(id: string): Promise<void> {
  await getAmplifyClient().models.Expense.delete({ id })
}

// ─── Installment CRUD ─────────────────────────────────────────────────────────

export async function createInstallment(data: InstallmentInput): Promise<void> {
  await getAmplifyClient().models.Installment.create({
    id: data.id,
    workspaceGroup: data.workspaceGroup,
    name: data.name,
    cardId: data.cardId,
    totalInstallments: data.totalInstallments,
    amountPerInstallment: data.amountPerInstallment,
    startMonth: data.startMonth,
  })
}

export async function deleteInstallment(id: string): Promise<void> {
  await getAmplifyClient().models.Installment.delete({ id })
}

// ─── Note CRUD ────────────────────────────────────────────────────────────────

export async function createNote(data: NoteInput): Promise<void> {
  await getAmplifyClient().models.Note.create({
    id: data.id,
    workspaceGroup: data.workspaceGroup,
    text: data.text,
    value: data.value ?? undefined,
    valueDirection: data.valueDirection ?? undefined,
    date: data.date,
    persistent: data.persistent,
    done: data.done,
    noteCreatedAt: data.noteCreatedAt,
    createdMonth: data.createdMonth,
  })
}

export async function updateNote(id: string, data: Partial<NoteInput>): Promise<void> {
  await getAmplifyClient().models.Note.update({
    id,
    ...(data.text !== undefined && { text: data.text }),
    ...(data.value !== undefined && { value: data.value ?? undefined }),
    ...(data.valueDirection !== undefined && { valueDirection: data.valueDirection ?? undefined }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.persistent !== undefined && { persistent: data.persistent }),
    ...(data.done !== undefined && { done: data.done }),
  })
}

export async function deleteNote(id: string): Promise<void> {
  await getAmplifyClient().models.Note.delete({ id })
}

// ─── Workspace smart sync ─────────────────────────────────────────────────────

export async function getWorkspaceLastActivity(workspaceId: string): Promise<Date | null> {
  const { data } = await getAmplifyClient().models.Workspace.get({ id: workspaceId })
  if (!data?.lastActivityAt) return null
  return new Date(String(data.lastActivityAt))
}

export async function touchWorkspaceActivity(workspaceId: string): Promise<void> {
  await getAmplifyClient().models.Workspace.update({
    id: workspaceId,
    lastActivityAt: new Date().toISOString(),
  })
}
