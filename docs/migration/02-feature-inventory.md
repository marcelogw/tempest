# 02 — Feature Inventory

The behavioural specification. Each feature lists **what it must do**, the **edge cases**
that are easy to miss, the **old-code reference** (to read, not to copy), and the
**pitfalls** that apply.

Read only the section for the feature you are migrating.

**Legend:** `→ P-xx` links to an entry in [`04-pitfalls.md`](./04-pitfalls.md). Every linked
pitfall must be verified as _not reproduced_ before the feature is considered done.

---

## F-01 · Month & Year Navigation

**Old reference:** `components/expense/month-selector.tsx`, `year-selector.tsx`,
`lib/expense-store.ts:561-602`

### Behaviour

- The user selects a month (`YYYY-MM`) and a year (`YYYY`). The month drives the Monthly
  view; the year filters the Dashboard.
- Month selector: a dropdown of the 12 months plus previous/next arrow buttons. Moving past
  December rolls to January of the next year and updates the selected year with it.
- Year selector: a dropdown plus arrows. The available-years list is every year present in
  the data, **plus the current year always**, sorted descending.
- Changing the year when the selected month is in a different year snaps the month to
  `{year}-01`.

### Required changes

- Selected month and year move to **URL search params** (ADR-002). They are navigation
  state, not persisted domain state.
- Removing them from the store removes the reason `setCurrentMonth` eagerly materialises
  data → **P-06**.

### Edge cases

- Year list must include the current year even when there is no data for it, or a new user
  sees an empty selector.
- Arrow navigation must cross year boundaries in both directions.
- A malformed month in the URL (`/months/2026-13`, `/months/banana`) must be rejected at the
  route boundary and redirect to the current month — not crash a selector.

### Pitfalls

`→ P-06` (month materialisation) · `→ P-13` (date parsing)

---

## F-02 · Income

**Old reference:** `components/expense/income-input.tsx`, `income-list.tsx`,
`lib/expense-store.ts:663-850`

### Behaviour

- An income has a **description** and an **amount**. Nothing else.
- Add, edit, and remove income within a month.
- **Recurring income.** On creation the user may tick "make recurring". If ticked, the
  income is written to the current month **and the following 24 months**, all sharing a
  `recurringGroupId`.
- Editing a recurring income updates **this month and all future months** in the group.
  Past months keep their old values.
- Removing a recurring income removes it from **this month onward**. Past months keep it.
- Editing a non-recurring income into a recurring one removes the original and re-adds it
  with replication.
- A recurring item is visually badged as such in the list.

### Required changes

- Do **not** materialise 25 rows per recurring income. Store the **rule** and expand it for
  the requested month. → **P-04**
- With a rule-based model, "edit from this month onward" becomes: close the current rule at
  the previous month and open a new rule from this month. This is exact, cheap, and unbounded
  — the old app's 24-month horizon silently ends recurrence after two years. → **P-07**

### Edge cases

- Edit-from-month and delete-from-month must not touch history.
- The old implementation compares month keys with `>=` **string** comparison
  (`lib/expense-store.ts:759`, `808`, `1181`, `1212`). This is correct only because
  `YYYY-MM` is lexicographically ordered — keep that property or compare parsed values.
- Toggling recurrence off on an existing recurring income is **not implemented in the old
  app**. Decide the behaviour explicitly and specify it; do not leave it undefined.

### Pitfalls

`→ P-04` (fan-out) · `→ P-07` (24-month horizon) · `→ P-14` (ID generation)

---

## F-03 · Expenses — Fixed and Variable

**Old reference:** `components/expense/expense-form.tsx`, `expense-list.tsx`,
`expense-edit-dialog.tsx`, `lib/expense-store.ts:997-1248`

### Behaviour

- An expense has **description**, **amount**, **category**, **type** (`fixed` | `variable`),
  and **date**.
