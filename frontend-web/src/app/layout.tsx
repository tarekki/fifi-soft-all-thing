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
      <body className="min-h-screen bg-historical-stone">
        <LanguageProvider>
          <CartProvider>
            <Sidebar />
            <CartDrawer />
            <div className="flex flex-col min-h-screen relative">
              <main className="flex-1 transition-all duration-300">
                {children}
              </main>
              <Footer />
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

