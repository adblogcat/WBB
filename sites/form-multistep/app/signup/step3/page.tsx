'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readStep3, writeStep3, markSubmitted } from '@/lib/form'

export default function Step3Page() {
  const [agreed, setAgreed] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const saved = readStep3()
    setAgreed(saved.agreed)
  }, [])

  function handleSubmit() {
    writeStep3({ agreed })
    // BUG FORM-004: the handler never reads the password / confirm pair from
    // step2 and never checks that they match. Registration "succeeds" even
    // when the user typed two different passwords on step2. Correct: read
    // step2 from localStorage and reject when password !== confirm.
    markSubmitted()
    router.push('/thanks')
  }

  function handleBack() {
    writeStep3({ agreed })
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
          <h1>Шаг 3 из 3</h1>
          <p>Подтверждение</p>
        </div>
        <div className="card-panel">
          <div className="steps">
            <div className="step-dot active" />
            <div className="step-dot active" />
            <div className="step-dot active" />
          </div>
          <div className="checkbox-row">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <label htmlFor="agree">Я принимаю условия пользовательского соглашения</label>
          </div>
          <p className="muted">Нажимая «Continue», вы подтверждаете согласие с обработкой данных.</p>
          <div className="actions">
            <button className="btn btn-secondary" onClick={handleBack}>← Назад</button>
            {/* BUG FORM-006: this button reads "Continue" in English while the
                rest of the UI (and even the helper text above) is in Russian.
                The remaining steps use "Далее" / "Зарегистрироваться". */}
            <button className="btn" disabled={!agreed} onClick={handleSubmit}>Continue</button>
          </div>
        </div>
      </div>
    </>
  )
}
