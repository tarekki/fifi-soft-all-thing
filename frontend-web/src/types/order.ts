/**
 * Order Types
 * أنواع الطلبات
 */

import { ProductVariant } from './product'
import { User } from './user'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type OrderType = 'online' | 'pos'

export type OrderItem = {
  id: number
  product_variant: ProductVariant
  quantity: number
  price: string
  subtotal: string
}

export type Order = {
  id: number
  order_number: string
  user: User | null
  is_guest_order: boolean
  customer_name: string
  customer_phone: string
  customer_address: string
  order_type: OrderType
  status: OrderStatus
  subtotal: string
  delivery_fee: string
  platform_commission: string
  total: string
  notes: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type CreateOrderDTO = {
  items: {
    variant_id: number
    quantity: number
  }[]
  customer_name: string
  customer_phone: string
  customer_address: string
  delivery_fee?: string
  notes?: string
  order_type?: OrderType
}

