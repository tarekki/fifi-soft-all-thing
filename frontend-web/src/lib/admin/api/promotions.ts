/**
 * Promotions API Functions
 * دوال API العروض والحملات
 * 
 * هذا الملف يحتوي على جميع دوال API للبانرات والقصص والكوبونات في لوحة التحكم.
 * This file contains all API functions for banners, stories, and coupons in the admin dashboard.
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse } from '../types'
import type {
  Banner,
  BannerDetail,
  BannerPayload,
  BannerFilters,
  PaginatedBanners,
  Story,
  StoryDetail,
  StoryPayload,
  StoryFilters,
  PaginatedStories,
  Coupon,
  CouponDetail,
  CouponPayload,
  CouponFilters,
  PaginatedCoupons,
  PromotionStats,
} from '../types/promotions'
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
 * تجديد توكن الوصول باستخدام توكن التحديث
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
// Banners API Functions
// دوال API البانرات
// =============================================================================

/**
 * Get all banners with pagination and filtering
 * الحصول على جميع البانرات مع التصفية والترقيم
 */
export async function getBanners(
  filters: BannerFilters = {}
): Promise<ApiResponse<PaginatedBanners>> {
  const queryParams = new URLSearchParams()
  
  if (filters.search) {
    queryParams.set('search', filters.search)
  }
  if (filters.location) {
    queryParams.set('location', filters.location)
  }
  if (filters.is_active !== undefined) {
    queryParams.set('is_active', String(filters.is_active))
  }
  if (filters.page) {
    queryParams.set('page', String(filters.page))
  }
  if (filters.page_size) {
    queryParams.set('page_size', String(filters.page_size))
  }
  
  const queryString = queryParams.toString()
  const endpoint = `/promotions/banners/${queryString ? `?${queryString}` : ''}`
  
  return adminFetch<PaginatedBanners>(endpoint)
}

/**
 * Get banner by ID
 * الحصول على بانر بالمعرف
 */
export async function getBanner(id: number): Promise<ApiResponse<BannerDetail>> {
  return adminFetch<BannerDetail>(`/promotions/banners/${id}/`)
}

/**
 * Create a new banner
 * إنشاء بانر جديد
 */
