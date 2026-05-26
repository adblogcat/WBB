'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { readSession } from '@/lib/auth'

export default function AccountPage() {
  const [email, setEmail] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const session = readSession()
    if (session) setEmail(session.email)
  }, [])

  function handleLogout() {
    // BUG AUTH-005: logout navigates back to "/" but never calls
    // clearSession() — the wbb-auth-session entry stays in localStorage, so
    // opening /account again shows the same user (auto-login). Correct
    // behaviour: clearSession() before router.push('/').
    router.push('/')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Auth Portal</Link>
        <Link href="/account" className="nav-link">Аккаунт</Link>
      </nav>
      <div className="container">
        <div className="account-card">
          <h2>Привет, {email ?? 'гость'}!</h2>
          <p>Вы успешно вошли в демо-аккаунт WebBugBench Auth Portal.</p>
          <button className="btn" onClick={handleLogout}>Выйти</button>
        </div>
      </div>
    </>
  )
}
