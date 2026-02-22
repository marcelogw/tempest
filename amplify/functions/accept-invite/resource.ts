import { defineFunction } from '@aws-amplify/backend'

export const acceptInviteFn = defineFunction({
  name: 'accept-invite',
  entry: './handler.ts',
})
