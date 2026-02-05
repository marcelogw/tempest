'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AuthForm } from '@/components/auth/auth-form'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

/**
 * AuthDialog - Wrapper for AuthForm with dialog presentation
 *
 * Flow:
 * 1. User clicks "Conectar Conta" in SyncCard
 * 2. Dialog opens with AuthForm
 * 3. User logs in with Google or Email
 * 4. onSuccess callback triggers upload
 * 5. Dialog closes
 */
export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar Conta</DialogTitle>
          <DialogDescription>
            Faça login para sincronizar seus dados na nuvem e acessar de qualquer dispositivo.
          </DialogDescription>
        </DialogHeader>
        <AuthForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
