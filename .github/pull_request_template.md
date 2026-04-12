## Summary

<!-- What does this PR do? Why? -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / technical debt
- [ ] Documentation

## Checklist

- [ ] `npm run quality` passes (typecheck + lint + format)
- [ ] `npm run test` passes with no regressions
- [ ] Both `en.json` and `pt.json` updated (if UI strings changed)
- [ ] No hardcoded strings — all user-facing text goes through `useTranslations()`

### For new UI components

- [ ] Every component using Radix primitives (Select, Dialog, Sheet, AlertDialog) has a render test that opens it and asserts no crash
- [ ] Screenshots or screen recording included

### For new screens / routes

- [ ] Playwright E2E smoke test added (navigate → primary action → assert no crash)

### For new utility / business logic

- [ ] Unit tests cover all branches, including time-dependent logic (`vi.setSystemTime`)
