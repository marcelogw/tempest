import { describe, it, expect } from 'vitest'
import { createAdapters } from '@/lib/adapters/factory'
import { AmplifyStorageAdapter } from '@/lib/adapters/amplify/amplify-storage-adapter'
import { AmplifyAuthAdapter } from '@/lib/adapters/amplify/amplify-auth-adapter'
import { LocalStorageAdapter } from '@/lib/adapters/local/local-storage-adapter'
import { NoAuthAdapter } from '@/lib/adapters/local/no-auth-adapter'

describe('createAdapters', () => {
  it('returns amplify adapters when configured', () => {
    const adapters = createAdapters({ storage: 'amplify', auth: 'amplify' })
    expect(adapters.storage).toBeInstanceOf(AmplifyStorageAdapter)
    expect(adapters.auth).toBeInstanceOf(AmplifyAuthAdapter)
  })

  it('returns local adapters when configured for local', () => {
    const adapters = createAdapters({ storage: 'local', auth: 'none' })
    expect(adapters.storage).toBeInstanceOf(LocalStorageAdapter)
    expect(adapters.auth).toBeInstanceOf(NoAuthAdapter)
  })
})
