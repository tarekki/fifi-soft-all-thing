/**
 * Order Domain Types
 * أنواع نطاق الطلب
 * 
 * Domain-specific types for Order entity
 * أنواع خاصة بالنطاق لكيان الطلب
 */

import type { Order, OrderItem, CreateOrderDTO, OrderStatus, OrderType } from '@/types/order'
import type { User } from '@/types/user'

export type OrderEntity = Order

export type OrderItemEntity = OrderItem

export type CreateOrderEntityDTO = CreateOrderDTO

export type OrderStatusEntity = OrderStatus

export type OrderTypeEntity = OrderType

/**
 * Order validation result
 * نتيجة التحقق من الطلب
 */
export type OrderValidationResult = {
  valid: boolean
  errors?: string[]
}

/**
 * Order calculation result
 * نتيجة حساب الطلب
 */
export type OrderCalculationResult = {
  subtotal: number
  delivery_fee: number
  platform_commission: number
  total: number
}

