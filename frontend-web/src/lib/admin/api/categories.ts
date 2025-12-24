/**
 * Categories API Functions
 * دوال API الفئات
 * 
 * هذا الملف يحتوي على جميع دوال API للفئات في لوحة التحكم.
 * This file contains all API functions for categories in the admin dashboard.
 */

import type { ApiResponse } from '../types'
import type {
  Category,
  CategoryDetail,
  CategoryTreeNode,
  CategoryFormData,
  CategoryListParams,
  PaginatedCategories,
  CategoryBulkAction,
  CategoryBulkActionResponse,
} from '../types/categories'
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
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
// Categories API Functions
// دوال API الفئات
// =============================================================================

/**
 * Get all categories with pagination and filtering
 * الحصول على جميع الفئات مع التصفية والترقيم
 * 
 * @param params - Query parameters for filtering
 * @returns Promise with paginated categories
 */
export async function getCategories(
  params: CategoryListParams = {}
): Promise<ApiResponse<PaginatedCategories>> {
  // Build query string
  const queryParams = new URLSearchParams()
  
  if (params.search) {
    queryParams.set('search', params.search)
  }
  if (params.is_active !== undefined) {
    queryParams.set('is_active', String(params.is_active))
  }
  if (params.is_featured !== undefined) {
    queryParams.set('is_featured', String(params.is_featured))
  }
  if (params.parent !== undefined) {
    queryParams.set('parent', String(params.parent))
  }
  if (params.page) {
    queryParams.set('page', String(params.page))
  }
  if (params.page_size) {
    queryParams.set('page_size', String(params.page_size))
  }
  
  const queryString = queryParams.toString()
  const endpoint = `/categories/${queryString ? `?${queryString}` : ''}`
  
  return adminFetch<PaginatedCategories>(endpoint)
}

/**
 * Get category by ID
 * الحصول على فئة بالمعرف
 * 
 * @param id - Category ID
 * @returns Promise with category details
 */
export async function getCategory(id: number): Promise<ApiResponse<CategoryDetail>> {
  return adminFetch<CategoryDetail>(`/categories/${id}/`)
}

/**
 * Create a new category
 * إنشاء فئة جديدة
 * 
 * @param data - Category form data
 * @returns Promise with created category
 */
