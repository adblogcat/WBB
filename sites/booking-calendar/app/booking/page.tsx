'use client'
import * as React from 'react'
import Link from 'next/link'
import { BookingForm, submit, todayISO } from '@/lib/booking'

const GUEST_OPTIONS = ['1', '2', '3', '4', '5+']

export default function BookingPage() {
  const today = todayISO()
  const [form, setForm] = React.useState<BookingForm>({
    date: '',
    time: '',
    guests: '2',
    name: '',
    email: '',
  })
  const [open, setOpen] = React.useState(false)
  const [confirmed, setConfirmed] = React.useState<string | null>(null)

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // BUG BOOK-001: date picker uses HTML `min={today}` attribute but no JS
  // validation. Many browsers still let the user type or paste a past date.
  // BUG BOOK-002: time picker has no min/max — accepts 03:00, 23:30, etc.
  // BUG BOOK-004: handler opens the modal regardless of form validity, so the
  // user can submit with empty Name/Email. Confirming in the modal then
  // registers an empty booking.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(true)
  }

  function handleConfirm() {
    submit(form)
    setConfirmed(`Бронь подтверждена на ${form.date || '—'} ${form.time || '—'}`)
    setOpen(false)
    window.setTimeout(() => setConfirmed(null), 2600)
  }

  // BUG BOOK-006: cancel only closes the modal, no form reset. The form keeps
  // the previous values, which confuses users on repeat bookings.
  function handleCancel() {
    setOpen(false)
  }

  // BUG BOOK-005: confirmation modal does NOT close on Escape — no keydown
  // listener is wired up. (A useEffect adding 'keydown' is intentionally
  // missing.)

  // Focus trap target — first button inside the modal gets focused on open.
  const firstActionRef = React.useRef<HTMLButtonElement | null>(null)
  React.useEffect(() => {
    if (open && firstActionRef.current) firstActionRef.current.focus()
  }, [open])

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Bistro 42</Link>
        <Link href="/" className="nav-link">Главная</Link>
        <Link href="/booking" className="nav-link">Бронирование</Link>
      </nav>
      <div className="container">
        <div className="form-card">
          <h2>Бронирование столика</h2>
          <p className="lead">Заполните данные, и мы сохраним за вами столик.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="label" htmlFor="bk-date">Дата</label>
              <input
                id="bk-date"
                type="date"
                min={today}
                value={form.date}
                onChange={e => update('date', e.target.value)}
              />
              <span className="help">Рабочие дни: ежедневно.</span>
            </div>

            <div className="field">
              <label className="label" htmlFor="bk-time">Время</label>
              {/* BUG BOOK-002: no min/max attributes, no client-side range check.
                  Working hours are 11:00–22:00 but the input accepts any time. */}
              <input
                id="bk-time"
                type="time"
                step={1800}
                value={form.time}
                onChange={e => update('time', e.target.value)}
              />
              <span className="help">Слоты по 30 минут.</span>
            </div>

            <div className="field" role="group" aria-label="Количество гостей">
              <span className="label">Гости</span>
              {/* BUG BOOK-003: label is a plain <label> without htmlFor — clicking
                  the visible "1" / "2" / ... text does NOT toggle the radio.
                  The user has to hit the small circle precisely. */}
              <div className="radio-row">
                {GUEST_OPTIONS.map(opt => (
                  <span className="radio-chip" key={opt}>
                    <input
                      type="radio"
                      name="guests"
                      value={opt}
                      checked={form.guests === opt}
                      onChange={() => update('guests', opt)}
                    />
                    <label>{opt}</label>
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="bk-name">Имя</label>
              {/* BUG BOOK-004 contributor: no `required`, no validation before
                  opening the modal. */}
              <input
                id="bk-name"
                type="text"
                placeholder="Иван Иванов"
                value={form.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="bk-email">Email</label>
              <input
                id="bk-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
              />
            </div>

            <div className="submit-row">
              <button type="submit" className="btn">Подтвердить бронирование</button>
            </div>
          </form>

          {confirmed && <div className="notice">{confirmed}</div>}
        </div>
      </div>

      {open && (
        <div
          className="modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) handleCancel() }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h3 id="confirm-title">Подтверждение брони</h3>
            <p className="lead">Проверьте детали перед подтверждением.</p>
            <div className="summary">
              <div className="summary-row"><span className="k">Дата</span><span className="v">{form.date || '—'}</span></div>
              <div className="summary-row"><span className="k">Время</span><span className="v">{form.time || '—'}</span></div>
              <div className="summary-row"><span className="k">Гости</span><span className="v">{form.guests}</span></div>
              <div className="summary-row"><span className="k">Имя</span><span className="v">{form.name || '—'}</span></div>
              <div className="summary-row"><span className="k">Email</span><span className="v">{form.email || '—'}</span></div>
            </div>
            <div className="modal-actions">
              <button
                ref={firstActionRef}
                type="button"
                className="btn"
                onClick={handleConfirm}
              >
                Подтвердить
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
