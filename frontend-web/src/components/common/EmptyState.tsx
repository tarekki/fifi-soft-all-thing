/**
 * Empty State Component
 * مكون الحالة الفارغة
 * 
 * Displays empty state when no data is available
 * يعرض حالة فارغة عندما لا توجد بيانات متاحة
 * 
 * Features:
 * - Customizable icon and message
 * - Optional action button
 * - Accessible (ARIA labels)
 * - Uses design system colors
 * 
 * المميزات:
 * - أيقونة ورسالة قابلة للتخصيص
 * - زر إجراء اختياري
 * - قابل للوصول (تسميات ARIA)
 * - يستخدم ألوان نظام التصميم
 * 
 * Security:
 * - No user input
 * - Safe rendering
 * 
 * الأمان:
 * - لا يوجد إدخال من المستخدم
 * - عرض آمن
 */

'use client'

import React, { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Empty State Props
 * خصائص الحالة الفارغة
 */
export interface EmptyStateProps {
  /** Optional icon component */
  icon?: ReactNode
  /** Empty state title */
  title: string
  /** Optional description */
  description?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Custom className */
  className?: string
}

/**
 * Empty State Component
 * مكون الحالة الفارغة
 * 
 * @param icon - Optional icon component
 * @param title - Empty state title
 * @param description - Optional description
 * @param action - Optional action button
 * @param className - Additional CSS classes
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Empty state"
    >
      {icon && (
        <div className="mb-4 text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-heading-3 font-semibold mb-2 text-text-primary">
        {title}
      </h3>
      {description && (
        <p className="text-body-md text-text-tertiary mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-accent-orange-500 text-white rounded-lg hover:bg-accent-orange-600 transition-default font-medium text-body-md focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
