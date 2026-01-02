/**
 * Admin Products API
 * واجهة برمجة المنتجات للإدارة
 * 
 * This file contains API functions for product management.
 * هذا الملف يحتوي على دوال API لإدارة المنتجات.
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Product,
  ProductDetail,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductFilters,
  ProductBulkActionPayload,
  ProductVariant,
  ProductVariantCreatePayload,
  ProductImage,
  ProductImageCreatePayload,
  ProductImageUpdatePayload,
} from '../types/products'
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpired,
} from '../api'


// =============================================================================
// Configuration
// الإعدادات
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost/api/v1'
const ADMIN_API_URL = `${API_BASE_URL}/admin`


// =============================================================================
// Base Fetch Function (with token refresh)
// دالة الجلب الأساسية (مع تجديد التوكن)
// =============================================================================

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ADMIN_API_URL}${endpoint}`
  
  // Get access token
  let accessToken = getAccessToken()
  
  // Check if token is expired and try to refresh
  if (accessToken && isTokenExpired(accessToken)) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const refreshed = await refreshAccessToken(refreshToken)
        if (refreshed) {
          accessToken = refreshed
        } else {
          clearTokens()
          throw new Error('Session expired. Please login again.')
        }
      } catch {
        clearTokens()
        throw new Error('Session expired. Please login again.')
      }
    }
  }
  
  // Build headers
  const headers: HeadersInit = {
    ...options.headers,
  }
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    const data = await response.json()
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearTokens()
      throw new Error(data.message || 'Unauthorized')
    }
    
    return data as ApiResponse<T>
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error. Please check your connection.')
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (data.success && data.data?.access) {
      saveTokens(data.data.access, refreshToken)
      return data.data.access
    }
    
    return null
  } catch {
    return null
  }
}


// =============================================================================
// Products API
// واجهة برمجة المنتجات
// =============================================================================

/**
 * Get all products with optional filters
 * جلب جميع المنتجات مع فلاتر اختيارية
 */
export async function getProducts(
  filters?: ProductFilters
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', String(filters.category))
    if (filters.vendor) params.append('vendor', String(filters.vendor))
    if (filters.status) params.append('status', filters.status)
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active))
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.page_size) params.append('page_size', String(filters.page_size))
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/products/?${queryString}` : '/products/'
  
  return adminFetch<PaginatedResponse<Product>>(endpoint)
}


/**
 * Get single product details
 * جلب تفاصيل منتج واحد
 */
export async function getProduct(id: number): Promise<ApiResponse<ProductDetail>> {
  return adminFetch<ProductDetail>(`/products/${id}/`)
}


/**
 * Create a new product
 * إنشاء منتج جديد
 */
export async function createProduct(
  data: ProductCreatePayload
): Promise<ApiResponse<ProductDetail>> {
  return adminFetch<ProductDetail>('/products/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}


/**
 * Update a product
 * تحديث منتج
 */
export async function updateProduct(
  id: number,
  data: ProductUpdatePayload
): Promise<ApiResponse<ProductDetail>> {
  return adminFetch<ProductDetail>(`/products/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}


/**
 * Delete a product
 * حذف منتج
 */
export async function deleteProduct(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/products/${id}/`, {
    method: 'DELETE',
  })
}


/**
 * Bulk action on products
 * عملية مجمعة على المنتجات
 */
export async function bulkProductAction(
  payload: ProductBulkActionPayload
): Promise<ApiResponse<{ affected_count: number }>> {
  return adminFetch<{ affected_count: number }>('/products/bulk-action/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}


// =============================================================================
// Product Variants API
// واجهة برمجة متغيرات المنتج
// =============================================================================

/**
 * Get all variants for a product
 * جلب جميع متغيرات منتج
 */
export async function getProductVariants(
  productId: number
): Promise<ApiResponse<ProductVariant[]>> {
  return adminFetch<ProductVariant[]>(`/products/${productId}/variants/`)
}


/**
 * Get single variant details
 * جلب تفاصيل متغير واحد
 */
export async function getProductVariant(
  productId: number,
  variantId: number
): Promise<ApiResponse<ProductVariant>> {
  return adminFetch<ProductVariant>(`/products/${productId}/variants/${variantId}/`)
}


/**
 * Create a new variant
 * إنشاء متغير جديد
 */
export async function createProductVariant(
  productId: number,
  data: ProductVariantCreatePayload
): Promise<ApiResponse<ProductVariant>> {
  // Check if we have a file to upload
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData()
    formData.append('color', data.color)
    if (data.color_hex) formData.append('color_hex', data.color_hex)
    if (data.size) formData.append('size', data.size)
    if (data.model) formData.append('model', data.model)
    if (data.sku) formData.append('sku', data.sku)
    formData.append('stock_quantity', String(data.stock_quantity))
    if (data.price_override !== undefined && data.price_override !== null) {
      formData.append('price_override', String(data.price_override))
    }
    if (data.image) formData.append('image', data.image)
    formData.append('is_available', data.is_available !== false ? 'true' : 'false')
    
    return adminFetch<ProductVariant>(`/products/${productId}/variants/`, {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for non-file requests
  const payload = { ...data }
  delete payload.image // Remove image if not a file
  
  return adminFetch<ProductVariant>(`/products/${productId}/variants/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}


