'use client'
import * as React from 'react'
import Link from 'next/link'
import { PRODUCTS, Product } from '@/lib/products'
import { addToCart } from '@/lib/cart'

export default function CatalogPage() {
  const [query, setQuery] = React.useState('')
  const [toast, setToast] = React.useState<string | null>(null)

  // BUG ECOM-001: search uses EXACT word match on a single token after the
  // query length is at least 4. Anything shorter, or a substring like "pho",
  // returns nothing. Correct behaviour would be a case-insensitive substring
  // search across the full product name.
  const filtered = React.useMemo<Product[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PRODUCTS
    if (q.length < 4) return []
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().split(/\s+/).some(word => word === q)
    )
  }, [query])

  function handleAdd(id: string, name: string) {
    addToCart(id)
    setToast(`Добавлено в корзину: ${name}`)
    window.setTimeout(() => setToast(null), 1800)
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Mini Store</Link>
        <Link href="/" className="nav-link">Каталог</Link>
        <Link href="/cart" className="nav-link">Корзина</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Каталог</h1>
          <p>Найдите устройство, добавьте в корзину, оформите заказ.</p>
        </div>
        <div className="search">
          <input
            type="search"
            placeholder="Поиск по названию (например, iPhone)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setQuery(query)}>Найти</button>
        </div>
        {filtered.length === 0 ? (
          <div className="empty">0 товаров найдено по запросу «{query}»</div>
        ) : (
          <div className="grid">
            {filtered.map(p => (
              <div className="card" key={p.id}>
                {/* BUG ECOM-005: Sale badge shown for EVERY product, ignoring discount. */}
                <span className="badge-sale">Sale</span>
                <div className="card-thumb">{p.emoji}</div>
                <div className="card-name">{p.name}</div>
                <div className="card-price">{p.price.toLocaleString('ru-RU')}₽</div>
                <button className="btn" onClick={() => handleAdd(p.id, p.name)}>В корзину</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
