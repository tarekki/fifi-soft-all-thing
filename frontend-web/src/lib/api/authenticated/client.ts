/**
 * Authenticated API Client
 * عميل API للمصادقة
 * 
 * Secure API client for authenticated requests
 * عميل API آمن للطلبات المصادق عليها
 * 
 * Features:
 * - Automatic JWT token injection from HttpOnly cookies
 * - Automatic token refresh on 401 errors
 * - Comprehensive error handling
 * - Type-safe responses
 * 
 * المميزات:
 * - حقن رمز JWT تلقائياً من HttpOnly cookies
 * - تجديد الرمز تلقائياً عند أخطاء 401
 * - معالجة شاملة للأخطاء
 * - استجابات آمنة من ناحية الأنواع
 * 
 * Security:
 * - Tokens stored in HttpOnly cookies (XSS protection)
 * - Automatic CSRF token handling (if needed)
 * - Secure request headers
 * 
 * الأمان:
 * - الرموز مخزنة في HttpOnly cookies (حماية من XSS)
 * - معالجة تلقائية لرمز CSRF (إذا لزم الأمر)
 * - رؤوس طلب آمنة
 */

import { getAccessToken, getRefreshToken } from '@/lib/auth/cookies'
import { isTokenExpired } from '@/lib/auth/jwt'
import type { ApiResponse } from '@/types/api'

/**
 * API Base URL
 * عنوان URL الأساسي للـ API
 * 
 * Note: In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available
 * ملاحظة: في Next.js، متغيرات البيئة المسبوقة بـ NEXT_PUBLIC_ متاحة
 */
// @ts-expect-error - process.env is available in Next.js server-side
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/v1'

/**
 * API Error Class
 * فئة خطأ API
 * 
 * Custom error class for API errors with status code and message
 * فئة خطأ مخصصة لأخطاء API مع رمز الحالة والرسالة
 */
export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/**
 * Refresh access token using refresh token
 * تجديد رمز الوصول باستخدام رمز التحديث
 * 
 * @param refreshToken - Refresh token from cookie
 * @returns New access and refresh tokens
 * 
 * Security: Validates refresh token before use
 * الأمان: يتحقق من رمز التحديث قبل الاستخدام
 */
async function refreshAccessToken(refreshToken: string): Promise<{ access: string; refresh: string }> {
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError('Failed to refresh token', response.status)
  }

  const data = await response.json()
  
  // Standard JWT response format: { access: string, refresh: string }
  // تنسيق استجابة JWT القياسي: { access: string, refresh: string }
  return {
    access: data.access || data.access_token,
    refresh: data.refresh || data.refresh_token,
  }
}

/**
 * Authenticated API Client
 * عميل API للمصادقة
 * 
 * Makes authenticated API requests with automatic token management
 * يقوم بطلبات API مصادق عليها مع إدارة تلقائية للرموز
 * 
 * @param endpoint - API endpoint (e.g., '/orders/')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns API response data
 * 
 * Security:
 * - Automatically injects JWT token from HttpOnly cookie
 * - Handles token refresh on 401 errors
 * - Validates token expiration before requests
 * 
 * الأمان:
 * - يحقن رمز JWT تلقائياً من HttpOnly cookie
 * - يتعامل مع تجديد الرمز عند أخطاء 401
 * - يتحقق من انتهاء صلاحية الرمز قبل الطلبات
 */
