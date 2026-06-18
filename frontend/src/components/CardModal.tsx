import { useEffect, useState } from 'react';
import { LABEL_OPTIONS, getLabelColor, parseLabels, toDatetimeLocal } from '../types';
import type { Card } from '../types';
import { api } from '../api';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  card: Card;
  onClose: () => void;
  onSaved: () => void;
  onSetSaving: () => void;
  onSetSaved: () => void;
  onSetError: () => void;
}

export function CardModal({ card, onClose, onSaved, onSetSaving, onSetSaved, onSetError }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [labels, setLabels] = useState<string[]>(parseLabels(card.labels));
  const [deadline, setDeadline] = useState(toDatetimeLocal(card.deadline));

  const debouncedTitle = useDebounce(title, 500);
  const debouncedDescription = useDebounce(description, 500);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setLabels(parseLabels(card.labels));
    setDeadline(toDatetimeLocal(card.deadline));
  }, [card.id]);

  useEffect(() => {
    if (debouncedTitle === card.title) return;
    save({ title: debouncedTitle });
  }, [debouncedTitle]);

  useEffect(() => {
    if (debouncedDescription === (card.description || '')) return;
    save({ description: debouncedDescription });
  }, [debouncedDescription]);

  const save = async (data: Record<string, unknown>) => {
    onSetSaving();
    try {
      await api.updateCard(card.id, data);
      onSetSaved();
      onSaved();
    } catch {
      onSetError();
    }
  };

  const toggleLabel = (key: string) => {
    const next = labels.includes(key) ? labels.filter((l) => l !== key) : [...labels, key];
    setLabels(next);
    save({ labels: next });
  };

  const handleDeadlineChange = (value: string) => {
    setDeadline(value);
    if (!value) {
      save({ clearDeadline: true });
    } else {
      save({ deadline: value.length === 16 ? `${value}:00` : value });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить карточку?')) return;
    await api.deleteCard(card.id);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Редактирование карточки</h3>

        <div className="modal-field">
          <label>Название</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Описание</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Метки</label>
          <div className="label-picker">
            {LABEL_OPTIONS.map((opt) => (
              <span
                key={opt.key}
                className={`label-option ${labels.includes(opt.key) ? 'selected' : ''}`}
                style={{ background: getLabelColor(opt.key) }}
                onClick={() => toggleLabel(opt.key)}
              >
                {opt.name}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-field">
          <label>Дедлайн</label>
          <input type="datetime-local" value={deadline} onChange={(e) => handleDeadlineChange(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="danger" onClick={handleDelete}>
            Удалить
          </button>
          <button className="secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
