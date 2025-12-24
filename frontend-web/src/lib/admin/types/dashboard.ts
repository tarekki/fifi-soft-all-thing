/**
 * Dashboard Types
 * أنواع لوحة التحكم
 * 
 * هذا الملف يحتوي على جميع الأنواع الخاصة بلوحة التحكم.
 * This file contains all Dashboard-related types.
 */

// =============================================================================
// Dashboard Overview (KPIs)
// نظرة عامة على لوحة التحكم (مؤشرات الأداء)
// =============================================================================

export interface DashboardOverview {
  // Revenue Statistics
  // إحصائيات الإيرادات
  total_revenue: number
  total_revenue_change: number
  today_revenue: number
  
  // Order Statistics
  // إحصائيات الطلبات
  total_orders: number
  total_orders_change: number
  today_orders: number
  pending_orders: number
  processing_orders: number
  
  // Product Statistics
  // إحصائيات المنتجات
  total_products: number
  active_products: number
  low_stock_products: number
  out_of_stock_products: number
  
  // User Statistics
  // إحصائيات المستخدمين
  total_users: number
  new_users_today: number
  new_users_week: number
  
  // Vendor Statistics
  // إحصائيات البائعين
  total_vendors: number
  active_vendors: number
  pending_vendors: number
}

// =============================================================================
// Sales Chart Data
// بيانات رسم المبيعات
// =============================================================================

export interface SalesChartData {
  labels: string[]
  revenue: number[]
  orders: number[]
  period: 'week' | 'month' | 'year'
}

export type ChartPeriod = 'week' | 'month' | 'year'

// =============================================================================
// Recent Order
// الطلب الأخير
// =============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'completed'

export interface RecentOrder {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: OrderStatus
  status_display: string
  items_count: number
  created_at: string
}

// =============================================================================
// Recent Activity
// النشاط الأخير
// =============================================================================

export type ActivityType = 
  | 'order_created' 
  | 'order_updated' 
  | 'product_created' 
  | 'product_updated'
  | 'user_registered'
  | 'vendor_created'

export interface RecentActivity {
  id: number
  user_name: string
  user_email: string
  action: ActivityType
  action_display: string
  target_type: 'order' | 'product' | 'user' | 'vendor'
  target_id: number
  target_name: string
  timestamp: string
  ip_address: string | null
}

// =============================================================================
// Dashboard State
// حالة لوحة التحكم
// =============================================================================

export interface DashboardState {
  overview: DashboardOverview | null
  salesChart: SalesChartData | null
  recentOrders: RecentOrder[]
  recentActivity: RecentActivity[]
  isLoading: boolean
  error: string | null
}

