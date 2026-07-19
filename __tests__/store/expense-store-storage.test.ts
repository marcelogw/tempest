/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-floating-promises */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExpenseStore } from '@/lib/expense-store'

vi.mock('@/lib/migrations', () => ({
  CURRENT_SCHEMA_VERSION: 2,
  needsMigration: vi.fn((data) => data.version < 2),
  createBackup: vi.fn(),
  cleanupOldBackups: vi.fn(),
  runMigrations: vi.fn((data) => ({ ...data, version: 2, migrated: true })),
}))

import * as migrations from '@/lib/migrations'

describe('Expense Store Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // We need to re-create the store or at least interact with its storage
    // But since Zustand persist is already initialized, we can just call the storage directly if exposed,
    // or simulate what the persist middleware does.
    // The easiest way is to set item in localStorage and call a store action that forces re-hydration.
    useExpenseStore.persist.clearStorage()
  })

  it('runs migrations when loading older version', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    localStorage.setItem(
      'expense-store',
      JSON.stringify({ state: { monthlyData: {} }, version: 1 })
    )

    useExpenseStore.persist.rehydrate()

    expect(migrations.needsMigration).toHaveBeenCalled()
    expect(migrations.createBackup).toHaveBeenCalled()
    expect(migrations.runMigrations).toHaveBeenCalled()

    // Verify it updated localStorage
    const saved = JSON.parse(localStorage.getItem('expense-store') || '{}')
    expect(saved.version).toBe(2)
    expect(saved.migrated).toBe(true)

    consoleWarnSpy.mockRestore()
  })

  it('handles backup errors during migration gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(migrations.createBackup).mockImplementationOnce(() => {
      throw new Error('Backup failed')
    })

    localStorage.setItem(
      'expense-store',
      JSON.stringify({ state: { monthlyData: {} }, version: 1 })
    )

    useExpenseStore.persist.rehydrate()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Store] Failed to create backup:',
      expect.any(Error)
    )
    // Should still run migrations
    expect(migrations.runMigrations).toHaveBeenCalled()

    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('handles malformed JSON in storage', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    localStorage.setItem('expense-store', 'invalid-json')

    useExpenseStore.persist.rehydrate()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Store] Error reading/migrating storage:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })
})
