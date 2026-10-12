import { describe, it, expect } from 'vitest';
import {
  selectQuestionsForExam,
  prepareShuffledOptions,
  calculateServerTimer,
  computeExamScore,
  InsufficientQuestionBankError,
  type CandidateQuestion,
} from '@/lib/exam-engine';
import { XP_RULES, calculateStudyStreak } from '@/lib/gamification';
import { computeNextFlashcardReview } from '@/lib/spaced-repetition';
import {
  resolveNextQuestionStatus,
  isQuestionEligibleForExam,
} from '@/lib/question-workflow';
import {
  registerSchema,
  createOrUpdateQuestionSchema,
  deleteAccountSchema,
} from '@/lib/validations';

function buildCandidateQuestion(
  overrides: Partial<CandidateQuestion> & { id: string; chapterNumber: number }
): CandidateQuestion {
  return {
    id: overrides.id,
    code: overrides.code ?? `CODE-${overrides.id}`,
    equivalenceGroupId: overrides.equivalenceGroupId ?? null,
    statement: overrides.statement ?? `Enunciado de teste ${overrides.id} com tamanho suficiente`,
    chapterNumber: overrides.chapterNumber,
    chapterId: overrides.chapterId ?? `ch-${overrides.chapterNumber}`,
    topicId: overrides.topicId ?? `tp-${overrides.chapterNumber}-1`,
    topicCode: overrides.topicCode ?? `${overrides.chapterNumber}.1`,
    learningObjectiveCode:
      overrides.learningObjectiveCode ?? `FL-${overrides.chapterNumber}.1.1`,
    cognitiveLevel: overrides.cognitiveLevel ?? 'K2',
    difficulty: overrides.difficulty ?? 'MEDIUM',
    correctOptionLabel: overrides.correctOptionLabel ?? 'A',
    explanation: overrides.explanation ?? 'Explicação técnica detalhada',
    status: overrides.status ?? 'PUBLISHED',
    version: overrides.version ?? 1,
    deletedAt: overrides.deletedAt ?? null,
    options: overrides.options ?? [
      { label: 'A', content: 'Alternativa correta A', isCorrect: true },
      { label: 'B', content: 'Distrator B', isCorrect: false },
      { label: 'C', content: 'Distrator C', isCorrect: false },
      { label: 'D', content: 'Distrator D', isCorrect: false },
    ],
  };
}

describe('Unidade 1 & 2 — Seleção de Questões e Distribuição Oficial por Capítulo', () => {
  it('seleciona exatamente 40 questões respeitando a matriz oficial CTFL 4.0 (8, 6, 4, 12, 8, 2)', () => {
    const pool: CandidateQuestion[] = [];
    const quotas: Record<number, number> = { 1: 10, 2: 8, 3: 6, 4: 15, 5: 10, 6: 4 };

    for (const [chStr, count] of Object.entries(quotas)) {
      const ch = Number(chStr);
      for (let i = 1; i <= count; i++) {
        pool.push(
          buildCandidateQuestion({
            id: `q-ch${ch}-${i}`,
            chapterNumber: ch,
            topicCode: `${ch}.${(i % 3) + 1}`,
          })
        );
      }
    }

    // Adiciona questões DRAFT e IN_REVIEW que nunca devem entrar no sorteio
    pool.push(
      buildCandidateQuestion({
        id: 'q-draft-1',
        chapterNumber: 1,
        status: 'DRAFT',
      }),
      buildCandidateQuestion({
        id: 'q-review-1',
        chapterNumber: 4,
        status: 'IN_REVIEW',
      })
    );

    const result = selectQuestionsForExam({
      mode: 'FULL',
      allQuestions: pool,
      seenQuestionIds: new Set(),
    });

    expect(result.selectedQuestions).toHaveLength(40);
    expect(result.usedRepeatedQuestions).toBe(false);

    // Verifica que nenhuma questão não publicada entrou
    expect(result.selectedQuestions.every((q) => q.status === 'PUBLISHED')).toBe(
      true
    );

    // Verifica distribuição exata por capítulo
    const countByChapter: Record<number, number> = {};
    for (const q of result.selectedQuestions) {
      countByChapter[q.chapterNumber] = (countByChapter[q.chapterNumber] ?? 0) + 1;
    }

    expect(countByChapter[1]).toBe(8);
    expect(countByChapter[2]).toBe(6);
    expect(countByChapter[3]).toBe(4);
    expect(countByChapter[4]).toBe(12);
    expect(countByChapter[5]).toBe(8);
    expect(countByChapter[6]).toBe(2);
  });

  it('evita selecionar duas questões do mesmo grupo de equivalência na mesma prova', () => {
    const pool: CandidateQuestion[] = [
      buildCandidateQuestion({
        id: 'q1',
        chapterNumber: 1,
        equivalenceGroupId: 'EQ-BVA-01',
      }),
      buildCandidateQuestion({
        id: 'q2',
        chapterNumber: 1,
        equivalenceGroupId: 'EQ-BVA-01',
      }),
      buildCandidateQuestion({
        id: 'q3',
        chapterNumber: 1,
        equivalenceGroupId: 'EQ-EP-02',
      }),
    ];

    const result = selectQuestionsForExam({
      mode: 'CHAPTER',
      allQuestions: pool,
      seenQuestionIds: new Set(),
      targetCount: 2,
    });

    expect(result.selectedQuestions).toHaveLength(2);
    const ids = result.selectedQuestions.map((q) => q.id);
    expect(ids).toContain('q3');
    expect(ids.filter((id) => id === 'q1' || id === 'q2')).toHaveLength(1);
  });

  it('lança erro compreensível quando o banco publicado é insuficiente para o simulado completo', () => {
    const smallPool = [
      buildCandidateQuestion({ id: 'q1', chapterNumber: 1 }),
      buildCandidateQuestion({ id: 'q2', chapterNumber: 2 }),
    ];

    expect(() =>
      selectQuestionsForExam({
        mode: 'FULL',
        allQuestions: smallPool,
        seenQuestionIds: new Set(),
      })
    ).toThrow(InsufficientQuestionBankError);
  });
});

