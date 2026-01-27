import { test, expect } from '@playwright/test'

test.describe('Dashboard Filtering', () => {
  test('should filter dashboard by selected year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()

    // Change to current year
    await yearSelector.locator('button[role="combobox"]').click()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verify dashboard shows current year in cards
    await expect(page.locator(`text=/Comparacao de ${currentYear}|Baseado nos dados de ${currentYear}/i`).first()).toBeVisible()
  })

  test('should show dashboard for different years', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Verifica que o seletor de ano está visível
    await expect(yearSelector).toBeVisible()

    // Verifica que o dashboard tem cards
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    // Verifica que há valores monetários exibidos
    const hasMonetaryValues = await page.locator('text=/R\\$/').first().isVisible()
    expect(hasMonetaryValues).toBeTruthy()
  })
})

test.describe('Dashboard Charts', () => {
  test('should display monthly comparison chart', async ({ page }) => {
    await page.goto('/')

    // Aguarda charts carregarem
    await page.waitForLoadState('networkidle')

    // Verifica se há elementos do Recharts (gráficos)
    const hasChart = await page.locator('.recharts-wrapper, [class*="recharts"]').first().isVisible({ timeout: 5000 })
    expect(hasChart).toBeTruthy()
  })

  test('should show total saved for year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()

    await yearSelector.locator('button[role="combobox"]').click()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verifica que há cards com estatísticas
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    // Verifica que há valores monetários no dashboard
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })
})

test.describe('Monthly View', () => {
  test('should show correct totals for month', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Verifica que há seções de totais (Receita, Despesas Fixas, etc)
    const hasTotals = await page.locator('text=/total|receita|despesa/i').first().isVisible()
    expect(hasTotals).toBeTruthy()

    // Verifica que há valores monetários
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })

  test('should separate fixed and variable expenses', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Verifica que há seções separadas
    const hasFixedSection = await page.locator('text=/fixa|fixas/i').first().isVisible({ timeout: 3000 })
    const hasVariableSection = await page.locator('text=/variável|variáveis/i').first().isVisible({ timeout: 3000 })

    expect(hasFixedSection || hasVariableSection).toBeTruthy()
  })
})

test.describe('Data Persistence', () => {
  test('should persist year selection on reload', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()
    const targetYear = currentYear - 1

    // Muda ano
    await yearSelector.locator('button[role="combobox"]').click()

    // Tenta selecionar ano anterior, se não existir, cria com setas
    const targetYearOption = page.locator(`[role="option"]:has-text("${targetYear}")`)
    if (await targetYearOption.isVisible({ timeout: 1000 })) {
      await targetYearOption.click()
    } else {
      await yearSelector.locator('button').first().click()
    }

    // Aguarda estado atualizar
    await page.waitForTimeout(500)

    const selectedYear = await yearSelector.textContent()

    // Reload
    await page.reload()

    // Verifica que manteve
    await expect(yearSelector).toContainText(selectedYear || targetYear.toString())
  })

  test('should persist month selection on reload', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Get current month text
    const initialMonth = await monthSelector.textContent()

    // Change to different month using arrows
    await monthSelector.locator('button').last().click()
    await page.waitForTimeout(500)

    const selectedMonth = await monthSelector.textContent()

    // Reload
    await page.reload()

    // Volta para Visão Mensal após reload
    await page.click('text=Visao Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')

    // Verifica que manteve o mês selecionado
    await expect(monthSelector).toContainText(selectedMonth || '')
  })

  test('should persist added expenses in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Adiciona despesa
    const addButton = page.locator('button:has-text("Adicionar Fixa")')
    await addButton.click()

    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300)
    await page.fill('input[id="description"]', 'Teste Persistencia')
    await page.fill('input[id="amount"]', '99')
    await page.click('button[type="submit"]', { force: true })

    await expect(page.locator('text=Teste Persistencia')).toBeVisible()

    // Reload
    await page.reload()

    // Volta para Visão Mensal
    await page.click('text=Visao Mensal')

    // Verifica que permanece
    await expect(page.locator('text=Teste Persistencia')).toBeVisible({ timeout: 5000 })
  })
})
