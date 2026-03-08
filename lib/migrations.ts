/**
 * Data Migration System for localStorage
 *
 * This module handles versioned migrations of localStorage data
 * to maintain compatibility when schema changes are made.
 */

export const CURRENT_SCHEMA_VERSION = 2

type MigrationFn = (data: unknown) => unknown

/**
 * Migration from version 1 (Portuguese IDs) to version 2 (English IDs)
 *
 * Changes:
 * - SYSTEM_CATEGORY_ID: 'outros' → 'other'
 * - Category IDs: 'mercado' → 'groceries', 'transporte' → 'transportation', etc.
 */
const migrateV1ToV2: MigrationFn = (data: unknown) => {
  if (!data || typeof data !== 'object') return data

  const state = data as {
    state?: {
      categories?: Array<{
        id: string
        label?: string
        customLabel?: string
        [key: string]: unknown
      }>
      monthlyData?: Record<
        string,
        {
          fixedExpenses?: Array<{ category: string; [key: string]: unknown }>
          variableExpenses?: Array<{ category: string; [key: string]: unknown }>
        }
      >
    }
  }

  // Category ID mapping (Portuguese → English)
  const categoryIdMap: Record<string, string> = {
    mercado: 'groceries',
    transporte: 'transportation',
    saude: 'health',
    lazer: 'leisure',
    alimentacao: 'food',
    educacao: 'education',
    moradia: 'housing',
    assinaturas: 'subscriptions',
    'cartao-credito': 'credit-card',
    parcelamento: 'installment',
    outros: 'other',
  }

  if (!state.state) return data

  // Migrate category IDs and remove labels from system categories
  if (state.state.categories && Array.isArray(state.state.categories)) {
    state.state.categories = state.state.categories.map((cat) => {
      const oldId = cat.id
      const newId = categoryIdMap[oldId] || oldId
      const isSystemCategory = oldId in categoryIdMap

      // Remove 'label' field, convert to 'customLabel' only for user-created categories
      const result: {
        id: string
        [key: string]: unknown
      } = {
        ...cat,
        id: newId,
      }

      // Remove old label field
      delete result.label

      // For user-created categories, preserve label as customLabel
      if (!isSystemCategory && cat.label) {
        result.customLabel = cat.label
      }

      return result
    }) as typeof state.state.categories
  }

  // Migrate expense category references
  if (state.state?.monthlyData && typeof state.state.monthlyData === 'object') {
    Object.keys(state.state.monthlyData).forEach((month) => {
      const monthData = state.state!.monthlyData![month]

      if (monthData.fixedExpenses && Array.isArray(monthData.fixedExpenses)) {
        monthData.fixedExpenses = monthData.fixedExpenses.map((expense) => ({
          ...expense,
          category: categoryIdMap[expense.category] || expense.category,
        }))
      }

      if (monthData.variableExpenses && Array.isArray(monthData.variableExpenses)) {
        monthData.variableExpenses = monthData.variableExpenses.map((expense) => ({
          ...expense,
          category: categoryIdMap[expense.category] || expense.category,
        }))
      }
    })
  }

  return data
}

/**
 * Migration registry
 * Maps version numbers to migration functions
 */
const migrations: Record<number, MigrationFn> = {
  2: migrateV1ToV2,
}

/**
 * Run all necessary migrations to bring data to current schema version
 *
 * @param data - Raw localStorage data
 * @param currentVersion - Current schema version in data (defaults to 1 if not present)
 * @returns Migrated data with updated version
 */
export function runMigrations(data: unknown, currentVersion: number = 1): unknown {
  let migratedData = data

  // Run each migration in sequence from current version to target version
  for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    const migration = migrations[version]
    if (migration) {
      console.warn(`[Migrations] Running migration to version ${version}`)
      try {
        migratedData = migration(migratedData)
      } catch (error) {
        console.error(`[Migrations] Failed to migrate to version ${version}:`, error)
        throw new Error(`Migration to version ${version} failed`)
      }
    }
  }

  // Add version metadata
  if (migratedData && typeof migratedData === 'object') {
    return {
      ...migratedData,
      version: CURRENT_SCHEMA_VERSION,
    }
  }

  return migratedData
}

/**
 * Check if migrations are needed
 *
 * @param data - Raw localStorage data
 * @returns True if migrations are needed
 */
export function needsMigration(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false

  const version = (data as { version?: number }).version || 1
  return version < CURRENT_SCHEMA_VERSION
}

/**
 * Create a backup of data before migration
 *
 * @param data - Data to backup
 * @returns Backup key in localStorage
 */
export function createBackup(data: unknown): string {
  const timestamp = new Date().toISOString()
  const backupKey = `tempest-backup-${timestamp}`

  try {
    localStorage.setItem(backupKey, JSON.stringify(data))
    console.warn(`[Migrations] Backup created: ${backupKey}`)
    return backupKey
  } catch (error) {
    console.error('[Migrations] Failed to create backup:', error)
    throw new Error('Failed to create backup before migration')
  }
}

/**
 * Clean up old backups (keep only last 3)
 */
export function cleanupOldBackups(): void {
  try {
    const backupKeys = Object.keys(localStorage).filter((key) => key.startsWith('tempest-backup-'))

    // Sort by timestamp (newest first)
    backupKeys.sort().reverse()

    // Keep only last 3 backups
    backupKeys.slice(3).forEach((key) => {
      localStorage.removeItem(key)
      console.warn(`[Migrations] Removed old backup: ${key}`)
    })
  } catch (error) {
    console.error('[Migrations] Failed to cleanup old backups:', error)
  }
}