describe('Unidade 3 & 4 — Cálculo de Nota, Aprovação/Reprovação e Embaralhamento', () => {
  it('aprova candidato com 26 acertos em 40 questões (65.0%) e reprova com 25 acertos (62.5%)', () => {
    const buildFortyAnswers = (correctTotal: number) =>
      Array.from({ length: 40 }, (_, idx) => ({
        id: `eq-${idx + 1}`,
        correctDisplayLabel: 'A',
        chapterNumberSnapshot: (idx % 6) + 1,
        topicCodeSnapshot: `${(idx % 6) + 1}.1`,
        selectedLabel: idx < correctTotal ? 'A' : 'B',
      }));

    const passingResult = computeExamScore({
      questions: buildFortyAnswers(26),
      passingScorePoints: 26,
      pointsPerQuestion: 1,
    });

    expect(passingResult.scorePoints).toBe(26);
    expect(passingResult.correctCount).toBe(26);
    expect(passingResult.wrongCount).toBe(14);
    expect(passingResult.accuracyPercent).toBe(65);
    expect(passingResult.passed).toBe(true);

    const failingResult = computeExamScore({
      questions: buildFortyAnswers(25),
      passingScorePoints: 26,
      pointsPerQuestion: 1,
    });

    expect(failingResult.scorePoints).toBe(25);
    expect(failingResult.accuracyPercent).toBe(62.5);
    expect(failingResult.passed).toBe(false);
  });

  it('embaralha alternativas recalculando o rótulo correto sem perder o gabarito', () => {
    const originalOptions = [
      { label: 'A', content: 'Texto correto original', isCorrect: true },
      { label: 'B', content: 'Texto incorreto 1', isCorrect: false },
      { label: 'C', content: 'Texto incorreto 2', isCorrect: false },
      { label: 'D', content: 'Texto incorreto 3', isCorrect: false },
    ];

    const { optionsSnapshot, correctDisplayLabel } = prepareShuffledOptions(
      originalOptions,
      true,
      () => 0.1
    );

    const markedCorrect = optionsSnapshot.find((o) => o.isCorrect);
    expect(markedCorrect).toBeDefined();
    expect(markedCorrect?.content).toBe('Texto correto original');
    expect(markedCorrect?.displayLabel).toBe(correctDisplayLabel);
  });
});

describe('Unidade 5 — Cálculo de Tempo Restante (Server Timestamp)', () => {
  it('calcula tempo restante e expiração com precisão baseada no servidor', () => {
    const startedAt = new Date('2026-10-12T10:00:00Z');
    const expiresAt = new Date('2026-10-12T11:00:00Z'); // 60 min = 3600s
    const midPoint = new Date('2026-10-12T10:25:00Z'); // 25 min decorridos

    const timerMid = calculateServerTimer(startedAt, expiresAt, midPoint);
    expect(timerMid.elapsedSeconds).toBe(1500);
    expect(timerMid.remainingSeconds).toBe(2100);
    expect(timerMid.isExpired).toBe(false);

    const afterExpiry = new Date('2026-10-12T11:00:05Z');
    const timerExpired = calculateServerTimer(startedAt, expiresAt, afterExpiry);
    expect(timerExpired.remainingSeconds).toBe(0);
    expect(timerExpired.isExpired).toBe(true);
  });
});

