'use client'

/**
 * Vendor Login Layout
 * تخطيط صفحة تسجيل دخول البائع
 * 
 * This layout is used only for the login page.
 * It does not include sidebar or header.
 * 
 * هذا التخطيط يُستخدم فقط لصفحة تسجيل الدخول.
 * لا يتضمن sidebar أو header.
 */

import type { ReactNode } from 'react'

export default function VendorLoginLayout({
  children,
}: {
  children: ReactNode
}) {
  // Return children without any layout wrapper
  // إرجاع children بدون أي wrapper للتخطيط
  return <>{children}</>
}

