/**
 * Vendor Layout
 * تخطيط صفحات البائع
 * 
 * Layout for vendor routes (vendor authentication required)
 * تخطيط لصفحات البائع (يتطلب مصادقة البائع)
 * 
 * Routes:
 * - /vendor/dashboard (Vendor dashboard)
 * - /vendor/products (Manage products)
 * - /vendor/products/new (Create product)
 * - /vendor/products/[id] (Edit product)
 * - /vendor/orders (Vendor orders)
 * - /vendor/orders/[id] (Order details)
 * 
 * Features:
 * - Sidebar navigation
 * - Top bar with user info
 * - Vendor-specific features
 * 
 * المميزات:
 * - شريط جانبي للتنقل
 * - شريط علوي مع معلومات المستخدم
 * - ميزات خاصة بالبائع
 */

import type { ReactNode } from 'react'

export default function VendorLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar - TODO: Implement VendorSidebar component */}
      {/* الشريط الجانبي - TODO: تنفيذ مكون VendorSidebar */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="p-4">
          {/* Sidebar navigation will be implemented later */}
          {/* تنقل الشريط الجانبي سيتم تنفيذه لاحقاً */}
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="/vendor/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/vendor/products">Products</a>
              </li>
              <li>
                <a href="/vendor/orders">Orders</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* منطقة المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - TODO: Implement VendorTopBar component */}
        {/* الشريط العلوي - TODO: تنفيذ مكون VendorTopBar */}
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

