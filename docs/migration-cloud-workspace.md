# Plano de Migração: Cloud-Only + Workspace

## Contexto

O Tempest nasceu como um app **local-first**: dados no localStorage, sync com AWS Amplify como feature opcional. Essa arquitetura funcionou como MVP, mas criou complexidade crescente ao adicionar suporte a múltiplos dispositivos e acesso familiar:

- ID mapping hell (kebab-case local vs UUID do Amplify)
- 4 cenários de conflito (local-only, cloud-only, both, empty)
- Escrita bidirecional impossível no modelo "owner + guests"
- `sync-manager.ts` de ~400 linhas para gerenciar tudo isso

A decisão foi migrar para **cloud-only + workspace**: os dados pertencem à workspace, localStorage vira cache, e toda a camada de sync é simplificada. Não há usuários em produção, então a migração pode ser feita sem backwards compatibility.

O baseline antes da migração está preservado na tag `v1.0.0`.

---

## Arquitetura Final

### Princípio central

> Os dados pertencem à **Workspace**, não ao usuário. Usuários são membros de uma workspace com acesso igual.

### Cloud-only

- Amplify é a fonte da verdade
- localStorage é cache (leitura imediata ao carregar)
- Sem o app não funciona offline (melhoria futura: write queue com suporte offline)

### Workspace e autorização (Cognito Groups)

Cada workspace mapeia para um **Cognito Group** (`workspace-{uuid}`). Todos os models têm um campo `workspaceGroup: a.string()` e usam `allow.groupDefinedIn('workspaceGroup')`.

Vantagem crítica: adicionar/remover membro = uma chamada `adminAddUserToGroup` / `adminRemoveUserFromGroup`. Sem bulk updates em records existentes.

Limite: **2 membros por workspace** (enforçado no Lambda de aceite de convite).

### Client-generated UUIDs

Todos os records recebem um UUID gerado pelo cliente (`crypto.randomUUID()`) **antes** de serem enviados ao Amplify. O store usa o mesmo UUID que o cloud. Elimina completamente o `idMappings` do sync-store.

### Write queue

Mutações seguem o padrão:

1. Atualiza Zustand + localStorage **imediatamente** (UI reage na hora)
2. Enfileira a operação na write queue (persistida no localStorage)
3. Background processor envia ao Amplify com retry
4. Ícone de status indica escrita pendente

Isso elimina a necessidade de rollback individual por mutação.

### Smart sync via `lastActivityAt`

Cada workspace tem um campo `lastActivityAt` (timestamp). Toda mutação faz **duas escritas**: o próprio record + atualização de `lastActivityAt` na workspace.

No carregamento e no `window focus`:

1. Query leve em `Workspace.lastActivityAt`
2. Compara com `lastSyncedAt` no localStorage
3. Se cloud é mais novo → re-fetch todos os dados → atualiza cache

Melhoria futura: substituir as duas escritas por DynamoDB Streams (ver `ideas.md`).

### Invite flow

- Owner gera código one-time com TTL de ~15-30 minutos
- Owner compartilha o link/código manualmente (WhatsApp, SMS, etc.)
- Guest abre o link, faz login, Lambda valida o código e chama `adminAddUserToGroup`
- Guest imediatamente vê todos os dados da workspace no próximo sync
- Melhoria futura: envio automático por email via SES (ver `ideas.md`)

---

## Schema Amplify (estado final)

### Novos models

```typescript
Workspace: a.model({
  name: a.string().required(),
  workspaceGroup: a.string().required(), // nome do Cognito group: "workspace-{uuid}"
  lastActivityAt: a.datetime().required(),
  ownerSub: a.string().required(), // quem pode gerenciar membros
}).authorization((allow) => [allow.groupDefinedIn('workspaceGroup')])

UserProfile: a.model({
  displayName: a.string().required(),
  email: a.string().required(),
  avatarColor: a.string().required(), // cor para avatar gerado com iniciais
  // avatarUrl: a.string()              // futuro: foto de perfil via S3
}).authorization((allow) => [allow.owner()])

Invite: a.model({
  workspaceId: a.id().required(),
  workspaceGroup: a.string().required(),
  workspaceName: a.string().required(), // para exibir ao guest antes de aceitar
  expiresAt: a.datetime().required(), // TTL ~15-30 min
  usedAt: a.datetime(), // preenchido após aceite (one-time use)
}).authorization((allow) => [
  allow.groupDefinedIn('workspaceGroup'), // owner pode criar/ver
  allow.authenticated().to(['read']), // guest pode lookup pelo código
])
```

