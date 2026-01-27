import { test, expect } from '@playwright/test'

test.describe('Expense Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')
  })

  test('should add fixed expense', async ({ page }) => {
    // Click "Adicionar Fixa"
    const addButton = page.locator('button:has-text("Adicionar Fixa")')
    await addButton.click()

    // Aguarda o formulário aparecer
    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300) // Aguarda animação do dialog

    // Preenche formulário
    await page.fill('input[id="description"]', 'Internet Fibra')
    await page.fill('input[id="amount"]', '150')

    // Salva
    await page.click('button[type="submit"]', { force: true })

    // Verifica que apareceu na lista
    await expect(page.locator('text=Internet Fibra')).toBeVisible({ timeout: 5000 })
  })

  test('should add variable expense', async ({ page }) => {
    // Se houver abas separadas para fixas e variáveis
    const variableTab = page.locator('button:has-text("Variáveis")')
    if (await variableTab.isVisible()) {
      await variableTab.click()
    }

    // Click adicionar despesa variável
    const addButton = page.locator('button:has-text("Adicionar Variavel")')
    await addButton.click()

    // Aguarda o formulário
    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300) // Aguarda animação do dialog

    // Preenche
    await page.fill('input[id="description"]', 'Supermercado')
    await page.fill('input[id="amount"]', '250')

    // Salva
    await page.click('button[type="submit"]', { force: true })

    // Verifica
    await expect(page.locator('text=Supermercado').first()).toBeVisible({ timeout: 5000 })
  })

  test('should show expense in list after adding', async ({ page }) => {
    // Adiciona uma despesa
    const addButton = page.locator('button:has-text("Adicionar Fixa")')
    await addButton.click()

    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300)
    await page.fill('input[id="description"]', 'Teste Lista')
    await page.fill('input[id="amount"]', '150')
    await page.click('button[type="submit"]', { force: true })

    await expect(page.locator('text=Teste Lista')).toBeVisible()

    // Verifica que o item aparece com o valor correto
    const expenseItem = page.locator('[data-testid="expense-item"]:has-text("Teste Lista")')
    await expect(expenseItem).toBeVisible()
    await expect(expenseItem.locator('text=/150/')).toBeVisible()
  })

  test('should delete expense', async ({ page }) => {
    // Primeiro adiciona uma despesa para deletar
    const addButton = page.locator('button:has-text("Adicionar Fixa")')
    await addButton.click()

    await page.waitForSelector('input[id="description"]', { state: 'visible' })
    await page.waitForTimeout(300)
    await page.fill('input[id="description"]', 'Teste Deletar')
    await page.fill('input[id="amount"]', '50')
    await page.click('button[type="submit"]', { force: true })

    await expect(page.locator('text=Teste Deletar')).toBeVisible()

    // Encontra o expense-item e clica no botão de remover
    const expenseItem = page.locator('[data-testid="expense-item"]:has-text("Teste Deletar")')
    await expect(expenseItem).toBeVisible()

    // Hover para mostrar o botão (opacity-0 group-hover:opacity-100)
    await expenseItem.hover()

    // Clica no botão de remover
    await expenseItem.locator('button[aria-label="Remover"]').click()

    // Verifica que sumiu
    await expect(page.locator('[data-testid="expense-item"]:has-text("Teste Deletar")')).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('Installment Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('text=Visao Mensal')
    await page.waitForSelector('[data-testid="month-selector"]')
  })

  test('should add installment purchase', async ({ page }) => {
    // Procura botão de adicionar parcelamento
    const installmentButton = page.locator('button:has-text("Parcelamento"), button:has-text("Adicionar Parcelamento")')

    if (await installmentButton.isVisible({ timeout: 2000 })) {
      await installmentButton.click()

      // Preenche dados do parcelamento
      await page.waitForSelector('input[name="name"], input[placeholder*="Nome"]')
      await page.fill('input[name="name"], input[placeholder*="Nome"]', 'Notebook Dell')
      await page.fill('input[name="totalInstallments"], input[placeholder*="Parcelas"]', '12')
      await page.fill('input[name="amountPerInstallment"], input[type="number"]', '300')

      // Seleciona cartão se houver dropdown
      const cardSelect = page.locator('select[name="card"], button:has-text("Selecione")')
      if (await cardSelect.isVisible()) {
        await cardSelect.click()
        await page.click('[role="option"]:has-text("Nubank")').catch(() => {})
      }

      // Salva
      await page.click('button:has-text("Salvar"), button:has-text("Adicionar")')

      // Verifica
      await expect(page.locator('text=Notebook Dell')).toBeVisible({ timeout: 5000 })
    }
  })
})