- Fixed and variable expenses are displayed in two separate lists side by side.
- **Variable** expenses belong to a single month. Plain add / edit / remove.
- **Fixed** expenses propagate: adding one writes it to the current month and the following
  24 months under a shared `recurringGroupId`. Editing or deleting applies from the current
  month forward, exactly like recurring income.
- A fixed expense may also be non-recurring (created before propagation existed, or edited
  into a single-month item); the edit dialog offers "make recurring".
- The form's date is always set to the **first day of the selected month**
  (`currentMonth + '-01'`) — the day is never chosen by the user, despite `date` being a
  full `YYYY-MM-DD` field.

### Required changes

- Same rule-based recurrence as F-02. Fixed-expense propagation and income replication are
  **the same mechanism** and must share one implementation in `domain/recurrence.ts`. The
  old app implements them twice, differently.
- Decide whether `date` keeps day precision. It is currently always `-01` for fixed expenses
  and user-irrelevant for variable ones. Recommended: keep `YYYY-MM-DD` and **let the user
  pick the day for variable expenses** — the field already exists and the data is more
  useful. Specify whichever you choose.
- Every string in the form is hardcoded Portuguese while `forms.expense.*` keys exist unused
  in both message files. → **P-08**
- The amount input uses `step="0.01"`, which `CLAUDE.md` explicitly forbids. With integer
  cents (ADR-005) this becomes a parsing decision, not a stepper decision.

### Edge cases

- `expense-form.tsx:118` calls `.sort()` directly on the array returned from the Zustand
  selector — an in-place mutation of store state during render. → **P-09**
- Deleting a category reassigns its expenses to the system category `other`; it must not
  delete them. See F-05.
- An expense whose `category` no longer exists must render as `other` rather than blank.
  The old app has `validateCategory()` for this (`lib/expense-store.ts:1456`) but the
  Dashboard re-implements the same fallback inline (`dashboard-view.tsx:125-127`).

### Pitfalls

`→ P-04` · `→ P-07` · `→ P-08` (hardcoded strings) · `→ P-09` (selector mutation)

---

## F-04 · Installments (credit-card purchases split over months)

**Old reference:** `components/expense/installments.tsx`,
`lib/expense-store.ts:1250-1305`, `mapInstallmentsToExpenses` at `:501-515`

### Behaviour

- An installment plan has **name**, **credit card**, **total installments** (2–48),
  **amount per installment**, and **start month**.
- Plans are **global**, not per-month. A plan appears in month _M_ when
  `0 <= monthDiff(startMonth, M) < totalInstallments`, displayed as "_name_ _n_/_total_".
- Installments are **not** stored as expenses. They are projected into a month at read time
  and folded into that month's expense total and category breakdown as synthetic expenses.
- The Monthly view shows this month's occurrences plus their summed amount.
- Plans can be created and deleted. **There is no edit.**

### Required changes

- `mapInstallmentsToExpenses` defaults the synthetic category to `'parcelamento'`, a
  Portuguese ID that **no longer exists** after the v1→v2 migration renamed it to
  `'installment'`. Both call sites use the default. → **P-10** (a live, user-visible bug)
- The card `Select` has no required-validation, and the post-submit reset assigns
  `setCard('nubank_pri')` (`installments.tsx:66`) — a hardcoded legacy card ID that no
  longer exists. A plan can be created with an empty card. → **P-11**
- The 2–48 bound exists only as an HTML `min`/`max` attribute. Enforce it in the schema.
- Add edit support, or explicitly decide not to and say so in the UI.

### Edge cases

- Deleting a credit card that has active plans requires reassigning them (see F-06).
- `getInstallmentsForMonth` relies on `differenceInMonths` over dates built as
  `new Date(year, month - 1, 1)`. Keep that construction — building from a string
  (`new Date('2026-07')`) parses as UTC and shifts by a day in negative-offset timezones.
  → **P-13**
- A plan starting in a month the user later deletes via "delete year data" survives only if
  its `startMonth` is outside the deleted year (`lib/expense-store.ts:1684-1687`).

