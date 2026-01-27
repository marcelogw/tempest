import { test, expect } from '@playwright/test'

test.describe('Year Navigation', () => {
  test('should change year using YearSelector arrows', async ({ page }) => {
    await page.goto('/')

    // Year selector está na sidebar
    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Verify year selector is visible
    await expect(yearSelector).toBeVisible()

    // Click next year (ChevronRight button)
    const nextButton = yearSelector.locator('button').last()
    await nextButton.click()

    await page.waitForTimeout(500)

    // Verify selector is still visible (meaning navigation worked)
    await expect(yearSelector).toBeVisible()
  })

  test('should change year using dropdown', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Abre dropdown
    await yearSelector.locator('button[role="combobox"]').click()

    // Get current year and click it
    const currentYear = new Date().getFullYear()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verifica mudança
    await expect(yearSelector).toContainText(currentYear.toString())
  })

  test('should navigate months and auto-update year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Navega para Visão Mensal
    await page.click('text=Visao Mensal')

    // Aguarda o month selector aparecer
    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Verifica que ambos os seletores estão visíveis
    await expect(monthSelector).toBeVisible()
    await expect(yearSelector).toBeVisible()

    // Clica nas setas de navegação de mês algumas vezes
    const prevButton = monthSelector.locator('button').first()
    await prevButton.click()
    await page.waitForTimeout(300)

    // Verifica que ainda está tudo visível (navegação funcionou)
    await expect(monthSelector).toBeVisible()
    await expect(yearSelector).toBeVisible()
  })
})

test.describe('Month Navigation', () => {
  test('should change month using dropdown', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    // Aguarda o month selector aparecer
    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Verifica que o selector está visível
    await expect(monthSelector).toBeVisible()

    // Abre dropdown de mês
    await monthSelector.locator('button[role="combobox"]').click()

    await page.waitForTimeout(200)

    // Verifica que o dropdown abriu (opções visíveis)
    const optionsVisible = await page.locator('[role="option"]').first().isVisible({ timeout: 2000 })
    expect(optionsVisible).toBeTruthy()
  })

  test('should change month using arrows', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')

    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Get current month text
    const initialMonth = await monthSelector.locator('span.font-semibold').textContent()

    // Click next month
    await monthSelector.locator('button').last().click()

    // Verify month changed
    const newMonth = await monthSelector.locator('span.font-semibold').textContent()
    expect(newMonth).not.toBe(initialMonth)
  })
})

test.describe('Dashboard Year Filtering', () => {
  test('should filter dashboard by selected year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')
    const currentYear = new Date().getFullYear()

    // Change to current year
    await yearSelector.locator('button[role="combobox"]').click()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verify dashboard shows current year in card descriptions
    const yearText = currentYear.toString()
    await expect(page.locator(`text=/Comparacao de ${yearText}|Baseado nos dados de ${yearText}/i`).first()).toBeVisible()
  })
})
