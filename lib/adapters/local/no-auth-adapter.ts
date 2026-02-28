import type { AuthAdapter } from '../auth-adapter'
import type { Session } from '../types'

export class NoAuthAdapter implements AuthAdapter {
  getSession(): Promise<Session> {
    return Promise.resolve({ userSub: 'local-user', email: null })
  }

  getCurrentUserSub(): Promise<string> {
    return Promise.resolve('local-user')
  }

  signIn(): Promise<void> {
    return Promise.resolve()
  }

  signOut(): Promise<void> {
    return Promise.resolve()
  }
}
