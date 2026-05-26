'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { writeUser, setSession } from '@/lib/auth'

export default function SignupPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [agreed, setAgreed] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  // BUG AUTH-006: handler is synchronous and the button has no `disabled`
  // state while submitting — there is no loading spinner, so users can click
  // "Создать" multiple times and trigger duplicate side effects. Correct
  // behaviour would set a `submitting` state, disable the button, and show
  // a spinner/label change.
  function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    // BUG AUTH-002: the "Согласен с условиями" checkbox is rendered for show
    // only — the submit handler never reads `agreed`, so signup succeeds even
    // when the box is unchecked. Correct behaviour: block submit when !agreed
    // and surface an error message.
    // BUG AUTH-003 (in writeUser): no duplicate-email check — writeUser
    // unconditionally overwrites any existing account with the same email.
    writeUser({ email, password })
    setSession(email)
    router.push('/account')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Auth Portal</Link>
        <Link href="/login" className="nav-link">Вход</Link>
        <Link href="/signup" className="nav-link">Регистрация</Link>
        <Link href="/forgot" className="nav-link">Забыли пароль?</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Создание аккаунта</h1>
          <p>Заполните форму, чтобы зарегистрироваться.</p>
        </div>
        <div className="card">
          <form className="form" onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="signup-password">Пароль</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="signup-confirm">Подтверждение пароля</label>
              <input
                id="signup-confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Повторите пароль"
                required
              />
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              Согласен с условиями использования
            </label>
            {error && <div className="error">{error}</div>}
            <button className="btn" type="submit">Создать</button>
            <div className="center-text helper">
              Уже есть аккаунт? <Link href="/login" className="link">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
