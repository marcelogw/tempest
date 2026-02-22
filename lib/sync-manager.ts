'use client'

import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import { signOut } from 'aws-amplify/auth'
import { useSyncStore } from './sync-store'
import {
  useExpenseStore,
  type Category,
  type CreditCard,
  type Expense,
  type Installment,
  type MonthlyData,
} from './expense-store'

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
 *
 * CRITICAL: Delete order must be reverse of upload (respect FK constraints):
 * 1. Expenses
 * 2. Incomes
 * 3. Installments
 * 4. MonthlyData
 * 5. CreditCards
 * 6. Categories
 */

export type SyncScenario = 'local-only' | 'cloud-only' | 'both' | 'empty'

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
   * Generate a short random ID (same format as expense-store's generateId)
   */
  private generateShortId(): string {
    return Math.random().toString(36).substring(2, 9)
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
   * Generic paginator — fetches all pages of an Amplify list query.
   *
   * Amplify returns at most ~100 items per call and a nextToken when more
   * pages exist. This helper keeps fetching until nextToken is null.
   *
   * Each caller passes a thin wrapper that converts an optional nextToken
   * string into the Amplify-specific list options object, keeping the
   * call sites type-safe without `any`.
   */
  private async fetchAllPages<T>(
    fetcher: (nextToken?: string) => Promise<{ data: T[] | null; nextToken?: string | null }>
  ): Promise<T[]> {
    const all: T[] = []
    let nextToken: string | undefined

    do {
      const result = await fetcher(nextToken)
      if (result.data) all.push(...result.data)
      nextToken = result.nextToken ?? undefined
    } while (nextToken)

    return all
  }

  /**
   * Check whether the local expense store has meaningful user data.
   *
   * Default categories alone do NOT count — we look for credit cards,
   * installments, or any month with actual transactions/allocations.
   */
  private hasLocalData(): boolean {
    const store = useExpenseStore.getState()

    if (store.creditCards.length > 0) return true
    if (store.installments.length > 0) return true

    for (const month of Object.values(store.monthlyData)) {
      if (
        month.incomes.length > 0 ||
        month.fixedExpenses.length > 0 ||
        month.variableExpenses.length > 0 ||
        month.investments > 0 ||
        month.savings > 0
      ) {
        return true
      }
    }

    return false
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
   * Detect the sync scenario based on local + cloud data presence.
   *
   * Returns one of:
   * - 'local-only': Only the local store has data  → upload
   * - 'cloud-only': Only the cloud has data        → download
   * - 'both':       Both sides have data           → conflict, user decides
   * - 'empty':      Neither side has data          → nothing to do
   */
  async detectSyncScenario(): Promise<SyncScenario> {
    const [hasCloud, hasLocal] = await Promise.all([
      this.checkCloudData(),
      Promise.resolve(this.hasLocalData()),
    ])

    if (hasLocal && hasCloud) return 'both'
    if (hasLocal && !hasCloud) return 'local-only'
    if (!hasLocal && hasCloud) return 'cloud-only'
    return 'empty'
  }

  /**
   * Smart sync initializer — detects the scenario and takes the right action.
   *
   * - local-only  → upload to cloud
   * - cloud-only  → download from cloud
   * - empty       → mark connected, nothing to transfer
   * - both        → return 'both' so the caller can show a conflict dialog
   *
   * Returns the detected scenario so the caller can react (e.g. show dialog).
   */
  async initializeSync(): Promise<SyncScenario> {
    this.syncStore.setStatus('syncing')
    this.syncStore.setErrorMessage(null)

    try {
      const scenario = await this.detectSyncScenario()
      console.log(`🔍 Sync scenario detected: ${scenario}`)

      switch (scenario) {
        case 'local-only':
          await this.uploadInitialData()
          break

        case 'cloud-only':
          await this.downloadCloudData()
          break

        case 'empty':
          this.syncStore.setStatus('connected')
          this.syncStore.setLastSyncTime(new Date())
          break

        case 'both':
          // Leave status as 'syncing' — caller must show conflict dialog
          break
      }

      return scenario
    } catch (error) {
      console.error('❌ Error during sync initialization:', error)
      this.syncStore.setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao inicializar sincronização'
      )
      this.syncStore.setStatus('error')
      throw error
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
            label: category.customLabel || category.id, // Map customLabel to label for backend
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
  // PHASE 1.1: Download & Merge
  // ===================================================================

  /**
   * Delete ALL cloud records in reverse dependency order.
   *
   * Used when the user chooses "use local data" in a conflict scenario.
   * After this, uploadInitialData() is called to push local data to a clean cloud.
   */
  private async clearCloudData(): Promise<void> {
    console.log('🗑️ Clearing all cloud data...')
    const startTime = Date.now()

    // Fetch all records first (in parallel, no order needed for fetching)
    const [expenses, incomes, installments, monthlyData, creditCards, categories] =
      await Promise.all([
        this.fetchAllPages((t) => this.client.models.Expense.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Income.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Installment.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.MonthlyData.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.CreditCard.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Category.list(t ? { nextToken: t } : {})),
      ])

    console.log(
      `  Found: ${expenses.length} expenses, ${incomes.length} incomes, ` +
        `${installments.length} installments, ${monthlyData.length} months, ` +
        `${creditCards.length} cards, ${categories.length} categories`
    )

    // Delete in reverse dependency order (expenses first, categories last)
    await Promise.all(expenses.map((e) => this.client.models.Expense.delete({ id: e.id })))
    console.log(`  🗑️ ${expenses.length} expenses deleted`)

    await Promise.all(incomes.map((i) => this.client.models.Income.delete({ id: i.id })))
    console.log(`  🗑️ ${incomes.length} incomes deleted`)

    await Promise.all(installments.map((i) => this.client.models.Installment.delete({ id: i.id })))
    console.log(`  🗑️ ${installments.length} installments deleted`)

    await Promise.all(monthlyData.map((m) => this.client.models.MonthlyData.delete({ id: m.id })))
    console.log(`  🗑️ ${monthlyData.length} monthly data records deleted`)

    await Promise.all(creditCards.map((c) => this.client.models.CreditCard.delete({ id: c.id })))
    console.log(`  🗑️ ${creditCards.length} credit cards deleted`)

    await Promise.all(categories.map((c) => this.client.models.Category.delete({ id: c.id })))
    console.log(`  🗑️ ${categories.length} categories deleted`)

    // Clear local ID mappings since cloud records no longer exist
    this.syncStore.clearIdMappings()

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ Cloud cleared in ${elapsed}s`)
  }

  /**
   * Download all cloud data and replace the local Zustand store.
   * Phase 1.1: One-way sync (cloud → local)
   *
   * ID mapping notes (based on the existing upload code):
   * - Category.categoryId  = local kebab-case ID (e.g. 'groceries')  → use as Category.id
   * - CreditCard.cardId    = local kebab-case ID (e.g. 'nubank')      → use as CreditCard.id
   * - Expense.categoryId   = kebab-case string (NOT a UUID)           → use as Expense.category
   * - Installment.cardId   = local card ID (kebab-case)               → use as Installment.card
   * - Expense.installmentId references an old local short ID that no longer maps to
   *   any downloaded installment, so it is cleared to avoid stale references.
   */
  async downloadCloudData(): Promise<void> {
    this.syncStore.setStatus('syncing')
    this.syncStore.setErrorMessage(null)

    const startTime = Date.now()

    try {
      console.log('📥 Starting cloud data download...')

      // Fetch all models in parallel (no ordering required for reads)
      const [
        cloudCategories,
        cloudCards,
        cloudMonthlyData,
        cloudIncomes,
        cloudExpenses,
        cloudInstallments,
      ] = await Promise.all([
        this.fetchAllPages((t) => this.client.models.Category.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.CreditCard.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.MonthlyData.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Income.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Expense.list(t ? { nextToken: t } : {})),
        this.fetchAllPages((t) => this.client.models.Installment.list(t ? { nextToken: t } : {})),
      ])

      console.log(
        `  Downloaded: ${cloudCategories.length} categories, ${cloudCards.length} cards, ` +
          `${cloudMonthlyData.length} months, ${cloudIncomes.length} incomes, ` +
          `${cloudExpenses.length} expenses, ${cloudInstallments.length} installments`
      )

      // ── Categories ────────────────────────────────────────────────────
      const categories: Category[] = cloudCategories.map((c) => {
        // Update idMappings: local categoryId → cloud UUID
        this.syncStore.addIdMapping('categories', c.categoryId, c.id)

        return {
          id: c.categoryId,
          color: c.color,
          icon: c.icon ?? null,
          isSystem: c.isSystem,
          order: c.order,
          // customLabel is set only when it differs from the technical categoryId
          customLabel: c.label !== c.categoryId ? c.label : undefined,
        }
      })

      // ── Credit Cards ──────────────────────────────────────────────────
      const creditCards: CreditCard[] = cloudCards.map((card) => {
        this.syncStore.addIdMapping('creditCards', card.cardId, card.id)

        return {
          id: card.cardId,
          name: card.name,
          color: card.color,
          limit: card.limit ?? null,
          order: card.order,
        }
      })

      // ── Installments ──────────────────────────────────────────────────
      // The upload stores installment.card (local kebab-case) directly in
      // the cloud's `cardId` field, so no UUID mapping is needed here.
      const installments: Installment[] = cloudInstallments.map((inst) => ({
        id: this.generateShortId(),
        name: inst.name,
        card: inst.cardId, // already local card ID (kebab-case)
        totalInstallments: inst.totalInstallments,
        amountPerInstallment: inst.amountPerInstallment,
        startMonth: inst.startMonth,
      }))

      // ── Monthly Data ──────────────────────────────────────────────────
      // Build a map from cloud UUID → month key (YYYY-MM) for income/expense lookup
      const monthUuidToKey: Record<string, string> = {}
      const monthlyDataMap: Record<string, MonthlyData> = {}

      for (const m of cloudMonthlyData) {
        monthUuidToKey[m.id] = m.month
        this.syncStore.addIdMapping('monthlyData', m.month, m.id)

        monthlyDataMap[m.month] = {
          month: m.month,
          investments: m.investments,
          savings: m.savings,
          incomes: [],
          fixedExpenses: [],
          variableExpenses: [],
        }
      }

      // ── Incomes ───────────────────────────────────────────────────────
      for (const income of cloudIncomes) {
        const monthKey = monthUuidToKey[income.monthlyDataId]
        if (!monthKey || !monthlyDataMap[monthKey]) continue

        monthlyDataMap[monthKey].incomes.push({
          id: this.generateShortId(),
          description: income.description,
          amount: income.amount,
          recurringGroupId: income.recurringGroupId ?? undefined,
        })
      }

      // ── Expenses ──────────────────────────────────────────────────────
      // expense.categoryId is stored as kebab-case (e.g. 'groceries'), not a UUID.
      // expense.installmentId is the old local short ID from the source device;
      // it cannot be mapped to any newly generated installment ID, so we clear it.
      for (const expense of cloudExpenses) {
        const monthKey = monthUuidToKey[expense.monthlyDataId]
        if (!monthKey || !monthlyDataMap[monthKey]) continue

        const localExpense: Expense = {
          id: this.generateShortId(),
          description: expense.description,
          amount: expense.amount,
          category: expense.categoryId, // kebab-case, used directly
          type: expense.type ?? 'variable',
          date: expense.date,
          installmentId: undefined, // cannot reconstruct cross-device installment links
          recurringGroupId: expense.recurringGroupId ?? undefined,
        }

        if (expense.type === 'fixed') {
          monthlyDataMap[monthKey].fixedExpenses.push(localExpense)
        } else {
          monthlyDataMap[monthKey].variableExpenses.push(localExpense)
        }
      }

      // ── Replace local store ───────────────────────────────────────────
      useExpenseStore.setState({
        categories,
        creditCards,
        installments,
        monthlyData: monthlyDataMap,
      })

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      this.syncStore.setStatus('connected')
      this.syncStore.setLastSyncTime(new Date())

      console.log(`✅ Download complete in ${elapsed}s`)
    } catch (error) {
      console.error('❌ Error downloading data:', error)
      this.syncStore.setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao baixar dados da nuvem'
      )
      this.syncStore.setStatus('error')
      throw error
    }
  }

  /**
   * Resolve a data conflict by choosing which side wins.
   *
   * 'use-cloud': Download cloud data, overwriting local store
   * 'use-local': Clear cloud, then upload local data
   */
  async resolveConflict(strategy: 'use-cloud' | 'use-local'): Promise<void> {
    console.log(`🔀 Resolving conflict: ${strategy}`)

    if (strategy === 'use-cloud') {
      await this.downloadCloudData()
    } else {
      // Clear remote, then re-upload everything from local
      await this.clearCloudData()
      await this.uploadInitialData()
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
          label: category.customLabel || category.id, // Map customLabel to label for backend
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
   * Disconnect and clear sync state (keeps local data intact)
   */
  async disconnect(): Promise<void> {
    try {
      // Sign out from Amplify Auth
      await signOut()
    } catch (error) {
      console.warn('⚠️ Sign out error (will continue with local cleanup):', error)
    }

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