describe('Unidade 6 & 7 — Regras de XP e Cálculo de Sequência (Streak)', () => {
  it('possui regras de pontuação XP consistentes e positivas', () => {
    expect(XP_RULES.LESSON_COMPLETED).toBeGreaterThan(0);
    expect(XP_RULES.EXERCISE_CORRECT).toBeGreaterThan(0);
    expect(XP_RULES.FLASHCARD_REVIEWED).toBeGreaterThan(0);
    expect(XP_RULES.EXAM_PASSED).toBeGreaterThan(XP_RULES.EXAM_COMPLETED);
  });

  it('calcula streak corretamente para primeiro dia, mesmo dia, dia consecutivo e quebra de sequência', () => {
    const day1 = new Date('2026-10-10T14:00:00Z');
    const first = calculateStudyStreak(null, day1, 0, 0);
    expect(first.newStreak).toBe(1);
    expect(first.newLongestStreak).toBe(1);

    // Mesmo dia não incrementa
    const sameDay = calculateStudyStreak(
      day1,
      new Date('2026-10-10T20:00:00Z'),
      1,
      1
    );
    expect(sameDay.newStreak).toBe(1);

    // Dia seguinte incrementa para 2
    const day2 = new Date('2026-10-11T09:00:00Z');
    const consecutive = calculateStudyStreak(day1, day2, 1, 1);
    expect(consecutive.newStreak).toBe(2);
    expect(consecutive.newLongestStreak).toBe(2);

    // Pular um dia reinicia streak atual para 1 mas preserva longestStreak
    const day4 = new Date('2026-10-13T10:00:00Z');
    const broken = calculateStudyStreak(day2, day4, 2, 2);
    expect(broken.newStreak).toBe(1);
    expect(broken.newLongestStreak).toBe(2);
  });
});

describe('Unidade 8 — Algoritmo de Repetição Espaçada de Flashcards', () => {
  it('agenda intervalos maiores para EASY e reinicia intervalo para HARD', () => {
    const now = new Date('2026-10-12T12:00:00Z');

    const hardReview = computeNextFlashcardReview({
      rating: 'HARD',
      previousIntervalDays: 7,
      previousEaseFactor: 2.5,
      previousRepetitions: 3,
      now,
    });
    expect(hardReview.intervalDays).toBe(1);
    expect(hardReview.state).toBe('LEARNING');
    expect(hardReview.easeFactor).toBeLessThan(2.5);

    const easyFirst = computeNextFlashcardReview({
      rating: 'EASY',
      previousIntervalDays: 0,
      previousEaseFactor: 2.5,
      previousRepetitions: 0,
      now,
    });
    expect(easyFirst.intervalDays).toBe(3);

    const easySecond = computeNextFlashcardReview({
      rating: 'EASY',
      previousIntervalDays: easyFirst.intervalDays,
      previousEaseFactor: easyFirst.easeFactor,
      previousRepetitions: easyFirst.repetitions,
      now,
    });
    expect(easySecond.intervalDays).toBeGreaterThanOrEqual(7);
    expect(easySecond.state).toBe('MASTERED');
  });
});

describe('Unidade 9 & 10 — Validação Zod e Workflow Editorial de Questões', () => {
  it('valida dados de cadastro, criação de questão e exclusão segura com Zod', () => {
    const invalidRegister = registerSchema.safeParse({
      fullName: 'A',
      email: 'invalido',
      password: '123',
    });
    expect(invalidRegister.success).toBe(false);

    const validDelete = deleteAccountSchema.safeParse({
      confirmationText: 'EXCLUIR MINHA CONTA',
    });
    expect(validDelete.success).toBe(true);

    // Questão com 2 alternativas marcadas como corretas deve falhar
    const twoCorrectOptions = createOrUpdateQuestionSchema.safeParse({
      code: 'CTFL-TEST-01',
      statement: 'Enunciado válido com mais de vinte caracteres para teste.',
      chapterId: 'ch-1',
      topicId: 'tp-1',
      learningObjectiveCode: 'FL-1.1.1',
      cognitiveLevel: 'K1',
      difficulty: 'EASY',
      explanation: 'Explicação válida com tamanho suficiente.',
      referenceSection: 'Seção 1.1',
      sourceId: 'src-1',
      options: [
        { label: 'A', content: 'Opção A', isCorrect: true },
        { label: 'B', content: 'Opção B', isCorrect: true },
        { label: 'C', content: 'Opção C', isCorrect: false },
        { label: 'D', content: 'Opção D', isCorrect: false },
      ],
    });
    expect(twoCorrectOptions.success).toBe(false);
  });

  it('garante transições coerentes de status editorial (DRAFT -> IN_REVIEW -> APPROVED -> PUBLISHED)', () => {
    expect(isQuestionEligibleForExam('DRAFT')).toBe(false);
    expect(isQuestionEligibleForExam('IN_REVIEW')).toBe(false);
    expect(isQuestionEligibleForExam('APPROVED')).toBe(false);
    expect(isQuestionEligibleForExam('PUBLISHED')).toBe(true);

    // Não permite publicar direto de DRAFT
    const directPublish = resolveNextQuestionStatus('DRAFT', 'PUBLISH');
    expect(directPublish.valid).toBe(false);

    const step1 = resolveNextQuestionStatus('DRAFT', 'SUBMIT_REVIEW');
    expect(step1.valid).toBe(true);
    expect(step1.nextStatus).toBe('IN_REVIEW');

    const step2 = resolveNextQuestionStatus('IN_REVIEW', 'APPROVE');
    expect(step2.valid).toBe(true);
    expect(step2.nextStatus).toBe('APPROVED');

    const step3 = resolveNextQuestionStatus('APPROVED', 'PUBLISH');
    expect(step3.valid).toBe(true);
    expect(step3.nextStatus).toBe('PUBLISHED');
  });
});
