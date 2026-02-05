# Roadmap de Sincronização - Tempest

Planejamento das funcionalidades de sincronização e compartilhamento de dados.

---

## 🎯 Visão Geral

**Objetivo:** Permitir que usuários comecem a usar o app imediatamente (sem login), e opcionalmente conectem uma conta para backup automático e acesso multi-dispositivo. No futuro, permitir compartilhamento entre múltiplos usuários.

**Princípios:**

- 🚀 Onboarding sem fricção (sem login obrigatório)
- 💾 Dados locais primeiro (funciona offline)
- ☁️ Sincronização opcional e progressiva
- 👥 Compartilhamento futuro com controle granular

---

## 📱 Fase 1: Opt-in Sync (MVP)

**Status:** 🟡 Planejada

### O que o usuário pode fazer:

#### Antes de conectar:

- ✅ Usar o app normalmente sem criar conta
- ✅ Todos os dados salvos localmente no navegador
- ✅ Indicador visual mostra "Dados apenas neste navegador"
- ⚠️ Aviso que dados podem ser perdidos ao limpar cache

#### Conectar conta:

- 🔗 Botão "Conectar Conta" na tela de Configurações
- 🔐 Login com Google (OAuth) - rápido e seguro
- ⬆️ Upload automático dos dados locais para a nuvem
- ✅ Confirmação visual de sucesso
- 🔄 Badge muda para "Sincronizado"

#### Depois de conectar:

- ☁️ Backup automático de todos os dados na AWS
- 🔄 Sincronização automática entre dispositivos
- 📱 Acessa os mesmos dados do celular, tablet, outro PC
- 💾 Dados locais continuam funcionando offline
- 🔌 Quando volta online, sincroniza automaticamente

### Casos de uso:

**Caso 1: João usa no trabalho**

1. João descobre o Tempest e começa a usar no PC do trabalho
2. Adiciona despesas do mês sem criar conta
3. No final da semana, decide conectar sua conta Google
4. Todos os dados que ele criou sobem automaticamente
5. Em casa, abre o Tempest no notebook pessoal
6. Faz login com a mesma conta Google
7. Vê todas as despesas que adicionou no trabalho

**Caso 2: Maria usa offline**

1. Maria está viajando sem internet
2. Adiciona despesas do dia no app (funciona offline)
3. Quando conecta no WiFi do hotel
4. App sincroniza automaticamente com a nuvem
5. Dados ficam seguros mesmo sem internet constante

**Caso 3: Pedro quer backup**

1. Pedro usa o app há 3 meses sem conta
2. Tem medo de perder todos os dados
3. Clica em "Conectar Conta"
4. Login com Google em 10 segundos
5. Todos os 3 meses de dados fazem backup automaticamente
6. Dorme tranquilo sabendo que dados estão seguros

### Indicadores visuais:

**Status de sincronização:**

- 🟡 "Apenas neste navegador" (não conectado)
- 🔵 "Sincronizando..." (upload/download)
- 🟢 "Sincronizado" (tudo ok)
- 🔴 "Erro de sincronização" (sem internet ou erro)

**Badge no rodapé:**

- Antes: "💾 localStorage"
- Depois: "☁️ AWS Cloud (usuario@gmail.com)"

---

## 🔄 Fase 2: Sincronização Inteligente

**Status:** ⏳ Futura

### O que o usuário pode fazer:

#### Resolução de conflitos:

- 📊 App detecta automaticamente conflitos
- 🤔 Mostra diferenças quando houver dados diferentes
- ✅ Permite escolher qual versão manter
- 🔀 Ou fazer merge manual de dados específicos

#### Controles de sincronização:

- ⏸️ Pausar sincronização temporariamente
- 🔄 Forçar sincronização manual
- 📅 Ver histórico de sincronizações
- 🗑️ Limpar dados remotos (manter apenas local)

#### Performance:

- ⚡ Sincronização em background (não trava o app)
- 📦 Upload/download em lotes (mais rápido)
- 🎯 Sincroniza apenas o que mudou (delta sync)

### Casos de uso:

**Caso 1: Conflito de edição**

1. Maria edita uma despesa no celular (offline)
2. No notebook, edita a mesma despesa diferente
3. Quando sincroniza, app detecta conflito
4. Mostra: "Você editou 'Supermercado' em 2 dispositivos"
5. Exibe as duas versões lado a lado
6. Maria escolhe qual manter ou combina ambas

**Caso 2: Sincronização seletiva**

1. João tem internet limitada no celular
2. Vai em Configurações > Sincronização
3. Escolhe "Sincronizar apenas via WiFi"
4. App respeita a preferência
5. Faz queue de mudanças offline
6. Sincroniza tudo quando conecta no WiFi

**Caso 3: Limpeza de dados**

1. Pedro decide parar de usar a nuvem
2. Vai em Configurações > Desconectar Conta
3. Escolhe: "Manter dados na nuvem" ou "Deletar tudo da nuvem"
4. Dados locais permanecem intactos
5. Volta a usar apenas localStorage

---

## 👥 Fase 3: Compartilhamento Multi-Usuário

**Status:** 🔮 Planejada para futuro distante

### O que o usuário pode fazer:

#### Criar espaço compartilhado:

- 🏠 Criar "Espaço" (ex: "Finanças do Casal")
- 📧 Convidar pessoas por email
- 🎫 Gerar link de convite
- ✅ Aceitar/rejeitar convites recebidos

#### Gerenciar membros:

- 👑 Definir roles: Admin, Membro, Visualizador
- ➕ Adicionar/remover membros
- 🔒 Controlar permissões individuais
- 📊 Ver quem está ativo no momento

