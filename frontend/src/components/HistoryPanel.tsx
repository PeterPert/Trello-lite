import { useEffect, useState } from 'react';
import type { ChangeLog } from '../types';
import { api } from '../api';

interface Props {
  onClose: () => void;
}

export function HistoryPanel({ onClose }: Props) {
  const [logs, setLogs] = useState<ChangeLog[]>([]);

  useEffect(() => {
    api.getHistory().then(setLogs).catch(() => setLogs([]));
  }, []);

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      CREATE: 'Создание',
      DELETE: 'Удаление',
      RENAME: 'Переименование',
      UPDATE: 'Изменение',
      MOVE: 'Перемещение',
      REORDER_LISTS: 'Сортировка списков',
    };
    return map[action] || action;
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      BOARD: 'Доска',
      LIST: 'Список',
      CARD: 'Карточка',
    };
    return map[type] || type;
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>История изменений</h3>
        <button className="icon-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="history-list">
        {logs.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Нет записей</p>}
        {logs.map((log) => (
          <div key={log.id} className="history-item">
            <strong>{actionLabel(log.action)}</strong> — {typeLabel(log.entityType)} #{log.entityId}
            <div>{log.details}</div>
            <time>{new Date(log.timestamp).toLocaleString('ru-RU')}</time>
          </div>
        ))}
      </div>
    </div>
  );
}
