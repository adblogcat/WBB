'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readStep2, writeStep2 } from '@/lib/form'

export default function Step2Page() {
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const router = useRouter()

  React.useEffect(() => {
    const saved = readStep2()
    setPassword(saved.password)
    setConfirm(saved.confirm)
  }, [])

  function handleNext() {
    writeStep2({ password, confirm })
    router.push('/signup/step3')
  }

  function handleBack() {
    // Persist the current password fields, then go back to step1. The bug
    // visible to the user (FORM-003) is that step1 will show blank fields.
    writeStep2({ password, confirm })
    router.push('/signup/step1')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Аккаунт</Link>
        <Link href="/" className="nav-link">Главная</Link>
        <Link href="/signup/step1" className="nav-link">Регистрация</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Шаг 2 из 3</h1>
          <p>Придумайте пароль</p>
        </div>
        <div className="card-panel">
          <div className="steps">
            <div className="step-dot active" />
            <div className="step-dot active" />
            <div className="step-dot" />
          </div>
          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="confirm">Подтверждение пароля</label>
            <input
              id="confirm"
              type="password"
              placeholder="Повторите пароль"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn btn-secondary" onClick={handleBack}>← Назад</button>
            {/* BUG FORM-002: button is always enabled — no disabled={!password}
                guard. Clicking with an empty password proceeds to step3. */}
            <button className="btn" onClick={handleNext}>Далее</button>
          </div>
        </div>
      </div>
    </>
  )
}
