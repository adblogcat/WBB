'use client'
import * as React from 'react'
import { TASKS, Task, TaskStatus } from '@/lib/tasks'

type SortKey = 'id' | 'title' | 'status' | 'priority' | 'created' | 'owner'
type SortDir = 'asc' | 'desc'

const STATUS_OPTIONS: Array<'' | TaskStatus> = ['', 'Active', 'Done', 'Blocked']
const PAGE_SIZE = 10

const STATUS_PILL: Record<TaskStatus, string> = {
  Active:  'pill pill-active',
  Done:    'pill pill-done',
  Blocked: 'pill pill-blocked',
}
const PRIORITY_PILL: Record<Task['priority'], string> = {
  High: 'pill pill-high',
  Med:  'pill pill-med',
  Low:  'pill pill-low',
}

export default function DashboardPage() {
  const [status, setStatus]   = React.useState<'' | TaskStatus>('')
  const [query, setQuery]     = React.useState('')
  const [sortKey, setSortKey] = React.useState<SortKey>('id')
  const [sortDir, setSortDir] = React.useState<SortDir>('asc')
  const [page, setPage]       = React.useState(1)

  // ──────────────────────────────────────────────────────────
  // Filtering
  // ──────────────────────────────────────────────────────────
  const filtered = React.useMemo<Task[]>(() => {
    let rows = TASKS

    // BUG DASH-002: status filter handler is wired to a constant `true`
    // instead of comparing `r.status === status`. Selecting "Active" still
    // returns Done/Blocked rows.
    if (status) {
      rows = rows.filter(r => true)
    }

    // BUG DASH-004: search uses raw `String.prototype.includes` with no
    // case-folding on either side. Typing "apple" misses "Apple migration".
    const q = query.trim()
    if (q) {
      rows = rows.filter(r => r.title.includes(q))
    }

    return rows
  }, [status, query])

  // ──────────────────────────────────────────────────────────
  // Sorting
  // ──────────────────────────────────────────────────────────
  const sorted = React.useMemo<Task[]>(() => {
    const copy = filtered.slice()
    copy.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'id':
          cmp = a.id - b.id
          break
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'priority':
          cmp = a.priority.localeCompare(b.priority)
          break
        case 'created':
          // BUG DASH-001: lexicographic compare on the ISO-ish string. Because
          // some rows use '2025-1-5' (non-padded month/day), the natural date
          // order is violated — e.g. '2025-01-10' sorts BEFORE '2025-1-5'.
          // Correct fix would parse via `new Date(...)` (or zero-pad) first.
          cmp = a.created.localeCompare(b.created)
          break
        case 'owner':
          cmp = a.owner.localeCompare(b.owner)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir])

  // ──────────────────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const startIdx = (page - 1) * PAGE_SIZE
  const pageRows = sorted.slice(startIdx, startIdx + PAGE_SIZE)

  // Reset to page 1 when filters change.
  React.useEffect(() => { setPage(1) }, [status, query])

  function handleSort(key: SortKey) {
    // BUG DASH-005: clicking a header always forces ascending — clicking the
    // same header a second time does NOT toggle to descending. Correct
    // behaviour would be: if same key, flip dir; else reset to 'asc'.
    setSortKey(key)
    setSortDir('asc')
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return <span className="arrow">↕</span>
    return <span className="arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">Task Dashboard</span>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Задачи команды</h1>
          <p>Фильтруйте, сортируйте и листайте список задач.</p>
        </div>

        <div className="filters">
          <label>
            Статус:
            <select
              value={status}
              onChange={e => setStatus(e.target.value as '' | TaskStatus)}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s || 'all'} value={s}>{s || 'All'}</option>
              ))}
            </select>
          </label>
          <label>
            Поиск:
            <input
              type="search"
              placeholder="по названию задачи…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
          <span className="count">{sorted.length} задач</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID{arrow('id')}</th>
                <th onClick={() => handleSort('title')}>Название{arrow('title')}</th>
                <th onClick={() => handleSort('status')}>Статус{arrow('status')}</th>
                <th onClick={() => handleSort('priority')}>Приоритет{arrow('priority')}</th>
                <th onClick={() => handleSort('created')}>Сортировать по дате{arrow('created')}</th>
                <th onClick={() => handleSort('owner')}>Ответственный{arrow('owner')}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">Нет задач, соответствующих фильтру.</div>
                  </td>
                </tr>
              ) : (
                pageRows.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td><span className={STATUS_PILL[t.status]}>{t.status}</span></td>
                    <td><span className={PRIORITY_PILL[t.priority]}>{t.priority}</span></td>
                    <td>{t.created}</td>
                    <td>{t.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pager">
          {/* BUG DASH-006: pagination buttons have no `disabled` attribute and
              no greyed style at boundaries. On page 1, "‹ Prev" still looks
              clickable; on the last page, "Next ›" still looks clickable
              (and per DASH-003 clicking it actually advances past M). */}
          <button onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Prev</button>
          <span className="page-info">Стр. {page} из {totalPages}</span>
          {/* BUG DASH-003: no `currentPage < totalPages` guard. Clicking
              "Next ›" on the last page bumps the counter to M+1, the table
              renders empty rows, and the label reads "Стр. M+1 из M". */}
          <button onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      </div>
    </>
  )
}
