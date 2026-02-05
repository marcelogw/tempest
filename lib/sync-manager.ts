'use client'

import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { useSyncStore } from './sync-store'
import { useExpenseStore, type Expense } from './expense-store'

/**
 * SyncManager - Core synchronization logic between local Zustand store and AWS Amplify
 *
 * Phase 1.0: Upload only (local → AWS)
 * Phase 1.1: Download + merge (AWS → local)
 * Phase 2: Continuous sync (bidirectional)
 *
 * CRITICAL: Upload order must respect foreign key constraints:
 * 1. Categories (no dependencies)
 * 2. CreditCards (no dependencies)
 * 3. MonthlyData (no dependencies)
 * 4. Incomes (requires MonthlyData.id)
 * 5. Expenses (requires MonthlyData.id + Category.id)
 * 6. Installments (requires CreditCard.id)
 */
export class SyncManager {
  private client: ReturnType<typeof generateClient<Schema>>
  private syncStore: ReturnType<typeof useSyncStore.getState>
  private expenseStore: ReturnType<typeof useExpenseStore.getState>

  constructor() {
    this.client = generateClient<Schema>()
    this.syncStore = useSyncStore.getState()
    this.expenseStore = useExpenseStore.getState()
  }

  /**
   * Divide array em chunks para processamento em lote
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Check if user already has data in the cloud
   */
  async checkCloudData(): Promise<boolean> {
    try {
      const { data: categories } = await this.client.models.Category.list()
      return (categories?.length ?? 0) > 0
    } catch (error) {
      console.error('Error checking cloud data:', error)
      return false
    }
  }

