# 03 — Domain Model

The canonical data model for the new app, and how old data maps onto it.

Read this before writing any type, store, or persistence code.

---

## Principles

1. **The domain model owes nothing to any backend.** No `workspaceGroup`, no
   `monthlyDataId`, no `cloudId`. Sync concerns belong to the sync layer when it exists
   (ADR-003).
2. **Money is integer cents** (ADR-005). Never a float, never a formatted string.
3. **Make illegal states unrepresentable.** Branded types for `MonthKey`, `IsoDate`, and
   `Cents` cost nothing at runtime and eliminate a whole class of bug the old app has
   (`getMonthDiff` silently returns `NaN` for a malformed key).
4. **Store facts, derive views.** Recurrence is a rule, not 25 copies of a row. Installment
   occurrences are computed, not stored.

---

## Primitive types

```ts
/** Integer cents. 1 BRL = 100. Never fractional. */
export type Cents = number & { readonly __brand: 'Cents' }

/** Calendar month, always `YYYY-MM`. Lexicographic order == chronological order. */
export type MonthKey = string & { readonly __brand: 'MonthKey' }

/** Calendar date, always `YYYY-MM-DD`. No time, no timezone. */
export type IsoDate = string & { readonly __brand: 'IsoDate' }

/** Instant, ISO 8601 with timezone. Used only for audit fields. */
export type Timestamp = string & { readonly __brand: 'Timestamp' }

export type Uuid = string & { readonly __brand: 'Uuid' }
```

Each gets a parser and a guard in `domain/`. Parsing happens **at the boundary** — form
input, URL params, imported JSON — never in the middle of a calculation.

> **Why `MonthKey` is branded.** The old `getMonthDiff` (`lib/expense-store.ts:484-490`)
> splits on `-` and calls `Number()`. Given `"banana"` it produces `NaN`, and
> `differenceInMonths` then returns `NaN`, and the installment silently never appears in any
> month. No error, no log. A branded type with a parser at the boundary makes that
> unreachable.

---

## Entities

### Category

```ts
export type Category = {
  id: CategoryId // kebab-case; for defaults this IS the i18n key
  customLabel?: string // present only for user-created categories
  color: HexColor
  icon: string | null // Lucide icon name
  isSystem: boolean // true only for 'other'
  order: number // contiguous from 0
}
```

**The dual-label rule (F-05) is load-bearing.** Default categories have no `customLabel`;
their `id` resolves through `t('categories.' + id)` and therefore translates. Custom
categories carry a `customLabel` and are never translated. Resolution is always:

```ts
const label = category.customLabel ?? t(`categories.${category.id}`)
```

Do not flatten this into one stored string — it would freeze default categories into
whatever language they were created in.

**System category:** exactly one, `id: 'other'`, `isSystem: true`. It cannot be renamed or
deleted, and it is the reassignment target when any other category is deleted.

**Defaults** (11): `groceries`, `transportation`, `health`, `leisure`, `food`, `education`,
`housing`, `subscriptions`, `credit-card`, `installment`, `other`.

> Note that `installment` is a _category_ and installments are also a _feature_. The
> category exists so projected installment occurrences land somewhere in the breakdown.
> This is the ID that pitfall **P-10** gets wrong.

### CreditCard

```ts
export type CreditCard = {
  id: CardId
  name: string
  color: HexColor
  limit: Cents | null // null = no limit; 0 is a distinct, valid state
  order: number
}
```

### Income

```ts
export type Income = {
  id: Uuid
  month: MonthKey
  description: string
  amount: Cents
  recurrenceId?: Uuid // set when this row came from a recurrence rule
}
```

### Expense

```ts
export type Expense = {
  id: Uuid
  month: MonthKey
  description: string
  amount: Cents
  categoryId: CategoryId
  kind: 'fixed' | 'variable'
  date: IsoDate
  recurrenceId?: Uuid
}
```

**Renamed from the old model:** `type` → `kind` (`type` is a TypeScript keyword and reads
badly in generics), `category` → `categoryId` (it is a reference, and the old name invited
the bug where a whole category object was expected).

**Dropped:** `installmentId`. In the old model this only ever appeared on _synthetic_
expenses fabricated at read time by `mapInstallmentsToExpenses` — it was never persisted on
a real expense. Keeping it on the stored type advertised a relationship that does not exist.
Projected occurrences carry their own type (below).

### Recurrence — the central modelling change

