/**
 * Admin Cart Types
 * أنواع السلل للإدارة
 * 
 * This file contains TypeScript interfaces for cart management.
 * هذا الملف يحتوي على واجهات TypeScript لإدارة السلل.
 * 
 * @author Yalla Buy Team
 */

import type { ProductVariant, Product } from '@/types/product'


// =============================================================================
// Cart Item Interface
// واجهة عنصر السلة
// =============================================================================

/**
 * Cart item details from API
 * تفاصيل عنصر السلة من API
 */
export interface CartItem {
  /** معرف عنصر السلة */
  id: number
  /** متغير المنتج */
  variant: ProductVariant
  /** المنتج */
  product: Product
  /** الكمية */
  quantity: number
  /** السعر (لقطة في وقت الإضافة) */
  price: string
  /** المجموع الفرعي */
  subtotal: string
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// Cart Interface (List View)
// واجهة السلة (عرض القائمة)
// =============================================================================

/**
 * Cart data for list view (optimized)
 * بيانات السلة لعرض القائمة (مُحسّن)
 */
export interface Cart {
  /** معرف السلة */
  id: number
  /** معرف المستخدم (null للسلل الضيفية) */
  user: number | null
  /** البريد الإلكتروني للمستخدم */
  user_email: string | null
  /** اسم المستخدم */
  user_name: string | null
  /** مفتاح الجلسة (للسلل الضيفية) */
  session_key: string | null
  /** هل هي سلة ضيفية */
  is_guest_cart: boolean
  /** عدد العناصر */
  item_count: number
  /** المجموع الفرعي */
  subtotal: string
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// Cart Interface (Detail View)
// واجهة السلة (عرض التفاصيل)
// =============================================================================

/**
 * Cart details from API
 * تفاصيل السلة من API
 */
export interface CartDetail extends Cart {
  /** عناصر السلة */
  items: CartItem[]
}


// =============================================================================
// Cart Filters Interface
// واجهة فلاتر السلل
// =============================================================================

/**
 * Filters for cart list
 * فلاتر قائمة السلل
 */
export interface CartFilters {
  /** البحث (البريد الإلكتروني، مفتاح الجلسة) */
  search?: string
  /** معرف المستخدم */
  user_id?: number
  /** هل هي سلة ضيفية */
  is_guest?: boolean
  /** تاريخ من */
  date_from?: string
  /** تاريخ إلى */
  date_to?: string
  /** الصفحة */
  page?: number
  /** الترتيب */
  ordering?: string
}


// =============================================================================
// Cart Statistics Interface
// واجهة إحصائيات السلل
// =============================================================================

/**
 * Cart statistics from API
 * إحصائيات السلل من API
 */
export interface CartStats {
  /** إجمالي عدد السلل */
  total_carts: number
  /** السلل النشطة (محدثة في آخر 7 أيام) */
  active_carts: number
  /** عدد السلل الضيفية */
  guest_carts: number
  /** عدد سلل المستخدمين المسجلين */
  authenticated_carts: number
  /** إجمالي العناصر في جميع السلل */
  total_items: number
  /** القيمة الإجمالية لجميع السلل */
  total_value: string
  /** متوسط العناصر لكل سلة */
  average_items_per_cart: string
  /** متوسط قيمة السلة */
  average_cart_value: string
}


// =============================================================================
// Cart Item Add Payload
// حمولة إضافة عنصر للسلة
// =============================================================================

/**
 * Payload for adding item to cart
 * حمولة إضافة عنصر للسلة
 */
export interface CartItemAddPayload {
  /** معرف متغير المنتج */
  variant_id: number
  /** الكمية */
  quantity: number
}


// =============================================================================
// Cart Item Update Payload
// حمولة تحديث عنصر السلة
// =============================================================================

/**
 * Payload for updating cart item
 * حمولة تحديث عنصر السلة
 */
export interface CartItemUpdatePayload {
  /** الكمية الجديدة */
  quantity: number
}

