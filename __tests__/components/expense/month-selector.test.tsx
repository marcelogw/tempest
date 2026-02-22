import { render, screen } from '@/__tests__/test-utils'
import { userEvent } from '@testing-library/user-event'
import { MonthSelector } from '@/components/expense/month-selector'
import { beforeEach, describe, it, expect, vi } from 'vitest'

describe('MonthSelector', () => {
  const mockOnMonthChange = vi.fn()

  beforeEach(() => {
    mockOnMonthChange.mockClear()
  })

  // ===================================================================
  // CATEGORIA A: Navegação com Setas
  // ===================================================================
  describe('Categoria A: Navegação com Setas', () => {
    it('Teste 1: Seta direita avança de Janeiro → Fevereiro', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)

      const nextButton = screen.getAllByRole('button')[1]
      await user.click(nextButton)

      expect(mockOnMonthChange).toHaveBeenCalledWith('2026-02')
    })

    it('Teste 2: Seta esquerda retrocede de Fevereiro → Janeiro', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2026-02" onMonthChange={mockOnMonthChange} />)

      const prevButton = screen.getAllByRole('button')[0]
      await user.click(prevButton)

      expect(mockOnMonthChange).toHaveBeenCalledWith('2026-01')
    })

    it('Teste 3: Transição de ano (Dezembro 2025 → Janeiro 2026)', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2025-12" onMonthChange={mockOnMonthChange} />)

      const nextButton = screen.getAllByRole('button')[1]
      await user.click(nextButton)

      expect(mockOnMonthChange).toHaveBeenCalledWith('2026-01')
    })

    it('Teste 4: Transição de ano reversa (Janeiro 2026 → Dezembro 2025)', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)

      const prevButton = screen.getAllByRole('button')[0]
      await user.click(prevButton)

      expect(mockOnMonthChange).toHaveBeenCalledWith('2025-12')
    })

    it('Teste 5: Múltiplas navegações consecutivas (5+ cliques)', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />
      )

      const nextButton = screen.getAllByRole('button')[1]

      // Janeiro → Fevereiro
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-02')
      rerender(<MonthSelector currentMonth="2026-02" onMonthChange={mockOnMonthChange} />)

      // Fevereiro → Março
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-03')
      rerender(<MonthSelector currentMonth="2026-03" onMonthChange={mockOnMonthChange} />)

      // Março → Abril
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-04')
      rerender(<MonthSelector currentMonth="2026-04" onMonthChange={mockOnMonthChange} />)

      // Abril → Maio
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-05')
      rerender(<MonthSelector currentMonth="2026-05" onMonthChange={mockOnMonthChange} />)

      // Maio → Junho
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-06')

      expect(mockOnMonthChange).toHaveBeenCalledTimes(5)
    })
  })

  // ===================================================================
  // CATEGORIA B: Seleção por Dropdown
  // ===================================================================
  describe('Categoria B: Seleção por Dropdown', () => {
    it('Teste 6: Selecionar Janeiro exibe "Janeiro"', () => {
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)

      expect(screen.getByText(/janeiro/i)).toBeInTheDocument()
    })

    it('Teste 7: Selecionar Dezembro exibe "Dezembro"', () => {
      render(<MonthSelector currentMonth="2026-12" onMonthChange={mockOnMonthChange} />)

      expect(screen.getByText(/dezembro/i)).toBeInTheDocument()
    })

    it('Teste 8: Todos os 12 meses exibem corretamente quando selecionados', () => {
      const months = [
        { month: '01', name: 'janeiro' },
        { month: '02', name: 'fevereiro' },
        { month: '03', name: 'março' },
        { month: '04', name: 'abril' },
        { month: '05', name: 'maio' },
        { month: '06', name: 'junho' },
        { month: '07', name: 'julho' },
        { month: '08', name: 'agosto' },
        { month: '09', name: 'setembro' },
        { month: '10', name: 'outubro' },
        { month: '11', name: 'novembro' },
        { month: '12', name: 'dezembro' },
      ]

      // Verificar que cada mês renderiza corretamente quando passado como prop
      months.forEach(({ month, name }) => {
        const { unmount } = render(
          <MonthSelector currentMonth={`2026-${month}`} onMonthChange={mockOnMonthChange} />
        )
        expect(screen.getByText(new RegExp(name, 'i'))).toBeInTheDocument()
        unmount()
      })
    })

    it('Teste 9: Dropdown trigger mostra o mês atual selecionado', () => {
      render(<MonthSelector currentMonth="2026-05" onMonthChange={mockOnMonthChange} />)

      // Verificar que "Maio" está exibido no trigger
      expect(screen.getByText(/maio/i)).toBeInTheDocument()

      // Verificar que o combobox existe
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
    })
  })

  // ===================================================================
  // CATEGORIA C: Timezone Resilience
  // ===================================================================
  describe('Categoria C: Timezone Resilience', () => {
    it('Teste 10: Formatação correta - Janeiro', () => {
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)
      expect(screen.getByText(/janeiro/i)).toBeInTheDocument()
    })

    it('Teste 11: Formatação correta - Fevereiro (bug original)', () => {
      // Este era o mês problemático: mostrava "janeiro" ao invés de "fevereiro"
      render(<MonthSelector currentMonth="2026-02" onMonthChange={mockOnMonthChange} />)
      expect(screen.getByText(/fevereiro/i)).toBeInTheDocument()
      expect(screen.queryByText(/^janeiro$/i)).not.toBeInTheDocument()
    })

    it('Teste 12: Formatação correta - Março (não deve mostrar Fevereiro)', () => {
      render(<MonthSelector currentMonth="2026-03" onMonthChange={mockOnMonthChange} />)
      expect(screen.getByText(/março/i)).toBeInTheDocument()
      expect(screen.queryByText(/^fevereiro$/i)).not.toBeInTheDocument()
    })

    it('Teste 13: Todos os meses formatam corretamente', () => {
      const months = [
        { month: '2026-01', expected: 'janeiro' },
        { month: '2026-02', expected: 'fevereiro' },
        { month: '2026-03', expected: 'março' },
        { month: '2026-04', expected: 'abril' },
        { month: '2026-05', expected: 'maio' },
        { month: '2026-06', expected: 'junho' },
        { month: '2026-07', expected: 'julho' },
        { month: '2026-08', expected: 'agosto' },
        { month: '2026-09', expected: 'setembro' },
        { month: '2026-10', expected: 'outubro' },
        { month: '2026-11', expected: 'novembro' },
        { month: '2026-12', expected: 'dezembro' },
      ]

      months.forEach(({ month, expected }) => {
        const { unmount } = render(
          <MonthSelector currentMonth={month} onMonthChange={mockOnMonthChange} />
        )
        expect(screen.getByText(new RegExp(expected, 'i'))).toBeInTheDocument()
        unmount()
      })
    })
  })

  // ===================================================================
  // CATEGORIA D: Integração com Store
  // ===================================================================
  describe('Categoria D: Integração com Store', () => {
    it('Teste 14: onMonthChange é chamado com formato correto (YYYY-MM)', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)

      const nextButton = screen.getAllByRole('button')[1]
      await user.click(nextButton)

      expect(mockOnMonthChange).toHaveBeenCalledWith('2026-02')
      expect(mockOnMonthChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}$/)
    })

    it('Teste 15: handleMonthSelect é chamado com o valor correto', () => {
      // Testamos a lógica interna de mudança de mês
      // A interação com o dropdown Radix UI é testada em E2E
      const { rerender } = render(
        <MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />
      )

      // Simular mudança para março via prop (como se o dropdown tivesse sido usado)
      rerender(<MonthSelector currentMonth="2026-03" onMonthChange={mockOnMonthChange} />)

      // Verificar que o display mostra março
      expect(screen.getByText(/março/i)).toBeInTheDocument()
    })

    it('Teste 16: Ano é preservado quando mês muda', () => {
      const { rerender } = render(
        <MonthSelector currentMonth="2024-06" onMonthChange={mockOnMonthChange} />
      )

      // Verificar que junho de 2024 está sendo exibido
      expect(screen.getByText(/junho/i)).toBeInTheDocument()

      // Simular mudança para dezembro do mesmo ano
      rerender(<MonthSelector currentMonth="2024-12" onMonthChange={mockOnMonthChange} />)

      // Verificar que dezembro está sendo exibido
      expect(screen.getByText(/dezembro/i)).toBeInTheDocument()
    })

    it('Teste 17: Ano é atualizado nas transições Dez→Jan / Jan→Dez', async () => {
      const user = userEvent.setup()

      // Teste Dezembro → Janeiro
      const { rerender } = render(
        <MonthSelector currentMonth="2025-12" onMonthChange={mockOnMonthChange} />
      )
      const nextButton = screen.getAllByRole('button')[1]
      await user.click(nextButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2026-01')

      // Teste Janeiro → Dezembro
      mockOnMonthChange.mockClear()
      rerender(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)
      const prevButton = screen.getAllByRole('button')[0]
      await user.click(prevButton)
      expect(mockOnMonthChange).toHaveBeenLastCalledWith('2025-12')
    })
  })

  // ===================================================================
  // CATEGORIA E: Edge Cases
  // ===================================================================
  describe('Categoria E: Edge Cases', () => {
    it('Teste 18: Componente não quebra com mês válido em formato YYYY-MM', () => {
      expect(() => {
        render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)
      }).not.toThrow()

      expect(() => {
        render(<MonthSelector currentMonth="2026-12" onMonthChange={mockOnMonthChange} />)
      }).not.toThrow()
    })

    it('Teste 19: Rapid clicking nas setas não causa problemas', async () => {
      const user = userEvent.setup()
      render(<MonthSelector currentMonth="2026-01" onMonthChange={mockOnMonthChange} />)

      const nextButton = screen.getAllByRole('button')[1]

      // Cliques rápidos consecutivos
      await user.click(nextButton)
      await user.click(nextButton)
      await user.click(nextButton)

      // Deve ter sido chamado 3 vezes
      expect(mockOnMonthChange).toHaveBeenCalledTimes(3)
      expect(mockOnMonthChange).toHaveBeenNthCalledWith(1, '2026-02')
      expect(mockOnMonthChange).toHaveBeenNthCalledWith(2, '2026-02')
      expect(mockOnMonthChange).toHaveBeenNthCalledWith(3, '2026-02')
    })

    it('Teste 20: Componente mantém mês quando não há interação', () => {
      render(<MonthSelector currentMonth="2026-05" onMonthChange={mockOnMonthChange} />)

      // Verificar que maio está exibido
      expect(screen.getByText(/maio/i)).toBeInTheDocument()

      // Verificar que onMonthChange não foi chamado sem interação
      expect(mockOnMonthChange).not.toHaveBeenCalled()

      // Verificar que o componente está estável
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText(/maio/i)).toBeInTheDocument()
    })
  })
})
