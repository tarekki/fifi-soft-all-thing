/**
 * Vendor API Client
 * عميل API البائع
 * 
 * هذا الملف يحتوي على جميع دوال الاتصال بـ API البائع.
 * This file contains all functions for communicating with the Vendor API.
 * 
 * Features:
 * - JWT authentication
 * - Automatic token refresh
 * - Error handling
 * - Type safety
 */

import type {
  ApiResponse,
  VendorDashboardOverview,
  VendorLoginCredentials,
  VendorLoginResponse,
  VendorApplicationData,
  VendorApplicationResponse,
  VendorPasswordChangeData,
} from './types'

// =============================================================================
// Configuration
// الإعدادات
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const VENDOR_API_URL = `${API_BASE_URL}/vendor`

// Token storage keys (vendor-specific)
// مفاتيح تخزين التوكنات (خاصة بالبائع)
const ACCESS_TOKEN_KEY = 'vendor_access_token'
const REFRESH_TOKEN_KEY = 'vendor_refresh_token'

// =============================================================================
// Token Management
// إدارة التوكنات
// =============================================================================

/**
 * Get access token from localStorage
 * الحصول على access token من التخزين المحلي
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get refresh token from localStorage
 * الحصول على refresh token من التخزين المحلي
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Clear tokens from localStorage
 * مسح التوكنات من التخزين المحلي
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if access token is expired
 * التحقق من انتهاء صلاحية access token
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true
  }
}

// =============================================================================
// Base Fetch Function
// دالة الجلب الأساسية
// =============================================================================

/**
 * Refresh access token using refresh token
 * تجديد access token باستخدام refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.success && data.data?.access) {
      // Save new access token
      // حفظ access token الجديد
      localStorage.setItem(ACCESS_TOKEN_KEY, data.data.access)
      return data.data.access
    }

    return null
  } catch {
    return null
  }
}

/**
 * Vendor API fetch wrapper with authentication
 * غلاف fetch لـ API البائع مع المصادقة
 * 
 * @param endpoint - API endpoint (e.g., '/dashboard/overview/')
 * @param options - Fetch options
 * @returns Promise with API response
 */
export async function vendorFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${VENDOR_API_URL}${endpoint}`

  // Get access token
  // الحصول على access token
  let accessToken = getAccessToken()

  // Check if token is expired and try to refresh
  // التحقق من انتهاء التوكن ومحاولة التجديد
  if (accessToken && isTokenExpired(accessToken)) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const refreshed = await refreshAccessToken(refreshToken)
        if (refreshed) {
          accessToken = refreshed
        } else {
          clearTokens()
          throw new Error('Session expired. Please login again.')
        }
      } catch {
        clearTokens()
        throw new Error('Session expired. Please login again.')
      }
    }
  }

  // Build headers
  // بناء الهيدرز
  const headers: Record<string, string> = {}
  
  // Only set Content-Type for JSON, not for FormData
  // تعيين Content-Type فقط لـ JSON، وليس لـ FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  
  // Merge with user-provided headers
  // دمج مع الرؤوس المقدمة من المستخدم
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      Object.assign(headers, options.headers)
    }
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle network errors
    // معالجة أخطاء الشبكة
    if (!response.ok && response.status !== 400 && response.status !== 401) {
      return {
        success: false,
        data: null,
        message: `HTTP ${response.status}: ${response.statusText}`,
        errors: null,
      } as ApiResponse<T>
    }

    let data: any
    try {
      data = await response.json()
    } catch (jsonError) {
      // If response is not JSON, return error response
      // إذا كانت الاستجابة ليست JSON، إرجاع استجابة خطأ
      return {
        success: false,
        data: null,
        message: 'Invalid response format from server',
        errors: null,
      } as ApiResponse<T>
    }

    // Handle 401 Unauthorized
    // معالجة 401 غير مصرح
    if (response.status === 401) {
      clearTokens()
      return {
        success: false,
        data: null,
        message: data.message || 'Unauthorized. Please login again.',
        errors: data.errors || null,
      } as ApiResponse<T>
    }

    // Return the API response (may be success or error)
    // إرجاع استجابة API (قد تكون نجاح أو خطأ)
    return data as ApiResponse<T>

  } catch (error) {
    // Handle network/fetch errors
    // معالجة أخطاء الشبكة/الجلب
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network')

    if (isNetworkError) {
      console.error('[Vendor API] Network error details:', {
        url,
        apiUrl: VENDOR_API_URL,
        endpoint,
        errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isClientSide: typeof window !== 'undefined',
      })
    }

    return {
      success: false,
      data: null,
      message: isNetworkError 
        ? `فشل الاتصال بالخادم. يرجى التحقق من أن الخادم يعمل على ${VENDOR_API_URL} / Failed to connect to server. Please make sure the server is running on ${VENDOR_API_URL}`
        : errorMessage,
      errors: null,
    } as ApiResponse<T>
  }
}

// =============================================================================
// Dashboard API Functions
// دوال API لوحة التحكم
// =============================================================================

// =============================================================================
// Authentication API Functions
// دوال API المصادقة
// =============================================================================

/**
 * Vendor login
 * تسجيل دخول البائع
 * 
 * @param credentials - Email and password
 * @returns Promise with login response including tokens, user, and vendor info
 */
export async function vendorLogin(
  credentials: VendorLoginCredentials
): Promise<ApiResponse<VendorLoginResponse>> {
  const response = await fetch(`${VENDOR_API_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  // Save tokens if login successful
  // حفظ التوكنات إذا نجح تسجيل الدخول
  if (data.success && data.data?.access && data.data?.refresh) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.data.access)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh)
    }
  }

  return data as ApiResponse<VendorLoginResponse>
}

