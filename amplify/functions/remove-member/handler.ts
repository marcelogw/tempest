import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import { env } from '$amplify/env/remove-member'
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  AdminRemoveUserFromGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { Schema } from '../../data/resource'

type CognitoIdentity = {
  sub: string
  username: string
  claims: Record<string, unknown>
}

const cognitoClient = new CognitoIdentityProviderClient({})

export const handler: Schema['removeMember']['functionHandler'] = async (event) => {
  const identity = event.identity as CognitoIdentity
  const callerSub = identity.sub
  const userPoolId = process.env.USER_POOL_ID!
  const { workspaceId, memberSub } = event.arguments

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env)
  Amplify.configure(resourceConfig, libraryOptions)
  const dataClient = generateClient<Schema>({ authMode: 'iam' })

  const { data: workspace } = await dataClient.models.Workspace.get({ id: workspaceId })

  if (!workspace) {
    throw new Error('Workspace not found')
  }

  if (workspace.ownerSub !== callerSub) {
    throw new Error('Only the workspace owner can remove members')
  }

  if (memberSub === callerSub) {
    throw new Error('Cannot remove yourself from the workspace')
  }

  const listUsersResult = await cognitoClient.send(
    new ListUsersInGroupCommand({
      GroupName: workspace.workspaceGroup,
      UserPoolId: userPoolId,
    })
  )

  const members = listUsersResult.Users ?? []
  const isMember = members.some(
    (u) =>
      u.Username === memberSub || u.Attributes?.find((a) => a.Name === 'sub')?.Value === memberSub
  )

  if (!isMember) {
    throw new Error('User is not a member of this workspace')
  }

  await cognitoClient.send(
    new AdminRemoveUserFromGroupCommand({
      GroupName: workspace.workspaceGroup,
      UserPoolId: userPoolId,
      Username: memberSub,
    })
  )

  return { success: true }
}