### Models existentes — mudanças

Todos os 6 models (`Category`, `CreditCard`, `MonthlyData`, `Income`, `Expense`, `Installment`) recebem:

- Campo `workspaceGroup: a.string().required()`
- Autorização trocada de `allow.owner()` para `allow.groupDefinedIn('workspaceGroup')`

O campo `workspaceGroup` é definido pelo cliente no momento da criação (junto com o UUID gerado pelo cliente). Nunca muda após a criação.

---

## Lambdas necessárias

### `createWorkspace`

- **Trigger**: custom mutation autenticada
- **O que faz**:
  1. Gera UUID para a workspace
  2. Cria Cognito group `workspace-{uuid}`
  3. Chama `adminAddUserToGroup` para o owner
  4. Cria registro `Workspace` no Amplify
  5. Cria `UserProfile` para o owner (se não existir)
  6. Cria as categorias padrão (system categories) vinculadas à workspace
- **IAM necessário**: `cognito-idp:CreateGroup`, `cognito-idp:AdminAddUserToGroup`

### `generateInviteCode`

- **Trigger**: custom mutation autenticada (apenas owner da workspace)
- **O que faz**:
  1. Valida que o caller é o `ownerSub` da workspace
  2. Verifica que o número de membros do grupo Cognito é < 2
  3. Invalida invites anteriores não utilizados (opcional)
  4. Cria registro `Invite` com código aleatório e `expiresAt`
  5. Retorna o código e a URL para o owner compartilhar
- **IAM necessário**: `cognito-idp:ListUsersInGroup`

### `acceptInvite`

- **Trigger**: custom mutation autenticada
- **O que faz**:
  1. Busca o `Invite` pelo código
  2. Valida: não expirado, não usado
  3. Verifica que o grupo ainda tem < 2 membros
  4. Chama `adminAddUserToGroup` com o sub do caller (obtido do JWT)
  5. Marca o invite como usado (`usedAt`)
  6. Cria `UserProfile` para o guest (se não existir)
  7. Retorna o `workspaceId` para o frontend redirecionar
- **IAM necessário**: `cognito-idp:AdminAddUserToGroup`, `cognito-idp:ListUsersInGroup`

---

## Store como cache

### O que muda em `lib/expense-store.ts`

O contrato público (nomes das funções, tipos exportados) é **preservado** para não quebrar os ~80 componentes que o consomem. O que muda é o interior:

**Antes:**

```typescript
addExpense: (month, expense) => {
  set((state) => {
    /* immer mutation */
  })
  // localStorage via zustand persist
}
```

**Depois:**

```typescript
addExpense: async (month, expense) => {
  const id = crypto.randomUUID()
  const newExpense = { ...expense, id }

  // 1. Atualiza store imediatamente
  set((state) => {
    /* immer mutation com newExpense */
  })

  // 2. Enfileira write
  writeQueue.enqueue({
    operation: 'create',
    model: 'Expense',
    data: { ...newExpense, workspaceGroup, monthlyDataId },
  })
}
```

### Estado adicional no store

```typescript
isLoading: boolean // true durante fetch inicial da workspace
workspaceId: string | null // ID da workspace ativa
lastSyncedAt: Date | null // timestamp do último sync completo
```

### Inicialização

```typescript
async function loadWorkspace(workspaceId: string) {
  store.set({ isLoading: true })

  const [categories, creditCards, monthlyData, ...] = await Promise.all([
    fetchAllPages(client.models.Category.list, workspaceGroup),
    // ...
  ])

  store.set({ categories, creditCards, monthlyData, isLoading: false, lastSyncedAt: new Date() })
  // persiste no localStorage como cache
}
```

---

## Fluxo de navegação

```
URL acessada
  └→ middleware verifica sessão Cognito
       ├→ sem sessão → /landing (login/register)
       └→ com sessão → verifica workspace no sync-store
            ├→ sem workspace → /onboarding
            │     ├→ "Criar minha casa" → input nome → Lambda createWorkspace → /app
            │     └→ "Tenho um código" → input código → Lambda acceptInvite → /app
            └→ com workspace → /app
                  └→ background: verifica lastActivityAt → sync se necessário
```

---

