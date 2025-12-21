/**
 * Error Boundary Component
 * مكون Error Boundary
 * 
 * Catches and handles React errors gracefully
 * يلتقط ويتعامل مع أخطاء React بشكل أنيق
 * 
 * Security:
 * - Does not expose sensitive error details in production
 * - Logs errors for debugging
 * - Provides user-friendly error messages
 * 
 * الأمان:
 * - لا يعرض تفاصيل أخطاء حساسة في الإنتاج
 * - يسجل الأخطاء للتشخيص
 * - يوفر رسائل خطأ سهلة للمستخدم
 */

'use client'

import React, { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Class Component
 * مكون Error Boundary من نوع Class
 * 
 * Catches JavaScript errors anywhere in the child component tree
 * يلتقط أخطاء JavaScript في أي مكان في شجرة المكونات الفرعية
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    // تحديث الحالة حتى يعرض التصيير التالي واجهة fallback
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging (in production, send to error tracking service)
    // تسجيل الخطأ للتشخيص (في الإنتاج، إرسال إلى خدمة تتبع الأخطاء)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    // استدعاء معالج خطأ مخصص إذا تم توفيره
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error UI
      // عرض واجهة fallback مخصصة أو واجهة خطأ افتراضية
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              حدث خطأ
            </h1>
            <p className="text-muted-foreground mb-4">
              {process.env.NODE_ENV === 'development' && this.state.error
                ? this.state.error.message
                : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

