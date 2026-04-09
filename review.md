# Review — PR #15: feat(goals): savings entries & Goals screen

Foco: consistência de UI/comportamento e princípios SRP/OCP.

---

## 1. Sort order invertido entre dois componentes que exibem a mesma lista

**Severidade: crítica**

`SavingsEntriesSection` ordena **ascendente** (mais antigo primeiro):

```typescript
// savings-entries-section.tsx
const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
```

`GoalDetailSheet` ordena **descendente** (mais recente primeiro):

```typescript
// goal-detail-sheet.tsx
const sorted = [...goalEntries].sort((a, b) => b.date.localeCompare(a.date))
```

A mesma lista de entries aparece em ordem inversa dependendo de onde o usuário está. Uma das duas está errada — definir a ordem correta e extrair para uma constante compartilhada.

---

## 2. Duas implementações de progress bar para o mesmo dado

**Severidade: crítica**

`GoalCard` usa o componente shadcn `<Progress>` com CSS custom property:

```tsx
// goal-card.tsx
<Progress
  value={progress}
  className="h-2"
  style={{ '--progress-foreground': goal.color } as React.CSSProperties}
/>
```

`GoalDetailSheet` implementa manualmente com `div`s posicionados:

```tsx
// goal-detail-sheet.tsx
<div className="bg-secondary relative h-3 overflow-hidden rounded-full">
  <div
    className="absolute top-0 left-0 h-full rounded-full transition-all"
    style={{ width: `${Math.min(100, confirmedPercent)}%`, backgroundColor: goal.color }}
  />
  <div
    className="absolute top-0 h-full rounded-full transition-all"
    style={{
      left: `${Math.min(100, confirmedPercent)}%`,
      width: `${pendingPercent}%`,
      backgroundColor: `${goal.color}60`,
    }}
  />
</div>
```

A justificativa para a barra manual no `GoalDetailSheet` é que ela precisa mostrar duas faixas (confirmado + previsão). O problema é que o `GoalCard` nunca mostra o pending — o usuário vê percentual diferente dependendo de onde olha.

O correto é extrair um componente `<GoalProgressBar>` que aceita `confirmedPercent`, `pendingPercent` e `color`, e usá-lo nos dois lugares. `GoalCard` passaria `pendingPercent={0}` ou omite a faixa se não houver previsão.

---

## 3. Naming e assinatura inconsistentes nos callbacks de SavingsEntry

**Severidade: crítica**

`SavingsEntriesSection` define:

```typescript
// savings-entries-section.tsx
interface SavingsEntriesSectionProps {
  onAdd: (entry: Omit<SavingsEntry, 'id'>) => void
  onUpdate: (entry: SavingsEntry) => void
  onRemove: (entryId: string) => void
}
```

`GoalDetailSheet` define:

```typescript
// goal-detail-sheet.tsx
interface GoalDetailSheetProps {
  onAddEntry: (month: string, entry: Omit<SavingsEntry, 'id'>) => void
  onUpdateEntry: (month: string, entry: SavingsEntry) => void
  onRemoveEntry: (month: string, entryId: string) => void
}
```

Mesma operação, nomes e assinaturas completamente diferentes. A diferença de assinatura (com/sem `month`) é um sintoma do ponto 5 (`monthKey`). Padronizar para um único contrato.

---

## 4. `allEntries` com contratos de props inconsistentes

**Severidade: importante**

Em `GoalsView`, `GoalCard` recebe entries já filtradas por `goalId`:

```tsx
// goals-view.tsx
<GoalCard
  allEntries={getSavingsEntriesForGoal(goal.id)} // pré-filtrado
  ...
/>
```

`GoalDetailSheet` recebe todas as entries e filtra internamente:

```tsx
// goals-view.tsx
<GoalDetailSheet
  allEntries={allEntries} // todas as entries de todos os goals
  ...
/>

// goal-detail-sheet.tsx — internamente:
const goalEntries = allEntries.filter((e) => e.goalId === goal.id)
```

Dois componentes filhos do mesmo pai operam sobre o mesmo dado com contratos opostos. Definir se o pai filtra (e passa `goalEntries`) ou os filhos filtram (e recebem `allEntries`) — aplicar uniformemente.

---

## 5. `monthKey` opcional polui o modelo de dados

**Severidade: importante**

`SavingsEntry.monthKey?: string` existe para resolver o problema de "de qual mês remover esta entry" dentro do `GoalDetailSheet`. Resultado: o mesmo fallback aparece em 4 lugares no mesmo arquivo:

