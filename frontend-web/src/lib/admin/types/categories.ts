/**
 * Category Types
 * أنواع الفئات
 * 
 * هذا الملف يحتوي على جميع الأنواع المتعلقة بالفئات.
 * This file contains all types related to categories.
 */

// =============================================================================
// Category Types
// أنواع الفئات
// =============================================================================

/**
 * Category data from API
 * بيانات الفئة من الـ API
 */
export interface Category {
  id: number
  name: string
  name_ar: string
  slug: string
  description: string
  description_ar: string
  image_url: string | null
  icon: string
  parent: number | null
  parent_name: string | null
  display_order: number
  is_active: boolean
  is_featured: boolean
  products_count: number
  is_parent: boolean
  depth: number
  created_at: string
  updated_at: string
}

/**
 * Category detail with children
 * تفاصيل الفئة مع الأبناء
 */
export interface CategoryDetail extends Category {
  full_path: string
  children: Category[]
}

/**
 * Category tree node
 * عقدة شجرة الفئات
 */
export interface CategoryTreeNode {
  id: number
  name: string
  name_ar: string
  label: string
  slug: string
  is_active: boolean
  display_order: number
  children: CategoryTreeNode[]
}

/**
 * Category create/update form data
 * بيانات نموذج إنشاء/تحديث الفئة
 */
export interface CategoryFormData {
  name: string
  name_ar: string
  slug?: string
  description?: string
  description_ar?: string
  image?: File | null
  icon?: string
  parent?: number | null
  display_order?: number
  is_active?: boolean
  is_featured?: boolean
}

/**
 * Category list query parameters
 * معاملات استعلام قائمة الفئات
 */
export interface CategoryListParams {
  search?: string
  is_active?: boolean
  is_featured?: boolean
  parent?: number | 'null'
  page?: number
  page_size?: number
}

/**
 * Paginated response for categories
 * استجابة مرقمة للفئات
 */
export interface PaginatedCategories {
  count: number
  next: string | null
  previous: string | null
  results: Category[]
}

/**
 * Bulk action for categories
 * عملية مجمعة للفئات
 */
export interface CategoryBulkAction {
  action: 'activate' | 'deactivate' | 'delete'
  ids: number[]
}

/**
 * Bulk action response
 * استجابة العملية المجمعة
 */
export interface CategoryBulkActionResponse {
  affected: number
  action: string
}

