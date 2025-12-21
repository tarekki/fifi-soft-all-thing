/**
 * Next.js Middleware
 * Middleware الخاص بـ Next.js
 * 
 * Enhanced route protection and authentication with comprehensive security
 * حماية المسارات والمصادقة المحسنة مع أمان شامل
 * 
 * Security Features:
 * - Protects routes based on authentication
 * - Smart redirects with context preservation
 * - Role-based access control (RBAC)
 * - Token validation and expiration handling
 * - Comprehensive logging for security events
 * - Error handling and graceful degradation
 * 
 * ميزات الأمان:
 * - يحمي المسارات بناءً على المصادقة
 * - إعادة توجيه ذكية مع الحفاظ على السياق
 * - التحكم بالوصول بناءً على الأدوار (RBAC)
 * - التحقق من الرمز ومعالجة انتهاء الصلاحية
 * - تسجيل شامل لأحداث الأمان
 * - معالجة الأخطاء والتدهور التدريجي
 * 
 * Architecture:
 * - Centralized route definitions
 * - Utility functions for route matching
 * - Structured logging
 * - Type-safe permissions
 * 
 * البنية المعمارية:
 * - تعريفات مسارات مركزية
 * - دوال مساعدة لمطابقة المسارات
 * - تسجيل منظم
 * - صلاحيات آمنة من ناحية الأنواع
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken, validateToken, isTokenExpired } from './lib/auth/jwt'
import {
  canAccessCustomerRoutes,
  canAccessVendorRoutes,
  canAccessAdminRoutes,
} from './lib/auth/permissions'
import {
  isPublicRoute,
  getRouteType,
  sanitizePathname,
} from './lib/middleware/utils'
import {
  DEFAULT_REDIRECTS,
  QUERY_PARAMS,
} from './lib/middleware/constants'
import {
  logRouteAccess,
  logAuthFailure,
  logTokenValidationFailure,
  logUnauthorizedAccess,
  LogLevel,
  logMiddlewareEvent,
} from './lib/middleware/logger'

/**
 * Create redirect URL with context
 * إنشاء URL إعادة توجيه مع السياق
 * 
 * @param request - Next.js request object
 * @param pathname - Original pathname to redirect back to
 * @param reason - Redirect reason (expired, unauthorized, etc.)
 * @returns Redirect URL with query parameters
 * 
 * Security: Preserves original pathname for post-login redirect
 * الأمان: يحافظ على pathname الأصلي لإعادة التوجيه بعد تسجيل الدخول
 */
function createRedirectUrl(
  request: NextRequest,
  pathname: string,
  reason?: 'expired' | 'unauthorized' | 'error'
): URL {
  const redirectUrl = new URL(DEFAULT_REDIRECTS.LOGIN, request.url)
  
  // Preserve original pathname for post-login redirect
  // الحفاظ على pathname الأصلي لإعادة التوجيه بعد تسجيل الدخول
  redirectUrl.searchParams.set(QUERY_PARAMS.REDIRECT, sanitizePathname(pathname))
  
  // Add reason if provided
  // إضافة السبب إذا تم توفيره
  if (reason === 'expired') {
    redirectUrl.searchParams.set(QUERY_PARAMS.EXPIRED, 'true')
  } else if (reason === 'unauthorized') {
    redirectUrl.searchParams.set(QUERY_PARAMS.UNAUTHORIZED, 'true')
  } else if (reason === 'error') {
    redirectUrl.searchParams.set(QUERY_PARAMS.ERROR, 'true')
  }
  
  return redirectUrl
}

