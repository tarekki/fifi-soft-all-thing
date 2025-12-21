/**
 * Orders API Client
 * عميل API للطلبات
 * 
 * Authenticated API client for order management
 * عميل API مصادق عليه لإدارة الطلبات
 * 
 * Endpoints:
 * - POST /api/v1/orders/ - Create new order
 * - GET /api/v1/orders/ - List orders (filtered by user role)
 * - GET /api/v1/orders/{id}/ - Get order details
 * - PATCH /api/v1/orders/{id}/update-status/ - Update order status
 * 
 * Security:
 * - All requests require authentication (JWT token)
 * - Orders are filtered by user role (customer/vendor/admin)
 * - Customers can only view their own orders
 * - Vendors can view orders for their products
 * - Admins can view all orders
 * 
 * الأمان:
 * - جميع الطلبات تتطلب المصادقة (رمز JWT)
 * - الطلبات مفلترة حسب دور المستخدم (عميل/بائع/مطور)
 * - العملاء يمكنهم عرض طلباتهم فقط
 * - البائعون يمكنهم عرض الطلبات لمنتجاتهم
 * - المطورون يمكنهم عرض جميع الطلبات
 */

import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPatch,
  authenticatedDelete,
} from './client'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api'
import type { Order, CreateOrderDTO, OrderStatus } from '@/types/order'

/**
 * Create a new order
 * إنشاء طلب جديد
 * 
 * @param data - Order creation data (items, customer info, etc.)
 * @returns Created order
 * 
 * Security: Requires authentication (JWT token)
 * Business Logic: Validates items, calculates totals, applies commission
 * 
 * الأمان: يتطلب المصادقة (رمز JWT)
 * منطق العمل: يتحقق من العناصر، يحسب الإجماليات، يطبق العمولة
 */
export async function createOrder(data: CreateOrderDTO): Promise<ApiResponse<Order>> {
  return authenticatedPost<ApiResponse<Order>>('/orders/', data)
}

/**
 * Get orders list
 * الحصول على قائمة الطلبات
 * 
 * @param params - Filtering and pagination parameters
 * @returns Paginated list of orders
 * 
 * Security: Returns only orders that the user has permission to view
 * - Customers: Only their own orders
 * - Vendors: Only orders for their products
 * - Admins: All orders
 * 
 * الأمان: يعيد فقط الطلبات التي يملك المستخدم صلاحية عرضها
 * - العملاء: طلباتهم فقط
 * - البائعون: الطلبات لمنتجاتهم فقط
 * - المطورون: جميع الطلبات
 */
export async function getOrders(params?: {
  vendor_id?: number
  status?: OrderStatus
  order_type?: 'online' | 'pos'
  page?: number
  search?: string
}): Promise<ApiPaginatedResponse<Order>> {
  // Build query string
  // بناء سلسلة الاستعلام
  const queryParams = new URLSearchParams()
  
  if (params?.vendor_id) {
    queryParams.append('vendor_id', params.vendor_id.toString())
  }
  
  if (params?.status) {
    queryParams.append('status', params.status)
  }
  
  if (params?.order_type) {
    queryParams.append('order_type', params.order_type)
  }
  
  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }
  
  if (params?.search) {
    queryParams.append('search', params.search)
  }

  const query = queryParams.toString()
  const endpoint = `/orders/${query ? `?${query}` : ''}`

  return authenticatedGet<ApiPaginatedResponse<Order>>(endpoint)
}

/**
 * Get order by ID
 * الحصول على طلب بالمعرف
 * 
 * @param id - Order ID
 * @returns Order details
 * 
 * Security: Returns order only if user has permission to view it
 * - Customers: Only their own orders
 * - Vendors: Only orders for their products
 * - Admins: Any order
 * 
 * الأمان: يعيد الطلب فقط إذا كان المستخدم يملك صلاحية عرضه
 * - العملاء: طلباتهم فقط
 * - البائعون: الطلبات لمنتجاتهم فقط
 * - المطورون: أي طلب
 */
export async function getOrderById(id: number): Promise<ApiResponse<Order>> {
  return authenticatedGet<ApiResponse<Order>>(`/orders/${id}/`)
}

/**
 * Update order status
 * تحديث حالة الطلب
 * 
 * @param id - Order ID
 * @param status - New order status
 * @returns Updated order
 * 
 * Security: Only vendors and admins can update order status
 * Business Logic: Validates status transitions (e.g., cannot cancel delivered order)
 * 
 * الأمان: البائعون والمطورون فقط يمكنهم تحديث حالة الطلب
 * منطق العمل: يتحقق من انتقالات الحالة (مثلاً، لا يمكن إلغاء طلب تم تسليمه)
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<ApiResponse<Order>> {
  return authenticatedPatch<ApiResponse<Order>>(`/orders/${id}/update-status/`, {
    status,
  })
}

/**
 * Cancel order
 * إلغاء طلب
 * 
 * @param id - Order ID
 * @returns Cancelled order
 * 
 * Security: 
 * - Customers: Can cancel their own pending orders
 * - Vendors: Can cancel orders for their products
 * - Admins: Can cancel any order
 * 
 * Business Logic: 
 * - Only pending/confirmed orders can be cancelled
 * - Shipped/delivered orders cannot be cancelled
 * - Stock should be restored when order is cancelled (future implementation)
 * 
 * الأمان:
 * - العملاء: يمكنهم إلغاء طلباتهم المعلقة
 * - البائعون: يمكنهم إلغاء الطلبات لمنتجاتهم
 * - المطورون: يمكنهم إلغاء أي طلب
 * 
 * منطق العمل:
 * - فقط الطلبات المعلقة/المؤكدة يمكن إلغاؤها
 * - الطلبات المشحونة/المسلمة لا يمكن إلغاؤها
 * - يجب استعادة المخزون عند إلغاء الطلب (تنفيذ مستقبلي)
 */
export async function cancelOrder(id: number): Promise<ApiResponse<Order>> {
  return updateOrderStatus(id, 'cancelled')
}