### Pitfalls

`→ P-10` (wrong category ID) · `→ P-11` (phantom card) · `→ P-13` (date parsing)

---

## F-05 · Categories

**Old reference:** `components/expense/categories-view.tsx`, `category-form-dialog.tsx`,
`icon-selector.tsx`, `color-selector.tsx`, `lib/expense-store.ts:1307-1460`

### Behaviour

- 11 default categories ship with the app: groceries, transportation, health, leisure, food,
  education, housing, subscriptions, credit-card, installment, and **other**.
- `other` is the **system category**: it cannot be renamed or deleted (`isSystem: true`).
- Users create custom categories with a **name**, a **colour** from a fixed 20-colour
  palette, and an optional **Lucide icon**.
- Categories are reorderable by drag and drop (`@dnd-kit`); order persists.
- Deleting a category **reassigns its expenses to `other`** — it never deletes expenses.
- Category IDs are derived from the name by kebab-casing with accent stripping
  (`"Alimentação"` → `"alimentacao"`). Duplicate IDs are rejected.

### The label model — read carefully

This trips up every reader. A category's display name comes from **one of two places**:

- **Default categories** have no stored label. Their ID is an **i18n key**: `groceries`
  resolves through `categories.groceries` and therefore translates with the UI language.
- **Custom categories** store a `customLabel` and are **never translated** — the user typed
  it, so it renders verbatim in both languages.

Resolution is always `category.customLabel ?? t('categories.' + category.id)`. Preserve this.
It is the correct design and is easy to accidentally flatten into a single stored string.

### Required changes

- Store errors are thrown as hardcoded Portuguese strings
  (`lib/expense-store.ts:1468`, `1504`, `1527`). Throw typed errors; map to messages in the
  UI. → **P-08**
- `validateCategory()` and the Dashboard's inline fallback do the same job in two places.
  One implementation, in `domain/categories.ts`.

### Edge cases

- Two different names can normalise to the same ID (`"Saúde"` and `"Saude"`). The duplicate
  check catches it, but the error must be understandable.
- A name that normalises to an empty string (e.g. `"🎉"`) produces `id: ''`. **Unhandled in
  the old app** — a category with an empty ID is created. Reject it.
- A custom category whose ID collides with a default one (a user naming something
  "Groceries") would shadow the i18n key. Guard against it.
- Reordering must renumber `order` contiguously from 0.

### Pitfalls

`→ P-08` · `→ P-12` (empty-ID normalisation)

---

## F-06 · Credit Cards

**Old reference:** `components/expense/credit-cards-view.tsx`, `credit-card-form-dialog.tsx`,
`lib/expense-store.ts:1462-1611`

### Behaviour

- A card has **name**, **colour**, and an optional **monthly limit** (`null` = no limit).
- Full CRUD plus drag-and-drop reordering.
- Cards start empty — there are no defaults. The Installments form disables its card
  selector and prompts the user to create a card first when none exist.
- Three derived figures per card:
  - **Usage this month** — sum of installment amounts falling in the current month.
  - **Total commitment** — `amountPerInstallment × totalInstallments` summed across all the
    card's plans, _for the whole life of each plan_.
  - **Usage percentage** — `totalCommitment / limit × 100`, or `null` when there is no limit.
- Deleting a card with active plans **requires** choosing another card to reassign them to;
  the store throws if one is not supplied.

### Required changes

- The percentage compares a **lifetime** commitment against a **monthly** limit
  (`lib/expense-store.ts:1602-1611`). A 12×R$100 plan on a R$1,000-limit card reports 120%
  usage while only consuming R$100/month. This is a definitional bug, not a rounding one.
  → **P-15**
- The delete-confirmation copy says _"They will be deleted as well"_
  (`ui.creditCards.confirmDeleteWarning`) while the code **reassigns** them. The message
  contradicts the behaviour. → **P-16**

### Edge cases

