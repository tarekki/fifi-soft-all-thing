'use client'

/**
 * Admin Layout
 * تخطيط لوحة التحكم
 * 
 * Modern, professional admin dashboard layout with:
 * - Collapsible sidebar navigation
 * - Sticky header with search, notifications, and user menu
 * - Glassmorphism design
 * - RTL support
 * - Protected routes with authentication
 * 
 * تخطيط لوحة تحكم حديث واحترافي مع:
 * - قائمة جانبية قابلة للطي
 * - شريط علوي ثابت مع بحث وإشعارات وقائمة المستخدم
 * - تصميم زجاجي
 * - دعم RTL
 * - حماية الطرق مع المصادقة
 */

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar, AdminHeader } from '@/components/admin'
import { AdminAuthProvider, ProtectedRoute } from '@/lib/admin'
import { LanguageProvider, useLanguage } from '@/lib/i18n/context'

interface AdminLayoutProps {
  children: ReactNode
}

// =============================================================================
// Layout Content Component
// مكون محتوى التخطيط
// =============================================================================

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <LanguageProvider>
      <AdminLayoutContentInner isSidebarCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}>
        {children}
      </AdminLayoutContentInner>
    </LanguageProvider>
  )
}

function AdminLayoutContentInner({ 
  children, 
  isSidebarCollapsed, 
  onToggleCollapse 
}: { 
  children: ReactNode
  isSidebarCollapsed: boolean
  onToggleCollapse: () => void
}) {
  const { direction } = useLanguage()

  return (
    <div className="min-h-screen flex bg-historical-stone" dir={direction}>
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-historical-gold/10 bg-white/50 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between text-sm text-historical-charcoal/50">
            <p>© 2024 Yalla Buy. جميع الحقوق محفوظة.</p>
            <p>الإصدار 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// =============================================================================
// Main Layout Component
// مكون التخطيط الرئيسي
// =============================================================================

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  
  // Check if current page is login page
  // التحقق إذا كانت الصفحة الحالية هي صفحة الدخول
  const isLoginPage = pathname === '/admin/login'

  return (
    <AdminAuthProvider>
      {isLoginPage ? (
        // Login page doesn't need layout or protection
        // صفحة الدخول لا تحتاج تخطيط أو حماية
        children
      ) : (
        // All other pages are protected and use the layout
        // جميع الصفحات الأخرى محمية وتستخدم التخطيط
        <ProtectedRoute>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </ProtectedRoute>
      )}
    </AdminAuthProvider>
  )
}
