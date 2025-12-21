/**
 * Order Server Actions
 * إجراءات الخادم للطلبات
 * 
 * Server Actions for order management
 * These actions run on the server and use Order Service with Repository
 * 
 * إجراءات الخادم لإدارة الطلبات
 * هذه الإجراءات تعمل على الخادم وتستخدم خدمة الطلبات مع المستودع
 * 
 * Architecture:
 * Server Action → Service → Repository → API Client → Backend
 * 
 * البنية المعمارية:
 * Server Action → Service → Repository → API Client → Backend
 * 
 * Security:
 * - All requests are authenticated using JWT tokens from HttpOnly cookies
 * - Orders are filtered by user role (customer/vendor/admin)
 * - Business logic validation is handled by OrderService and OrderPolicy
 * 
 * الأمان:
 * - جميع الطلبات مصادق عليها باستخدام رموز JWT من HttpOnly cookies
 * - الطلبات مفلترة حسب دور المستخدم (عميل/بائع/مطور)
 * - التحقق من منطق العمل يتم التعامل معه بواسطة OrderService و OrderPolicy
 */

'use server'

import { OrderService } from '@/core/services/order.service'
import { OrderRepository } from '@/core/repositories/order.repository'
import { getCurrentUser } from '@/lib/auth/session'
import type { Order, CreateOrderDTO, OrderStatus } from '@/types/order'
import type { ApiPaginatedResponse } from '@/types/api'

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
    // Get current user from session
    // الحصول على المستخدم الحالي من الجلسة
    const user = await getCurrentUser()

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new OrderRepository()
    const service = new OrderService(repository)

    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getOrders(user, {
      vendor_id: params?.vendor_id,
      status: params?.status,
      page: params?.page,
    })
  } catch (error) {
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

    // Get current user from session
    // الحصول على المستخدم الحالي من الجلسة
    const user = await getCurrentUser()

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new OrderRepository()
    const service = new OrderService(repository)

    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getOrderById(id, user)
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
    // Get current user from session (may be null for guest orders)
    // الحصول على المستخدم الحالي من الجلسة (قد يكون null للطلبات الضيفية)
    const user = await getCurrentUser()

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new OrderRepository()
    const service = new OrderService(repository)

    // Call Service method (validates permissions and business rules)
    // استدعاء طريقة الخدمة (تتحقق من الصلاحيات وقواعد العمل)
    return await service.createOrder(data, user)
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

    // Get current user from session
    // الحصول على المستخدم الحالي من الجلسة
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Authentication required to update order status')
    }

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new OrderRepository()
    const service = new OrderService(repository)

    // Call Service method (validates permissions and status transition)
    // استدعاء طريقة الخدمة (تتحقق من الصلاحيات وانتقال الحالة)
    return await service.updateOrderStatus(id, status, user)
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

    // Get current user from session
    // الحصول على المستخدم الحالي من الجلسة
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('Authentication required to cancel order')
    }

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new OrderRepository()
    const service = new OrderService(repository)

    // Call Service method (validates permissions)
    // استدعاء طريقة الخدمة (تتحقق من الصلاحيات)
    return await service.cancelOrder(id, user)
  } catch (error) {
    console.error('Error in cancelOrderAction:', error)
    throw error
  }
}

