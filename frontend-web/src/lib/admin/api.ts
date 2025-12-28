/**
 * Admin API Client
 * عميل API الإدارة
 * 
 * هذا الملف يحتوي على جميع دوال الاتصال بـ API الإدارة.
 * This file contains all functions for communicating with the Admin API.
 * 
 * Features:
 * - JWT authentication
 * - Automatic token refresh
 * - Error handling
 * - Type safety
 */

import type {
  ApiResponse,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminUser,
  DashboardOverview,
  SalesChartData,
  RecentOrder,
  RecentActivity,
} from './types'
import type {
  SalesReport,
  ProductsReport,
  UsersReport,
  CommissionsReport,
  DateRange,
  ReportType,
} from './types/reports'

// =============================================================================
// Configuration
// الإعدادات
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const ADMIN_API_URL = `${API_BASE_URL}/admin`

// Token storage keys
// مفاتيح تخزين التوكنات
const ACCESS_TOKEN_KEY = 'admin_access_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

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
 * Save tokens to localStorage
 * حفظ التوكنات في التخزين المحلي
 */
export function saveTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
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
export function isTokenExpired(token: string): boolean {
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
 * Admin API fetch wrapper with authentication
 * غلاف fetch لـ API الإدارة مع المصادقة
 * 
 * @param endpoint - API endpoint (e.g., '/auth/login/')
 * @param options - Fetch options
 * @returns Promise with API response
 */
export async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ADMIN_API_URL}${endpoint}`
  
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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Network error. Please check your connection.'
    
    return {
      success: false,
      data: null,
      message: errorMessage,
      errors: null,
    } as ApiResponse<T>
  }
}

/**
 * Refresh access token using refresh token
 * تجديد access token باستخدام refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/auth/refresh/`, {
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

// =============================================================================
// Auth API Functions
// دوال API المصادقة
// =============================================================================

/**
 * Admin login
 * تسجيل دخول الأدمن
 * 
 * @param credentials - Email and password
 * @returns Promise with login response including tokens and user
 */
export async function adminLogin(
  credentials: AdminLoginCredentials
): Promise<ApiResponse<AdminLoginResponse>> {
  const response = await fetch(`${ADMIN_API_URL}/auth/login/`, {
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
    saveTokens(data.data.access, data.data.refresh)
  }
  
  return data as ApiResponse<AdminLoginResponse>
}

/**
 * Admin logout
 * تسجيل خروج الأدمن
 */
export async function adminLogout(): Promise<ApiResponse<null>> {
  const refreshToken = getRefreshToken()
  
  if (refreshToken) {
    try {
      await adminFetch<null>('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      })
    } catch {
      // Ignore errors, just clear tokens
    }
  }
  
  clearTokens()
  
  return {
    success: true,
    data: null,
    message: 'Logged out successfully',
    errors: null,
  }
}

/**
 * Get current admin user info
 * الحصول على معلومات الأدمن الحالي
 */
export async function getAdminMe(): Promise<ApiResponse<AdminUser>> {
  return adminFetch<AdminUser>('/auth/me/')
}

// =============================================================================
// Dashboard API Functions
// دوال API لوحة التحكم
// =============================================================================

/**
 * Get dashboard overview (KPIs)
 * الحصول على نظرة عامة على لوحة التحكم
 */
export async function getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> {
  return adminFetch<DashboardOverview>('/dashboard/overview/')
}

/**
 * Get sales chart data
 * الحصول على بيانات رسم بياني المبيعات
 * 
 * @param period - 'week' | 'month' | 'year'
 */
export async function getSalesChart(
  period: 'week' | 'month' | 'year' = 'week'
): Promise<ApiResponse<SalesChartData>> {
  return adminFetch<SalesChartData>(`/dashboard/sales-chart/?period=${period}`)
}

/**
 * Get recent orders
 * الحصول على الطلبات الأخيرة
 * 
 * @param limit - Number of orders (default: 10)
 */
export async function getRecentOrders(
  limit: number = 10
): Promise<ApiResponse<RecentOrder[]>> {
  return adminFetch<RecentOrder[]>(`/dashboard/recent-orders/?limit=${limit}`)
}

/**
 * Get recent activity
 * الحصول على النشاطات الأخيرة
 * 
 * @param limit - Number of activities (default: 10)
 */
export async function getRecentActivity(
  limit: number = 10
): Promise<ApiResponse<RecentActivity[]>> {
  return adminFetch<RecentActivity[]>(`/dashboard/recent-activity/?limit=${limit}`)
}

// =============================================================================
// Reports API Functions
// دوال API التقارير
// =============================================================================

/**
 * Get sales report
 * الحصول على تقرير المبيعات
 * 
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 */
export async function getSalesReport(
  dateRange: DateRange = '30days'
): Promise<ApiResponse<SalesReport>> {
  return adminFetch<SalesReport>(`/reports/sales/?date_range=${dateRange}`)
}

/**
 * Get products report
 * الحصول على تقرير المنتجات
 * 
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 */
export async function getProductsReport(
  dateRange: DateRange = '30days'
): Promise<ApiResponse<ProductsReport>> {
  return adminFetch<ProductsReport>(`/reports/products/?date_range=${dateRange}`)
}

/**
 * Get users report
 * الحصول على تقرير المستخدمين
 * 
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 */
export async function getUsersReport(
  dateRange: DateRange = '30days'
): Promise<ApiResponse<UsersReport>> {
  return adminFetch<UsersReport>(`/reports/users/?date_range=${dateRange}`)
}

/**
 * Get commissions report
 * الحصول على تقرير العمولات
 * 
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 */
export async function getCommissionsReport(
  dateRange: DateRange = '30days'
): Promise<ApiResponse<CommissionsReport>> {
  return adminFetch<CommissionsReport>(`/reports/commissions/?date_range=${dateRange}`)
}

/**
 * Export report as Word document
 * تصدير التقرير كملف Word
 * 
 * @param reportType - Type of report: 'sales', 'products', 'users', 'commissions'
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 */
export async function exportReport(
  reportType: ReportType,
  dateRange: DateRange = '30days'
): Promise<Blob> {
  const url = `${ADMIN_API_URL}/reports/export/?type=${reportType}&date_range=${dateRange}`
  
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
      } catch (err) {
        clearTokens()
        if (err instanceof Error) {
          throw err
        }
        throw new Error('Session expired. Please login again.')
      }
    } else {
      clearTokens()
      throw new Error('Session expired. Please login again.')
    }
  }
  
  if (!accessToken) {
    throw new Error('Authentication required. Please login again.')
  }
  
  // Build headers
  // بناء الهيدرز
  const headers: HeadersInit = {
    'Authorization': `Bearer ${accessToken}`,
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })
    
    // Handle 401 Unauthorized - try to refresh token once more
    // معالجة 401 غير مصرح - محاولة تجديد التوكن مرة أخرى
    if (response.status === 401) {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        const refreshed = await refreshAccessToken(refreshToken)
        if (refreshed) {
          // Retry the request with new token
          // إعادة المحاولة بالتوكن الجديد
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${refreshed}`,
            },
          })
          
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text().catch(() => 'Unknown error')
            throw new Error(`Failed to export report: ${retryResponse.status} ${retryResponse.statusText}. ${errorText}`)
          }
          
          return retryResponse.blob()
        } else {
          clearTokens()
          throw new Error('Session expired. Please login again.')
        }
      } else {
        clearTokens()
        throw new Error('Authentication required. Please login again.')
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Failed to export report: ${response.status} ${response.statusText}. ${errorText}`)
    }
    
    return response.blob()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}

// =============================================================================
// Utility Functions
// دوال مساعدة
// =============================================================================

/**
 * Check if user has a specific permission
 * التحقق من امتلاك المستخدم لصلاحية معينة
 */
export function hasPermission(
  user: AdminUser | null,
  permission: string
): boolean {
  if (!user) return false
  return user.permissions.includes(permission as AdminUser['permissions'][number])
}

/**
 * Check if user has any of the specified permissions
 * التحقق من امتلاك المستخدم لأي من الصلاحيات المحددة
 */
export function hasAnyPermission(
  user: AdminUser | null,
  permissions: string[]
): boolean {
  if (!user) return false
  return permissions.some(p => 
    user.permissions.includes(p as AdminUser['permissions'][number])
  )
}

/**
 * Check if user has all of the specified permissions
 * التحقق من امتلاك المستخدم لجميع الصلاحيات المحددة
 */
export function hasAllPermissions(
  user: AdminUser | null,
  permissions: string[]
): boolean {
  if (!user) return false
  return permissions.every(p => 
    user.permissions.includes(p as AdminUser['permissions'][number])
  )
}

