import type {
  CognitiveLevel,
  DifficultyLevel,
  QuestionEditorialStatus,
} from '@prisma/client';

export interface CandidateQuestion {
  id: string;
  code: string;
  equivalenceGroupId?: string | null;
  statement: string;
  chapterNumber: number;
  chapterId: string;
  topicId: string;
  topicCode: string;
  learningObjectiveCode: string;
  cognitiveLevel: CognitiveLevel;
  difficulty: DifficultyLevel;
  correctOptionLabel: string;
  explanation: string;
  status: QuestionEditorialStatus;
  version: number;
  deletedAt?: Date | null;
  options: {
    label: string;
    content: string;
    isCorrect: boolean;
    justification?: string | null;
  }[];
}

export interface ShuffledOptionSnapshot {
  displayLabel: 'A' | 'B' | 'C' | 'D';
  originalLabel: string;
  content: string;
  isCorrect: boolean;
  justification?: string | null;
}

export interface ExamSelectionResult {
  selectedQuestions: CandidateQuestion[];
  usedRepeatedQuestions: boolean;
}

export class InsufficientQuestionBankError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientQuestionBankError';
  }
}

/**
 * Embaralhamento determinístico ou pseudoaleatório (Fisher-Yates)
 */
export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/**
 * Verifica se é seguro embaralhar alternativas sem alterar o sentido de referências posicionais
 */
export function isSafeToShuffleOptions(
  options: { content: string }[]
): boolean {
  const positionalPattern =
    /\b(todas as alternativas|nenhuma das anteriores|ambas a e b|alternativas a e b|acima|abaixo)\b/i;
  return !options.some((o) => positionalPattern.test(o.content));
}

/**
 * Embaralha as alternativas (quando seguro) e recalcula o rótulo correto (A, B, C, D)
 * sem alterar o gabarito nem o sentido da questão.
 */
export function prepareShuffledOptions(
  options: CandidateQuestion['options'],
  shouldShuffle = true,
  rng: () => number = Math.random
): {
  optionsSnapshot: ShuffledOptionSnapshot[];
  correctDisplayLabel: 'A' | 'B' | 'C' | 'D';
} {
  const displayLabels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const ordered =
    shouldShuffle && isSafeToShuffleOptions(options)
      ? shuffleArray(options, rng)
      : [...options];

  let correctDisplayLabel: 'A' | 'B' | 'C' | 'D' = 'A';

  const optionsSnapshot: ShuffledOptionSnapshot[] = ordered
    .slice(0, 4)
    .map((opt, idx) => {
      const displayLabel = displayLabels[idx] || 'A';
      if (opt.isCorrect) {
        correctDisplayLabel = displayLabel;
      }
      return {
        displayLabel,
        originalLabel: opt.label,
        content: opt.content,
        isCorrect: opt.isCorrect,
        justification: opt.justification ?? null,
      };
    });

  return {
    optionsSnapshot,
    correctDisplayLabel,
  };
}

/**
 * Seleciona questões para um grupo (ex.: um capítulo ou filtro personalizado),
 * priorizando inéditas, balanceando tópicos e dificuldades e evitando duplicatas e grupos de equivalência.
 */
function pickFromPool(
  pool: CandidateQuestion[],
  requiredCount: number,
  seenQuestionIds: Set<string>,
  usedQuestionIds: Set<string>,
  usedEquivalenceGroups: Set<string>,
  rng: () => number
): { picked: CandidateQuestion[]; usedRepeated: boolean } {
  const eligible = pool.filter(
    (q) =>
      q.status === 'PUBLISHED' &&
      !q.deletedAt &&
      !usedQuestionIds.has(q.id) &&
      (!q.equivalenceGroupId || !usedEquivalenceGroups.has(q.equivalenceGroupId))
  );

  const unseen = shuffleArray(
    eligible.filter((q) => !seenQuestionIds.has(q.id)),
    rng
  );
  const seen = shuffleArray(
    eligible.filter((q) => seenQuestionIds.has(q.id)),
    rng
  );

  // Ordenar candidatos para balancear tópicos menos representados na seleção
  const topicCounts = new Map<string, number>();
  const picked: CandidateQuestion[] = [];
  let usedRepeated = false;

  const tryPickFromList = (list: CandidateQuestion[], isRepeatedList: boolean) => {
    const remaining = [...list];
    while (picked.length < requiredCount && remaining.length > 0) {
      remaining.sort((a, b) => {
        const countA = topicCounts.get(a.topicCode) ?? 0;
        const countB = topicCounts.get(b.topicCode) ?? 0;
        return countA - countB;
      });

      const candidate = remaining.shift()!;
      if (usedQuestionIds.has(candidate.id)) continue;
      if (
        candidate.equivalenceGroupId &&
        usedEquivalenceGroups.has(candidate.equivalenceGroupId)
      ) {
        continue;
      }

      picked.push(candidate);
      usedQuestionIds.add(candidate.id);
      if (candidate.equivalenceGroupId) {
        usedEquivalenceGroups.add(candidate.equivalenceGroupId);
      }
      topicCounts.set(
        candidate.topicCode,
        (topicCounts.get(candidate.topicCode) ?? 0) + 1
      );
      if (isRepeatedList) {
        usedRepeated = true;
      }
    }
  };

  tryPickFromList(unseen, false);
  if (picked.length < requiredCount) {
    tryPickFromList(seen, true);
  }

  return { picked, usedRepeated };
}

/**
 * Gerador determinístico de provas completas (40 questões conforme matriz oficial)
 * ou provas por capítulo/personalizadas.
 */
