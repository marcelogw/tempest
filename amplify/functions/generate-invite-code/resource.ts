import { defineFunction } from '@aws-amplify/backend'

export const generateInviteCodeFn = defineFunction({
  name: 'generate-invite-code',
  entry: './handler.ts',
})
