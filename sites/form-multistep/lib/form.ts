// Multi-step signup form helpers — localStorage-backed, no backend.
// Shape: { step1: { email, name }, step2: { password, confirm }, step3: { agreed } }
'use client'

export interface Step1 { email: string; name: string }
export interface Step2 { password: string; confirm: string }
export interface Step3 { agreed: boolean }

const KEY = 'wbb-form-multistep-state'

interface FormState {
  step1?: Step1
  step2?: Step2
  step3?: Step3
  submitted?: boolean
}

function readState(): FormState {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function writeState(next: FormState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(next))
}

export function writeStep1(data: Step1): void {
  const state = readState()
  writeState({ ...state, step1: data })
}

// BUG FORM-003: readStep1() always returns empty defaults instead of reading
// the persisted state. So when the user clicks "Назад" from step2 to step1,
// the email and name fields appear blank — their previous input is lost from
// the UI even though it's still in localStorage. Correct behaviour: return
// readState().step1 ?? { email: '', name: '' }.
export function readStep1(): Step1 {
  if (typeof window === 'undefined') return { email: '', name: '' }
  return { email: '', name: '' }
}

export function writeStep2(data: Step2): void {
  const state = readState()
  writeState({ ...state, step2: data })
}

export function readStep2(): Step2 {
  const state = readState()
  return state.step2 ?? { password: '', confirm: '' }
}

export function writeStep3(data: Step3): void {
  const state = readState()
  writeState({ ...state, step3: data })
}

export function readStep3(): Step3 {
  const state = readState()
  return state.step3 ?? { agreed: false }
}

export function markSubmitted(): void {
  const state = readState()
  writeState({ ...state, submitted: true })
}

export function clearForm(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
