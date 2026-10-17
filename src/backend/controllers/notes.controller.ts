import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/backend/middlewares/auth.middleware';
import {
  findUserNotes,
  findUserNoteById,
  createUserNote,
  updateUserNote,
  deleteUserNote,
  convertNoteToFlashcard,
} from '@/backend/services/notes.service';

export async function handleGetNotes(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const typeParam = searchParams.get('type') as 'NOTE' | 'MINDMAP' | null;
    const chapterId = searchParams.get('chapterId');
    const topicId = searchParams.get('topicId');
    const search = searchParams.get('search');

    const notes = await findUserNotes(user.id, {
      type: typeParam || undefined,
      chapterId,
      topicId,
      search,
    });

    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller GET Error]:', error);
    return NextResponse.json({ error: 'Erro ao carregar anotações.' }, { status: 500 });
  }
}

export async function handleCreateNote(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { title, type = 'NOTE', content = '', mindMapData = null, color = '#6366f1', tags = [], chapterId = null, topicId = null } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'O título da anotação ou mapa mental é obrigatório.' },
        { status: 400 }
      );
    }

    const note = await createUserNote(user.id, {
      title,
      type,
      content,
      mindMapData,
      color,
      tags,
      chapterId,
      topicId,
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller POST Error]:', error);
    return NextResponse.json({ error: 'Erro ao criar anotação.' }, { status: 500 });
  }
}

export async function handleGetNoteById(noteId: string) {
  try {
    const user = await requireAuth();
    const note = await findUserNoteById(user.id, noteId);

    if (!note) {
      return NextResponse.json(
        { error: 'Anotação ou mapa mental não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller GET by ID Error]:', error);
    return NextResponse.json({ error: 'Erro ao buscar item.' }, { status: 500 });
  }
}

export async function handleUpdateNote(req: Request, noteId: string) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const updated = await updateUserNote(user.id, noteId, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Anotação não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller PUT Error]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item.' }, { status: 500 });
  }
}

export async function handleDeleteNote(noteId: string) {
  try {
    const user = await requireAuth();
    const success = await deleteUserNote(user.id, noteId);

    if (!success) {
      return NextResponse.json(
        { error: 'Anotação não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Item arquivado.' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller DELETE Error]:', error);
    return NextResponse.json({ error: 'Erro ao excluir item.' }, { status: 500 });
  }
}

export async function handleConvertToFlashcard(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const { front, back, chapterId, topicId, tags = [] } = body;

    if (!front || !back) {
      return NextResponse.json(
        { error: 'Frente (pergunta/conceito) e verso (resposta) são obrigatórios.' },
        { status: 400 }
      );
    }

    const flashcard = await convertNoteToFlashcard({
      front,
      back,
      chapterId,
      topicId,
      tags,
    });

    return NextResponse.json(
      {
        success: true,
        flashcard,
        message: 'Flashcard gerado e adicionado à sua rotina de repetição espaçada!',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Notes Controller to-flashcard Error]:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar flashcard a partir da anotação.' },
      { status: 500 }
    );
  }
}
