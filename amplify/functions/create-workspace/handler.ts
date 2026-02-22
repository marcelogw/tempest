import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/create-workspace'
import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { randomUUID } from 'node:crypto'
import type { Schema } from '../../data/resource'

type CognitoIdentity = {
  sub: string
  username: string
  claims: Record<string, unknown>
}

// Mirrors DEFAULT_CATEGORIES from lib/expense-store.ts.
// Label falls back to categoryId (consistent with sync-manager.ts behavior).
// i18n labels are resolved by the frontend at runtime.
const DEFAULT_CATEGORIES = [
  { categoryId: 'groceries', color: '#10b981', icon: 'ShoppingCart', isSystem: false, order: 0 },
  { categoryId: 'transportation', color: '#3b82f6', icon: 'Car', isSystem: false, order: 1 },
  { categoryId: 'health', color: '#ef4444', icon: 'Heart', isSystem: false, order: 2 },
  { categoryId: 'leisure', color: '#f59e0b', icon: 'PartyPopper', isSystem: false, order: 3 },
  { categoryId: 'food', color: '#ec4899', icon: 'Utensils', isSystem: false, order: 4 },
  { categoryId: 'education', color: '#8b5cf6', icon: 'GraduationCap', isSystem: false, order: 5 },
  { categoryId: 'housing', color: '#06b6d4', icon: 'Home', isSystem: false, order: 6 },
  {
    categoryId: 'subscriptions',
    color: '#14b8a6',
    icon: 'RefreshCw',
    isSystem: false,
    order: 7,
  },
  { categoryId: 'credit-card', color: '#6366f1', icon: 'CreditCard', isSystem: false, order: 8 },
  { categoryId: 'installment', color: '#f97316', icon: 'Calendar', isSystem: false, order: 9 },
  { categoryId: 'other', color: '#64748b', icon: 'MoreHorizontal', isSystem: true, order: 10 },
] as const

const cognitoClient = new CognitoIdentityProviderClient({})

function hashAvatarColor(sub: string): string {
  let hash = 0
  for (let i = 0; i < sub.length; i++) {
    hash = (hash << 5) - hash + sub.charCodeAt(i)
    hash |= 0
  }
  const palette = [
    '#E57373',
    '#F06292',
    '#BA68C8',
    '#9575CD',
    '#7986CB',
    '#64B5F6',
    '#4DB6AC',
    '#81C784',
    '#FFD54F',
    '#FF8A65',
  ]
  return palette[Math.abs(hash) % palette.length]
}

export const handler: Schema['createWorkspace']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity
  const callerSub = identity.sub
  const userPoolId = process.env.USER_POOL_ID!

  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
  Amplify.configure(resourceConfig, libraryOptions)
  const dataClient = generateClient<Schema>({ authMode: 'iam' })

  const workspaceId = randomUUID()
  const workspaceGroup = `workspace-${workspaceId}`

  await cognitoClient.send(
    new CreateGroupCommand({
      GroupName: workspaceGroup,
      UserPoolId: userPoolId,
    })
  )

  await cognitoClient.send(
    new AdminAddUserToGroupCommand({
      GroupName: workspaceGroup,
      UserPoolId: userPoolId,
      Username: callerSub,
    })
  )

  await dataClient.models.Workspace.create({
    id: workspaceId,
    name: event.arguments.name,
    workspaceGroup,
    lastActivityAt: new Date().toISOString(),
    ownerSub: callerSub,
  })

  // Create default categories for the new workspace in parallel
  await Promise.all(
    DEFAULT_CATEGORIES.map((cat) =>
      dataClient.models.Category.create({
        workspaceGroup,
        categoryId: cat.categoryId,
        label: cat.categoryId, // i18n label resolved by frontend at runtime
        color: cat.color,
        icon: cat.icon,
        isSystem: cat.isSystem,
        order: cat.order,
      })
    )
  )

  // Upsert UserProfile — keyed on cognitoSub (unique Cognito user identifier)
  const { data: existingProfiles } = await dataClient.models.UserProfile.list({
    filter: { cognitoSub: { eq: callerSub } },
  })

  if (!existingProfiles || existingProfiles.length === 0) {
    const displayName =
      (identity.claims['name'] as string | undefined) ??
      (identity.claims['email'] as string | undefined) ??
      callerSub
    const email = (identity.claims['email'] as string | undefined) ?? ''

    await dataClient.models.UserProfile.create({
      cognitoSub: callerSub,
      displayName,
      email,
      avatarColor: hashAvatarColor(callerSub),
    })
  }

  return { workspaceId, workspaceGroup }
}
