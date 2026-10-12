'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ClipboardCheck,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/providers/toast-provider';
import { formatDateTimePtBr } from '@/lib/utils';

interface ReviewQuestionItem {
  id: string;
  code: string;
  statement: string;
  learningObjectiveCode: string;
  cognitiveLevel: string;
  difficulty: string;
  correctOptionLabel: string;
  explanation: string;
  referenceSection: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  updatedAt: string;
  chapter: { number: number; title: string };
  topic: { code: string; title: string };
  options: Array<{
    id: string;
    label: string;
    content: string;
    isCorrect: boolean;
    justification: string | null;
  }>;
  reviews: Array<{
    id: string;
    previousStatus: string;
    newStatus: string;
    decision: string;
    comments: string | null;
    createdAt: string;
  }>;
}

export function ReviewQueueManager({
  questions,
}: {
  questions: ReviewQuestionItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [commentsByQuestion, setCommentsByQuestion] = useState<Record<string, string>>(
    {}
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function executeTransition(
    questionId: string,
    action: 'SUBMIT_REVIEW' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'ARCHIVE'
  ) {
    setProcessingId(questionId);
    try {
      const res = await fetch(`/api/admin/questions/${questionId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          comments:
            commentsByQuestion[questionId] ||
            `Decisão editorial (${action}) registrada na Fila de Revisão.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Não foi possível executar a transição',
          description: data.error || 'Verifique o status atual da questão.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: 'Decisão editorial registrada',
        description: `A questão passou para o status ${data.question.status}.`,
        variant: 'success',
      });
      router.refresh();
    } finally {
      setProcessingId(null);
    }
  }

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Fila de revisão limpa!"
        description="Não há questões pendentes em DRAFT, IN_REVIEW, APPROVED ou REJECTED no momento."
      />
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <Card key={q.id} className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{q.code}</Badge>
                <Badge
                  variant={
                    q.status === 'IN_REVIEW'
                      ? 'warning'
                      : q.status === 'APPROVED'
                        ? 'success'
                        : q.status === 'REJECTED'
                          ? 'danger'
                          : 'info'
                  }
                >
                  {q.status}
                </Badge>
                <Badge variant="outline">
                  Cap. {q.chapter.number} • {q.topic.code}
                </Badge>
                <Badge variant="info">
                  {q.learningObjectiveCode} ({q.cognitiveLevel})
                </Badge>
                <Badge variant="outline">Versão {q.version}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Atualizada em {formatDateTimePtBr(q.updatedAt)}
              </span>
            </div>
            <CardTitle className="mt-2 text-base leading-relaxed">
              {q.statement}
            </CardTitle>
            <CardDescription>
              Referência: {q.referenceSection}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`rounded-lg border p-3 text-xs ${
                    opt.isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-border bg-secondary/10'
                  }`}
                >
                  <div className="font-semibold">
                    {opt.label}) {opt.content}
                  </div>
                  {opt.justification && (
                    <p className="mt-1 text-muted-foreground">
                      • {opt.justification}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-3 text-xs">
              <strong>Explicação Didática:</strong> {q.explanation}
            </div>

            <div className="space-y-3 rounded-xl border border-border p-3.5">
              <Textarea
                label="Parecer Técnico do Revisor"
                rows={2}
                placeholder="Informe observações sobre aderência ao Syllabus CTFL 4.0.1, nível K ou clareza dos distratores..."
                value={commentsByQuestion[q.id] || ''}
                onChange={(e) =>
                  setCommentsByQuestion((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
              />

              <div className="flex flex-wrap items-center justify-end gap-2">
                {(q.status === 'DRAFT' || q.status === 'REJECTED') && (
                  <Button
                    size="sm"
                    isLoading={processingId === q.id}
                    onClick={() => executeTransition(q.id, 'SUBMIT_REVIEW')}
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    Enviar para Revisão (IN_REVIEW)
                  </Button>
                )}

                {q.status === 'IN_REVIEW' && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      isLoading={processingId === q.id}
                      onClick={() => executeTransition(q.id, 'REJECT')}
                      className="gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar Questão
                    </Button>
                    <Button
                      size="sm"
                      isLoading={processingId === q.id}
                      onClick={() => executeTransition(q.id, 'APPROVE')}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprovar Questão (APPROVED)
                    </Button>
                  </>
                )}

                {q.status === 'APPROVED' && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      isLoading={processingId === q.id}
                      onClick={() => executeTransition(q.id, 'REJECT')}
                      className="gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      isLoading={processingId === q.id}
                      onClick={() => executeTransition(q.id, 'PUBLISH')}
                      className="gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Publicar no Banco Oficial (PUBLISHED)
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
