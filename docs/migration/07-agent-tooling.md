# 07 — Agent Tooling

The toolchain the migrating agent runs inside: what to install, what to enforce
mechanically, and what to leave out.

Read once when setting up the new repository (Phase 0). Revisit only when adding a tool.

---

## The organising principle

> **A skill advises. A hook enforces.**

A skill is context the model _may_ follow. A hook is code that runs whether the model wants
it to or not. Everything in this guide that says "must" needs to be a hook, a lint rule, or
a CI check — otherwise it is a suggestion, and suggestions decay.

This is not theoretical. The old app had a complete, translated, 502-key i18n system and a
dashboard with **every string hardcoded in Portuguese** (→ **P-08**). The infrastructure was
right; nothing enforced its use. The same failure mode produced `.skip`ped E2E tests that
still looked like coverage (→ **P-23**) and a 75% coverage threshold measured over the
safest code in the repo (→ **P-24**).

**Corollary: every tool costs context on every session.** A tool that does not prevent a
specific failure listed in `04` is overhead. Be ruthless.

---

## Layer 1 — Enforcement (install first, Phase 0)

This layer is the reason the new app will not repeat `04`. It is not optional and it is not
a "later" item.

### Hooks

Configured in `.claude/settings.json`. Use the `update-config` skill to write them.

| Hook                                         | Fires                      | Prevents                                                                         |
| -------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| Block hardcoded colour literals              | `PreToolUse` on Edit/Write | The 20-hex palette hardcoded in the old store; drift from the design system      |
| Block hand-written files in `components/ui/` | `PreToolUse` on Write      | Custom primitives instead of the shadcn CLI (`CLAUDE.md` rule, routinely broken) |
| Require `STATUS.md` freshness                | `Stop`                     | Context loss between sessions — see Layer 2                                      |
| Reject `.skip` / `.only` in specs            | `PreToolUse` + CI          | → **P-23**                                                                       |

### Lint rules

- `react/jsx-no-literals` with a curated allowlist → **P-08**
- No hex literals or arbitrary Tailwind values (`bg-[#ef4444]`) outside the token file
- No bare `.sort()` / `.reverse()` / `.splice()` on a store selector result → **P-09**
- No `new Date(<string>)` anywhere → **P-13**

### CI checks

- Message-file key parity (`en.json` ↔ `pt.json`), and no key defined but unreferenced
- `TZ='America/Sao_Paulo'` on the test job → **P-13**
- Bundle-size budget

> **Why this ordering.** Layers 2–4 are conveniences. Layer 1 is the only thing that makes
> the quality bar in `06` real rather than aspirational.

---

## Layer 2 — Context and task management

### OpenWolf — keep, with a caveat

Long-term memory across sessions: `STATUS.md` (handoff), `cerebrum.md` (learnings,
do-not-repeat), `anatomy.md` (token-efficient file index), `buglog.json`.

**The caveat is honest and load-bearing.** In the old repo OpenWolf worked as _structure_
but not as _habit_: `STATUS.md` sat as an unedited template for over a week and
`cerebrum.md` held two entries, until both were filled in during the session that produced
this guide. **Memory only pays off if something writes to it.**

→ Enforce with the `Stop` hook in Layer 1: fail the turn if a session that modified code did
not touch `STATUS.md`.

### kanban-md — only with parallel agents

File-based Kanban, one Markdown file per task, no server. Agent-first: `--compact` output,
atomic `pick --claim` with cooperative locking and expiring claims, self-healing task IDs,
and installable agent skills (`kanban-md skill install`).

**Decide the boundary before installing it**, because it overlaps `05-phase-plan.md`:

| File               | Role                                                    | Changes    |
| ------------------ | ------------------------------------------------------- | ---------- |
| `05-phase-plan.md` | **Strategy** — phases, exit criteria, dependency order  | Rarely     |
| kanban board       | **Execution** — today's work units, claims, parallelism | Constantly |

