'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';
import { VendorTopBar } from '@/components/vendor/VendorTopBar';
import { ThemeInitializer } from '@/components/admin/ThemeInitializer';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useUIStore } from '@/store/uiStore';
import { VendorAuthProvider, ProtectedRoute } from '@/lib/vendor';

function VendorLayoutContent({ children }: { children: ReactNode }) {
  const { dir } = useTranslation();
  const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);

  return (
    <>
      <ThemeInitializer />
      <div className="min-h-screen flex bg-historical-stone dark:bg-gray-900 transition-colors duration-300" dir={dir}>
        {/* Sidebar */}
        <VendorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header */}
          <VendorTopBar />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-historical-gold/10 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-4 transition-colors duration-300">
            <div className="flex items-center justify-between text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
              <p>© 2024 Yalla Buy. جميع الحقوق محفوظة.</p>
              <p>الإصدار 1.0.0</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default function VendorLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname();
  
  // Check if current page is login page
  // التحقق إذا كانت الصفحة الحالية هي صفحة الدخول
  const isLoginPage = pathname === '/vendor/login';

  return (
    <VendorAuthProvider>
      {isLoginPage ? (
        // Login page doesn't need layout or protection
        // صفحة الدخول لا تحتاج تخطيط أو حماية
        children
      ) : (
        // All other pages are protected and use the layout
        // جميع الصفحات الأخرى محمية وتستخدم التخطيط
        <ProtectedRoute>
          <VendorLayoutContent>{children}</VendorLayoutContent>
        </ProtectedRoute>
      )}
    </VendorAuthProvider>
  );
}
