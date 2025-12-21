/**
 * Loading Spinner Component
 * مكون مؤشر التحميل
 * 
 * Reusable loading spinner component
 * مكون مؤشر تحميل قابل لإعادة الاستخدام
 * 
 * Features:
 * - Multiple sizes (sm, md, lg)
 * - Customizable colors
 * - Accessible (ARIA labels)
 * 
 * المميزات:
 * - أحجام متعددة (sm, md, lg)
 * - ألوان قابلة للتخصيص
 * - قابل للوصول (تسميات ARIA)
 */

'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

/**
 * Loading Spinner Component
 * 
 * @param size - Spinner size (sm, md, lg)
 * @param className - Additional CSS classes
 * @param text - Optional loading text
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">جاري التحميل...</span>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

/**
 * Page Loading Component
 * مكون تحميل الصفحة
 * 
 * Full-page loading indicator
 * مؤشر تحميل للصفحة كاملة
 */
export function PageLoading({ text = 'جاري التحميل...' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

/**
 * Inline Loading Component
 * مكون تحميل مضمن
 * 
 * Inline loading indicator for buttons, forms, etc.
 * مؤشر تحميل مضمن للأزرار، النماذج، إلخ
 */
export function InlineLoading({ text }: { text?: string }) {
  return <LoadingSpinner size="sm" text={text} />
}

