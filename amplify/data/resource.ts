import { type ClientSchema, a, defineData } from '@aws-amplify/backend'
import { createWorkspaceFn } from '../functions/create-workspace/resource'
import { generateInviteCodeFn } from '../functions/generate-invite-code/resource'
import { acceptInviteFn } from '../functions/accept-invite/resource'

/**
 * Tempest - Personal Finance Management Schema
 *
 * This schema defines the data model for tracking income, expenses,
 * investments, savings, installments, categories, and credit cards.
 * All financial records are scoped to a workspace via workspaceGroup.
 */
const schema = a
  .schema({
    // ─── Workspace & User Models ────────────────────────────────────────────────

    Workspace: a
      .model({
        name: a.string().required(),
        workspaceGroup: a.string().required(), // "workspace-{uuid}"
        lastActivityAt: a.datetime().required(),
        ownerSub: a.string().required(),
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    UserProfile: a
      .model({
        cognitoSub: a.string().required(), // Cognito user sub — used as dedup key
        displayName: a.string().required(),
        email: a.string().required(),
        avatarColor: a.string().required(), // hex color for initials avatar
      })
      .authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),

    Invite: a
      .model({
        workspaceId: a.id().required(),
        workspaceGroup: a.string().required(),
        workspaceName: a.string().required(), // shown to guest before accepting
        expiresAt: a.datetime().required(),
        usedAt: a.datetime(), // filled after acceptance (enforces one-time use)
      })
      .authorization((allow) => [
        allow.groupDefinedIn('workspaceGroup'),
        allow.authenticated().to(['read']),
      ]),

    // ─── Custom Mutations (Lambda-backed) ────────────────────────────────────────

    createWorkspace: a
      .mutation()
      .arguments({ name: a.string().required() })
      .returns(
        a.customType({
          workspaceId: a.string().required(),
          workspaceGroup: a.string().required(),
        })
      )
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(createWorkspaceFn)),

    generateInviteCode: a
      .mutation()
      .arguments({ workspaceId: a.string().required() })
      .returns(
        a.customType({
          inviteId: a.string().required(),
          inviteUrl: a.string().required(),
          expiresAt: a.string().required(),
        })
      )
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(generateInviteCodeFn)),

    acceptInvite: a
      .mutation()
      .arguments({ inviteId: a.string().required() })
      .returns(
        a.customType({
          workspaceId: a.string().required(),
          workspaceName: a.string().required(),
          workspaceGroup: a.string().required(),
        })
      )
      .authorization((allow) => [allow.authenticated()])
      .handler(a.handler.function(acceptInviteFn)),

    // ─── Financial Models (workspace-scoped) ─────────────────────────────────────

    // Expense categories (user-configurable with predefined defaults)
    Category: a
      .model({
        workspaceGroup: a.string().required(),
        categoryId: a.string().required(), // kebab-case ID (e.g., 'mercado')
        label: a.string().required(), // Display name in Portuguese
        color: a.string().required(), // Hex color from palette
        icon: a.string(), // Lucide icon name (optional)
        isSystem: a.boolean().required().default(false), // System category (can't be deleted)
        order: a.integer().required().default(0), // For custom ordering
        expenses: a.hasMany('Expense', 'categoryId'), // Expenses in this category
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    // Credit cards for installment tracking
    CreditCard: a
      .model({
        workspaceGroup: a.string().required(),
        cardId: a.string().required(), // kebab-case ID from name
        name: a.string().required(), // Display name
        color: a.string().required(), // Hex color from palette
        limit: a.float(), // Monthly limit in BRL (null = no limit)
        order: a.integer().required().default(0), // For custom ordering
        installments: a.hasMany('Installment', 'cardId'), // Installments on this card
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    // Monthly financial data container
    MonthlyData: a
      .model({
        workspaceGroup: a.string().required(),
        month: a.string().required(), // Format: YYYY-MM (e.g., '2026-01')
        investments: a.float().required().default(0), // Monthly investments
        savings: a.float().required().default(0), // Monthly savings
        incomes: a.hasMany('Income', 'monthlyDataId'), // Income entries
        expenses: a.hasMany('Expense', 'monthlyDataId'), // All expenses (filter by type)
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    // Income entries (salary, bonuses, etc.)
    Income: a
      .model({
        workspaceGroup: a.string().required(),
        description: a.string().required(),
        amount: a.float().required(),
        recurringGroupId: a.string(), // Groups recurring incomes across months
        monthlyDataId: a.id().required(), // Parent MonthlyData
        monthlyData: a.belongsTo('MonthlyData', 'monthlyDataId'),
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    // Expenses (fixed and variable)
    Expense: a
      .model({
        workspaceGroup: a.string().required(),
        description: a.string().required(),
        amount: a.float().required(),
        categoryId: a.id().required(), // Category reference
        category: a.belongsTo('Category', 'categoryId'),
        type: a.enum(['fixed', 'variable']), // Expense type
        date: a.string().required(), // Date in YYYY-MM-DD format
        installmentId: a.id(), // Optional reference to parent installment
        installment: a.belongsTo('Installment', 'installmentId'),
        recurringGroupId: a.string(), // Groups recurring fixed expenses
        monthlyDataId: a.id().required(), // Parent MonthlyData
        monthlyData: a.belongsTo('MonthlyData', 'monthlyDataId'),
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),

    // Credit card installments
    Installment: a
      .model({
        workspaceGroup: a.string().required(),
        name: a.string().required(), // Description (e.g., 'iPhone 15 Pro')
        cardId: a.id().required(), // Credit card reference
        card: a.belongsTo('CreditCard', 'cardId'),
        totalInstallments: a.integer().required(), // Total number of installments
        amountPerInstallment: a.float().required(), // Amount per installment
        startMonth: a.string().required(), // Start month in YYYY-MM format
        expenses: a.hasMany('Expense', 'installmentId'), // Generated expenses
      })
      .authorization((allow) => [allow.groupDefinedIn('workspaceGroup')]),
  })
  .authorization((allow) => [
    // Grant Lambda function handlers access to all models via IAM.
    // Schema-level resource auth is necessary because model-level allow (BaseAllowModifier)
    // intentionally excludes allow.resource() — it is only available at the schema level.
    allow.resource(createWorkspaceFn),
    allow.resource(generateInviteCodeFn),
    allow.resource(acceptInviteFn),
  ])

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
