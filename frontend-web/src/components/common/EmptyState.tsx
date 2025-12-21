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
 * 
 * المميزات:
 * - أيقونة ورسالة قابلة للتخصيص
 * - زر إجراء اختياري
 * - قابل للوصول (تسميات ARIA)
 */

'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Empty State Component
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
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

