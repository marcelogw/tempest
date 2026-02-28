import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { StorageAdapter, CollaborativeStorageAdapter } from '@/lib/adapters/storage-adapter'
import type { AuthAdapter } from '@/lib/adapters/auth-adapter'

// Registry uses module-level state. vi.resetModules() + dynamic import per describe
// gives each group a fresh module instance with _storage = null and _auth = null.

describe('before setAdapters', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('getStorage throws with initialization message', async () => {
    const { getStorage } = await import('@/lib/adapters/registry')
    expect(() => getStorage()).toThrow('StorageAdapter not initialized')
  })

  it('getAuth throws with initialization message', async () => {
    const { getAuth } = await import('@/lib/adapters/registry')
    expect(() => getAuth()).toThrow('AuthAdapter not initialized')
  })

  it('getCollaborativeStorage throws with initialization message', async () => {
    const { getCollaborativeStorage } = await import('@/lib/adapters/registry')
    expect(() => getCollaborativeStorage()).toThrow('StorageAdapter not initialized')
  })
})

describe('after setAdapters', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('getStorage returns the registered storage adapter', async () => {
    const { getStorage, setAdapters } = await import('@/lib/adapters/registry')
    const mockStorage = { configure: vi.fn() } as unknown as StorageAdapter
    const mockAuth = {} as unknown as AuthAdapter
    setAdapters(mockStorage, mockAuth)
    expect(getStorage()).toBe(mockStorage)
  })

  it('getAuth returns the registered auth adapter', async () => {
    const { getAuth, setAdapters } = await import('@/lib/adapters/registry')
    const mockStorage = {} as unknown as StorageAdapter
    const mockAuth = { getSession: vi.fn() } as unknown as AuthAdapter
    setAdapters(mockStorage, mockAuth)
    expect(getAuth()).toBe(mockAuth)
  })

  it('getCollaborativeStorage throws when adapter has no acceptInvite', async () => {
    const { getCollaborativeStorage, setAdapters } = await import('@/lib/adapters/registry')
    const mockStorage = {} as unknown as StorageAdapter
    const mockAuth = {} as unknown as AuthAdapter
    setAdapters(mockStorage, mockAuth)
    expect(() => getCollaborativeStorage()).toThrow('not available in local mode')
  })

  it('getCollaborativeStorage returns adapter when acceptInvite is present', async () => {
    const { getCollaborativeStorage, setAdapters } = await import('@/lib/adapters/registry')
    const mockStorage = { acceptInvite: vi.fn() } as unknown as CollaborativeStorageAdapter
    const mockAuth = {} as unknown as AuthAdapter
    setAdapters(mockStorage, mockAuth)
    expect(getCollaborativeStorage()).toBe(mockStorage)
  })
})
