import { describe, it, expect, afterEach, vi } from 'vitest'
import { loadConfig } from '@/lib/adapters/config'

describe('loadConfig', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  afterEach(() => {
    vi.unstubAllEnvs()
    consoleSpy.mockClear()
  })

  it('returns local/none for local + none combination', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'local')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'none')
    expect(loadConfig()).toEqual({ storage: 'local', auth: 'none' })
  })

  it('defaults to local/none when env variables are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', '')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', '')
    delete process.env.NEXT_PUBLIC_TEMPEST_STORAGE
    delete process.env.NEXT_PUBLIC_TEMPEST_AUTH
    expect(loadConfig()).toEqual({ storage: 'local', auth: 'none' })
  })

  it('returns amplify/amplify for amplify + amplify combination', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'amplify')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'amplify')
    expect(loadConfig()).toEqual({ storage: 'amplify', auth: 'amplify' })
  })

  it('throws for invalid combination', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'local')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'amplify')
    expect(() => loadConfig()).toThrow('Invalid adapter combination')
  })

  it('includes valid combinations in the error message', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'amplify')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'none')
    expect(() => loadConfig()).toThrow('storage=local + auth=none')
  })

  it('logs LocalStorageAdapter for local storage mode', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'local')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'none')
    loadConfig()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('LocalStorageAdapter'))
  })

  it('logs NoAuthAdapter for none auth mode', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'local')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'none')
    loadConfig()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('NoAuthAdapter'))
  })

  it('logs AmplifyStorageAdapter for amplify storage mode', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'amplify')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'amplify')
    loadConfig()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('AmplifyStorageAdapter'))
  })

  it('logs AmplifyAuthAdapter for amplify auth mode', () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'amplify')
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_AUTH', 'amplify')
    loadConfig()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('AmplifyAuthAdapter'))
  })
})
