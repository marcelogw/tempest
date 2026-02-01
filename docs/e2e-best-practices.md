# Diretrizes e Boas Práticas para Testes E2E (Playwright)

Este documento reúne aprendizados e diretrizes para garantir a estabilidade e confiabilidade dos testes End-to-End (E2E) no projeto Tempest.

## 1. Seletores e Escopo

### O Problema da Ambiguidade

Evite seletores globais genéricos como `page.getByText('Valor')` quando o mesmo texto pode aparecer em múltiplos lugares (ex: na lista, em um resumo, em um histórico). Isso causa "flakiness" (intermitência) ou falhas falsas.

### A Solução: Scoping (Escopo)

Sempre restrinja a busca ao container específico do elemento que você quer testar.

**Ruim:**

```typescript
await expect(page.getByText('R$ 5.000,00')).toBeVisible() // Pode falhar se houver outro "R$ 5.000,00" na tela
```

**Bom:**

```typescript
// Encontra a linha específica da tabela/lista
const row = page.locator('.group', { hasText: 'Salário Teste' })
// Verifica apenas DENTRO dessa linha
await expect(row.getByText('R$ 5.000,00')).toBeVisible()
```

## 2. Navegação e Estado Inicial

### Client-Side Routing

Em SPAs (Single Page Applications) como Next.js, a navegação inicial muitas vezes cai na Home. Garanta que o teste navegue explicitamente para a view desejada antes de qualquer asserção.

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.click('text=Visao Mensal') // Navegação explícita
  await expect(page.locator('h1')).toHaveText('Visao Mensal') // Confirmação visual
})
```

## 3. Interações de UI e Animações

### Waits Explícitos para Sobreposições

Quando interagir com Modais, Dialogs ou Dropdowns, aguarde explicitamente que eles fechem ou abram antes de prosseguir. O Playwright tenta ser inteligente, mas animações de fade-out podem bloquear cliques subsequentes.

**Dica:**

```typescript
await page.getByRole('button', { name: 'Salvar' }).click()
// Garante que o dialog sumiu antes de tentar clicar em outra coisa
await expect(page.getByRole('dialog')).toBeHidden()
```

### Data-TestId

Para elementos de navegação complexos (como seletores de data customizados), adicione `data-testid` no componente código-fonte para facilitar a seleção robusta nos testes.

**No Código (.tsx):**

```tsx
<div data-testid="month-selector">...</div>
```

**No Teste (.spec.ts):**

```typescript
await page.locator('[data-testid="month-selector"] button').click()
```

## 4. Debugging

Se um teste estiver falhando ou "travando" inexplicavelmente:

1. **Console Logs:** Adicione `console.log` passos chave. Quando rodar com `--reporter=line`, você verá onde o teste parou.
2. **Reporter List/Line:** Use `npx playwright test ... --reporter=line` para ver a saída em tempo real no terminal, evitando timeouts silenciosos do reporter HTML padrão.