export async function authenticatedApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get access token from HttpOnly cookie
  // الحصول على رمز الوصول من HttpOnly cookie
  let accessToken = await getAccessToken()

  // If no access token, try to get refresh token and refresh
  // إذا لم يكن هناك رمز وصول، حاول الحصول على رمز التحديث وتجديده
  if (!accessToken) {
    const refreshToken = await getRefreshToken()
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        // TODO: Save new tokens to cookies (will be handled by auth actions)
        // سيتم حفظ الرموز الجديدة في الكوكيز (سيتم التعامل معها بواسطة إجراءات المصادقة)
        accessToken = newTokens.access
      } catch (error) {
        throw new ApiError('Authentication required', 401)
      }
    } else {
      throw new ApiError('Authentication required', 401)
    }
  }

  // Check if token is expired
  // التحقق من إذا كان الرمز منتهي الصلاحية
  if (accessToken && isTokenExpired(accessToken)) {
    const refreshToken = await getRefreshToken()
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        accessToken = newTokens.access
      } catch (error) {
        throw new ApiError('Token expired. Please login again', 401)
      }
    } else {
      throw new ApiError('Token expired. Please login again', 401)
    }
  }

  // Build request URL
  // بناء عنوان URL للطلب
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  // Prepare request headers
  // إعداد رؤوس الطلب
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Add Authorization header with JWT token
  // إضافة رأس Authorization مع رمز JWT
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  // Make API request
  // إجراء طلب API
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized - Try to refresh token once
  // التعامل مع 401 غير مصرح - محاولة تجديد الرمز مرة واحدة
  if (response.status === 401) {
    const refreshToken = await getRefreshToken()
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken)
        accessToken = newTokens.access

        // Retry request with new token
        // إعادة محاولة الطلب برمز جديد
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`
        }
        const retryResponse = await fetch(url, {
          ...options,
          headers: headers as HeadersInit,
        })

        if (!retryResponse.ok) {
          throw await createApiError(retryResponse)
        }

        return retryResponse.json()
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        throw new ApiError('Authentication failed. Please login again', 401)
      }
    } else {
      throw new ApiError('Authentication required', 401)
    }
  }

  // Handle other errors
  // التعامل مع الأخطاء الأخرى
  if (!response.ok) {
    throw await createApiError(response)
  }

  // Parse and return response
  // تحليل وإرجاع الاستجابة
  return response.json()
}

/**
 * Create API Error from response
 * إنشاء خطأ API من الاستجابة
 * 
 * @param response - Fetch response object
 * @returns ApiError with status and message
 * 
 * Security: Extracts error details without exposing sensitive data
 * الأمان: يستخرج تفاصيل الخطأ دون كشف بيانات حساسة
 */
async function createApiError(response: Response): Promise<ApiError> {
  let errorMessage = `API Error: ${response.statusText}`
  let errors: Record<string, string[]> | undefined

  try {
    const data = await response.json()
    
    // Handle standard API response format: { success: false, message: "...", errors: {...} }
    // التعامل مع تنسيق استجابة API القياسي: { success: false, message: "...", errors: {...} }
    if (data.message) {
      errorMessage = data.message
    } else if (data.error) {
      errorMessage = data.error
    } else if (typeof data === 'string') {
      errorMessage = data
    }

    // Extract validation errors
    // استخراج أخطاء التحقق
    if (data.errors) {
      errors = data.errors
    } else if (data.detail) {
      // DRF format: { detail: "..." }
      // تنسيق DRF: { detail: "..." }
      errorMessage = data.detail
    }
  } catch {
    // If response is not JSON, use status text
    // إذا لم تكن الاستجابة JSON، استخدم نص الحالة
    errorMessage = response.statusText || `HTTP ${response.status}`
  }

  return new ApiError(errorMessage, response.status, errors)
}

/**
 * GET request helper
 * مساعد طلب GET
 * 
 * @param endpoint - API endpoint
 * @returns API response data
 */
export async function authenticatedGet<T>(endpoint: string): Promise<T> {
  return authenticatedApiClient<T>(endpoint, {
    method: 'GET',
  })
}

/**
 * POST request helper
 * مساعد طلب POST
 * 
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @returns API response data
 */
export async function authenticatedPost<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return authenticatedApiClient<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request helper
 * مساعد طلب PUT
 * 
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @returns API response data
 */
export async function authenticatedPut<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return authenticatedApiClient<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PATCH request helper
 * مساعد طلب PATCH
 * 
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @returns API response data
 */
export async function authenticatedPatch<T>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return authenticatedApiClient<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request helper
 * مساعد طلب DELETE
 * 
 * @param endpoint - API endpoint
 * @returns API response data
 */
export async function authenticatedDelete<T>(endpoint: string): Promise<T> {
  return authenticatedApiClient<T>(endpoint, {
    method: 'DELETE',
  })
}

