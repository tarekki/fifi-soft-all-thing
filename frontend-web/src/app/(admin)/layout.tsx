/**
 * Admin Layout
 * تخطيط صفحات المطور
 * 
 * Layout for admin routes (admin authentication required)
 * تخطيط لصفحات المطور (يتطلب مصادقة المطور)
 * 
 * Routes:
 * - /admin/dashboard (Admin dashboard)
 * - /admin/vendors (Manage vendors)
 * - /admin/vendors/[id] (Vendor details)
 * - /admin/products (All products)
 * - /admin/orders (All orders)
 * - /admin/orders/[id] (Order details)
 * - /admin/users (User management)
 * 
 * Features:
 * - Sidebar navigation
 * - Top bar with user info
 * - Admin-specific features
 * - Full access to all data
 * 
 * المميزات:
 * - شريط جانبي للتنقل
 * - شريط علوي مع معلومات المستخدم
 * - ميزات خاصة بالمطور
 * - وصول كامل لجميع البيانات
 */

import type { ReactNode } from 'react'

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar - TODO: Implement AdminSidebar component */}
      {/* الشريط الجانبي - TODO: تنفيذ مكون AdminSidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="p-4">
          {/* Sidebar navigation will be implemented later */}
          {/* تنقل الشريط الجانبي سيتم تنفيذه لاحقاً */}
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="/admin/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/admin/vendors">Vendors</a>
              </li>
              <li>
                <a href="/admin/products">Products</a>
              </li>
              <li>
                <a href="/admin/orders">Orders</a>
              </li>
              <li>
                <a href="/admin/users">Users</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* منطقة المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - TODO: Implement AdminTopBar component */}
        {/* الشريط العلوي - TODO: تنفيذ مكون AdminTopBar */}
        <header className="border-b bg-background">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Page Title */}
              {/* عنوان الصفحة */}
              <h1 className="text-2xl font-semibold">
                {/* Title will be set by page */}
                {/* العنوان سيتم تعيينه بواسطة الصفحة */}
              </h1>

              {/* User Info - TODO: Implement UserMenu component */}
              {/* معلومات المستخدم - TODO: تنفيذ مكون UserMenu */}
              <div>
                {/* User menu will be implemented later */}
                {/* قائمة المستخدم سيتم تنفيذها لاحقاً */}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {/* محتوى الصفحة */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

