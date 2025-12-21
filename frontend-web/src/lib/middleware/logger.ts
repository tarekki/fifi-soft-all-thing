/**
 * Middleware Logger
 * مسجل Middleware
 * 
 * Logging utilities for middleware operations
 * أدوات التسجيل لعمليات middleware
 * 
 * Security:
 * - Logs security events (unauthorized access, token validation failures)
 * - Does not log sensitive data (tokens, passwords)
 * - Structured logging for easy analysis
 * 
 * الأمان:
 * - يسجل أحداث الأمان (الوصول غير المصرح، فشل التحقق من الرمز)
 * - لا يسجل بيانات حساسة (الرموز، كلمات المرور)
 * - تسجيل منظم لسهولة التحليل
 */

/**
 * Log levels
 * مستويات التسجيل
 */
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

/**
 * Log entry structure
 * هيكل إدخال السجل
 */
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  pathname?: string
  user?: {
    id?: number
    role?: string
  }
  metadata?: Record<string, unknown>
}

/**
 * Log middleware event
 * تسجيل حدث middleware
 * 
 * @param level - Log level
 * @param message - Log message
 * @param metadata - Additional metadata
 * 
 * Security: Never logs sensitive data (tokens, passwords)
 * الأمان: لا يسجل أبداً بيانات حساسة (الرموز، كلمات المرور)
 */
export function logMiddlewareEvent(
  level: LogLevel,
  message: string,
  metadata?: {
    pathname?: string
    user?: { id?: number; role?: string }
    [key: string]: unknown
  }
): void {
  // Only log in development or if explicitly enabled
  // تسجيل فقط في التطوير أو إذا تم تفعيله صراحة
  if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_MIDDLEWARE_LOGGING) {
    return
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  }

  // Log to console (in production, use proper logging service)
  // تسجيل في console (في الإنتاج، استخدم خدمة تسجيل مناسبة)
  const logMethod = level === LogLevel.ERROR ? console.error : console.log
  logMethod(`[Middleware ${level.toUpperCase()}]`, entry)
}

/**
 * Log route access attempt
 * تسجيل محاولة الوصول للمسار
 * 
 * @param pathname - Route pathname
 * @param user - User attempting access
 * @param allowed - Whether access was allowed
 */
export function logRouteAccess(
  pathname: string,
  user: { id?: number; role?: string } | null,
  allowed: boolean
): void {
  logMiddlewareEvent(
    allowed ? LogLevel.INFO : LogLevel.WARN,
    allowed ? 'Route access granted' : 'Route access denied',
    {
      pathname,
      user: user || undefined,
      allowed,
    }
  )
}

/**
 * Log authentication failure
 * تسجيل فشل المصادقة
 * 
 * @param pathname - Route pathname
 * @param reason - Failure reason
 */
export function logAuthFailure(pathname: string, reason: string): void {
  logMiddlewareEvent(LogLevel.WARN, 'Authentication failure', {
    pathname,
    reason,
  })
}

/**
 * Log token validation failure
 * تسجيل فشل التحقق من الرمز
 * 
 * @param pathname - Route pathname
 * @param reason - Failure reason
 */
export function logTokenValidationFailure(
  pathname: string,
  reason: string
): void {
  logMiddlewareEvent(LogLevel.WARN, 'Token validation failure', {
    pathname,
    reason,
  })
}

/**
 * Log unauthorized access attempt
 * تسجيل محاولة وصول غير مصرح
 * 
 * @param pathname - Route pathname
 * @param user - User attempting access
 * @param requiredRole - Required role for access
 */
export function logUnauthorizedAccess(
  pathname: string,
  user: { id?: number; role?: string } | null,
  requiredRole: string
): void {
  logMiddlewareEvent(LogLevel.WARN, 'Unauthorized access attempt', {
    pathname,
    user: user || undefined,
    requiredRole,
  })
}

