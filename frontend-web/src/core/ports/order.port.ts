/**
 * Order Repository Interface
 * واجهة مستودع الطلبات
 * 
 * Defines the contract for order data access
 * يعرّف العقد للوصول إلى بيانات الطلبات
 */

import type { Order, CreateOrderDTO } from '@/types/order'
import type { ApiPaginatedResponse } from '@/types/api'

export interface OrderPort {
  /**
   * Get all orders (with filtering and pagination)
   * الحصول على جميع الطلبات (مع الفلترة والترقيم)
   */
  getAll(params?: {
    user_id?: number
    vendor_id?: number
    status?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Order>>

  /**
   * Get order by ID
   * الحصول على طلب بالمعرف
   */
  getById(id: number): Promise<Order>

  /**
   * Create a new order
   * إنشاء طلب جديد
   */
  create(data: CreateOrderDTO): Promise<Order>

  /**
   * Update order status
   * تحديث حالة الطلب
   */
  updateStatus(id: number, status: string): Promise<Order>

  /**
   * Cancel an order
   * إلغاء طلب
   */
  cancel(id: number): Promise<Order>
}

