export interface Product {
  id: string
  name: string
  price: number
  discount: number
  emoji: string
}

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'iPhone 15 Pro', price: 99990, discount: 5, emoji: '📱' },
  { id: 'p2', name: 'Pixel Phone 8', price: 79990, discount: 0, emoji: '📱' },
  { id: 'p3', name: 'MacBook Air', price: 129990, discount: 10, emoji: '💻' },
  { id: 'p4', name: 'AirPods Pro', price: 24990, discount: 0, emoji: '🎧' },
  { id: 'p5', name: 'Magic Mouse', price: 8990, discount: 0, emoji: '🖱' },
  { id: 'p6', name: 'iPad mini', price: 49990, discount: 15, emoji: '📲' },
  { id: 'p7', name: 'Apple Watch', price: 39990, discount: 0, emoji: '⌚' },
  { id: 'p8', name: 'HomePod', price: 19990, discount: 0, emoji: '🔊' },
]
