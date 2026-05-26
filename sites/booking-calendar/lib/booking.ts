// Booking helpers — localStorage-backed, no backend.
// Working hours spec: 11:00 - 22:00, 30-minute slots.
'use client'

export interface BookingForm {
  date: string   // 'YYYY-MM-DD'
  time: string   // 'HH:MM'
  guests: string // '1' | '2' | '3' | '4' | '5+'
  name: string
  email: string
}

export interface Booking extends BookingForm {
  id: string
  createdAt: string
}

const KEY = 'wbb-bookings'

export function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getAvailableTimes(date: string): string[] {
  // 11:00 .. 22:00 in 30-min increments, regardless of which date — for demo.
  void date
  const slots: string[] = []
  for (let h = 11; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

export interface ValidationResult {
  ok: boolean
  errors: Record<string, string>
}

// NOTE: This validator is intentionally NOT called from the booking page in the
// current build — the bugs BOOK-001/002/004 rely on the page skipping it.
// It is kept here as the "intended" behaviour for reference.
export function validate(form: BookingForm): ValidationResult {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Введите имя'
  if (!form.email.trim()) errors.email = 'Введите email'
  if (!form.date) errors.date = 'Выберите дату'
  if (form.date && form.date < todayISO()) errors.date = 'Дата в прошлом'
  if (!form.time) errors.time = 'Выберите время'
  if (form.time) {
    const [h, m] = form.time.split(':').map(n => parseInt(n, 10))
    const mins = h * 60 + m
    if (mins < 11 * 60 || mins > 22 * 60) errors.time = 'Время вне рабочих часов 11:00–22:00'
  }
  return { ok: Object.keys(errors).length === 0, errors }
}

export function readBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function submit(form: BookingForm): Booking {
  const booking: Booking = {
    ...form,
    id: 'b_' + Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    const all = readBookings()
    all.push(booking)
    window.localStorage.setItem(KEY, JSON.stringify(all))
  }
  return booking
}
