export type WorkspaceData = {
  categories: Array<{
    id: string
    categoryId: string
    label: string
    color: string
    icon: string | null
    isSystem: boolean
    order: number
  }>
  creditCards: Array<{
    id: string
    cardId: string
    name: string
    color: string
    limit: number | null
    order: number
  }>
  monthlyDataList: Array<{
    id: string
    month: string
    investments: number
    savings: number
  }>
  incomes: Array<{
    id: string
    description: string
    amount: number
    recurringGroupId: string | null
    monthlyDataId: string
  }>
  expenses: Array<{
    id: string
    description: string
    amount: number
    categoryId: string
    type: 'fixed' | 'variable'
    date: string
    installmentId: string | null
    recurringGroupId: string | null
    monthlyDataId: string
  }>
  installments: Array<{
    id: string
    name: string
    cardId: string
    totalInstallments: number
    amountPerInstallment: number
    startMonth: string
  }>
}

export type Session = {
  userSub: string
  email: string | null
}

export type UserProfile = {
  cognitoSub: string
  displayName: string
  email: string
  avatarColor: string
}

export type Workspace = {
  id: string
  ownerSub: string
  lastActivityAt: string | null
}

export type CreatedWorkspace = {
  workspaceId: string
  workspaceGroup: string
}

export type AcceptedInvite = {
  workspaceId: string
  workspaceName: string
  workspaceGroup: string
}

export type GeneratedInvite = {
  inviteId: string
  inviteUrl: string
  expiresAt: string
}

export type CategoryInput = {
  workspaceGroup: string
  categoryId: string
  label: string
  color: string
  icon?: string | null
  isSystem: boolean
  order: number
}

export type CreditCardInput = {
  workspaceGroup: string
  cardId: string
  name: string
  color: string
  limit?: number | null
  order: number
}

export type IncomeInput = {
  id: string
  workspaceGroup: string
  description: string
  amount: number
  recurringGroupId?: string | null
  monthlyDataId: string
}

export type ExpenseInput = {
  id: string
  workspaceGroup: string
  description: string
  amount: number
  categoryId: string
  type: 'fixed' | 'variable'
  date: string
  installmentId?: string | null
  recurringGroupId?: string | null
  monthlyDataId: string
}

export type InstallmentInput = {
  id: string
  workspaceGroup: string
  name: string
  cardId: string
  totalInstallments: number
  amountPerInstallment: number
  startMonth: string
}

export type MonthlyDataUpdate = {
  investments?: number
  savings?: number
}
