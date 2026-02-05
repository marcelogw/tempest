# Guia de Testes - Sync Feature

## 🧪 Níveis de Teste Disponíveis

### Nível 1: Testes Visuais/UI (AGORA - 0 min setup)

**Status**: ✅ **100% funcional sem configuração**

```bash
npm run dev
# Acessar http://localhost:3000
```

#### O que pode ser testado:

##### ✅ SyncCard em Settings

1. Navegar para Settings (⚙️ na sidebar)
2. **Verificar**:
   - SyncCard visível com título "Sincronização na Nuvem"
   - Badge cinza "Desconectado"
   - Texto: "Faça backup dos seus dados e acesse de qualquer lugar"
   - Botão "Conectar Conta" visível e clicável
   - Ícone CloudOff (nuvem riscada)
   - Tooltip ao passar mouse sobre botão

##### ✅ SyncStatusBadge no Footer

1. Em qualquer página
2. **Verificar**:
   - Badge fixo no canto inferior direito
   - Texto "💾 localStorage"
   - Badge cinza (variant: secondary)
   - Tooltip "Dados salvos localmente no navegador" ao passar mouse

##### ✅ AuthDialog

1. Settings → Clicar "Conectar Conta"
2. **Verificar**:
   - Dialog abre com animação
   - Título "Conectar Conta"
   - Descrição explicativa
   - **NOVO**: Botão "Continuar com Google" no topo com ícone
   - Divider "Ou continue com"
   - Tabs "Entrar" e "Criar Conta" funcionam
   - Campos de email e senha
   - Fechar dialog funciona (X ou clicar fora)

##### ✅ Callback Page

1. Acessar diretamente `/auth/callback`
2. **Verificar**:
   - Loading spinner animado
   - Texto "Autenticando..."
   - Após ~1 segundo redireciona para `/settings?auth=success`
   - SettingsView mostra toast de erro (esperado sem auth real)

##### ✅ Responsividade

- Testar em mobile (DevTools → Toggle Device Toolbar)
- SyncCard adapta layout
- Badge footer não sobrepõe conteúdo
- AuthDialog responsivo

**Tempo estimado**: 5-10 minutos

---

### Nível 2: Test Mode (AGORA - 2 min setup)

**Status**: ✅ **Simula backend sem Amplify**

#### Setup Rápido:

```bash
# 1. Abrir DevTools Console
localStorage.setItem('tempest-test-mode', 'true')

# 2. Reload
location.reload()
```

#### Instruções Detalhadas:

1. **Ativar Test Mode**:

   ```javascript
   // DevTools Console (F12)
   localStorage.setItem('tempest-test-mode', 'true')
   location.reload()
   ```

2. **Modificar SettingsView temporariamente**:

   ```typescript
   // No topo do arquivo components/expense/settings-view.tsx
   import { TEST_MODE_ENABLED, getSyncManagerForTest } from '@/lib/sync-manager.test-mode'

   // Na função handleAuthSuccess(), substituir:
   const syncManager = TEST_MODE_ENABLED ? getSyncManagerForTest() : getSyncManager()
   ```

3. **Testar fluxo completo**:
   - Settings → Conectar Conta
   - Ver console logs do upload simulado
   - Ver estado mudar de "Desconectado" → "Sincronizando" → "Conectado"
   - Verificar badge footer muda para "Cloud (test.user)"
   - Verificar toast de sucesso
   - Desconectar → Verificar volta para "Desconectado"

4. **Verificar ID Mappings**:
   ```javascript
   // DevTools Console
   JSON.parse(localStorage.getItem('tempest-sync-storage'))
   // Deve mostrar idMappings preenchidos
   ```

**O que é simulado**:

- ✅ Auth com email fake: `test.user@example.com`
- ✅ Upload com delays realistas (800ms por step)
- ✅ Progress logs no console
- ✅ ID mappings salvos
- ✅ Estado de sync atualizado
- ✅ Toast notifications

**O que NÃO é testado**:

- ❌ Comunicação real com AWS
- ❌ Persistência na cloud
- ❌ Google OAuth redirect
- ❌ Token refresh

**Tempo estimado**: 10-15 minutos

---

### Nível 3: Testes Funcionais Completos (15-30 min setup)

**Status**: ⚠️ **Requer configuração Google OAuth + Amplify**

#### Pré-requisitos:

##### 1. Google OAuth Setup (15 min)

```bash
# 1. Acessar: https://console.cloud.google.com/apis/credentials
# 2. Create Project (se novo)
# 3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
# 4. Application type: Web application
# 5. Authorized redirect URIs:
#    http://localhost:3000/auth/callback
# 6. Copy Client ID & Secret

# 7. Criar .env.local
cp .env.local.example .env.local

# 8. Editar .env.local:
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

##### 2. Amplify Backend Deploy (5-10 min)

```bash
# Instalar Amplify CLI (se necessário)
npm install -g @aws-amplify/cli

