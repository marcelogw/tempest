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
} from './types'

export interface StorageAdapter {
  configure(): Promise<void>

  fetchWorkspaceData(workspaceGroup: string): Promise<WorkspaceData>
  getWorkspaceLastActivity(workspaceId: string): Promise<Date | null>
  touchWorkspaceActivity(workspaceId: string): Promise<void>
  getWorkspace(id: string): Promise<Workspace | null>
  listUserProfiles(workspaceGroup: string): Promise<UserProfile[]>

  createWorkspace(name: string): Promise<CreatedWorkspace>
  acceptInvite(inviteId: string): Promise<AcceptedInvite>
  generateInviteCode(workspaceId: string): Promise<GeneratedInvite>
  removeMember(workspaceId: string, memberSub: string): Promise<void>

  createCategory(localKey: string, data: CategoryInput): Promise<void>
  updateCategory(id: string, data: Partial<CategoryInput>): Promise<void>
  deleteCategory(id: string): Promise<void>

  createCreditCard(localKey: string, data: CreditCardInput): Promise<void>
  updateCreditCard(id: string, data: Partial<CreditCardInput>): Promise<void>
  deleteCreditCard(id: string): Promise<void>

  createMonthlyData(month: string, workspaceGroup: string): Promise<void>
  updateMonthlyData(month: string, data: MonthlyDataUpdate): Promise<void>

  createIncome(data: IncomeInput): Promise<void>
  updateIncome(id: string, data: Partial<IncomeInput>): Promise<void>
  deleteIncome(id: string): Promise<void>

  createExpense(data: ExpenseInput): Promise<void>
  updateExpense(id: string, data: Partial<ExpenseInput>): Promise<void>
  deleteExpense(id: string): Promise<void>

  createInstallment(data: InstallmentInput): Promise<void>
  deleteInstallment(id: string): Promise<void>
}
