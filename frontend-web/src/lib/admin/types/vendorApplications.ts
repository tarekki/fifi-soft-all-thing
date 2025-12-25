/**
 * Admin Vendor Application Types
 * أنواع طلبات انضمام البائعين للإدارة
 * 
 * @author Yalla Buy Team
 */


// =============================================================================
// Status Types
// أنواع الحالة
// =============================================================================

export type VendorApplicationStatus = 'pending' | 'approved' | 'rejected'

export type VendorApplicationBusinessType = 'individual' | 'company' | 'brand' | 'other'


// =============================================================================
// Vendor Application Interface (List View)
// واجهة طلب الانضمام (عرض القائمة)
// =============================================================================

export interface VendorApplication {
  /** معرف الطلب */
  id: number
  /** اسم المتجر */
  store_name: string
  /** اسم المتقدم */
  applicant_name: string
  /** البريد الإلكتروني */
  applicant_email: string
  /** رقم الهاتف */
  applicant_phone: string
  /** نوع النشاط */
  business_type: VendorApplicationBusinessType
  /** عرض نوع النشاط */
  business_type_display: string
  /** الحالة */
  status: VendorApplicationStatus
  /** عرض الحالة */
  status_display: string
  /** رابط شعار المتجر */
  store_logo_url: string | null
  /** تاريخ التقديم */
  created_at: string
  /** تاريخ المراجعة */
  reviewed_at: string | null
}


// =============================================================================
// Vendor Application Detail Interface
// واجهة تفاصيل طلب الانضمام
// =============================================================================

export interface VendorApplicationDetail extends VendorApplication {
  /** المستخدم المرتبط */
  user: number | null
  /** معلومات المستخدم */
  user_info: {
    id: number
    email: string
    full_name: string
  } | null
  /** وصف المتجر */
  store_description: string
  /** ملف الشعار */
  store_logo: string | null
  /** عنوان النشاط */
  business_address: string
  /** رخصة النشاط */
  business_license: string | null
  /** رابط رخصة النشاط */
  business_license_url: string | null
  /** ملاحظات الأدمن */
  admin_notes: string
  /** سبب الرفض */
  rejection_reason: string
  /** معرف المراجع */
  reviewed_by: number | null
  /** اسم المراجع */
  reviewed_by_name: string | null
  /** معرف البائع المُنشأ */
  created_vendor: number | null
  /** معلومات البائع المُنشأ */
  created_vendor_info: {
    id: number
    name: string
    slug: string
    is_active: boolean
  } | null
  /** تاريخ التحديث */
  updated_at: string
}


// =============================================================================
// Vendor Application Filters Interface
// واجهة فلاتر طلبات الانضمام
// =============================================================================

export interface VendorApplicationFilters {
  /** البحث */
  search?: string
  /** فلتر الحالة */
  status?: VendorApplicationStatus
  /** فلتر نوع النشاط */
  business_type?: VendorApplicationBusinessType
  /** حقل الترتيب */
  sort_by?: 'created_at' | 'store_name' | 'applicant_name' | 'status' | 'reviewed_at'
  /** اتجاه الترتيب */
  sort_dir?: 'asc' | 'desc'
  /** رقم الصفحة */
  page?: number
  /** حجم الصفحة */
  page_size?: number
}


// =============================================================================
// Approve/Reject Payloads
// بيانات الموافقة/الرفض
// =============================================================================

export interface VendorApplicationApprovePayload {
  /** نسبة العمولة للبائع الجديد */
  commission_rate?: number
  /** ملاحظات داخلية */
  admin_notes?: string
}

export interface VendorApplicationRejectPayload {
  /** سبب الرفض (مطلوب) */
  rejection_reason: string
  /** ملاحظات داخلية */
  admin_notes?: string
}


// =============================================================================
// Statistics Interface
// واجهة الإحصائيات
// =============================================================================

export interface VendorApplicationStats {
  /** إجمالي الطلبات */
  total: number
  /** قيد المراجعة */
  pending: number
  /** مقبولة */
  approved: number
  /** مرفوضة */
  rejected: number
  /** هذا الأسبوع */
  this_week: number
  /** هذا الشهر */
  this_month: number
}


// =============================================================================
// API Response Types
// أنواع استجابات API
// =============================================================================

export interface VendorApplicationListResponse {
  results: VendorApplication[]
  count: number
  next: string | null
  previous: string | null
}