The old app materialises recurrence: creating one recurring income writes **25 rows**
(current month + 24). Consequences: a fixed 2-year horizon that silently ends
(**P-07**), 25 records to update on every edit, and in cloud mode 25 queued mutations per
action (**P-04**).

Store the rule instead:

```ts
export type Recurrence = {
  id: Uuid
  kind: 'income' | 'expense'
  startMonth: MonthKey
  endMonth: MonthKey | null // null = open-ended
  template: {
    description: string
    amount: Cents
    categoryId?: CategoryId // expenses only
  }
}
```

A month's rows are `storedRows(month) ++ expandRecurrences(rules, month)`.

**Edits become rule surgery, and the old semantics fall out for free:**

| User action                           | Operation                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Edit from month _M_ onward            | Set `endMonth = M-1` on the existing rule; create a new rule from _M_ with the new template |
| Delete from month _M_ onward          | Set `endMonth = M-1`; if `M <= startMonth`, delete the rule                                 |
| Make an existing single row recurring | Delete the row; create a rule starting at its month                                         |
| Override one month only               | Store an explicit row for that month plus a `skip` on the rule (see below)                  |

**Exceptions.** Users will eventually edit a single month of a recurring series. Model it
now rather than retrofitting:

```ts
exceptions: Record<MonthKey, { skip: true } | { override: Partial<Template> }>
```

Do not build the exception _UI_ in Phase 1, but reserve the field so it does not become a
schema migration later.

### Installment

```ts
export type Installment = {
  id: Uuid
  name: string
  cardId: CardId // required — never empty (P-11)
  totalInstallments: number // integer, 2..48
  amountPerInstallment: Cents
  startMonth: MonthKey
}
```

Occurrences are **derived**, never stored:

```ts
export type InstallmentOccurrence = {
  installment: Installment
  number: number // 1-based
  month: MonthKey
}

// present in month M when 0 <= monthDiff(startMonth, M) < totalInstallments
```

### SavingsEntry

```ts
export type SavingsEntry = {
  id: Uuid
  month: MonthKey
  amount: Cents
  date: IsoDate
  source?: string // free text
  note?: string
  goalId?: Uuid
  confirmed: boolean // false = forecast, true = actually transferred
}
```

`confirmed` is the axis everything else keys off: goal progress counts only confirmed
entries; unconfirmed ones surface separately as a forecast.

### Goal

```ts
export type Goal = {
  id: Uuid
  name: string
  icon: string
  color: HexColor
  targetAmount: Cents
  deadline?: MonthKey
  status: 'active' | 'completed'
  completedAt?: Timestamp
  createdAt: Timestamp
}
```

### Note

```ts
export type Note = {
  id: Uuid
  text: string
  value?: Cents
  valueDirection?: 'payable' | 'receivable'
  date: IsoDate // the event date
  persistent: boolean
  done: boolean
  createdAt: Timestamp
  createdMonth: MonthKey // origin month
}
```

**Visibility rule** — belongs in `domain/notes.ts`, implemented once:

```
visibleIn(note, M) =
  note.createdMonth === M
  || (note.persistent && !note.done && note.createdMonth < M)
```

> The old model calls this field `noteCreatedAt` in the cloud schema purely to dodge a
> collision with Amplify's own `createdAt` (`amplify/data/resource.ts:190`). With no cloud
> in Phase 1 it is plain `createdAt`.

---

## Store shape

```ts
// stores/ledger-store.ts
{
  incomes:       Record<MonthKey, Income[]>
  expenses:      Record<MonthKey, Expense[]>
  savingsEntries:Record<MonthKey, SavingsEntry[]>
  recurrences:   Recurrence[]
}

// stores/catalog-store.ts
{
  categories:  Category[]
  creditCards: CreditCard[]
}

// stores/planning-store.ts
{
  installments: Installment[]
  goals:        Goal[]
  notes:        Note[]
}
```

**Deliberately absent:**

- `currentMonth` / `currentYear` — navigation state, now URL params (ADR-002).
- `isLoading`, `workspaceId` — cloud concerns (ADR-003).
- The `MonthlyData` wrapper. The old shape nests four arrays under a `month` key _and_
  stores `month` inside the object, so the key and the field can disagree. Flat records keyed
  by month remove that possibility.
- Eagerly created empty months. `getMonthData` returns `incomes: [], expenses: []` for any
  month with no data; nothing is written until the user enters something (**P-06**).

---

## Invariants

Enforce these in `domain/`, and assert them in tests:

1. Every `MonthKey` matches `^\d{4}-(0[1-9]|1[0-2])$`.
2. Every `amount` is a non-negative integer. Money is never fractional, never negative.
   _(Sign is carried by the entity type — an expense is an outflow by definition.)_
