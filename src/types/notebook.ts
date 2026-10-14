export interface MindMapNode {
  id: string;
  text: string;
  emoji?: string;
  color?: string;
  notes?: string;
  isExpanded?: boolean;
  children?: MindMapNode[];
}

export interface MindMapData {
  root: MindMapNode;
  version: number;
}

export interface StudyNoteItem {
  id: string;
  userId: string;
  type: 'NOTE' | 'MINDMAP';
  title: string;
  content: string;
  mindMapData: MindMapData | null;
  color: string;
  tags: string[];
  chapterId: string | null;
  topicId: string | null;
  chapter?: { id: string; number: number; title: string; slug: string } | null;
  topic?: { id: string; code: string; title: string; slug: string } | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MindMapTemplate {
  id: string;
  name: string;
  description: string;
  chapterNumber?: number;
  data: MindMapData;
}
