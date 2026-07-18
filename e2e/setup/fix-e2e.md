1. **Testes E2E falhando (Timeout no Dashboard/Navigation):**
   A causa das falhas é uma combinação de sobreposição de modais (Radix UI) com o fato de que a base mock (storage-state.json) está defasada e o componente `DashboardView` possui um estado vazio (`Nenhum dado para o ano`). Os cliques estavam sendo interceptados porque o dropdown do ano ficava aberto e o Playwright não forçava o clique (`{ force: true }`). Isso gerou cascatas de timeouts.

2. **Modo Nuvem (Sync/Criar Casa) não responde e não tem logs:**
   A interface de criação de casa no adapter AWS Amplify provavelmente está engolindo os erros (`try/catch` silencioso) ou existe uma validação falhando no cliente (ex: falta de variáveis de ambiente do Cognito/Amplify). Como não há logs, o fluxo apenas retorna ao dashboard. Vou inspecionar o arquivo `lib/adapters/context.tsx` e `workspace-client`.

3. **Avatar com Email e Borda Branca:**
   A renderização do displayName no sidebar tem um fallback para `userEmail.split('@')[0]` caso não exista nome (o que ocorre no modo Visitante/Guest se tivermos email sujo no localStorage). A borda branca ao redor do avatar precisa ser removida na interface.
