/**
 * Admin Product Types
 * أنواع المنتجات للإدارة
 * 
 * This file contains TypeScript interfaces for product management.
 * هذا الملف يحتوي على واجهات TypeScript لإدارة المنتجات.
 */


// =============================================================================
// Product Status
// حالة المنتج
// =============================================================================

export type ProductStatus = 'active' | 'draft' | 'out_of_stock'


// =============================================================================
// Product Image
// صورة المنتج
// =============================================================================

export interface ProductImage {
  id: number
  image: string
  image_url: string
  display_order: number
  is_primary: boolean
  alt_text: string
  created_at: string
  updated_at: string
}

export interface ProductImageCreatePayload {
  image: File
  display_order?: number
  is_primary?: boolean
  alt_text?: string
}

export interface ProductImageUpdatePayload {
  display_order?: number
  is_primary?: boolean
  alt_text?: string
  image?: File
}


// =============================================================================
// Product Variant
// متغير المنتج
// =============================================================================

export interface ProductVariant {
  id: number
  color: string
  color_hex: string
  size: string
  model: string
  sku: string
  stock_quantity: number
  price_override: number | null
  final_price: number
  image: string | null
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface ProductVariantCreatePayload {
  color: string
  color_hex?: string
  size?: string
  model?: string
  sku?: string
  stock_quantity: number
  price_override?: number | null
  image?: File | null
  is_available?: boolean
}


// =============================================================================
// Product
// المنتج
// =============================================================================

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  base_price: number
  product_type: string
  vendor: number
  vendor_name: string | null
  vendor_logo: string | null
  category: number | null
  category_name: string | null
  category_name_ar: string | null
  variants_count: number
  total_stock: number
  main_image: string | null
  status: ProductStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductDetail extends Product {
  images: ProductImage[]
  variants: ProductVariant[]
}


// =============================================================================
// Product Create/Update Payloads
// بيانات إنشاء/تحديث المنتج
// =============================================================================

export interface ProductCreatePayload {
  name: string
  description?: string
  base_price: number
  product_type?: string
  vendor_id: number
  category_id?: number | null
  is_active?: boolean
  variants?: ProductVariantCreatePayload[]
}

export interface ProductUpdatePayload {
  name?: string
  description?: string
  base_price?: number
  product_type?: string
  vendor_id?: number
  category_id?: number | null
  is_active?: boolean
}


// =============================================================================
// Product Filters
// فلاتر المنتجات
// =============================================================================

export interface ProductFilters {
  search?: string
  category?: number
  vendor?: number
  status?: ProductStatus
  is_active?: boolean
  sort_by?: 'name' | 'price' | 'stock' | 'created_at'
  sort_dir?: 'asc' | 'desc'
  page?: number
  page_size?: number
}


// =============================================================================
// Bulk Action
// العمليات المجمعة
// =============================================================================

export type ProductBulkAction = 'activate' | 'deactivate' | 'delete'

export interface ProductBulkActionPayload {
  product_ids: number[]
  action: ProductBulkAction
}


// =============================================================================
// API Response Types
// أنواع استجابات API
// =============================================================================

export interface ProductListResponse {
  results: Product[]
  count: number
  next: string | null
  previous: string | null
}

