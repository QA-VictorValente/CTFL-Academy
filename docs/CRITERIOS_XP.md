# Critérios de XP, Conquistas e Sequência de Estudos (Streak)

## 1. Tabela Oficial de Pontos de Experiência (XP)

Todas as concessões de XP utilizam uma chave única de idempotência (`XPEvent.idempotencyKey`) gravada em transação no PostgreSQL para impedir ganho artificial por cliques repetidos ou reenvio de requisições:

| Evento (`eventType`) | Pontos | Regra de Idempotência |
| :--- | :--- | :--- |
| `LESSON_COMPLETED` | **+30 XP** | Concedido uma única vez por aula concluída (`LESSON:{userId}:{lessonId}`) |
| `EXERCISE_CORRECT` | **+15 XP** | Concedido na primeira resposta correta por questão no modo exercício (`EXERCISE_CORRECT:{userId}:{questionId}`) |
| `FLASHCARD_REVIEWED` | **+5 XP** | Concedido uma vez por cartão por dia calendário UTC (`FLASHCARD:{userId}:{flashcardId}:{YYYY-MM-DD}`) |
| `EXAM_COMPLETED` | **+80 XP** | Concedido uma única vez por tentativa de simulado finalizada (`EXAM_COMPLETE:{attemptId}`) |
| `EXAM_PASSED` | **+150 XP** | Bônus adicional concedido quando a tentativa atinge aprovação ≥ 65% (`EXAM_PASS:{attemptId}`) |

---

## 2. Cálculo da Sequência Diária (*Streak*)

- Calculada pela função determinística `calculateStudyStreak` em `src/lib/gamification.ts`:
  - Primeiro dia de atividade: `currentStreak = 1`.
  - Múltiplas atividades no mesmo dia calendário (`YYYY-MM-DD`): mantém `currentStreak` inalterado.
  - Atividade no dia imediatamente seguinte (`ontem` → `hoje`): incrementa `currentStreak + 1` e atualiza `longestStreak` se superar o recorde anterior.
  - Intervalo superior a 1 dia sem estudo: reinicia `currentStreak = 1`, preservando `longestStreak`.

---

## 3. Desbloqueio Automático de Conquistas (`Achievement`)

A cada evento de estudo, o servidor avalia automaticamente todas as conquistas ativas e desbloqueia aquelas cujo critério (`ruleType` e `ruleThreshold`) foi atingido, somando a recompensa (`xpReward`) ao perfil do estudante.
