import { describe, it, expect, vi } from 'vitest';
import { handleExerciseAnswer } from '@/backend/controllers/exercise.controller';
import { handleCreateNote, handleConvertToFlashcard } from '@/backend/controllers/notes.controller';
import { handleFlashcardReset } from '@/backend/controllers/flashcard.controller';

// Mock de autenticação para simular usuário logado
vi.mock('@/backend/middlewares/auth.middleware', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'user-test-api-123',
    email: 'teste@ctfl.local',
    fullName: 'Aluno Teste API',
    role: 'STUDENT',
  }),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(message: string, status = 401) {
      super(message);
      this.name = 'AuthError';
      this.status = status;
    }
  },
}));

describe('API Route & Controller Tests — Validações HTTP e Respostas', () => {
  it('POST /api/exercises/answer retorna HTTP 400 quando o payload não contém alternativa válida', async () => {
    const fakeReq = new Request('http://localhost:3000/api/exercises/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: 'q-1', selectedLabel: 'INVALIDO' }),
    });

    const res = await handleExerciseAnswer(fakeReq);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Dados de resposta inválidos.');
  });

  it('POST /api/notes retorna HTTP 400 se o título da anotação estiver ausente', async () => {
    const fakeReq = new Request('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Conteúdo sem título' }),
    });

    const res = await handleCreateNote(fakeReq);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('título da anotação');
  });

  it('POST /api/notes/to-flashcard retorna HTTP 400 se faltar frente ou verso', async () => {
    const fakeReq = new Request('http://localhost:3000/api/notes/to-flashcard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: '' }),
    });

    const res = await handleConvertToFlashcard(fakeReq);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Frente (pergunta/conceito) e verso');
  });

  it('POST /api/flashcards/reset retorna HTTP 400 se flashcardId estiver vazio', async () => {
    const fakeReq = new Request('http://localhost:3000/api/flashcards/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await handleFlashcardReset(fakeReq);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('flashcardId é obrigatório.');
  });
});
