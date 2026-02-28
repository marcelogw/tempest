import { describe, it, expect } from 'vitest'
import { NoAuthAdapter } from '@/lib/adapters/local/no-auth-adapter'

describe('NoAuthAdapter', () => {
  const adapter = new NoAuthAdapter()

  it('getSession returns local-user session', async () => {
    await expect(adapter.getSession()).resolves.toEqual({ userSub: 'local-user', email: null })
  })

  it('getCurrentUserSub returns local-user', async () => {
    await expect(adapter.getCurrentUserSub()).resolves.toBe('local-user')
  })

  it('signIn resolves without error', async () => {
    await expect(adapter.signIn()).resolves.toBeUndefined()
  })

  it('signOut resolves without error', async () => {
    await expect(adapter.signOut()).resolves.toBeUndefined()
  })
})
