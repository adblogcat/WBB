'use client'
import * as React from 'react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Bistro 42</Link>
        <Link href="/" className="nav-link">Главная</Link>
        <Link href="/booking" className="nav-link">Бронирование</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Bistro 42 — уютный ресторан в центре</h1>
          <p>Забронируйте столик на удобное время. Без звонков, без задержек.</p>
          <div className="cta-row">
            <Link href="/booking" className="btn">Забронировать столик</Link>
          </div>
        </div>
      </div>
    </>
  )
}
