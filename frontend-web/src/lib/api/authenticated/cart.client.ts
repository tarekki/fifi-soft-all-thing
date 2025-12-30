/**
 * Cart API Client (Client-Side)
 * عميل API للسلة (جانب العميل)
 * 
 * Client-side API client for cart operations
 * عميل API جانب العميل لعمليات السلة
 * 
 * This version works in Client Components by using fetch with credentials
 * هذه النسخة تعمل في Client Components باستخدام fetch مع credentials
 */

import type { ApiResponse } from '@/types/api'
import type { Cart, AddCartItemDTO, UpdateCartItemDTO } from '@/types/cart'

/**
 * API Base URL
 * عنوان URL الأساسي للـ API
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/**
 * API Error Class
 * فئة خطأ API
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Client-side API client with cookie support
 * عميل API جانب العميل مع دعم الكوكيز
 */
async function clientApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies (HttpOnly cookies work with this)
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Try to parse response as JSON
    // محاولة تحليل الاستجابة كـ JSON
    let data: any
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (e) {
        // If JSON parsing fails, use empty object
        // إذا فشل تحليل JSON، استخدم كائن فارغ
        data = {}
      }
    } else {
      // If not JSON, get text
      // إذا لم يكن JSON، احصل على النص
      const text = await response.text()
      data = { message: text || response.statusText }
    }

    if (!response.ok) {
      // Handle different error statuses
      // التعامل مع حالات الخطأ المختلفة
      const errorMessage = 
        data?.message || 
        data?.error || 
        data?.detail ||
        `API Error: ${response.statusText} (${response.status})`
      
      throw new ApiError(errorMessage, response.status, data)
    }

    return data as T
  } catch (error) {
    // Re-throw ApiError as-is
    // إعادة رمي ApiError كما هو
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    // التعامل مع أخطاء الشبكة
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error. Please check your connection.',
        0,
        { originalError: error.message }
      )
    }
    
    // Handle other errors
    // التعامل مع الأخطاء الأخرى
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      { originalError: error }
    )
  }
}

/**
 * Get current user's cart
 * الحصول على سلة المستخدم الحالي
 */
export async function getCart(): Promise<ApiResponse<Cart>> {
  return clientApiFetch<ApiResponse<Cart>>('/cart/')
}

/**
 * Add item to cart
 * إضافة عنصر للسلة
 */
export async function addCartItem(data: AddCartItemDTO): Promise<ApiResponse<Cart>> {
  return clientApiFetch<ApiResponse<Cart>>('/cart/add_item/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update cart item quantity
 * تحديث كمية عنصر السلة
 */
export async function updateCartItem(
  itemId: number,
  data: UpdateCartItemDTO
): Promise<ApiResponse<Cart>> {
  return clientApiFetch<ApiResponse<Cart>>(`/cart/update_item/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Remove item from cart
 * إزالة عنصر من السلة
 */
export async function removeCartItem(itemId: number): Promise<ApiResponse<Cart>> {
  return clientApiFetch<ApiResponse<Cart>>(`/cart/remove_item/${itemId}/`, {
    method: 'DELETE',
  })
}

/**
 * Clear all items from cart
 * مسح جميع العناصر من السلة
 */
export async function clearCart(): Promise<ApiResponse<Cart>> {
  return clientApiFetch<ApiResponse<Cart>>('/cart/clear/', {
    method: 'DELETE',
  })
}