Two sources of truth for the same thing is worse than one. Its real differentiator is
`pick --claim`, which only matters when **multiple agents work the same board
concurrently**. One agent at a time → the phase plan alone is enough; skip it.

### Ponytail — optional, and it conflicts with `06`

A cross-agent discipline layer that pushes the model to ship the least code that solves the
problem. Reported benefits are real (substantially less output code, lower cost).

**But it is in direct tension with this project's quality bar.** `06` requires a unit test
for every number rendered, a render test for every Radix primitive, and an E2E smoke test
per route. That is a lot of output code — and it is precisely the code Ponytail is optimised
not to write.

If you install it, **exclude the domain layer and all test files from its scope** — in glob
terms, `domain/` recursively plus every `*.test.*` file. Otherwise you save tokens by buying
back **P-13**, **P-21**, and **P-20** — three defects that exist specifically because logic
was untested.

---

## Layer 3 — Design system enforcement

The new brand is the point of the rebuild, so drift here is the most expensive kind. Three
levels, strongest first.

### 1. Mechanical (Layer 1)

The token lint and the `components/ui/` write-block above. This is what actually enforces.

### 2. A project skill, written by you, versioned in the repo

When output must follow **repo-owned** tokens, a project skill beats any generic plugin: it
loads your tokens, logo, composition rules, and canonical examples into every session
automatically. Build it with the **`skill-creator`** skill.

It should encode:

- The token set, and the rule that raw values are never used
- Logo and brand-mark usage
- Composition rules (which primitives compose, which never nest)
- Two canonical examples — one form, one dialog — as the copy-from reference, which is the
  `CLAUDE.md` "read two existing components first" rule made executable

### 3. `/design-sync` + the `DesignSync` tool — only if your DS lives in Claude Design

Keeps a local component library in sync with a Claude Design design-system project,
**incrementally, one component at a time, never as a wholesale replace**.

⚠️ **Verified limitation.** `DesignSync` needs design-system authorization via
`/design-login`, which requires an interactive terminal and is **not available in Claude
Code on the web**. If your design system lives in Claude Design, use its **"Send to Claude
Code Web"** button to seed the project into the workspace, or provide the files directly.

### Already available: the `design` plugin

Enabled on this account. Two commands are relevant:

- `/design:accessibility` — WCAG audit. Run per route in **Phase 9**.
- `/design:handoff` — Figma → developer specs, if the redesign lives in Figma.

---

## Layer 4 — Visual verification

`CLAUDE.md` already requires a screenshot review before UI is called done — but that
currently depends on the agent remembering. Give it eyes properly.

**Use Playwright MCP.** The project already uses Playwright for E2E, so this is one browser
stack instead of two: navigate, fill, click, screenshot, wait for elements.

**Not Chrome DevTools MCP** — it is for _debugging_ a browser (CDP: network timing,
performance traces, memory, console) rather than _driving_ one. Add it later if performance
profiling becomes a real need; it is not a Phase 0 concern.

---

## Layer 5 — Testing policy: TDD, selectively

The direct answer: **TDD in `domain/`, test-after in the UI.** This is not a hedge — the two
halves have genuinely different economics.

### TDD in `domain/` — yes

The conditions that make TDD pay are all present: pure functions, no mocks, and a **spec
that already exists**. `06`'s pitfall-regression table is literally a list of executable
cases that can be written before a single line of implementation:

```
previousMonth('2026-07') === '2026-06'         under TZ=America/Sao_Paulo   → P-13
identical months with installments → 0% change                             → P-21
a month with an installment → 'installment' entry, not 'other'             → P-10
a recurrence started at M still resolves at M+36                           → P-07
a category named "🎉" is rejected                                          → P-12
```

Five red tests before `domain/month.ts` exists. They lock the three wrong-number bugs out
permanently.

### TDD in the UI — no

The design is new and gets discovered visually. Writing tests before knowing what the
component became is guaranteed rework. The UI cycle is:

```
build → screenshot → review → render test → E2E smoke
```

### It needs enforcement either way

