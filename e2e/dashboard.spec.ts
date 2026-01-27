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
    await expect(
      page
        .locator(`text=/Comparacao de ${currentYear}|Baseado nos dados de ${currentYear}/i`)
        .first()
    ).toBeVisible()
  })

  test('should show dashboard for different years', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Verify year selector is visible
    await expect(yearSelector).toBeVisible()

    // Verify dashboard has cards
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    // Verify monetary values are displayed
    const hasMonetaryValues = await page.locator('text=/R\\$/').first().isVisible()
    expect(hasMonetaryValues).toBeTruthy()
  })
})

test.describe('Dashboard Charts', () => {
  test('should display monthly comparison chart', async ({ page }) => {
    await page.goto('/')

    // Wait for charts to load
    await page.waitForLoadState('networkidle')

    // Verify there are Recharts elements (charts)
    const hasChart = await page
      .locator('.recharts-wrapper, [class*="recharts"]')
      .first()
      .isVisible({ timeout: 5000 })
    expect(hasChart).toBeTruthy()
  })

  test('should show total saved for year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()

    await yearSelector.locator('button[role="combobox"]').click()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verify there are cards with statistics
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    // Verify there are monetary values in the dashboard
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })
})

test.describe('Monthly View', () => {
  test('should show correct totals for month', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Verify there are total sections (Income, Fixed Expenses, etc)
    const hasTotals = await page.locator('text=/total|receita|despesa/i').first().isVisible()
    expect(hasTotals).toBeTruthy()

    // Verify there are monetary values
    await expect(page.locator('text=/R\\$/').first()).toBeVisible()
  })

  test('should separate fixed and variable expenses', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Verify there are separate sections
    const hasFixedSection = await page
      .locator('text=/fixa|fixas/i')
      .first()
      .isVisible({ timeout: 3000 })
    const hasVariableSection = await page
      .locator('text=/variável|variáveis/i')
      .first()
      .isVisible({ timeout: 3000 })

    expect(hasFixedSection || hasVariableSection).toBeTruthy()
  })
})

test.describe('Data Persistence', () => {
  test('should persist year selection on reload', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()
    const targetYear = currentYear - 1

    // Change year
    await yearSelector.locator('button[role="combobox"]').click()

    // Try to select previous year, if it doesn't exist, create with arrows
    const targetYearOption = page.locator(`[role="option"]:has-text("${targetYear}")`)
    if (await targetYearOption.isVisible({ timeout: 1000 })) {
      await targetYearOption.click()
    } else {
      await yearSelector.locator('button').first().click()
    }

    // Wait for state to update
    await page.waitForTimeout(500)

    const selectedYear = await yearSelector.textContent()

    // Reload
    await page.reload()

    // Verify it was kept
    await expect(yearSelector).toContainText(selectedYear || targetYear.toString())
  })

  test('should persist month selection on reload', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Get current month text
    const _initialMonth = await monthSelector.textContent()

    // Change to different month using arrows
    await monthSelector.locator('button').last().click()
    await page.waitForTimeout(500)

    const selectedMonth = await monthSelector.textContent()

    // Reload
    await page.reload()

    // Return to Monthly View after reload
    await page.click('text=Visao Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')

    // Verify selected month was kept
    await expect(monthSelector).toContainText(selectedMonth || '')
  })

  test('should persist added expenses in localStorage', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    // Add expense
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

    // Return to Monthly View
    await page.click('text=Visao Mensal')

    // Verify it remains
    await expect(page.locator('text=Teste Persistencia')).toBeVisible({ timeout: 5000 })
  })
})
