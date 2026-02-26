import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/accept-invite'
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { Schema } from '../../data/resource'

type CognitoIdentity = {
  sub: string
  username: string
  claims: Record<string, unknown>
}

const cognitoClient = new CognitoIdentityProviderClient({})

const MAX_WORKSPACE_MEMBERS = 2

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

export const handler: Schema['acceptInvite']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity
  const callerSub = identity.sub
  const userPoolId = process.env.USER_POOL_ID!
  const { inviteId } = event.arguments

  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
  Amplify.configure(resourceConfig, libraryOptions)
  const dataClient = generateClient<Schema>({ authMode: 'iam' })

  const { data: invite } = await dataClient.models.Invite.get({ id: inviteId })

  if (!invite) {
    throw new Error('Invite not found')
  }

  if (invite.usedAt) {
    throw new Error('Invite has already been used')
  }

  if (new Date(invite.expiresAt) <= new Date()) {
    throw new Error('Invite has expired')
  }

  const listUsersResult = await cognitoClient.send(
    new ListUsersInGroupCommand({
      GroupName: invite.workspaceGroup,
      UserPoolId: userPoolId,
    })
  )

  const members = listUsersResult.Users ?? []
  if (members.length >= MAX_WORKSPACE_MEMBERS) {
    throw new Error(`Workspace already has the maximum of ${MAX_WORKSPACE_MEMBERS} members`)
  }

  const alreadyMember = members.some(
    (u) =>
      u.Username === callerSub || u.Attributes?.find((a) => a.Name === 'sub')?.Value === callerSub
  )
  if (alreadyMember) {
    throw new Error('You are already a member of this workspace')
  }

  await cognitoClient.send(
    new AdminAddUserToGroupCommand({
      GroupName: invite.workspaceGroup,
      UserPoolId: userPoolId,
      Username: callerSub,
    })
  )

  await dataClient.models.Invite.update({
    id: inviteId,
    usedAt: new Date().toISOString(),
  })

  // Upsert UserProfile — keyed on cognitoSub (unique Cognito user identifier)
  const { data: existingProfiles } = await dataClient.models.UserProfile.list({
    filter: { cognitoSub: { eq: callerSub } },
  })

  const displayName =
    (identity.claims['name'] as string | undefined) ??
    (identity.claims['email'] as string | undefined) ??
    callerSub
  const email = (identity.claims['email'] as string | undefined) ?? ''

  if (!existingProfiles || existingProfiles.length === 0) {
    await dataClient.models.UserProfile.create({
      cognitoSub: callerSub,
      displayName,
      email,
      avatarColor: hashAvatarColor(callerSub),
      workspaceGroup: invite.workspaceGroup,
    })
  } else {
    await dataClient.models.UserProfile.update({
      id: existingProfiles[0].id,
      workspaceGroup: invite.workspaceGroup,
    })
  }

  return {
    workspaceId: invite.workspaceId,
    workspaceName: invite.workspaceName,
    workspaceGroup: invite.workspaceGroup,
  }
}
