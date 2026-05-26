'use client'
import * as React from 'react'
import Link from 'next/link'
import {
  INITIAL_CARDS,
  COLUMNS,
  LABELS,
  Card,
  ColumnId,
  Label,
  Priority,
} from '@/lib/cards'

const STORAGE_KEY = 'wbb-kanban-cards'

function loadCards(): Card[] {
  if (typeof window === 'undefined') return INITIAL_CARDS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_CARDS
    const parsed = JSON.parse(raw) as Card[]
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CARDS
    return parsed
  } catch {
    return INITIAL_CARDS
  }
}

export default function KanbanPage() {
  const [cards, setCards] = React.useState<Card[]>(INITIAL_CARDS)
  const [activeLabels, setActiveLabels] = React.useState<Label[]>([])
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = React.useState<ColumnId | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Load persisted state on mount.
  React.useEffect(() => {
    setCards(loadCards())
  }, [])

  function persistCards(next: Card[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota errors */
    }
  }

  function updateCard(id: string, patch: Partial<Card>) {
    setCards(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, ...patch } : c))
      persistCards(next)
      return next
    })
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverCol(null)
  }

  function handleDragOver(e: React.DragEvent, col: ColumnId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== col) setDragOverCol(col)
  }

  function handleDrop(e: React.DragEvent, col: ColumnId) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggingId
    if (!id) return
    // BUG KAN-001: drag-and-drop visually moves the card, but the new column
    // is only written into React state — never persisted to localStorage.
    // On a hard refresh, loadCards() returns whatever was last persisted
    // (typically INITIAL_CARDS), so the card snaps back to its original column.
    setCards(prev => prev.map(c => (c.id === id ? { ...c, column: col } : c)))
    setDraggingId(null)
    setDragOverCol(null)
  }

  function toggleLabelFilter(label: Label) {
    // BUG KAN-004: multi-select on label chips is broken. Clicking a second
    // chip *replaces* the first instead of toggling membership. The correct
    // behaviour would be: include label if absent, remove it if present.
    setActiveLabels([label])
  }

  function handleAddCard(col: ColumnId) {
    const newCard: Card = {
      id: 'c' + Date.now(),
      // BUG KAN-005: new card is created with undefined assignee/label/priority.
      // The UI later renders these as empty placeholders (no avatar text,
      // no label chip, no priority dot) instead of prompting the user
      // or applying sensible defaults.
      title: 'Новая карточка',
      assignee: undefined as unknown as string,
      label: undefined as unknown as Label,
      priority: undefined as unknown as Priority,
      column: col,
    }
    setCards(prev => {
      const next = [...prev, newCard]
      persistCards(next)
      return next
    })
  }

  const filteredCards = React.useMemo(() => {
    if (activeLabels.length === 0) return cards
    return cards.filter(c => c.label && activeLabels.includes(c.label))
  }, [cards, activeLabels])

  const editingCard = editingId ? cards.find(c => c.id === editingId) ?? null : null

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Kanban Board</Link>
        <Link href="/" className="nav-link">Доска</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Доска задач</h1>
          <p>Перетаскивайте карточки между колонками, кликайте для редактирования.</p>
        </div>

        <div className="filters">
          <span className="filters-label">Фильтр по метке:</span>
          {LABELS.map(label => {
            const active = activeLabels.includes(label)
            return (
              <button
                key={label}
                className={'chip ' + (active ? 'chip-active' : '')}
                onClick={() => toggleLabelFilter(label)}
              >
                {label}
              </button>
            )
          })}
          {activeLabels.length > 0 && (
            <button className="chip-clear" onClick={() => setActiveLabels([])}>
              Сбросить фильтр
            </button>
          )}
        </div>

        <div className="board">
          {COLUMNS.map(col => {
            const colCards = filteredCards.filter(c => c.column === col.id)
            return (
              <div
                key={col.id}
                className={'column ' + (dragOverCol === col.id ? 'column-drag-over' : '')}
                onDragOver={e => handleDragOver(e, col.id)}
                onDrop={e => handleDrop(e, col.id)}
                onDragLeave={() => setDragOverCol(prev => (prev === col.id ? null : prev))}
              >
                <div className="column-header">
                  <span className="column-title">{col.title}</span>
                  <span className="column-count">{colCards.length}</span>
                </div>

                {colCards.map(card => (
                  <CardView
                    key={card.id}
                    card={card}
                    dragging={draggingId === card.id}
                    onDragStart={e => handleDragStart(e, card.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setEditingId(card.id)}
                  />
                ))}

                <button className="add-card-btn" onClick={() => handleAddCard(col.id)}>
                  + Добавить карточку
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {editingCard && (
        <EditModal
          card={editingCard}
          onCancel={() => setEditingId(null)}
          onSaveTitle={(_title) => {
            // BUG KAN-003: title is intentionally NOT forwarded into updateCard
            // here. The modal mutates only its own local state, so when the
            // user clicks Save the title in the card on the board stays at
            // the previous value (assignee/label/priority do persist).
            // (The other fields are saved via the regular onChange handlers.)
          }}
          onChangeAssignee={value => updateCard(editingCard.id, { assignee: value })}
          onChangeLabel={value => updateCard(editingCard.id, { label: value })}
          onChangePriority={value => updateCard(editingCard.id, { priority: value })}
        />
      )}
    </>
  )
}

interface CardViewProps {
  card: Card
  dragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onClick: () => void
}

function CardView({ card, dragging, onDragStart, onDragEnd, onClick }: CardViewProps) {
  return (
    <div
      className={'card ' + (dragging ? 'card-dragging' : '')}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="card-title">{card.title}</div>
      <div className="card-meta">
        {card.label && <span className={'card-label label-' + card.label}>{card.label}</span>}
        <span className="card-spacer" />
        {/* BUG KAN-006: priority dot color is hard-coded grey regardless of
            priority. Should be e.g. green for low, amber for med, red for high. */}
        {card.priority && (
          <span
            className="card-priority"
            style={{ background: '#a1a1aa' }}
            title={'Приоритет: ' + card.priority}
          />
        )}
        {card.assignee && <span className="card-avatar">{card.assignee}</span>}
      </div>
    </div>
  )
}

interface EditModalProps {
  card: Card
  onCancel: () => void
  onSaveTitle: (title: string) => void
  onChangeAssignee: (value: string) => void
  onChangeLabel: (value: Label) => void
  onChangePriority: (value: Priority) => void
}

function EditModal({
  card,
  onCancel,
  onSaveTitle,
  onChangeAssignee,
  onChangeLabel,
  onChangePriority,
}: EditModalProps) {
  const [localTitle, setLocalTitle] = React.useState(card.title)

  function handleSave() {
    onSaveTitle(localTitle)
    // BUG KAN-002: after successful save the modal is *not* closed.
    // Should call onCancel() (or a dedicated onClose) here so the modal
    // dismisses. Currently the user is left staring at the editor.
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Редактировать карточку</h2>

        <div className="field">
          <label htmlFor="f-title">Заголовок</label>
          <input
            id="f-title"
            type="text"
            value={localTitle}
            onChange={e => setLocalTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="f-assignee">Исполнитель</label>
          <input
            id="f-assignee"
            type="text"
            value={card.assignee ?? ''}
            onChange={e => onChangeAssignee(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="f-label">Метка</label>
          <select
            id="f-label"
            value={card.label ?? ''}
            onChange={e => onChangeLabel(e.target.value as Label)}
          >
            <option value="" disabled>—</option>
            {LABELS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-priority">Приоритет</label>
          <select
            id="f-priority"
            value={card.priority ?? ''}
            onChange={e => onChangePriority(e.target.value as Priority)}
          >
            <option value="" disabled>—</option>
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Отмена</button>
          <button className="btn" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}
