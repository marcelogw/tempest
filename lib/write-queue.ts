import { getStorage } from '@/lib/adapters/registry'

export type WriteModel =
  | 'Category'
  | 'CreditCard'
  | 'MonthlyData'
  | 'Income'
  | 'Expense'
  | 'Installment'
  | 'Workspace'

export type WriteOp = 'create' | 'update' | 'delete'

export type PendingWrite = {
  id: string
  model: WriteModel
  operation: WriteOp
  data: Record<string, unknown>
  enqueuedAt: number
  retries: number
}

const QUEUE_KEY = 'tempest-write-queue'
const DEAD_LETTER_KEY = 'tempest-dead-letters'
const MAX_RETRIES = 3

let processorInterval: ReturnType<typeof setInterval> | null = null
let focusListenerAdded = false

function readQueue(): PendingWrite[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as PendingWrite[]) : []
  } catch {
    return []
  }
}

function saveQueue(queue: PendingWrite[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueue(op: Omit<PendingWrite, 'id' | 'enqueuedAt' | 'retries'>): void {
  const queue = readQueue()
  queue.push({
    ...op,
    id: crypto.randomUUID(),
    enqueuedAt: Date.now(),
    retries: 0,
  })
  saveQueue(queue)
}

export function getPendingCount(): number {
  return readQueue().length
}

export async function processQueue(): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) return

  const remaining: PendingWrite[] = []
  for (const item of queue) {
    try {
      await dispatch(item)
    } catch {
      if (item.retries >= MAX_RETRIES - 1) {
        try {
          const dead = JSON.parse(localStorage.getItem(DEAD_LETTER_KEY) ?? '[]') as PendingWrite[]
          dead.push({ ...item, retries: item.retries + 1 })
          localStorage.setItem(DEAD_LETTER_KEY, JSON.stringify(dead))
        } catch {
          // ignore dead letter write failures
        }
      } else {
        remaining.push({ ...item, retries: item.retries + 1 })
      }
    }
  }
  saveQueue(remaining)
}

async function dispatch(item: PendingWrite): Promise<void> {
  const s = getStorage()
  const { model, operation, data } = item

  switch (`${model}:${operation}`) {
    case 'Category:create':
      await s.createCategory(data.id as string, data as Parameters<typeof s.createCategory>[1])
      break
    case 'Category:update':
      await s.updateCategory(data.id as string, data as Parameters<typeof s.updateCategory>[1])
      break
    case 'Category:delete':
      await s.deleteCategory(data.id as string)
      break

    case 'CreditCard:create':
      await s.createCreditCard(data.id as string, data as Parameters<typeof s.createCreditCard>[1])
      break
    case 'CreditCard:update':
      await s.updateCreditCard(data.id as string, data as Parameters<typeof s.updateCreditCard>[1])
      break
    case 'CreditCard:delete':
      await s.deleteCreditCard(data.id as string)
      break

    case 'MonthlyData:create':
      await s.createMonthlyData(data.id as string, data.workspaceGroup as string)
      break
    case 'MonthlyData:update':
      await s.updateMonthlyData(
        data.id as string,
        data as Parameters<typeof s.updateMonthlyData>[1]
      )
      break

    case 'Income:create':
      await s.createIncome(data as Parameters<typeof s.createIncome>[0])
      break
    case 'Income:update':
      await s.updateIncome(data.id as string, data as Parameters<typeof s.updateIncome>[1])
      break
    case 'Income:delete':
      await s.deleteIncome(data.id as string)
      break

    case 'Expense:create':
      await s.createExpense(data as Parameters<typeof s.createExpense>[0])
      break
    case 'Expense:update':
      await s.updateExpense(data.id as string, data as Parameters<typeof s.updateExpense>[1])
      break
    case 'Expense:delete':
      await s.deleteExpense(data.id as string)
      break

    case 'Installment:create':
      await s.createInstallment(data as Parameters<typeof s.createInstallment>[0])
      break
    case 'Installment:delete':
      await s.deleteInstallment(data.id as string)
      break

    case 'Workspace:update':
      await s.touchWorkspaceActivity(data.id as string)
      break

    default:
      throw new Error(`Unknown dispatch: ${model}:${operation}`)
  }
}

export function startBackgroundProcessor(): void {
  if (processorInterval !== null) return

  processorInterval = setInterval(() => {
    void processQueue()
  }, 30_000)

  if (typeof window !== 'undefined' && !focusListenerAdded) {
    window.addEventListener('focus', () => {
      void processQueue()
    })
    focusListenerAdded = true
  }
}

export function stopBackgroundProcessor(): void {
  if (processorInterval !== null) {
    clearInterval(processorInterval)
    processorInterval = null
  }
}