# Iniciar sandbox
npx ampx sandbox

# Aguardar mensagem:
# [Sandbox] ✅ Deployed successfully
# [Sandbox] amplify_outputs.json generated
```

#### Testes Funcionais:

##### ✅ T1: Login com Google OAuth

```bash
# Pré-condição: Sandbox rodando, Google OAuth configurado

1. npm run dev (Terminal 2)
2. http://localhost:3000 → Settings
3. Conectar Conta → "Continuar com Google"
4. Fluxo Google:
   - Redireciona para accounts.google.com
   - Escolher conta
   - Permitir acesso
5. Redireciona para /auth/callback
6. Redireciona para /settings?auth=success
7. VERIFICAR:
   ✅ Toast "Dados sincronizados com sucesso"
   ✅ SyncCard mostra "Conectado" + seu email do Google
   ✅ Badge verde "Conectado"
   ✅ Footer badge: "Cloud (username)"
   ✅ Console logs mostram upload de ~200+ items
```

##### ✅ T2: Upload para DynamoDB

```bash
# Após T1, verificar no AWS Console:

1. Acessar: https://console.aws.amazon.com/dynamodbv2
2. Região: us-east-1 (ou região do sandbox)
3. Tables → buscar "amplify-"
4. VERIFICAR tabelas existem:
   ✅ Category (11+ items)
   ✅ CreditCard (0-4 items)
   ✅ MonthlyData (6+ items)
   ✅ Income (6-30 items)
   ✅ Expense (50-200+ items)
   ✅ Installment (0-10 items)

5. Inspecionar item de Category:
   {
     "id": "uuid-123...",
     "categoryId": "mercado",  ← Original kebab ID
     "label": "Mercado",
     "color": "#10b981",
     "isSystem": false,
     "owner": "google_123...",
     "createdAt": "2026-02-05...",
     "updatedAt": "2026-02-05..."
   }
```

##### ✅ T3: ID Mappings Persistidos

```javascript
// DevTools Console
const sync = JSON.parse(localStorage.getItem('tempest-sync-storage'))

console.log('Categories:', Object.keys(sync.idMappings.categories).length)
// Esperado: 11+ (todas as categorias)

console.log('Cards:', Object.keys(sync.idMappings.creditCards).length)
// Esperado: 0-4 (cartões configurados)

console.log('Months:', Object.keys(sync.idMappings.monthlyData).length)
// Esperado: 6+ (últimos 6 meses)

// Ver mapeamento específico:
sync.idMappings.categories
// { "mercado": "uuid-abc", "transporte": "uuid-def", ... }
```

##### ✅ T4: Desconectar (mantém dados locais)

```bash
1. Settings → Conectado → Clicar "Desconectar"
2. VERIFICAR:
   ✅ Toast "Conta desconectada. Seus dados locais foram mantidos"
   ✅ SyncCard volta para "Desconectado"
   ✅ Badge footer: "localStorage"
   ✅ Dados visíveis em Dashboard/Monthly (não foram apagados)
   ✅ localStorage 'expense-store' intacto
   ✅ localStorage 'tempest-sync-storage' limpo (sem email/mappings)
```

##### ✅ T5: Reconexão (detecta dados na cloud)

```bash
# Pré-condição: T1 executado (cloud tem dados)

1. Desconectar (T4)
2. Conectar novamente com mesma conta Google
3. VERIFICAR:
   ✅ Error state aparece
   ✅ Badge vermelho "Erro na Sincronização"
   ✅ Mensagem: "Cloud já contém dados. Use a opção de merge para sincronizar."
   ✅ Botão "Tentar Novamente" visível

# Comportamento ESPERADO (Phase 1.0)
# Phase 1.1 vai implementar merge dialog
```

##### ✅ T6: Login com Email/Password (Amplify Auth)

```bash
1. Settings → Conectar → Tab "Criar Conta"
2. Email: test@example.com
3. Senha: TestPass123! (mín 8 chars)
4. Criar Conta
5. VERIFICAR:
   ✅ Email de confirmação enviado (verificar inbox)
   ✅ Tela muda para "Confirmar Email"
   ✅ Input de código visível
6. Copiar código do email
7. Inserir código → Confirmar
8. VERIFICAR:
   ✅ Mesmo fluxo do T1 (upload automático)
   ✅ SyncCard mostra "Conectado" com test@example.com
```

##### ✅ T7: Error Handling - Sem Internet

```bash
1. Conectado na conta
2. DevTools → Network → Offline
3. Settings → Adicionar nova despesa
4. VERIFICAR:
   ✅ Badge permanece "Conectado" (Phase 1.0 não tem sync contínuo)
   ✅ Dados salvos localmente normalmente