export async function createCategory(
  data: CategoryFormData
): Promise<ApiResponse<CategoryDetail>> {
  // Check if we have a file to upload
  // التحقق من وجود ملف للرفع
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData()
    
    formData.append('name', data.name)
    formData.append('name_ar', data.name_ar)
    
    if (data.slug) {
      formData.append('slug', data.slug)
    }
    if (data.description) {
      formData.append('description', data.description)
    }
    if (data.description_ar) {
      formData.append('description_ar', data.description_ar)
    }
    if (data.image) {
      formData.append('image', data.image)
    }
    if (data.icon) {
      formData.append('icon', data.icon)
    }
    if (data.parent !== undefined && data.parent !== null) {
      formData.append('parent', String(data.parent))
    }
    if (data.display_order !== undefined) {
      formData.append('display_order', String(data.display_order))
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    if (data.is_featured !== undefined) {
      formData.append('is_featured', data.is_featured ? 'true' : 'false')
    }
    
    return adminFetch<CategoryDetail>('/categories/', {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  // استخدام JSON للبيانات البسيطة (بدون ملف)
  const jsonData: Record<string, unknown> = {
    name: data.name,
    name_ar: data.name_ar,
  }
  
  if (data.slug) jsonData.slug = data.slug
  if (data.description) jsonData.description = data.description
  if (data.description_ar) jsonData.description_ar = data.description_ar
  if (data.icon) jsonData.icon = data.icon
  if (data.parent !== undefined) jsonData.parent = data.parent
  if (data.display_order !== undefined) jsonData.display_order = data.display_order
  if (data.is_active !== undefined) jsonData.is_active = data.is_active
  if (data.is_featured !== undefined) jsonData.is_featured = data.is_featured
  
  return adminFetch<CategoryDetail>('/categories/', {
    method: 'POST',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Update an existing category
 * تحديث فئة موجودة
 * 
 * @param id - Category ID
 * @param data - Category form data
 * @returns Promise with updated category
 */
export async function updateCategory(
  id: number,
  data: Partial<CategoryFormData>
): Promise<ApiResponse<CategoryDetail>> {
  // Check if we have a file to upload
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    // Use FormData for file upload
    const formData = new FormData()
    
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.name_ar !== undefined) formData.append('name_ar', data.name_ar)
    if (data.slug !== undefined) formData.append('slug', data.slug)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.description_ar !== undefined) formData.append('description_ar', data.description_ar)
    if (data.image) formData.append('image', data.image)
    if (data.icon !== undefined) formData.append('icon', data.icon)
    if (data.parent !== undefined) formData.append('parent', data.parent === null ? '' : String(data.parent))
    if (data.display_order !== undefined) formData.append('display_order', String(data.display_order))
    if (data.is_active !== undefined) formData.append('is_active', data.is_active ? 'true' : 'false')
    if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured ? 'true' : 'false')
    
    return adminFetch<CategoryDetail>(`/categories/${id}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  const jsonData: Record<string, unknown> = {}
  
  if (data.name !== undefined) jsonData.name = data.name
  if (data.name_ar !== undefined) jsonData.name_ar = data.name_ar
  if (data.slug !== undefined) jsonData.slug = data.slug
  if (data.description !== undefined) jsonData.description = data.description
  if (data.description_ar !== undefined) jsonData.description_ar = data.description_ar
  if (data.icon !== undefined) jsonData.icon = data.icon
  if (data.parent !== undefined) jsonData.parent = data.parent
  if (data.display_order !== undefined) jsonData.display_order = data.display_order
  if (data.is_active !== undefined) jsonData.is_active = data.is_active
  if (data.is_featured !== undefined) jsonData.is_featured = data.is_featured
  
  return adminFetch<CategoryDetail>(`/categories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Delete a category
 * حذف فئة
 * 
 * @param id - Category ID
 * @returns Promise with deletion result
 */
export async function deleteCategory(
  id: number
): Promise<ApiResponse<{ deleted: string }>> {
  return adminFetch<{ deleted: string }>(`/categories/${id}/`, {
    method: 'DELETE',
  })
}

/**
 * Get categories as tree structure
 * الحصول على الفئات كشجرة هرمية
 * 
 * @param activeOnly - Only include active categories
 * @returns Promise with category tree
 */
export async function getCategoryTree(
  activeOnly: boolean = false
): Promise<ApiResponse<CategoryTreeNode[]>> {
  const endpoint = `/categories/tree/${activeOnly ? '?active_only=true' : ''}`
  return adminFetch<CategoryTreeNode[]>(endpoint)
}

/**
 * Perform bulk action on categories
 * تنفيذ عملية مجمعة على الفئات
 * 
 * @param action - Action data (action type and category IDs)
 * @returns Promise with bulk action result
 */
export async function bulkCategoryAction(
  action: CategoryBulkAction
): Promise<ApiResponse<CategoryBulkActionResponse>> {
  return adminFetch<CategoryBulkActionResponse>('/categories/bulk-action/', {
    method: 'POST',
    body: JSON.stringify(action),
  })
}

/**
 * Toggle category active status
 * تبديل حالة تفعيل الفئة
 * 
 * @param id - Category ID
 * @param isActive - New active status
 * @returns Promise with updated category
 */
export async function toggleCategoryActive(
  id: number,
  isActive: boolean
): Promise<ApiResponse<CategoryDetail>> {
  return updateCategory(id, { is_active: isActive })
}

/**
 * Toggle category featured status
 * تبديل حالة تمييز الفئة
 * 
 * @param id - Category ID
 * @param isFeatured - New featured status
 * @returns Promise with updated category
 */
export async function toggleCategoryFeatured(
  id: number,
  isFeatured: boolean
): Promise<ApiResponse<CategoryDetail>> {
  return updateCategory(id, { is_featured: isFeatured })
}

