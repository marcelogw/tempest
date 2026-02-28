import type { StorageAdapter } from '../storage-adapter'
import type {
  WorkspaceData,
  UserProfile,
  Workspace,
  CreatedWorkspace,
  AcceptedInvite,
  GeneratedInvite,
  CategoryInput,
  CreditCardInput,
  IncomeInput,
  ExpenseInput,
  InstallmentInput,
  MonthlyDataUpdate,
} from '../types'
import { configureAmplify } from '@/lib/amplify-config'
import * as workspaceClient from '@/lib/workspace-client'
import * as lambdaClient from '@/lib/lambda-client'

export class AmplifyStorageAdapter implements StorageAdapter {
  configure(): Promise<void> {
    configureAmplify()
    return Promise.resolve()
  }

  async fetchWorkspaceData(workspaceGroup: string): Promise<WorkspaceData> {
    return workspaceClient.fetchWorkspaceData(workspaceGroup)
  }

  async getWorkspaceLastActivity(workspaceId: string): Promise<Date | null> {
    return workspaceClient.getWorkspaceLastActivity(workspaceId)
  }

  async touchWorkspaceActivity(workspaceId: string): Promise<void> {
    return workspaceClient.touchWorkspaceActivity(workspaceId)
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    const client = workspaceClient.getAmplifyClient()
    const { data } = await client.models.Workspace.get({ id })
    if (!data) return null
    return {
      id: data.id,
      ownerSub: (data as { ownerSub: string }).ownerSub,
      lastActivityAt: (data as { lastActivityAt?: string | null }).lastActivityAt ?? null,
    }
  }

  async listUserProfiles(workspaceGroup: string): Promise<UserProfile[]> {
    const client = workspaceClient.getAmplifyClient()
    const { data } = await client.models.UserProfile.list({
      filter: { workspaceGroup: { eq: workspaceGroup } },
    })
    return (data ?? []).map((p) => ({
      cognitoSub: (p as { cognitoSub: string }).cognitoSub,
      displayName: (p as { displayName: string }).displayName,
      email: (p as { email: string }).email,
      avatarColor: (p as { avatarColor: string }).avatarColor,
    }))
  }

  async createWorkspace(name: string): Promise<CreatedWorkspace> {
    return lambdaClient.createWorkspace(name)
  }

  async acceptInvite(inviteId: string): Promise<AcceptedInvite> {
    return lambdaClient.acceptInvite(inviteId)
  }

  async generateInviteCode(workspaceId: string): Promise<GeneratedInvite> {
    return lambdaClient.generateInviteCode(workspaceId)
  }

  async removeMember(workspaceId: string, memberSub: string): Promise<void> {
    return lambdaClient.removeMember(workspaceId, memberSub)
  }

  async createCategory(id: string, data: CategoryInput): Promise<void> {
    return workspaceClient.createCategory(id, data)
  }

  async updateCategory(cloudId: string, data: Partial<CategoryInput>): Promise<void> {
    return workspaceClient.updateCategory(cloudId, data)
  }

  async deleteCategory(cloudId: string): Promise<void> {
    return workspaceClient.deleteCategory(cloudId)
  }

  async createCreditCard(id: string, data: CreditCardInput): Promise<void> {
    return workspaceClient.createCreditCard(id, data)
  }

  async updateCreditCard(cloudId: string, data: Partial<CreditCardInput>): Promise<void> {
    return workspaceClient.updateCreditCard(cloudId, data)
  }

  async deleteCreditCard(cloudId: string): Promise<void> {
    return workspaceClient.deleteCreditCard(cloudId)
  }

  async createMonthlyData(month: string, workspaceGroup: string): Promise<void> {
    return workspaceClient.createMonthlyData(month, workspaceGroup)
  }

  async updateMonthlyData(month: string, data: MonthlyDataUpdate): Promise<void> {
    return workspaceClient.updateMonthlyData(month, data)
  }

  async createIncome(data: IncomeInput): Promise<void> {
    return workspaceClient.createIncome(data)
  }

  async updateIncome(id: string, data: Partial<IncomeInput>): Promise<void> {
    return workspaceClient.updateIncome(id, data)
  }

  async deleteIncome(id: string): Promise<void> {
    return workspaceClient.deleteIncome(id)
  }

  async createExpense(data: ExpenseInput): Promise<void> {
    return workspaceClient.createExpense(data)
  }

  async updateExpense(id: string, data: Partial<ExpenseInput>): Promise<void> {
    return workspaceClient.updateExpense(id, data)
  }

  async deleteExpense(id: string): Promise<void> {
    return workspaceClient.deleteExpense(id)
  }

  async createInstallment(data: InstallmentInput): Promise<void> {
    return workspaceClient.createInstallment(data)
  }

  async deleteInstallment(id: string): Promise<void> {
    return workspaceClient.deleteInstallment(id)
  }
}
