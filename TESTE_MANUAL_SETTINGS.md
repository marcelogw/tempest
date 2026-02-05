# 📋 Guia de Teste Manual - Tela de Configurações

## 🚀 Preparação

1. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000`

---

## ✅ TESTE 1: Navegação para Configurações

### Passos:

1. Verifique que a sidebar está visível
2. Localize o item **"Configurações"** com ícone de engrenagem (⚙️)
3. Clique em "Configurações"

### Resultado Esperado:

- ✅ View de configurações é exibida
- ✅ Header mostra "Configurações"
- ✅ Descrição: "Gerencie seus dados e preferências do sistema"
- ✅ Card "Gerenciamento de Dados" é visível
- ✅ Duas seções dentro do card:
  - "Deletar dados de um ano"
  - "Zona de Perigo" (com borda vermelha)

---

## ✅ TESTE 2: Deletar Dados de um Ano Específico

### Passos:

1. Na seção "Deletar dados de um ano":
2. Clique no dropdown "Escolha um ano..."
3. Verifique que anos aparecem (ex: 2026, 2025, 2024...)
4. Selecione um ano (ex: 2024)
5. Botão "Deletar Ano" deve ficar habilitado
6. Clique em "Deletar Ano"

### Resultado Esperado:

- ✅ Dialog de confirmação abre com título: "Confirmar Exclusão do Ano 2024"
- ✅ Mostra detalhes do que será deletado:
  - • Todas as receitas de 2024
  - • Todas as despesas fixas e variáveis
  - • Todos os parcelamentos iniciados neste ano
- ✅ Aviso em vermelho: "Esta ação não pode ser desfeita."
- ✅ Botões: "Cancelar" e "Excluir Ano" (vermelho)

### Passos (continuação):

7. Clique em "Excluir Ano"

### Resultado Esperado:

- ✅ Dialog fecha
- ✅ Toast notification aparece: "Dados deletados - Todos os dados de 2024 foram removidos com sucesso."
- ✅ Dropdown é resetado (vazio)

### Verificação de Integridade:

8. Navegue para "Painel" (Dashboard)
9. Verifique que não há dados de 2024 nos gráficos
10. Volte para "Configurações"
11. Abra o dropdown de anos novamente
12. Verifique que 2024 NÃO aparece mais na lista

---

## ✅ TESTE 3: Cancelar Exclusão de Ano

### Passos:

1. Selecione um ano no dropdown
2. Clique em "Deletar Ano"
3. No dialog, clique em "Cancelar"

### Resultado Esperado:

- ✅ Dialog fecha
- ✅ NENHUM dado é deletado
- ✅ Nenhum toast aparece
- ✅ Ano ainda selecionado no dropdown

---

## ✅ TESTE 4: Botão Desabilitado sem Ano Selecionado

### Passos:

1. Certifique-se que nenhum ano está selecionado (dropdown vazio)
2. Observe o botão "Deletar Ano"

### Resultado Esperado:

- ✅ Botão "Deletar Ano" está desabilitado (opacidade reduzida)
- ✅ Não é possível clicar no botão

---

## ✅ TESTE 5: Zona de Perigo - Deletar Todos os Dados

### Passos:

1. Localize a seção "Zona de Perigo" (borda vermelha)
2. Observe o ícone de alerta (⚠️) e texto em vermelho
3. Clique em "Deletar Todos os Dados"

### Resultado Esperado:

- ✅ Dialog abre com título em vermelho: "⚠️ Atenção: Deletar Todos os Dados"
- ✅ Texto destaca "IRREVERSÍVEL" em vermelho
- ✅ Lista detalhada do que será deletado:
  - • Todos os dados de receitas e despesas
  - • Todos os parcelamentos
  - • Todas as configurações de categorias
  - • Todas as configurações de cartões de crédito
- ✅ Campo de input com placeholder: "Digite DELETAR TUDO"
- ✅ Botão "Deletar Tudo" está DESABILITADO

---

## ✅ TESTE 6: Validação de Texto de Confirmação

### Passos:

1. Com o dialog aberto, digite texto incorreto: "deletar"
2. Observe o botão "Deletar Tudo"

### Resultado Esperado:

- ✅ Botão permanece desabilitado
- ✅ Opacidade reduzida

### Passos (continuação):

3. Digite: "DELETAR"
4. Observe o botão

### Resultado Esperado:

- ✅ Botão ainda desabilitado (precisa ser EXATAMENTE "DELETAR TUDO")

### Passos (continuação):

5. Digite exatamente: "DELETAR TUDO"
6. Observe o botão

### Resultado Esperado:

- ✅ Botão fica habilitado
- ✅ Opacidade normal, pode clicar

---

## ✅ TESTE 7: Executar Deleção Total

### ⚠️ ATENÇÃO: Este teste apaga TODOS os dados!

### Passos:

1. Digite "DELETAR TUDO" no campo de confirmação
2. Clique em "Deletar Tudo"

### Resultado Esperado:

- ✅ Dialog fecha
- ✅ Toast aparece: "Todos os dados foram deletados - O aplicativo foi resetado para o estado inicial."
- ✅ Campo de input é limpo

### Verificação de Integridade:

3. Navegue para "Painel"
4. Verifique que não há dados (gráficos vazios)
5. Navegue para "Visão Mensal"
6. Verifique que não há receitas, despesas, investimentos
7. Navegue para "Categorias"
8. Verifique que categorias padrão ainda existem (não são deletadas)
9. Navegue para "Cartões"
10. Verifique que não há cartões cadastrados
11. Volte para "Configurações"
12. Dropdown de anos deve mostrar apenas ano atual (2026)

---

## ✅ TESTE 8: Cancelar Deleção Total

### Passos:

1. Clique em "Deletar Todos os Dados"
2. Digite "DELETAR TUDO"
3. Clique em "Cancelar"

### Resultado Esperado:

- ✅ Dialog fecha
- ✅ NENHUM dado é deletado
- ✅ Campo de texto é limpo (volta vazio)
- ✅ Dados permanecem intactos

---

## ✅ TESTE 9: Responsividade

### Passos:

1. Redimensione a janela do navegador para mobile (< 640px)
2. Observe o botão "Deletar Todos os Dados"

### Resultado Esperado:

- ✅ Botão ocupa largura total (`w-full`) em mobile
- ✅ Layout permanece legível e usável

### Passos (continuação):

3. Redimensione para desktop (> 640px)
4. Observe o botão

### Resultado Esperado:

- ✅ Botão volta ao tamanho automático (`w-auto`)

---

## ✅ TESTE 10: Persistência de Dados (LocalStorage)

### Passos:

1. Delete dados de um ano específico
2. Feche o navegador completamente
3. Abra novamente `http://localhost:3000`
4. Navegue para Configurações
5. Verifique o dropdown de anos

### Resultado Esperado:

- ✅ Ano deletado não aparece mais
- ✅ Dados persistem após reload (Zustand + localStorage)

---

## 📊 Checklist Final

- [ ] Navegação funciona corretamente
- [ ] Dropdown de anos carrega corretamente
- [ ] Deletar ano específico funciona
- [ ] Cancelamento funciona
- [ ] Botões desabilitados quando apropriado
- [ ] Validação de texto "DELETAR TUDO" funciona
- [ ] Deleção total funciona
- [ ] Toasts aparecem corretamente
- [ ] Dialogs abrem e fecham corretamente
- [ ] Dados são persistidos no localStorage
- [ ] Layout responsivo funciona
- [ ] Cores e estilos consistentes com o resto do app
- [ ] Textos em português corretos
- [ ] Sem erros no console do navegador

---

## 🎯 Resultado Esperado Geral

✅ **TODOS** os testes devem passar sem erros
✅ Interface responsiva e bonita
✅ Funcionalidade robusta e segura
✅ Validações apropriadas para ações destrutivas
✅ Feedback claro ao usuário via toasts
✅ Persistência correta de dados
