/**
 * Order Service
 * خدمة الطلبات
 * 
 * Business logic for orders
 * منطق العمل للطلبات
 */

import { OrderPolicy } from '../domain/order/order.policy'
import type { OrderPort } from '../ports/order.port'
import type { Order, CreateOrderDTO } from '@/types/order'
import type { User } from '@/types/user'
import type { ApiPaginatedResponse } from '@/types/api'

export class OrderService {
  constructor(private orderPort: OrderPort) {}

  /**
   * Get orders for a user
   * الحصول على طلبات مستخدم
   */
  async getOrders(
    user: User | null,
    params?: {
      vendor_id?: number
      status?: string
      page?: number
    }
  ): Promise<ApiPaginatedResponse<Order>> {
    // Apply business rules
    if (!user) {
      throw new Error('Authentication required to view orders')
    }

    // Filter by user if customer
    const queryParams = {
      ...params,
      user_id: user.role === 'customer' ? user.id : undefined,
    }

    return this.orderPort.getAll(queryParams)
  }

  /**
   * Get order by ID
   * الحصول على طلب بالمعرف
   */
  async getOrderById(id: number, user: User | null): Promise<Order> {
    const order = await this.orderPort.getById(id)

    // Check permissions
    if (!OrderPolicy.canViewOrder(order, user)) {
      throw new Error('You do not have permission to view this order')
    }

    return order
  }

  /**
   * Create a new order
   * إنشاء طلب جديد
   */
  async createOrder(data: CreateOrderDTO, user: User | null): Promise<Order> {
    // Check permissions
    if (!OrderPolicy.canCreateOrder(user)) {
      throw new Error('You do not have permission to create orders')
    }

    // Validate order data
    const validation = OrderPolicy.validateOrderData(data)
    if (!validation.valid) {
      throw new Error(`Order validation failed: ${validation.errors?.join(', ')}`)
    }

    // Create order
    return this.orderPort.create(data)
  }

  /**
   * Update order status
   * تحديث حالة الطلب
   */
  async updateOrderStatus(
    id: number,
    newStatus: string,
    user: User | null
  ): Promise<Order> {
    const order = await this.orderPort.getById(id)

    // Check permissions
    if (!OrderPolicy.canUpdateOrderStatus(order, newStatus, user)) {
      throw new Error('You do not have permission to update this order status')
    }

    // Validate status transition
    if (!OrderPolicy.isValidStatusTransition(order.status, newStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`)
    }

    return this.orderPort.updateStatus(id, newStatus)
  }

  /**
   * Cancel an order
   * إلغاء طلب
   */
  async cancelOrder(id: number, user: User | null): Promise<Order> {
    const order = await this.orderPort.getById(id)

    // Check permissions
    if (!OrderPolicy.canCancelOrder(order, user)) {
      throw new Error('You do not have permission to cancel this order')
    }

    return this.orderPort.cancel(id)
  }
}

