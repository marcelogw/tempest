# 06 — Quality Bar

The definition of done. Read before opening a pull request.

The goal is **absolute quality without ceremony**: a small number of rules that are actually
enforced, rather than a long list that is aspirational. Everything here is either
machine-checked or takes under a minute to verify by hand.

---

## Definition of done

A feature is done when **every** box is ticked. Not most.

- [ ] Behaviour matches its section in `02`, including the listed edge cases
- [ ] Every pitfall linked from that section is verified as **not reproduced**
- [ ] Zero hardcoded user-visible strings; keys exist in `en.json` **and** `pt.json`
- [ ] Pure logic lives in `domain/` and is unit tested, branches included
- [ ] Every Radix-based component has a render test that opens it
- [ ] The route has an E2E smoke test driving the primary user action
- [ ] `npm run quality` passes
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` passes
- [ ] A screenshot of the new UI has been reviewed against an existing screen
- [ ] The phase-plan task is ticked in `05`

---

## Testing

### The layers, and what belongs in each

| Layer                  | Covers                                                            | Rule                                                                                             |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Domain** (`domain/`) | Money, months, recurrence, installments, goals, totals, analytics | Pure functions. No React, no storage, no i18n, no mocks. Target 100%.                            |
| **Store**              | Actions, invariants, state transitions                            | Real store, no mocked internals. Assert the resulting state, not the calls made.                 |
| **Component**          | Rendering, interaction, a11y                                      | Testing Library through the custom i18n render wrapper. Query by role and label, never by class. |
| **E2E** (Playwright)   | One primary flow per route                                        | `data-testid` selectors only — never user-visible text (→ **P-23**).                             |

### Non-negotiable rules

1. **A number rendered to the user is covered by a unit test.** Three of the worst bugs in
   the old app (**P-13**, **P-21**, **P-10**) are wrong numbers in untested `useMemo` blocks.
   If a value reaches the screen, a test asserts it.

2. **Tests run under a non-UTC timezone.** `TZ='America/Sao_Paulo'` in the Vitest config and
   in CI. This is the single check that catches the entire **P-13** family, and the app's
   primary market is in that timezone anyway.

3. **`vi.setSystemTime()` for anything that reads the clock.** Goal status, "current month"
   defaults, `createdAt`. A test that passes only in July is not a test.

4. **Every Radix primitive gets a render test.** Radix enforces runtime invariants
   TypeScript cannot see — `SelectItem` may not have `value=""`, `Dialog` needs a title for
   a11y. Only rendering surfaces them.

   ```tsx
   it('renders without crashing', async () => {
     render(<CategoryFormDialog open onOpenChange={() => {}} />)
     expect(await screen.findByRole('dialog')).toBeInTheDocument()
   })
   ```

5. **No skipped tests in `main`.** A `.skip` is deleted or fixed. CI fails on `.skip` and
   `.only` in committed specs. The old repo's entire replication E2E suite sat skipped while
   looking like coverage (→ **P-23**).

6. **Migrations get fixture round-trip tests before they ship.** The code that rewrites a
   user's financial history is the last place to skip tests — and the old repo excluded it
   from coverage entirely (→ **P-24**).

7. **Coverage excludes only generated code and `components/ui/`.** Nothing else. A module
   that is hard to test is a design problem to fix, not a line to add to an exclude list.

   > Treat the coverage percentage as a smoke alarm, not a goal. It only measures files
   > imported by at least one test, so a brand-new untested module is invisible to it. Write
   > tests because the logic needs them.

### Regression tests for pitfalls

When migrating a feature, add a test that would **fail** if its pitfall were reintroduced.
These are the highest-value tests in the suite:

| Pitfall  | The test                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------- |
| **P-13** | Under `TZ=America/Sao_Paulo`: the label for `2026-07` is July; `previousMonth('2026-07') === '2026-06'` |
| **P-21** | Identical months containing installments report **0%** change                                           |
| **P-10** | A month with an installment yields an `installment` breakdown entry, not `other`                        |
| **P-05** | The destructive confirmation succeeds in **both** locales                                               |
| **P-22** | After delete-all, categories are back to the 11 defaults and cards are empty                            |
| **P-07** | A recurrence started in month _M_ still resolves at _M + 36_                                            |
| **P-06** | Reading an unknown month persists nothing                                                               |
| **P-12** | A category named `"🎉"` is rejected                                                                     |
| **P-15** | A 12 × R$100 plan on a R$1,000-limit card reports a sane usage figure                                   |

---

## Internationalisation

Enforced by ADR-006. In practice:

1. **No user-visible literal in JSX.** `react/jsx-no-literals` is on, with a curated
   allowlist for symbols and numerals. This is what makes **P-08** impossible to repeat —
   the old app had a fully translated dashboard key set sitting unused above 700 lines of
   hardcoded Portuguese.

2. **CI checks message files.** Key sets in `en.json` and `pt.json` must match exactly, and
   a key defined but never referenced fails the build. That check would have caught both the
   two `pt`-only keys and the dead `ui.dashboard.*` set.

3. **Formatters are locale-bound and have no defaults.**

   ```ts
   // ✗ the old signature — the default is why all 36 call sites are pt-BR
   formatCurrency(value: number, locale: SupportedLocale = 'pt-BR', ...)

   // ✓ locale is bound once, at the provider
   const format = useFormatters()
   format.currency(cents)
   ```

   `formatCurrency` outside a bound context is a type error. A parameter that is ignored —
   as `_locale` is in the old `formatShortCurrency` — must not exist.

4. **No `toLocaleDateString()` outside the formatters.** No raw ISO string reaches the
   screen (→ **P-19**).

5. **Domain and store code never produce user-facing text.** They throw typed errors; the UI
   maps error types to messages. No more `throw new Error('Cartão não encontrado')`.

6. **Any compared phrase comes from the message catalogue** — the same one that instructs the
   user (→ **P-05**).

7. **Both locales are exercised in E2E.** At minimum the destructive-confirmation flow.

---

## UI conventions

These carry over from `CLAUDE.md` because they encode real, expensive lessons.

**Before building a form or modal**

1. Read at least two existing equivalents first. Copy their structure and spacing; do not
   invent a layout.
2. **shadcn/ui primitives only.** Never hand-roll a colour picker, icon selector, dropdown,
   or date input. Custom primitives are how UI drifts.
3. Field conventions:
   - Currency: integer-valued input (ADR-005), never `step="0.01"` — which
     `expense-form.tsx:102` does today, against the project's own rule
   - Deadlines: `<Input type="month">` or a `Select` constrained to future months. Never
     allow a past deadline.
   - Non-login text inputs: `autoComplete="off"` so password managers do not hijack them

**Visual validation is mandatory**

An agent has no eyes by default. Before marking UI work done:

```bash
npm run dev &
# drive the screen with Playwright, capture a screenshot, review it
# fix, repeat until it matches the rest of the app
kill %1
```

Then open an existing comparable screen beside it and check spacing, type scale, and
component sizing. A form is not done until a screenshot confirms it.

**Charts** must be legible in light and dark, use the brand palette, and get their labels
from i18n — never from a hardcoded series name.

---

## Code conventions

- `type` over `interface`, except where an interface is genuinely extended
- Explicit prop types on every component
- **Never mutate a value obtained from a store selector.** No bare `.sort()`, `.reverse()`,
  `.splice()` — copy first (→ **P-09**)
- Sorting and filtering are derived state: a selector or `useMemo`, never inline in JSX
- One `newId()`, `crypto.randomUUID()` everywhere (→ **P-14**)
- No magic strings for IDs — reference the constant (→ **P-10**)
- No magic numbers for business rules — name them (→ **P-07**, **P-18**)
- Anything longer than a few lines inside a store action belongs in `domain/`
- All code, comments, identifiers, and commits in **English** (→ ADR-007)

---

## Pull request checklist

```markdown
## What

