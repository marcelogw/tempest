import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/generate-invite-code'
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { Schema } from '../../data/resource'

type CognitoIdentity = {
  sub: string
  username: string
  claims: Record<string, unknown>
}

const cognitoClient = new CognitoIdentityProviderClient({})

const INVITE_TTL_MINUTES = 20
const MAX_WORKSPACE_MEMBERS = 2

export const handler: Schema['generateInviteCode']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity
  const callerSub = identity.sub
  const userPoolId = process.env.USER_POOL_ID!
  const { workspaceId } = event.arguments

  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
  Amplify.configure(resourceConfig, libraryOptions)
  const dataClient = generateClient<Schema>({ authMode: 'iam' })

  const { data: workspace } = await dataClient.models.Workspace.get({ id: workspaceId })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  if (workspace.ownerSub !== callerSub) {
    throw new Error('Only the workspace owner can generate invite codes')
  }

  const listUsersResult = await cognitoClient.send(
    new ListUsersInGroupCommand({
      GroupName: workspace.workspaceGroup,
      UserPoolId: userPoolId,
    })
  )

  const memberCount = listUsersResult.Users?.length ?? 0
  if (memberCount >= MAX_WORKSPACE_MEMBERS) {
    throw new Error(`Workspace already has the maximum of ${MAX_WORKSPACE_MEMBERS} members`)
  }

  // Invalidate any previously active (unused) invites for this workspace
  const { data: existingInvites } = await dataClient.models.Invite.list({
    filter: { workspaceId: { eq: workspaceId } },
  })

  const unusedInvites = (existingInvites ?? []).filter((invite) => !invite.usedAt)
  await Promise.all(
    unusedInvites.map((invite) =>
      dataClient.models.Invite.update({
        id: invite.id,
        usedAt: new Date().toISOString(),
      })
    )
  )

  const expiresAt = new Date(Date.now() + INVITE_TTL_MINUTES * 60 * 1000).toISOString()

  const { data: invite } = await dataClient.models.Invite.create({
    workspaceId,
    workspaceGroup: workspace.workspaceGroup,
    workspaceName: workspace.name,
    expiresAt,
  })

  if (!invite) {
    throw new Error('Failed to create invite')
  }

  return {
    inviteId: invite.id,
    inviteUrl: `/invite/${invite.id}`,
    expiresAt,
  }
}
