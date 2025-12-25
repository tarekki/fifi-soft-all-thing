/**
 * Admin User Types
 * أنواع المستخدمين للإدارة
 * 
 * @author Yalla Buy Team
 */


// =============================================================================
// Role Types
// أنواع الأدوار
// =============================================================================

export type UserRole = 'customer' | 'vendor' | 'admin'


// =============================================================================
// User Interface (List View)
// واجهة المستخدم (عرض القائمة)
// =============================================================================

export interface User {
  /** معرف المستخدم */
  id: number
  /** البريد الإلكتروني */
  email: string
  /** الاسم الكامل */
  full_name: string
  /** رقم الهاتف */
  phone: string
  /** الدور */
  role: UserRole
  /** عرض الدور */
  role_display: string
  /** نشط */
  is_active: boolean
  /** موظف */
  is_staff: boolean
  /** مستخدم فائق */
  is_superuser: boolean
  /** رابط الصورة الشخصية */
  avatar_url: string | null
  /** عدد الطلبات */
  orders_count: number
  /** إجمالي الإنفاق */
  total_spent: number
  /** آخر تسجيل دخول */
  last_login: string | null
  /** تاريخ الإنشاء */
  created_at: string
}


// =============================================================================
// User Detail Interface
// واجهة تفاصيل المستخدم
// =============================================================================

export interface UserDetail extends User {
  /** معلومات الملف الشخصي */
  profile: {
    address: string
    avatar_url: string | null
    preferred_language: string
    preferred_language_display: string
  } | null
  /** ارتباطات البائعين */
  vendor_associations: Array<{
    id: number
    vendor_id: number
    vendor_name: string
    is_owner: boolean
    permissions: Record<string, any>
  }>
  /** تاريخ الانضمام */
  date_joined: string
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// User Filters Interface
// واجهة فلاتر المستخدمين
// =============================================================================

export interface UserFilters {
  /** البحث */
  search?: string
  /** فلتر الدور */
  role?: UserRole
  /** فلتر حالة التفعيل */
  is_active?: boolean
  /** فلتر حالة الموظف */
  is_staff?: boolean
  /** حقل الترتيب */
  sort_by?: 'created_at' | 'email' | 'full_name' | 'role' | 'last_login'
  /** اتجاه الترتيب */
  sort_dir?: 'asc' | 'desc'
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}


// =============================================================================
// Create/Update Payloads
// بيانات الإنشاء/التحديث
// =============================================================================

export interface UserCreatePayload {
  /** البريد الإلكتروني (مطلوب) */
  email: string
  /** كلمة المرور (مطلوب) */
  password: string
  /** تأكيد كلمة المرور (مطلوب) */
  password_confirm: string
  /** الاسم الكامل */
  full_name: string
  /** رقم الهاتف (مطلوب) */
  phone: string
  /** الدور */
  role?: UserRole
  /** نشط */
  is_active?: boolean
  /** موظف */
  is_staff?: boolean
  /** العنوان */
  address?: string
  /** اللغة المفضلة */
  preferred_language?: 'ar' | 'en'
}

export interface UserUpdatePayload {
  /** البريد الإلكتروني */
  email?: string
  /** الاسم الكامل */
  full_name?: string
  /** رقم الهاتف */
  phone?: string
  /** الدور */
  role?: UserRole
  /** نشط */
  is_active?: boolean
  /** موظف */
  is_staff?: boolean
  /** مستخدم فائق */
  is_superuser?: boolean
  /** العنوان */
  address?: string
  /** اللغة المفضلة */
  preferred_language?: 'ar' | 'en'
}

export interface UserStatusUpdatePayload {
  /** حالة التفعيل */
  is_active: boolean
}


// =============================================================================
// Bulk Action Payload
// بيانات العملية المجمعة
// =============================================================================

export interface UserBulkActionPayload {
  /** قائمة معرفات المستخدمين */
  user_ids: number[]
  /** الإجراء */
  action: 'activate' | 'deactivate' | 'delete'
}


// =============================================================================
// Statistics Interface
// واجهة الإحصائيات
// =============================================================================

export interface UserStats {
  /** إجمالي المستخدمين */
  total: number
  /** نشط */
  active: number
  /** غير نشط */
  inactive: number
  /** زبائن */
  customers: number
  /** بائعون */
  vendors: number
  /** مطورون */
  admins: number
  /** هذا الأسبوع */
  this_week: number
  /** هذا الشهر */
  this_month: number
  /** بريد إلكتروني مُتحقق */
  verified_emails: number
}


// =============================================================================
// API Response Types
// أنواع استجابات API
// =============================================================================

export interface UserListResponse {
  results: User[]
  count: number
  next: string | null
  previous: string | null
}