- Reassignment target must exclude the card being deleted.
- Deleting a card must not orphan plans under a non-existent card ID.
- `limit: 0` and `limit: null` are different states — "zero limit" vs "no limit". The form's
  validation message says the limit must be greater than zero **or empty**; keep both
  representable and distinct.

### Pitfalls

`→ P-15` (usage maths) · `→ P-16` (copy contradicts behaviour)

---

## F-07 · Savings Entries ("Reserves & Investments")

**Old reference:** `components/expense/savings-entries-section.tsx`,
`savings-entry-form-dialog.tsx`, `lib/expense-store.ts:855-938`

### Behaviour

- An entry has **amount**, **date**, optional **source** (free text: "Nubank", "Treasury"),
  optional **note**, optional **linked goal**, and a **confirmed** flag meaning
  _"I have actually transferred this"_.
- Entries belong to a month and are listed inside the Income panel of the Monthly view.
- Unconfirmed entries are a **forecast**; confirmed entries are real. Goals count only
  confirmed amounts toward progress and show unconfirmed separately (see F-08).
- The Monthly summary subtracts total reserves from the net balance:
  `net = income − expenses − reserves`.

### Required changes

- The store has two parallel APIs for the same data: month-scoped
  (`addSavingsEntry(month, …)`, `updateSavingsEntry`, `removeSavingsEntry`) and
  global-by-ID (`updateSavingsEntryById`, `removeSavingsEntryById`, which loop over every
  month to find the entry). Keep **one**. → **P-17**
- Savings entries have **no cloud persistence whatsoever** in the old app. This is only
  survivable because Phase 1 is local-only — but it must be designed into the sync model
  from the start when cloud arrives. → **P-01**

### Edge cases

- Deleting a linked goal must clear `goalId` on its entries without deleting them
  (`lib/expense-store.ts:954-968` does this correctly — preserve it).
- The net-balance formula counts reserves as an outflow. This is intentional: money moved to
  savings is not spendable. Keep it and keep the formula visible in the UI
  (`ui.summary.balanceFormula`).

### Pitfalls

`→ P-01` (no persistence path) · `→ P-17` (duplicate API)

---

## F-08 · Goals

**Old reference:** `components/expense/goals-view.tsx`, `goal-card.tsx`,
`goal-form-dialog.tsx`, `goal-detail-sheet.tsx`, `goal-progress-bar.tsx`,
`lib/goal-utils.ts`, `lib/expense-store.ts:940-995`

### Behaviour

- A goal has **name**, **icon**, **colour**, **target amount**, optional **deadline**
  (`YYYY-MM`), and a **status** (`active` | `completed`).
- Savings entries link to goals. Progress counts **confirmed entries only**; unconfirmed
  amounts show as a separate "forecast" figure.
- Derived values (`lib/goal-utils.ts`):
  - `progressPercent` = `min(100, confirmed / target × 100)`
  - `monthlyNeeded` = `remaining / monthsUntilDeadline`, `null` without a deadline or when
    the deadline has passed
  - `status` ∈ `on-track` | `behind` | `ahead` | `overdue` | `completed`
- Goals can be completed manually and reactivated. Completing stamps `completedAt`;
  reactivating strips it.
- Completed goals are listed in a separate section.
- Deleting a goal unlinks its savings entries rather than deleting them.

### Required changes

- `lib/goal-utils.ts` is otherwise clean and pure — it is the **model** for what
  `domain/` should look like. Port it near-verbatim into `domain/goals.ts`, converted to
  integer cents.
- The `ahead` status does not mean what its name says. `getGoalStatus` returns `ahead` only
  when `confirmed >= targetAmount` — i.e. "target already reached but not marked complete".
  A goal genuinely ahead of the schedule implied by its deadline (60% saved with 80% of the
  time left) returns `on-track`. Either rename it to `reached`, or implement it as an
  actual schedule comparison. → **P-18**

### Edge cases

