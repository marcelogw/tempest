import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncStatus = 'disconnected' | 'connected' | 'syncing' | 'error'

export interface SyncState {
  status: SyncStatus
  userEmail: string | null
  errorMessage: string | null

  workspaceId: string | null
  workspaceGroup: string | null
  lastSyncedAt: number | null

  setStatus: (status: SyncStatus) => void
  setUserEmail: (email: string | null) => void
  setErrorMessage: (message: string | null) => void
  setWorkspace: (workspaceId: string, workspaceGroup: string) => void
  setLastSyncedAt: (timestamp: number) => void
  disconnect: () => void
  reset: () => void
}

const initialState = {
  status: 'disconnected' as SyncStatus,
  userEmail: null,
  errorMessage: null,
  workspaceId: null,
  workspaceGroup: null,
  lastSyncedAt: null,
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStatus: (status) => set({ status }),

      setUserEmail: (userEmail) => set({ userEmail }),

      setErrorMessage: (errorMessage) =>
        set({
          errorMessage,
          status: errorMessage ? 'error' : get().status,
        }),

      setWorkspace: (workspaceId, workspaceGroup) => set({ workspaceId, workspaceGroup }),

      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

      disconnect: () =>
        set({
          status: 'disconnected',
          userEmail: null,
          errorMessage: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'tempest-sync-storage',
      partialize: (state) => ({
        userEmail: state.userEmail,
        workspaceId: state.workspaceId,
        workspaceGroup: state.workspaceGroup,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)
