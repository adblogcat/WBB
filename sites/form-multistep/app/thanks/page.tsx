'use client'
import * as React from 'react'
import Link from 'next/link'
import { clearForm } from '@/lib/form'

export default function ThanksPage() {
  function handleReset() {
    clearForm()
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Аккаунт</Link>
        <Link href="/" className="nav-link">Главная</Link>
        <Link href="/signup/step1" className="nav-link">Регистрация</Link>
      </nav>
      <div className="container">
        <div className="success">
          <h2>Регистрация успешна</h2>
          <p>Ваш аккаунт создан. Мы отправили подтверждение на указанный email.</p>
          <div className="actions" style={{ justifyContent: 'center' }}>
            <Link href="/" className="btn btn-secondary" onClick={handleReset}>На главную</Link>
          </div>
        </div>
      </div>
    </>
  )
}
