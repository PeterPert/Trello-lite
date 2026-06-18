import { useEffect, useRef } from 'react';
import { api } from '../api';
import { formatDeadline } from '../types';

const notified = new Set<number>();

export function useDeadlineNotifications(enabled: boolean) {
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (Notification.permission !== 'granted') return;

      try {
        const items = await api.getDeadlineNotifications(24);
        const now = Date.now();
        for (const item of items) {
          const deadline = new Date(item.deadline).getTime();
          const key = item.cardId;
          if (notified.has(key)) continue;

          const hoursLeft = (deadline - now) / (1000 * 60 * 60);
          if (hoursLeft <= 24 && hoursLeft >= -24) {
            const overdue = deadline < now;
            new Notification(overdue ? 'Просрочен дедлайн!' : 'Приближается дедлайн', {
              body: `${item.cardTitle} (${item.boardName}) — ${formatDeadline(item.deadline)}`,
              tag: `deadline-${key}`,
            });
            notified.add(key);
          }
        }
      } catch {
        /* ignore polling errors */
      }
    };

    check();
    intervalRef.current = window.setInterval(check, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);
}
