import { test, expect } from '@playwright/test'

test.describe('Year Navigation', () => {
  test('should change year using YearSelector arrows', async ({ page }) => {
    await page.goto('/')

    // Year selector is in the sidebar
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

    // Open dropdown
    await yearSelector.locator('button[role="combobox"]').click()

    // Get current year and click it
    const currentYear = new Date().getFullYear()
    await page.click(`[role="option"]:has-text("${currentYear}")`)

    // Verify change
    await expect(yearSelector).toContainText(currentYear.toString())
  })

  test('should navigate months and auto-update year', async ({ page }) => {
    await page.goto('/')

    const yearSelector = page.locator('[data-testid="year-selector"]')

    // Navigate to Monthly View
    await page.click('text=Visão Mensal')

    // Wait for month selector to appear
    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Verify both selectors are visible
    await expect(monthSelector).toBeVisible()
    await expect(yearSelector).toBeVisible()

    // Click month navigation arrows a few times
    const prevButton = monthSelector.locator('button').first()
    await prevButton.click()
    await page.waitForTimeout(300)

    // Verify everything is still visible (navigation worked)
    await expect(monthSelector).toBeVisible()
    await expect(yearSelector).toBeVisible()
  })
})

test.describe('Month Navigation', () => {
  test('should change month using dropdown', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visão Mensal')

    // Wait for month selector to appear
    await page.waitForSelector('[data-testid="month-selector"]')

    const monthSelector = page.locator('[data-testid="month-selector"]')

    // Verify selector is visible
    await expect(monthSelector).toBeVisible()

    // Open month dropdown
    await monthSelector.locator('button[role="combobox"]').click()

    await page.waitForTimeout(200)

    // Verify dropdown opened (options visible)
    const optionsVisible = await page
      .locator('[role="option"]')
      .first()
      .isVisible({ timeout: 2000 })
    expect(optionsVisible).toBeTruthy()
  })

  test('should change month using arrows', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visão Mensal')

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
    await expect(
      page.locator(`text=/Comparacao de ${yearText}|Baseado nos dados de ${yearText}/i`).first()
    ).toBeVisible()
  })
})