export async function createBanner(
  data: BannerPayload
): Promise<ApiResponse<BannerDetail>> {
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('title_ar', data.title_ar)
    if (data.subtitle) {
      formData.append('subtitle', data.subtitle)
    }
    if (data.subtitle_ar) {
      formData.append('subtitle_ar', data.subtitle_ar)
    }
    if (data.image) {
      formData.append('image', data.image)
    }
    formData.append('link_type', data.link_type)
    formData.append('link', data.link)
    formData.append('location', data.location)
    if (data.order !== undefined) {
      formData.append('order', String(data.order))
    }
    formData.append('start_date', data.start_date)
    if (data.end_date) {
      formData.append('end_date', data.end_date)
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    
    return adminFetch<BannerDetail>('/promotions/banners/', {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  const jsonData: Record<string, unknown> = {
    title: data.title,
    title_ar: data.title_ar,
    subtitle: data.subtitle,
    subtitle_ar: data.subtitle_ar,
    link_type: data.link_type,
    link: data.link,
    location: data.location,
    order: data.order,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active,
  }
  
  return adminFetch<BannerDetail>('/promotions/banners/', {
    method: 'POST',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Update an existing banner
 * تحديث بانر موجود
 */
export async function updateBanner(
  id: number,
  data: BannerPayload
): Promise<ApiResponse<BannerDetail>> {
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('title_ar', data.title_ar)
    if (data.subtitle) {
      formData.append('subtitle', data.subtitle)
    }
    if (data.subtitle_ar) {
      formData.append('subtitle_ar', data.subtitle_ar)
    }
    if (data.image) {
      formData.append('image', data.image)
    }
    formData.append('link_type', data.link_type)
    formData.append('link', data.link)
    formData.append('location', data.location)
    if (data.order !== undefined) {
      formData.append('order', String(data.order))
    }
    formData.append('start_date', data.start_date)
    if (data.end_date) {
      formData.append('end_date', data.end_date)
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    
    return adminFetch<BannerDetail>(`/promotions/banners/${id}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  const jsonData: Record<string, unknown> = {
    title: data.title,
    title_ar: data.title_ar,
    subtitle: data.subtitle,
    subtitle_ar: data.subtitle_ar,
    link_type: data.link_type,
    link: data.link,
    location: data.location,
    order: data.order,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active,
  }
  
  return adminFetch<BannerDetail>(`/promotions/banners/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Delete a banner
 * حذف بانر
 */
export async function deleteBanner(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/banners/${id}/`, {
    method: 'DELETE',
  })
}

/**
 * Track banner click
 * تتبع نقرات البانر
 */
export async function trackBannerClick(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/banners/${id}/click/`, {
    method: 'POST',
  })
}

/**
 * Track banner view
 * تتبع مشاهدات البانر
 */
export async function trackBannerView(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/banners/${id}/view/`, {
    method: 'POST',
  })
}

// =============================================================================
// Stories API Functions
// دوال API القصص
// =============================================================================

/**
 * Get all stories with pagination and filtering
 * الحصول على جميع القصص مع التصفية والترقيم
 */
export async function getStories(
  filters: StoryFilters = {}
): Promise<ApiResponse<PaginatedStories>> {
  const queryParams = new URLSearchParams()
  
  if (filters.search) {
    queryParams.set('search', filters.search)
  }
  if (filters.is_active !== undefined) {
    queryParams.set('is_active', String(filters.is_active))
  }
  if (filters.page) {
    queryParams.set('page', String(filters.page))
  }
  if (filters.page_size) {
    queryParams.set('page_size', String(filters.page_size))
  }
  
  const queryString = queryParams.toString()
  const endpoint = `/promotions/stories/${queryString ? `?${queryString}` : ''}`
  
  return adminFetch<PaginatedStories>(endpoint)
}

/**
 * Get story by ID
 * الحصول على قصة بالمعرف
 */
export async function getStory(id: number): Promise<ApiResponse<StoryDetail>> {
  return adminFetch<StoryDetail>(`/promotions/stories/${id}/`)
}

/**
 * Create a new story
 * إنشاء قصة جديدة
 */
export async function createStory(
  data: StoryPayload
): Promise<ApiResponse<StoryDetail>> {
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('title_ar', data.title_ar)
    if (data.image) {
      formData.append('image', data.image)
    }
    formData.append('link_type', data.link_type)
    if (data.link) {
      formData.append('link', data.link)
    }
    formData.append('expires_at', data.expires_at)
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    if (data.order !== undefined) {
      formData.append('order', String(data.order))
    }
    
    return adminFetch<StoryDetail>('/promotions/stories/', {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  const jsonData: Record<string, unknown> = {
    title: data.title,
    title_ar: data.title_ar,
    link_type: data.link_type,
    link: data.link,
    expires_at: data.expires_at,
    is_active: data.is_active,
    order: data.order,
  }
  
  return adminFetch<StoryDetail>('/promotions/stories/', {
    method: 'POST',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Update an existing story
 * تحديث قصة موجودة
 */
export async function updateStory(
  id: number,
  data: StoryPayload
): Promise<ApiResponse<StoryDetail>> {
  const hasFile = data.image instanceof File
  
  if (hasFile) {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('title_ar', data.title_ar)
    if (data.image) {
      formData.append('image', data.image)
    }
    formData.append('link_type', data.link_type)
    if (data.link) {
      formData.append('link', data.link)
    }
    formData.append('expires_at', data.expires_at)
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    if (data.order !== undefined) {
      formData.append('order', String(data.order))
    }
    
    return adminFetch<StoryDetail>(`/promotions/stories/${id}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for simple data (no file)
  const jsonData: Record<string, unknown> = {
    title: data.title,
    title_ar: data.title_ar,
    link_type: data.link_type,
    link: data.link,
    expires_at: data.expires_at,
    is_active: data.is_active,
    order: data.order,
  }
  
  return adminFetch<StoryDetail>(`/promotions/stories/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Delete a story
 * حذف قصة
 */
export async function deleteStory(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/stories/${id}/`, {
    method: 'DELETE',
  })
}

/**
 * Track story view
 * تتبع مشاهدات القصة
 */
export async function trackStoryView(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/stories/${id}/view/`, {
    method: 'POST',
  })
}

// =============================================================================
// Coupons API Functions
// دوال API الكوبونات
// =============================================================================

/**
 * Get all coupons with pagination and filtering
 * الحصول على جميع الكوبونات مع التصفية والترقيم
 */
export async function getCoupons(
  filters: CouponFilters = {}
): Promise<ApiResponse<PaginatedCoupons>> {
  const queryParams = new URLSearchParams()
  
  if (filters.search) {
    queryParams.set('search', filters.search)
  }
  if (filters.discount_type) {
    queryParams.set('discount_type', filters.discount_type)
  }
  if (filters.applicable_to) {
    queryParams.set('applicable_to', filters.applicable_to)
  }
  if (filters.is_active !== undefined) {
    queryParams.set('is_active', String(filters.is_active))
  }
  if (filters.page) {
    queryParams.set('page', String(filters.page))
  }
  if (filters.page_size) {
    queryParams.set('page_size', String(filters.page_size))
  }
  
  const queryString = queryParams.toString()
  const endpoint = `/promotions/coupons/${queryString ? `?${queryString}` : ''}`
  
  return adminFetch<PaginatedCoupons>(endpoint)
}

/**
 * Get coupon by ID
 * الحصول على كوبون بالمعرف
 */
export async function getCoupon(id: number): Promise<ApiResponse<CouponDetail>> {
  return adminFetch<CouponDetail>(`/promotions/coupons/${id}/`)
}

/**
 * Create a new coupon
 * إنشاء كوبون جديد
 */
export async function createCoupon(
  data: CouponPayload
): Promise<ApiResponse<CouponDetail>> {
  const jsonData: Record<string, unknown> = {
    code: data.code,
    description: data.description,
    description_ar: data.description_ar,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order: data.min_order || 0,
    max_discount: data.max_discount,
    usage_limit: data.usage_limit,
    applicable_to: data.applicable_to,
    applicable_categories: data.applicable_categories || [],
    applicable_products: data.applicable_products || [],
    applicable_users: data.applicable_users || [],
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active,
  }
  
  return adminFetch<CouponDetail>('/promotions/coupons/', {
    method: 'POST',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Update an existing coupon
 * تحديث كوبون موجود
 */
export async function updateCoupon(
  id: number,
  data: CouponPayload
): Promise<ApiResponse<CouponDetail>> {
  const jsonData: Record<string, unknown> = {
    code: data.code,
    description: data.description,
    description_ar: data.description_ar,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order: data.min_order,
    max_discount: data.max_discount,
    usage_limit: data.usage_limit,
    applicable_to: data.applicable_to,
    applicable_categories: data.applicable_categories,
    applicable_products: data.applicable_products,
    applicable_users: data.applicable_users,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: data.is_active,
  }
  
  return adminFetch<CouponDetail>(`/promotions/coupons/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(jsonData),
  })
}

/**
 * Delete a coupon
 * حذف كوبون
 */
export async function deleteCoupon(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/promotions/coupons/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Promotion Stats API Functions
// دوال API إحصائيات العروض
// =============================================================================

/**
 * Get promotion statistics
 * الحصول على إحصائيات العروض
 */
export async function getPromotionStats(): Promise<ApiResponse<PromotionStats>> {
  return adminFetch<PromotionStats>('/promotions/stats/')
}

