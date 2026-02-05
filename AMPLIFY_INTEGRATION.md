# Guia de Integração Amplify + Zustand

## 🎯 Situação Atual

**Você está vendo:** Badge amarelo "localStorage (Zustand)" no canto inferior direito

**O que isso significa:**

- ✅ Amplify está configurado e rodando (sandbox ativo)
- ✅ Backend AWS está funcionando (DynamoDB, Cognito, AppSync)
- ❌ A aplicação **não está usando** o Amplify ainda
- ✅ Tudo continua funcionando com Zustand (localStorage)

**Por quê?**
O Amplify foi configurado, mas não integrado. A aplicação continua usando o `useExpenseStore` (Zustand) que salva dados no localStorage do navegador.

## 🚀 Opções de Integração

### Opção 1: Continuar com localStorage (Atual)

**Quando usar:** Quer manter simplicidade, app funciona offline, sem sincronização

**Prós:**

- ✅ Instantâneo (sem latência de rede)
- ✅ Funciona offline
- ✅ Sem custos AWS
- ✅ Sem necessidade de login

**Contras:**

- ❌ Dados apenas no navegador
- ❌ Perda de dados ao limpar cache
- ❌ Não sincroniza entre dispositivos
- ❌ Sem backup automático

**Ação:** Nenhuma - continue usando como está

---

### Opção 2: Forçar Autenticação (Auth-First)

**Quando usar:** Quer proteger dados financeiros, ter multi-usuário, sincronização

**Implementação:**

```typescript
// app/page.tsx
import { AuthGuard } from '@/components/auth/auth-guard'

export default function ExpenseManagementApp() {
  return (
    <AuthGuard>
      <div className="bg-background flex h-screen">
        {/* ... resto da aplicação */}
      </div>
    </AuthGuard>
  )
}
```

**O que acontece:**

1. Usuário acessa a aplicação
2. Vê tela de login/signup
3. Após login, acessa a aplicação
4. Dados continuam no localStorage (ainda não no Amplify)

**Próximo passo:** Criar adapter para sincronizar dados

---

### Opção 3: Sincronização Automática (Recomendado)

**Quando usar:** Quer backup automático, sincronização entre dispositivos, mas manter performance

**Arquitetura:**

```
Componentes → useExpenseStore (Zustand) → Sync Adapter → Amplify (AWS)
                     ↓                            ↓
              localStorage                   DynamoDB
```

**Implementação:**

Criar `lib/amplify-sync-adapter.ts`:

```typescript
import { useEffect } from 'react'
import { useExpenseStore } from './expense-store'
import { useAmplifyData } from './use-amplify-data'
import { getCurrentUser } from 'aws-amplify/auth'

export function useAmplifySync() {
  const client = useAmplifyData()
  const { monthlyData, categories, creditCards, installments } = useExpenseStore()

  // Sync on mount and when data changes
  useEffect(() => {
    async function sync() {
      try {
        await getCurrentUser() // Check if authenticated

        // Upload local changes to AWS
        await syncToCloud()

        // Download cloud changes to local
        await syncFromCloud()
      } catch {
        // Not authenticated, skip sync
      }
    }

    sync()
  }, [monthlyData, categories, creditCards, installments])

  async function syncToCloud() {
    // TODO: Implement upload logic
  }

  async function syncFromCloud() {
    // TODO: Implement download logic
  }

  return { syncToCloud, syncFromCloud }
}
```

Usar no layout:

```typescript
// app/layout.tsx
import { useAmplifySync } from '@/lib/amplify-sync-adapter'

export default function RootLayout({ children }) {
  useAmplifySync() // Auto-sync when authenticated

  return <html>...</html>
}
```

**Prós:**

- ✅ Performance local (Zustand)
- ✅ Backup automático (AWS)
- ✅ Sincronização entre dispositivos
- ✅ Funciona offline (localStorage)

**Contras:**

- ⚠️ Complexidade de sincronização
- ⚠️ Resolução de conflitos necessária

---

### Opção 4: Amplify Only (Substitução Completa)

**Quando usar:** Quer aproveitar 100% do GraphQL, subscriptions, queries otimizadas

**Implementação:**

Criar novo store baseado em Amplify:

```typescript
// lib/amplify-expense-store.ts
import { create } from 'zustand'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const client = generateClient<Schema>()

interface AmplifyExpenseStore {
  currentMonth: string
  monthlyData: Record<string, MonthlyData>

  fetchMonthData: (month: string) => Promise<void>
  addExpense: (expense: ExpenseInput) => Promise<void>
  // ... outros métodos
}

export const useAmplifyExpenseStore = create<AmplifyExpenseStore>((set, get) => ({
  currentMonth: getCurrentMonth(),
  monthlyData: {},

  fetchMonthData: async (month) => {
    const { data } = await client.models.MonthlyData.list({
      filter: { month: { eq: month } },
    })

    // Store in Zustand for caching
    set((state) => ({
      monthlyData: {
        ...state.monthlyData,
        [month]: data[0],
      },
    }))
  },

  addExpense: async (expense) => {
    await client.models.Expense.create(expense)
    // Refresh local cache
    await get().fetchMonthData(expense.monthlyDataId)
  },
}))
```

Substituir em todos os componentes:

```typescript
// Antes
import { useExpenseStore } from '@/lib/expense-store'

// Depois
import { useAmplifyExpenseStore } from '@/lib/amplify-expense-store'
```

**Prós:**

