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
  date_from: string
  date_to: string
}

// =============================================================================
// Products Report
// تقرير المنتجات
// =============================================================================

export interface TopProduct {
  name: string
  sales: number
  revenue: number
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

export interface UsersReport {
  new_users: number
  new_users_change: number
  total_users: number
  active_users: number
  date_from: string
  date_to: string
}

// =============================================================================
// Commissions Report
// تقرير العمولات
// =============================================================================

export interface CommissionsReport {
  total_commissions: number
  commissions_change: number
  total_orders: number
  avg_commission_per_order: number
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

