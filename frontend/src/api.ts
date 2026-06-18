import type { Board, BoardDetail, Card, ChangeLog, DeadlineNotification } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getBoards: () => request<Board[]>('/boards'),
  createBoard: (name: string) => request<Board>('/boards', { method: 'POST', body: JSON.stringify({ name }) }),
  renameBoard: (id: number, name: string) => request<Board>(`/boards/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteBoard: (id: number) => request<void>(`/boards/${id}`, { method: 'DELETE' }),
  getBoard: (id: number) => request<BoardDetail>(`/boards/${id}`),

  createList: (boardId: number, title: string) =>
    request<{ id: number; title: string }>(`/boards/${boardId}/lists`, { method: 'POST', body: JSON.stringify({ title }) }),
  renameList: (id: number, title: string) =>
    request<{ id: number; title: string }>(`/lists/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  deleteList: (id: number) => request<void>(`/lists/${id}`, { method: 'DELETE' }),
  reorderLists: (boardId: number, orderedIds: number[]) =>
    request<void>(`/boards/${boardId}/lists/reorder`, { method: 'PUT', body: JSON.stringify({ orderedIds }) }),

  createCard: (listId: number, title: string) =>
    request<Card>(`/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateCard: (id: number, data: Record<string, unknown>) =>
    request<Card>(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (id: number) => request<void>(`/cards/${id}`, { method: 'DELETE' }),
  moveCard: (id: number, targetListId: number, position: number) =>
    request<Card>(`/cards/${id}/move`, { method: 'PUT', body: JSON.stringify({ targetListId, position }) }),

  search: (boardId: number, q: string) => request<Card[]>(`/boards/${boardId}/search?q=${encodeURIComponent(q)}`),
  getHistory: () => request<ChangeLog[]>('/history'),
  getDeadlineNotifications: (hours = 24) => request<DeadlineNotification[]>(`/notifications/deadlines?hours=${hours}`),

  exportHtml: (boardId: number) => window.open(`${BASE}/boards/${boardId}/export/html`, '_blank'),
  exportPdf: (boardId: number) => window.open(`${BASE}/boards/${boardId}/export/pdf`, '_blank'),
};
