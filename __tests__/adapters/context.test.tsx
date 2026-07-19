/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AdapterProvider, useAdapterContext } from '@/lib/adapters/context'
import * as configMod from '@/lib/adapters/config'
import * as factoryMod from '@/lib/adapters/factory'
import * as registryMod from '@/lib/adapters/registry'
import * as queueMod from '@/lib/write-queue'

// Mock the hooks and dependencies
vi.mock('@/lib/hooks/use-workspace-sync', () => ({
  useWorkspaceSync: vi.fn(),
}))

vi.mock('@/lib/adapters/config', () => ({
  loadConfig: vi.fn(),
}))

vi.mock('@/lib/adapters/factory', () => ({
  createAdapters: vi.fn(),
}))

vi.mock('@/lib/adapters/registry', () => ({
  setAdapters: vi.fn(),
}))

vi.mock('@/lib/write-queue', () => ({
  startBackgroundProcessor: vi.fn(),
}))

function TestComponent() {
  const { isReady, isConfigured } = useAdapterContext()
  return (
    <div>
      <div data-testid="is-ready">{String(isReady)}</div>
      <div data-testid="is-configured">{String(isConfigured)}</div>
    </div>
  )
}

describe('AdapterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', '')
  })

  it('initializes adapters and sets context to ready', async () => {
    const mockStorage = { configure: vi.fn().mockResolvedValue(undefined) }
    const mockAuth = {}

    vi.mocked(configMod.loadConfig).mockReturnValue({ storage: 'local', auth: 'none' })
    vi.mocked(factoryMod.createAdapters).mockReturnValue({
      storage: mockStorage as any,
      auth: mockAuth as any,
    })

    render(
      <AdapterProvider>
        <TestComponent />
      </AdapterProvider>
    )

    // Initially not ready
    expect(screen.getByTestId('is-ready')).toHaveTextContent('false')
    expect(screen.getByTestId('is-configured')).toHaveTextContent('false')

    // Wait for async configure
    await waitFor(() => {
      expect(screen.getByTestId('is-ready')).toHaveTextContent('true')
    })

    // It should NOT be configured since env var is not 'amplify'
    expect(screen.getByTestId('is-configured')).toHaveTextContent('false')

    // Verify side effects
    expect(mockStorage.configure).toHaveBeenCalled()
    expect(registryMod.setAdapters).toHaveBeenCalledWith(mockStorage, mockAuth)
    expect(queueMod.startBackgroundProcessor).toHaveBeenCalled()
  })

  it('sets isConfigured to true when in amplify mode', async () => {
    vi.stubEnv('NEXT_PUBLIC_TEMPEST_STORAGE', 'amplify')

    const mockStorage = { configure: vi.fn().mockResolvedValue(undefined) }
    vi.mocked(configMod.loadConfig).mockReturnValue({ storage: 'amplify', auth: 'amplify' })
    vi.mocked(factoryMod.createAdapters).mockReturnValue({
      storage: mockStorage as any,
      auth: {} as any,
    })

    render(
      <AdapterProvider>
        <TestComponent />
      </AdapterProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-ready')).toHaveTextContent('true')
    })

    // In amplify mode, once ready, it is configured
    expect(screen.getByTestId('is-configured')).toHaveTextContent('true')
  })
})
