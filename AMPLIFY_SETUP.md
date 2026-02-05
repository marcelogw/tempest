# Guia de Configuração do AWS Amplify - Tempest

Este guia explica como configurar o backend AWS Amplify para o aplicativo Tempest.

## 📋 Pré-requisitos

1. **Conta AWS** - Você precisa de uma conta AWS (gratuita)
2. **AWS CLI configurado** - Credenciais AWS configuradas localmente
3. **Node.js 18+** - Para executar o Amplify CLI

## 🚀 Configuração Inicial

### Passo 1: Configurar Credenciais AWS

Se ainda não tiver credenciais AWS configuradas:

```bash
# Instalar AWS CLI (se necessário)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais
aws configure
```

Você precisará fornecer:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (recomendado: `us-east-1`)
- Default output format: `json`

### Passo 2: Iniciar o Sandbox do Amplify

O sandbox cria um ambiente de desenvolvimento pessoal na AWS:

```bash
npx ampx sandbox
```

**O que acontece:**

- ✅ Cria DynamoDB tables para dados
- ✅ Configura Amazon Cognito para autenticação
- ✅ Configura AWS AppSync (GraphQL API)
- ✅ Gera `amplify_outputs.json` com configurações
- ✅ Ativa hot-reload para mudanças no schema

**Primeira execução:**

- Pode levar 5-10 minutos
- Você verá logs de criação de recursos
- Aguarde até ver "Watching for file changes..."

### Passo 3: Verificar Configuração

Após o sandbox iniciar, você deve ver:

```
✅ Successfully generated outputs file
📝 amplify_outputs.json created
🔄 Watching for file changes...
```

### Passo 4: Testar a Aplicação

1. Mantenha o sandbox rodando em um terminal
2. Em outro terminal, inicie o Next.js:

```bash
npm run dev
```

3. Acesse http://localhost:3000
4. Você verá a tela de autenticação do Tempest

## 🗄️ Schema de Dados

O schema está definido em `amplify/data/resource.ts` e inclui:

### Modelos Principais

- **Category** - Categorias de despesas configuráveis
- **CreditCard** - Cartões de crédito para parcelamentos
- **MonthlyData** - Container de dados mensais (receitas, investimentos, economia)
- **Income** - Entradas de receita (salário, bônus, etc.)
- **Expense** - Despesas (fixas e variáveis)
- **Installment** - Parcelamentos de cartão de crédito

### Relações

```
MonthlyData (1) -----> (N) Income
            (1) -----> (N) Expense

Category (1) -----> (N) Expense

CreditCard (1) -----> (N) Installment
           (1) -----> (N) Expense (via Installment)
```

## 🔐 Autenticação

### Criar Conta

1. Acesse a aplicação
2. Clique em "Criar Conta"
3. Insira email e senha (mínimo 8 caracteres)
4. Confirme o código enviado para seu email
5. Faça login automaticamente

### Login

1. Use o email e senha cadastrados
2. O sistema redirecionará para a aplicação

### Autorização

Todos os modelos usam `allow.owner()`, o que significa:

- ✅ Cada usuário vê apenas seus próprios dados
- ✅ Isolamento completo entre usuários
- ✅ Dados seguros na AWS

## 🛠️ Desenvolvimento

### Modificar o Schema

1. Edite `amplify/data/resource.ts`
2. O sandbox detecta mudanças automaticamente
3. Aguarde a mensagem "Deployment successful"
4. O schema é atualizado sem perder dados (quando possível)

### Exemplo: Adicionar Campo

```typescript
// amplify/data/resource.ts
Expense: a.model({
  // ... campos existentes
  tags: a.string().array(), // Novo campo
})
```

### Acessar Dados no Cliente

```typescript
import { useAmplifyData } from '@/lib/use-amplify-data'

function MyComponent() {
  const client = useAmplifyData()

  // Criar despesa
  const createExpense = async () => {
    await client.models.Expense.create({
      description: 'Supermercado',
      amount: 250.5,
      categoryId: 'mercado',
      type: 'variable',
      date: '2026-02-05',
      monthlyDataId: 'month-id',
    })
  }

  // Listar despesas
  const listExpenses = async () => {
    const { data } = await client.models.Expense.list()
    console.log(data)
  }

  // ...
}
```

## 📊 Console AWS

Você pode visualizar os dados diretamente na AWS:

1. **DynamoDB** - https://console.aws.amazon.com/dynamodb
   - Veja as tabelas criadas (prefixadas com seu sandbox ID)

2. **Cognito** - https://console.aws.amazon.com/cognito
   - Gerencie usuários e autenticação

3. **AppSync** - https://console.aws.amazon.com/appsync
   - Explore a API GraphQL

## 🔄 Migração de Dados Locais

Para migrar dados do Zustand (localStorage) para Amplify:

```typescript
// Exemplo de script de migração
import { useExpenseStore } from '@/lib/expense-store'
import { useAmplifyData } from '@/lib/use-amplify-data'

async function migrateToAmplify() {
  const localStore = useExpenseStore.getState()
  const client = useAmplifyData()

  // Migrar categorias
  for (const category of localStore.categories) {
    await client.models.Category.create({
      categoryId: category.id,
      label: category.label,
      color: category.color,
      icon: category.icon,
      isSystem: category.isSystem,
      order: category.order,
    })
  }

  // Migrar cartões
  for (const card of localStore.creditCards) {
    await client.models.CreditCard.create({
      cardId: card.id,
      name: card.name,
      color: card.color,
      limit: card.limit,
      order: card.order,
    })
  }

  // Migrar dados mensais...
  // (implementar conforme necessário)
}
```

## 🚨 Troubleshooting

### Erro: "Auth is not configured"

**Solução:** O sandbox ainda não foi iniciado ou `amplify_outputs.json` não existe.

```bash
npx ampx sandbox
```

### Erro: "No credentials"

**Solução:** Configure as credenciais AWS:

```bash
aws configure
```

### Sandbox não inicia

**Solução:** Verifique se as credenciais AWS têm permissões:

- Necessário: CloudFormation, DynamoDB, Cognito, AppSync, S3

### Mudanças no schema não aplicam

**Solução:** Reinicie o sandbox:

```bash
# Ctrl+C no terminal do sandbox
npx ampx sandbox --clean  # Remove recursos antigos
```

## 💰 Custos

**Desenvolvimento Local (Sandbox):**

- ✅ Gratuito dentro do AWS Free Tier
- DynamoDB: 25 GB de armazenamento
- Cognito: 50.000 usuários ativos/mês
- AppSync: 250.000 queries/mês

**Produção:**

- Usar `npx ampx deploy` para ambiente de produção
- Custos variam com uso (consultar AWS Pricing)

## 🧹 Limpeza

Para remover todos os recursos do sandbox:

```bash
npx ampx sandbox delete
```

Isso remove:

- Todas as tabelas DynamoDB
- User pool do Cognito
- API GraphQL
- Dados armazenados

## 📚 Recursos Adicionais

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Amplify Data (GraphQL)](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [Amplify Auth](https://docs.amplify.aws/gen2/build-a-backend/auth/)
- [AWS Free Tier](https://aws.amazon.com/free/)

## ✅ Checklist de Setup

- [ ] AWS CLI instalado e configurado
- [ ] `npx ampx sandbox` executado com sucesso
- [ ] `amplify_outputs.json` gerado
- [ ] Aplicação Next.js rodando (`npm run dev`)
- [ ] Tela de autenticação visível
- [ ] Conta criada e login funcionando
- [ ] Dados salvos e recuperados da AWS
