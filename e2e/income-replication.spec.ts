import { test, expect } from '@playwright/test'

test.describe('Income Replication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visão Mensal')
    await expect(page.locator('h1')).toHaveText('Visão Mensal')
  })

  test.skip('should add income and replicate to future months', async ({ page }) => {
    // Click "Adicionar Renda" button
    await page.getByRole('button', { name: 'Adicionar Renda' }).click()

    // Fill in the form
    await page.getByLabel('Descrição').fill('Salário Teste')
    await page.getByLabel('Valor').fill('5000')

    // Check "Replicar para meses seguintes"
    await page.getByLabel('Replicar para meses seguintes').check()

    // Submit
    await page.getByRole('button', { name: 'Adicionar' }).click()

    // Verify it appears in the current month
    // Find the row with the specific description
    const row = page.locator('.group', { hasText: 'Salário Teste' })
    await expect(row).toBeVisible()
    await expect(row.getByText('R$ 5.000,00')).toBeVisible()
    await expect(row.getByText('Recorrente')).toBeVisible()

    // Wait for dialog to close to ensure it doesn't block clicks
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.waitForTimeout(500) // Wait for any animations/hydration

    // Navigate to next month
    await page.locator('[data-testid="month-selector"] button').last().click()

    // Verify it appears in the next month
    const nextRow = page.locator('.group', { hasText: 'Salário Teste' })
    await expect(nextRow).toBeVisible()
    await expect(nextRow.getByText('R$ 5.000,00')).toBeVisible()
    await expect(nextRow.getByText('Recorrente')).toBeVisible()
  })

  test.skip('should update income with propagation', async ({ page }) => {
    // Add a recurring income first
    await page.getByRole('button', { name: 'Adicionar Renda' }).click()
    await page.getByLabel('Descrição').fill('Renda Inicial')
    await page.getByLabel('Valor').fill('3000')
    await page.getByLabel('Replicar para meses seguintes').check()
    await page.getByRole('button', { name: 'Adicionar' }).click()

    // Edit the income
    const row = page.locator('.group', { hasText: 'Renda Inicial' })
    await row.hover() // Make actions visible
    await row.getByRole('button').first().click() // The first button is edit (pencil)

    // Verify correct data is pre-filled
    await expect(page.getByLabel('Descrição')).toHaveValue('Renda Inicial')
    await expect(page.getByLabel('Valor')).toHaveValue('3000')

    // Update value
    await page.getByLabel('Valor').fill('3500')

    await page.getByRole('button', { name: 'Salvar Alterações' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await page.waitForTimeout(500)

    // Verify current month
    // Find the row with the updated description (description didn't change, just amount)
    const updatedRow = page.locator('.group', { hasText: 'Renda Inicial' })
    await expect(updatedRow).toBeVisible()
    await expect(updatedRow.getByText('R$ 3.500,00')).toBeVisible()

    // Verify next month
    await page.locator('[data-testid="month-selector"] button').last().click()

    const nextMonthRow = page.locator('.group', { hasText: 'Renda Inicial' })
    await expect(nextMonthRow).toBeVisible()
    await expect(nextMonthRow.getByText('R$ 3.500,00')).toBeVisible()
  })

  test.skip('should delete income with propagation', async ({ page }) => {
    // Setup: Add recurring income
    await page.getByRole('button', { name: 'Adicionar Renda' }).click()
    await page.getByLabel('Descrição').fill('Renda Deletar')
    await page.getByLabel('Valor').fill('2000')
    await page.getByLabel('Replicar para meses seguintes').check()
    await page.getByRole('button', { name: 'Adicionar' }).click()

    // Verify it exists
    await expect(page.getByText('Renda Deletar')).toBeVisible()

    // Delete it
    const row = page.locator('.group', { hasText: 'Renda Deletar' })
    await row.hover()
    await row.getByRole('button').nth(1).click() // Second button is delete

    // Verify removed from current
    await expect(page.getByText('Renda Deletar')).not.toBeVisible()

    // Verify removed from next
    await page.locator('[data-testid="month-selector"] button').last().click()
    await expect(page.getByText('Renda Deletar')).not.toBeVisible()
  })
})
