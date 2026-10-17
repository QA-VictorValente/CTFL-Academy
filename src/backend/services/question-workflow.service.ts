import type { QuestionEditorialStatus } from '@prisma/client';

export type EditorialTransitionAction =
  | 'SUBMIT_REVIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE';

const VALID_TRANSITIONS: Record<
  QuestionEditorialStatus,
  Partial<Record<EditorialTransitionAction, QuestionEditorialStatus>>
> = {
  DRAFT: {
    SUBMIT_REVIEW: 'IN_REVIEW',
    ARCHIVE: 'ARCHIVED',
  },
  IN_REVIEW: {
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    ARCHIVE: 'ARCHIVED',
  },
  APPROVED: {
    PUBLISH: 'PUBLISHED',
    REJECT: 'REJECTED',
    ARCHIVE: 'ARCHIVED',
  },
  REJECTED: {
    SUBMIT_REVIEW: 'IN_REVIEW',
    ARCHIVE: 'ARCHIVED',
  },
  PUBLISHED: {
    UNPUBLISH: 'APPROVED',
    ARCHIVE: 'ARCHIVED',
  },
  ARCHIVED: {
    SUBMIT_REVIEW: 'IN_REVIEW',
  },
};

export function resolveNextQuestionStatus(
  currentStatus: QuestionEditorialStatus,
  action: EditorialTransitionAction
): {
  valid: boolean;
  nextStatus?: QuestionEditorialStatus;
  error?: string;
} {
  const allowed = VALID_TRANSITIONS[currentStatus];
  const nextStatus = allowed?.[action];

  if (!nextStatus) {
    return {
      valid: false,
      error: `Transição editorial inválida: não é permitido executar "${action}" a partir do status "${currentStatus}".`,
    };
  }

  return {
    valid: true,
    nextStatus,
  };
}

export function isQuestionEligibleForExam(
  status: QuestionEditorialStatus,
  deletedAt?: Date | null
): boolean {
  return status === 'PUBLISHED' && !deletedAt;
}
