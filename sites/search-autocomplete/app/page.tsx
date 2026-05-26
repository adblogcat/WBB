'use client'
import * as React from 'react'
import { ITEMS, Item } from '@/lib/items'

const RECENTS_KEY = 'wbb_search_recents'
const MAX_RECENTS = 5

export default function SearchPage() {
  const [input, setInput] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [recents, setRecents] = React.useState<string[]>([])

  // Load recents from localStorage on mount.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY)
      if (raw) setRecents(JSON.parse(raw))
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  function persistRecents(next: string[]) {
    setRecents(next)
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
    } catch {
      /* ignore storage quota errors */
    }
  }

  // BUG SEARCH-004: suggestions are computed ONCE from the initial input
  // and cached in useState. They never re-compute when `input` changes,
  // so the dropdown always shows the original stale list, and "Очистить
  // историю" has no effect on what is being suggested. Correct behaviour
  // would be `useMemo` over `input` (or recompute every render).
  const [suggestions] = React.useState<Item[]>(() => {
    const q = ''
    if (q.length < 2) return []
    return ITEMS.filter(it => it.name.toLowerCase().includes(q.toLowerCase()))
  })

  // Live suggestions actually shown in the dropdown. We *do* recompute here,
  // but BUG SEARCH-002 caps the slice at 3 instead of the documented 8.
  const liveSuggestions = React.useMemo<Item[]>(() => {
    const q = input.trim().toLowerCase()
    if (q.length < 2) return []
    // BUG SEARCH-005: plain .includes() with no Unicode normalisation.
    // "naive" will NOT match "Naïve Bayes Explained" because the diacritic
    // makes the codepoints different. Correct: NFD-strip combining marks.
    const matches = ITEMS.filter(it => it.name.toLowerCase().includes(q))
    // BUG SEARCH-002: slice(0, 3) — spec says up to 8 suggestions.
    return matches.slice(0, 3)
  }, [input])

  // Results shown in the main list once a search is committed.
  const results = React.useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ITEMS.filter(it => it.name.toLowerCase().includes(q))
  }, [query])

  function runSearch(value: string) {
    const v = value.trim()
    if (!v) return
    setQuery(v)
    setOpen(false)
    // BUG SEARCH-003: recents are pushed without a dedupe check. Searching
    // the same query twice produces two identical entries. Correct: filter
    // out the existing occurrence before prepending.
    const next = [v, ...recents].slice(0, MAX_RECENTS)
    persistRecents(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runSearch(input)
  }

  // BUG SEARCH-001: clicking a suggestion sets the "selected" id but
  // FORGETS to update `input`. The user expects the input to fill with the
  // suggestion's name and the search to fire — instead the input stays
  // unchanged. Correct: setInput(item.name) before runSearch().
  const [, setSelectedId] = React.useState<string | null>(null)
  function handlePick(item: Item) {
    setSelectedId(item.id)
    runSearch(item.name)
  }

  function clearHistory() {
    persistRecents([])
  }

  // BUG SEARCH-006: no document-level click handler to close the dropdown
  // when clicking outside the search wrapper. The dropdown stays open until
  // the user explicitly blurs or submits. Correct: useEffect with a
  // mousedown listener that checks `wrapRef.current?.contains(e.target)`.
  const wrapRef = React.useRef<HTMLDivElement>(null)

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">Search</span>
        <span className="nav-link">Автодополнение и история</span>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Поиск по каталогу</h1>
          <p>Книги, товары, места, статьи — всё в одном поле.</p>
        </div>

        <form onSubmit={handleSubmit} className="search-wrap" ref={wrapRef}>
          <input
            type="search"
            className="search-input"
            placeholder="Поиск…"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
          />
          {open && liveSuggestions.length > 0 && (
            <ul className="dropdown" role="listbox">
              {liveSuggestions.map(item => (
                <li
                  key={item.id}
                  className="dropdown-item"
                  role="option"
                  aria-selected="false"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handlePick(item)}
                >
                  <span className="name">{item.name}</span>
                  <span className="cat">{item.category}</span>
                </li>
              ))}
            </ul>
          )}
          {/* Reference to suppress unused-var hint when bug masks logic. */}
          <span hidden>{suggestions.length}</span>
        </form>

        <section className="recents">
          <div className="recents-head">
            <h3>Недавние поисковые запросы</h3>
            <button type="button" className="btn-clear" onClick={clearHistory}>
              Очистить историю
            </button>
          </div>
          {recents.length === 0 ? (
            <div className="recents-empty">История пуста</div>
          ) : (
            <div className="recents-list">
              {recents.map((r, idx) => (
                <button
                  key={`${r}-${idx}`}
                  type="button"
                  className="recent-chip"
                  onClick={() => {
                    setInput(r)
                    runSearch(r)
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </section>

        {query && (
          <>
            <div className="results-head">
              Результаты по запросу «{query}» — {results.length}
            </div>
            {results.length === 0 ? (
              <div className="empty">Ничего не найдено</div>
            ) : (
              <div className="results">
                {results.map(item => (
                  <div className="result-card" key={item.id}>
                    <div className="name">{item.name}</div>
                    <div className="cat">{item.category}</div>
                    <div className="tags">
                      {item.tags.map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
