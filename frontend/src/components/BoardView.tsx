import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { BoardDetail, Card } from '../types';
import { api } from '../api';
import { ListColumn } from './ListColumn';
import { CardDragOverlay } from './CardItem';
import { CardModal } from './CardModal';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  board: BoardDetail;
  onRefresh: () => void;
  saveStatus: string;
  onSetSaving: () => void;
  onSetSaved: () => void;
  onSetError: () => void;
}

export function BoardView({ board, onRefresh, saveStatus, onSetSaving, onSetSaved, onSetError }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const listIds = board.lists.map((l) => `list-${l.id}`);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults(new Set());
      return;
    }
    api
      .search(board.id, debouncedSearch)
      .then((cards) => setSearchResults(new Set(cards.map((c) => c.id))))
      .catch(() => setSearchResults(new Set()));
  }, [board.id, debouncedSearch]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'card') {
      const card = board.lists.flatMap((l) => l.cards).find((c) => c.id === data.cardId);
      if (card) setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'list' && overData?.type === 'list') {
      const activeId = activeData.listId as number;
      const overId = overData.listId as number;
      if (activeId === overId) return;

      const oldIndex = board.lists.findIndex((l) => l.id === activeId);
      const newIndex = board.lists.findIndex((l) => l.id === overId);
      const reordered = arrayMove(board.lists, oldIndex, newIndex);
      onSetSaving();
      try {
        await api.reorderLists(board.id, reordered.map((l) => l.id));
        onSetSaved();
        onRefresh();
      } catch {
        onSetError();
      }
      return;
    }

    if (activeData?.type === 'card') {
      const cardId = activeData.cardId as number;
      let targetListId: number;
      let position: number;

      if (overData?.type === 'card') {
        targetListId = overData.listId as number;
        const targetList = board.lists.find((l) => l.id === targetListId);
        if (!targetList) return;
        position = targetList.cards.findIndex((c) => c.id === (overData.cardId as number));
      } else if (overData?.type === 'list') {
        targetListId = overData.listId as number;
        const targetList = board.lists.find((l) => l.id === targetListId);
        position = targetList ? targetList.cards.length : 0;
      } else {
        return;
      }

      onSetSaving();
      try {
        await api.moveCard(cardId, targetListId, position);
        onSetSaved();
        onRefresh();
      } catch {
        onSetError();
      }
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    onSetSaving();
    try {
      await api.createList(board.id, newListTitle.trim());
      setNewListTitle('');
      setAddingList(false);
      onSetSaved();
      onRefresh();
    } catch {
      onSetError();
    }
  };

  const findCardById = (id: number): Card | undefined =>
    board.lists.flatMap((l) => l.cards).find((c) => c.id === id);

  return (
    <>
      <div className="top-bar">
        <h2>{board.name}</h2>
        <input
          className="search"
          placeholder="Поиск по карточкам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="toolbar">
          <span className="save-status">{saveStatus}</span>
          <button
            className="secondary"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => api.exportHtml(board.id)}
          >
            HTML
          </button>
          <button
            className="secondary"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => api.exportPdf(board.id)}
          >
            PDF
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-area">
          <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
            {board.lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                searchQuery={searchQuery}
                searchResults={searchResults}
                onCardClick={(card) => setSelectedCard(card)}
                onRefresh={onRefresh}
                onSetSaving={onSetSaving}
                onSetSaved={onSetSaved}
                onSetError={onSetError}
              />
            ))}
          </SortableContext>

          {addingList ? (
            <div className="list-column">
              <input
                placeholder="Название списка..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                autoFocus
              />
              <button onClick={handleAddList} style={{ marginTop: 8 }}>
                Добавить
              </button>
              <button className="secondary" onClick={() => setAddingList(false)} style={{ marginTop: 4 }}>
                Отмена
              </button>
            </div>
          ) : (
            <button className="add-list-btn" onClick={() => setAddingList(true)}>
              + Добавить список
            </button>
          )}
        </div>

        <DragOverlay>{activeCard ? <CardDragOverlay card={activeCard} /> : null}</DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={findCardById(selectedCard.id) || selectedCard}
          onClose={() => setSelectedCard(null)}
          onSaved={onRefresh}
          onSetSaving={onSetSaving}
          onSetSaved={onSetSaved}
          onSetError={onSetError}
        />
      )}
    </>
  );
}
