import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/**
 * Tempest - Personal Finance Management Schema
 *
 * This schema defines the data model for tracking income, expenses,
 * investments, savings, installments, categories, and credit cards.
 */
const schema = a.schema({
  // Expense categories (user-configurable with predefined defaults)
  Category: a
    .model({
      categoryId: a.string().required(), // kebab-case ID (e.g., 'mercado')
      label: a.string().required(), // Display name in Portuguese
      color: a.string().required(), // Hex color from palette
      icon: a.string(), // Lucide icon name (optional)
      isSystem: a.boolean().required().default(false), // System category (can't be deleted)
      order: a.integer().required().default(0), // For custom ordering
      expenses: a.hasMany('Expense', 'categoryId'), // Expenses in this category
    })
    .authorization((allow) => [allow.owner()]),

  // Credit cards for installment tracking
  CreditCard: a
    .model({
      cardId: a.string().required(), // kebab-case ID from name
      name: a.string().required(), // Display name
      color: a.string().required(), // Hex color from palette
      limit: a.float(), // Monthly limit in BRL (null = no limit)
      order: a.integer().required().default(0), // For custom ordering
      installments: a.hasMany('Installment', 'cardId'), // Installments on this card
    })
    .authorization((allow) => [allow.owner()]),

  // Monthly financial data container
  MonthlyData: a
    .model({
      month: a.string().required(), // Format: YYYY-MM (e.g., '2026-01')
      investments: a.float().required().default(0), // Monthly investments
      savings: a.float().required().default(0), // Monthly savings
      incomes: a.hasMany('Income', 'monthlyDataId'), // Income entries
      expenses: a.hasMany('Expense', 'monthlyDataId'), // All expenses (filter by type)
    })
    .authorization((allow) => [allow.owner()]),

  // Income entries (salary, bonuses, etc.)
  Income: a
    .model({
      description: a.string().required(),
      amount: a.float().required(),
      recurringGroupId: a.string(), // Groups recurring incomes across months
      monthlyDataId: a.id().required(), // Parent MonthlyData
      monthlyData: a.belongsTo('MonthlyData', 'monthlyDataId'),
    })
    .authorization((allow) => [allow.owner()]),

  // Expenses (fixed and variable)
  Expense: a
    .model({
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
    .authorization((allow) => [allow.owner()]),

  // Credit card installments
  Installment: a
    .model({
      name: a.string().required(), // Description (e.g., 'iPhone 15 Pro')
      cardId: a.id().required(), // Credit card reference
      card: a.belongsTo('CreditCard', 'cardId'),
      totalInstallments: a.integer().required(), // Total number of installments
      amountPerInstallment: a.float().required(), // Amount per installment
      startMonth: a.string().required(), // Start month in YYYY-MM format
      expenses: a.hasMany('Expense', 'installmentId'), // Generated expenses
    })
    .authorization((allow) => [allow.owner()]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // Changed from identityPool to require authentication
  },
})

/**
 * Usage example:
 *
 * import { generateClient } from 'aws-amplify/data'
 * import type { Schema } from '@/amplify/data/resource'
 *
 * const client = generateClient<Schema>()
 *
 * // Create a new expense
 * const { data: expense } = await client.models.Expense.create({
 *   description: 'Supermercado',
 *   amount: 250.50,
 *   categoryId: 'mercado',
 *   type: 'variable',
 *   date: '2026-02-05',
 *   monthlyDataId: 'monthly-id-here'
 * })
 *
 * // List all expenses for a month
 * const { data: expenses } = await client.models.Expense.list({
 *   filter: { monthlyDataId: { eq: 'monthly-id-here' } }
 * })
 *
 * // List only fixed expenses for a month
 * const { data: fixedExpenses } = await client.models.Expense.list({
 *   filter: {
 *     monthlyDataId: { eq: 'monthly-id-here' },
 *     type: { eq: 'fixed' }
 *   }
 * })
 *
 * // List only variable expenses for a month
 * const { data: variableExpenses } = await client.models.Expense.list({
 *   filter: {
 *     monthlyDataId: { eq: 'monthly-id-here' },
 *     type: { eq: 'variable' }
 *   }
 * })
 */