  /**
   * Upload initial data from localStorage to AWS
   * Phase 1.0: One-way sync (local → cloud) with parallelization
   */
  async uploadInitialData(): Promise<void> {
    this.syncStore.setStatus('syncing')
    this.syncStore.setErrorMessage(null)

    // ⏱️ Iniciar timer
    const startTime = Date.now()

    try {
      // Check if cloud already has data
      const hasCloudData = await this.checkCloudData()
      if (hasCloudData) {
        throw new Error('Cloud já contém dados. Use a opção de merge para sincronizar.')
      }

      console.log('🚀 Iniciando upload paralelo...')

      // FASE 1: Independentes (paralelo)
      console.log('\n📦 Fase 1/2: Uploading base data...')
      await Promise.all([
        this.uploadCategoriesParallel(),
        this.uploadCreditCardsParallel(),
        this.uploadMonthlyDataParallel(),
      ])

      // FASE 2: Dependentes (paralelo)
      console.log('\n📦 Fase 2/2: Uploading transactional data...')
      await Promise.all([
        this.uploadIncomesParallel(),
        this.uploadExpensesParallel(),
        this.uploadInstallmentsParallel(),
      ])

      // ⏱️ Calcular tempo total
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1)

      // Success
      this.syncStore.setStatus('connected')
      this.syncStore.setLastSyncTime(new Date())

      console.log(`\n✅ Upload completo em ${elapsedTime}s`)
    } catch (error) {
      console.error('❌ Error uploading data:', error)
      this.syncStore.setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao sincronizar dados'
      )
      this.syncStore.setStatus('error')
      throw error
    }
  }

  /**
   * Step 1: Upload Categories (Parallel)
   */
  private async uploadCategoriesParallel(): Promise<void> {
    const categories = this.expenseStore.categories
    const chunks = this.chunkArray(categories, 50)

    console.log(`📤 Uploading ${categories.length} categories...`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Progress indicator
      const processed = i * 50
      console.log(`  ⏳ Processing categories ${processed + 1}-${processed + chunk.length}...`)

      // Paralelo dentro do chunk
      await Promise.all(
        chunk.map(async (category) => {
          const { data } = await this.client.models.Category.create({
            categoryId: category.id,
            label: category.label,
            color: category.color,
            icon: category.icon,
            isSystem: category.isSystem,
            order: category.order,
          })

          if (data?.id) {
            this.syncStore.addIdMapping('categories', category.id, data.id)
          }
        })
      )
    }

    console.log(`✅ Categories uploaded`)
  }

  /**
   * Step 2: Upload Credit Cards (Parallel)
   */
  private async uploadCreditCardsParallel(): Promise<void> {
    const creditCards = this.expenseStore.creditCards
    const chunks = this.chunkArray(creditCards, 50)

    console.log(`📤 Uploading ${creditCards.length} credit cards...`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      const processed = i * 50
      console.log(`  ⏳ Processing credit cards ${processed + 1}-${processed + chunk.length}...`)

      await Promise.all(
        chunk.map(async (card) => {
          const { data } = await this.client.models.CreditCard.create({
            cardId: card.id,
            name: card.name,
            color: card.color,
            limit: card.limit,
            order: card.order,
          })

          if (data?.id) {
            this.syncStore.addIdMapping('creditCards', card.id, data.id)
          }
        })
      )
    }

    console.log(`✅ Credit cards uploaded`)
  }

  /**
   * Step 3: Upload Monthly Data (Parallel)
   */
  private async uploadMonthlyDataParallel(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)
    const chunks = this.chunkArray(monthlyData, 50)

    console.log(`📤 Uploading ${monthlyData.length} months...`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      const processed = i * 50
      console.log(`  ⏳ Processing months ${processed + 1}-${processed + chunk.length}...`)

      await Promise.all(
        chunk.map(async (month) => {
          const { data } = await this.client.models.MonthlyData.create({
            month: month.month,
            investments: month.investments,
            savings: month.savings,
          })

          if (data?.id) {
            this.syncStore.addIdMapping('monthlyData', month.month, data.id)
          }
        })
      )
    }

    console.log(`✅ Monthly data uploaded`)
  }

  /**
   * Step 4: Upload Incomes (Parallel)
   */
  private async uploadIncomesParallel(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)
    let totalIncomes = 0

    console.log(`📤 Uploading incomes...`)

    for (const month of monthlyData) {
      const monthCloudId = this.syncStore.getCloudId('monthlyData', month.month)
      if (!monthCloudId) {
        throw new Error(`Missing cloud ID for month ${month.month}`)
      }

      const chunks = this.chunkArray(month.incomes, 50)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const processed = totalIncomes

        if (chunk.length > 0) {
          console.log(
            `  ⏳ Month ${month.month}: incomes ${processed + 1}-${processed + chunk.length}...`
          )
        }

        await Promise.all(
          chunk.map(async (income) => {
            await this.client.models.Income.create({
              description: income.description,
              amount: income.amount,
              recurringGroupId: income.recurringGroupId,
              monthlyDataId: monthCloudId,
            })
          })
        )

        totalIncomes += chunk.length
      }
    }

    console.log(`✅ ${totalIncomes} incomes uploaded`)
  }

  /**
   * Step 5: Upload Expenses (Parallel) - CRITICAL OPTIMIZATION
   */
  private async uploadExpensesParallel(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)
    let totalExpenses = 0

    console.log(`📤 Uploading expenses...`)

    for (const month of monthlyData) {
      const monthCloudId = this.syncStore.getCloudId('monthlyData', month.month)
      if (!monthCloudId) {
        throw new Error(`Missing cloud ID for month ${month.month}`)
      }

      // Combinar fixed + variable
      const allExpenses = [
        ...month.fixedExpenses.map((e) => ({ expense: e, type: 'fixed' as const })),
        ...month.variableExpenses.map((e) => ({ expense: e, type: 'variable' as const })),
      ]

      const chunks = this.chunkArray(allExpenses, 50)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const processed = totalExpenses

        if (chunk.length > 0) {
          console.log(
            `  ⏳ Month ${month.month}: expenses ${processed + 1}-${processed + chunk.length}...`
          )
        }

        await Promise.all(
          chunk.map(({ expense, type }) => this.uploadSingleExpense(expense, monthCloudId, type))
        )

        totalExpenses += chunk.length
      }
    }

    console.log(`✅ ${totalExpenses} expenses uploaded`)
  }

  /**
   * Step 6: Upload Installments (Parallel)
   */
  private async uploadInstallmentsParallel(): Promise<void> {
    const installments = this.expenseStore.installments
    const chunks = this.chunkArray(installments, 50)

    console.log(`📤 Uploading ${installments.length} installments...`)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      if (chunk.length > 0) {
        const processed = i * 50
        console.log(`  ⏳ Processing installments ${processed + 1}-${processed + chunk.length}...`)
      }

      await Promise.all(
        chunk.map(async (installment) => {
          await this.client.models.Installment.create({
            name: installment.name,
            cardId: installment.card,
            totalInstallments: installment.totalInstallments,
            amountPerInstallment: installment.amountPerInstallment,
            startMonth: installment.startMonth,
          })
        })
      )
    }

    console.log(`✅ Installments uploaded`)
  }

  /**
   * Helper: Upload a single expense
   */
  private async uploadSingleExpense(
    expense: Expense,
    monthCloudId: string,
    type: 'fixed' | 'variable'
  ): Promise<void> {
    try {
      await this.client.models.Expense.create({
        description: expense.description,
        amount: expense.amount,
        categoryId: expense.category, // Keep original kebab-case for queries
        type: type,
        date: expense.date,
        installmentId: expense.installmentId,
        recurringGroupId: expense.recurringGroupId,
        monthlyDataId: monthCloudId, // Foreign key
      })
    } catch (error) {
      console.error(`Error uploading expense ${expense.id}:`, error)
      throw error
    }
  }

  // ===================================================================
  // BACKUP: Old sequential methods (kept for rollback safety)
  // These are the original non-parallel implementations
  // ===================================================================

  /**
   * @deprecated Use uploadCategoriesParallel() instead
   */
  private async uploadCategories_old(): Promise<void> {
    const categories = this.expenseStore.categories

    console.log(`📤 Uploading ${categories.length} categories...`)

    for (const category of categories) {
      try {
        const { data } = await this.client.models.Category.create({
          categoryId: category.id,
          label: category.label,
          color: category.color,
          icon: category.icon,
          isSystem: category.isSystem,
          order: category.order,
        })

        if (data?.id) {
          this.syncStore.addIdMapping('categories', category.id, data.id)
        }
      } catch (error) {
        console.error(`Error uploading category ${category.id}:`, error)
        throw error
      }
    }

    console.log(`✅ Categories uploaded`)
  }

  /**
   * @deprecated Use uploadCreditCardsParallel() instead
   */
  private async uploadCreditCards_old(): Promise<void> {
    const creditCards = this.expenseStore.creditCards

    console.log(`📤 Uploading ${creditCards.length} credit cards...`)

    for (const card of creditCards) {
      try {
        const { data } = await this.client.models.CreditCard.create({
          cardId: card.id,
          name: card.name,
          color: card.color,
          limit: card.limit,
          order: card.order,
        })

        if (data?.id) {
          this.syncStore.addIdMapping('creditCards', card.id, data.id)
        }
      } catch (error) {
        console.error(`Error uploading credit card ${card.id}:`, error)
        throw error
      }
    }

    console.log(`✅ Credit cards uploaded`)
  }

  /**
   * @deprecated Use uploadMonthlyDataParallel() instead
   */
  private async uploadMonthlyData_old(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)

    console.log(`📤 Uploading ${monthlyData.length} months...`)

    for (const month of monthlyData) {
      try {
        const { data } = await this.client.models.MonthlyData.create({
          month: month.month,
          investments: month.investments,
          savings: month.savings,
        })

        if (data?.id) {
          this.syncStore.addIdMapping('monthlyData', month.month, data.id)
        }
      } catch (error) {
        console.error(`Error uploading month ${month.month}:`, error)
        throw error
      }
    }

    console.log(`✅ Monthly data uploaded`)
  }

  /**
   * @deprecated Use uploadIncomesParallel() instead
   */
  private async uploadIncomes_old(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)

    let totalIncomes = 0
    for (const month of monthlyData) {
      const monthCloudId = this.syncStore.getCloudId('monthlyData', month.month)
      if (!monthCloudId) {
        throw new Error(`Missing cloud ID for month ${month.month}`)
      }

      for (const income of month.incomes) {
        try {
          await this.client.models.Income.create({
            description: income.description,
            amount: income.amount,
            recurringGroupId: income.recurringGroupId,
            monthlyDataId: monthCloudId,
          })
          totalIncomes++
        } catch (error) {
          console.error(`Error uploading income ${income.id}:`, error)
          throw error
        }
      }
    }

    console.log(`✅ ${totalIncomes} incomes uploaded`)
  }

  /**
   * @deprecated Use uploadExpensesParallel() instead
   */
  private async uploadExpenses_old(): Promise<void> {
    const monthlyData = Object.values(this.expenseStore.monthlyData)

    let totalExpenses = 0
    for (const month of monthlyData) {
      const monthCloudId = this.syncStore.getCloudId('monthlyData', month.month)
      if (!monthCloudId) {
        throw new Error(`Missing cloud ID for month ${month.month}`)
      }

      for (const expense of month.fixedExpenses) {
        await this.uploadSingleExpense(expense, monthCloudId, 'fixed')
        totalExpenses++
      }

      for (const expense of month.variableExpenses) {
        await this.uploadSingleExpense(expense, monthCloudId, 'variable')
        totalExpenses++
      }
    }

    console.log(`✅ ${totalExpenses} expenses uploaded`)
  }

  /**
   * @deprecated Use uploadInstallmentsParallel() instead
   */
  private async uploadInstallments_old(): Promise<void> {
    const installments = this.expenseStore.installments

    console.log(`📤 Uploading ${installments.length} installments...`)

    for (const installment of installments) {
      try {
        await this.client.models.Installment.create({
          name: installment.name,
          cardId: installment.card,
          totalInstallments: installment.totalInstallments,
          amountPerInstallment: installment.amountPerInstallment,
          startMonth: installment.startMonth,
        })
      } catch (error) {
        console.error(`Error uploading installment ${installment.id}:`, error)
        throw error
      }
    }

    console.log(`✅ Installments uploaded`)
  }

  /**
   * Download cloud data and merge with local (Phase 1.1 - TODO)
   */
  async downloadCloudData(): Promise<void> {
    await Promise.resolve() // ESLint: require-await
    throw new Error('Download not implemented yet (Phase 1.1)')
  }

  /**
   * Disconnect and clear sync state (keeps local data intact)
   */
  async disconnect(): Promise<void> {
    await Promise.resolve() // ESLint: require-await
    this.syncStore.disconnect()
    this.syncStore.clearIdMappings()
    console.log('🔌 Disconnected from cloud')
  }
}

/**
 * Singleton instance
 */
let syncManagerInstance: SyncManager | null = null

export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager()
  }
  return syncManagerInstance
}
