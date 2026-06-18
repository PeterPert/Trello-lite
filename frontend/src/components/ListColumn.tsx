import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { BoardList, Card } from '../types';
import { api } from '../api';
import { CardItem } from './CardItem';

interface Props {
  list: BoardList;
  searchQuery: string;
  searchResults: Set<number>;
  onCardClick: (card: Card) => void;
  onRefresh: () => void;
  onSetSaving: () => void;
  onSetSaved: () => void;
  onSetError: () => void;
}

export function ListColumn({
  list,
  searchQuery,
  searchResults,
  onCardClick,
  onRefresh,
  onSetSaving,
  onSetSaved,
  onSetError,
}: Props) {
  const [title, setTitle] = useState(list.title);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`,
    data: { type: 'list', listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleBlur = async () => {
    if (title.trim() && title !== list.title) {
      onSetSaving();
      try {
        await api.renameList(list.id, title.trim());
        onSetSaved();
        onRefresh();
      } catch {
        onSetError();
        setTitle(list.title);
      }
    } else {
      setTitle(list.title);
    }
  };

  const handleAddCard = async () => {
    if (!newTitle.trim()) return;
    onSetSaving();
    try {
      await api.createCard(list.id, newTitle.trim());
      setNewTitle('');
      setAdding(false);
      onSetSaved();
      onRefresh();
    } catch {
      onSetError();
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('Удалить список и все карточки?')) return;
    onSetSaving();
    try {
      await api.deleteList(list.id);
      onSetSaved();
      onRefresh();
    } catch {
      onSetError();
    }
  };

  const cardIds = list.cards.map((c) => `card-${c.id}`);

  return (
    <div ref={setNodeRef} style={style} className="list-column">
      <div className="list-header">
        <span className="list-drag-handle" {...attributes} {...listeners}>
          ⠿
        </span>
        <input
          className="list-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
        <button className="icon-btn" title="Удалить список" onClick={handleDeleteList}>
          ×
        </button>
      </div>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="cards-container">
          {list.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              highlighted={searchQuery.length > 0 && searchResults.has(card.id)}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </SortableContext>

      <div className="add-card-input">
        {adding ? (
          <>
            <input
              placeholder="Название карточки..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
              autoFocus
            />
            <button onClick={handleAddCard}>Добавить</button>
            <button className="secondary" onClick={() => setAdding(false)}>
              Отмена
            </button>
          </>
        ) : (
          <button onClick={() => setAdding(true)}>+ Добавить карточку</button>
        )}
      </div>
    </div>
  );
}

function SortableCard({
  card,
  onClick,
  highlighted,
}: {
  card: Card;
  onClick: () => void;
  highlighted?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', cardId: card.id, listId: card.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardItem card={card} onClick={onClick} highlighted={highlighted} />
    </div>
  );
}
