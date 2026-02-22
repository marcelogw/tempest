'use client'

import { useTranslations } from 'next-intl'
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
  const i = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{i('ui.auth.connectAccount')}</DialogTitle>
          <DialogDescription>{i('ui.auth.loginDescription')}</DialogDescription>
        </DialogHeader>
        <AuthForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
