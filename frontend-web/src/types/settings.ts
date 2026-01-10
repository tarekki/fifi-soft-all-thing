/**
 * Site Settings Types
 * أنواع إعدادات الموقع
 * 
 * These types match the Django models in settings_app
 * هذه الأنواع تطابق نماذج Django في settings_app
 */

// =============================================================================
// Site Settings Type
// نوع إعدادات الموقع
// =============================================================================

/**
 * Main site settings (public subset)
 * إعدادات الموقع الرئيسية (الجزء العام)
 */
export type SiteSettings = {
  // Basic Info - المعلومات الأساسية
  site_name: string
  site_name_ar: string
  tagline: string
  tagline_ar: string
  
  // Branding - الهوية البصرية
  logo_url: string
  logo_dark_url: string
  favicon_url: string
  
  // SEO - تحسين محركات البحث
  meta_title: string
  meta_title_ar: string
  meta_description: string
  meta_description_ar: string
  
  // Currency - العملة
  currency_code: string
  currency_symbol: string
  currency_position: 'before' | 'after'
  
  // Maintenance - الصيانة
  is_maintenance_mode: boolean
  maintenance_message: string
  maintenance_message_ar: string
}

// =============================================================================
// Social Link Type
// نوع روابط السوشيال
// =============================================================================

/**
 * Social media platform types
 * أنواع منصات السوشيال ميديا
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
 * Social link data
 * بيانات رابط السوشيال
 */
export type SocialLink = {
  id: number
  platform: SocialPlatform
  platform_display: string
  name: string
  url: string
  icon: string
  order: number
  is_active?: boolean
  open_in_new_tab: boolean
}

// =============================================================================
// Language Type
// نوع اللغة
// =============================================================================

/**
 * Language data
 * بيانات اللغة
 */
export type Language = {
  code: string
  name: string
  native_name: string
  flag_emoji: string
  flag_url: string
  is_rtl: boolean
  is_default: boolean
  order: number
}

// =============================================================================
// Navigation Types
// أنواع التنقل
// =============================================================================

/**
 * Navigation item visibility
 * رؤية عنصر التنقل
 */
export type NavigationVisibility = 
  | 'all' 
  | 'guest' 
  | 'authenticated' 
  | 'customer' 
  | 'vendor' 
  | 'admin'

/**
 * Navigation item location
 * موقع عنصر التنقل
 */
export type NavigationLocation = 
  | 'header' 
  | 'header_mobile' 
  | 'footer_about' 
  | 'footer_support' 
  | 'footer_legal' 
  | 'sidebar'

/**
 * Navigation item data
 * بيانات عنصر التنقل
 */
export type NavigationItem = {
  id: number
  label: string
  label_ar: string
  url: string
  icon: string
  order: number
  visibility: NavigationVisibility
  open_in_new_tab: boolean
  highlight: boolean
  highlight_color: string
  children: NavigationItem[]
}

/**
 * Navigation menu grouped by location
 * قائمة التنقل مجمعة حسب الموقع
 */
export type NavigationMenu = {
  header: NavigationItem[]
  header_mobile: NavigationItem[]
  footer_about: NavigationItem[]
  footer_support: NavigationItem[]
  footer_legal: NavigationItem[]
}

// =============================================================================
// Trust Signal Type
// نوع مؤشر الثقة
// =============================================================================

/**
 * Trust signal data
 * بيانات مؤشر الثقة
 */
export type TrustSignal = {
  id: number
  icon: string
  title: string
  title_ar: string
  description: string
  description_ar: string
  order: number
}

// =============================================================================
// Payment Method Type
// نوع طريقة الدفع
// =============================================================================

/**
 * Payment method fee type
 * نوع رسوم طريقة الدفع
 */
export type PaymentFeeType = 'none' | 'fixed' | 'percentage'

/**
 * Payment method data
 * بيانات طريقة الدفع
 */
export type PaymentMethod = {
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
  fee_amount: string  // Decimal as string from API
  min_order_amount: string | null
  max_order_amount: string | null
  order: number
  is_default: boolean
}

// =============================================================================
// Shipping Method Type
// نوع طريقة الشحن
// =============================================================================

/**
 * Shipping rate type
 * نوع تسعير الشحن
 */
export type ShippingRateType = 'free' | 'flat' | 'weight' | 'price'

/**
 * Shipping method data
 * بيانات طريقة الشحن
 */
export type ShippingMethod = {
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
  rate_amount: string  // Decimal as string from API
  free_shipping_threshold: string | null
  order: number
  is_default: boolean
}

// =============================================================================
// All Settings Combined Type
// نوع جميع الإعدادات مجمعة
// =============================================================================

/**
 * All settings combined for initial load
 * جميع الإعدادات مجمعة للتحميل الأولي
 */
export type AllSettings = {
  site: SiteSettings
  social_links: SocialLink[]
  languages: Language[]
  navigation: NavigationMenu
  trust_signals: TrustSignal[]
  payment_methods: PaymentMethod[]
  shipping_methods: ShippingMethod[]
}

