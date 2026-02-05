# Notas sobre o Schema do Amplify

## Diferenças do Modelo Zustand

### MonthlyData - Expenses

**Zustand (localStorage):**

```typescript
{
  fixedExpenses: Expense[]
  variableExpenses: Expense[]
}
```

**Amplify (GraphQL):**

```typescript
{
  expenses: Expense[] // Único array, filtrar por type
}
```

**Razão:** O GraphQL do Amplify não permite múltiplos relacionamentos `hasMany` apontando para o mesmo `belongsTo`. Isso causava erro:

```
Found multiple relationship associations with MonthlyData.fixedExpenses,
MonthlyData.variableExpenses for Expense.monthlyData
```

## Como Filtrar Expenses por Tipo

### Listar todas as despesas de um mês:

```typescript
const { data: allExpenses } = await client.models.Expense.list({
  filter: { monthlyDataId: { eq: monthId } },
})
```

### Listar apenas despesas fixas:

```typescript
const { data: fixedExpenses } = await client.models.Expense.list({
  filter: {
    monthlyDataId: { eq: monthId },
    type: { eq: 'fixed' },
  },
})
```

### Listar apenas despesas variáveis:

```typescript
const { data: variableExpenses } = await client.models.Expense.list({
  filter: {
    monthlyDataId: { eq: monthId },
    type: { eq: 'variable' },
  },
})
```

### Filtrar no cliente (após fetch):

```typescript
const { data: allExpenses } = await client.models.Expense.list({
  filter: { monthlyDataId: { eq: monthId } },
})

const fixedExpenses = allExpenses.filter((e) => e.type === 'fixed')
const variableExpenses = allExpenses.filter((e) => e.type === 'variable')
```

## Hook Customizado (Recomendado)

Criar um hook que abstrai a diferença:

```typescript
// lib/use-monthly-data.ts
import { useAmplifyData } from './use-amplify-data'

export function useMonthlyData(monthId: string) {
  const client = useAmplifyData()

  async function getMonthData() {
    // Fetch all expenses for the month
    const { data: expenses } = await client.models.Expense.list({
      filter: { monthlyDataId: { eq: monthId } },
    })

    // Fetch incomes
    const { data: incomes } = await client.models.Income.list({
      filter: { monthlyDataId: { eq: monthId } },
    })

    // Get the monthly data record
    const { data: monthlyData } = await client.models.MonthlyData.get({
      id: monthId,
    })

    // Separate expenses by type (matching Zustand structure)
    return {
      month: monthlyData?.month,
      investments: monthlyData?.investments || 0,
      savings: monthlyData?.savings || 0,
      incomes: incomes || [],
      fixedExpenses: expenses?.filter((e) => e.type === 'fixed') || [],
      variableExpenses: expenses?.filter((e) => e.type === 'variable') || [],
    }
  }

  return { getMonthData }
}
```

## Performance

### Estratégia 1: Filtro no Servidor (Recomendado)

```typescript
// Duas queries separadas
const fixedExpenses = await client.models.Expense.list({
  filter: { monthlyDataId: { eq: monthId }, type: { eq: 'fixed' } },
})
const variableExpenses = await client.models.Expense.list({
  filter: { monthlyDataId: { eq: monthId }, type: { eq: 'variable' } },
})
```

**Pros:** Menos dados transferidos
**Cons:** Duas chamadas de rede

### Estratégia 2: Filtro no Cliente

```typescript
// Uma query, filtro local
const allExpenses = await client.models.Expense.list({
  filter: { monthlyDataId: { eq: monthId } },
})
const fixedExpenses = allExpenses.filter((e) => e.type === 'fixed')
const variableExpenses = allExpenses.filter((e) => e.type === 'variable')
```

**Pros:** Uma chamada de rede
**Cons:** Transfere mais dados

**Recomendação:** Use filtro no servidor se tiver muitas despesas (>50), caso contrário cliente é mais rápido.

## Índices e Performance

O Amplify cria automaticamente índices para:

- ✅ `monthlyDataId` (chave estrangeira)
- ✅ `owner` (autorização)

Para melhor performance com filtros por `type`, considere criar índice secundário:

```typescript
// Em amplify/data/resource.ts (futuro)
Expense: a.model({
  // ... campos existentes
}).secondaryIndexes((index) => [index('monthlyDataId').sortKeys(['type'])])
```

## Migração de Dados Zustand → Amplify

Ao migrar, mapear arrays separados para array único:

```typescript
async function migrateMonthData(zustandMonth: MonthlyData) {
  const client = useAmplifyData()

  // Create MonthlyData record
  const { data: monthlyData } = await client.models.MonthlyData.create({
    month: zustandMonth.month,
    investments: zustandMonth.investments,
    savings: zustandMonth.savings,
  })

  // Migrate fixed expenses
  for (const expense of zustandMonth.fixedExpenses) {
    await client.models.Expense.create({
      ...expense,
      type: 'fixed', // Garantir tipo
      monthlyDataId: monthlyData.id,
    })
  }

  // Migrate variable expenses
  for (const expense of zustandMonth.variableExpenses) {
    await client.models.Expense.create({
      ...expense,
      type: 'variable', // Garantir tipo
      monthlyDataId: monthlyData.id,
    })
  }
}
```

## Validação de Tipo

Sempre garantir que o campo `type` está definido ao criar despesas:

```typescript
// ✅ Correto
await client.models.Expense.create({
  description: 'Aluguel',
  amount: 2500,
  categoryId: 'moradia',
  type: 'fixed', // Explícito
  date: '2026-02-01',
  monthlyDataId: monthId,
})

// ❌ Incorreto - type pode ser undefined
await client.models.Expense.create({
  description: 'Aluguel',
  amount: 2500,
  categoryId: 'moradia',
  // type: missing!
  date: '2026-02-01',
  monthlyDataId: monthId,
})
```

## Resumo

| Aspecto        | Zustand                 | Amplify                |
| -------------- | ----------------------- | ---------------------- |
| Estrutura      | Arrays separados        | Array único com filtro |
| Query          | Acesso direto           | Filtrar por `type`     |
| Performance    | Instantâneo             | Network latency        |
| Complexidade   | Mais simples            | Requer filtros         |
| Escalabilidade | Limitado a localStorage | Ilimitado (cloud)      |

**Conclusão:** A mudança é mínima no uso prático. Use filtros GraphQL ou crie hooks que abstraem a diferença.
