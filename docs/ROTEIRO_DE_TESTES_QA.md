# Roteiro Completo de Testes QA — CTFL Academy (Tela por Tela)

Este guia foi estruturado para você testar **100% das telas, fluxos de negócio, regras do Syllabus 4.0.1 e segurança** da plataforma, do início ao fim.

---

## 🛠️ Pré-Requisitos e Scripts de Usuários para Teste

Antes de iniciar os testes, com o servidor rodando (`.\rodar.bat`), você pode gerenciar usuários de teste a qualquer momento pelo menu interativo:

```powershell
.\usuarios.bat
```

Ou diretamente via linha de comando:

- **Listar usuários:**
  ```powershell
  npm run user:list
  ```
- **Adicionar usuário (Estudante ou Admin):**
  ```powershell
  npm run user:add -- --name="Victor QA" --email=victor.qa@ctfl.local --password=TesteQA2026! --role=STUDENT
  ```
- **Editar usuário (alterar nome, senha, XP, streak ou promover para ADMIN):**
  ```powershell
  npm run user:edit -- --email=victor.qa@ctfl.local --role=ADMIN --xp=500 --streak=7
  ```
- **Excluir usuário (Hard delete — permite recadastrar o mesmo e-mail nos testes):**
  ```powershell
  npm run user:delete -- --email=victor.qa@ctfl.local --mode=hard --yes
  ```

---

## PARTE 1 — Área Pública e Autenticação

### 1. Landing Page (`/`)
- [ ] **CT-01.1:** Acessar `http://localhost:3000/` deslogado e verificar o carregamento do cabeçalho, seção Hero, resumo dos 6 capítulos do Syllabus 4.0.1, indicadores do banco de questões e rodapé.
- [ ] **CT-01.2:** Clicar no botão de alternância de tema (Sol/Lua) no topo e validar a transição entre **Modo Escuro** (padrão) e **Modo Claro**.
- [ ] **CT-01.3:** Testar os botões de CTA ("Começar Agora", "Explorar Conteúdo") e links de navegação para `/sobre`, `/login` e `/cadastro`.

### 2. Páginas Institucionais e Legais (`/sobre`, `/privacidade`, `/termos`)
- [ ] **CT-02.1:** Acessar `/sobre` e verificar a estrutura do exame oficial ISTQB CTFL 4.0.1 (40 questões, 60 min, mínimo 26 acertos / 65%, níveis cognitivos K1/K2/K3).
- [ ] **CT-02.2:** Acessar `/privacidade` e `/termos` pelo rodapé e verificar a renderização completa e navegação de retorno.

### 3. Página 404 Personalizada (Qualquer rota inexistente, ex.: `/rota-inexistente`)
- [ ] **CT-03.1:** Acessar `http://localhost:3000/pagina-que-nao-existe` e validar a tela 404 personalizada com botão de retorno para o início.

### 4. Cadastro de Conta (`/cadastro`)
- [ ] **CT-04.1 (Validação de campos):** Tentar enviar o formulário vazio, com senha menor que 8 caracteres ou confirmação de senha divergente → Deve exibir mensagens claras de validação (Zod + React Hook Form).
- [ ] **CT-04.2 (Caminho feliz):** Cadastrar novo estudante (ex.: `aluno.teste@ctfl.local` / `SenhaForte123!`) → Deve criar a conta no banco, autenticar automaticamente e redirecionar para `/dashboard`.
- [ ] **CT-04.3 (E-mail duplicado):** Tentar cadastrar novamente o mesmo e-mail → Deve impedir o cadastro com mensagem de erro amigável.

### 5. Login (`/login`) e Logout
- [ ] **CT-05.1 (Credenciais inválidas):** Tentar logar com senha incorreta → Deve exibir erro "Credenciais inválidas" sem expor detalhes internos.
- [ ] **CT-05.2 (Login Estudante):** Fazer login com a conta criada → Deve redirecionar para `/dashboard` e ocultar a seção "Administração & Curadoria" na sidebar.
- [ ] **CT-05.3 (Logout):** Clicar em "Sair da Conta" no rodapé da sidebar → Deve encerrar a sessão e redirecionar para `/login`.

