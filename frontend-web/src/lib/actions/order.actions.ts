/**
 * Order Server Actions
 * إجراءات الخادم للطلبات
 * 
 * Server Actions for order management
 * These actions run on the server and use the Orders API Client
 * 
 * إجراءات الخادم لإدارة الطلبات
 * هذه الإجراءات تعمل على الخادم وتستخدم عميل API الطلبات
 * 
 * Security:
 * - All requests are authenticated using JWT tokens from HttpOnly cookies
 * - Orders are filtered by user role (customer/vendor/admin)
 * - Business logic validation is handled by the backend
 * 
 * الأمان:
 * - جميع الطلبات مصادق عليها باستخدام رموز JWT من HttpOnly cookies
 * - الطلبات مفلترة حسب دور المستخدم (عميل/بائع/مطور)
 * - التحقق من منطق العمل يتم التعامل معه بواسطة الخادم
 */

'use server'

import * as ordersApi from '@/lib/api/authenticated/orders'
import type { Order, CreateOrderDTO, OrderStatus } from '@/types/order'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api'

/**
 * Get orders for the current user
 * الحصول على طلبات المستخدم الحالي
 * 
 * @param params - Filtering and pagination parameters
 * @returns Paginated list of orders
 * 
 * Security: Only returns orders that the user has permission to view
 * - Customers: Only their own orders
 * - Vendors: Only orders for their products
 * - Admins: All orders
 * 
 * الأمان: يعيد فقط الطلبات التي يملك المستخدم صلاحية عرضها
 * - العملاء: طلباتهم فقط
 * - البائعون: الطلبات لمنتجاتهم فقط
 * - المطورون: جميع الطلبات
 */
export async function getOrdersAction(params?: {
  vendor_id?: number
  status?: OrderStatus
  order_type?: 'online' | 'pos'
  page?: number
  search?: string
}): Promise<ApiPaginatedResponse<Order>> {
  try {
    // Call Orders API Client
    // استدعاء عميل API الطلبات
    // The API client handles authentication automatically using JWT from cookies
    // عميل API يتعامل مع المصادقة تلقائياً باستخدام JWT من الكوكيز
    const response = await ordersApi.getOrders(params)
    return response
  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    // تسجيل الخطأ للتشخيص (في الإنتاج، استخدم تسجيل مناسب)
    console.error('Error in getOrdersAction:', error)
    throw error
  }
}

/**
 * Get order by ID
 * الحصول على طلب بالمعرف
 * 
 * @param id - Order ID
 * @returns Order details
 * 
 * Security: Checks if user has permission to view this order
 * - Customers: Only their own orders
 * - Vendors: Only orders for their products
 * - Admins: Any order
 * 
 * الأمان: يتحقق من إذا كان المستخدم يملك صلاحية عرض هذا الطلب
 * - العملاء: طلباتهم فقط
 * - البائعون: الطلبات لمنتجاتهم فقط
 * - المطورون: أي طلب
 */
export async function getOrderByIdAction(id: number): Promise<Order> {
  try {
    if (!id || id <= 0) {
      throw new Error('Invalid order ID')
    }

    // Call Orders API Client
    // استدعاء عميل API الطلبات
    const response: ApiResponse<Order> = await ordersApi.getOrderById(id)
    
    // Extract order from API response
    // استخراج الطلب من استجابة API
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get order')
    }
    
    return response.data
  } catch (error) {
    console.error('Error in getOrderByIdAction:', error)
    throw error
  }
}

