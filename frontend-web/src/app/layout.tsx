import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { LanguageProvider } from '@/lib/i18n/context'
import { SettingsProvider } from '@/lib/settings'
import { CartProvider } from '@/lib/cart/context'
import { CartDrawer } from '@/components/cart/CartDrawer'

/**
 * Root Layout Metadata
 * Note: This will be dynamically updated based on site settings in the future
 * ملاحظة: سيتم تحديث هذا ديناميكياً بناءً على إعدادات الموقع مستقبلاً
 */
export const metadata: Metadata = {
  title: 'Yalla Buy - اطلبها بثواني',
  description: 'Multi-vendor e-commerce platform for shoes and bags in Syria',
}

/**
 * Root Layout Component
 * مكون الـ Layout الرئيسي
 * 
 * Wraps the entire application with necessary providers:
 * - SettingsProvider: Site settings (name, logo, navigation, etc.)
 * - LanguageProvider: Internationalization (i18n)
 * - CartProvider: Shopping cart state
 * 
 * يغلف التطبيق بالكامل مع المزودات الضرورية
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-historical-stone">
        {/* 
          SettingsProvider: Outermost provider for site-wide settings
          المزود الخارجي لإعدادات الموقع العامة
        */}
        <SettingsProvider defaultLanguage="ar">
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
        </SettingsProvider>
      </body>
    </html>
  )
}

