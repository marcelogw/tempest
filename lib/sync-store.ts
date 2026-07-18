import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncStatus = 'disconnected' | 'connected' | 'syncing' | 'error'

export interface SyncState {
  status: SyncStatus
  userEmail: string | null
  userName: string | null
  userPicture: string | null
  errorMessage: string | null

  workspaceId: string | null
  workspaceGroup: string | null
  lastSyncedAt: number | null

  setStatus: (status: SyncStatus) => void
  setUserSession: (email: string | null, name: string | null, picture: string | null) => void
  setErrorMessage: (message: string | null) => void
  setWorkspace: (workspaceId: string, workspaceGroup: string) => void
  setLastSyncedAt: (timestamp: number) => void
  disconnect: () => void
  reset: () => void
}

const initialState = {
  status: 'disconnected' as SyncStatus,
  userEmail: null,
  userName: null,
  userPicture: null,
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

      setUserSession: (userEmail, userName, userPicture) =>
        set({ userEmail, userName, userPicture }),

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
          userName: null,
          userPicture: null,
          errorMessage: null,
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'tempest-sync-storage',
      partialize: (state) => ({
        userEmail: state.userEmail,
        userName: state.userName,
        userPicture: state.userPicture,
        workspaceId: state.workspaceId,
        workspaceGroup: state.workspaceGroup,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)
