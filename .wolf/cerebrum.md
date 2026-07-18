# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-07-18

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** tempest
- **Description:** Personal expense management app — track income, expenses, investments, and savings. Runs locally with zero config or syncs to AWS Amplify for shared workspaces.

## Do-Not-Repeat

- [2026-07-18] NUNCA subestime o impacto de alterações na interface (como mudanças simples de texto ou componentes). O projeto possui uma suíte extensa de testes unitários e E2E (Playwright) que cobrem praticamente todos os fluxos. Qualquer modificação nos componentes visuais ou textos pode e vai quebrar seletores de testes.
- [2026-07-18] SEMPRE trate processos obrigatórios (como linter e testes passando) como verdades absolutas. Não pergunte ao usuário se deve ou não consertar o código para que o linter ou testes passem. Se houver falhas, corrija ativamente.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
