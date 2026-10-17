import { apiFetch } from './client';
import type { StudyNoteItem } from '@/shared/types/notebook';

export interface CreateNotePayload {
  title: string;
  type?: 'NOTE' | 'MINDMAP';
  content?: string;
  mindMapData?: unknown;
  color?: string;
  tags?: string[];
  chapterId?: string | null;
  topicId?: string | null;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  mindMapData?: unknown;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
  chapterId?: string | null;
  topicId?: string | null;
}

export async function fetchNotes(filters?: {
  type?: 'NOTE' | 'MINDMAP';
  chapterId?: string;
  topicId?: string;
  search?: string;
}): Promise<{ notes: StudyNoteItem[] }> {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.chapterId) params.set('chapterId', filters.chapterId);
  if (filters?.topicId) params.set('topicId', filters.topicId);
  if (filters?.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{ notes: StudyNoteItem[] }>(`/api/notes${query}`);
}

export async function fetchNoteById(id: string): Promise<{ note: StudyNoteItem }> {
  return apiFetch<{ note: StudyNoteItem }>(`/api/notes/${id}`);
}

export async function createNote(payload: CreateNotePayload): Promise<{ note: StudyNoteItem }> {
  return apiFetch<{ note: StudyNoteItem }>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateNote(
  id: string,
  payload: UpdateNotePayload
): Promise<{ note: StudyNoteItem }> {
  return apiFetch<{ note: StudyNoteItem }>(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteNote(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/api/notes/${id}`, {
    method: 'DELETE',
  });
}

export async function convertNoteToFlashcard(payload: {
  front: string;
  back: string;
  chapterId?: string | null;
  topicId?: string | null;
  tags?: string[];
}): Promise<{ success: boolean; flashcard: unknown; message: string }> {
  return apiFetch<{ success: boolean; flashcard: unknown; message: string }>(
    '/api/notes/to-flashcard',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}
