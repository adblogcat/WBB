'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/auth'

export default function ForgotPage() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // BUG AUTH-004: step 2 ("введите код подтверждения") is skipped — the
    // handler jumps straight from step 1 to step 3 ("новый пароль"). Correct
    // behaviour: setStep(2) so the user has to enter a 6-digit code first.
    setStep(3)
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{6}$/.test(code)) {
      setError('Код должен состоять из 6 цифр')
      return
    }
    setStep(3)
  }

  function submitNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    updatePassword(email, newPassword)
    router.push('/login')
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
          <h1>Восстановление пароля</h1>
          <p>Введите email, подтвердите код и задайте новый пароль.</p>
        </div>
        <div className="steps" aria-label="Шаги восстановления">
          <div className={`step ${step >= 1 ? 'active' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''}`} />
          <div className={`step ${step >= 3 ? 'active' : ''}`} />
        </div>
        <div className="card">
          {step === 1 && (
            <form className="form" onSubmit={submitEmail}>
              <div className="field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <p className="helper">
                Мы отправим 6-значный код на указанный email.
              </p>
              <button className="btn" type="submit">Отправить код</button>
            </form>
          )}

          {step === 2 && (
            <form className="form" onSubmit={submitCode}>
              <div className="field">
                <label htmlFor="forgot-code">Код подтверждения</label>
                <input
                  id="forgot-code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              <p className="helper">
                Введите любой 6-значный код (демо-режим).
              </p>
              {error && <div className="error">{error}</div>}
              <button className="btn" type="submit">Подтвердить</button>
            </form>
          )}

          {step === 3 && (
            <form className="form" onSubmit={submitNewPassword}>
              <div className="field">
                <label htmlFor="forgot-new">Новый пароль</label>
                <input
                  id="forgot-new"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="forgot-confirm">Подтверждение пароля</label>
                <input
                  id="forgot-confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button className="btn" type="submit">Сохранить пароль</button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