Models naturally write implementation first and tests second; TDD is the inverse, so it
**requires explicit enforcement** rather than good intentions. Make it a hook on `domain/`:
reject a Write to `domain/x.ts` when `domain/x.test.ts` does not already exist.

---

## What not to install

| Tool                                                              | Why not                                                                                                                                                                             |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Serena** (semantic code navigation)                             | Earns its context in legacy code — navigating an 1,887-line store by symbol. In a greenfield where `domain/` files are ~80 lines, Read/Grep is cheaper. Re-evaluate around Phase 8. |
| **Chrome DevTools MCP**                                           | Debugging, not driving. Not a Phase 0 need (Layer 4).                                                                                                                               |
| **Knowledge-work plugins** (`product-management`, `marketing`, …) | The available catalog targets knowledge work, not this project.                                                                                                                     |
| **A second state/test framework**                                 | Zustand and Vitest are already the right size. Adding tools is how `components/ui/` grew to 63 vendored primitives.                                                                 |

---

## Summary

| Tool                                          | Install when              | Why                                               |
| --------------------------------------------- | ------------------------- | ------------------------------------------------- |
| Hooks + token lint + CI checks                | **Phase 0**               | The only real enforcement                         |
| Design-system project skill (`skill-creator`) | **Phase 0**               | Repo-owned tokens beat a generic plugin           |
| OpenWolf                                      | **Phase 0**               | Proven — with the `Stop` hook forcing `STATUS.md` |
| Playwright MCP                                | **Phase 0**               | Closes the visual loop; same stack as E2E         |
| TDD in `domain/`                              | **Phase 1**               | Tests already written in `06`                     |
| `design` plugin (`/design:accessibility`)     | Phase 9                   | WCAG per route                                    |
| kanban-md                                     | Only with parallel agents | Otherwise `05` is enough                          |
| Ponytail                                      | Optional                  | Exclude `domain/**` and tests from scope          |
| Serena                                        | Re-evaluate Phase 8       | Low value in greenfield                           |

---

## Caveat

The research behind this document covers **what these tools do**, not **them working
together in the new repository** — which does not exist yet. Nothing here has been validated
as an integrated stack.

The one item that _was_ tested is `DesignSync`, and it failed for the reason documented in
Layer 3. Treat the rest as a plan to verify during Phase 0: install Layer 1 first and prove
it blocks a real hardcoded hex before trusting any of it.

---

## Sources

- [Ponytail Inside Claude Code Is Really About Token Discipline](https://aikickstart.com.au/news/ponytail-inside-claude-code-token-discipline)
- [Ponytail: The AI Coding Skill That Saves Tokens by Writing Less Code](https://www.alphamatch.ai/blog/ponytail-ai-coding-skill-2026)
- [kanban-md — File-based Kanban for AI agents and humans](https://antopolskiy.github.io/kanban-md/)
- [antopolskiy/kanban-md](https://github.com/antopolskiy/kanban-md)
- [Claude Design System Skill: Use Claude Design, Build a Project Skill, or Vet a UI/UX Skill?](https://blog.laozhang.ai/en/posts/claude-design-system-skill)
- [Design Systems in 2026: Turn Your System into a Claude Skill](https://www.designsystemscollective.com/design-systems-in-2026-turn-your-system-into-a-claude-skill-3dd4d8bf5feb)
- [Claude Design June 2026: Design System Imports, Claude Code Sync](https://chatforest.com/builders-log/claude-design-june-2026-design-system-imports-code-sync-token-fix-builder-guide/)
- [Playwright vs. Chrome DevTools MCP: Driving vs. Debugging](https://stevekinney.com/writing/driving-vs-debugging-the-browser)
- [I Tested All 3 Browser Tools for Claude Code](https://ayyaztech.com/blog/chrome-devtools-mcp-vs-claude-in-chrome-vs-playwright)
- [A Claude Code TDD Skill: Forcing Red-Green-Refactor Discipline](https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/)
- [Claude Code and the Art of Test-Driven Development](https://thenewstack.io/claude-code-and-the-art-of-test-driven-development/)
