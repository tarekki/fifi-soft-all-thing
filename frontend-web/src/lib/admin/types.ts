/**
 * Admin Types
 * أنواع الأدمن
 * 
 * هذا الملف يحتوي على جميع الأنواع المستخدمة في لوحة التحكم.
 * This file contains all types used in the admin dashboard.
 */

// =============================================================================
// Admin User Types
// أنواع المستخدم الأدمن
// =============================================================================

/**
 * Admin role constants
 * ثوابت أدوار الأدمن
 */
export type AdminRole = 'super_admin' | 'admin' | 'moderator'

/**
 * Admin permission string
 * سلسلة صلاحيات الأدمن
 */
export type AdminPermission = 
  | 'dashboard.view'
  | 'settings.view' | 'settings.edit'
  | 'categories.view' | 'categories.create' | 'categories.edit' | 'categories.delete'
  | 'products.view' | 'products.create' | 'products.edit' | 'products.delete'
  | 'orders.view' | 'orders.edit' | 'orders.refund'
  | 'vendors.view' | 'vendors.approve' | 'vendors.reject' | 'vendors.edit'
  | 'users.view' | 'users.edit' | 'users.block' | 'users.roles'
  | 'promotions.view' | 'promotions.create' | 'promotions.edit' | 'promotions.delete'
  | 'reports.view' | 'reports.export'

/**
 * Admin user data from API
 * بيانات المستخدم الأدمن من الـ API
 */
export interface AdminUser {
  id: number
  email: string
  full_name: string
  first_name: string
  last_name: string
  role: AdminRole
  role_display: string
  permissions: AdminPermission[]
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  avatar_url: string | null
  last_login: string | null
  date_joined: string
}

/**
 * Admin login credentials
 * بيانات اعتماد تسجيل دخول الأدمن
 */
export interface AdminLoginCredentials {
  email: string
  password: string
}

/**
 * Admin login response from API
 * استجابة تسجيل دخول الأدمن من الـ API
 */
export interface AdminLoginResponse {
  access: string
  refresh: string
  user: AdminUser
}

/**
 * Admin auth state in context
 * حالة مصادقة الأدمن في السياق
 */
export interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// =============================================================================
// Dashboard Types
// أنواع لوحة التحكم
// =============================================================================

/**
 * Dashboard overview statistics (KPIs)
 * إحصائيات نظرة عامة على لوحة التحكم
 */
export interface DashboardOverview {
  // Revenue
  total_revenue: number
  total_revenue_change: number
  today_revenue: number
  
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
  
  // Users
  total_users: number
  new_users_today: number
  new_users_week: number
  
  // Vendors
  total_vendors: number
  active_vendors: number
  pending_vendors: number
}

/**
 * Sales chart data
 * بيانات رسم بياني المبيعات
 */
export interface SalesChartData {
  labels: string[]
  revenue: number[]
  orders: number[]
  period: 'week' | 'month' | 'year'
}

/**
 * Recent order in dashboard
 * طلب حديث في لوحة التحكم
 */
export interface RecentOrder {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  status_display: string
  items_count: number
  created_at: string
}

/**
 * Recent activity log entry
 * سجل نشاط حديث
 */
export interface RecentActivity {
  id: number
  user_name: string
  user_email: string
  action: string
  action_display: string
  target_type: string
  target_id: number | null
  target_name: string | null
  timestamp: string
  ip_address: string | null
}

// =============================================================================
// API Response Types
// أنواع استجابة الـ API
// =============================================================================

/**
 * Standard API response wrapper
 * غلاف استجابة API موحد
 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  errors: Record<string, string[]> | null
}