## Fases de implementação

### Fase 1 — Backend Amplify

_Pré-requisito de tudo. Nada no frontend funciona até estar deployado no sandbox._

**Arquivos:**

- `amplify/data/resource.ts` — schema completo
- `amplify/functions/create-workspace/` — Lambda
- `amplify/functions/generate-invite-code/` — Lambda
- `amplify/functions/accept-invite/` — Lambda
- `amplify/backend.ts` — registrar as funções

**Critério de conclusão:** deploy no sandbox funciona, consegue criar workspace e adicionar membro via Amplify console/curl.

---

### Fase 2 — Migração do Store

_O trabalho mais volumoso. Caminho crítico._

**Arquivos:**

- `lib/expense-store.ts` — todas as ~25 funções mutadoras migradas para cloud
- `lib/write-queue.ts` — novo: fila de escritas com retry
- `lib/workspace-client.ts` — novo: wrapper Amplify com contexto de workspace
- `lib/sync-store.ts` — simplificado: remove `idMappings`, adiciona `workspaceId`, `lastSyncedAt`
- `lib/sync-manager.ts` — deletar ou reduzir a quase nada

**Critério de conclusão:** app funciona com dados vindos do Amplify, write queue processa mutations, smart sync detecta mudanças de outro dispositivo.

---

### Fase 3 — Auth Gate + Onboarding

_Pode ser desenvolvida em paralelo com partes da Fase 2. Requer Fase 1._

**Arquivos:**

- `app/page.tsx` (ou `app/(landing)/page.tsx`) — landing page
- `app/(onboarding)/page.tsx` — fluxo criar/entrar workspace
- `middleware.ts` — reescrito para auth redirect
- `components/expense/auth-dialog.tsx` — possivelmente removido (auth vira gate, não dialog)
- `app/layout.tsx` — remover graceful degradation sem Amplify

**Critério de conclusão:** usuário sem conta é redirecionado para landing, novo usuário consegue criar workspace e chegar no app.

---

### Fase 4 — Workspace Management UI

_Não bloqueia o uso básico. Pode ser feita depois das fases 2 e 3._

**Arquivos:**

- `components/expense/settings-view.tsx` — nova seção "Minha Casa"
- `components/workspace/invite-dialog.tsx` — novo: gera e exibe código de convite
- `components/workspace/members-list.tsx` — novo: lista membros, botão remover

**Critério de conclusão:** owner consegue convidar e remover membros pela UI.

---

### Fase 5 — Limpeza

_Feita por último, quando tudo estiver funcionando._

- Deletar `lib/sync-manager.ts` (Phase 1.1 se torna obsoleta)
- Deletar `docs/sync-architecture.md` (substituído por este documento)
- Deletar `PHASE_1_1_PLAN.md` (untracked, planning artifact)
- Atualizar `CLAUDE.md` com a nova arquitetura
- Revisar e atualizar testes

---

## O que foi explicitamente descartado (e por quê)

| Abordagem                            | Descartada porque                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `allow.ownerDefinedIn('sharedWith')` | Adicionar membro exige bulk update em todos os records                                                 |
| `allow.owner()` com "guests array"   | Escrita bidirecional impossível — novos records do guest pertencem ao guest, não são visíveis ao owner |
| Rollback individual por mutação      | Muito código, frágil, substituído pela write queue                                                     |
| Envio de email no invite             | Requer SES + domínio verificado; owner compartilha manualmente (melhoria futura)                       |
| Real-time via subscriptions          | Phase 2 futura; smart sync por `lastActivityAt` é suficiente para o caso de uso                        |
| Múltiplas workspaces por usuário     | Complica a UX; deixado para o futuro (ver `ideas.md`)                                                  |
| Suporte offline total                | App requer internet; write queue com suporte offline é melhoria futura                                 |

---

## Arquivos que NÃO precisam mudar

- Todos os componentes de UI (`components/expense/*.tsx`) — consomem o store pelo mesmo contrato
- Sistema de i18n (`messages/`, `i18n/`, `middleware` em partes)
- `lib/formatters.ts`
- `lib/utils.ts`
- Tailwind / shadcn / styling

---

## Referências

- `ideas.md` — features futuras e melhorias técnicas anotadas durante o brainstorm
- `amplify/data/resource.ts` — schema atual (antes da migração)
- Tag `v1.0.0` — baseline local-first antes desta migração