/**
 * Update a variant
 * تحديث متغير
 */
export async function updateProductVariant(
  productId: number,
  variantId: number,
  data: Partial<ProductVariantCreatePayload>
): Promise<ApiResponse<ProductVariant>> {
  // Check if we have a file to upload
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData()
    if (data.color !== undefined) formData.append('color', data.color)
    if (data.color_hex !== undefined) formData.append('color_hex', data.color_hex)
    if (data.size !== undefined) formData.append('size', data.size)
    if (data.model !== undefined) formData.append('model', data.model)
    if (data.sku !== undefined) formData.append('sku', data.sku)
    if (data.stock_quantity !== undefined) formData.append('stock_quantity', String(data.stock_quantity))
    if (data.price_override !== undefined && data.price_override !== null) {
      formData.append('price_override', String(data.price_override))
    }
    if (data.image) formData.append('image', data.image)
    if (data.is_available !== undefined) {
      formData.append('is_available', data.is_available ? 'true' : 'false')
    }
    
    return adminFetch<ProductVariant>(`/products/${productId}/variants/${variantId}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for non-file requests
  const payload = { ...data }
  delete payload.image
  
  return adminFetch<ProductVariant>(`/products/${productId}/variants/${variantId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}


/**
 * Delete a variant
 * حذف متغير
 */
export async function deleteProductVariant(
  productId: number,
  variantId: number
): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/products/${productId}/variants/${variantId}/`, {
    method: 'DELETE',
  })
}


// =============================================================================
// Product Images API
// واجهة برمجة صور المنتج
// =============================================================================

/**
 * Get all images for a product
 * جلب جميع صور منتج
 */
export async function getProductImages(
  productId: number
): Promise<ApiResponse<ProductImage[]>> {
  return adminFetch<ProductImage[]>(`/products/${productId}/images/`)
}


/**
 * Get single image details
 * جلب تفاصيل صورة واحدة
 */
export async function getProductImage(
  productId: number,
  imageId: number
): Promise<ApiResponse<ProductImage>> {
  return adminFetch<ProductImage>(`/products/${productId}/images/${imageId}/`)
}


/**
 * Create a new product image
 * إنشاء صورة منتج جديدة
 */
export async function createProductImage(
  productId: number,
  data: ProductImageCreatePayload
): Promise<ApiResponse<ProductImage>> {
  const formData = new FormData()
  formData.append('image', data.image)
  if (data.display_order !== undefined) {
    formData.append('display_order', String(data.display_order))
  }
  if (data.is_primary !== undefined) {
    formData.append('is_primary', data.is_primary ? 'true' : 'false')
  }
  if (data.alt_text) {
    formData.append('alt_text', data.alt_text)
  }
  
  return adminFetch<ProductImage>(`/products/${productId}/images/`, {
    method: 'POST',
    body: formData,
  })
}


/**
 * Update a product image
 * تحديث صورة منتج
 */
export async function updateProductImage(
  productId: number,
  imageId: number,
  data: ProductImageUpdatePayload
): Promise<ApiResponse<ProductImage>> {
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData()
    if (data.image) formData.append('image', data.image)
    if (data.display_order !== undefined) {
      formData.append('display_order', String(data.display_order))
    }
    if (data.is_primary !== undefined) {
      formData.append('is_primary', data.is_primary ? 'true' : 'false')
    }
    if (data.alt_text !== undefined) {
      formData.append('alt_text', data.alt_text)
    }
    
    return adminFetch<ProductImage>(`/products/${productId}/images/${imageId}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for non-file requests
  const payload: Record<string, string | number | boolean> = {}
  if (data.display_order !== undefined) payload.display_order = data.display_order
  if (data.is_primary !== undefined) payload.is_primary = data.is_primary
  if (data.alt_text !== undefined) payload.alt_text = data.alt_text
  
  return adminFetch<ProductImage>(`/products/${productId}/images/${imageId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}


/**
 * Delete a product image
 * حذف صورة منتج
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/products/${productId}/images/${imageId}/`, {
    method: 'DELETE',
  })
}


/**
 * Reorder product images
 * إعادة ترتيب صور المنتج
 */
export async function reorderProductImages(
  productId: number,
  imageIds: number[]
): Promise<ApiResponse<{ message: string }>> {
  return adminFetch<{ message: string }>(`/products/${productId}/images/reorder/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_ids: imageIds }),
  })
}