3. Every `Expense.categoryId` resolves to an existing category, or is rendered as `other`.
   Deleting a category rewrites its expenses to `other`; it never deletes them.
4. Exactly one category has `isSystem: true`, and its id is `other`.
5. `category.order` and `creditCard.order` are contiguous from 0 after any mutation.
6. Every `Installment.cardId` resolves to an existing card. Deleting a card requires
   reassignment.
7. `2 <= totalInstallments <= 48`, integer.
8. A `Recurrence` with `endMonth !== null` satisfies `endMonth >= startMonth`.
9. `SavingsEntry.goalId`, when present, resolves to an existing goal. Deleting a goal clears
   the field; it never deletes the entry.
10. `Goal.completedAt` is present **iff** `status === 'completed'`.

---

## Persistence

**IndexedDB**, via the Zustand `persist` middleware with a custom async storage
(ADR-003). One record per store, versioned:

```ts
{ version: 1, data: { /* store state */ } }
```

The old app stores everything as one localStorage JSON blob under `expense-store`, parsed
and re-serialised on every mutation, capped near 5 MB and synchronous.

### Schema migrations

Port the _mechanism_ from `lib/migrations.ts` — it is sound: a numbered registry, sequential
application, a pre-migration backup, and cleanup keeping the last 3 backups.

Fix two things:

1. **Migrations must be pure.** The old `migrateV1ToV2` mutates its input in place and
   returns the same reference, so a failure halfway through leaves partially migrated data
   in memory. Take input, return new output.
2. **Migrations must be tested.** `lib/migrations.ts` is in the coverage `exclude` list
   (`vitest.config.ts`) — the code that rewrites users' financial data is the least tested
   code in the repo. Every migration needs a fixture-based round-trip test.

The new app starts at `version: 1`. The old app's v1→v2→v3 history does not carry over; it
is collapsed into the import path below.

---

## Importing data from the old app

Users have live data in the old app. Import is a **Phase 1 deliverable** (F-12), not a
nicety — it is the migration path for real people.

Source: the old localStorage key `expense-store`, at schema version 3.

| Old                                       | New                 | Transform                                                       |
| ----------------------------------------- | ------------------- | --------------------------------------------------------------- |
| `state.monthlyData[M].incomes[]`          | `incomes[M]`        | `amount × 100`, round once; `recurringGroupId` → `recurrenceId` |
| `state.monthlyData[M].fixedExpenses[]`    | `expenses[M]`       | `kind: 'fixed'`; `category` → `categoryId`; `amount × 100`      |
| `state.monthlyData[M].variableExpenses[]` | `expenses[M]`       | `kind: 'variable'`; same                                        |
| `state.monthlyData[M].savingsEntries[]`   | `savingsEntries[M]` | `amount × 100`                                                  |
| `state.installments[]`                    | `installments[]`    | `card` → `cardId`; `amountPerInstallment × 100`                 |
| `state.categories[]`                      | `categories[]`      | direct                                                          |
| `state.creditCards[]`                     | `creditCards[]`     | `limit × 100` when not null                                     |
| `state.goals[]`                           | `goals[]`           | `targetAmount × 100`                                            |
| `state.notes[]`                           | `notes[]`           | `value × 100` when present                                      |
| `state.currentMonth`, `currentYear`       | _dropped_           | now URL state                                                   |

**Recurrence reconstruction.** Old data has materialised rows sharing a
`recurringGroupId`. The importer must collapse each group into one `Recurrence`:

```
for each distinct recurringGroupId:
  rows        = all rows with that id, sorted by month
  startMonth  = first row's month
  endMonth    = last row's month
  template    = first row's { description, amount, categoryId }

  if any row's description/amount differs from the template:
      emit those months as explicit exception overrides
  if the months are not contiguous:
      emit the gaps as skip exceptions
```

The old app's edit semantics ("update from this month onward") mean a long-lived series can
legitimately hold several different values across its months. **Do not assume uniformity** —
verify per row and emit exceptions. A test fixture with a mid-series value change is
mandatory.

**Import must be non-destructive:** validate the whole payload, build the new state in
memory, and commit only if every invariant above holds. On failure, report which record
failed and change nothing.

### Cents conversion

Multiply by 100 and round **once**, at import:

```ts
const toCents = (v: number): Cents => Math.round(v * 100) as Cents
```

Old data holds float artefacts (`1234.5600000000001`). Round at the boundary, never again.
