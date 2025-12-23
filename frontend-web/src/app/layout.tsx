import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { LanguageProvider } from '@/lib/i18n/context'

export const metadata: Metadata = {
  title: 'Yalla Buy - اطلبها بثواني',
  description: 'Multi-vendor e-commerce platform',
}

import { CartProvider } from '@/lib/cart/context';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex flex-row min-h-screen">
        <LanguageProvider>
          <CartProvider>
            <Sidebar />
            <CartDrawer />
            <main className="flex-1 bg-historical-stone min-h-screen transition-all duration-300 flex flex-col">
              {children}
              <Footer />
            </main>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

