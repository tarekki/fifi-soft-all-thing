/**
 * Vendor Types
 * أنواع البائع
 * 
 * هذا الملف يحتوي على جميع الأنواع المستخدمة في لوحة تحكم البائع.
 * This file contains all types used in the vendor dashboard.
 */

// =============================================================================
// API Response Type
// نوع استجابة API
// =============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  errors: Record<string, string[]> | null
}

// =============================================================================
// Vendor Dashboard Types
// أنواع لوحة تحكم البائع
// =============================================================================

/**
 * Vendor dashboard overview statistics (KPIs)
 * إحصائيات نظرة عامة على لوحة تحكم البائع
 */
export interface VendorDashboardOverview {
  // Sales (Revenue)
  total_sales: number
  total_sales_change: number
  today_sales: number

  // Orders
  total_orders: number
  total_orders_change: number
  today_orders: number
  pending_orders: number
  processing_orders: number

  // Products
  total_products: number
  active_products: number
  low_stock_products: number
  out_of_stock_products: number

  // Shop Visits
  total_visits: number
  total_visits_change: number
  today_visits: number
  response_rate: number | null
}

/**
 * Sales chart data
 * بيانات رسم بياني المبيعات
 */
export interface VendorSalesChartData {
  labels: string[]
  revenue: number[]
  period: 'week' | 'month' | 'year'
}

/**
 * Recent order in vendor dashboard
 * طلب حديث في لوحة تحكم البائع
 */
export interface VendorRecentOrder {
  id: string
  customer: string
  customer_key?: string
  date: string
  total: string
  status: string
  statusAr?: string
}

// =============================================================================
// Vendor Authentication Types
// أنواع مصادقة البائع
// =============================================================================

/**
 * Vendor login credentials
 * بيانات اعتماد تسجيل دخول البائع
 */
export interface VendorLoginCredentials {
  email: string
  password: string
}

/**
 * Vendor login response
 * استجابة تسجيل دخول البائع
 */
export interface VendorLoginResponse {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    full_name: string
    phone: string
    role: string
    is_active: boolean
  }
  vendor: {
    id: number
    name: string
    slug: string
    description: string
    logo: string | null
    commission_rate: string
    is_active: boolean
  }
  vendor_user: {
    id: number
    is_owner: boolean
    permissions: Record<string, any>
  }
}

/**
 * Vendor application data
 * بيانات طلب انضمام البائع
 */
export interface VendorApplicationData {
  applicant_name: string
  applicant_email: string
  applicant_phone: string
  store_name: string
  store_description?: string
  store_logo?: File
  business_type: 'individual' | 'company' | 'brand' | 'other'
  business_address?: string
  business_license?: File
}

/**
 * Vendor application response
 * استجابة طلب انضمام البائع
 */
export interface VendorApplicationResponse {
  id: number
  store_name: string
  applicant_name: string
  applicant_email: string
  status: string
  created_at: string
  message: string
}

/**
 * Vendor password change data
 * بيانات تغيير كلمة مرور البائع
 */
export interface VendorPasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}

// =============================================================================
// Vendor Customer Types
// أنواع زبائن البائع
// =============================================================================

/**
 * Vendor customer data
 * بيانات زبون البائع
 */
export interface VendorCustomer {
  customer_key: string
  name: string
  email: string | null
  phone: string | null
  orders_count: number
  total_spent: string
  last_order_at: string | null
  first_order_at: string | null
}

/**
 * Vendor customer filters
 * فلاتر زبائن البائع
 */
export interface VendorCustomerFilters {
  search?: string
  date_from?: string
  date_to?: string
  last_order_from?: string
  last_order_to?: string
  sort_by?: 'orders_count' | 'total_spent' | 'last_order_at' | 'name'
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

/**
 * Paginated response for customers
 * استجابة مقسمة للزبائن
 */
export interface PaginatedCustomerResponse {
  results: VendorCustomer[]
  pagination: {
    count: number
    next: string | null
    previous: string | null
    page: number
    page_size: number
    total_pages: number
  }
}