<one line>

## Phase / Feature

Phase N · F-xx

## Pitfalls verified not reproduced

- [ ] P-xx — <how it was verified>

## Checks

- [ ] npm run quality
- [ ] npm run test
- [ ] npm run test:e2e
- [ ] Screenshot reviewed against an existing screen
- [ ] Strings in both en.json and pt.json
- [ ] Phase-plan task ticked in docs/migration/05-phase-plan.md
```

---

## Anti-patterns

Specific things that produced the defects in `04`. Do not do them.

| Anti-pattern                                              | Where it bit                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| `new Date(someString)` for a date-only value              | **P-13** — off-by-one month across the whole dashboard                      |
| The same total computed two ways in two places            | **P-21** — wrong month-over-month percentage                                |
| A default-argument magic string for an ID                 | **P-10** — installments filed under a dead category                         |
| A compared literal that has a translated counterpart      | **P-05** — English users locked out of deletion                             |
| UI copy written independently of the code                 | **P-16**, **P-22** — dialogs that describe behaviour the code does not have |
| Business logic in a `useMemo` inside a 700-line component | **P-20** — untested numbers                                                 |
| An exclude list instead of a testable design              | **P-24** — the riskiest modules unmeasured                                  |
| Materialising a rule into rows                            | **P-04**, **P-07** — 25 writes per action, silent 24-month cliff            |
| Reading state that writes state                           | **P-06** — browsing a year persists 12 empty months                         |
| An abstraction built for a backend that is not there yet  | ADR-003 — 15 of 17 methods are `return Promise.resolve()`                   |

---

## When something is genuinely blocked

Do not ship a half-feature to keep the phase moving, and do not silently shrink the scope.

1. Finish everything in the phase that is **not** blocked.
2. Record the blocker in `05` with a date and the reason.
3. Say plainly what is outstanding.

Scaling work down is the maintainer's call, not the agent's.
