import { useEffect, useState } from 'react';

const KEY = 'currentBoardId';

export function useCurrentBoard() {
  const [currentBoardId, setCurrentBoardIdState] = useState<number | null>(() => {
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  });

  const setCurrentBoardId = (id: number | null) => {
    setCurrentBoardIdState(id);
    if (id === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(id));
  };

  return { currentBoardId, setCurrentBoardId };
}

export function useSaveStatus() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (status === 'saved') {
      const t = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return { status, setStatus };
}
