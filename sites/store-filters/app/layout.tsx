import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Каталог товаров — Store Filters',
  description: 'WebBugBench demo каталог с фильтрами',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <nav className="nav">
          <span className="nav-brand">Store Filters</span>
          <span className="nav-link">Каталог</span>
        </nav>
        {children}
      </body>
    </html>
  )
}
