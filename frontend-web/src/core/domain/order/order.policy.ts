/**
 * Order Business Rules / Policies
 * قواعد العمل للطلبات
 * 
 * Contains all business rules and validation logic for orders
 * يحتوي على جميع قواعد العمل ومنطق التحقق للطلبات
 */

import type { OrderEntity, CreateOrderEntityDTO, OrderValidationResult, OrderCalculationResult } from './order.types'
import type { User } from '@/types/user'

export class OrderPolicy {
  /**
   * Check if user can create an order
   * التحقق من إمكانية إنشاء طلب
   * 
   * Rules:
   * - Customers can create orders
   * - Guests (null user) can create orders
   * - Vendors and Admins cannot create orders as customers
   * 
   * القواعد:
   * - الزبائن يمكنهم إنشاء طلبات
   * - الضيوف (مستخدم null) يمكنهم إنشاء طلبات
   * - البائعون والمسؤولون لا يمكنهم إنشاء طلبات كزبائن
   */
  static canCreateOrder(user: User | null): boolean {
    if (!user) {
      return true // Guest orders allowed
    }
    return user.role === 'customer'
  }

  /**
   * Check if user can view an order
   * التحقق من إمكانية عرض طلب
   */
  static canViewOrder(order: OrderEntity, user: User | null): boolean {
    if (!user) {
      return false // Guests cannot view orders (they need to login)
    }

    // Admin can view all orders
    if (user.role === 'admin' || user.is_superuser) {
      return true
    }

    // Customer can view their own orders
    if (user.role === 'customer' && order.user?.id === user.id) {
      return true
    }

    // Vendor can view orders containing their products
    // This will be checked at service level with vendor association
    if (user.role === 'vendor') {
      return true // Service will filter by vendor products
    }

    return false
  }

  /**
   * Check if user can cancel an order
   * التحقق من إمكانية إلغاء طلب
   */
  static canCancelOrder(order: OrderEntity, user: User | null): boolean {
    if (!user) {
      return false
    }

    // Cannot cancel already cancelled or delivered orders
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return false
    }

    // Admin can cancel any order
    if (user.role === 'admin' || user.is_superuser) {
      return true
    }

    // Customer can cancel their own pending orders
    if (user.role === 'customer' && order.user?.id === user.id && order.status === 'pending') {
      return true
    }

    // Vendor can cancel orders containing their products (if status allows)
    if (user.role === 'vendor' && ['pending', 'confirmed'].includes(order.status)) {
      return true // Service will check vendor association
    }

    return false
  }

  /**
   * Check if user can update order status
   * التحقق من إمكانية تحديث حالة الطلب
   */
  static canUpdateOrderStatus(order: OrderEntity, newStatus: string, user: User | null): boolean {
    if (!user) {
      return false
    }

    // Admin can update any order status
    if (user.role === 'admin' || user.is_superuser) {
      return true
    }

    // Vendor can update status of orders containing their products
    if (user.role === 'vendor') {
      // Cannot change cancelled or delivered orders
      if (order.status === 'cancelled' || order.status === 'delivered') {
        return false
      }
      return true // Service will check vendor association
    }

    return false
  }

  /**
   * Validate order data before creation
   * التحقق من بيانات الطلب قبل الإنشاء
   */
  static validateOrderData(data: CreateOrderEntityDTO): OrderValidationResult {
    const errors: string[] = []

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push('Order must have at least one item')
    }

    // Validate each item
    data.items?.forEach((item, index) => {
      if (!item.variant_id || item.variant_id <= 0) {
        errors.push(`Item ${index + 1}: Invalid variant ID`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
    })

    // Validate customer info
    if (!data.customer_name || data.customer_name.trim().length === 0) {
      errors.push('Customer name is required')
    }

    if (!data.customer_phone || data.customer_phone.trim().length === 0) {
      errors.push('Customer phone is required')
    }

    // Basic phone validation (should be at least 10 digits)
    if (data.customer_phone && data.customer_phone.replace(/\D/g, '').length < 10) {
      errors.push('Customer phone must be a valid phone number')
    }

    if (!data.customer_address || data.customer_address.trim().length === 0) {
      errors.push('Customer address is required')
    }

    // Validate delivery fee (if provided, must be non-negative)
    if (data.delivery_fee && parseFloat(data.delivery_fee) < 0) {
      errors.push('Delivery fee cannot be negative')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Calculate order totals
   * حساب إجماليات الطلب
   * 
   * Business rules:
   * - Subtotal = sum of (item price * quantity)
   * - Platform commission = 10% of subtotal
   * - Total = subtotal + delivery_fee
   * 
   * قواعد العمل:
   * - المجموع الفرعي = مجموع (سعر العنصر * الكمية)
   * - عمولة المنصة = 10% من المجموع الفرعي
   * - الإجمالي = المجموع الفرعي + رسوم التوصيل
   */
  static calculateOrderTotals(
    items: Array<{ price: number; quantity: number }>,
    deliveryFee: number = 0
  ): OrderCalculationResult {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const platformCommission = subtotal * 0.1 // 10% commission
    const total = subtotal + deliveryFee

    return {
      subtotal,
      delivery_fee: deliveryFee,
      platform_commission: platformCommission,
      total,
    }
  }

  /**
   * Check if order status transition is valid
   * التحقق من صحة انتقال حالة الطلب
   */
  static isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // Cannot change from delivered
      cancelled: [], // Cannot change from cancelled
    }

    const allowedStatuses = validTransitions[currentStatus] || []
    return allowedStatuses.includes(newStatus)
  }
}

