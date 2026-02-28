import type { Session } from './types'

export interface AuthAdapter {
  getSession(): Promise<Session | null>
  getCurrentUserSub(): Promise<string | null>
  signIn(): Promise<void>
  signOut(): Promise<void>
}
