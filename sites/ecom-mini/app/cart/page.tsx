'use client'
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PRODUCTS } from '@/lib/products'
import { readCart, writeCart, CartItem } from '@/lib/cart'

export default function CartPage() {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [toast, setToast] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    setItems(readCart())
    const onChange = () => setItems(readCart())
    window.addEventListener('wbb-cart-changed', onChange)
    return () => window.removeEventListener('wbb-cart-changed', onChange)
  }, [])

  function updateQty(id: string, value: string) {
    // BUG ECOM-002: qty stored as Number((value || '0').slice(-1)) — only
    // the LAST DIGIT of the input is kept. So "12" becomes 2, "100" becomes
    // 0. Correct: parseInt(value, 10) with clamp >= 1.
    // BUG ECOM-006: no minimum-1 guard either — '0' is accepted and totals
    // become 0₽ but the row stays in the cart.
    const lastDigit = (value || '0').slice(-1)
    const next = items.map(i => i.id === id ? { ...i, qty: Number(lastDigit) } : i)
    setItems(next)
    writeCart(next)
  }

  function remove(id: string) {
    // BUG ECOM-003: toast fires but the actual remove is commented out.
    // const next = items.filter(i => i.id !== id)
    // setItems(next); writeCart(next)
    setToast('Товар удалён из корзины')
    window.setTimeout(() => setToast(null), 1800)
  }

  const enriched = items.map(i => {
    const product = PRODUCTS.find(p => p.id === i.id)
    return { ...i, product }
  })
  const total = enriched.reduce(
    (sum, row) => sum + (row.product ? row.product.price * row.qty : 0),
    0
  )

  function goToCheckout() {
    router.push('/checkout')
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
          <h1>Корзина</h1>
          {items.length === 0 && <p>Сейчас в корзине ничего нет — добавьте товары из каталога.</p>}
        </div>
        {enriched.map(row => row.product && (
          <div className="cart-row" key={row.id}>
            <div className="card-thumb" style={{ width: 56, height: 56, fontSize: 24 }}>{row.product.emoji}</div>
            <div className="cart-row-name">
              <div style={{ fontWeight: 600 }}>{row.product.name}</div>
              <div style={{ color: '#71717a', fontSize: 14 }}>{row.product.price.toLocaleString('ru-RU')}₽ × {row.qty}</div>
            </div>
            <input
              className="qty"
              type="number"
              min={0}
              value={row.qty}
              onChange={e => updateQty(row.id, e.target.value)}
            />
            <button className="btn btn-secondary" onClick={() => remove(row.id)}>Удалить</button>
          </div>
        ))}
        <div className="total-row">
          <span className="label">Итого</span>
          <span className="value">{total.toLocaleString('ru-RU')}₽</span>
        </div>
        <div className="actions">
          <Link href="/" className="btn btn-secondary">← Продолжить покупки</Link>
          {/* BUG ECOM-004: button is always enabled, even when cart is empty. */}
          <button className="btn" onClick={goToCheckout}>Оформить заказ</button>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
