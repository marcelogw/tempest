type StorageMode = 'local' | 'amplify'
type AuthMode = 'none' | 'amplify'

export type AdapterConfig = { storage: StorageMode; auth: AuthMode }

const VALID_COMBINATIONS: Array<[StorageMode, AuthMode]> = [
  ['local', 'none'],
  ['amplify', 'amplify'],
]

export function loadConfig(): AdapterConfig {
  const storage = (process.env.NEXT_PUBLIC_TEMPEST_STORAGE ?? 'local') as StorageMode
  const auth = (process.env.NEXT_PUBLIC_TEMPEST_AUTH ?? 'none') as AuthMode

  const valid = VALID_COMBINATIONS.some(([s, a]) => s === storage && a === auth)
  if (!valid) {
    throw new Error(
      `[tempest] Invalid adapter combination: storage=${storage}, auth=${auth}.\n` +
        `Valid combinations:\n` +
        VALID_COMBINATIONS.map(([s, a]) => `  storage=${s} + auth=${a}`).join('\n')
    )
  }

  const storageLabel = storage === 'local' ? 'LocalStorageAdapter' : 'AmplifyStorageAdapter'
  const authLabel = auth === 'none' ? 'NoAuthAdapter' : 'AmplifyAuthAdapter'
  // eslint-disable-next-line no-console
  console.log(`[tempest] storage : ${storageLabel}   (source: env)`)
  // eslint-disable-next-line no-console
  console.log(`[tempest] auth    : ${authLabel}   (source: env)`)

  return { storage, auth }
}