- `targetAmount <= 0` returns 0% rather than dividing by zero — keep the guard.
- A deadline in the current month gives `monthsLeft === 0` → `monthlyNeeded` is `null`, and
  status is `overdue` once `now >= deadlineDate`. Both branches need tests with
  `vi.setSystemTime()`.
- `getGoalStatus` derives "months elapsed" from `goal.createdAt`; a goal created _after_ its
  deadline yields `totalMonths <= 0` and short-circuits to `on-track`. Preserve or fix
  deliberately.
- The deadline `<Input type="month">` must not accept past months (per `CLAUDE.md`).

### Pitfalls

`→ P-01` · `→ P-18` (unreachable status)

---

## F-09 · Notes

**Old reference:** `components/expense/notes-section.tsx`, `note-form-dialog.tsx`,
`lib/expense-store.ts:1613-1669`

### Behaviour

- A note has **text**, optional **value**, optional **direction** (`payable` = I owe /
  `receivable` = owed to me), an **event date**, a **persistent** flag, a **done** flag, a
  creation timestamp, and the **month it originated in**.
- Notes are informational: they never enter income, expense, or balance totals.
- **Persistence rule** — a note appears in month _M_ when:
  `createdMonth === M` **OR** (`persistent` AND NOT `done` AND `createdMonth < M`)
  So a persistent note follows the user forward through months until ticked done.
- Notes carried from a past month are pinned to the top and badged "recurring".
- `done` is toggled inline by a checkbox; done notes render struck through.
- Notes with a value and not done are aggregated on the Dashboard into "payable" and
  "receivable" totals.

### Required changes

- The filtering rule is implemented **twice**: in `getNotesForMonth`
  (`lib/expense-store.ts:1664-1669`) and again in the component
  (`notes-section.tsx:45-47`), which re-partitions what the store already filtered. One
  implementation, in `domain/`.
- Dates render raw: `{note.date}` prints `2026-07-14` verbatim, `note.createdMonth` prints
  `2026-07`, and `new Date(note.createdAt).toLocaleDateString()` uses the **system** locale
  rather than the app's. → **P-19**

### Edge cases

- `note.value !== undefined` gates the direction icon, so a note with `value: 0` shows a
  direction indicator with a zero amount. Decide whether 0 is a valid value.
- A persistent note that is done in a later month still appears in its **origin** month —
  correct, since the first clause matches unconditionally.
- The Dashboard aggregate filters `n.value && n.value > 0`, which is a stricter test than
  the one the notes list uses. Align them.

### Pitfalls

`→ P-19` (raw/system-locale dates)

---

## F-10 · Dashboard

**Old reference:** `components/expense/dashboard-view.tsx` (717 lines),
`category-breakdown.tsx`

### Behaviour

Everything is scoped to the **selected year**.

- **Four stat tiles:** average monthly expenses; month-over-month expense change (%); total
  saved this year; savings rate (`savings / income` of the latest month).
- **Pending financial notes** panel — payable and receivable columns with totals, shown only
  when there is at least one pending valued note.
- **Charts** (recharts):
  - Income vs Expenses — area chart, gradient fills, by month
  - Fixed vs Variable — grouped bar chart, by month
  - Spending distribution — donut chart of the **top 6** categories by average
  - Savings trend — line chart, by month
- **Category averages grid** — every category with data, showing monthly average, sorted
  descending, with the category's icon and colour.
- Installments are included in expense totals and in the category breakdown.
- Empty states: "no data for {year}" when the year has no months.

### Required changes

This screen needs the most work of any in the app.

- **Every visible string is hardcoded Portuguese**, including headings, chart series names,
  and axis content — while `ui.dashboard.*` keys exist, translated, in both message files
  and are entirely unused. → **P-08**
- Month labels come from `date.toLocaleDateString('pt-BR', { month: 'short' })`
  (`dashboard-view.tsx:78`) — hardcoded locale. Use the app locale, or the existing
  `monthsShort.*` keys.
