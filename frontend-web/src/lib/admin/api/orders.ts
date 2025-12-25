/**
 * Admin Orders API
 * واجهة برمجة الطلبات للإدارة
 * 
 * This file contains API functions for order management.
 * هذا الملف يحتوي على دوال API لإدارة الطلبات.
 * 
 * Features:
 * - List orders with filters and pagination
 * - Get order details
 * - Update order status
 * - Bulk actions on orders
 * - Order statistics
 * 
 * الميزات:
 * - عرض الطلبات مع الفلاتر والترقيم
 * - الحصول على تفاصيل الطلب
 * - تحديث حالة الطلب
 * - عمليات مجمعة على الطلبات
 * - إحصائيات الطلبات
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Order,
  OrderDetail,
  OrderFilters,
  OrderStatusUpdatePayload,
  OrderBulkActionPayload,
  OrderStats,
} from '../types/orders'
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpired,
} from '../api'


// =============================================================================
// Configuration
// الإعدادات
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const ADMIN_API_URL = `${API_BASE_URL}/admin`


// =============================================================================
// Base Fetch Function (with token refresh)
// دالة الجلب الأساسية (مع تجديد التوكن)
// =============================================================================

/**
 * Authenticated fetch for admin API
 * جلب مصادق لـ API الإدارة
 * 
 * Handles:
 * - Adding Authorization header
 * - Token refresh on expiry
 * - Error handling
 * 
 * يتعامل مع:
 * - إضافة header المصادقة
 * - تجديد التوكن عند الانتهاء
 * - معالجة الأخطاء
 */
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ADMIN_API_URL}${endpoint}`
  
  // Get access token
  // الحصول على توكن الوصول
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
  // بناء الـ headers
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
    
    const data = await response.json()
    
    // Handle 401 Unauthorized
    // معالجة 401 غير مصرح
    if (response.status === 401) {
      clearTokens()
      throw new Error(data.message || 'Unauthorized')
    }
    
    return data as ApiResponse<T>
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}


/**
 * Refresh access token using refresh token
 * تجديد توكن الوصول باستخدام توكن التجديد
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
      saveTokens(data.data.access, refreshToken)
      return data.data.access
    }
    
    return null
  } catch {
    return null
  }
}


// =============================================================================
// Orders API Functions
// دوال API الطلبات
// =============================================================================

/**
 * Get all orders with optional filters
 * جلب جميع الطلبات مع فلاتر اختيارية
 * 
 * @param filters - Optional filters for orders
 * @returns Paginated orders response
 * 
 * @example
 * const response = await getOrders({ status: 'pending', page: 1 })
 */
export async function getOrders(
  filters?: OrderFilters
): Promise<ApiResponse<PaginatedResponse<Order>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.order_type) params.append('order_type', filters.order_type)
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    if (filters.is_guest !== undefined) params.append('is_guest', String(filters.is_guest))
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.page_size) params.append('page_size', String(filters.page_size))
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/orders/?${queryString}` : '/orders/'
  
  return adminFetch<PaginatedResponse<Order>>(endpoint)
}


/**
 * Get single order details
 * جلب تفاصيل طلب واحد
 * 
 * @param id - Order ID
 * @returns Full order details including items
 * 
 * @example
 * const response = await getOrder(123)
 */
export async function getOrder(id: number): Promise<ApiResponse<OrderDetail>> {
  return adminFetch<OrderDetail>(`/orders/${id}/`)
}


/**
 * Update order status
 * تحديث حالة الطلب
 * 
 * @param id - Order ID
 * @param data - Status update payload
 * @returns Updated order details
 * 
 * Security:
 * - Validates status transitions
 * - Only allows valid transitions
 * 
 * الأمان:
 * - يتحقق من انتقالات الحالة
 * - يسمح فقط بالانتقالات الصالحة
 * 
 * @example
 * const response = await updateOrderStatus(123, { status: 'confirmed' })
 */
export async function updateOrderStatus(
  id: number,
  data: OrderStatusUpdatePayload
): Promise<ApiResponse<OrderDetail>> {
  return adminFetch<OrderDetail>(`/orders/${id}/status/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Perform bulk action on multiple orders
 * تنفيذ عملية مجمعة على عدة طلبات
 * 
 * @param payload - Bulk action payload
 * @returns Affected count
 * 
 * Supported actions:
 * - confirm: Confirm pending orders
 * - ship: Mark orders as shipped
 * - deliver: Mark orders as delivered
 * - cancel: Cancel orders
 * 
 * العمليات المدعومة:
 * - confirm: تأكيد الطلبات المعلقة
 * - ship: تحديد الطلبات كمشحونة
 * - deliver: تحديد الطلبات كمسلمة
 * - cancel: إلغاء الطلبات
 * 
 * @example
 * const response = await bulkOrderAction({
 *   order_ids: [1, 2, 3],
 *   action: 'confirm'
 * })
 */
export async function bulkOrderAction(
  payload: OrderBulkActionPayload
): Promise<ApiResponse<{ affected_count: number }>> {
  return adminFetch<{ affected_count: number }>('/orders/bulk-action/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}


/**
 * Get order statistics
 * الحصول على إحصائيات الطلبات
 * 
 * @returns Order statistics for dashboard
 * 
 * Includes:
 * - Orders count by status
 * - Today's orders and revenue
 * - Total orders and revenue
 * - Orders needing attention
 * 
 * يتضمن:
 * - عدد الطلبات حسب الحالة
 * - طلبات وإيرادات اليوم
 * - إجمالي الطلبات والإيرادات
 * - الطلبات التي تحتاج انتباه
 * 
 * @example
 * const response = await getOrderStats()
 */
export async function getOrderStats(): Promise<ApiResponse<OrderStats>> {
  return adminFetch<OrderStats>('/orders/stats/')
}

