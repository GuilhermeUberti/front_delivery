import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZaPedido',
  description: 'Gestão de pedidos via WhatsApp para restaurantes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  )
}
