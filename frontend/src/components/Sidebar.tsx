import { useState } from 'react';
import type { Board } from '../types';
import { api } from '../api';

interface Props {
  boards: Board[];
  currentBoardId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  onShowHistory: () => void;
}

export function Sidebar({ boards, currentBoardId, onSelect, onRefresh, dark, onToggleTheme, onShowHistory }: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await api.createBoard(newName.trim());
    setNewName('');
    onRefresh();
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    await api.renameBoard(id, editName.trim());
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить доску и все её данные?')) return;
    await api.deleteBoard(id);
    onRefresh();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Trello Lite</h1>
        <div className="new-board-form">
          <input
            placeholder="Новая доска..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button onClick={handleCreate}>+</button>
        </div>
      </div>

      <div className="board-list">
        {boards.map((board) => (
          <div
            key={board.id}
            className={`board-item ${currentBoardId === board.id ? 'active' : ''}`}
            onClick={() => onSelect(board.id)}
          >
            {editingId === board.id ? (
              <input
                className="board-item-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(board.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(board.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="board-item-name">{board.name}</span>
            )}
            <div className="board-actions">
              <button
                className="icon-btn"
                title="Переименовать"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(board.id);
                  setEditName(board.name);
                }}
              >
                ✎
              </button>
              <button className="icon-btn" title="Удалить" onClick={(e) => handleDelete(board.id, e)}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="secondary" onClick={onToggleTheme}>
          {dark ? '☀️ Светлая' : '🌙 Тёмная'}
        </button>
        <button className="secondary" onClick={onShowHistory}>
          История
        </button>
      </div>
    </aside>
  );
}
