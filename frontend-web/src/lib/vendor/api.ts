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
  VendorCustomer,
  VendorCustomerFilters,
  PaginatedCustomerResponse,
  VendorAnalyticsOverview,
  VendorSalesAnalytics,
  VendorProductAnalytics,
  VendorCustomerAnalytics,
  VendorTimeAnalysis,
  VendorComparisonAnalytics,
  VendorAnalyticsFilters,
  VendorProfile,
  VendorProfileUpdate,
  VendorInfo,
  VendorInfoUpdate,
  VendorNotificationPreferences,
  VendorNotificationPreferencesUpdate,
  VendorStoreSettings,
  VendorStoreSettingsUpdate,
  VendorActiveSession,
} from './types'

// =============================================================================
// Configuration
// الإعدادات
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/v1'
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
    // Use standard JWT refresh endpoint (works for all users including vendors)
    // استخدام endpoint تجديد JWT القياسي (يعمل لجميع المستخدمين بما في ذلك البائعين)
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      // Log error for debugging (only in development)
      // تسجيل الخطأ للتشخيص (فقط في التطوير)
      if (process.env.NODE_ENV === 'development') {
        try {
          const errorData = await response.json()
          console.warn('[Vendor API] Token refresh failed:', {
            status: response.status,
            message: errorData.message || response.statusText,
          })
        } catch {
          console.warn('[Vendor API] Token refresh failed:', response.status, response.statusText)
        }
      }
      return null
    }

    const data = await response.json()

    // JWT standard format: { access: string, refresh?: string }
    // تنسيق JWT القياسي: { access: string, refresh?: string }
    if (data.access) {
      // Save new access token
      // حفظ access token الجديد
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
      
      // Save new refresh token if provided (token rotation)
      // حفظ refresh token جديد إذا تم توفيره (تدوير الرموز)
      if (data.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
      }
      
      return data.access
    }

    // Fallback: Check for wrapped response format
    // احتياطي: التحقق من تنسيق الاستجابة الملفوفة
    if (data.success && data.data?.access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.data.access)
      if (data.data.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh)
      }
      return data.data.access
    }

    return null
  } catch (error) {
    // Log error for debugging (only in development)
    // تسجيل الخطأ للتشخيص (فقط في التطوير)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Vendor API] Token refresh error:', error)
    }
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
          // Refresh failed - clear tokens but don't throw here
          // فشل التجديد - مسح التوكنات لكن لا ترمي خطأ هنا
          // Let the request proceed and handle 401 response
          // دع الطلب يستمر وتعامل مع استجابة 401
          clearTokens()
        }
      } catch (error) {
        // Refresh error - clear tokens but don't throw here
        // خطأ التجديد - مسح التوكنات لكن لا ترمي خطأ هنا
        clearTokens()
      }
    } else {
      // No refresh token - clear access token
      // لا يوجد refresh token - مسح access token
      clearTokens()
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

    // Handle 401 Unauthorized - try to refresh token one more time
    // معالجة 401 غير مصرح - محاولة تجديد التوكن مرة أخرى
    if (response.status === 401) {
      // Try to refresh token one more time (in case token expired during request)
      // محاولة تجديد التوكن مرة أخرى (في حالة انتهاء التوكن أثناء الطلب)
      const refreshToken = getRefreshToken()
      if (refreshToken && accessToken) {
        try {
          const refreshed = await refreshAccessToken(refreshToken)
          if (refreshed) {
            // Retry the request with new token
            // إعادة محاولة الطلب بالتوكن الجديد
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...headers,
                'Authorization': `Bearer ${refreshed}`,
              },
            })
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json()
              return retryData as ApiResponse<T>
            }
          }
        } catch {
          // Refresh failed - continue to clear tokens
          // فشل التجديد - المتابعة لمسح التوكنات
        }
      }
      
      // Clear tokens and return error
      // مسح التوكنات وإرجاع الخطأ
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
 * Recent order type for vendor dashboard
 * نوع الطلب الأخير للوحة تحكم البائع
 */
export interface VendorRecentOrder {
  id: number
  order_number: string
  customer_name: string
  total: string
  status: string
  status_display: string
  created_at: string
}

