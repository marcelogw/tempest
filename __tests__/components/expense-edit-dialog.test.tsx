/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { ExpenseEditDialog } from '@/components/expense/expense-edit-dialog'
import { type Expense, useExpenseStore } from '@/lib/expense-store'

describe('ExpenseEditDialog', () => {
  const mockOnSubmit = vi.fn()
  const mockOnOpenChange = vi.fn()

  const mockExpense: Expense = {
    id: 'test-123',
    description: 'Plano de Celular',
    amount: 100,
    category: 'utilities',
    type: 'fixed',
    date: '2026-01-01',
  }

  const mockRecurringExpense: Expense = {
    ...mockExpense,
    recurringGroupId: 'recur_abc123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render dialog with expense data pre-filled', () => {
      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.getByDisplayValue('Plano de Celular')).toBeInTheDocument()
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salvar alteracoes/i })).toBeInTheDocument()
    })

    it('should render correct title for fixed expenses', () => {
      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.getByText(/editar despesa fixa/i)).toBeInTheDocument()
    })

    it('should handle category without icon', () => {
      const initialCategories = useExpenseStore.getState().categories
      useExpenseStore.setState({
        categories: [
          {
            id: 'no-icon',
            color: '#000',
            icon: null,
            isSystem: false,
            order: 1,
            customLabel: 'No Icon',
          },
        ],
      })

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.getByText(/editar despesa/i)).toBeInTheDocument()
      useExpenseStore.setState({ categories: initialCategories })
    })

    it('should render correct title for variable expenses', () => {
      const variableExpense = { ...mockExpense, type: 'variable' as const }
      render(
        <ExpenseEditDialog
          expense={variableExpense}
          type="variable"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.getByText(/editar despesa variavel/i)).toBeInTheDocument()
    })
  })

  describe('Recurring Expense Indicators', () => {
    it('should show info box for recurring fixed expenses', () => {
      render(
        <ExpenseEditDialog
          expense={mockRecurringExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(
        screen.getByText(/as alterações serão aplicadas a partir deste mês/i)
      ).toBeInTheDocument()
    })

    it('should NOT show info box for non-recurring fixed expenses', () => {
      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(
        screen.queryByText(/as alterações serão aplicadas a partir deste mês/i)
      ).not.toBeInTheDocument()
    })

    it('should show "Tornar recorrente" checkbox for non-recurring fixed expenses', () => {
      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.getByLabelText(/tornar recorrente/i)).toBeInTheDocument()
    })

    it('should NOT show "Tornar recorrente" checkbox for recurring fixed expenses', () => {
      render(
        <ExpenseEditDialog
          expense={mockRecurringExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.queryByLabelText(/tornar recorrente/i)).not.toBeInTheDocument()
    })

    it('should NOT show "Tornar recorrente" checkbox for variable expenses', () => {
      const variableExpense = { ...mockExpense, type: 'variable' as const }
      render(
        <ExpenseEditDialog
          expense={variableExpense}
          type="variable"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      expect(screen.queryByLabelText(/tornar recorrente/i)).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should update description field', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const descriptionInput = screen.getByDisplayValue('Plano de Celular')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Plano Premium')

      expect(descriptionInput).toHaveValue('Plano Premium')
    })

    it('should update amount field', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const amountInput = screen.getByDisplayValue('100')
      await user.clear(amountInput)
      await user.type(amountInput, '150')

      expect(amountInput).toHaveValue(150)
    })

    it('should toggle "Tornar recorrente" checkbox', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const checkbox = screen.getByRole('checkbox', { name: /tornar recorrente/i })
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })

    it('should call onSubmit with updated expense data', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const descriptionInput = screen.getByDisplayValue('Plano de Celular')
      const amountInput = screen.getByDisplayValue('100')

      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Novo Plano')

      await user.clear(amountInput)
      await user.type(amountInput, '120')

      const submitButton = screen.getByRole('button', { name: /salvar alteracoes/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Novo Plano',
          amount: 120,
          id: 'test-123',
          category: 'utilities',
        }),
        false // makeRecurring
      )
    })

    it('should call onSubmit with makeRecurring=true when checkbox is checked', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const checkbox = screen.getByRole('checkbox', { name: /tornar recorrente/i })
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: /salvar alteracoes/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(Object), true)
    })

    it('should close dialog after submission', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const submitButton = screen.getByRole('button', { name: /salvar alteracoes/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should not submit with empty description', () => {
      const { fireEvent } = require('@testing-library/react')
      const { container } = render(
        <ExpenseEditDialog
          expense={{ ...mockExpense, description: '' }}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const form = container.querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Form validation should prevent submission
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not submit with empty amount', () => {
      const { fireEvent } = require('@testing-library/react')
      const { container } = render(
        <ExpenseEditDialog
          expense={{ ...mockExpense, amount: '' as unknown as number }}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const form = container.querySelector('form')
      if (form) {
        fireEvent.submit(form)
      }

      // Form validation should prevent submission
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Form Reset on Expense Change', () => {
    it('should reset form when expense prop changes', async () => {
      const { rerender } = render(
        <ExpenseEditDialog
          expense={mockExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      const user = userEvent.setup()

      // Modificar campo
      const descriptionInput = screen.getByDisplayValue('Plano de Celular')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Modificado')

      // Mudar expense prop
      const newExpense = {
        ...mockExpense,
        id: 'test-456',
        description: 'Academia',
        amount: 120,
      }

      rerender(
        <ExpenseEditDialog
          expense={newExpense}
          type="fixed"
          open={true}
          onOpenChange={mockOnOpenChange}
          onSubmit={mockOnSubmit}
          currentMonth="2026-01"
        />
      )

      // Form deve ser resetado com novos valores
      expect(screen.getByDisplayValue('Academia')).toBeInTheDocument()
      expect(screen.getByDisplayValue('120')).toBeInTheDocument()
    })
  })
})
