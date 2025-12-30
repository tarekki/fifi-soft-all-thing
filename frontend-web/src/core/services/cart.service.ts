/**
 * Cart Service
 * خدمة السلة
 * 
 * Business logic for cart operations
 * منطق العمل لعمليات السلة
 */

import { CartRepository } from '../repositories/cart.repository'
import type { Cart, AddCartItemDTO, UpdateCartItemDTO } from '@/types/cart'

/**
 * Cart Service
 * خدمة السلة
 * 
 * Handles cart operations with business logic
 * يتعامل مع عمليات السلة مع منطق العمل
 */
export class CartService {
  constructor(private cartRepository: CartRepository) {}

  /**
   * Get current user's cart
   * الحصول على سلة المستخدم الحالي
   * 
   * @returns User's cart
   * 
   * Note: Works for both authenticated and guest users
   * ملاحظة: يعمل للمستخدمين المسجلين والضيوف
   */
  async getCart(): Promise<Cart> {
    return this.cartRepository.getCart()
  }

  /**
   * Add item to cart
   * إضافة عنصر للسلة
   * 
   * @param data - Item data (variant_id, quantity)
   * @returns Updated cart
   * 
   * Business Logic:
   * - Validates quantity (must be at least 1)
   * - If item exists, quantity is increased
   * 
   * منطق العمل:
   * - يتحقق من الكمية (يجب أن تكون على الأقل 1)
   * - إذا كان العنصر موجوداً، يتم زيادة الكمية
   */
  async addItem(data: AddCartItemDTO): Promise<Cart> {
    // Validate quantity
    // التحقق من الكمية
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('Quantity must be at least 1')
    }

    return this.cartRepository.addItem(data)
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
    // Validate quantity
    // التحقق من الكمية
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('Quantity must be at least 1')
    }

    return this.cartRepository.updateItem(itemId, data)
  }

  /**
   * Remove item from cart
   * إزالة عنصر من السلة
   * 
   * @param itemId - Cart item ID
   * @returns Updated cart
   */
  async removeItem(itemId: number): Promise<Cart> {
    return this.cartRepository.removeItem(itemId)
  }

  /**
   * Clear all items from cart
   * مسح جميع العناصر من السلة
   * 
   * @returns Empty cart
   */
  async clear(): Promise<Cart> {
    return this.cartRepository.clear()
  }
}

