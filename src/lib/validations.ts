import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Insira seu nome completo.')
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Insira seu e-mail.')
    .email('Formato de e-mail inválido. Exemplo: voce@email.com'),
  password: z
    .string()
    .min(1, 'Insira sua senha.')
    .min(8, 'A senha deve possuir no mínimo 8 caracteres.')
    .max(72, 'A senha deve possuir no máximo 72 caracteres.'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Insira seu e-mail.')
    .email('Formato de e-mail inválido. Exemplo: voce@email.com'),
  password: z.string().min(1, 'Insira sua senha.'),
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Insira seu e-mail.')
    .email('Formato de e-mail inválido. Exemplo: voce@email.com'),
  newPassword: z
    .string()
    .min(1, 'Insira sua nova senha.')
    .min(8, 'A nova senha deve possuir no mínimo 8 caracteres.')
    .optional(),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Insira seu nome completo.')
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  preferredTheme: z.enum(['dark', 'light']),
  dailyGoalMinutes: z.number().int().min(10).max(240),
  nonNativeLanguageBonus: z.boolean(),
});

export const deleteAccountSchema = z.object({
  confirmationText: z
    .string()
    .refine((val) => val === 'EXCLUIR MINHA CONTA', {
      message: 'Digite exatamente EXCLUIR MINHA CONTA para confirmar.',
    }),
});

export const answerOptionInputSchema = z.object({
  label: z.enum(['A', 'B', 'C', 'D']),
  content: z.string().trim().min(1, 'O texto da alternativa é obrigatório.'),
  isCorrect: z.boolean(),
  justification: z.string().trim().optional(),
});

export const createOrUpdateQuestionSchema = z
  .object({
    code: z.string().trim().min(3, 'Código obrigatório (ex: Q-CTFL-001).'),
    equivalenceGroupId: z.string().trim().optional().nullable(),
    statement: z
      .string()
      .trim()
      .min(15, 'O enunciado deve possuir pelo menos 15 caracteres.'),
    chapterId: z.string().min(1, 'Capítulo obrigatório.'),
    topicId: z.string().min(1, 'Tópico obrigatório.'),
    learningObjectiveCode: z
      .string()
      .trim()
      .regex(/^FL-\d\.\d\.\d$/, 'Use o formato oficial FL-x.x.x (ex: FL-1.1.1).'),
    cognitiveLevel: z.enum(['K1', 'K2', 'K3']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    explanation: z
      .string()
      .trim()
      .min(10, 'A explicação da resposta é obrigatória.'),
    referenceSection: z
      .string()
      .trim()
      .min(2, 'Informe a referência documental ou seção do syllabus.'),
    sourceId: z.string().min(1, 'Fonte obrigatória.'),
    isOfficialSample: z.boolean().default(false),
    isExercise: z.boolean().default(true),
    changeReason: z.string().trim().optional(),
    options: z
      .array(answerOptionInputSchema)
      .length(4, 'Cada questão deve possuir exatamente 4 alternativas (A, B, C, D).'),
  })
  .refine(
    (data) => data.options.filter((o) => o.isCorrect).length === 1,
    {
      message: 'Deve existir exatamente 1 alternativa correta.',
      path: ['options'],
    }
  );

export const questionTransitionSchema = z.object({
  action: z.enum([
    'SUBMIT_REVIEW',
    'APPROVE',
    'REJECT',
    'PUBLISH',
    'UNPUBLISH',
    'ARCHIVE',
  ]),
  comments: z.string().trim().optional(),
});

export const createExamAttemptSchema = z.object({
  mode: z.enum(['FULL', 'CHAPTER', 'CUSTOM']),
  chapterId: z.string().optional(),
  topicIds: z.array(z.string()).optional(),
  difficulties: z.array(z.enum(['EASY', 'MEDIUM', 'HARD'])).optional(),
  questionCount: z.number().int().min(1).max(40).optional(),
  applyNonNativeBonus: z.boolean().optional(),
});

export const saveExamAnswerSchema = z.object({
  examQuestionId: z.string().min(1),
  selectedLabel: z.enum(['A', 'B', 'C', 'D']).nullable().optional(),
  markedForReview: z.boolean().optional(),
});

export const flashcardReviewInputSchema = z.object({
  flashcardId: z.string().min(1),
  rating: z.enum(['EASY', 'MEDIUM', 'HARD']),
});

export const createOrUpdateFlashcardSchema = z.object({
  chapterId: z.string().min(1),
  topicId: z.string().min(1),
  front: z.string().trim().min(5),
  back: z.string().trim().min(5),
  tags: z.array(z.string().trim()).default([]),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  isPublished: z.boolean().default(true),
});
