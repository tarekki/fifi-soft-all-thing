/**
 * Middleware Constants
 * ثوابت Middleware
 * 
 * Centralized route definitions and security constants
 * تعريفات المسارات المركزية وثوابت الأمان
 */

/**
 * Public routes (no authentication required)
 * المسارات العامة (لا تحتاج مصادقة)
 * 
 * These routes are accessible without authentication
 * هذه المسارات متاحة بدون مصادقة
 */
export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/vendors',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const

/**
 * Customer routes (customer authentication required)
 * مسارات الزبون (يتطلب مصادقة الزبون)
 * 
 * These routes require customer authentication
 * هذه المسارات تتطلب مصادقة الزبون
 */
export const CUSTOMER_ROUTES = [
  '/cart',
  '/checkout',
  '/orders',
  '/profile',
] as const

/**
 * Vendor routes (vendor authentication required)
 * مسارات البائع (يتطلب مصادقة البائع)
 * 
 * These routes require vendor authentication
 * هذه المسارات تتطلب مصادقة البائع
 */
export const VENDOR_ROUTES = [
  '/vendor/dashboard',
  '/vendor/products',
  '/vendor/orders',
  '/vendor/settings',
] as const

/**
 * Admin routes (admin authentication required)
 * مسارات المسؤول (يتطلب مصادقة المسؤول)
 * 
 * These routes require admin authentication
 * هذه المسارات تتطلب مصادقة المسؤول
 */
export const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/vendors',
  '/admin/products',
  '/admin/orders',
  '/admin/users',
  '/admin/settings',
] as const

/**
 * Route prefixes for pattern matching
 * بادئات المسارات للمطابقة النمطية
 */
export const ROUTE_PREFIXES = {
  CUSTOMER: ['/cart', '/checkout', '/orders', '/profile'],
  VENDOR: ['/vendor'],
  ADMIN: ['/admin'],
} as const

/**
 * Default redirect paths
 * مسارات إعادة التوجيه الافتراضية
 */
export const DEFAULT_REDIRECTS = {
  LOGIN: '/auth/login',
  HOME: '/',
  CUSTOMER_DASHBOARD: '/orders',
  VENDOR_DASHBOARD: '/vendor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const

/**
 * Query parameter keys for redirects and error messages
 * مفاتيح معاملات الاستعلام لإعادة التوجيه ورسائل الخطأ
 */
export const QUERY_PARAMS = {
  REDIRECT: 'redirect',
  EXPIRED: 'expired',
  UNAUTHORIZED: 'unauthorized',
  ERROR: 'error',
} as const

