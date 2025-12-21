/**
 * Error Handlers
 * معالجات الأخطاء
 * 
 * Centralized error handling utilities
 * أدوات معالجة الأخطاء المركزية
 * 
 * Security:
 * - Sanitizes error messages for production
 * - Does not expose sensitive information
 * - Logs errors for debugging
 * 
 * الأمان:
 * - ينظف رسائل الأخطاء للإنتاج
 * - لا يعرض معلومات حساسة
 * - يسجل الأخطاء للتشخيص
 */

/**
 * Error types
 * أنواع الأخطاء
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Application Error Class
 * فئة خطأ التطبيق
 * 
 * Custom error class with type and user-friendly message
 * فئة خطأ مخصصة مع نوع ورسالة سهلة للمستخدم
 */
export class AppError extends Error {
  type: ErrorType
  statusCode?: number
  userMessage: string
  originalError?: Error

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.userMessage = message
    this.originalError = originalError
  }
}

/**
 * Get user-friendly error message
 * الحصول على رسالة خطأ سهلة للمستخدم
 * 
 * @param error - Error object
 * @returns User-friendly error message
 * 
 * Security: Does not expose sensitive error details in production
 * الأمان: لا يعرض تفاصيل أخطاء حساسة في الإنتاج
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    // In production, return generic message
    // في الإنتاج، إرجاع رسالة عامة
    if (process.env.NODE_ENV === 'production') {
      return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
    return error.message
  }

  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
}

/**
 * Get error type from error
 * الحصول على نوع الخطأ من الخطأ
 * 
 * @param error - Error object
 * @returns Error type
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof AppError) {
    return error.type
  }

  if (error instanceof Error) {
    // Check error message for common patterns
    // التحقق من رسالة الخطأ للأنماط الشائعة
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION
    }
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION
    }
  }

  return ErrorType.UNKNOWN
}

/**
 * Log error for debugging
 * تسجيل الخطأ للتشخيص
 * 
 * @param error - Error object
 * @param context - Additional context
 * 
 * Security: Does not log sensitive data
 * الأمان: لا يسجل بيانات حساسة
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  // Only log in development or if explicitly enabled
  // تسجيل فقط في التطوير أو إذا تم تفعيله صراحة
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_ERROR_LOGGING) {
    return
  }

  const errorInfo = {
    message: error instanceof Error ? error.message : 'Unknown error',
    type: getErrorType(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  }

  console.error('Error logged:', errorInfo)
}

/**
 * Create AppError from unknown error
 * إنشاء AppError من خطأ غير معروف
 * 
 * @param error - Unknown error
 * @param defaultMessage - Default error message
 * @returns AppError instance
 */
export function createAppError(
  error: unknown,
  defaultMessage: string = 'حدث خطأ غير متوقع'
): AppError {
  if (error instanceof AppError) {
    return error
  }

  const type = getErrorType(error)
  const message = error instanceof Error ? error.message : defaultMessage

  return new AppError(message, type, undefined, error instanceof Error ? error : undefined)
}