### 6. Recuperação de Senha (`/recuperar-senha`)
- [ ] **CT-06.1:** Informar um e-mail válido e submeter → Deve exibir confirmação de envio de instruções sem revelar se o e-mail existe ou não (prevenção de enumeração de usuários).

---

## PARTE 2 — Jornada Completa do Estudante

### 7. Dashboard do Estudante (`/dashboard`)
- [ ] **CT-07.1 (Estado inicial / Conta nova):** Verificar saudação personalizada com o nome do usuário, cards de métricas zerados (`0%` progresso, `0` questões, `0` simulados, `0 XP`, `0d` streak) e call-to-action orientando por onde começar os estudos.
- [ ] **CT-07.2 (Sidebar com scroll independente):** Rolar o menu lateral (Sidebar) e verificar que ele rola de forma independente da página principal, com barra de rolagem discreta/invisível.
- [ ] **CT-07.3 (Pós-estudo):** Voltar ao Dashboard após concluir aulas, exercícios e simulados e conferir se todas as métricas, sequência de dias (streak), sugestões de revisão e o botão **"Continuar de onde parou"** atualizaram em tempo real.

### 8. Lista de Capítulos (`/capitulos`)
- [ ] **CT-08.1:** Verificar a listagem dos **6 capítulos oficiais** do Syllabus 4.0.1 com peso na prova (ex.: Cap. 1 = 8 questões, Cap. 4 = 12 questões), quantidade de tópicos e barra de progresso individual.

### 9. Página Individual do Capítulo (`/capitulos/[slug]`)
- [ ] **CT-09.1:** Clicar no **Capítulo 1 (Fundamentos de Teste)** (`/capitulos/fundamentos-de-teste`) e verificar:
  - Introdução e resumo dos Objetivos de Aprendizagem (LOs).
  - Lista de tópicos numerados (1.1 a 1.5) com nível cognitivo (`K1`, `K2`, `K3`).
  - Atalhos rápidos para Exercícios do Capítulo, Flashcards e Simulado do Capítulo.

### 10. Tópico e Visualização de Aula (`/capitulos/[slug]/topicos/[topicSlug]`)
- [ ] **CT-10.1:** Abrir o tópico `1.1 O que é Teste?` e verificar a renderização completa da aula:
  - Explicação técnica didática, definições do glossário ISTQB, exemplos práticos e aplicação na rotina de QA.
  - Resumo para revisão rápida e lista de questões de fixação vinculadas ao tópico.
- [ ] **CT-10.2 (Marcar aula como concluída):** Clicar no botão **"Marcar Aula como Concluída"**:
  - Deve exibir feedback de sucesso (toast), somar **+30 XP** no topo da tela, atualizar a sequência de dias (`1d`) e marcar a aula como concluída.

### 11. Exercícios de Fixação (`/exercicios`)
- [ ] **CT-11.1 (Filtros):** Filtrar questões por Capítulo (ex.: Cap. 4), Nível Cognitivo (`K3`), Dificuldade (`MEDIUM` / `HARD`) ou busca por texto.
- [ ] **CT-11.2 (Resolução e Feedback imediato):** Selecionar uma alternativa (A, B, C ou D) e clicar em **"Confirmar Resposta"**:
  - Deve destacar imediatamente a alternativa correta em verde (e a errada em vermelho, se tiver errado).
  - Deve exibir a **Explicação técnica do gabarito**, a **justificativa individual de cada alternativa** e a referência ao objetivo de aprendizagem (`FL-x.x.x`).
  - Caso acerte, deve conceder XP e atualizar o contador no cabeçalho.

### 12. Estudo de Flashcards com Repetição Espaçada (`/flashcards`)
- [ ] **CT-12.1 (Filtro por capítulo):** Filtrar os cartões por capítulo ou estudar todos os pendentes de revisão.
- [ ] **CT-12.2 (Virar cartão e classificar):** Clicar no cartão para revelar o verso (definição oficial) e avaliar a dificuldade clicando em **Difícil**, **Médio** ou **Fácil**:
  - Deve registrar a revisão no banco, agendar a próxima data de revisão, conceder **+5 XP** e avançar para o próximo cartão.

