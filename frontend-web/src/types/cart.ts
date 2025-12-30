/**
 * Cart Types
 * أنواع السلة
 */

import { ProductVariant, Product } from './product'
import { User } from './user'

/**
 * Cart Item from API
 * عنصر السلة من API
 */
export type CartItem = {
  id: number
  variant: ProductVariant
  product: Product | null
  quantity: number
  price: string
  subtotal: string
  created_at: string
  updated_at: string
}

/**
 * Cart from API
 * السلة من API
 */
export type Cart = {
  id: number
  user: number | null
  items: CartItem[]
  item_count: number
  subtotal: string
  created_at: string
  updated_at: string
}

/**
 * Add Item to Cart DTO
 * بيانات إضافة عنصر للسلة
 */
export type AddCartItemDTO = {
  variant_id: number
  quantity: number
}

/**
 * Update Cart Item DTO
 * بيانات تحديث عنصر السلة
 */
export type UpdateCartItemDTO = {
  quantity: number
}

