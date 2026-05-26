import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Booking Calendar',
  description: 'WebBugBench demo restaurant booking flow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
