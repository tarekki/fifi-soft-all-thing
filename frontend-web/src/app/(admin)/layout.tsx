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
 * 
 * تخطيط لوحة تحكم حديث واحترافي مع:
 * - قائمة جانبية قابلة للطي
 * - شريط علوي ثابت مع بحث وإشعارات وقائمة المستخدم
 * - تصميم زجاجي
 * - دعم RTL
 */

import { useState, type ReactNode } from 'react'
import { AdminSidebar, AdminHeader } from '@/components/admin'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex bg-historical-stone" dir="rtl">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
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
