import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Sync status states
 */
export type SyncStatus = 'disconnected' | 'connected' | 'syncing' | 'error'

/**
 * ID mapping from local kebab-case IDs to AWS UUID IDs
 * Critical for maintaining relationships between local and cloud data
 *
 * Example:
 * - Local: { id: 'mercado', label: 'Mercado' }
 * - AWS: { id: 'uuid-123', categoryId: 'mercado', label: 'Mercado' }
 * - Mapping: { categories: { 'mercado': 'uuid-123' } }
 */
export interface IdMappings {
  categories: Record<string, string> // local categoryId → AWS UUID
  creditCards: Record<string, string> // local cardId → AWS UUID
  monthlyData: Record<string, string> // YYYY-MM → AWS UUID
}

/**
 * Sync store state interface
 */
export interface SyncState {
  // Connection state
  status: SyncStatus
  userEmail: string | null
  lastSyncTime: Date | null
  errorMessage: string | null

  // ID mappings (persisted to localStorage)
  idMappings: IdMappings

  // Actions
  setStatus: (status: SyncStatus) => void
  setUserEmail: (email: string | null) => void
  setLastSyncTime: (time: Date) => void
  setErrorMessage: (message: string | null) => void
  addIdMapping: (type: keyof IdMappings, localId: string, cloudId: string) => void
  getCloudId: (type: keyof IdMappings, localId: string) => string | undefined
  clearIdMappings: () => void
  disconnect: () => void
  reset: () => void
}

/**
 * Initial state
 */
const initialState = {
  status: 'disconnected' as SyncStatus,
  userEmail: null,
  lastSyncTime: null,
  errorMessage: null,
  idMappings: {
    categories: {},
    creditCards: {},
    monthlyData: {},
  },
}

/**
 * Sync store with localStorage persistence
 *
 * Persists only idMappings and connection state (userEmail, lastSyncTime)
 * Status and error are ephemeral (reset on page load)
 */
export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStatus: (status) => set({ status }),

      setUserEmail: (userEmail) => set({ userEmail }),

      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      setErrorMessage: (errorMessage) =>
        set({
          errorMessage,
          status: errorMessage ? 'error' : get().status,
        }),

      addIdMapping: (type, localId, cloudId) =>
        set((state) => ({
          idMappings: {
            ...state.idMappings,
            [type]: {
              ...state.idMappings[type],
              [localId]: cloudId,
            },
          },
        })),

      getCloudId: (type, localId) => {
        const mappings = get().idMappings[type]
        return mappings[localId]
      },

      clearIdMappings: () =>
        set({
          idMappings: {
            categories: {},
            creditCards: {},
            monthlyData: {},
          },
        }),

      disconnect: () =>
        set({
          status: 'disconnected',
          userEmail: null,
          lastSyncTime: null,
          errorMessage: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'tempest-sync-storage',
      partialize: (state) => ({
        userEmail: state.userEmail,
        lastSyncTime: state.lastSyncTime,
        idMappings: state.idMappings,
      }),
    }
  )
)
