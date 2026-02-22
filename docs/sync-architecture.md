# Sync Architecture

Documenta as decisões de design da sincronização entre a store local (Zustand/localStorage) e o backend AWS Amplify.

---

## Fases

| Fase | Status       | Descrição                                            |
| ---- | ------------ | ---------------------------------------------------- |
| 1.0  | ✅ Completo  | Upload local → nuvem (inicial)                       |
| 1.1  | ✅ Completo  | Download nuvem → local + resolução de conflito       |
| 2    | ⏳ Planejado | Sync contínuo bidirecional via Amplify subscriptions |

---

## Os 4 cenários de sync

Detectados em `SyncManager.detectSyncScenario()` ao conectar uma conta.

```
Tem dados locais?
├── Sim
│   ├── Tem dados na nuvem? → Sim → "both"     → dialog de conflito
│   └── Tem dados na nuvem? → Não → "local-only" → upload automático
└── Não
    ├── Tem dados na nuvem? → Sim → "cloud-only" → download automático
    └── Tem dados na nuvem? → Não → "empty"      → apenas marca conectado
```

"Ter dados locais" significa: cartões de crédito, parcelamentos, ou qualquer mês com receitas/despesas/investimentos/poupança. Categorias padrão sozinhas **não** contam.

---

## Contrato de IDs: por que as FKs armazenam kebab-case

O Amplify gera um UUID para cada registro (`Category.id`, `CreditCard.id`, etc.). O schema também define campos de ID local (`categoryId`, `cardId`) para rastrear a origem.

Na teoria, `Expense.categoryId` deveria referenciar o UUID de `Category`. Na prática, **o código de upload armazena o ID local kebab-case diretamente**:

```typescript
// sync-manager.ts — uploadSingleExpense()
categoryId: expense.category, // 'groceries', não o UUID da Category
```

Isso foi uma decisão deliberada para simplificar queries por categoria sem precisar de lookups de UUID. A consequência é que **o relacionamento `Expense → Category` no Amplify não funciona via query de relação** — apenas via filter direto no campo.

O mesmo vale para `Installment.cardId`, que armazena o ID local do cartão.

O `idMappings` no `sync-store` registra a correspondência `localId → cloudUUID` e é usado para operações futuras (Phase 2).

---

## Ordem de operações

### Upload (local → nuvem)

Respeita dependências de FK em duas fases paralelas:

```
Fase 1 (paralelo):  Categories  CreditCards  MonthlyData
Fase 2 (paralelo):  Incomes     Expenses     Installments
```

Fase 2 depende dos IDs gerados na Fase 1 (ex: `Income.monthlyDataId` precisa do UUID do `MonthlyData`).

### Delete (limpeza da nuvem)

Ordem inversa para evitar registros órfãos:

```
Expenses → Incomes → Installments → MonthlyData → CreditCards → Categories
```

---

## Limitação conhecida: `installmentId` entre dispositivos

`Expense.installmentId` armazena o ID local curto do parcelamento no dispositivo de origem (ex: `'a3f8k2z'`). Esse ID **não é salvo na nuvem** — o `Installment` só tem um UUID gerado pelo Amplify.

Ao fazer download num novo dispositivo:

- Os `Installment`s são recriados com novos IDs locais
- As `Expense`s vêm com `installmentId` apontando para IDs que não existem mais
- Por isso, `downloadCloudData()` zera o campo: `installmentId: undefined`

**Impacto prático:** no dispositivo que baixou os dados, as despesas de parcelamento existem e os planos de parcelamento existem, mas o vínculo entre eles é perdido. Exibição e totais não são afetados; apenas operações que dependem do link (ex: "deletar parcelamento e suas despesas") não funcionam corretamente nesses registros.

**Correção futura (Phase 2):** adicionar campo `installmentLocalId: string` ao schema do `Installment` e persistir o ID local durante o upload.

---

## Paginação

Toda chamada `.list()` do Amplify retorna no máximo ~100 itens. O helper `fetchAllPages()` percorre automaticamente todas as páginas:

```typescript
private async fetchAllPages<T>(
  fetcher: (nextToken?: string) => Promise<{ data: T[] | null; nextToken?: string | null }>
): Promise<T[]>

// Uso:
this.fetchAllPages((t) => this.client.models.Category.list(t ? { nextToken: t } : {}))
```

Qualquer nova query de leitura em massa deve passar por este helper.

---

## Resolução de conflito

Estratégia **last-write-wins pelo lado escolhido pelo usuário** — sem merge granular.

| Escolha             | Ação                                       |
| ------------------- | ------------------------------------------ |
| Usar dados locais   | `clearCloudData()` → `uploadInitialData()` |
| Usar dados da nuvem | `downloadCloudData()`                      |

O dialog é exibido em `sync-card.tsx` e disparado pelo `settings-view.tsx` após `initializeSync()` retornar `'both'`.
