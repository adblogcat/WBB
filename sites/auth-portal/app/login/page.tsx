'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setSession } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const router = useRouter()

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // BUG AUTH-001: no password verification against stored user. Anyone who
    // enters any email + any password is logged in and redirected to /account.
    // Correct behaviour: look up findUser(email), compare passwords, set a
    // session only on match, otherwise show an error.
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
          <h1>Вход в аккаунт</h1>
          <p>Введите email и пароль, чтобы продолжить.</p>
        </div>
        <div className="card">
          <form className="form" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Пароль</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn" type="submit">Войти</button>
            <div className="center-text">
              <Link href="/forgot" className="link">Забыли пароль?</Link>
            </div>
            <div className="center-text helper">
              Нет аккаунта? <Link href="/signup" className="link">Создать</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
