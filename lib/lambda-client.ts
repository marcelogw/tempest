import { getAmplifyClient } from './workspace-client'

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
