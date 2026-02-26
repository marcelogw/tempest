import { defineFunction } from '@aws-amplify/backend'

export const removeMemberFn = defineFunction({ name: 'remove-member', entry: './handler.ts' })
