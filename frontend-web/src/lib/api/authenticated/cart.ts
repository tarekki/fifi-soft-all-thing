/**
 * Cart API Client
 * عميل API للسلة
 * 
 * API client for cart management
 * عميل API لإدارة السلة
 * 
 * Endpoints:
 * - GET /api/v1/cart/ - Get current user's cart
 * - POST /api/v1/cart/add_item/ - Add item to cart
 * - PATCH /api/v1/cart/update_item/{id}/ - Update item quantity
 * - DELETE /api/v1/cart/remove_item/{id}/ - Remove item from cart
 * - DELETE /api/v1/cart/clear/ - Clear all items from cart
 * 
 * Security:
 * - Supports both authenticated and guest users
 * - Guest users: Uses session_key
 * - Authenticated users: Uses JWT token
 * 
 * الأمان:
 * - يدعم المستخدمين المسجلين والضيوف
 * - المستخدمون الضيوف: يستخدمون session_key
 * - المستخدمون المسجلون: يستخدمون رمز JWT
 */

import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPatch,
  authenticatedDelete,
} from './client'
import type { ApiResponse } from '@/types/api'
import type { Cart, AddCartItemDTO, UpdateCartItemDTO } from '@/types/cart'

/**
 * Get current user's cart
 * الحصول على سلة المستخدم الحالي
 * 
 * @returns User's cart with all items
 * 
 * Security:
 * - Authenticated users: Returns cart linked to user account
 * - Guest users: Returns cart linked to session
 * 
 * الأمان:
 * - المستخدمون المسجلون: يعيد السلة المرتبطة بحساب المستخدم
 * - المستخدمون الضيوف: يعيد السلة المرتبطة بالجلسة
 */
export async function getCart(): Promise<ApiResponse<Cart>> {
  return authenticatedGet<ApiResponse<Cart>>('/cart/')
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
 * - Updates price snapshot
 * 
 * منطق العمل:
 * - إذا كان العنصر موجوداً، يتم زيادة الكمية
 * - يتحقق من توفر المنتج
 * - يحدث لقطة السعر
 */
export async function addCartItem(data: AddCartItemDTO): Promise<ApiResponse<Cart>> {
  return authenticatedPost<ApiResponse<Cart>>('/cart/add_item/', data)
}

/**
 * Update cart item quantity
 * تحديث كمية عنصر السلة
 * 
 * @param itemId - Cart item ID
 * @param data - Update data (quantity)
 * @returns Updated cart
 */
export async function updateCartItem(
  itemId: number,
  data: UpdateCartItemDTO
): Promise<ApiResponse<Cart>> {
  return authenticatedPatch<ApiResponse<Cart>>(`/cart/update_item/${itemId}/`, data)
}

/**
 * Remove item from cart
 * إزالة عنصر من السلة
 * 
 * @param itemId - Cart item ID
 * @returns Updated cart
 */
export async function removeCartItem(itemId: number): Promise<ApiResponse<Cart>> {
  return authenticatedDelete<ApiResponse<Cart>>(`/cart/remove_item/${itemId}/`)
}

/**
 * Clear all items from cart
 * مسح جميع العناصر من السلة
 * 
 * @returns Empty cart
 */
export async function clearCart(): Promise<ApiResponse<Cart>> {
  return authenticatedDelete<ApiResponse<Cart>>('/cart/clear/')
}

