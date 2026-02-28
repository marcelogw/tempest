import type { AdapterConfig } from './config'
import type { StorageAdapter } from './storage-adapter'
import type { AuthAdapter } from './auth-adapter'
import { AmplifyStorageAdapter } from './amplify/amplify-storage-adapter'
import { AmplifyAuthAdapter } from './amplify/amplify-auth-adapter'
import { LocalStorageAdapter } from './local/local-storage-adapter'
import { NoAuthAdapter } from './local/no-auth-adapter'

export function createAdapters(config: AdapterConfig): {
  storage: StorageAdapter
  auth: AuthAdapter
} {
  if (config.storage === 'amplify' && config.auth === 'amplify') {
    return {
      storage: new AmplifyStorageAdapter(),
      auth: new AmplifyAuthAdapter(),
    }
  }

  return {
    storage: new LocalStorageAdapter(),
    auth: new NoAuthAdapter(),
  }
}
