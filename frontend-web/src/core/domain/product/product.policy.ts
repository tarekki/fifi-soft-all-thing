/**
 * Product Business Rules / Policies
 * قواعد العمل للمنتجات
 */

import type { ProductEntity } from './product.types'

export class ProductPolicy {
  /**
   * Check if product can be viewed
   * التحقق من إمكانية عرض المنتج
   */
  static canView(product: ProductEntity): boolean {
    return product.is_active
  }

  /**
   * Check if product can be purchased
   * التحقق من إمكانية شراء المنتج
   */
  static canPurchase(product: ProductEntity): boolean {
    return product.is_active && parseFloat(product.base_price) > 0
  }
}