### 13. Central de Simulados (`/simulados`)
- [ ] **CT-13.1:** Verificar as 3 modalidades disponíveis:
  1. **Simulado Oficial Completo** (40 questões, 60 minutos, distribuição oficial por capítulo).
  2. **Simulado por Capítulo** (focado em um capítulo específico, ex.: 10 questões).
  3. **Treino Personalizado** (escolha de capítulo, nível cognitivo K1/K2/K3 e quantidade de questões).
- [ ] **CT-13.2:** Iniciar um **Simulado por Capítulo** ou **Simulado Oficial Completo** → Deve criar a tentativa no banco e redirecionar para `/simulados/[id]`.

### 14. Execução do Simulado (`/simulados/[id]`)
- [ ] **CT-14.1 (Cronômetro e Persistência):** Verificar o cronômetro regressivo no topo. Selecionar uma alternativa na Questão 1 e recarregar a página (`F5`) → A resposta selecionada e o tempo restante devem permanecer salvos!
- [ ] **CT-14.2 (Marcar para revisão e Mapa de Questões):** Clicar em **"Marcar para Revisão"** em uma questão → O botão da questão no mapa lateral deve mudar de cor indicando pendência de revisão.
- [ ] **CT-14.3 (Finalização com confirmação):** Clicar em **"Finalizar Simulado"** → Deve abrir o modal de confirmação informando quantas questões foram respondidas e quantas estão em branco/marcadas. Confirmar o envio.

### 15. Resultado do Simulado (`/simulados/[id]/resultado`)
- [ ] **CT-15.1:** Validar o relatório pós-prova:
  - Nota percentual, quantidade de acertos/erros e status (**APROVADO** se $\ge 65\%$ ou **REPROVADO** se $< 65\%$).
  - Tempo total gasto.
  - Desempenho detalhado **por Capítulo** (barras de progresso) e **por Nível Cognitivo (K1, K2, K3)**.
  - Revisão questão por questão com a alternativa marcada pelo aluno, o gabarito correto e a justificativa completa.
  - Botão **"Refazer Simulado"** funcionando.

### 16. Histórico de Tentativas (`/historico`)
- [ ] **CT-16.1:** Verificar a listagem de todos os simulados realizados (ou em andamento), com data, modo, nota, status e link para abrir o relatório detalhado ou retomar simulado em andamento.

### 17. Caderno de Erros / Revisão de Questões Erradas (`/revisao-erros`)
- [ ] **CT-17.1:** Caso tenha errado alguma questão nos exercícios ou simulados, acessar `/revisao-erros` e verificar que a questão aparece listada.
- [ ] **CT-17.2:** Responder novamente a questão na tela de Revisão de Erros até acertar → Ao acertar, a questão sai da fila de erros pendentes!

### 18. Progresso por Capítulo (`/progresso`)
- [ ] **CT-18.1:** Conferir a matriz de progresso consolidando aulas concluídas, acurácia em questões por capítulo e prontidão estimada para o exame CTFL.

### 19. Conquistas e Gamificação (`/conquistas`)
- [ ] **CT-19.1:** Verificar o painel de nível atual, XP acumulado e os cards de medalhas/conquistas (desbloqueadas vs. bloqueadas, como *Primeiro Passo*, *Mestre dos Fundamentos*, *Simulador Dedicado*, *Aprovado CTFL*).

### 20. Perfil, Preferências e Exclusão de Conta (`/perfil`)
- [ ] **CT-20.1 (Preferências):** Alterar o Nome Completo, Meta Diária de Estudo (ex.: 45 min), Tema Preferido e a opção **Bônus de Idioma Não-Nativo (+25% de tempo = 75 min no simulado oficial)** → Clicar em Salvar e verificar a persistência.
- [ ] **CT-20.2 (Exclusão segura de conta):** Na zona de perigo, testar a exclusão de conta (com usuário secundário de teste): exige digitar `EXCLUIR MINHA CONTA` e a senha atual → Deve anonimizar/remover os dados e encerrar a sessão.

