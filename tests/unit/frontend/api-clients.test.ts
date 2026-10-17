import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitExerciseAnswer } from '@/frontend/api-clients/exercises.api';
import { submitFlashcardReview } from '@/frontend/api-clients/flashcards.api';
import { fetchNotes, createNote } from '@/frontend/api-clients/notes.api';

describe('Frontend Unit Tests — API Clients', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('submitExerciseAnswer envia payload JSON correto para a rota /api/exercises/answer', async () => {
    const mockResponse = {
      isCorrect: true,
      correctOptionLabel: 'A',
      explanation: 'Explicacao teste',
      referenceSection: '1.1',
      options: [],
      xpAwarded: 15,
      unlockedAchievements: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await submitExerciseAnswer('q-123', 'A');

    expect(global.fetch).toHaveBeenCalledWith('/api/exercises/answer', {
      method: 'POST',
      headers: expect.any(Headers),
      body: JSON.stringify({ questionId: 'q-123', selectedLabel: 'A' }),
    });
    expect(result.isCorrect).toBe(true);
    expect(result.xpAwarded).toBe(15);
  });

  it('submitFlashcardReview envia nota de repetição espaçada', async () => {
    const mockResponse = {
      review: { id: 'rev-1', flashcardId: 'fc-1', rating: 'EASY', state: 'MASTERED', intervalDays: 3, repetitions: 1 },
      xpAwarded: 5,
      unlockedAchievements: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    });

    const result = await submitFlashcardReview('fc-1', 'EASY');
    expect(global.fetch).toHaveBeenCalledWith('/api/flashcards/review', {
      method: 'POST',
      headers: expect.any(Headers),
      body: JSON.stringify({ flashcardId: 'fc-1', rating: 'EASY' }),
    });
    expect(result.review.state).toBe('MASTERED');
  });

  it('fetchNotes monta query string corretamente com filtros', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ notes: [] }),
    });

    await fetchNotes({ type: 'MINDMAP', chapterId: 'ch-1' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notes?type=MINDMAP&chapterId=ch-1',
      expect.any(Object)
    );
  });

  it('createNote lança erro amigável quando a API retorna erro 400', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'O título é obrigatório.' }),
    });

    await expect(createNote({ title: '' })).rejects.toThrow('O título é obrigatório.');
  });
});
