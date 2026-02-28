import type { StorageAdapter, CollaborativeStorageAdapter } from './storage-adapter'
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

export function getCollaborativeStorage(): CollaborativeStorageAdapter {
  if (!_storage)
    throw new Error('[tempest] StorageAdapter not initialized. Is AdapterProvider mounted?')
  if (!('acceptInvite' in _storage))
    throw new Error('[tempest] Collaborative features are not available in local mode.')
  return _storage as CollaborativeStorageAdapter
}

export function getAuth(): AuthAdapter {
  if (!_auth) throw new Error('[tempest] AuthAdapter not initialized. Is AdapterProvider mounted?')
  return _auth
}
