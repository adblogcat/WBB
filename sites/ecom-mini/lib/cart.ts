// Cart helpers — localStorage-backed, no backend.
// Shape: { items: [{ id, qty }] }
'use client'

export interface CartItem { id: string; qty: number }
const KEY = 'wbb-ecom-cart'

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(window.localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function writeCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('wbb-cart-changed'))
}

export function addToCart(id: string): void {
  const items = readCart()
  const found = items.find(i => i.id === id)
  if (found) found.qty += 1
  else items.push({ id, qty: 1 })
  writeCart(items)
}
