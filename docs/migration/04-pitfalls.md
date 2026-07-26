# 04 — Pitfalls

Defects and traps found in the current Tempest codebase, each with the evidence that proves
it and the behaviour required in the new app.

**These are not suggestions.** Before a feature is marked done, its linked pitfalls must be
verified as _not reproduced_ — ideally by a test that would fail if they were.

Ordered by severity. 🔴 = wrong numbers or lost data reach the user. 🟠 = a user is blocked
or misled. 🟡 = structural, no direct user impact today.

| ID            | Severity | One line                                                                                       |
| ------------- | -------- | ---------------------------------------------------------------------------------------------- |
| [P-13](#p-13) | 🔴       | Date-only strings parse as UTC — dashboard months and previous-month comparison are off by one |
| [P-21](#p-21) | 🔴       | Month-over-month expense change compares unlike quantities                                     |
| [P-10](#p-10) | 🔴       | Installments are filed under a category ID that no longer exists                               |
| [P-05](#p-05) | 🟠       | English users cannot delete their data                                                         |
| [P-22](#p-22) | 🟠       | Delete-all dialog promises more than the code deletes                                          |
| [P-01](#p-01) | 🔴       | Goals and savings entries have no persistence path beyond the browser                          |
| [P-02](#p-02) | 🔴       | Bulk deletions never propagate to the cloud                                                    |
| [P-03](#p-03) | 🔴       | The write queue loses mutations under concurrency                                              |
| [P-11](#p-11) | 🟠       | Installments can be created against a card that does not exist                                 |
| [P-15](#p-15) | 🟠       | Card usage compares a lifetime total against a monthly limit                                   |
| [P-16](#p-16) | 🟠       | Card delete dialog contradicts the code                                                        |
| [P-08](#p-08) | 🟠       | An entire screen is hardcoded Portuguese; 36 amounts ignore locale                             |
| [P-09](#p-09) | 🟠       | A render-time `.sort()` mutates store state                                                    |
| [P-04](#p-04) | 🟡       | One user action fans out into 25 records / 26 queued mutations                                 |
| [P-07](#p-07) | 🟡       | Recurrence silently stops after 24 months                                                      |
| [P-06](#p-06) | 🟡       | Navigating a year writes 12 empty months to storage                                            |
| [P-12](#p-12) | 🟡       | Category names can normalise to an empty ID                                                    |
| [P-14](#p-14) | 🟡       | Two different ID generators for one concept                                                    |
| [P-17](#p-17) | 🟡       | Two parallel APIs for savings entries                                                          |
| [P-18](#p-18) | 🟡       | Goal status `ahead` does not mean ahead                                                        |
| [P-19](#p-19) | 🟡       | Note dates render raw or in the system locale                                                  |
| [P-20](#p-20) | 🟠       | The numbers users make decisions on are untested                                               |
| [P-23](#p-23) | 🟠       | The riskiest logic has its E2E tests skipped                                                   |
| [P-24](#p-24) | 🟠       | Coverage excludes the code most likely to be wrong                                             |

---

<a id="p-13"></a>

## P-13 🔴 · Date-only strings parse as UTC

**Evidence.** `components/expense/dashboard-view.tsx:77-78`:

```ts
const date = new Date(month.month + '-01')
const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' })
```

Per ECMA-262, a **date-only** ISO string is interpreted as **UTC**, while a date-time string
without an offset is interpreted as local. `toLocaleDateString` then renders in local time.
In any negative-offset timezone the rendered month is the **previous** one.

Reproduced in `America/Sao_Paulo` — the app's default market, default locale `pt`:

```
dashboard month label for 2026-07 => jun.
previous month of 2026-07        => 2026-05   (expected 2026-06)
local-constructor date           => jul.
```

Two distinct user-visible failures:

1. **Every month label on every dashboard chart is wrong** — the X axis of the income/expense
   area chart, the fixed-vs-variable bars, and the savings line are all shifted one month.
2. **`components/expense/monthly-view.tsx:98-100`** builds the previous-month key the same
   way, then calls the _local_ getters `getFullYear()`/`getMonth()`. For July it produces
   `2026-05`. The "vs previous month" figure on the Monthly view compares against **two
   months ago**.

The same pattern recurs at `dashboard-view.tsx:387` and `:424` for note dates.

The store's own helpers are **correct** — `getMonthDiff` and `getMonthFromOffset`
(`lib/expense-store.ts:484-498`) use `new Date(year, month - 1, 1)`, the local constructor.
The bug is confined to components that build dates from strings.

**Required.** No component constructs a `Date` from a string. Ever. All month arithmetic goes
through `domain/month.ts`, which parses to numeric parts and uses the local constructor:

```ts
export function monthToDate(m: MonthKey): Date {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo - 1, 1)
}
```

**Test that would have caught it.** Run the suite under a fixed non-UTC timezone —
`TZ='America/Sao_Paulo'` in the Vitest config — and assert that the label for `2026-07` is
July and that `previousMonth('2026-07') === '2026-06'`. Add `TZ` to CI so this can never
regress silently.

---

<a id="p-21"></a>

## P-21 🔴 · Month-over-month change compares unlike quantities

**Evidence.** `components/expense/monthly-view.tsx`:

```ts
// :102-105 — previous month EXCLUDES installments
const prevMonthTotalExpenses = prevMonthData
  ? prevMonthData.fixedExpenses.reduce(...) + prevMonthData.variableExpenses.reduce(...)
  : undefined

// :115-118 — current month INCLUDES installments
const totalExpenses = fixed + variable + installmentsTotal
```

The percentage handed to `SummaryCards` therefore divides an installment-inclusive number by
an installment-exclusive one. Any user with an active installment plan sees an inflated
month-over-month increase. Combined with **P-13**, the baseline is also the wrong month.

**Required.** One function, `domain/totals.ts#monthExpenseTotal(month)`, used for every
month. Comparisons call it twice; they never inline a second formula.

**Test.** A month with installments compared against a previous month with the same
installments must report 0% change.

---

<a id="p-10"></a>

## P-10 🔴 · Installments filed under a non-existent category

**Evidence.** `lib/expense-store.ts:501-505`:

```ts
export const mapInstallmentsToExpenses = (
  installments: ...,
  month: string,
  categoryId: string = 'parcelamento'   // ← Portuguese ID
): Expense[] => ...
```

Both call sites use the default — `dashboard-view.tsx:114` and `monthly-view.tsx:121`.

But `'parcelamento'` was renamed to `'installment'` by the v1→v2 migration
(`lib/migrations.ts:51`), and `DEFAULT_CATEGORIES` defines `id: 'installment'`
(`lib/expense-store.ts:191`). No category with the ID `parcelamento` exists in any
post-migration install.

**Consequence.** Every projected installment falls through the category fallbacks and is
counted as **`other`** — in the dashboard pie chart, in the category-averages grid, and in
the Monthly view's category breakdown. The dedicated `installment` category, which ships with
its own icon and colour, is permanently empty. Users' category analysis is silently wrong.

**Required.** No magic string defaults for IDs. Reference the constant
(`SYSTEM_CATEGORY_ID`-style) and make the parameter required, so a rename cannot leave a
stale literal behind.

**Test.** Assert that a month with an installment produces a breakdown entry under
`installment`, not `other`.

---

<a id="p-05"></a>

## P-05 🟠 · English users cannot delete their data

**Evidence.** `components/expense/settings-view.tsx:102` and `:315`:

```ts
if (confirmationText !== 'DELETAR TUDO') return
...
disabled={confirmationText !== 'DELETAR TUDO'}
```

The instruction shown above the input comes from i18n. In `en.json`:

```json
"typeDeleteAll": "Type DELETE ALL",
"typeDeleteAllPlaceholder": "Type DELETE ALL"
```

An English user follows the instruction exactly, types `DELETE ALL`, and the button stays
disabled with no explanation. The destructive action is unreachable in one of the two
shipped languages.

**Required.** A gate phrase that is compared must come from the same message catalogue as the
instruction that requests it. Better still: do not gate on a typed phrase at all — require an
explicit export first, or a hold-to-confirm. If a typed phrase is kept, the comparison reads
`t('settings.confirmPhrase')` and the test asserts it in **both** locales.

---

<a id="p-22"></a>

## P-22 🟠 · Delete-all dialog promises more than it delivers

**Evidence.** The dialog lists what will be destroyed
(`settings-view.tsx:291-294` → `ui.settings.allMonthsData`, `allInstallmentsData`,
`allCategories`, `allCreditCards`). But `lib/expense-store.ts:1706-1715`:

```ts
deleteAllData: () => {
  set({
    monthlyData: {}, installments: [], notes: [], goals: [],
    currentMonth: getCurrentMonth(),
    currentYear: new Date().getFullYear().toString(),
  })
},
```

`categories` and `creditCards` are **not** reset. A user who "deletes all data" to start
clean keeps every custom category and every credit card.

**Required.** Delete-all resets every store to its initial state, categories back to the 11
defaults and cards to empty. A test asserts the post-condition field by field, so the copy
and the code cannot drift apart again.

---

<a id="p-01"></a>

## P-01 🔴 · Goals and savings entries have no persistence path

**Evidence.** `amplify/data/resource.ts` defines `Workspace`, `UserProfile`, `Invite`,
`Category`, `CreditCard`, `MonthlyData`, `Income`, `Expense`, `Installment`, `Note`.

There is **no `Goal` model and no `SavingsEntry` model.** The store says so plainly at
`lib/expense-store.ts:852-854`:

```ts
// TODO: SavingsEntry and Goal are stored locally only.
// Cloud sync (Amplify) for these types is not yet implemented.
```

and `lib/adapters/types.ts:157-159` reduces the update payload to nothing:

```ts
export type MonthlyDataUpdate = Record<string, never>
```

**Consequence in cloud mode, today:** goals and savings entries live only in one browser's
localStorage. The second workspace member never sees them. Clearing site data destroys them
with no backup. Worse, `loadWorkspace()` (`:1804-1811`) overwrites `monthlyData` wholesale
with cloud data whose `savingsEntries` are always empty — so a cloud refresh **erases local
savings entries**. Two of the app's headline features are quietly the least durable data in
it.

**Required.** In Phase 1 this is moot — everything is local and equally durable. It becomes
binding when sync is designed: **no entity ships to the cloud phase without a defined sync
path.** The sync layer enumerates domain entities exhaustively and fails to compile when one
is unhandled (a `switch` over a discriminated union with no `default`), rather than silently
omitting it.

---

<a id="p-02"></a>

## P-02 🔴 · Bulk deletions never reach the cloud

**Evidence.** Every single-record mutation enqueues its cloud counterpart. The two bulk
deletions do not:

- `deleteYearData` (`lib/expense-store.ts:1672-1704`) — removes months, installments, and
  notes from local state. **No `enqueue` call anywhere in the function.**
- `deleteAllData` (`:1706-1715`) — same.

A related gap: `deleteCreditCard` (`:1522-1554`) reassigns affected installments to another
card in local state, then enqueues **only** the card deletion — never the installment
updates. The cloud keeps pointing them at the deleted card.

**Consequence.** A user deletes a year, then opens the app on another device or refreshes
from the cloud, and the data returns. The deletion appears to have failed.

**Required.** Deletion is a first-class sync operation, not an afterthought. Any state
transition that is not expressible as a queued mutation must not exist. Prefer a sync model
that diffs local against remote (ADR-003) so an operation cannot be forgotten by omission —
which is exactly how these two were lost.

---

<a id="p-03"></a>

## P-03 🔴 · The write queue loses mutations under concurrency

**Evidence.** `lib/write-queue.ts`. The queue is a JSON array in localStorage, accessed
read-modify-write:

```ts
export function enqueue(op) {
  const queue = readQueue()          // read
  queue.push({ ...op, ... })         // modify
  saveQueue(queue)                   // write
}

export async function processQueue() {
  const queue = readQueue()          // snapshot taken here
  const remaining = []
  for (const item of queue) {
    try { await dispatch(item) }     // ← awaits; user keeps interacting
    catch { ... }
  }
  saveQueue(remaining)               // ← overwrites with the STALE snapshot
}
```

Any `enqueue` that happens during those `await`s is written into the array, and then
`saveQueue(remaining)` overwrites it. **The mutation is lost with no error.**

The window is not theoretical: the processor runs on a 30-second interval _and_ on every
`window.focus` (`:165-178`), and each dispatch is a network round trip. A user typing an
expense while a sync runs can lose it.

Two further problems in the same file:

- **Dead letters are invisible.** After 3 retries an item is moved to
  `tempest-dead-letters` (`:70-75`) and nothing ever reads that key. The user is never told.
- **`Workspace:update` touches are unbounded.** Nearly every mutation enqueues an extra
  `{ model: 'Workspace', operation: 'update' }`, so the queue fills with redundant
  activity touches that are never coalesced.

**Required (cloud phase).** Persist the outbox transactionally — IndexedDB with a real
transaction, not read-modify-write over a JSON blob. Process with a single-flight lock.
Coalesce by `(model, id)`. Surface failures in the UI: a queue that can silently drop
financial records is worse than no queue.

---

<a id="p-11"></a>

## P-11 🟠 · Installments against a card that does not exist

**Evidence.** `components/expense/installments.tsx`:

```ts
const [card, setCard] = useState<string>('')     // :38 — starts empty
...
if (!name || !totalInstallments || !amount) return   // :54 — card NOT validated
addInstallment({ name, card, ... })                  // :56
...
setCard('nubank_pri')                                // :66 — legacy ID, no such card
```

Two bugs in one form. The submit guard omits `card`, so a plan can be created with
`card: ''`. And the post-submit reset assigns `'nubank_pri'` — a hardcoded ID from before
credit cards became user-configurable, surviving here and in the unused
`lib/validations.ts:49` card enum. After creating one plan, the form's card selector holds a
value that matches no card, and a second submit persists it.

An installment with an unresolvable card renders with a fallback grey swatch and the literal
label "Card Name" (`installments.tsx:195` falls back to `i('ui.creditCards.cardName')`), and
is invisible to every per-card total.

**Required.** `cardId` is required in the schema and validated before submit. Form state
resets to empty, never to a literal. Invariant 6 in `03` holds at all times.

---

<a id="p-15"></a>

## P-15 🟠 · Card usage compares lifetime spend to a monthly limit

**Evidence.** `lib/expense-store.ts:1591-1611`:

```ts
getCardTotalCommitment: (cardId) =>
  installments
    .filter((i) => i.card === cardId)
    .reduce((sum, i) => sum + i.amountPerInstallment * i.totalInstallments, 0)
// ↑ the FULL value of every plan, across its entire life

getCardUsagePercentage: (cardId) => (getCardTotalCommitment(cardId) / card.limit) * 100
// ↑ divided by a limit documented as "monthly limit in BRL"
```

A single 12 × R$100 plan on a card with a R$1,000 limit reports **120% usage** while
consuming R$100 of that limit per month. The figure is meaningless and alarming.

The store already has the correct primitive next to it — `getCardUsageForMonth(cardId, month)`
sums only the occurrences falling in one month — but the percentage does not use it.

**Required.** Decide which question the UI answers and label it accordingly:

- _"How much of this month's limit is committed?"_ → `usageForMonth(card, month) / limit`
- _"How much do I still owe on this card?"_ → outstanding remainder, shown as an **amount**,
  not as a percentage of a monthly limit

Ship one, name it precisely, and test it against a multi-month plan.

---

<a id="p-16"></a>

## P-16 🟠 · Card delete dialog contradicts the code

**Evidence.** `en.json` → `ui.creditCards.confirmDeleteWarning`:

> "This card has {count} active installment(s). **They will be deleted as well.**"

`lib/expense-store.ts:1538-1540` does the opposite:

```ts
const updatedInstallments = installments.map((inst) =>
  inst.card === id ? { ...inst, card: reassignToCardId! } : inst
)
```

The installments are **reassigned**, and the store throws if no reassignment target is given.
The UI even renders a "Reassign installments to:" selector
(`ui.creditCards.reassignInstallments`) directly beneath the warning that says they will be
deleted.

**Required.** Copy is part of the feature. When behaviour and message disagree, that is a
bug, not a typo. The new app's delete dialog states the reassignment and names the target
card.

---

<a id="p-08"></a>

## P-08 🟠 · Hardcoded strings and locale-blind formatting

**Evidence.**

- `components/expense/dashboard-view.tsx` imports `useTranslations` on line 4 and hardcodes
  **every** visible string in Portuguese: `"Painel"` (:213), `"Media de Despesas Mensais"`
  (:253), `"Renda vs Despesas"` (:445), `"Poupanca e Investimentos"` (:618), `"Pendencias
Financeiras"` (:349), and every chart series name. The `ui.dashboard.*` keys exist,
  translated, in both files — and are entirely unreferenced.
- `components/expense/expense-form.tsx` — the same: `"Adicionar Despesa Fixa"` (:80),
  `"Descricao"` (:88), `"Valor (R$)"` (:98), `"Salvar Despesa"` (:147) — while
  `forms.expense.*` sits unused.
- **All 36** `formatCurrency` / `formatShortCurrency` call sites pass no locale, so the
  default `'pt-BR'`/`'BRL'` applies everywhere. `useLocale()` appears in exactly two files
  (`settings-view.tsx`, `sync-card.tsx`), neither for money.
- `formatShortCurrency` takes a locale parameter named `_locale` and **ignores it**
  (`lib/formatters.ts:42`), hardcoding the symbol and a `.` decimal separator.
- Store errors are Portuguese literals: `'Já existe um cartão com esse nome'` (:1468),
  `'Cartão não encontrado'` (:1504, :1527).
- Stray Portuguese in code comments and JSX: `// Seção: Preferências`
  (`settings-view.tsx:128`), `"Todos os parcelamentos ativos"` (`installments.tsx:251`).

Several accented characters are also simply missing (`"Media"`, `"Mes"`, `"Poupanca"`,
`"Distribuicao"`, `"Variaveis"`), so the Portuguese is wrong _as Portuguese_ too.

**Required.** ADR-006 in full: lint against JSX literals, CI message-parity check,
locale-bound formatters with no default locale parameter, typed domain errors mapped to
messages in the UI.

---

<a id="p-09"></a>

## P-09 🟠 · Render-time `.sort()` mutates store state

**Evidence.** `components/expense/expense-form.tsx:117-118`:

```ts
const categories = useExpenseStore((state) => state.categories)   // :42
...
{categories
  .sort((a, b) => a.order - b.order)   // ← in-place mutation of store state, during render
  .map(...)}
```

`Array.prototype.sort` mutates. This reorders the array held inside the Zustand store as a
side effect of rendering a dropdown, without going through `set()`. Subscribers are not
notified, so other components can hold a differently ordered view of the same array until
something unrelated forces a re-render.

`components/expense/installments.tsx:42` gets it right — `[...creditCards].sort(...)` — which
shows the mistake is inconsistency, not ignorance.

**Required.** Sorting is derived state: a selector or a `useMemo` over a copy. Enable
`eslint-plugin-react-hooks` exhaustively and add a lint rule (or a code-review check) against
bare `.sort()` / `.reverse()` / `.splice()` on values obtained from a store selector.

---

<a id="p-04"></a>

## P-04 🟡 · One action fans out into 25 records and 26 mutations

**Evidence.** `addFixedExpenseWithPropagation` (`lib/expense-store.ts:1099-1173`) writes the
expense to the current month plus `getFutureMonths(month, 24)` — 25 records. Then:

```ts
allCreatedExpenses.forEach(({ expense: e, targetMonth }) => {
  enqueue({
    model: 'Expense',
    operation: 'create',
    data: {
      /* 9 fields */
    },
  })
})
enqueue({ model: 'Workspace', operation: 'update', data: { id: workspaceId } })
```

25 queued network mutations plus a workspace touch, for one user action. `addIncome` with
replication (`:663-744`) does the same. Editing the series re-enqueues all 25.

A user with 10 recurring fixed expenses and 2 recurring incomes materialises ~300 records
covering two years, in a single localStorage JSON blob that is parsed and re-serialised on
every mutation.

**Required.** Rule-based recurrence (`03`). One record per rule; occurrences derived on read.
One user action produces one mutation.

---

<a id="p-07"></a>

## P-07 🟡 · Recurrence silently stops after 24 months

**Evidence.** `getFutureMonths(startMonth, count = 24)` (`lib/expense-store.ts:300-306`),
called with the default from both propagation paths.

A recurring salary added in July 2026 exists through July 2028 and then **vanishes** with no
warning, no UI affordance, and no way to extend it other than re-creating it. The user
discovers it by finding an empty month two years out.

The i18n copy is honest about it (`"this income will be replicated for the next 24 months"`),
which makes it a documented limitation rather than a hidden one — but it is still a rule
expressed as a magic number in a helper's default argument.

**Required.** Open-ended recurrence (`endMonth: null`). Expansion is bounded by the range
being _viewed_, not by the range that was _written_.

---

<a id="p-06"></a>

## P-06 🟡 · Navigating a year writes 12 empty months

**Evidence.** `setCurrentMonth` (`lib/expense-store.ts:561-572`) calls `initializeYear(year)`,
which creates all 12 months (`:624-653`) — and in cloud mode enqueues a `MonthlyData:create`
for each one:

```ts
newMonths.forEach((month) => {
  enqueue({ model: 'MonthlyData', operation: 'create', data: { id: month, workspaceGroup } })
})
```

Merely _looking_ at a year writes 12 empty records locally and 12 mutations to the cloud.
`addIncome`, `addExpense`, and `addSavingsEntry` each call `initializeYear` again as a
precondition. `getAvailableYears` then reads those empty months back and offers the year in
the selector — so browsing to 2031 permanently adds 2031 to the year list.

**Required.** Reading is never a write. `getMonthData(m)` returns empty arrays for an unknown
month without persisting anything; records appear when the user enters data. `availableYears`
derives from months that actually contain data, plus the current year.

---

<a id="p-12"></a>

## P-12 🟡 · Category names can normalise to an empty ID

**Evidence.** `normalizeToKebabCase` (`lib/expense-store.ts:290-297`) strips diacritics,
lowercases, converts whitespace to hyphens, then removes every non-word character. A name
consisting only of emoji or punctuation — `"🎉"`, `"!!!"` — normalises to `''`.

`addCategory` (`:1315-1351`) checks only for duplicates, so a category with `id: ''` is
created. It cannot be matched by `getCategoryById`, and any expense assigned to it falls back
to `other`.

**Required.** Validate the _derived ID_, not just the input: reject empty, reject collisions
with the reserved system ID, reject collisions with default-category IDs (which would shadow
an i18n key). Return a typed error the UI can explain.

---

<a id="p-14"></a>

## P-14 🟡 · Two ID generators for one concept

**Evidence.** The store generates recurring group IDs with
`crypto.randomUUID()` (`lib/expense-store.ts:287`). A component generates them with
`Math.random().toString(36).substring(2, 9)` (`monthly-view.tsx:62`) — 7 base-36 characters,
comfortably collidable, and reachable as a fallback in the edit path.

Sample data uses a third scheme (`:328`), seeded from `Math.sin` for determinism.

**Required.** One `newId()` in `domain/`, `crypto.randomUUID()` everywhere. Test seeding uses
an injected generator, not a parallel implementation.

---

<a id="p-17"></a>

## P-17 🟡 · Two parallel APIs for savings entries

**Evidence.** `lib/expense-store.ts:855-938` exposes both month-scoped operations
(`addSavingsEntry(month, …)`, `updateSavingsEntry(month, …)`, `removeSavingsEntry(month, …)`)
and global-by-ID operations (`updateSavingsEntryById`, `removeSavingsEntryById`) that loop
over every month hunting for the entry.

Both are live: the Monthly view uses the month-scoped ones, the goal detail sheet uses the
by-ID ones. Two code paths, two sets of edge cases, one concept.

**Required.** One API. Since an entry knows its own month, ID-scoped operations are the
better primitive; month-scoped ones become thin conveniences over them, or disappear.

---

<a id="p-18"></a>

## P-18 🟡 · Goal status `ahead` does not mean ahead

**Evidence.** `lib/goal-utils.ts:64-67`:

```ts
if (confirmed >= goal.targetAmount) return 'ahead'
if (monthlyNeeded <= goal.targetAmount / totalMonths) return 'on-track'
if (confirmed >= expectedByNow * 0.9) return 'on-track'
return 'behind'
```

`ahead` fires only when the target is already met — it means "reached, not yet marked
complete". A goal genuinely ahead of its deadline schedule (60% saved with 80% of the time
remaining) returns `on-track`. The status a user would most want to see does not exist.

The `0.9` tolerance on the next line is also an unexplained magic number.

**Required.** Either rename the state to `reached`, or implement `ahead` as a real schedule
comparison. Name the tolerance as a documented constant. Cover all five states with tests
using `vi.setSystemTime()`.

---

<a id="p-19"></a>

## P-19 🟡 · Note dates render raw or in the system locale

**Evidence.** `components/expense/notes-section.tsx`:

```tsx
{
  note.date
} // :185 → "2026-07-14" verbatim
{
  new Date(note.createdAt).toLocaleDateString()
} // :189 → SYSTEM locale, not the app's
{
  note.createdMonth
} // :195 → "2026-07" verbatim
```

Three date renderings, three different wrong answers: an ISO string shown to the user, a date
formatted in the browser's locale rather than the app's, and a raw month key.

**Required.** All dates render through the locale-bound formatter from `useFormatters()`
(ADR-006). No `toLocaleDateString()` call sites outside `domain`/formatters.

---

<a id="p-20"></a>

## P-20 🟠 · The numbers users make decisions on are untested

**Evidence.** `__tests__/` contains 28 files. There is **no test for the dashboard**. Every
aggregation in `dashboard-view.tsx` — average monthly expenses, month-over-month change,
savings rate, total saved, category averages, the pie's top-6 selection, the payable /
receivable totals — is computed in `useMemo` blocks inside a 717-line component and is
verified by nothing.

That is precisely where **P-13**, **P-21**, and **P-10** live: three wrong-number bugs, all in
untested aggregation code.

**Required.** Aggregations move to pure functions in `domain/`, and each ships with tests
covering the empty case, the single-month case, the installment case, and the
timezone-sensitive case. A number rendered to the user that is not covered by a unit test does
not ship.

---

<a id="p-23"></a>

## P-23 🟠 · The riskiest logic has its E2E tests skipped

**Evidence.** `e2e/income-replication.spec.ts` contains three tests. All three are
`test.skip`:

```ts
test.skip('should add income and replicate to future months', ...)
test.skip('should update income with propagation', ...)
test.skip('should delete income with propagation', ...)
```

Recurring propagation is the most intricate and highest-blast-radius logic in the app — it
writes 25 records and edits ranges of months — and its entire end-to-end suite is disabled.
The file still _looks_ like coverage in a directory listing.

The same suite also hardcodes Portuguese UI text in `beforeEach`
(`page.click('text=Visão Mensal')`), so it is locale-coupled and would fail under `en`.

Additionally, `dashboard.spec.ts` and `navigation.spec.ts` both define a test named
_"should filter dashboard by selected year"_ — duplicated coverage of one behaviour while
goals, notes, savings, categories, and settings have **no** E2E coverage at all.

**Required.** A skipped test is deleted or fixed — never left in place to look like coverage.
CI fails on `.skip` / `.only` in committed specs. Selectors use `data-testid`, never
user-visible text, so tests are locale-independent.

---

<a id="p-24"></a>

## P-24 🟠 · Coverage excludes the code most likely to be wrong

**Evidence.** `vitest.config.ts` enforces a 75% threshold, then excludes from measurement:

```
lib/workspace-client.ts     lib/write-queue.ts       lib/lambda-client.ts
lib/amplify-config.ts       lib/use-amplify-data.ts  lib/migrations.ts
lib/sync-store.ts           lib/hooks/**             lib/adapters/amplify/**
components/workspace/**     components/amplify-provider.tsx
```

This excludes the write queue (**P-03**), the sync client (**P-01**, **P-02**), and the
**data migrations** — the module that rewrites users' financial records in place. The 75%
figure is measured over the safest code in the repo.

`CLAUDE.md` already concedes the deeper flaw: _"The threshold only counts files that are
imported by at least one test — new files with zero tests are invisible to it."_

**Required.** Exclude only generated code and `components/ui/`. If a module is too hard to
test, that is a design signal, not a reason to hide it from the report. Migrations get
fixture-based round-trip tests before anything else. See `06`.
