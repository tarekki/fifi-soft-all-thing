/**
 * Admin Carts API
 * واجهة برمجة السلل للإدارة
 * 
 * This file contains API functions for cart management.
 * هذا الملف يحتوي على دوال API لإدارة السلل.
 * 
 * Features:
 * - List carts with filters and pagination
 * - Get cart details
 * - Add item to user's cart
 * - Update item in user's cart
 * - Remove item from user's cart
 * - Clear user's cart
 * - Delete cart
 * - Cart statistics
 * 
 * الميزات:
 * - عرض السلل مع الفلاتر والترقيم
 * - الحصول على تفاصيل السلة
 * - إضافة عنصر لسلة مستخدم
 * - تحديث عنصر في سلة مستخدم
 * - إزالة عنصر من سلة مستخدم
 * - مسح سلة مستخدم
 * - حذف سلة
 * - إحصائيات السلل
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Cart,
  CartDetail,
  CartFilters,
  CartStats,
  CartItemAddPayload,
  CartItemUpdatePayload,
} from '../types/carts'
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/v1'
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
  
  // Prepare headers
  // إعداد الرؤوس
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })
    
    const data = await response.json().catch(() => null)
    
    if (!response.ok) {
      const errorMessage = data?.message || data?.detail || `HTTP ${response.status}: ${response.statusText}`
      return {
        success: false,
        message: errorMessage,
        data: null,
      }
    }
    
    // Handle success response
    // معالجة استجابة النجاح
    if (data?.success === false) {
      return {
        success: false,
        message: data.message || 'Request failed',
        data: null,
      }
    }
    
    return {
      success: true,
      message: data?.message || 'Success',
      data: data?.data || data,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error'
    return {
      success: false,
      message: errorMessage,
      data: null,
    }
  }
}

/**
 * Refresh access token
 * تجديد توكن الوصول
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    })
    
    const data = await response.json()
    
    if (response.ok && data?.access) {
      saveTokens(data.access, refreshToken)
      return data.access
    }
    
    return null
  } catch {
    return null
  }
}


// =============================================================================
// Cart API Functions
// دوال API السلل
// =============================================================================

/**
 * Get all carts with filters and pagination
 * جلب جميع السلل مع الفلاتر والترقيم
 * 
 * @param filters - Cart filters
 * @returns Paginated carts response
 * 
 * @example
 * const response = await getCarts({ search: 'user@example.com', page: 1 })
 */
export async function getCarts(
  filters?: CartFilters
): Promise<ApiResponse<PaginatedResponse<Cart>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.user_id) params.append('user_id', String(filters.user_id))
    if (filters.is_guest !== undefined) params.append('is_guest', String(filters.is_guest))
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.ordering) params.append('ordering', filters.ordering)
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/carts/?${queryString}` : '/carts/'
  
  return adminFetch<PaginatedResponse<Cart>>(endpoint)
}


/**
 * Get single cart details
 * جلب تفاصيل سلة واحدة
 * 
 * @param id - Cart ID
 * @returns Full cart details including items
 * 
 * @example
 * const response = await getCart(123)
 */
export async function getCart(id: number): Promise<ApiResponse<CartDetail>> {
  return adminFetch<CartDetail>(`/carts/${id}/`)
}


/**
 * Add item to user's cart (Admin operation)
 * إضافة عنصر لسلة مستخدم (عملية مسؤول)
 * 
 * @param id - Cart ID
 * @param data - Item add payload
 * @returns Updated cart details
 * 
 * @example
 * const response = await addCartItem(123, { variant_id: 456, quantity: 2 })
 */
export async function addCartItem(
  id: number,
  data: CartItemAddPayload
): Promise<ApiResponse<CartDetail>> {
  return adminFetch<CartDetail>(`/carts/${id}/add_item/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


/**
 * Update item in user's cart (Admin operation)
 * تحديث عنصر في سلة مستخدم (عملية مسؤول)
 * 
 * @param id - Cart ID
 * @param itemId - Cart item ID
 * @param data - Item update payload
 * @returns Updated cart details
 * 
 * @example
 * const response = await updateCartItem(123, 789, { quantity: 5 })
 */
export async function updateCartItem(
  id: number,
  itemId: number,
  data: CartItemUpdatePayload
): Promise<ApiResponse<CartDetail>> {
  return adminFetch<CartDetail>(`/carts/${id}/items/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}


/**
 * Remove item from user's cart (Admin operation)
 * إزالة عنصر من سلة مستخدم (عملية مسؤول)
 * 
 * @param id - Cart ID
 * @param itemId - Cart item ID
 * @returns Updated cart details
 * 
 * @example
 * const response = await removeCartItem(123, 789)
 */
export async function removeCartItem(
  id: number,
  itemId: number
): Promise<ApiResponse<CartDetail>> {
  return adminFetch<CartDetail>(`/carts/${id}/items/${itemId}/`, {
    method: 'DELETE',
  })
}


/**
 * Clear all items from user's cart (Admin operation)
 * مسح جميع العناصر من سلة مستخدم (عملية مسؤول)
 * 
 * @param id - Cart ID
 * @returns Updated cart details
 * 
 * @example
 * const response = await clearCart(123)
 */
export async function clearCart(id: number): Promise<ApiResponse<CartDetail>> {
  return adminFetch<CartDetail>(`/carts/${id}/clear/`, {
    method: 'DELETE',
  })
}


/**
 * Delete cart (Admin operation)
 * حذف سلة (عملية مسؤول)
 * 
 * @param id - Cart ID
 * @returns Success response
 * 
 * Warning: This will permanently delete the cart and all its items.
 * تحذير: سيتم حذف السلة وعناصرها نهائياً.
 * 
 * @example
 * const response = await deleteCart(123)
 */
export async function deleteCart(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/carts/${id}/`, {
    method: 'DELETE',
  })
}


/**
 * Get cart statistics
 * جلب إحصائيات السلل
 * 
 * @returns Cart statistics
 * 
 * @example
 * const response = await getCartStats()
 */
export async function getCartStats(): Promise<ApiResponse<CartStats>> {
  return adminFetch<CartStats>('/carts/stats/')
}