export function selectQuestionsForExam(params: {
  mode: 'FULL' | 'CHAPTER' | 'CUSTOM';
  allQuestions: CandidateQuestion[];
  seenQuestionIds: Set<string>;
  chapterDistribution?: Record<string, number>;
  targetCount?: number;
  rng?: () => number;
}): ExamSelectionResult {
  const rng = params.rng ?? Math.random;
  const usedQuestionIds = new Set<string>();
  const usedEquivalenceGroups = new Set<string>();
  let usedRepeatedQuestions = false;
  const selectedQuestions: CandidateQuestion[] = [];

  if (params.mode === 'FULL') {
    const distribution = params.chapterDistribution ?? {
      '1': 8,
      '2': 6,
      '3': 4,
      '4': 12,
      '5': 8,
      '6': 2,
    };

    for (const [chapterNumStr, countNeeded] of Object.entries(distribution)) {
      const chapterNum = Number(chapterNumStr);
      const chapterPool = params.allQuestions.filter(
        (q) => q.chapterNumber === chapterNum
      );

      const { picked, usedRepeated } = pickFromPool(
        chapterPool,
        countNeeded,
        params.seenQuestionIds,
        usedQuestionIds,
        usedEquivalenceGroups,
        rng
      );

      if (picked.length < countNeeded) {
        throw new InsufficientQuestionBankError(
          `Banco de questões insuficiente para o Capítulo ${chapterNum}: são necessárias ${countNeeded} questões publicadas e não equivalentes, mas apenas ${picked.length} estão disponíveis.`
        );
      }

      if (usedRepeated) usedRepeatedQuestions = true;
      selectedQuestions.push(...picked);
    }

    return {
      selectedQuestions: shuffleArray(selectedQuestions, rng),
      usedRepeatedQuestions,
    };
  }

  // Modo CHAPTER ou CUSTOM
  const targetCount = params.targetCount ?? Math.min(10, params.allQuestions.length);
  const { picked, usedRepeated } = pickFromPool(
    params.allQuestions,
    targetCount,
    params.seenQuestionIds,
    usedQuestionIds,
    usedEquivalenceGroups,
    rng
  );

  if (picked.length === 0) {
    throw new InsufficientQuestionBankError(
      'Nenhuma questão publicada encontrada para os filtros selecionados.'
    );
  }

  return {
    selectedQuestions: shuffleArray(picked, rng),
    usedRepeatedQuestions: usedRepeated,
  };
}

/**
 * Calcula o tempo restante com base exclusivamente em timestamps do servidor.
 */
export function calculateServerTimer(
  startedAt: Date,
  expiresAt: Date,
  serverNow: Date = new Date()
): {
  remainingSeconds: number;
  elapsedSeconds: number;
  isExpired: boolean;
} {
  const remainingMs = expiresAt.getTime() - serverNow.getTime();
  const elapsedMs = serverNow.getTime() - startedAt.getTime();
  const maxDurationSec = Math.max(
    1,
    Math.round((expiresAt.getTime() - startedAt.getTime()) / 1000)
  );

  const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const elapsedSeconds = Math.min(
    maxDurationSec,
    Math.max(0, Math.floor(elapsedMs / 1000))
  );

  return {
    remainingSeconds,
    elapsedSeconds,
    isExpired: remainingMs <= 0,
  };
}

/**
 * Calcula a pontuação, percentual e situação de aprovação de uma tentativa.
 */
export function computeExamScore(params: {
  questions: {
    id: string;
    correctDisplayLabel: string;
    chapterNumberSnapshot: number;
    topicCodeSnapshot: string;
    selectedLabel?: string | null;
  }[];
  passingScorePoints?: number;
  pointsPerQuestion?: number;
  passingPercentFallback?: number;
}) {
  const pointsPerQuestion = params.pointsPerQuestion ?? 1;
  const totalQuestions = params.questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const byChapter: Record<
    number,
    { total: number; correct: number; accuracyPercent: number }
  > = {};
  const byTopic: Record<
    string,
    { total: number; correct: number; accuracyPercent: number }
  > = {};

  for (const q of params.questions) {
    if (!byChapter[q.chapterNumberSnapshot]) {
      byChapter[q.chapterNumberSnapshot] = {
        total: 0,
        correct: 0,
        accuracyPercent: 0,
      };
    }
    if (!byTopic[q.topicCodeSnapshot]) {
      byTopic[q.topicCodeSnapshot] = {
        total: 0,
        correct: 0,
        accuracyPercent: 0,
      };
    }

    byChapter[q.chapterNumberSnapshot].total += 1;
    byTopic[q.topicCodeSnapshot].total += 1;

    if (!q.selectedLabel) {
      unansweredCount += 1;
    } else if (q.selectedLabel === q.correctDisplayLabel) {
      correctCount += 1;
      byChapter[q.chapterNumberSnapshot].correct += 1;
      byTopic[q.topicCodeSnapshot].correct += 1;
    } else {
      wrongCount += 1;
    }
  }

  for (const ch of Object.values(byChapter)) {
    ch.accuracyPercent =
      ch.total > 0 ? Number(((ch.correct / ch.total) * 100).toFixed(1)) : 0;
  }
  for (const tp of Object.values(byTopic)) {
    tp.accuracyPercent =
      tp.total > 0 ? Number(((tp.correct / tp.total) * 100).toFixed(1)) : 0;
  }

  const scorePoints = correctCount * pointsPerQuestion;
  const accuracyPercent =
    totalQuestions > 0
      ? Number(((correctCount / totalQuestions) * 100).toFixed(1))
      : 0;

  const passed =
    params.passingScorePoints !== undefined
      ? scorePoints >= params.passingScorePoints
      : accuracyPercent >= (params.passingPercentFallback ?? 65);

  return {
    totalQuestions,
    scorePoints,
    correctCount,
    wrongCount,
    unansweredCount,
    accuracyPercent,
    passed,
    byChapter,
    byTopic,
  };
}