/**
 * Get recent orders for vendor dashboard
 * الحصول على الطلبات الأخيرة للوحة تحكم البائع
 * 
 * @param limit - Number of orders to return (default: 10, max: 50)
 * @returns Promise with recent orders list
 */
export async function getVendorRecentOrders(
  limit: number = 10
): Promise<ApiResponse<VendorRecentOrder[]>> {
  const endpoint = `/dashboard/recent-orders/?limit=${Math.min(limit, 50)}`
  return vendorFetch<VendorRecentOrder[]>(endpoint)
}

/**
 * Sales chart data type
 * نوع بيانات رسم بياني المبيعات
 */
export interface VendorSalesChartData {
  labels: string[]
  revenue: string[]
  orders: number[]
  period: 'week' | 'month' | 'year'
}

/**
 * Get sales chart data for vendor dashboard
 * الحصول على بيانات رسم بياني المبيعات للوحة تحكم البائع
 * 
 * @param period - Time period: 'week', 'month', or 'year' (default: 'month')
 * @returns Promise with sales chart data
 */
export async function getVendorSalesChart(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<VendorSalesChartData>> {
  const endpoint = `/dashboard/sales-chart/?period=${period}`
  return vendorFetch<VendorSalesChartData>(endpoint)
}

/**
 * Vendor dashboard tip data type
 * نوع بيانات نصيحة لوحة تحكم البائع
 */
export interface VendorDashboardTip {
  type: 'out_of_stock' | 'low_stock' | 'inactive' | 'general'
  priority: number
  title_ar: string
  title_en: string
  message_ar: string
  message_en: string
  action_text_ar: string
  action_text_en: string
  action_url: string
  product_id: number | null
  product_name: string | null
}

/**
 * Get dashboard tip for vendor
 * الحصول على نصيحة لوحة التحكم للبائع
 * 
 * @returns Promise with dashboard tip
 */
export async function getVendorDashboardTip(): Promise<ApiResponse<VendorDashboardTip>> {
  const endpoint = `/dashboard/tips/`
  return vendorFetch<VendorDashboardTip>(endpoint)
}

// =============================================================================
// Notifications API Functions
// دوال API الإشعارات
// =============================================================================

/**
 * Vendor notification filters
 * فلاتر إشعارات البائع
 */
export interface VendorNotificationFilters {
  is_read?: boolean
  type?: 'order' | 'product' | 'system'
  limit?: number
  offset?: number
}

/**
 * Vendor notification
 * إشعار البائع
 */
export interface VendorNotification {
  id: string | number
  type: 'order' | 'product' | 'system'
  message: string
  message_ar?: string
  timestamp: string
  is_read: boolean
  target_id?: string | number
  target_type?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * Vendor notification response
 * استجابة إشعارات البائع
 */
export interface VendorNotificationResponse {
  notifications: VendorNotification[]
  unread_count: number
  total_count: number
}

/**
 * Vendor notification stats
 * إحصائيات إشعارات البائع
 */
export interface VendorNotificationStats {
  total: number
  unread: number
  by_type: {
    order: number
    product: number
    system: number
    user: number
    vendor: number
    category: number
  }
}

/**
 * Get vendor notifications list
 * الحصول على قائمة إشعارات البائع
 * 
 * @param filters - Optional filters (is_read, type, limit, offset)
 * @returns Promise with notifications list
 */
export async function getVendorNotifications(
  filters?: VendorNotificationFilters
): Promise<ApiResponse<VendorNotificationResponse>> {
  // Build query string
  const params = new URLSearchParams()
  
  if (filters?.is_read !== undefined) {
    params.append('is_read', filters.is_read.toString())
  }
  if (filters?.type) {
    params.append('type', filters.type)
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }
  if (filters?.offset) {
    params.append('offset', filters.offset.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/notifications/${queryString ? `?${queryString}` : ''}`
  
  return vendorFetch<VendorNotificationResponse>(endpoint)
}

/**
 * Get vendor unread notifications count
 * الحصول على عدد الإشعارات غير المقروءة للبائع
 * 
 * @returns Promise with unread count
 */
export async function getVendorUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
  return vendorFetch<{ unread_count: number }>('/notifications/unread-count/')
}

/**
 * Mark vendor notification as read
 * تحديد إشعار البائع كمقروء
 * 
 * @param notificationId - Notification ID
 * @returns Promise with success status
 */
export async function markVendorNotificationAsRead(
  notificationId: string | number
): Promise<ApiResponse<{ success: boolean }>> {
  return vendorFetch<{ success: boolean }>(
    `/notifications/${notificationId}/mark-as-read/`,
    {
      method: 'POST',
    }
  )
}

/**
 * Mark multiple vendor notifications as read
 * تحديد عدة إشعارات للبائع كمقروءة
 * 
 * @param notificationIds - Array of notification IDs
 * @returns Promise with success status and marked count
 */
export async function markMultipleVendorNotificationsAsRead(
  notificationIds: (string | number)[]
): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
  return vendorFetch<{ success: boolean; marked_count: number }>(
    '/notifications/mark-as-read/',
    {
      method: 'POST',
      body: JSON.stringify({ notification_ids: notificationIds }),
    }
  )
}

/**
 * Mark all vendor notifications as read
 * تحديد جميع إشعارات البائع كمقروءة
 * 
 * @returns Promise with success status and marked count
 */
export async function markAllVendorNotificationsAsRead(): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
  return vendorFetch<{ success: boolean; marked_count: number }>(
    '/notifications/mark-all-as-read/',
    {
      method: 'POST',
    }
  )
}

/**
 * Get vendor notification statistics
 * الحصول على إحصائيات إشعارات البائع
 * 
 * @returns Promise with notification stats
 */
export async function getVendorNotificationStats(): Promise<ApiResponse<VendorNotificationStats>> {
  return vendorFetch<VendorNotificationStats>('/notifications/stats/')
}

// =============================================================================
// Orders API Functions
// دوال API الطلبات
// =============================================================================

/**
 * Vendor order filters
 * فلاتر طلبات البائع
 */
export interface VendorOrderFilters {
  search?: string
  status?: string
  customer_key?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'total' | 'status'
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

/**
 * Vendor order list item
 * عنصر قائمة طلبات البائع
 */
export interface VendorOrder {
  id: number
  order_number: string
  customer_name: string
  customer_key?: string
  total: string
  status: string
  status_display: string
  items_count: number
  created_at: string
}

/**
 * Vendor order detail
 * تفاصيل طلب البائع
 */
export interface VendorOrderDetail {
  id: number
  order_number: string
  status: string
  status_display: string
  order_type: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  customer_address: string
  subtotal: string
  items: Array<{
    id: number
    product_name: string
    variant_name: string
    quantity: number
    price: string
    subtotal: string
    product_image: string | null
  }>
  items_count: number
  created_at: string
  updated_at: string
  notes: string | null
}

/**
 * Paginated response
 * استجابة مقسمة
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Get vendor orders list
 * الحصول على قائمة طلبات البائع
 * 
 * @param filters - Optional filters (search, status, date range, pagination)
 * @returns Promise with paginated orders list
 */
export async function getVendorOrders(
  filters?: VendorOrderFilters
): Promise<ApiResponse<PaginatedResponse<VendorOrder>>> {
  // Build query string
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.status) {
    params.append('status', filters.status)
  }
  if (filters?.customer_key) {
    params.append('customer_key', filters.customer_key)
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  if (filters?.sort_by) {
    params.append('sort_by', filters.sort_by)
  }
  if (filters?.sort_dir) {
    params.append('sort_dir', filters.sort_dir)
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }
  if (filters?.page_size) {
    params.append('page_size', filters.page_size.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/orders/${queryString ? `?${queryString}` : ''}`
  
  return vendorFetch<PaginatedResponse<VendorOrder>>(endpoint)
}

/**
 * Get vendor order details
 * الحصول على تفاصيل طلب البائع
 * 
 * @param id - Order ID
 * @returns Promise with order details
 */
export async function getVendorOrder(
  id: number
): Promise<ApiResponse<VendorOrderDetail>> {
  return vendorFetch<VendorOrderDetail>(`/orders/${id}/`)
}

// =============================================================================
// Customers API Functions
// دوال API الزبائن
// =============================================================================

/**
 * Get vendor customers list
 * الحصول على قائمة زبائن البائع
 * 
 * @param filters - Optional filters (search, date range, sorting, pagination)
 * @returns Promise with paginated customers list
 */
export async function getVendorCustomers(
  filters?: VendorCustomerFilters
): Promise<ApiResponse<PaginatedCustomerResponse>> {
  // Build query string
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  if (filters?.last_order_from) {
    params.append('last_order_from', filters.last_order_from)
  }
  if (filters?.last_order_to) {
    params.append('last_order_to', filters.last_order_to)
  }
  if (filters?.sort_by) {
    params.append('sort_by', filters.sort_by)
  }
  if (filters?.sort_dir) {
    params.append('sort_dir', filters.sort_dir)
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }
  if (filters?.page_size) {
    params.append('page_size', filters.page_size.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/customers/${queryString ? `?${queryString}` : ''}`
  
  return vendorFetch<PaginatedCustomerResponse>(endpoint)
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

// =============================================================================
// Reports API Functions
// دوال API التقارير
// =============================================================================

/**
 * Date range type for vendor reports
 * نوع الفترة الزمنية لتقارير البائع
 */
export type VendorDateRange = '7days' | '30days' | '90days' | 'year'

/**
 * Export vendor report as Word document
 * تصدير تقرير البائع كملف Word
 * 
 * @param dateRange - Date range: '7days', '30days', '90days', 'year'
 * @returns Promise with Blob (Word document)
 */
export async function exportVendorReport(
  dateRange: VendorDateRange = '30days'
): Promise<Blob> {
  const url = `${VENDOR_API_URL}/dashboard/reports/export/?date_range=${dateRange}`

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
          // Refresh failed - clear tokens but let request proceed
          // فشل التجديد - مسح التوكنات لكن دع الطلب يستمر
          clearTokens()
        }
      } catch (error) {
        // Refresh error - clear tokens but let request proceed
        // خطأ التجديد - مسح التوكنات لكن دع الطلب يستمر
        clearTokens()
      }
    } else {
      // No refresh token - clear access token
      // لا يوجد refresh token - مسح access token
      clearTokens()
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
          // Refresh failed - clear tokens and throw error
          // فشل التجديد - مسح التوكنات ورمي خطأ
          clearTokens()
          throw new Error('Session expired. Please login again.')
        }
      } else {
        // No refresh token - clear tokens and throw error
        // لا يوجد refresh token - مسح التوكنات ورمي خطأ
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
// Products API Functions
// دوال API المنتجات
// =============================================================================

/**
 * Product types for vendor API
 * أنواع المنتجات لـ API البائع
 */
export interface VendorProduct {
  id: number
  name: string
  slug: string
  description: string | null
  base_price: string
  product_type: string | null
  category: number | null
  category_name: string | null
  category_name_ar: string | null
  variants_count: number
  total_stock: number
  main_image: string | null
  status: 'active' | 'draft' | 'out_of_stock'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VendorProductDetail extends VendorProduct {
  images: Array<{
    id: number
    image: string | null
    image_url: string | null
    display_order: number
    is_primary: boolean
    alt_text: string | null
    created_at: string
    updated_at: string
  }>
  variants: Array<{
    id: number
    color: string
    color_hex: string | null
    size: string | null
    model: string | null
    sku: string | null
    stock_quantity: number
    price_override: string | null
    final_price: string
    image: string | null
    image_url: string | null
    is_available: boolean
    created_at: string
    updated_at: string
  }>
}

export interface VendorProductCreatePayload {
  name: string
  description?: string
  base_price: number
  product_type?: string
  category_id?: number | null
  is_active?: boolean
  variants?: Array<{
    color: string
    color_hex?: string
    size?: string
    model?: string
    sku?: string
    stock_quantity?: number
    price_override?: number
    image?: File
    is_available?: boolean
  }>
}

export interface VendorProductUpdatePayload {
  name?: string
  description?: string
  base_price?: number
  product_type?: string
  category_id?: number | null
  is_active?: boolean
}

export interface VendorProductFilters {
  search?: string
  category?: number
  status?: 'active' | 'draft' | 'out_of_stock'
  is_active?: boolean
  sort_by?: 'name' | 'price' | 'created_at'
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface VendorProductPagination {
  count: number
  next: string | null
  previous: string | null
  page: number
  page_size: number
  total_pages: number
}

export interface VendorProductListResponse {
  results: VendorProduct[]
  pagination: VendorProductPagination
}

/**
 * Get vendor products list
 * الحصول على قائمة منتجات البائع
 * 
 * @param filters - Optional filters (search, category, status, etc.)
 * @returns Promise with paginated products list
 */
export async function getVendorProducts(
  filters?: VendorProductFilters
): Promise<ApiResponse<VendorProductListResponse>> {
  // Build query string
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.category) {
    params.append('category', filters.category.toString())
  }
  if (filters?.status) {
    params.append('status', filters.status)
  }
  if (filters?.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString())
  }
  if (filters?.sort_by) {
    params.append('sort_by', filters.sort_by)
  }
  if (filters?.sort_dir) {
    params.append('sort_dir', filters.sort_dir)
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }
  if (filters?.page_size) {
    params.append('page_size', filters.page_size.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/products/${queryString ? `?${queryString}` : ''}`
  
  return vendorFetch<VendorProductListResponse>(endpoint)
}

/**
 * Get vendor product details
 * الحصول على تفاصيل منتج البائع
 * 
 * @param id - Product ID
 * @returns Promise with product details
 */
export async function getVendorProduct(
  id: number
): Promise<ApiResponse<VendorProductDetail>> {
  return vendorFetch<VendorProductDetail>(`/products/${id}/`)
}

/**
 * Create vendor product
 * إنشاء منتج للبائع
 * 
 * @param data - Product data (vendor_id set automatically from session)
 * @returns Promise with created product
 */
export async function createVendorProduct(
  data: VendorProductCreatePayload
): Promise<ApiResponse<VendorProductDetail>> {
  // Create FormData if there are images or files
  // إنشاء FormData إذا كانت هناك صور أو ملفات
  const hasFiles = data.variants?.some(v => v.image instanceof File)
  
  if (hasFiles) {
    const formData = new FormData()
    
    // Add basic fields
    formData.append('name', data.name)
    if (data.description) {
      formData.append('description', data.description)
    }
    formData.append('base_price', data.base_price.toString())
    if (data.product_type) {
      formData.append('product_type', data.product_type)
    }
    if (data.category_id !== undefined) {
      formData.append('category_id', data.category_id?.toString() || '')
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active.toString())
    }
    
    // Add variants if provided
    if (data.variants && data.variants.length > 0) {
      formData.append('variants', JSON.stringify(data.variants.map(v => ({
        ...v,
        image: undefined, // Remove File from JSON
      }))))
      
      // Handle variant images separately if needed
      // (This is a simplified version - you might need to adjust based on backend)
    }
    
    return vendorFetch<VendorProductDetail>('/products/', {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for simple requests
  return vendorFetch<VendorProductDetail>('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update vendor product
 * تحديث منتج البائع
 * 
 * @param id - Product ID
 * @param data - Product update data
 * @returns Promise with updated product
 */
export async function updateVendorProduct(
  id: number,
  data: VendorProductUpdatePayload
): Promise<ApiResponse<VendorProductDetail>> {
  return vendorFetch<VendorProductDetail>(`/products/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete vendor product
 * حذف منتج البائع
 * 
 * @param id - Product ID
 * @returns Promise with success response
 */
export async function deleteVendorProduct(
  id: number
): Promise<ApiResponse<null>> {
  return vendorFetch<null>(`/products/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Categories API Functions
// دوال API الفئات
// =============================================================================

/**
 * Category type for vendor API
 * نوع الفئة لـ API البائع
 */
export interface VendorCategory {
  id: number
  name: string
  name_ar: string
  slug: string
  description: string | null
  description_ar: string | null
  is_active: boolean
}

export interface VendorCategoryListResponse {
  results: VendorCategory[]
  pagination: VendorProductPagination
}

/**
 * Get vendor categories list (read-only)
 * الحصول على قائمة فئات البائع (قراءة فقط)
 * 
 * @param filters - Optional filters (search, is_active)
 * @returns Promise with paginated categories list
 */
export async function getVendorCategories(
  filters?: {
    search?: string
    is_active?: boolean
    page?: number
    page_size?: number
  }
): Promise<ApiResponse<VendorCategoryListResponse>> {
  // Build query string
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.is_active !== undefined) {
    params.append('is_active', filters.is_active.toString())
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }
  if (filters?.page_size) {
    params.append('page_size', filters.page_size.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/categories/${queryString ? `?${queryString}` : ''}`
  
  return vendorFetch<VendorCategoryListResponse>(endpoint)
}

// =============================================================================
// Analytics API Functions
// دوال API التحليلات
// =============================================================================

/**
 * Get analytics overview with key metrics
 * الحصول على نظرة عامة على التحليلات مع المؤشرات الرئيسية
 * 
 * @param filters - Optional filters (date_from, date_to)
 * @returns Promise with analytics overview data
 */
export async function getVendorAnalyticsOverview(
  filters?: Pick<VendorAnalyticsFilters, 'date_from' | 'date_to'>
): Promise<ApiResponse<VendorAnalyticsOverview>> {
  const params = new URLSearchParams()
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/overview/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorAnalyticsOverview>(endpoint)
}

/**
 * Get sales analytics with charts and metrics
 * الحصول على تحليلات المبيعات مع الرسوم البيانية والمؤشرات
 * 
 * @param filters - Optional filters (period, date_from, date_to)
 * @returns Promise with sales analytics data
 */
export async function getVendorSalesAnalytics(
  filters?: Pick<VendorAnalyticsFilters, 'period' | 'date_from' | 'date_to'>
): Promise<ApiResponse<VendorSalesAnalytics>> {
  const params = new URLSearchParams()
  if (filters?.period) {
    params.append('period', filters.period)
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/sales/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorSalesAnalytics>(endpoint)
}

/**
 * Get product analytics including top products and category breakdown
 * الحصول على تحليلات المنتجات بما في ذلك أفضل المنتجات وتوزيع الفئات
 * 
 * @param filters - Optional filters (date_from, date_to, limit)
 * @returns Promise with product analytics data
 */
export async function getVendorProductAnalytics(
  filters?: Pick<VendorAnalyticsFilters, 'date_from' | 'date_to' | 'limit'>
): Promise<ApiResponse<VendorProductAnalytics>> {
  const params = new URLSearchParams()
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/products/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorProductAnalytics>(endpoint)
}

/**
 * Get customer analytics including growth and top customers
 * الحصول على تحليلات الزبائن بما في ذلك النمو وأفضل الزبائن
 * 
 * @param filters - Optional filters (date_from, date_to, limit)
 * @returns Promise with customer analytics data
 */
export async function getVendorCustomerAnalytics(
  filters?: Pick<VendorAnalyticsFilters, 'date_from' | 'date_to' | 'limit'>
): Promise<ApiResponse<VendorCustomerAnalytics>> {
  const params = new URLSearchParams()
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/customers/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorCustomerAnalytics>(endpoint)
}

/**
 * Get time-based analysis including hourly, day of week, and monthly trends
 * الحصول على التحليل الزمني بما في ذلك الساعات وأيام الأسبوع والاتجاهات الشهرية
 * 
 * @param filters - Optional filters (date_from, date_to)
 * @returns Promise with time analysis data
 */
export async function getVendorTimeAnalysis(
  filters?: Pick<VendorAnalyticsFilters, 'date_from' | 'date_to'>
): Promise<ApiResponse<VendorTimeAnalysis>> {
  const params = new URLSearchParams()
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/time-analysis/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorTimeAnalysis>(endpoint)
}

/**
 * Get period comparison analytics (current vs previous period)
 * الحصول على تحليلات مقارنة الفترات (الفترة الحالية مقابل السابقة)
 * 
 * @param filters - Optional filters (period, date_from, date_to)
 * @returns Promise with comparison analytics data
 */
export async function getVendorComparisonAnalytics(
  filters?: VendorAnalyticsFilters
): Promise<ApiResponse<VendorComparisonAnalytics>> {
  const params = new URLSearchParams()
  if (filters?.period) {
    params.append('period', filters.period)
  }
  if (filters?.date_from) {
    params.append('date_from', filters.date_from)
  }
  if (filters?.date_to) {
    params.append('date_to', filters.date_to)
  }
  
  const queryString = params.toString()
  const endpoint = `/analytics/comparison/${queryString ? `?${queryString}` : ''}`
  return vendorFetch<VendorComparisonAnalytics>(endpoint)
}

// =============================================================================
// Settings API Functions
// دوال API الإعدادات
// =============================================================================

/**
 * Get vendor profile information
 * الحصول على معلومات ملف البائع الشخصي
 * 
 * @returns Promise with profile data
 */
export async function getVendorProfile(): Promise<ApiResponse<VendorProfile>> {
  return vendorFetch<VendorProfile>('/settings/profile/')
}

/**
 * Update vendor profile information
 * تحديث معلومات ملف البائع الشخصي
 * 
 * @param data - Profile update data
 * @returns Promise with updated profile data
 */
export async function updateVendorProfile(
  data: VendorProfileUpdate
): Promise<ApiResponse<VendorProfile>> {
  return vendorFetch<VendorProfile>('/settings/profile/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Upload vendor profile avatar
 * رفع صورة ملف البائع الشخصي
 * 
 * @param file - Avatar image file
 * @returns Promise with avatar URL
 */
export async function uploadVendorProfileAvatar(
  file: File
): Promise<ApiResponse<{ avatar_url: string }>> {
  const formData = new FormData()
  formData.append('avatar', file)
  
  return vendorFetch<{ avatar_url: string }>('/settings/profile/avatar/', {
    method: 'POST',
    body: formData,
  })
}

/**
 * Get vendor information
 * الحصول على معلومات البائع
 * 
 * @returns Promise with vendor info data
 */
export async function getVendorInfo(): Promise<ApiResponse<VendorInfo>> {
  return vendorFetch<VendorInfo>('/settings/vendor/')
}

/**
 * Update vendor information
 * تحديث معلومات البائع
 * 
 * @param data - Vendor info update data
 * @returns Promise with updated vendor info data
 */
export async function updateVendorInfo(
  data: VendorInfoUpdate
): Promise<ApiResponse<VendorInfo>> {
  return vendorFetch<VendorInfo>('/settings/vendor/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Upload vendor logo
 * رفع شعار البائع
 * 
 * @param file - Logo image file
 * @returns Promise with logo URL
 */
export async function uploadVendorLogo(
  file: File
): Promise<ApiResponse<{ logo_url: string }>> {
  const formData = new FormData()
  formData.append('logo', file)
  
  return vendorFetch<{ logo_url: string }>('/settings/vendor/logo/', {
    method: 'POST',
    body: formData,
  })
}

/**
 * Get notification preferences
 * الحصول على تفضيلات الإشعارات
 * 
 * @returns Promise with notification preferences
 */
export async function getVendorNotificationPreferences(): Promise<ApiResponse<VendorNotificationPreferences>> {
  return vendorFetch<VendorNotificationPreferences>('/settings/notifications/')
}

/**
 * Update notification preferences
 * تحديث تفضيلات الإشعارات
 * 
 * @param data - Notification preferences update data
 * @returns Promise with updated preferences
 */
export async function updateVendorNotificationPreferences(
  data: VendorNotificationPreferencesUpdate
): Promise<ApiResponse<VendorNotificationPreferences>> {
  return vendorFetch<VendorNotificationPreferences>('/settings/notifications/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Get store settings
 * الحصول على إعدادات المتجر
 * 
 * @returns Promise with store settings
 */
export async function getVendorStoreSettings(): Promise<ApiResponse<VendorStoreSettings>> {
  return vendorFetch<VendorStoreSettings>('/settings/store/')
}

/**
 * Update store settings
 * تحديث إعدادات المتجر
 * 
 * @param data - Store settings update data
 * @returns Promise with updated store settings
 */
export async function updateVendorStoreSettings(
  data: VendorStoreSettingsUpdate
): Promise<ApiResponse<VendorStoreSettings>> {
  return vendorFetch<VendorStoreSettings>('/settings/store/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Get active sessions
 * الحصول على الجلسات النشطة
 * 
 * @returns Promise with active sessions list
 */
export async function getVendorActiveSessions(): Promise<ApiResponse<VendorActiveSession[]>> {
  return vendorFetch<VendorActiveSession[]>('/settings/sessions/')
}

/**
 * Revoke a session
 * إلغاء جلسة
 * 
 * @param sessionKey - Session key to revoke
 * @returns Promise with success message
 */
export async function revokeVendorSession(
  sessionKey: string
): Promise<ApiResponse<null>> {
  return vendorFetch<null>(`/settings/sessions/${sessionKey}/`, {
    method: 'DELETE',
  })
}

