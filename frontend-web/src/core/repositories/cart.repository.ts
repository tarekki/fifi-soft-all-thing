/**
 * Cart Repository Implementation
 * تنفيذ مستودع السلة
 * 
 * Implements cart operations using Authenticated API Client
 * ينفذ عمليات السلة باستخدام عميل API المصادق عليه
 * 
 * This repository acts as an adapter between the Core Layer (Services)
 * and the Data Layer (API Clients)
 * 
 * هذا المستودع يعمل كـ adapter بين طبقة Core (Services)
 * وطبقة Data (API Clients)
 * 
 * Architecture:
 * Service → Repository → API Client → Backend
 * 
 * البنية المعمارية:
 * Service → Repository → API Client → Backend
 * 
 * Security:
 * - Supports both authenticated and guest users
 * - Guest users: Uses session_key from cookies
 * - Authenticated users: Uses JWT token
 * 
 * الأمان:
 * - يدعم المستخدمين المسجلين والضيوف
 * - المستخدمون الضيوف: يستخدمون session_key من cookies
 * - المستخدمون المسجلون: يستخدمون رمز JWT
 */

import type { Cart, AddCartItemDTO, UpdateCartItemDTO } from '@/types/cart'
import type { ApiResponse } from '@/types/api'

/**
 * Cart Repository
 * مستودع السلة
 * 
 * Handles all cart operations via API
 * يتعامل مع جميع عمليات السلة عبر API
 */
export class CartRepository {
  /**
   * Get current user's cart
   * الحصول على سلة المستخدم الحالي
   * 
   * @returns User's cart
   * 
   * Security:
   * - Automatically uses session for guest users
   * - Automatically uses JWT for authenticated users
   * 
   * الأمان:
   * - يستخدم الجلسة تلقائياً للمستخدمين الضيوف
   * - يستخدم JWT تلقائياً للمستخدمين المسجلين
   */
  async getCart(): Promise<Cart> {
    try {
      // Import Client-Side API Client dynamically
      // استيراد عميل API جانب العميل ديناميكياً
      const cartApi = await import('@/lib/api/authenticated/cart.client')
      
      // Call Client-Side API Client
      // استدعاء عميل API جانب العميل
      const response: ApiResponse<Cart> = await cartApi.getCart()
      
      // Extract cart from API response
      // استخراج السلة من استجابة API
      if (!response.success || !response.data) {
        // If cart doesn't exist, return empty cart structure
        // إذا لم تكن السلة موجودة، أعد هيكل سلة فارغ
        if (response.message?.includes('not found') || response.message?.includes('404')) {
          return {
            id: 0,
            user: null,
            items: [],
            item_count: 0,
            subtotal: '0.00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
        throw new Error(response.message || 'Failed to get cart')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in CartRepository.getCart:', error)
      
      // If it's a 404 or cart not found, return empty cart
      // إذا كان 404 أو السلة غير موجودة، أعد سلة فارغة
      if (error instanceof Error && error.message.includes('404')) {
        return {
          id: 0,
          user: null,
          items: [],
          item_count: 0,
          subtotal: '0.00',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to get cart: Unknown error')
    }
  }

  /**
   * Add item to cart
   * إضافة عنصر للسلة
   * 
   * @param data - Item data (variant_id, quantity)
   * @returns Updated cart
   * 
   * Business Logic:
   * - If item already exists, quantity is increased
   * - Validates product availability
   * 
   * منطق العمل:
   * - إذا كان العنصر موجوداً، يتم زيادة الكمية
   * - يتحقق من توفر المنتج
   */
  async addItem(data: AddCartItemDTO): Promise<Cart> {
    try {
      // Validate required fields
      // التحقق من الحقول المطلوبة
      if (!data.variant_id || data.variant_id <= 0) {
        throw new Error('Variant ID is required and must be positive')
      }

      if (!data.quantity || data.quantity <= 0) {
        throw new Error('Quantity must be at least 1')
      }

      // Import Client-Side API Client dynamically
      // استيراد عميل API جانب العميل ديناميكياً
      const cartApi = await import('@/lib/api/authenticated/cart.client')
      
      // Call Client-Side API Client
      // استدعاء عميل API جانب العميل
      const response: ApiResponse<Cart> = await cartApi.addCartItem(data)
      
      // Extract cart from API response
      // استخراج السلة من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to add item to cart')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in CartRepository.addItem:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to add item to cart: Unknown error')
    }
  }

  /**
   * Update item quantity in cart
   * تحديث كمية عنصر في السلة
   * 
   * @param itemId - Cart item ID
   * @param data - Update data (quantity)
   * @returns Updated cart
   */
  async updateItem(itemId: number, data: UpdateCartItemDTO): Promise<Cart> {
    try {
      if (!itemId || itemId <= 0) {
        throw new Error('Item ID must be a positive number')
      }

      if (!data.quantity || data.quantity <= 0) {
        throw new Error('Quantity must be at least 1')
      }

      // Import Client-Side API Client dynamically
      // استيراد عميل API جانب العميل ديناميكياً
      const cartApi = await import('@/lib/api/authenticated/cart.client')
      
      // Call Client-Side API Client
      // استدعاء عميل API جانب العميل
      const response: ApiResponse<Cart> = await cartApi.updateCartItem(itemId, data)
      
      // Extract cart from API response
      // استخراج السلة من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update cart item')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in CartRepository.updateItem:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update cart item: Unknown error')
    }
  }

  /**
   * Remove item from cart
   * إزالة عنصر من السلة
   * 
   * @param itemId - Cart item ID
   * @returns Updated cart
   */
  async removeItem(itemId: number): Promise<Cart> {
    try {
      if (!itemId || itemId <= 0) {
        throw new Error('Item ID must be a positive number')
      }

      // Import Client-Side API Client dynamically
      // استيراد عميل API جانب العميل ديناميكياً
      const cartApi = await import('@/lib/api/authenticated/cart.client')
      
      // Call Client-Side API Client
      // استدعاء عميل API جانب العميل
      const response: ApiResponse<Cart> = await cartApi.removeCartItem(itemId)
      
      // Extract cart from API response
      // استخراج السلة من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to remove item from cart')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in CartRepository.removeItem:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to remove item from cart: Unknown error')
    }
  }

  /**
   * Clear all items from cart
   * مسح جميع العناصر من السلة
   * 
   * @returns Empty cart
   */
  async clear(): Promise<Cart> {
    try {
      // Import Client-Side API Client dynamically
      // استيراد عميل API جانب العميل ديناميكياً
      const cartApi = await import('@/lib/api/authenticated/cart.client')
      
      // Call Client-Side API Client
      // استدعاء عميل API جانب العميل
      const response: ApiResponse<Cart> = await cartApi.clearCart()
      
      // Extract cart from API response
      // استخراج السلة من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to clear cart')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in CartRepository.clear:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to clear cart: Unknown error')
    }
  }
}

