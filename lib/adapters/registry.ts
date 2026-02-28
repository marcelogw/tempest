import type { StorageAdapter } from './storage-adapter'
import type { AuthAdapter } from './auth-adapter'

let _storage: StorageAdapter | null = null
let _auth: AuthAdapter | null = null

export function setAdapters(storage: StorageAdapter, auth: AuthAdapter): void {
  _storage = storage
  _auth = auth
}

export function getStorage(): StorageAdapter {
  if (!_storage)
    throw new Error('[tempest] StorageAdapter not initialized. Is AdapterProvider mounted?')
  return _storage
}

export function getAuth(): AuthAdapter {
  if (!_auth) throw new Error('[tempest] AuthAdapter not initialized. Is AdapterProvider mounted?')
  return _auth
}
