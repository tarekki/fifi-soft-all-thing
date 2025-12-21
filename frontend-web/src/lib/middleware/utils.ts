/**
 * Middleware Utilities
 * أدوات Middleware
 * 
 * Utility functions for route matching and security checks
 * دوال مساعدة لمطابقة المسارات وفحوصات الأمان
 */

import {
  PUBLIC_ROUTES,
  CUSTOMER_ROUTES,
  VENDOR_ROUTES,
  ADMIN_ROUTES,
  ROUTE_PREFIXES,
} from './constants'

/**
 * Check if route is public
 * التحقق من إذا كان المسار عام
 * 
 * @param pathname - Route pathname
 * @returns True if route is public
 * 
 * Security: Public routes don't require authentication
 * الأمان: المسارات العامة لا تتطلب المصادقة
 */
export function isPublicRoute(pathname: string): boolean {
  // Check exact matches first
  // التحقق من التطابقات الدقيقة أولاً
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return true
  }

  // Check if pathname starts with any public route
  // التحقق من إذا كان pathname يبدأ بأي مسار عام
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Check if route is customer route
 * التحقق من إذا كان المسار مسار زبون
 * 
 * @param pathname - Route pathname
 * @returns True if route is customer route
 */
export function isCustomerRoute(pathname: string): boolean {
  return ROUTE_PREFIXES.CUSTOMER.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Check if route is vendor route
 * التحقق من إذا كان المسار مسار بائع
 * 
 * @param pathname - Route pathname
 * @returns True if route is vendor route
 */
export function isVendorRoute(pathname: string): boolean {
  return ROUTE_PREFIXES.VENDOR.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Check if route is admin route
 * التحقق من إذا كان المسار مسار مسؤول
 * 
 * @param pathname - Route pathname
 * @returns True if route is admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return ROUTE_PREFIXES.ADMIN.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Get route type
 * الحصول على نوع المسار
 * 
 * @param pathname - Route pathname
 * @returns Route type or null if public
 */
export function getRouteType(
  pathname: string
): 'public' | 'customer' | 'vendor' | 'admin' | null {
  if (isPublicRoute(pathname)) {
    return 'public'
  }
  if (isCustomerRoute(pathname)) {
    return 'customer'
  }
  if (isVendorRoute(pathname)) {
    return 'vendor'
  }
  if (isAdminRoute(pathname)) {
    return 'admin'
  }
  return null
}

/**
 * Check if pathname matches a route pattern
 * التحقق من إذا كان pathname يطابق نمط مسار
 * 
 * @param pathname - Route pathname
 * @param patterns - Route patterns to match
 * @returns True if pathname matches any pattern
 */
export function matchesRoutePattern(
  pathname: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => pathname.startsWith(pattern))
}

/**
 * Sanitize pathname for logging
 * تنظيف pathname للتسجيل
 * 
 * @param pathname - Route pathname
 * @returns Sanitized pathname
 * 
 * Security: Removes sensitive information from pathname
 * الأمان: يزيل المعلومات الحساسة من pathname
 */
export function sanitizePathname(pathname: string): string {
  // Remove query parameters
  // إزالة معاملات الاستعلام
  const cleanPath = pathname.split('?')[0]

  // Remove trailing slashes
  // إزالة الشرطات المائلة في النهاية
  return cleanPath.replace(/\/+$/, '') || '/'
}

