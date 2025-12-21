/**
 * Order Repository Implementation
 * تنفيذ مستودع الطلبات
 * 
 * Implements OrderPort interface using Authenticated API Client
 * ينفذ واجهة OrderPort باستخدام عميل API المصادق عليه
 * 
 * This repository acts as an adapter between the Core Layer (Services)
 * and the Data Layer (API Clients)
 * 
 * هذا المستودع يعمل كـ adapter بين طبقة Core (Services)
 * وطبقة Data (API Clients)
 * 
 * Architecture:
 * Service → Repository (Port) → API Client → Backend
 * 
 * البنية المعمارية:
 * Service → Repository (Port) → API Client → Backend
 * 
 * Security:
 * - All operations require authentication (JWT token)
 * - Orders are filtered by user role automatically by backend
 * - Customers: Only their own orders
 * - Vendors: Only orders for their products
 * - Admins: All orders
 * 
 * الأمان:
 * - جميع العمليات تتطلب المصادقة (رمز JWT)
 * - الطلبات مفلترة حسب دور المستخدم تلقائياً بواسطة الخادم
 * - العملاء: طلباتهم فقط
 * - البائعون: الطلبات لمنتجاتهم فقط
 * - المطورون: جميع الطلبات
 */

import type { OrderPort } from '../ports/order.port'
import type { Order, CreateOrderDTO, OrderStatus } from '@/types/order'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api'

/**
 * Order Repository
 * مستودع الطلبات
 * 
 * Implements OrderPort interface
 * Uses Authenticated API Client for order operations
 * 
 * ينفذ واجهة OrderPort
 * يستخدم عميل API المصادق عليه لعمليات الطلبات
 */
