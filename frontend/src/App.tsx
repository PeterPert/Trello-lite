import { useCallback, useEffect, useState } from 'react';
import type { Board, BoardDetail } from './types';
import { api } from './api';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { HistoryPanel } from './components/HistoryPanel';
import { useTheme } from './hooks/useTheme';
import { useCurrentBoard, useSaveStatus } from './hooks/useStorage';
import { useDeadlineNotifications } from './hooks/useDeadlineNotifications';

export default function App() {
  const { dark, toggle: toggleTheme } = useTheme();
  const { currentBoardId, setCurrentBoardId } = useCurrentBoard();
  const { status, setStatus } = useSaveStatus();
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardDetail, setBoardDetail] = useState<BoardDetail | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useDeadlineNotifications(true);

  const loadBoards = useCallback(async () => {
    const data = await api.getBoards();
    setBoards(data);
    if (data.length > 0 && currentBoardId && !data.find((b) => b.id === currentBoardId)) {
      setCurrentBoardId(data[0].id);
    } else if (data.length > 0 && !currentBoardId) {
      setCurrentBoardId(data[0].id);
    }
  }, [currentBoardId, setCurrentBoardId]);

  const loadBoardDetail = useCallback(async () => {
    if (!currentBoardId) {
      setBoardDetail(null);
      return;
    }
    const detail = await api.getBoard(currentBoardId);
    setBoardDetail(detail);
  }, [currentBoardId]);

  useEffect(() => {
    loadBoards().catch(console.error);
  }, [loadBoards]);

  useEffect(() => {
    loadBoardDetail().catch(console.error);
  }, [loadBoardDetail]);

  const saveStatusText =
    status === 'saving' ? 'Сохранение...' : status === 'saved' ? 'Сохранено ✓' : status === 'error' ? 'Ошибка!' : '';

  return (
    <div className="app-layout">
      <Sidebar
        boards={boards}
        currentBoardId={currentBoardId}
        onSelect={setCurrentBoardId}
        onRefresh={async () => {
          await loadBoards();
          await loadBoardDetail();
        }}
        dark={dark}
        onToggleTheme={toggleTheme}
        onShowHistory={() => setShowHistory(true)}
      />

      <main className="main-content">
        {boardDetail ? (
          <BoardView
            board={boardDetail}
            onRefresh={loadBoardDetail}
            saveStatus={saveStatusText}
            onSetSaving={() => setStatus('saving')}
            onSetSaved={() => setStatus('saved')}
            onSetError={() => setStatus('error')}
          />
        ) : (
          <div className="empty-state">
            {boards.length === 0 ? 'Создайте первую доску слева' : 'Выберите доску'}
          </div>
        )}
      </main>

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