#### Colaboração em tempo real:

- 👀 Ver quando outra pessoa está editando
- 💬 Comentários em despesas (opcional)
- 📜 Histórico: "João adicionou Supermercado há 5min"
- 🔔 Notificações de mudanças importantes

### Permissões por role:

**Admin:**

- ✅ Criar/editar/deletar tudo
- ✅ Convidar/remover membros
- ✅ Alterar configurações do espaço
- ✅ Ver histórico completo

**Membro:**

- ✅ Criar/editar/deletar despesas
- ✅ Ver todos os dados
- ❌ Não pode convidar pessoas
- ❌ Não pode remover membros

**Visualizador:**

- ✅ Ver todos os dados
- ✅ Exportar relatórios
- ❌ Não pode editar nada
- ❌ Não pode adicionar despesas

### Casos de uso:

**Caso 1: Casal gerenciando finanças**

1. Maria conecta sua conta Google
2. Cria espaço "Finanças da Família"
3. Convida João por email
4. João recebe email e aceita convite
5. Ambos veem as mesmas despesas
6. João adiciona conta de luz no celular
7. Maria vê a adição instantaneamente no notebook
8. No final do mês, analisam gastos juntos

**Caso 2: Família com filhos**

1. Pai cria espaço "Finanças Família Silva"
2. Convida mãe como Admin
3. Convida filho de 18 anos como Membro
4. Convida filho de 15 anos como Visualizador
5. Pais gerenciam contas principais
6. Filho de 18 adiciona suas despesas pessoais
7. Filho de 15 apenas visualiza (aprendizado financeiro)
8. Todos têm visibilidade, controle apropriado

**Caso 3: Freelancer + Contador**

1. Freelancer cria espaço "Despesas Profissionais"
2. Convida contador como Visualizador
3. Contador acessa mensalmente para declaração
4. Contador não pode alterar dados
5. Freelancer mantém controle total
6. Colaboração sem dar acesso total

**Caso 4: Separação/Remoção**

1. Casal decide se separar
2. Admin vai em Membros > Remover Parceiro
3. Sistema pergunta: "Copiar dados para conta do parceiro?"
4. Se sim, cria cópia separada para cada um
5. Ambos continuam com histórico completo
6. Agora gerenciam finanças independentemente

### Indicadores visuais:

**Presença em tempo real:**

- 👤 "João está online" (verde)
- ✏️ "Maria está editando Despesas" (azul)
- 💤 "Pedro viu há 2 horas" (cinza)

**Histórico de atividades:**

```
🕐 Hoje, 14:32 - João adicionou "Supermercado" (R$ 245,80)
🕐 Hoje, 11:15 - Maria editou "Aluguel" (R$ 2.500 → R$ 2.550)
🕐 Ontem - Você criou categoria "Pets"
```

---

## 🚦 Status das Fases

| Fase                         | Status             | Prioridade | Estimativa  |
| ---------------------------- | ------------------ | ---------- | ----------- |
| **Fase 1: Opt-in Sync**      | 🟡 Planejada       | Alta       | 2-3 semanas |
| **Fase 2: Sync Inteligente** | ⏳ Futura          | Média      | 1-2 semanas |
| **Fase 3: Compartilhamento** | 🔮 Futuro distante | Baixa      | 3-4 semanas |

---

## 🎯 Benefícios por Fase

### Fase 1 (Opt-in):

- ✅ Usuários experimentam sem compromisso
- ✅ Zero fricção no onboarding
- ✅ Backup automático para quem quiser
- ✅ Multi-device básico funciona

### Fase 2 (Sync Inteligente):

- ✅ Conflitos resolvidos automaticamente
- ✅ Performance otimizada
- ✅ Controle granular de sincronização
- ✅ Experiência mais robusta

### Fase 3 (Compartilhamento):

- ✅ Casais gerenciam finanças juntos
- ✅ Famílias têm visibilidade compartilhada
- ✅ Colaboração em tempo real
- ✅ Permissões flexíveis

---

## 🔐 Considerações Importantes

### Privacidade:

- 🔒 Dados financeiros são sensíveis
- 📜 Consent explícito antes de upload
- 🗑️ Opção de deletar tudo da nuvem
- 📊 LGPD compliance em todas as fases

### Segurança:

- 🔐 OAuth com Google (sem senhas)
- 🔒 HTTPS obrigatório
- 🛡️ Tokens seguros
- 📝 Audit log em compartilhamento

### Performance:

- ⚡ App sempre responsivo
- 🔌 Offline-first (sincroniza quando pode)
- 💾 Cache local para velocidade
- 📦 Upload/download em background

---

## 📋 Checklist de Implementação

### Fase 1:

- [ ] Configurar Google OAuth no Amplify
- [ ] Criar botão "Conectar Conta" em Settings
- [ ] Implementar upload inicial de dados
- [ ] Criar indicadores de status de sync
- [ ] Testar sincronização entre dispositivos
- [ ] Documentar para usuários

### Fase 2:

- [ ] Implementar detecção de conflitos
- [ ] Criar UI de resolução de conflitos
- [ ] Adicionar controles de sincronização
- [ ] Implementar delta sync
- [ ] Otimizar performance de sync
- [ ] Testes de sincronização offline

### Fase 3:

- [ ] Modelar schema de Household
- [ ] Criar sistema de convites
- [ ] Implementar permissões granulares
- [ ] Adicionar real-time updates
- [ ] Criar UI de gerenciamento de membros
- [ ] Testes de colaboração multi-usuário

---

**Última atualização:** 2026-02-05
**Próxima revisão:** Após conclusão da Fase 1