export class OrderRepository implements OrderPort {
  /**
   * Get all orders with filtering and pagination
   * الحصول على جميع الطلبات مع الفلترة والترقيم
   * 
   * @param params - Filtering and pagination parameters
   * @returns Paginated list of orders
   * 
   * Security: 
   * - Requires authentication (JWT token from HttpOnly cookies)
   * - Backend automatically filters orders by user role
   * 
   * الأمان:
   * - يتطلب المصادقة (رمز JWT من HttpOnly cookies)
   * - الخادم يفلتر الطلبات تلقائياً حسب دور المستخدم
   */
  async getAll(params?: {
    user_id?: number
    vendor_id?: number
    status?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Order>> {
    try {
      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const ordersApi = await import('@/lib/api/authenticated/orders')
      
      // Map parameters to API client format
      // تحويل المعاملات إلى تنسيق عميل API
      const apiParams = {
        vendor_id: params?.vendor_id,
        status: params?.status as OrderStatus | undefined,
        page: params?.page,
      }
      
      // Call Authenticated API Client
      // استدعاء عميل API المصادق عليه
      const response = await ordersApi.getOrders(apiParams)
      
      return response
    } catch (error) {
      console.error('Error in OrderRepository.getAll:', error)
      
      if (error instanceof Error) {
        throw new Error(`Failed to get orders: ${error.message}`)
      }
      throw new Error('Failed to get orders: Unknown error')
    }
  }

  /**
   * Get order by ID
   * الحصول على طلب بالمعرف
   * 
   * @param id - Order ID
   * @returns Order details
   * 
   * Security:
   * - Requires authentication
   * - Backend checks if user has permission to view this order
   * 
   * الأمان:
   * - يتطلب المصادقة
   * - الخادم يتحقق من إذا كان المستخدم يملك صلاحية عرض هذا الطلب
   */
  async getById(id: number): Promise<Order> {
    try {
      if (!id || id <= 0) {
        throw new Error('Order ID must be a positive number')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const ordersApi = await import('@/lib/api/authenticated/orders')
      
      // Call Authenticated API Client
      // استدعاء عميل API المصادق عليه
      const response: ApiResponse<Order> = await ordersApi.getOrderById(id)
      
      // Extract order from API response
      // استخراج الطلب من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get order')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in OrderRepository.getById:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to get order by ID: Unknown error`)
    }
  }

  /**
   * Create a new order
   * إنشاء طلب جديد
   * 
   * @param data - Order creation data
   * @returns Created order
   * 
   * Security:
   * - Requires authentication (if user is logged in)
   * - Guest orders are allowed (no authentication required)
   * - Backend links order to user if authenticated
   * 
   * Business Logic:
   * - Validates items (stock, price, availability)
   * - Calculates totals (subtotal, delivery fee, commission, total)
   * - Applies business rules
   * 
   * الأمان:
   * - يتطلب المصادقة (إذا كان المستخدم مسجلاً)
   * - الطلبات الضيفية مسموحة (لا تتطلب المصادقة)
   * - الخادم يربط الطلب بالمستخدم إذا كان مصادقاً عليه
   * 
   * منطق العمل:
   * - يتحقق من العناصر (المخزون، السعر، التوفر)
   * - يحسب الإجماليات (المجموع الفرعي، رسوم التوصيل، العمولة، الإجمالي)
   * - يطبق قواعد العمل
   */
  async create(data: CreateOrderDTO): Promise<Order> {
    try {
      // Validate required fields
      // التحقق من الحقول المطلوبة
      if (!data.items || data.items.length === 0) {
        throw new Error('Order must contain at least one item')
      }

      if (!data.customer_name || data.customer_name.trim().length === 0) {
        throw new Error('Customer name is required')
      }

      if (!data.customer_phone || data.customer_phone.trim().length === 0) {
        throw new Error('Customer phone is required')
      }

      if (!data.customer_address || data.customer_address.trim().length === 0) {
        throw new Error('Customer address is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const ordersApi = await import('@/lib/api/authenticated/orders')
      
      // Call Authenticated API Client
      // استدعاء عميل API المصادق عليه
      const response: ApiResponse<Order> = await ordersApi.createOrder(data)
      
      // Extract order from API response
      // استخراج الطلب من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create order')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in OrderRepository.create:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create order: Unknown error')
    }
  }

  /**
   * Update order status
   * تحديث حالة الطلب
   * 
   * @param id - Order ID
   * @param status - New order status
   * @returns Updated order
   * 
   * Security:
   * - Requires authentication
   * - Only vendors (for their products) and admins can update status
   * 
   * Business Logic:
   * - Validates status transition (e.g., cannot cancel delivered order)
   * 
   * الأمان:
   * - يتطلب المصادقة
   * - فقط البائعون (لمنتجاتهم) والمسؤولون يمكنهم تحديث الحالة
   * 
   * منطق العمل:
   * - يتحقق من انتقال الحالة (مثلاً، لا يمكن إلغاء طلب تم تسليمه)
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    try {
      if (!id || id <= 0) {
        throw new Error('Order ID must be a positive number')
      }

      if (!status || status.trim().length === 0) {
        throw new Error('Status is required')
      }

      // Validate status value
      // التحقق من قيمة الحالة
      const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
      if (!validStatuses.includes(status as OrderStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const ordersApi = await import('@/lib/api/authenticated/orders')
      
      // Call Authenticated API Client
      // استدعاء عميل API المصادق عليه
      const response: ApiResponse<Order> = await ordersApi.updateOrderStatus(id, status as OrderStatus)
      
      // Extract order from API response
      // استخراج الطلب من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update order status')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in OrderRepository.updateStatus:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to update order status: Unknown error')
    }
  }

  /**
   * Cancel an order
   * إلغاء طلب
   * 
   * @param id - Order ID
   * @returns Cancelled order
   * 
   * Security:
   * - Requires authentication
   * - Only order owner (customer), vendor (for their products), or admin can cancel
   * 
   * Business Logic:
   * - Only pending/confirmed orders can be cancelled
   * - Shipped/delivered orders cannot be cancelled
   * - Stock should be restored when order is cancelled (future implementation)
   * 
   * الأمان:
   * - يتطلب المصادقة
   * - فقط مالك الطلب (الزبون)، البائع (لمنتجاته)، أو المسؤول يمكنهم الإلغاء
   * 
   * منطق العمل:
   * - فقط الطلبات المعلقة/المؤكدة يمكن إلغاؤها
   * - الطلبات المشحونة/المسلمة لا يمكن إلغاؤها
   * - يجب استعادة المخزون عند إلغاء الطلب (تنفيذ مستقبلي)
   */
  async cancel(id: number): Promise<Order> {
    try {
      if (!id || id <= 0) {
        throw new Error('Order ID must be a positive number')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const ordersApi = await import('@/lib/api/authenticated/orders')
      
      // Call Authenticated API Client to cancel order
      // استدعاء عميل API المصادق عليه لإلغاء الطلب
      const response: ApiResponse<Order> = await ordersApi.cancelOrder(id)
      
      // Extract order from API response
      // استخراج الطلب من استجابة API
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to cancel order')
      }
      
      return response.data
    } catch (error) {
      console.error('Error in OrderRepository.cancel:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to cancel order: Unknown error')
    }
  }
}

