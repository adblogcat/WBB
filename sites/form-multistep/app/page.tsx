'use client'
import * as React from 'react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Аккаунт</Link>
        <Link href="/" className="nav-link">Главная</Link>
        <Link href="/signup/step1" className="nav-link">Регистрация</Link>
      </nav>
      <div className="container-wide">
        <div className="hero">
          <h1>Создайте аккаунт за 3 простых шага</h1>
          <p>Заполните форму регистрации — это займёт меньше минуты.</p>
        </div>
        <div className="landing-feature">
          <h3>1. Контактные данные</h3>
          <p>Укажите email и имя — мы пришлём подтверждение.</p>
        </div>
        <div className="landing-feature">
          <h3>2. Пароль</h3>
          <p>Придумайте надёжный пароль и подтвердите его.</p>
        </div>
        <div className="landing-feature">
          <h3>3. Согласие с условиями</h3>
          <p>Примите пользовательское соглашение и завершите регистрацию.</p>
        </div>
        <div className="actions">
          <span />
          <Link href="/signup/step1" className="cta">Зарегистрироваться</Link>
        </div>
      </div>
    </>
  )
}
