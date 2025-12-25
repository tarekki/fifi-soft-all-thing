/**
 * Admin Promotions Types
 * أنواع العروض والحملات للإدارة
 * 
 * This file contains TypeScript interfaces for Banner, Story, and Coupon data structures.
 * هذا الملف يحتوي على واجهات TypeScript لبنيات بيانات البانرات والقصص والكوبونات.
 * 
 * @author Yalla Buy Team
 */

// =============================================================================
// Banner Types
// أنواع البانرات
// =============================================================================

/**
 * Banner Location
 * موقع البانر
 */
export type BannerLocation = 'hero' | 'sidebar' | 'popup' | 'category'

/**
 * Banner Link Type
 * نوع رابط البانر
 */
export type BannerLinkType = 'url' | 'product' | 'category'

/**
 * Banner Interface
 * واجهة البانر
 */
export interface Banner {
  /** المعرف */
  id: number
  /** العنوان بالإنجليزية */
  title: string
  /** العنوان بالعربية */
  title_ar: string
  /** العنوان الفرعي بالإنجليزية */
  subtitle: string
  /** العنوان الفرعي بالعربية */
  subtitle_ar: string
  /** رابط الصورة */
  image_url: string | null
  /** نوع الرابط */
  link_type: BannerLinkType
  /** عرض نوع الرابط */
  link_type_display: string
  /** الرابط */
  link: string
  /** الموقع */
  location: BannerLocation
  /** عرض الموقع */
  location_display: string
  /** الترتيب */
  order: number
  /** تاريخ البدء */
  start_date: string
  /** تاريخ الانتهاء */
  end_date: string | null
  /** نشط */
  is_active: boolean
  /** نشط حالياً */
  is_currently_active: boolean
  /** عدد المشاهدات */
  views: number
  /** عدد النقرات */
  clicks: number
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}

/**
 * Banner Detail Interface (includes image file)
 * واجهة تفاصيل البانر (تتضمن ملف الصورة)
 */
export interface BannerDetail extends Banner {
  /** ملف الصورة */
  image: File | null
}

/**
 * Banner Create/Update Payload
 * بيانات إنشاء/تحديث البانر
 */
export interface BannerPayload {
  /** العنوان بالإنجليزية */
  title: string
  /** العنوان بالعربية */
  title_ar: string
  /** العنوان الفرعي بالإنجليزية */
  subtitle?: string
  /** العنوان الفرعي بالعربية */
  subtitle_ar?: string
  /** ملف الصورة */
  image?: File
  /** نوع الرابط */
  link_type: BannerLinkType
  /** الرابط */
  link: string
  /** الموقع */
  location: BannerLocation
  /** الترتيب */
  order?: number
  /** تاريخ البدء */
  start_date: string
  /** تاريخ الانتهاء */
  end_date?: string | null
  /** نشط */
  is_active?: boolean
}

/**
 * Banner Filters
 * فلاتر البانرات
 */
export interface BannerFilters {
  /** البحث */
  search?: string
  /** فلتر الموقع */
  location?: BannerLocation
  /** فلتر الحالة */
  is_active?: boolean
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}

/**
 * Paginated Banners
 * بانرات مرقمة
 */
export interface PaginatedBanners {
  /** النتائج */
  results: Banner[]
  /** العدد الإجمالي */
  count: number
  /** الصفحة التالية */
  next: string | null
  /** الصفحة السابقة */
  previous: string | null
}


// =============================================================================
// Story Types
// أنواع القصص
// =============================================================================

/**
 * Story Link Type
 * نوع رابط القصة
 */
export type StoryLinkType = 'url' | 'product' | 'category'

/**
 * Story Interface
 * واجهة القصة
 */
export interface Story {
  /** المعرف */
  id: number
  /** العنوان بالإنجليزية */
  title: string
  /** العنوان بالعربية */
  title_ar: string
  /** رابط الصورة */
  image_url: string | null
  /** نوع الرابط */
  link_type: StoryLinkType
  /** عرض نوع الرابط */
  link_type_display: string
  /** الرابط */
  link: string
  /** تاريخ الانتهاء */
  expires_at: string
  /** نشط */
  is_active: boolean
  /** نشط حالياً */
  is_currently_active: boolean
  /** الترتيب */
  order: number
  /** عدد المشاهدات */
  views: number
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}

/**
 * Story Detail Interface (includes image file)
 * واجهة تفاصيل القصة (تتضمن ملف الصورة)
 */
export interface StoryDetail extends Story {
  /** ملف الصورة */
  image: File | null
}

/**
 * Story Create/Update Payload
 * بيانات إنشاء/تحديث القصة
 */
export interface StoryPayload {
  /** العنوان بالإنجليزية */
  title: string
  /** العنوان بالعربية */
  title_ar: string
  /** ملف الصورة */
  image?: File
  /** نوع الرابط */
  link_type: StoryLinkType
  /** الرابط */
  link?: string
  /** تاريخ الانتهاء */
  expires_at: string
  /** نشط */
  is_active?: boolean
  /** الترتيب */
  order?: number
}

/**
 * Story Filters
 * فلاتر القصص
 */
export interface StoryFilters {
  /** البحث */
  search?: string
  /** فلتر الحالة */
  is_active?: boolean
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}