```typescript
// goal-detail-sheet.tsx
onRemoveEntry(entry.monthKey ?? currentMonth, entry.id)
onAddEntry(entry.monthKey ?? currentMonth, { ...entry, goalId: goal.id })
onUpdateEntry(editingEntry.monthKey ?? currentMonth, { ... })
currentMonth={editingEntry.monthKey ?? currentMonth}
```

`SavingsEntry` já vive dentro de `monthlyData[month].savingsEntries` — a chave do mês existe na estrutura de armazenamento. Carregar `monthKey` dentro do próprio objeto é redundância estrutural disfarçada de dado, e o `?? currentMonth` é um fallback silencioso que pode apontar para o mês errado.

---

## 6. `GoalDetailSheet` hardcoda `new Date()` como `currentMonth`

**Severidade: importante**

```typescript
// goal-detail-sheet.tsx
const currentMonth = new Date().toISOString().slice(0, 7)
```

`SavingsEntriesSection` recebe `currentMonth` como prop do `MonthlyView`. `GoalDetailSheet` ignora isso e usa a data do sistema. Se o usuário está visualizando janeiro de 2024 no `MonthlyView` e abre o detalhe de uma meta para adicionar uma entry, essa entry vai para abril de 2026 (mês atual), não para o mês que o usuário está visualizando.

O `GoalDetailSheet` precisa receber `currentMonth` como prop quando aberto a partir do `MonthlyView`.

---

## 7. `CURRENT_YEAR` como constante de módulo — bug ao virar o ano

**Severidade: importante**

```typescript
// goal-form-dialog.tsx — avaliado no import, não no render
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => (CURRENT_YEAR + i).toString())
```

Se o app ficar aberto ao virar o ano sem reload, o dropdown vai mostrar a lista de anos errada. Mover para dentro do componente ou usar `useMemo`:

```typescript
const YEARS = useMemo(() => {
  const year = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => (year + i).toString())
}, [])
```

---

## 8. Handlers wrapper sem lógica em `GoalsView` violam SRP

**Severidade: importante**

```typescript
// goals-view.tsx
const handleAddEntry = (month: string, entry: Parameters<typeof addSavingsEntry>[1]) => {
  addSavingsEntry(month, entry) // delegação pura, sem lógica
}
const handleUpdateEntry = (month: string, entry: Parameters<typeof updateSavingsEntry>[1]) => {
  updateSavingsEntry(month, entry) // delegação pura
}
const handleRemoveEntry = (month: string, entryId: string) => {
  removeSavingsEntry(month, entryId) // delegação pura
}
const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => {
  addGoal(goal) // delegação pura
}
```

Quatro funções que existem apenas para repassar chamadas. `addSavingsEntry`, `updateSavingsEntry`, `removeSavingsEntry` e `addGoal` podem ser passados diretamente como props. A exceção é `handleUpdateGoal`, que tem lógica real (atualiza `selectedGoal` após edição) e deve ser mantida.

---

## 9. `SavingsEntriesSection` tem responsabilidade dupla

**Severidade: média**

O componente lista entries **e** gerencia estado de form (add/edit) internamente:

```typescript
// savings-entries-section.tsx
const [addDialogOpen, setAddDialogOpen] = useState(false)
const [editingEntry, setEditingEntry] = useState<SavingsEntry | null>(null)
```

O padrão existente no projeto é diferente: `IncomeList` lista incomes sem nenhum dialog embutido — o dialog vive no `IncomeSection` pai. `SavingsEntriesSection` quebra esse padrão ao encapsular tanto a lista quanto os formulários de criação e edição. O mesmo problema se repete em `GoalDetailSheet`.

O estado de `addDialogOpen` e `editingEntry` deve subir para o componente pai.

---

## Resumo

| #   | Problema                                                               | Severidade |
| --- | ---------------------------------------------------------------------- | ---------- |
| 1   | Sort order invertido entre `SavingsEntriesSection` e `GoalDetailSheet` | Crítica    |
| 2   | Duas implementações de progress bar para o mesmo dado                  | Crítica    |
| 3   | Naming e assinatura inconsistentes nos callbacks de SavingsEntry       | Crítica    |
| 4   | `allEntries` com contratos de props inconsistentes                     | Importante |
| 5   | `monthKey` opcional polui o modelo de dados                            | Importante |
| 6   | `GoalDetailSheet` hardcoda `new Date()` como `currentMonth`            | Importante |
| 7   | `CURRENT_YEAR` como constante de módulo                                | Importante |
| 8   | Handlers wrapper sem lógica em `GoalsView`                             | Importante |
| 9   | `SavingsEntriesSection` com responsabilidade dupla                     | Média      |
