'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'signup' | 'forgot'

export default function LandingPage() {
  const [tab, setTab] = React.useState<Tab>('login')
  const router = useRouter()

  function go(t: Tab) {
    setTab(t)
    if (t === 'login') router.push('/login')
    else if (t === 'signup') router.push('/signup')
    else router.push('/forgot')
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
          <h1>Добро пожаловать</h1>
          <p>Войдите в аккаунт, создайте новый или восстановите пароль.</p>
        </div>
        <div className="tabs" role="tablist">
          <button
            className={`tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => go('login')}
            role="tab"
          >
            Вход
          </button>
          <button
            className={`tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => go('signup')}
            role="tab"
          >
            Регистрация
          </button>
          <button
            className={`tab ${tab === 'forgot' ? 'active' : ''}`}
            onClick={() => go('forgot')}
            role="tab"
          >
            Забыли пароль?
          </button>
        </div>
        <div className="card">
          <p className="helper">
            Выберите вкладку, чтобы перейти к нужной форме. Все данные хранятся
            только в вашем браузере (localStorage) — это демо-портал без бэкенда.
          </p>
        </div>
      </div>
    </>
  )
}
