# Regras dos Simulados e Motor de Avaliação

## 1. Modalidades Disponíveis

1. **Simulado Completo Oficial (CTFL v4.0)**:
   - **Total de questões**: 40 questões de múltipla escolha (4 alternativas `A`, `B`, `C`, `D` com exatamente 1 correta).
   - **Duração padrão**: 60 minutos (`3.600` segundos).
   - **Extensão de tempo para idioma não-nativo**: +25% (`75` minutos / `4.500` segundos) quando habilitado pelo estudante.
   - **Pontuação**: 1 ponto por questão correta, sem penalidade para respostas erradas ou em branco.
   - **Critério de aprovação**: Mínimo de **26 pontos (65%)**.
   - **Distribuição obrigatória por capítulo**:
     - Capítulo 1 (Fundamentos de Teste): **8 questões**
     - Capítulo 2 (Teste ao Longo do SDLC): **6 questões**
     - Capítulo 3 (Teste Estático): **4 questões**
     - Capítulo 4 (Análise e Projeto de Teste): **12 questões**
     - Capítulo 5 (Gerenciamento das Atividades de Teste): **8 questões**
     - Capítulo 6 (Ferramentas de Teste): **2 questões**

2. **Simulado por Capítulo**:
   - Permite treinar exclusivamente um dos 6 capítulos oficiais, respeitando a proporção de tempo por questão (90 segundos por questão) e meta de 65%.

3. **Simulado Personalizado**:
   - Permite filtrar por tópico específico do Syllabus, nível de dificuldade (`EASY`, `MEDIUM`, `HARD`) e quantidade de questões (`5`, `10`, `15` ou `20`).

---

## 2. Algoritmo de Seleção e Snapshots Imutáveis

- Apenas questões com status `PUBLISHED` e `deletedAt: null` são elegíveis.
- O motor prioriza questões inéditas para o estudante; caso o estudante já tenha respondido parte do banco, reutiliza questões anteriores de forma controlada e sinaliza no cabeçalho da prova (`usedRepeatedQuestions = true`).
- Questões pertencentes ao mesmo `equivalenceGroupId` nunca são sorteadas juntas na mesma tentativa.
- As alternativas são embaralhadas no momento da geração da tentativa (exceto quando contêm referências posicionais), e o gabarito correspondente (`correctDisplayLabel`) é gravado no snapshot de `ExamQuestion`.
- **Sigilo de Gabarito**: Enquanto `ExamAttempt.status === 'IN_PROGRESS'`, nenhuma rota ou componente retorna `correctDisplayLabel`, `isCorrect` ou `explanation`.
