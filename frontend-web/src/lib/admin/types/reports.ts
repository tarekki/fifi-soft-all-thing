/**
 * Reports Types
 * أنواع التقارير
 * 
 * هذا الملف يحتوي على جميع الأنواع الخاصة بالتقارير.
 * This file contains all Reports-related types.
 */

// =============================================================================
// Date Range Types
// أنواع نطاق التاريخ
// =============================================================================

export type DateRange = '7days' | '30days' | '90days' | 'year' | 'custom'

export type ReportType = 'sales' | 'products' | 'users' | 'commissions'

export type ExportFormat = 'word' | 'pdf' | 'excel'

// =============================================================================
// Sales Report
// تقرير المبيعات
// =============================================================================

export interface DailySales {
  day: string
  sales: number
}

export interface OrderDetail {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  status: string
  status_display: string
  total: number
  items_count: number
  created_at: string
}

export interface SalesReport {
  total_revenue: number
  total_orders: number
  avg_order_value: number
  new_users: number
  revenue_change: number
  orders_change: number
  avg_order_value_change: number
  new_users_change: number
  daily_sales: DailySales[]
  orders: OrderDetail[]
  date_from: string
  date_to: string
}

// =============================================================================
// Products Report
// تقرير المنتجات
// =============================================================================

export interface TopProduct {
  id: number
  name: string
  vendor_name: string
  category_name: string
  sales: number
  revenue: number
  stock_quantity: number
}

export interface CategorySales {
  category: string
  sales: number
  percentage: number
}

export interface ProductsReport {
  top_products: TopProduct[]
  sales_by_category: CategorySales[]
  date_from: string
  date_to: string
}

// =============================================================================
// Users Report
// تقرير المستخدمين
// =============================================================================

export interface UserDetail {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  orders_count: number
  total_spent: number
  date_joined: string
  last_login: string | null
  is_active: boolean
}

export interface UsersReport {
  new_users: number
  new_users_change: number
  total_users: number
  active_users: number
  users: UserDetail[]
  date_from: string
  date_to: string
}

// =============================================================================
// Commissions Report
// تقرير العمولات
// =============================================================================

export interface CommissionDetail {
  order_id: number
  order_number: string
  customer_name: string
  vendor_name: string
  order_total: number
  commission_amount: number
  commission_percentage: number
  created_at: string
}

export interface CommissionsReport {
  total_commissions: number
  commissions_change: number
  total_orders: number
  avg_commission_per_order: number
  commissions: CommissionDetail[]
  date_from: string
  date_to: string
}

// =============================================================================
// Reports State
// حالة التقارير
// =============================================================================

export interface ReportsState {
  salesReport: SalesReport | null
  productsReport: ProductsReport | null
  usersReport: UsersReport | null
  commissionsReport: CommissionsReport | null
  isLoading: boolean
  error: string | null
  dateRange: DateRange
  reportType: ReportType
}