# Phase 2 vai detectar offline e mostrar badge apropriado
```

##### ✅ T8: Error Handling - Sandbox Parado

```bash
1. Parar sandbox (Ctrl+C no terminal)
2. Tentar conectar conta
3. VERIFICAR:
   ✅ Loading infinito OU timeout
   ✅ Error state aparece
   ✅ Mensagem de erro amigável

4. Reiniciar sandbox
5. Clicar "Tentar Novamente"
6. VERIFICAR:
   ✅ Login funciona normalmente
```

**Tempo estimado**: 30-45 minutos (incluindo setup)

---

### Nível 4: Testes de Multi-Device (45+ min)

**Status**: ⚠️ **Limitado em Phase 1.0**

#### Setup:

- Device A: Laptop (Chrome)
- Device B: Celular (Safari) OU Laptop (Firefox/Incognito)

#### Teste Multi-Device:

##### Cenário 1: Upload de A, tentativa de login em B

```bash
# Device A:
1. Login com Google → Upload completo
2. Verificar DynamoDB tem dados

# Device B:
3. Login com MESMA conta Google
4. VERIFICAR:
   ❌ Error: "Cloud já contém dados"
   ⚠️ Dados locais NÃO baixados automaticamente

# Comportamento ESPERADO (Phase 1.0)
# Phase 1.1 vai implementar download + merge
```

##### Cenário 2: Devices independentes (contas diferentes)

```bash
# Device A: conta1@gmail.com
# Device B: conta2@gmail.com

1. Login em cada device
2. VERIFICAR:
   ✅ Cada um tem seu próprio cloud isolado
   ✅ Dados não misturam
   ✅ Owner field no DynamoDB diferente
```

---

## 📊 Matriz de Cobertura de Testes

| Feature                | Nível 1 (UI) | Nível 2 (Mock) | Nível 3 (Full) |
| ---------------------- | ------------ | -------------- | -------------- |
| SyncCard render        | ✅           | ✅             | ✅             |
| SyncStatusBadge        | ✅           | ✅             | ✅             |
| AuthDialog             | ✅           | ✅             | ✅             |
| Estado "Desconectado"  | ✅           | ✅             | ✅             |
| Estado "Conectado"     | ❌           | ✅             | ✅             |
| Estado "Sincronizando" | ❌           | ✅             | ✅             |
| Estado "Erro"          | ❌           | ✅             | ✅             |
| Google OAuth           | ❌           | ❌             | ✅             |
| Upload para AWS        | ❌           | ❌             | ✅             |
| ID Mappings            | ❌           | ✅             | ✅             |
| Toast notifications    | Parcial      | ✅             | ✅             |
| Desconectar            | ❌           | ✅             | ✅             |
| Error handling         | ❌           | Parcial        | ✅             |
| Persistência real      | ❌           | ❌             | ✅             |

---

## 🐛 Checklist de Bugs Comuns

### Durante Desenvolvimento (Nível 1-2):

- [ ] SyncCard não aparece em Settings → Verificar import em settings-view.tsx
- [ ] Badge footer não visível → Verificar z-index e fixed positioning
- [ ] AuthDialog não abre → Verificar estado `authDialogOpen`
- [ ] Console errors de hooks → Verificar 'use client' nos componentes
- [ ] TypeScript errors → `npm run build` para verificar

### Durante Testes Funcionais (Nível 3):

- [ ] "Amplify not configured" → Verificar `amplify_outputs.json` existe
- [ ] Google OAuth redirect_uri_mismatch → Verificar URIs no Google Console
- [ ] Upload falha → Verificar sandbox rodando (`npx ampx sandbox status`)
- [ ] Dados não aparecem no DynamoDB → Verificar owner authorization
- [ ] "Missing cloud ID" errors → Verificar ordem de upload (foreign keys)
- [ ] Token expired → Relogar (Phase 2 vai auto-refresh)

---

## 🎯 Recomendação

**Para desenvolvimento/demo**:
→ **Nível 1 + Nível 2** (15 minutos)

- Testa 80% da UI e lógica
- Sem dependências externas
- Rápido de iterar

**Para validação pré-deploy**:
→ **Nível 3 completo** (45 minutos)

- Testa integração real
- Valida AWS + Google OAuth
- Encontra edge cases

**Para homologação**:
→ **Nível 3 + Nível 4** (90+ minutos)

- Multi-device scenarios
- Performance testing
- Security validation

---

## 📝 Ativar/Desativar Test Mode

### Ativar:

```javascript
// DevTools Console
localStorage.setItem('tempest-test-mode', 'true')
location.reload()
```

### Desativar:

```javascript
// DevTools Console
localStorage.removeItem('tempest-test-mode')
location.reload()
```

### Verificar:

```javascript
localStorage.getItem('tempest-test-mode') // 'true' ou null
```

---

**Próximos passos**: Qual nível de teste você quer executar agora?
