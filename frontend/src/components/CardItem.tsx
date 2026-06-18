import { formatDeadline, getLabelColor, isOverdue, parseLabels } from '../types';
import type { Card } from '../types';

interface Props {
  card: Card;
  onClick: () => void;
  highlighted?: boolean;
}

export function CardItem({ card, onClick, highlighted }: Props) {
  const labels = parseLabels(card.labels);
  const overdue = isOverdue(card.deadline);

  return (
    <div
      className={`card-item ${overdue ? 'overdue' : ''} ${highlighted ? 'search-match' : ''}`}
      onClick={onClick}
    >
      {labels.length > 0 && (
        <div className="card-labels">
          {labels.map((l) => (
            <span key={l} className="label-badge" style={{ background: getLabelColor(l) }} title={l} />
          ))}
        </div>
      )}
      <div className="card-title">{card.title}</div>
      {card.deadline && (
        <div className={`card-deadline ${overdue ? 'overdue' : ''}`}>
          {overdue ? '⚠ ' : '🕐 '}
          {formatDeadline(card.deadline)}
        </div>
      )}
    </div>
  );
}

export function CardDragOverlay({ card }: { card: Card }) {
  return (
    <div className="drag-overlay-card">
      <div className="card-title">{card.title}</div>
    </div>
  );
}
