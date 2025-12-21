/**
 * Error Message Component
 * مكون رسالة الخطأ
 * 
 * Displays error messages in a user-friendly way
 * يعرض رسائل الخطأ بطريقة سهلة للمستخدم
 * 
 * Features:
 * - Multiple error types (error, warning, info)
 * - Dismissible errors
 * - Accessible (ARIA labels)
 * 
 * المميزات:
 * - أنواع أخطاء متعددة (error, warning, info)
 * - أخطاء قابلة للإغلاق
 * - قابل للوصول (تسميات ARIA)
 */

'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

/**
 * X Icon Component (Simple SVG)
 * مكون أيقونة X (SVG بسيط)
 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

/**
 * Error Message Component
 * 
 * @param message - Error message to display
 * @param type - Error type (error, warning, info)
 * @param dismissible - Whether error can be dismissed
 * @param onDismiss - Callback when error is dismissed
 * @param className - Additional CSS classes
 */
export function ErrorMessage({
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  className,
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  const typeStyles = {
    error: 'bg-destructive/10 text-destructive border-destructive',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  }

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <div
      className={cn(
        'rounded-md border p-4',
        typeStyles[type],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{message}</p>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="إغلاق رسالة الخطأ"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Error List Component
 * مكون قائمة الأخطاء
 * 
 * Displays multiple error messages
 * يعرض رسائل خطأ متعددة
 */
interface ErrorListProps {
  errors: string[]
  type?: 'error' | 'warning' | 'info'
  className?: string
}

export function ErrorList({
  errors,
  type = 'error',
  className,
}: ErrorListProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      {errors.map((error, index) => (
        <ErrorMessage
          key={index}
          message={error}
          type={type}
          dismissible={false}
        />
      ))}
    </div>
  )
}

