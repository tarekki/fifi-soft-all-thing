/**
 * Next.js Middleware
 * Middleware الخاص بـ Next.js
 * 
 * Route protection and authentication
 * حماية المسارات والمصادقة
 * 
 * Security:
 * - Protects routes based on authentication
 * - Redirects unauthorized users
 * - Checks user roles for route access
 * 
 * الأمان:
 * - يحمي المسارات بناءً على المصادقة
 * - يعيد توجيه المستخدمين غير المصرح لهم
 * - يتحقق من أدوار المستخدمين للوصول للمسارات
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken, validateToken } from './lib/auth/jwt'
import {
  canAccessCustomerRoutes,
  canAccessVendorRoutes,
  canAccessAdminRoutes,
} from './lib/auth/permissions'

/**
 * Public routes (no authentication required)
 * المسارات العامة (لا تحتاج مصادقة)
 */
const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/vendors',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
]

/**
 * Check if route is public
 * التحقق من إذا كان المسار عام
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Main middleware function
 * دالة Middleware الرئيسية
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  // السماح بالمسارات العامة
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Get access token from request cookies (synchronous in middleware)
  // الحصول على رمز الوصول من كوكيز الطلب (متزامن في middleware)
  const accessToken = request.cookies.get('access_token')?.value

  // If no token, redirect to login
  // إذا لم يكن هناك رمز، إعادة توجيه لتسجيل الدخول
  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate token
  // التحقق من الرمز
  if (!validateToken(accessToken, 'access')) {
    // Invalid or expired token, redirect to login
    // رمز غير صالح أو منتهي الصلاحية، إعادة توجيه لتسجيل الدخول
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('expired', 'true')
    return NextResponse.redirect(loginUrl)
  }

  // Get user from token
  // الحصول على المستخدم من الرمز
  const user = getUserFromToken(accessToken)
  if (!user) {
    // Invalid user data, redirect to login
    // بيانات مستخدم غير صالحة، إعادة توجيه لتسجيل الدخول
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check route access based on user role
  // التحقق من الوصول للمسار بناءً على دور المستخدم
  
  // Customer routes
  // مسارات الزبون
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/orders') || pathname.startsWith('/profile')) {
    if (!canAccessCustomerRoutes(user as any)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('unauthorized', 'true')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Vendor routes
  // مسارات البائع
  if (pathname.startsWith('/vendor')) {
    if (!canAccessVendorRoutes(user as any)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('unauthorized', 'true')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin routes
  // مسارات المسؤول
  if (pathname.startsWith('/admin')) {
    if (!canAccessAdminRoutes(user as any)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('unauthorized', 'true')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow access
  // السماح بالوصول
  return NextResponse.next()
}

/**
 * Middleware configuration
 * إعدادات Middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
