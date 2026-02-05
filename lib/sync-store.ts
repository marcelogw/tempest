import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncStatus = 'disconnected' | 'connected' | 'syncing' | 'error'

type IdMappingType = 'categories' | 'creditCards' | 'monthlyData'

interface SyncStore {
  status: SyncStatus
  userEmail: string | null
  lastSyncTime: Date | null
  errorMessage: string | null
  idMappings: Record<string, Record<string, string>> // { type: { localId: cloudId } }

  setStatus: (status: SyncStatus) => void
  setUserEmail: (email: string | null) => void
  setLastSyncTime: (time: Date | null) => void
  setErrorMessage: (message: string | null) => void

  addIdMapping: (type: IdMappingType, localId: string, cloudId: string) => void
  getCloudId: (type: IdMappingType, localId: string) => string | undefined
  clearIdMappings: () => void

  disconnect: () => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      status: 'disconnected',
      userEmail: null,
      lastSyncTime: null,
      errorMessage: null,
      idMappings: {},

      setStatus: (status) => set({ status }),

      setUserEmail: (email) => set({ userEmail: email }),

      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      setErrorMessage: (message) => set({ errorMessage: message }),

      addIdMapping: (type, localId, cloudId) => {
        const { idMappings } = get()
        set({
          idMappings: {
            ...idMappings,
            [type]: {
              ...(idMappings[type] || {}),
              [localId]: cloudId,
            },
          },
        })
      },

      getCloudId: (type, localId) => {
        const { idMappings } = get()
        return idMappings[type]?.[localId]
      },

      clearIdMappings: () => set({ idMappings: {} }),

      disconnect: () =>
        set({
          status: 'disconnected',
          userEmail: null,
          lastSyncTime: null,
          errorMessage: null,
        }),
    }),
    {
      name: 'sync-store',
    }
  )
)
