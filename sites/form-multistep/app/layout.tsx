import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'WebBugBench demo signup form',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