/**
 * Vendor logout
 * تسجيل خروج البائع
 */
export async function vendorLogout(): Promise<void> {
  clearTokens()
}

// =============================================================================
// Vendor Application API Functions
// دوال API طلب انضمام البائع
// =============================================================================

/**
 * Submit vendor application
 * تقديم طلب انضمام بائع
 * 
 * @param applicationData - Application data including store info
 * @returns Promise with application response
 */
export async function submitVendorApplication(
  applicationData: VendorApplicationData
): Promise<ApiResponse<VendorApplicationResponse>> {
  // Create FormData for file uploads
  // إنشاء FormData لرفع الملفات
  const formData = new FormData()
  
  formData.append('applicant_name', applicationData.applicant_name)
  formData.append('applicant_email', applicationData.applicant_email)
  formData.append('applicant_phone', applicationData.applicant_phone)
  formData.append('store_name', applicationData.store_name)
  
  if (applicationData.store_description) {
    formData.append('store_description', applicationData.store_description)
  }
  
  if (applicationData.store_logo) {
    formData.append('store_logo', applicationData.store_logo)
  }
  
  formData.append('business_type', applicationData.business_type)
  
  if (applicationData.business_address) {
    formData.append('business_address', applicationData.business_address)
  }
  
  if (applicationData.business_license) {
    formData.append('business_license', applicationData.business_license)
  }

  // Get access token if user is authenticated
  // الحصول على access token إذا كان المستخدم مسجل دخول
  const accessToken = getAccessToken()
  
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${VENDOR_API_URL}/apply/`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json()
  return data as ApiResponse<VendorApplicationResponse>
}

// =============================================================================
// Dashboard API Functions
// دوال API لوحة التحكم
// =============================================================================

/**
 * Get vendor dashboard overview statistics (KPIs)
 * الحصول على إحصائيات نظرة عامة على لوحة تحكم البائع
 * 
 * @returns Promise with dashboard overview data
 */
export async function getVendorDashboardOverview(): Promise<ApiResponse<VendorDashboardOverview>> {
  return vendorFetch<VendorDashboardOverview>('/dashboard/overview/')
}

/**
 * Change vendor password
 * تغيير كلمة مرور البائع
 * 
 * @param data - Password change data (current, new, confirm)
 * @returns Success response
 */
export async function changeVendorPassword(
  data: VendorPasswordChangeData
): Promise<ApiResponse<null>> {
  return vendorFetch<null>('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

