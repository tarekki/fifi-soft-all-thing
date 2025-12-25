/**
 * Admin Order Types
 * أنواع الطلبات للإدارة
 * 
 * This file contains TypeScript interfaces for order management.
 * هذا الملف يحتوي على واجهات TypeScript لإدارة الطلبات.
 * 
 * @author Yalla Buy Team
 */


// =============================================================================
// Order Status Types
// أنواع حالات الطلب
// =============================================================================

/**
 * Order status values
 * قيم حالة الطلب
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

/**
 * Order type values
 * قيم نوع الطلب
 */
export type OrderType = 'online' | 'pos'


// =============================================================================
// Order Item Interface
// واجهة عنصر الطلب
// =============================================================================

/**
 * Order item details from API
 * تفاصيل عنصر الطلب من API
 */
export interface OrderItem {
  /** معرف عنصر الطلب */
  id: number
  /** معرف متغير المنتج */
  product_variant: number
  /** اسم المنتج */
  product_name: string
  /** رابط صورة المنتج */
  product_image: string | null
  /** معلومات المتغير (اللون، المقاس) */
  variant_info: string
  /** اسم البائع */
  vendor_name: string | null
  /** الكمية */
  quantity: number
  /** السعر */
  price: number
  /** المجموع الفرعي */
  subtotal: number
  /** تاريخ الإنشاء */
  created_at: string
}


// =============================================================================
// Order Interface (List View)
// واجهة الطلب (عرض القائمة)
// =============================================================================

/**
 * Order data for list view (optimized)
 * بيانات الطلب لعرض القائمة (مُحسّن)
 */
export interface Order {
  /** معرف الطلب */
  id: number
  /** رقم الطلب */
  order_number: string
  /** معرف المستخدم */
  user: number | null
  /** البريد الإلكتروني للمستخدم */
  user_email: string | null
  /** هل هو طلب بدون تسجيل */
  is_guest_order: boolean
  /** اسم العميل */
  customer_name: string
  /** هاتف العميل */
  customer_phone: string
  /** نوع الطلب */
  order_type: OrderType
  /** نوع الطلب للعرض */
  order_type_display: string
  /** حالة الطلب */
  status: OrderStatus
  /** حالة الطلب للعرض */
  status_display: string
  /** المجموع الفرعي */
  subtotal: number
  /** رسوم التوصيل */
  delivery_fee: number
  /** الإجمالي */
  total: number
  /** عدد العناصر */
  items_count: number
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// Order Detail Interface
// واجهة تفاصيل الطلب
// =============================================================================

/**
 * Available status transition option
 * خيار انتقال الحالة المتاح
 */
export interface StatusOption {
  value: OrderStatus
  label: string
}

/**
 * Full order details including items
 * تفاصيل الطلب الكاملة بما في ذلك العناصر
 */
export interface OrderDetail extends Order {
  /** عنوان العميل */
  customer_address: string
  /** عمولة المنصة */
  platform_commission: number
  /** ملاحظات الطلب */
  notes: string
  /** عناصر الطلب */
  items: OrderItem[]
  /** الحالات المتاحة للانتقال */
  available_statuses: StatusOption[]
}


// =============================================================================
// Order Filters Interface
// واجهة فلاتر الطلبات
// =============================================================================

/**
 * Filters for orders list
 * فلاتر لقائمة الطلبات
 */
export interface OrderFilters {
  /** البحث (رقم الطلب، اسم العميل، الهاتف) */
  search?: string
  /** فلتر الحالة (يمكن أن تكون متعددة مفصولة بفاصلة) */
  status?: string
  /** فلتر نوع الطلب */
  order_type?: OrderType
  /** التاريخ من */
  date_from?: string
  /** التاريخ إلى */
  date_to?: string
  /** هل هو طلب بدون تسجيل */
  is_guest?: boolean
  /** حقل الترتيب */
  sort_by?: 'created_at' | 'total' | 'status' | 'order_number'
  /** اتجاه الترتيب */
  sort_dir?: 'asc' | 'desc'
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}


// =============================================================================
// Order Status Update Payload
// بيانات تحديث حالة الطلب
// =============================================================================

/**
 * Payload for updating order status
 * بيانات تحديث حالة الطلب
 */
export interface OrderStatusUpdatePayload {
  /** الحالة الجديدة */
  status: OrderStatus
  /** ملاحظة اختيارية */
  note?: string
}


// =============================================================================
// Order Bulk Action Payload
// بيانات العمليات المجمعة
// =============================================================================

/**
 * Bulk action types
 * أنواع العمليات المجمعة
 */
export type OrderBulkAction = 'confirm' | 'ship' | 'deliver' | 'cancel'

/**
 * Payload for bulk order actions
 * بيانات العمليات المجمعة على الطلبات
 */
export interface OrderBulkActionPayload {
  /** قائمة معرفات الطلبات */
  order_ids: number[]
  /** نوع العملية */
  action: OrderBulkAction
}


// =============================================================================
// Order Statistics Interface
// واجهة إحصائيات الطلبات
// =============================================================================

/**
 * Order statistics for dashboard
 * إحصائيات الطلبات للوحة التحكم
 */
export interface OrderStats {
  /** عدد الطلبات حسب الحالة */
  by_status: {
    pending: number
    confirmed: number
    shipped: number
    delivered: number
    cancelled: number
  }
  /** إحصائيات اليوم */
  today: {
    count: number
    revenue: number
  }
  /** الإجمالي */
  total: {
    count: number
    revenue: number
  }
  /** الطلبات التي تحتاج انتباه */
  needs_attention: number
}


// =============================================================================
// API Response Types
// أنواع استجابات API
// =============================================================================

/**
 * Paginated orders response
 * استجابة الطلبات المُرقّمة
 */
export interface OrderListResponse {
  results: Order[]
  count: number
  next: string | null
  previous: string | null
}

