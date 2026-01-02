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
// Vendor Analytics Types
// أنواع تحليلات البائع
// =============================================================================

/**
 * Analytics overview with key metrics
 * نظرة عامة على التحليلات مع المؤشرات الرئيسية
 */
export interface VendorAnalyticsOverview {
  total_revenue: string
  average_order_value: string
  revenue_change: number
  total_orders: number
  orders_change: number
  conversion_rate: number | null
  total_customers: number
  new_customers: number
  repeat_customer_rate: number | null
  customer_lifetime_value: string | null
  total_products: number
  active_products: number
  top_product_revenue: string | null
}

/**
 * Sales analytics data
 * بيانات تحليلات المبيعات
 */
export interface VendorSalesAnalytics {
  labels: string[]
  revenue: string[]
  orders: number[]
  average_order_value: string[]
  total_revenue: string
  total_orders: number
  average_order_value_overall: string
  revenue_by_status: Record<string, string>
  period: string
}

/**
 * Product analytics item
 * عنصر تحليلات منتج
 */
export interface VendorProductAnalyticsItem {
  product_id: number
  product_name: string
  product_image: string | null
  revenue: string
  units_sold: number
  orders_count: number
  average_price: string
}

/**
 * Product analytics data
 * بيانات تحليلات المنتجات
 */
export interface VendorProductAnalytics {
  top_products: VendorProductAnalyticsItem[]
  worst_products: VendorProductAnalyticsItem[]
  revenue_by_category: Record<string, string>
  low_stock_count: number
  out_of_stock_count: number
}

/**
 * Customer analytics item
 * عنصر تحليلات زبون
 */
export interface VendorCustomerAnalyticsItem {
  customer_key: string
  customer_name: string
  total_spent: string
  orders_count: number
  average_order_value: string
  last_order_at: string | null
}

/**
 * Customer analytics data
 * بيانات تحليلات الزبائن
 */
export interface VendorCustomerAnalytics {
  customer_growth_labels: string[]
  customer_growth_data: number[]
  top_customers: VendorCustomerAnalyticsItem[]
  total_customers: number
  new_customers: number
  returning_customers: number
  repeat_purchase_rate: number | null
  average_customer_value: string | null
}

/**
 * Time analysis data
 * بيانات التحليل الزمني
 */
export interface VendorTimeAnalysis {
  hourly_labels: string[]
  hourly_revenue: string[]
  hourly_orders: number[]
  best_selling_hour: number | null
  day_of_week_labels: string[]
  day_of_week_revenue: string[]
  day_of_week_orders: number[]
  best_selling_day: string | null
  monthly_labels: string[]
  monthly_revenue: string[]
  monthly_orders: number[]
}

/**
 * Comparison analytics data
 * بيانات تحليلات المقارنة
 */
export interface VendorComparisonAnalytics {
  current_period_label: string
  current_revenue: string
  current_orders: number
  current_customers: number
  previous_period_label: string
  previous_revenue: string
  previous_orders: number
  previous_customers: number
  revenue_change: number
  orders_change: number
  customers_change: number
  comparison_labels: string[]
  current_period_data: string[]
  previous_period_data: string[]
}

/**
 * Analytics filters
 * فلاتر التحليلات
 */
export interface VendorAnalyticsFilters {
  date_from?: string
  date_to?: string
  period?: 'week' | 'month' | 'quarter' | 'year'
  limit?: number
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

