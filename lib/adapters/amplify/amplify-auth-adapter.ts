import type { AuthAdapter } from '../auth-adapter'
import type { Session } from '../types'
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth'

export class AmplifyAuthAdapter implements AuthAdapter {
  async getSession(): Promise<Session | null> {
    try {
      const session = await fetchAuthSession()
      const sub = session.tokens?.idToken?.payload.sub
      if (!sub) return null
      const email = (session.tokens?.idToken?.payload.email as string | undefined) ?? null
      return { userSub: String(sub), email }
    } catch {
      return null
    }
  }

  async getCurrentUserSub(): Promise<string | null> {
    const session = await this.getSession()
    return session?.userSub ?? null
  }

  async signIn(): Promise<void> {
    try {
      await signInWithRedirect({ provider: 'Google' })
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'UserAlreadyAuthenticatedException') {
        await signOut()
        await signInWithRedirect({ provider: 'Google' })
      } else {
        throw error
      }
    }
  }

  async signOut(): Promise<void> {
    await signOut()
  }
}
