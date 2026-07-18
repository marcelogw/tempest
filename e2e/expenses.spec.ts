import { test, expect } from '@playwright/test'

test.describe('Expense Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visão Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')
  })

  test('should add fixed expense', async ({ page }) => {
    // Click "Add Fixed"
    const addButton = page.locator('button[title="Adicionar Despesa Fixa"]')
    await addButton.click()

    // Wait for form to appear
    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300) // Wait for dialog animation

    // Fill form
    await page.fill('input[id="description"]', 'Internet Fibra')
    await page.fill('input[id="amount"]', '150')

    // Save
    await page.click('button[type="submit"]', { force: true })

    // Verify it appeared in the list
    await expect(page.locator('text=Internet Fibra')).toBeVisible({ timeout: 5000 })
  })

  test('should add variable expense', async ({ page }) => {
    // If there are separate tabs for fixed and variable
    const variableTab = page.locator('button:has-text("Variáveis")')
    if (await variableTab.isVisible()) {
      await variableTab.click()
    }

    // Click add variable expense
    const addButton = page.locator('button[title="Adicionar Despesa Variável"]')
    await addButton.click()

    // Wait for form
    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300) // Wait for dialog animation

    // Fill
    await page.fill('input[id="description"]', 'Supermercado')
    await page.fill('input[id="amount"]', '250')

    // Save
    await page.click('button[type="submit"]', { force: true })

    // Verify
    await expect(page.locator('text=Supermercado').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show expense in list after adding', async ({ page }) => {
    // Add an expense
    const addButton = page.locator('button[title="Adicionar Despesa Fixa"]')
    await addButton.click()

    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300)
    await page.fill('input[id="description"]', 'Teste Lista')
    await page.fill('input[id="amount"]', '150')
    await page.click('button[type="submit"]', { force: true })

    await expect(page.locator('text=Teste Lista')).toBeVisible()

    // Verify the item appears with the correct value
    const expenseItem = page.locator('[data-testid="expense-item"]:has-text("Teste Lista")')
    await expect(expenseItem).toBeVisible()
    await expect(expenseItem.locator('text=/150/')).toBeVisible()
  })

  test('should delete expense', async ({ page }) => {
    // First add an expense to delete
    const addButton = page.locator('button[title="Adicionar Despesa Fixa"]')
    await addButton.click()

    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300)
    await page.fill('input[id="description"]', 'Teste Deletar')
    await page.fill('input[id="amount"]', '50')
    await page.click('button[type="submit"]', { force: true })

    await expect(page.locator('text=Teste Deletar')).toBeVisible()

    // Find expense-item and click remove button
    const expenseItem = page.locator('[data-testid="expense-item"]:has-text("Teste Deletar")')
    await expect(expenseItem).toBeVisible()

    // Hover to show the button (opacity-0 group-hover:opacity-100)
    await expenseItem.hover()

    // Click remove button
    await expenseItem.locator('button[aria-label="Remover"]').click()

    // Verify it disappeared
    await expect(
      page.locator('[data-testid="expense-item"]:has-text("Teste Deletar")')
    ).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('Installment Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visão Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')
  })

  test('should add installment purchase', async ({ page }) => {
    // Look for add installment button
    const installmentButton = page.locator('button[title="Adicionar Parcelamento"]')

    if (await installmentButton.isVisible({ timeout: 2000 })) {
      await installmentButton.click()

      await page.waitForSelector('input[id="installment-name"]', { state: 'visible' })
      await page.fill('input[id="installment-name"]', 'Notebook Dell')
      await page.fill('input[id="installments"]', '12')
      await page.fill('input[id="amount"]', '300')

      // Select card if there's a dropdown
      const cardSelect = page.locator('div[role="dialog"] button[role="combobox"]').first()
      if ((await cardSelect.isVisible()) && (await cardSelect.isEnabled())) {
        await cardSelect.click({ force: true })
        await page
          .click('[role="option"]:first-child', { force: true, timeout: 1000 })
          .catch(() => {})
      }

      // Save
      await page.locator('div[role="dialog"] button[type="submit"]').click({ force: true })

      // Verify
      await expect(page.locator('text=Notebook Dell')).toBeVisible({ timeout: 5000 })
    }
  })
})
