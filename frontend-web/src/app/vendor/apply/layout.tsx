'use client'

/**
 * Vendor Apply Layout
 * تخطيط صفحة طلب انضمام البائع
 * 
 * This layout is used only for the application page.
 * It does not include sidebar or header (public page).
 * 
 * هذا التخطيط يُستخدم فقط لصفحة طلب الانضمام.
 * لا يتضمن sidebar أو header (صفحة عامة).
 */

import type { ReactNode } from 'react'

export default function VendorApplyLayout({
  children,
}: {
  children: ReactNode
}) {
  // Return children without any layout wrapper
  // إرجاع children بدون أي wrapper للتخطيط
  return <>{children}</>
}

