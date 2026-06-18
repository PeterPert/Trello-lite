export interface Board {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: number;
  listId: number;
  title: string;
  description: string;
  position: number;
  labels: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardList {
  id: number;
  title: string;
  position: number;
  cards: Card[];
}

export interface BoardDetail {
  id: number;
  name: string;
  lists: BoardList[];
}

export interface ChangeLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  details: string;
  timestamp: string;
}

export interface DeadlineNotification {
  cardId: number;
  cardTitle: string;
  boardId: number;
  boardName: string;
  deadline: string;
}

export const LABEL_COLORS: Record<string, string> = {
  red: '#eb5a46',
  green: '#61bd4f',
  blue: '#0079bf',
  yellow: '#f2d600',
  purple: '#c377e0',
  orange: '#ff9f1a',
  gray: '#838c91',
};

export const LABEL_OPTIONS = [
  { key: 'red', name: 'Красный' },
  { key: 'green', name: 'Зелёный' },
  { key: 'blue', name: 'Синий' },
  { key: 'yellow', name: 'Жёлтый' },
  { key: 'purple', name: 'Фиолетовый' },
  { key: 'orange', name: 'Оранжевый' },
];

export function parseLabels(labels: string): string[] {
  try {
    return JSON.parse(labels || '[]');
  } catch {
    return [];
  }
}

export function getLabelColor(label: string): string {
  return LABEL_COLORS[label.toLowerCase()] || LABEL_COLORS.gray;
}

export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDatetimeLocal(deadline: string | null): string {
  if (!deadline) return '';
  const d = new Date(deadline);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
