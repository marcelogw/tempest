import { getAmplifyClient } from './workspace-client'

export async function generateInviteCode(
  workspaceId: string
): Promise<{ inviteId: string; inviteUrl: string; expiresAt: string }> {
  const client = getAmplifyClient()
  const { data, errors } = await client.mutations.generateInviteCode({ workspaceId })

  if (errors?.length || !data) {
    throw new Error(errors?.[0]?.message ?? 'Failed to generate invite code')
  }

  return { inviteId: data.inviteId, inviteUrl: data.inviteUrl, expiresAt: data.expiresAt }
}

export async function removeMember(workspaceId: string, memberSub: string): Promise<void> {
  const client = getAmplifyClient()
  const { data, errors } = await client.mutations.removeMember({ workspaceId, memberSub })

  if (errors?.length || !data) {
    throw new Error(errors?.[0]?.message ?? 'Failed to remove member')
  }
}

export async function createWorkspace(
  name: string
): Promise<{ workspaceId: string; workspaceGroup: string }> {
  const client = getAmplifyClient()
  const { data, errors } = await client.mutations.createWorkspace({ name })

  if (errors?.length || !data) {
    throw new Error(errors?.[0]?.message ?? 'Failed to create workspace')
  }

  return { workspaceId: data.workspaceId, workspaceGroup: data.workspaceGroup }
}

export async function acceptInvite(
  inviteId: string
): Promise<{ workspaceId: string; workspaceName: string; workspaceGroup: string }> {
  const client = getAmplifyClient()
  const { data, errors } = await client.mutations.acceptInvite({ inviteId })

  if (errors?.length || !data) {
    throw new Error(errors?.[0]?.message ?? 'Failed to accept invite')
  }

  return {
    workspaceId: data.workspaceId,
    workspaceName: data.workspaceName,
    workspaceGroup: data.workspaceGroup,
  }
}