/**
 * Main middleware function
 * دالة Middleware الرئيسية
 * 
 * @param request - Next.js request object
 * @returns NextResponse with appropriate redirect or next()
 * 
 * Security Flow:
 * 1. Check if route is public → Allow access
 * 2. Check for access token → Redirect to login if missing
 * 3. Validate token → Redirect to login if invalid/expired
 * 4. Extract user from token → Redirect to login if invalid
 * 5. Check role-based permissions → Redirect if unauthorized
 * 6. Allow access if all checks pass
 * 
 * تدفق الأمان:
 * 1. التحقق من إذا كان المسار عام → السماح بالوصول
 * 2. التحقق من رمز الوصول → إعادة توجيه لتسجيل الدخول إذا كان مفقوداً
 * 3. التحقق من الرمز → إعادة توجيه لتسجيل الدخول إذا كان غير صالح/منتهي
 * 4. استخراج المستخدم من الرمز → إعادة توجيه لتسجيل الدخول إذا كان غير صالح
 * 5. التحقق من الصلاحيات بناءً على الأدوار → إعادة توجيه إذا كان غير مصرح
 * 6. السماح بالوصول إذا نجحت جميع الفحوصات
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sanitizedPath = sanitizePathname(pathname)

  try {
    // Step 1: Check if route is public
    // الخطوة 1: التحقق من إذا كان المسار عام
    if (isPublicRoute(sanitizedPath)) {
      logRouteAccess(sanitizedPath, null, true)
      return NextResponse.next()
    }

    // Step 2: Get access token from request cookies
    // الخطوة 2: الحصول على رمز الوصول من كوكيز الطلب
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      logAuthFailure(sanitizedPath, 'No access token found')
      const redirectUrl = createRedirectUrl(request, sanitizedPath)
      return NextResponse.redirect(redirectUrl)
    }

    // Step 3: Validate token structure and expiration
    // الخطوة 3: التحقق من هيكل الرمز وانتهاء الصلاحية
    if (!validateToken(accessToken, 'access')) {
      const reason = isTokenExpired(accessToken) ? 'expired' : 'invalid'
      logTokenValidationFailure(sanitizedPath, `Token ${reason}`)
      const redirectUrl = createRedirectUrl(request, sanitizedPath, 'expired')
      return NextResponse.redirect(redirectUrl)
    }

    // Step 4: Extract user data from token
    // الخطوة 4: استخراج بيانات المستخدم من الرمز
    const user = getUserFromToken(accessToken)
    if (!user || !user.id || !user.role) {
      logAuthFailure(sanitizedPath, 'Invalid user data in token')
      const redirectUrl = createRedirectUrl(request, sanitizedPath, 'error')
      return NextResponse.redirect(redirectUrl)
    }

    // Step 5: Check route access based on user role
    // الخطوة 5: التحقق من الوصول للمسار بناءً على دور المستخدم
    const routeType = getRouteType(sanitizedPath)
    
    let hasAccess = false
    let requiredRole = ''

    switch (routeType) {
      case 'customer':
        hasAccess = canAccessCustomerRoutes(user)
        requiredRole = 'customer'
        break
      case 'vendor':
        hasAccess = canAccessVendorRoutes(user)
        requiredRole = 'vendor'
        break
      case 'admin':
        hasAccess = canAccessAdminRoutes(user)
        requiredRole = 'admin'
        break
      default:
        // Unknown route type, allow access (will be handled by page-level checks)
        // نوع مسار غير معروف، السماح بالوصول (سيتم التعامل معه بواسطة فحوصات مستوى الصفحة)
        hasAccess = true
        break
    }

    if (!hasAccess) {
      logUnauthorizedAccess(sanitizedPath, user, requiredRole)
      const redirectUrl = createRedirectUrl(request, sanitizedPath, 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }

    // Step 6: All checks passed, allow access
    // الخطوة 6: نجحت جميع الفحوصات، السماح بالوصول
    logRouteAccess(sanitizedPath, user, true)
    return NextResponse.next()
  } catch (error) {
    // Error handling - log and redirect to login
    // معالجة الأخطاء - تسجيل وإعادة توجيه لتسجيل الدخول
    logMiddlewareEvent(LogLevel.ERROR, 'Middleware error', {
      pathname: sanitizedPath,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    const redirectUrl = createRedirectUrl(request, sanitizedPath, 'error')
    return NextResponse.redirect(redirectUrl)
  }
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