/**
 * Paginated Stories
 * قصص مرقمة
 */
export interface PaginatedStories {
  /** النتائج */
  results: Story[]
  /** العدد الإجمالي */
  count: number
  /** الصفحة التالية */
  next: string | null
  /** الصفحة السابقة */
  previous: string | null
}


// =============================================================================
// Coupon Types
// أنواع الكوبونات
// =============================================================================

/**
 * Coupon Discount Type
 * نوع خصم الكوبون
 */
export type CouponDiscountType = 'percentage' | 'fixed'

/**
 * Coupon Applicable To
 * قابل للتطبيق على
 */
export type CouponApplicableTo = 'all' | 'category' | 'product' | 'user'

/**
 * Coupon Interface
 * واجهة الكوبون
 */
export interface Coupon {
  /** المعرف */
  id: number
  /** الرمز */
  code: string
  /** الوصف بالإنجليزية */
  description: string
  /** الوصف بالعربية */
  description_ar: string
  /** نوع الخصم */
  discount_type: CouponDiscountType
  /** عرض نوع الخصم */
  discount_type_display: string
  /** قيمة الخصم */
  discount_value: number
  /** أقل قيمة طلب */
  min_order: number
  /** أقصى خصم */
  max_discount: number | null
  /** حد الاستخدام */
  usage_limit: number | null
  /** عدد مرات الاستخدام */
  used_count: number
  /** قابل للتطبيق على */
  applicable_to: CouponApplicableTo
  /** عرض قابل للتطبيق على */
  applicable_to_display: string
  /** عدد الفئات القابلة للتطبيق */
  applicable_categories_count: number
  /** عدد المنتجات القابلة للتطبيق */
  applicable_products_count: number
  /** عدد المستخدمين القابلين للتطبيق */
  applicable_users_count: number
  /** تاريخ البدء */
  start_date: string
  /** تاريخ الانتهاء */
  end_date: string | null
  /** نشط */
  is_active: boolean
  /** صالح حالياً */
  is_currently_valid: boolean
  /** تاريخ الإنشاء */
  created_at: string
  /** تاريخ التحديث */
  updated_at: string
}

/**
 * Coupon Detail Interface (includes Many-to-Many relationships)
 * واجهة تفاصيل الكوبون (تتضمن علاقات Many-to-Many)
 */
export interface CouponDetail extends Coupon {
  /** معرفات الفئات القابلة للتطبيق */
  applicable_categories: number[]
  /** معرفات المنتجات القابلة للتطبيق */
  applicable_products: number[]
  /** معرفات المستخدمين القابلين للتطبيق */
  applicable_users: number[]
}

/**
 * Coupon Create/Update Payload
 * بيانات إنشاء/تحديث الكوبون
 */
export interface CouponPayload {
  /** الرمز */
  code: string
  /** الوصف بالإنجليزية */
  description?: string
  /** الوصف بالعربية */
  description_ar?: string
  /** نوع الخصم */
  discount_type: CouponDiscountType
  /** قيمة الخصم */
  discount_value: number
  /** أقل قيمة طلب */
  min_order?: number
  /** أقصى خصم */
  max_discount?: number | null
  /** حد الاستخدام */
  usage_limit?: number | null
  /** قابل للتطبيق على */
  applicable_to: CouponApplicableTo
  /** معرفات الفئات القابلة للتطبيق */
  applicable_categories?: number[]
  /** معرفات المنتجات القابلة للتطبيق */
  applicable_products?: number[]
  /** معرفات المستخدمين القابلين للتطبيق */
  applicable_users?: number[]
  /** تاريخ البدء */
  start_date: string
  /** تاريخ الانتهاء */
  end_date?: string | null
  /** نشط */
  is_active?: boolean
}

/**
 * Coupon Filters
 * فلاتر الكوبونات
 */
export interface CouponFilters {
  /** البحث */
  search?: string
  /** فلتر نوع الخصم */
  discount_type?: CouponDiscountType
  /** فلتر قابل للتطبيق على */
  applicable_to?: CouponApplicableTo
  /** فلتر الحالة */
  is_active?: boolean
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}

/**
 * Paginated Coupons
 * كوبونات مرقمة
 */
export interface PaginatedCoupons {
  /** النتائج */
  results: Coupon[]
  /** العدد الإجمالي */
  count: number
  /** الصفحة التالية */
  next: string | null
  /** الصفحة السابقة */
  previous: string | null
}


// =============================================================================
// Promotion Stats Types
// أنواع إحصائيات العروض
// =============================================================================

/**
 * Promotion Stats Interface
 * واجهة إحصائيات العروض
 */
export interface PromotionStats {
  /** إحصائيات البانرات */
  banners_total: number
  banners_active: number
  banners_inactive: number
  banners_total_views: number
  banners_total_clicks: number
  
  /** إحصائيات القصص */
  stories_total: number
  stories_active: number
  stories_inactive: number
  stories_expired: number
  stories_total_views: number
  
  /** إحصائيات الكوبونات */
  coupons_total: number
  coupons_active: number
  coupons_inactive: number
  coupons_expired: number
  coupons_total_used: number
  coupons_total_discount: number
}

