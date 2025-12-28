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

// =============================================================================
// Settings Types
// أنواع الإعدادات
// =============================================================================

/**
 * Site settings from API
 * إعدادات الموقع من الـ API
 */
export interface SiteSettings {
  id: number
  // Basic Info
  site_name: string
  site_name_ar: string
  tagline: string
  tagline_ar: string
  
  // Branding
  logo_url: string
  logo_dark_url: string
  favicon_url: string
  
  // Description
  description: string
  description_ar: string
  
  // SEO
  meta_title: string
  meta_title_ar: string
  meta_description: string
  meta_description_ar: string
  meta_keywords: string
  meta_keywords_ar: string
  
  // Contact
  contact_email: string
  contact_phone: string
  contact_whatsapp: string
  
  // Address
  address: string
  address_ar: string
  google_maps_url: string
  
  // Working Hours
  working_hours: string
  working_hours_ar: string
  
  // Currency
  currency_code: string
  currency_symbol: string
  currency_position: 'before' | 'after'
  
  // Maintenance
  is_maintenance_mode: boolean
  maintenance_message: string
  maintenance_message_ar: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Site settings update payload
 */
export type SiteSettingsUpdate = Partial<Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>>

/**
 * Social media platform types
 */
export type SocialPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'twitter' 
  | 'tiktok' 
  | 'youtube' 
  | 'linkedin' 
  | 'telegram' 
  | 'whatsapp' 
  | 'snapchat' 
  | 'pinterest' 
  | 'other'

/**
 * Social link from API
 * رابط سوشيال ميديا
 */
export interface SocialLink {
  id: number
  platform: SocialPlatform
  platform_display: string
  name: string
  url: string
  icon: string
  order: number
  is_active: boolean
  open_in_new_tab: boolean
}

/**
 * Social link create/update payload
 */
export type SocialLinkPayload = Omit<SocialLink, 'id' | 'platform_display'>

/**
 * Language from API
 * اللغة
 */
export interface Language {
  id: number
  code: string
  name: string
  native_name: string
  flag_emoji: string
  flag_url: string
  is_rtl: boolean
  is_default: boolean
  is_active: boolean
  order: number
}

/**
 * Language create/update payload
 */
export type LanguagePayload = Omit<Language, 'id'>

/**
 * Navigation item location types
 */
export type NavigationLocation = 
  | 'header' 
  | 'header_mobile' 
  | 'footer_about' 
  | 'footer_support' 
  | 'footer_legal' 
  | 'sidebar'

/**
 * Navigation item visibility types
 */
export type NavigationVisibility = 
  | 'all' 
  | 'guest' 
  | 'authenticated' 
  | 'customer' 
  | 'vendor' 
  | 'admin'

/**
 * Navigation item from API
 * عنصر تنقل
 */
export interface NavigationItem {
  id: number
  location: NavigationLocation
  location_display: string
  parent: number | null
  label: string
  label_ar: string
  url: string
  icon: string
  order: number
  is_active: boolean
  visibility: NavigationVisibility
  visibility_display: string
  open_in_new_tab: boolean
  highlight: boolean
  highlight_color: string
  children: NavigationItem[]
  children_count: number
}

/**
 * Navigation item create/update payload
 */
export interface NavigationItemPayload {
  location: NavigationLocation
  parent?: number | null
  label: string
  label_ar: string
  url: string
  icon?: string
  order?: number
  is_active?: boolean
  visibility?: NavigationVisibility
  open_in_new_tab?: boolean
  highlight?: boolean
  highlight_color?: string
}

/**
 * Navigation menus grouped by location
 */
export interface NavigationMenus {
  header: NavigationItem[]
  header_mobile: NavigationItem[]
  footer_about: NavigationItem[]
  footer_support: NavigationItem[]
  footer_legal: NavigationItem[]
  sidebar: NavigationItem[]
}

/**
 * Trust signal from API
 * مؤشر ثقة
 */
export interface TrustSignal {
  id: number
  icon: string
  title: string
  title_ar: string
  description: string
  description_ar: string
  order: number
  is_active: boolean
}

/**
 * Trust signal create/update payload
 */
export type TrustSignalPayload = Omit<TrustSignal, 'id'>

/**
 * Payment method fee types
 */
export type PaymentFeeType = 'none' | 'fixed' | 'percentage'

/**
 * Payment method from API
 * طريقة دفع
 */
export interface PaymentMethod {
  id: number
  code: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  instructions: string
  instructions_ar: string
  icon_url: string
  fee_type: PaymentFeeType
  fee_type_display: string
  fee_amount: number
  min_order_amount: number | null
  max_order_amount: number | null
  order: number
  is_active: boolean
  is_default: boolean
}

/**
 * Payment method create/update payload
 */
export type PaymentMethodPayload = Omit<PaymentMethod, 'id' | 'fee_type_display'>

/**
 * Shipping rate types
 */
export type ShippingRateType = 'free' | 'flat' | 'weight' | 'price'

/**
 * Shipping method from API
 * طريقة شحن
 */
export interface ShippingMethod {
  id: number
  code: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  estimated_days_min: number
  estimated_days_max: number
  estimated_delivery: string
  rate_type: ShippingRateType
  rate_type_display: string
  rate_amount: number
  free_shipping_threshold: number | null
  order: number
  is_active: boolean
  is_default: boolean
}

/**
 * Shipping method create/update payload
 */
export type ShippingMethodPayload = Omit<ShippingMethod, 'id' | 'rate_type_display' | 'estimated_delivery'>

/**
 * All settings combined from API
 * جميع الإعدادات مجمعة
 */
export interface AllSettings {
  site: SiteSettings
  social_links: SocialLink[]
  languages: Language[]
  navigation: NavigationMenus
  trust_signals: TrustSignal[]
  payment_methods: PaymentMethod[]
  shipping_methods: ShippingMethod[]
}

