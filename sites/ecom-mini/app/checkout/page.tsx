'use client'
import * as React from 'react'
import Link from 'next/link'
import { readCart, CartItem } from '@/lib/cart'
import { PRODUCTS } from '@/lib/products'

export default function CheckoutPage() {
  const [items, setItems] = React.useState<CartItem[]>([])
  React.useEffect(() => { setItems(readCart()) }, [])

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-brand">Mini Store</Link>
        <Link href="/" className="nav-link">Каталог</Link>
        <Link href="/cart" className="nav-link">Корзина</Link>
      </nav>
      <div className="container">
        <div className="hero">
          <h1>Оформление заказа</h1>
          <p>
            {items.length === 0
              ? 'Сейчас в заказе нет ни одной позиции — но кнопка "Оформить" в корзине всё равно открыла этот экран.'
              : `Готовится заказ на ${items.length} позиций.`}
          </p>
        </div>
        <ul style={{ paddingLeft: 18 }}>
          {items.map(i => {
            const p = PRODUCTS.find(x => x.id === i.id)
            return <li key={i.id}>{p?.name ?? i.id} × {i.qty}</li>
          })}
        </ul>
        <div className="actions">
          <Link href="/cart" className="btn btn-secondary">← Назад в корзину</Link>
        </div>
      </div>
    </>
  )
}