---

## PARTE 3 — Segurança, Autorização (RBAC) e Governança Admin

### 21. Teste de Segurança RBAC (Estudante tentando acessar `/admin`)
- [ ] **CT-21.1:** Logado como `STUDENT`, tentar acessar `http://localhost:3000/admin` ou chamar `POST /api/admin/questions` → O servidor deve bloquear o acesso (redirecionando no frontend e retornando `403 Forbidden` na API).

### 22. Login como Administrador e Dashboard Admin (`/admin`)
- [ ] **CT-22.1:** Fazer login com `admin@ctfl.local` / `AdminCTFL2026!` (ou promover seu usuário com `npm run user:edit -- --email=... --role=ADMIN`).
- [ ] **CT-22.2:** Verificar que a seção **"Administração & Curadoria"** aparece na sidebar e o botão **"Painel Admin" / "Visão Estudante"** aparece no cabeçalho.
- [ ] **CT-22.3:** Acessar `/admin` e validar os indicadores gerais (total de estudantes, questões por status editorial, simulados realizados, fila de revisão).

### 23. Gerenciamento de Capítulos, Tópicos e Conteúdo (`/admin/capitulos`)
- [ ] **CT-23.1:** Selecionar um capítulo, editar o título/resumo ou abrir uma aula de um tópico, alterar o conteúdo didático em Markdown e salvar → Verificar que a alteração reflete imediatamente na visão do estudante.

### 24. Banco de Questões — CRUD Completo (`/admin/questoes`)
- [ ] **CT-24.1 (Criar Questão):** Clicar em **"Nova Questão"**, preencher enunciado, capítulo, tópico, código LO, nível cognitivo (`K1`/`K2`/`K3`), dificuldade, 4 alternativas (A, B, C, D) marcando apenas 1 correta, explicação geral e fonte → Salvar como `DRAFT`.
- [ ] **CT-24.2 (Editar e Duplicar):** Editar a questão criada (verificar geração automática de revisão de histórico) e testar o botão **"Duplicar"**.

### 25. Fila de Revisão e Fluxo Editorial (`/admin/revisao`)
- [ ] **CT-25.1 (Workflow Editorial):** Testar as transições de estado da questão criada:
  1. Enviar de `DRAFT` (Rascunho) para `IN_REVIEW` (Em Revisão).
  2. Na tela `/admin/revisao`, aprovar a questão (`APPROVED`) ou rejeitar informando parecer (`REJECTED`).
  3. Publicar a questão aprovada (`PUBLISHED`) → Somente questões `PUBLISHED` entram nos simulados e exercícios dos estudantes!

### 26. Gerenciamento de Flashcards (`/admin/flashcards`)
- [ ] **CT-26.1:** Criar um novo flashcard vinculado a um capítulo/tópico, editar e ativar/desativar sua publicação.

### 27. Configuração de Provas e Simulados (`/admin/provas`)
- [ ] **CT-27.1:** Visualizar e editar os parâmetros do exame oficial (tempo padrão de 60 min, nota de corte de 65%, distribuição por capítulos e níveis cognitivos).

### 28. Gerenciamento de Conquistas (`/admin/conquistas`)
- [ ] **CT-28.1:** Criar ou editar uma medalha/conquista definindo ícone, critério (`FIRST_LESSON`, `EXAMS_COMPLETED`, `PASS_EXAM`, etc.), meta numérica e bônus de XP.

### 29. Estatísticas da Plataforma (`/admin/estatisticas`)
- [ ] **CT-29.1:** Conferir as taxas de acerto globais por capítulo, questões com maior índice de erro e engajamento dos alunos.

### 30. Auditoria Administrativa (`/admin/auditoria`)
- [ ] **CT-30.1:** Acessar `/admin/auditoria` e verificar que todas as ações realizadas nos passos anteriores (login, criação/edição/transição de questão, alterações de configuração, criação via CLI) estão registradas com data/hora, ator e detalhes JSON.
