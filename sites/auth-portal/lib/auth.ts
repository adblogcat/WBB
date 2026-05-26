// Auth helpers — localStorage-backed, no backend.
// User DB shape: { [email]: { email, password } }
// Session: { email } stored under a separate key.
'use client'

export interface User { email: string; password: string }

const USERS_KEY = 'wbb-auth-users'
const SESSION_KEY = 'wbb-auth-session'

export function readUsers(): Record<string, User> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}

export function writeUser(user: User): void {
  if (typeof window === 'undefined') return
  // BUG AUTH-003: unconditionally overwrites any existing user with the same
  // email — no duplicate check. The correct behaviour is to reject signup
  // when readUsers()[user.email] already exists.
  const users = readUsers()
  users[user.email] = user
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUser(email: string): User | undefined {
  return readUsers()[email]
}

export function setSession(email: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ email }))
}

export function readSession(): { email: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
}

export function updatePassword(email: string, newPassword: string): void {
  if (typeof window === 'undefined') return
  const users = readUsers()
  if (users[email]) {
    users[email] = { ...users[email], password: newPassword }
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
}
