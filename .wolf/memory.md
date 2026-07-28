# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-07-26 12:17

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 12:20 | Mapped codebase: store, adapters, amplify schema, i18n, components, tests | read-only | 1887-line store + 56 members; 89/91 files `'use client'` | ~45k |
| 12:35 | Verified suspected defects via grep + node repro | lib/, components/ | 24 pitfalls confirmed with line evidence | ~8k |
| 12:40 | Reproduced timezone bug under TZ=America/Sao_Paulo | scratchpad/dt.mjs | Dashboard months off by one; prev-month off by two | ~1k |
| 12:50 | Wrote migration guide | docs/migration/*.md (7 files) | ~23k tokens of spec; all cross-refs validated | ~25k |
| 13:05 | Formatted docs with repo prettier style | docs/migration/*.md | Clean; embedded code matches semi:false/singleQuote | ~1k |
| 13:10 | Updated OpenWolf context | .wolf/{STATUS,anatomy,cerebrum,memory}.md | STATUS.md filled (was an empty template) | ~3k |
| 13:12 | Opened draft PR #18 | — | CI red on all 3 jobs at `npm ci` | ~2k |
| 13:15 | Diagnosed + fixed lock drift (EUSAGE, @smithy/*) | package-lock.json | 7+/7-; typecheck+lint+format+324 tests pass | ~6k |
| 14:20 | Researched agent toolchain (skills/MCP) for the new repo | docs/migration/07-agent-tooling.md | 5-layer stack; TDD scoped to domain/ only | ~12k |

### Session summary

Produced `docs/migration/` — an 8-document guide for rebuilding Tempest as a new clean
open-source app (new brand, same features), written to be executed incrementally by AI agents.

Key outputs: 7 closed ADRs, 15 mapped features, 24 evidence-backed pitfalls, an 11-phase plan
with exit criteria, and a definition of done.

Three **live user-facing bugs** were found and reproduced during mapping, all still present in
this repo (documented as P-13, P-21, P-10 — not fixed here, this session was spec-only):

1. **P-13** — `new Date('2026-07-01')` parses as UTC. In `America/Sao_Paulo` every dashboard
   chart month label is off by one, and the Monthly view's "vs previous month" reads **two**
   months back.
2. **P-21** — month-over-month expense change divides an installment-inclusive total by an
   installment-exclusive one.
3. **P-10** — `mapInstallmentsToExpenses` defaults to category `'parcelamento'`, renamed to
   `'installment'` by the v1→v2 migration, so every installment is counted as `other`.

Also found: English users literally cannot delete their data (**P-05** — gate compares
`'DELETAR TUDO'` while the English UI says to type `DELETE ALL`).
