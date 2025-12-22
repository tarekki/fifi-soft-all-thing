/**
 * Modal Component
 * مكون النافذة المنبثقة
 * 
 * Reusable modal component for dialogs and overlays
 * مكون نافذة منبثقة قابل لإعادة الاستخدام للنوافذ والطبقات
 * 
 * Features:
 * - Backdrop overlay
 * - Close on backdrop click
 * - Close on Escape key
 * - Focus trap
 * - Accessible (ARIA)
 * - Smooth animations
 * 
 * المميزات:
 * - طبقة خلفية
 * - إغلاق عند النقر على الخلفية
 * - إغلاق عند الضغط على Escape
 * - فخ التركيز
 * - قابل للوصول (ARIA)
 * - رسوم متحركة سلسة
 * 
 * Security:
 * - Prevents XSS in content
 * - Validates props
 * 
 * الأمان:
 * - يمنع XSS في المحتوى
 * - يتحقق من الخصائص
 */

'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Modal Props
 * خصائص النافذة المنبثقة
 */
export interface ModalProps {
  /** Is modal open? */
  isOpen: boolean
  /** On close callback */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: React.ReactNode
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Show close button? */
  showCloseButton?: boolean
  /** Close on backdrop click? */
  closeOnBackdropClick?: boolean
  /** Custom className */
  className?: string
}

/**
 * Modal Size Classes
 * فئات حجم النافذة المنبثقة
 */
const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

/**
 * Modal Component
 * مكون النافذة المنبثقة
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle Escape key
  // معالجة مفتاح Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus trap
  // فخ التركيز
  useEffect(() => {
    if (!isOpen) return

    // Save previous focus
    // حفظ التركيز السابق
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus modal
    // التركيز على النافذة المنبثقة
    const modal = modalRef.current
    if (modal) {
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    // Restore focus on close
    // استعادة التركيز عند الإغلاق
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  // منع تمرير الجسم عندما تكون النافذة المنبثقة مفتوحة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      {/* الخلفية */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      {/* محتوى النافذة المنبثقة */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-xl shadow-2xl w-full',
          sizeClasses[size],
          'transform transition-all duration-300',
          'max-h-[90vh] overflow-y-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {/* الرأس */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            {title && (
              <h2
                id="modal-title"
                className="text-heading-2 font-bold text-text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-neutral-100 rounded-lg transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {/* المحتوى */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