- The `isHydrated` gate (`:51-55`) hides the entire dashboard behind a loading card on first
  render. It exists solely to avoid SSR hydration mismatch and **must not be ported** — the
  SPA has no server render to mismatch against (ADR-001).
- 717 lines in one component. Split: one component per chart, one for the tile row, one for
  the notes panel. Move every `useMemo` aggregation into `domain/` as pure functions with
  their own tests — these are the numbers the user makes decisions on and they are currently
  untested.
- Lazy-load the route: recharts is heavy and only this screen needs it.

### Edge cases

- Insights require **at least two months** of data or the tile row is hidden entirely.
- `savingsRate` divides by income and guards `income > 0`.
- The pie shows the top 6 categories with no "other" bucket, so percentages do not total
  100%. Either add the bucket or label the chart as a top-N view.
- Category averages divide by the number of months **with non-zero spend** in that category,
  not by 12 — an "average" over a different denominator per row. Document this in the UI or
  change it; today it is silently inconsistent.

### Pitfalls

`→ P-08` · `→ P-10` · `→ P-20` (untested aggregations)

---

## F-11 · Monthly View

**Old reference:** `components/expense/monthly-view.tsx`, `summary-cards.tsx`

### Behaviour

The main working screen. Composition:

- Header: title plus the month selector.
- **Summary cards:** total income, total expenses (with % change vs previous month), total
  reserves, and a full-width **net balance** card (`income − expenses − reserves`), coloured
  by sign.
- Left column: Income + Savings panel, Installments panel, Category breakdown.
- Right column: Fixed expenses and Variable expenses lists, side by side.
- Full width below: Notes.

### Required changes

- **The month-over-month comparison compares unlike quantities.** `totalExpenses` for the
  current month _includes_ installments (`monthly-view.tsx:115-118`), while
  `prevMonthTotalExpenses` _excludes_ them (`:102-105`). The percentage shown to the user is
  wrong whenever installments exist in either month. → **P-21**
- `summary-cards.tsx:34` guards with `previousMonthExpenses ?` (truthy), so a previous month
  with exactly `0` expenses is treated as "no previous data" instead of a valid baseline.
- `monthly-view.tsx:62` builds a fallback recurring-group ID with
  `Math.random().toString(36)` while the store uses `crypto.randomUUID()`. Two ID schemes for
  one concept. → **P-14**

### Edge cases

- The view returns `null` while the month is uninitialised (`:49-51`), producing a blank
  frame on first paint. With derived-on-read month data (**P-06**) this guard disappears.
- Previous-month lookup constructs a `Date` and decrements the month — fine, but it belongs
  in `domain/month.ts` alongside every other month calculation.

### Pitfalls

`→ P-06` · `→ P-14` · `→ P-21` (inconsistent comparison)

---

## F-12 · Settings

**Old reference:** `components/expense/settings-view.tsx`, `app/settings/page.tsx`

### Behaviour

- **Language** — switch between `pt` and `en`.
- **Data management:**
  - **Delete a year** — removes all months, installments starting that year, and notes
    created that year. Confirmed via dialog listing what will be removed.
  - **Delete everything** — double-confirmed by typing a phrase, listing what will be lost.
- **Cloud section** — deferred to the cloud phase; absent in Phase 1.

### Required changes

- **The English confirmation is impossible to satisfy.** The gate is
  `confirmationText !== 'DELETAR TUDO'` (`settings-view.tsx:102`, repeated at `:315`) while
  the English instruction says to type `DELETE ALL`. An English-language user can never
  delete their data. → **P-05**
- **The dialog lies about what is deleted.** It lists "All custom categories" and "All credit
  cards", but `deleteAllData()` (`lib/expense-store.ts:1706-1715`) resets only `monthlyData`,
  `installments`, `notes`, and `goals`. Categories and cards survive. → **P-22**
- Language changes call `window.location.reload()` (`:57`). With client-side i18n this is a
  state update.
- Locale is written to **both** a cookie and `localStorage` (`:54-55`) — two sources of truth.
  Keep one.

### Must add

