import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'Ordine Divise — Istituto Adorazione Perpetua del Sacro Cuore',
  description: 'Ordina le divise scolastiche per il tuo bambino in pochi semplici passi.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={nunito.className}>{children}</body>
    </html>
  )
}
