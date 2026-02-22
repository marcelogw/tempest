import { defineFunction } from '@aws-amplify/backend'

export const createWorkspaceFn = defineFunction({
  name: 'create-workspace',
  entry: './handler.ts',
})