/**
 * Create a new order
 * إنشاء طلب جديد
 * 
 * @param data - Order data (items, customer info, etc.)
 * @returns Created order
 * 
 * Security: 
 * - Validates user permissions and order data
 * - Authenticated users: order is linked to user account
 * - Guest users: order is created as guest order
 * 
 * Business Logic: 
 * - Calculates totals (subtotal, delivery fee, commission, total)
 * - Validates items (stock, price, availability)
 * - Applies business rules (minimum order, etc.)
 * 
 * الأمان:
 * - يتحقق من صلاحيات المستخدم وبيانات الطلب
 * - المستخدمون المصادق عليهم: الطلب مربوط بحساب المستخدم
 * - المستخدمون الضيوف: الطلب يُنشأ كطلب ضيف
 * 
 * منطق العمل:
 * - يحسب الإجماليات (المجموع الفرعي، رسوم التوصيل، العمولة، الإجمالي)
 * - يتحقق من العناصر (المخزون، السعر، التوفر)
 * - يطبق قواعد العمل (الحد الأدنى للطلب، إلخ)
 */
export async function createOrderAction(data: CreateOrderDTO): Promise<Order> {
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

    // Call Orders API Client
    // استدعاء عميل API الطلبات
    const response: ApiResponse<Order> = await ordersApi.createOrder(data)
    
    // Extract order from API response
    // استخراج الطلب من استجابة API
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create order')
    }
    
    return response.data
  } catch (error) {
    console.error('Error in createOrderAction:', error)
    throw error
  }
}

/**
 * Update order status
 * تحديث حالة الطلب
 * 
 * @param id - Order ID
 * @param status - New status
 * @returns Updated order
 * 
 * Security: Only vendors (for their products) and admins can update status
 * Business Logic: Validates status transition (e.g., cannot cancel delivered order)
 * 
 * الأمان: فقط البائعون (لمنتجاتهم) والمسؤولون يمكنهم تحديث الحالة
 * منطق العمل: يتحقق من انتقال الحالة (مثلاً، لا يمكن إلغاء طلب تم تسليمه)
 */
export async function updateOrderStatusAction(
  id: number,
  status: OrderStatus
): Promise<Order> {
  try {
    if (!id || id <= 0) {
      throw new Error('Invalid order ID')
    }

    if (!status || status.trim().length === 0) {
      throw new Error('Status is required')
    }

    // Validate status value
    // التحقق من قيمة الحالة
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Call Orders API Client
    // استدعاء عميل API الطلبات
    const response: ApiResponse<Order> = await ordersApi.updateOrderStatus(id, status)
    
    // Extract order from API response
    // استخراج الطلب من استجابة API
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update order status')
    }
    
    return response.data
  } catch (error) {
    console.error('Error in updateOrderStatusAction:', error)
    throw error
  }
}

/**
 * Cancel an order
 * إلغاء طلب
 * 
 * @param id - Order ID
 * @returns Cancelled order
 * 
 * Security: Only order owner (customer), vendor (for their products), or admin can cancel
 * Business Logic: 
 * - Only pending/confirmed orders can be cancelled
 * - Shipped/delivered orders cannot be cancelled
 * - Stock should be restored when order is cancelled (future implementation)
 * 
 * الأمان: فقط مالك الطلب (الزبون)، البائع (لمنتجاته)، أو المسؤول يمكنهم الإلغاء
 * منطق العمل:
 * - فقط الطلبات المعلقة/المؤكدة يمكن إلغاؤها
 * - الطلبات المشحونة/المسلمة لا يمكن إلغاؤها
 * - يجب استعادة المخزون عند إلغاء الطلب (تنفيذ مستقبلي)
 */
export async function cancelOrderAction(id: number): Promise<Order> {
  try {
    if (!id || id <= 0) {
      throw new Error('Invalid order ID')
    }

    // Call Orders API Client to cancel order (sets status to 'cancelled')
    // استدعاء عميل API الطلبات لإلغاء الطلب (يضع الحالة على 'cancelled')
    const response: ApiResponse<Order> = await ordersApi.cancelOrder(id)
    
    // Extract order from API response
    // استخراج الطلب من استجابة API
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to cancel order')
    }
    
    return response.data
  } catch (error) {
    console.error('Error in cancelOrderAction:', error)
    throw error
  }
}

