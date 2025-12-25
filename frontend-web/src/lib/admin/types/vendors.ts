/**
 * Admin Vendor Types
 * أنواع البائعين للإدارة
 * 
 * This file contains TypeScript interfaces for vendor management.
 * هذا الملف يحتوي على واجهات TypeScript لإدارة البائعين.
 * 
 * @author Yalla Buy Team
 */


// =============================================================================
// Vendor Interface (List View)
// واجهة البائع (عرض القائمة)
// =============================================================================

/**
 * Vendor data for list view
 * بيانات البائع لعرض القائمة
 */
export interface Vendor {
  /** معرف البائع */
  id: number
  /** اسم البائع */
  name: string
  /** المعرف (slug) */
  slug: string
  /** رابط الشعار */
  logo_url: string | null
  /** اللون الأساسي */
  primary_color: string
  /** الوصف */
  description: string
  /** نسبة العمولة */
  commission_rate: number
  /** هل البائع نشط */
  is_active: boolean
  /** عدد المنتجات */
  products_count: number
  /** إجمالي المخزون */
  total_stock: number
  /** عدد الطلبات */
  orders_count: number
  /** إجمالي الإيرادات */
  total_revenue: number
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// Vendor Detail Interface
// واجهة تفاصيل البائع
// =============================================================================

/**
 * Full vendor details including all statistics
 * تفاصيل البائع الكاملة بما في ذلك جميع الإحصائيات
 */
export interface VendorDetail extends Vendor {
  /** ملف الشعار */
  logo: string | null
  /** عدد المنتجات النشطة */
  active_products_count: number
  /** عدد المنتجات ذات المخزون المنخفض */
  low_stock_count: number
  /** عدد الطلبات المعلقة */
  pending_orders_count: number
  /** إيرادات هذا الشهر */
  this_month_revenue: number
}


// =============================================================================
// Vendor Create/Update Payload
// بيانات إنشاء/تعديل البائع
// =============================================================================

/**
 * Payload for creating a new vendor
 * بيانات إنشاء بائع جديد
 */
export interface VendorCreatePayload {
  /** اسم البائع (مطلوب) */
  name: string
  /** ملف الشعار (اختياري) */
  logo?: File | null
  /** اللون الأساسي (اختياري) */
  primary_color?: string
  /** الوصف (اختياري) */
  description?: string
  /** نسبة العمولة (اختياري، افتراضي 10%) */
  commission_rate?: number
  /** هل البائع نشط (اختياري، افتراضي true) */
  is_active?: boolean
}

/**
 * Payload for updating an existing vendor
 * بيانات تعديل بائع موجود
 */
export interface VendorUpdatePayload {
  /** اسم البائع */
  name?: string
  /** ملف الشعار */
  logo?: File | null
  /** اللون الأساسي */
  primary_color?: string
  /** الوصف */
  description?: string
  /** نسبة العمولة */
  commission_rate?: number
  /** هل البائع نشط */
  is_active?: boolean
}


// =============================================================================
// Vendor Status Update Payload
// بيانات تحديث حالة البائع
// =============================================================================

/**
 * Payload for updating vendor status
 * بيانات تحديث حالة البائع
 */
export interface VendorStatusUpdatePayload {
  /** الحالة الجديدة */
  is_active: boolean
}


// =============================================================================
// Vendor Commission Update Payload
// بيانات تحديث عمولة البائع
// =============================================================================

/**
 * Payload for updating vendor commission
 * بيانات تحديث عمولة البائع
 */
export interface VendorCommissionUpdatePayload {
  /** نسبة العمولة الجديدة (0-100) */
  commission_rate: number
}


// =============================================================================
// Vendor Filters Interface
// واجهة فلاتر البائعين
// =============================================================================

/**
 * Filters for vendors list
 * فلاتر لقائمة البائعين
 */
export interface VendorFilters {
  /** البحث (اسم، slug، وصف) */
  search?: string
  /** فلتر الحالة */
  is_active?: boolean
  /** حقل الترتيب */
  sort_by?: 'name' | 'created_at' | 'commission_rate' | 'products_count'
  /** اتجاه الترتيب */
  sort_dir?: 'asc' | 'desc'
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}


// =============================================================================
// Vendor Bulk Action Payload
// بيانات العمليات المجمعة
// =============================================================================

/**
 * Bulk action types
 * أنواع العمليات المجمعة
 */
export type VendorBulkAction = 'activate' | 'deactivate'

/**
 * Payload for bulk vendor actions
 * بيانات العمليات المجمعة على البائعين
 */
export interface VendorBulkActionPayload {
  /** قائمة معرفات البائعين */
  vendor_ids: number[]
  /** نوع العملية */
  action: VendorBulkAction
}


// =============================================================================
// Vendor Statistics Interface
// واجهة إحصائيات البائعين
// =============================================================================

/**
 * Vendor statistics for dashboard
 * إحصائيات البائعين للوحة التحكم
 */
export interface VendorStats {
  /** إجمالي البائعين */
  total_vendors: number
  /** البائعون النشطون */
  active_vendors: number
  /** البائعون غير النشطين */
  inactive_vendors: number
  /** البائعون مع منتجات */
  vendors_with_products: number
  /** البائعون بدون منتجات */
  vendors_without_products: number
  /** متوسط نسبة العمولة */
  average_commission_rate: number
}


// =============================================================================
// API Response Types
// أنواع استجابات API
// =============================================================================

/**
 * Paginated vendors response
 * استجابة البائعين المُرقّمة
 */
export interface VendorListResponse {
  results: Vendor[]
  count: number
  next: string | null
  previous: string | null
}

