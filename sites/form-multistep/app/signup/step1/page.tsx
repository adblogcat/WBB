'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readStep1, writeStep1 } from '@/lib/form'

export default function Step1Page() {
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const router = useRouter()

  React.useEffect(() => {
    // BUG FORM-003 surfaces here: readStep1() always returns empty defaults,
    // so when the user navigates back from step2 their email/name are lost
    // in the UI even though writeStep1() persisted them to localStorage.
    const saved = readStep1()
    setEmail(saved.email)
    setName(saved.name)
  }, [])

  function handleNext() {
    // BUG FORM-005: when email is empty we just bail out silently — no toast,
    // no inline error, no border-red, no message. The user clicks "Далее" and
    // nothing visible happens.
    if (!email) return

    // BUG FORM-001: no email-format check at all. The input is type="text"
    // (see below) so the browser doesn't validate either. "abc@" with no
    // domain passes through to step2.
    writeStep1({ email, name })
    router.push('/signup/step2')
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
          <h1>Шаг 1 из 3</h1>
          <p>Контактные данные</p>
        </div>
        <div className="card-panel">
          <div className="steps">
            <div className="step-dot active" />
            <div className="step-dot" />
            <div className="step-dot" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            {/* BUG FORM-001: type="text" instead of type="email" — no browser
                validation. Combined with the missing regex check in handleNext,
                "abc@" passes through to the next step. */}
            <input
              id="email"
              type="text"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="actions">
            <Link href="/" className="btn btn-secondary">← Отмена</Link>
            <button className="btn" onClick={handleNext}>Далее</button>
          </div>
        </div>
      </div>
    </>
  )
}