**Export and import.** `ui.settings.exportData` / `importData` / `exportSuccess` /
`importSuccess` keys already exist, translated, in both message files — the feature was
specified and never built. For a local-first app this is not optional: it is the user's only
backup, their migration path off the old app, and the thing that makes "your data is yours"
true. Ship JSON export/import in Phase 1.

### Edge cases

- Deleting the year currently selected must reset the selection to the present month.
- Delete-all must reset **everything** including categories and cards, or the copy must say
  what it actually does. Prefer the former.
- Both destructive actions must be undoable-by-export: prompt an export first, or at minimum
  make export prominent on the same screen.

### Pitfalls

`→ P-05` (untranslated gate) · `→ P-22` (dialog contradicts behaviour)

---

## F-13 · Theme

**Old reference:** `components/theme-provider.tsx`, `theme-toggle.tsx`

### Behaviour

Light / dark / system, persisted, with no flash of wrong theme on load.

### Required changes

- `next-themes` goes with Next.js. Replace with ~30 lines: read `prefers-color-scheme`,
  allow an explicit override in `localStorage`, apply a class to `<html>`, and set it from a
  blocking inline script in `index.html` to prevent the flash.
- The `mounted` gate in `theme-toggle.tsx:11-17` is an SSR workaround and must not be ported.

---

## F-14 · Internationalisation

**Old reference:** `messages/en.json`, `messages/pt.json`, `i18n/`, `proxy.ts`,
`lib/locale-cookie.ts`

### Behaviour

- Two locales: `en` and `pt`. Default `pt`. No URL prefix.
- 502 keys, at near-perfect parity — `ui.auth.connectAccount` and `ui.auth.loginDescription`
  exist only in `pt`.
- Detection order: explicit user choice → `Accept-Language` → default.

### Required changes

- `next-intl` → `use-intl`. **The message files carry over unchanged.**
- Locale detection moves to the client: `localStorage` → `navigator.language` → default.
  `proxy.ts` is deleted.
- Delete keys that are dead by design: `ui.dashboard.totalInvestments` and
  `ui.dashboard.investmentRate` are remnants of the investments feature removed by schema
  migration v2→v3.
- Add the two missing `en` keys.
- Everything in ADR-006 applies: lint rule against literals, CI parity check, locale-bound
  formatters, typed domain errors.

### Edge cases

- Currency and language are **independent**. A user may want English UI with BRL amounts.
  The old `SupportedCurrency` type (`BRL | USD | EUR`) anticipates this but no UI ever sets
  it. Either ship a currency setting or hardcode BRL honestly — do not keep a parameter that
  pretends to be configurable.

---

## F-15 · Cloud Sync, Workspaces, Auth — **DEFERRED**

**Old reference:** `amplify/`, `lib/workspace-client.ts`, `lib/write-queue.ts`,
`lib/sync-store.ts`, `lib/lambda-client.ts`, `lib/adapters/`, `components/workspace/`,
`app/auth/`, `app/onboarding/`, `app/invite/`

**Not in Phase 1.** Per ADR-003 this is designed against a finished local app.

Recorded here so the behaviour is not lost:

- Google OAuth via Cognito; each workspace maps to a Cognito Group `workspace-{uuid}`.
- Maximum 2 members per workspace, enforced in the `acceptInvite` Lambda.
- One-time, expiring invite links.
- Smart sync: compare `Workspace.lastActivityAt` against `lastSyncedAt` on mount and focus;
  re-fetch only when the cloud is newer.
- A localStorage-backed write queue with 3 retries and a dead-letter bucket.
- Conflict resolution is whole-dataset choose-one — "keep local" or "keep cloud", with the
  loser permanently replaced (`ui.sync.conflict*`).

**Known gaps to design away rather than reproduce** — see `04`:
`P-01` (goals and savings never sync at all), `P-02` (deletes never sync),
`P-03` (queue is not concurrency-safe), `P-04` (per-record mutation fan-out).