- ✅ GraphQL subscriptions (real-time)
- ✅ Queries otimizadas
- ✅ Relações automáticas
- ✅ Backend gerenciado

**Contras:**

- ❌ Latência de rede
- ❌ Não funciona offline (sem service worker)
- ❌ Refatoração massiva necessária

---

## 🎨 Opção 5: Modo Híbrido com Feature Flag

**Quando usar:** Quer testar Amplify gradualmente sem quebrar o existente

**Implementação:**

```typescript
// lib/use-expense-data.ts (Adapter Pattern)
import { useExpenseStore } from './expense-store'
import { useAmplifyExpenseStore } from './amplify-expense-store'

const USE_AMPLIFY = process.env.NEXT_PUBLIC_USE_AMPLIFY === 'true'

export function useExpenseData() {
  if (USE_AMPLIFY) {
    return useAmplifyExpenseStore()
  }
  return useExpenseStore()
}
```

Usar em componentes:

```typescript
import { useExpenseData } from '@/lib/use-expense-data'

function MyComponent() {
  const { monthlyData, addExpense } = useExpenseData()
  // ... funciona com ambos os stores
}
```

Alternar via `.env.local`:

```bash
# Use localStorage
NEXT_PUBLIC_USE_AMPLIFY=false

# Use Amplify
NEXT_PUBLIC_USE_AMPLIFY=true
```

**Prós:**

- ✅ Teste gradual
- ✅ Rollback fácil
- ✅ Comparação A/B

**Contras:**

- ⚠️ Manter dois stores
- ⚠️ Interfaces devem ser compatíveis

---

## 🛠️ Implementação Prática

### Início Rápido: Adicionar Autenticação

1. **Proteger a aplicação:**

```typescript
// app/page.tsx
import { AuthGuard } from '@/components/auth/auth-guard'

export default function ExpenseManagementApp() {
  return (
    <AuthGuard bypass={false}> {/* Remover bypass */}
      {/* ... app */}
    </AuthGuard>
  )
}
```

2. **Testar:**

- Acesse http://localhost:3000
- Veja tela de login
- Crie uma conta
- Confirme email
- Veja badge mudar para "AWS Cloud"

3. **Dados ainda em localStorage:**

- Mesmo autenticado, dados continuam no Zustand
- Próximo passo: implementar sync adapter

### Exemplo Completo: Sincronizar Categorias

```typescript
// lib/sync/categories-sync.ts
import { useAmplifyData } from '@/lib/use-amplify-data'
import { useExpenseStore } from '@/lib/expense-store'
import { getCurrentUser } from 'aws-amplify/auth'

export async function syncCategoriesToCloud() {
  try {
    await getCurrentUser() // Verify auth

    const client = useAmplifyData()
    const { categories } = useExpenseStore.getState()

    // Upload each category
    for (const category of categories) {
      await client.models.Category.create({
        categoryId: category.id,
        label: category.label,
        color: category.color,
        icon: category.icon || null,
        isSystem: category.isSystem,
        order: category.order,
      })
    }

    console.log('✅ Categorias sincronizadas com AWS')
  } catch (error) {
    console.error('❌ Erro ao sincronizar:', error)
  }
}

export async function syncCategoriesFromCloud() {
  try {
    await getCurrentUser()

    const client = useAmplifyData()
    const { data: cloudCategories } = await client.models.Category.list()

    if (cloudCategories && cloudCategories.length > 0) {
      // Update local store with cloud data
      useExpenseStore.setState({
        categories: cloudCategories.map((c) => ({
          id: c.categoryId,
          label: c.label,
          color: c.color,
          icon: c.icon,
          isSystem: c.isSystem,
          order: c.order,
        })),
      })

      console.log('✅ Categorias baixadas da AWS')
    }
  } catch (error) {
    console.error('❌ Erro ao baixar:', error)
  }
}
```

Usar em um botão:

```typescript
import { syncCategoriesToCloud } from '@/lib/sync/categories-sync'

<Button onClick={syncCategoriesToCloud}>
  Sincronizar com Cloud
</Button>
```

---

## 📊 Tabela Comparativa

| Feature      | localStorage | Amplify   | Híbrido   |
| ------------ | ------------ | --------- | --------- |
| Performance  | ⚡⚡⚡       | ⚡        | ⚡⚡      |
| Offline      | ✅           | ❌        | ✅        |
| Multi-device | ❌           | ✅        | ✅        |
| Backup       | ❌           | ✅        | ✅        |
| Custo        | Grátis       | Free Tier | Free Tier |
| Complexidade | Baixa        | Alta      | Média     |
| Autenticação | ❌           | ✅        | ✅        |

---

## 🎯 Recomendação

**Para o Tempest, recomendo:**

1. **Curto prazo:** Opção 2 (Auth-First)
   - Adiciona autenticação
   - Dados continuam locais
   - Preparação para sync

2. **Médio prazo:** Opção 3 (Sync)
   - Implementar sync adapter
   - Melhor dos dois mundos
   - Backup automático

3. **Longo prazo:** Avaliar Opção 4
   - Se precisar real-time
   - Se precisar queries complexas
   - Se precisar colaboração

---

## 🚦 Próximos Passos

Escolha uma opção acima e me avise. Posso implementar:

- [ ] Adicionar AuthGuard à aplicação
- [ ] Criar sync adapter completo
- [ ] Implementar Amplify-only store
- [ ] Configurar feature flag híbrida
- [ ] Criar scripts de migração de dados

**Qual opção você prefere?**
