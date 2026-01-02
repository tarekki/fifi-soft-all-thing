/**
 * Admin Vendors API
 * واجهة برمجة البائعين للإدارة
 * 
 * This file contains API functions for vendor management.
 * هذا الملف يحتوي على دوال API لإدارة البائعين.
 * 
 * Features:
 * - List vendors with filters and pagination
 * - Create new vendor
 * - Get vendor details
 * - Update vendor
 * - Delete vendor
 * - Update vendor status
 * - Update vendor commission
 * - Bulk actions on vendors
 * - Vendor statistics
 * 
 * الميزات:
 * - عرض البائعين مع الفلاتر والترقيم
 * - إنشاء بائع جديد
 * - الحصول على تفاصيل البائع
 * - تعديل البائع
 * - حذف البائع
 * - تحديث حالة البائع
 * - تحديث عمولة البائع
 * - عمليات مجمعة على البائعين
 * - إحصائيات البائعين
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Vendor,
  VendorDetail,
  VendorFilters,
  VendorCreatePayload,
  VendorWithUserCreatePayload,
  VendorWithUserCreateResponse,
  VendorUpdatePayload,
  VendorStatusUpdatePayload,
  VendorCommissionUpdatePayload,
  VendorBulkActionPayload,
  VendorStats,
} from '../types/vendors'
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

/**
 * Authenticated fetch for admin API
 * جلب مصادق لـ API الإدارة
 */
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ADMIN_API_URL}${endpoint}`
  
  // Get access token
  // الحصول على توكن الوصول
  let accessToken = getAccessToken()
  
  // Check if token is expired and try to refresh
  // التحقق من انتهاء التوكن ومحاولة التجديد
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
  // بناء الـ headers
  const headers: HeadersInit = {
    ...options.headers,
  }
  
  // Only add Content-Type for non-FormData requests
  // إضافة Content-Type فقط للطلبات غير FormData
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
    // معالجة 401 غير مصرح
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
 * تجديد توكن الوصول باستخدام توكن التجديد
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
// Vendors API Functions
// دوال API البائعين
// =============================================================================

/**
 * Get all vendors with optional filters
 * جلب جميع البائعين مع فلاتر اختيارية
 * 
 * @param filters - Optional filters for vendors
 * @returns Paginated vendors response
 */
export async function getVendors(
  filters?: VendorFilters
): Promise<ApiResponse<PaginatedResponse<Vendor>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active))
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.page_size) params.append('page_size', String(filters.page_size))
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/vendors/?${queryString}` : '/vendors/'
  
  return adminFetch<PaginatedResponse<Vendor>>(endpoint)
}


/**
 * Get single vendor details
 * جلب تفاصيل بائع واحد
 * 
 * @param id - Vendor ID
 * @returns Full vendor details
 */
export async function getVendor(id: number): Promise<ApiResponse<VendorDetail>> {
  return adminFetch<VendorDetail>(`/vendors/${id}/`)
}


/**
 * Create a new vendor
 * إنشاء بائع جديد
 * 
 * @param data - Vendor creation data
 * @returns Created vendor details
 */
export async function createVendor(
  data: VendorCreatePayload
): Promise<ApiResponse<VendorDetail>> {
  // Check if we need to use FormData (when logo is a File)
  // التحقق من الحاجة لاستخدام FormData (عندما يكون الشعار ملف)
  if (data.logo instanceof File) {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('logo', data.logo)
    if (data.primary_color) formData.append('primary_color', data.primary_color)
    if (data.description) formData.append('description', data.description)
    if (data.commission_rate !== undefined) {
      formData.append('commission_rate', String(data.commission_rate))
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    
    return adminFetch<VendorDetail>('/vendors/', {
      method: 'POST',
      body: formData,
    })
  }
  
  // Use JSON for requests without file
  // استخدام JSON للطلبات بدون ملف
  return adminFetch<VendorDetail>('/vendors/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


/**
 * Create vendor with user account
 * إنشاء بائع مع حساب مستخدم
 * 
 * This function creates:
 * 1. Vendor
 * 2. User (if not exists) or links to existing user
 * 3. VendorUser (links User to Vendor)
 * 
 * هذه الدالة تنشئ:
 * 1. البائع
 * 2. المستخدم (إذا لم يكن موجوداً) أو تربط بمستخدم موجود
 * 3. VendorUser (يربط المستخدم بالبائع)
 * 
 * @param data - Vendor and user creation data
 * @returns Created vendor, user, and temporary password (if new user created)
 */
export async function createVendorWithUser(
  data: VendorWithUserCreatePayload
): Promise<ApiResponse<VendorWithUserCreateResponse>> {
  // Always use FormData to support file uploads
  // دائماً استخدام FormData لدعم رفع الملفات
  const formData = new FormData()
  
  // Vendor fields
  // حقول البائع
  formData.append('vendor_name', data.vendor_name)
  if (data.vendor_description) {
    formData.append('vendor_description', data.vendor_description)
  }
  if (data.vendor_logo) {
    formData.append('vendor_logo', data.vendor_logo)
  }
  if (data.vendor_primary_color) {
    formData.append('vendor_primary_color', data.vendor_primary_color)
  }
  if (data.commission_rate !== undefined) {
    formData.append('commission_rate', String(data.commission_rate))
  }
  if (data.is_active !== undefined) {
    formData.append('is_active', data.is_active ? 'true' : 'false')
  }
  
  // User fields
  // حقول المستخدم
  formData.append('user_email', data.user_email)
  formData.append('user_full_name', data.user_full_name)
  formData.append('user_phone', data.user_phone)
  
  // User creation options
  // خيارات إنشاء المستخدم
  if (data.use_existing_user !== undefined) {
    formData.append('use_existing_user', data.use_existing_user ? 'true' : 'false')
  }
  if (data.user_id !== undefined && data.user_id !== null) {
    formData.append('user_id', String(data.user_id))
  }
  
  return adminFetch<VendorWithUserCreateResponse>('/vendors/create-with-user/', {
    method: 'POST',
    body: formData,
  })
}


/**
 * Update an existing vendor
 * تعديل بائع موجود
 * 
 * @param id - Vendor ID
 * @param data - Vendor update data
 * @returns Updated vendor details
 */
export async function updateVendor(
  id: number,
  data: VendorUpdatePayload
): Promise<ApiResponse<VendorDetail>> {
  // Check if we need to use FormData (when logo is a File)
  // التحقق من الحاجة لاستخدام FormData (عندما يكون الشعار ملف)
  if (data.logo instanceof File) {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    formData.append('logo', data.logo)
    if (data.primary_color) formData.append('primary_color', data.primary_color)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.commission_rate !== undefined) {
      formData.append('commission_rate', String(data.commission_rate))
    }
    if (data.is_active !== undefined) {
      formData.append('is_active', data.is_active ? 'true' : 'false')
    }
    
    return adminFetch<VendorDetail>(`/vendors/${id}/`, {
      method: 'PUT',
      body: formData,
    })
  }
  
  // Use JSON for requests without file
  // استخدام JSON للطلبات بدون ملف
  return adminFetch<VendorDetail>(`/vendors/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Delete a vendor
 * حذف بائع
 * 
 * Security:
 * - Cannot delete vendor with products
 * - Use deactivate instead
 * 
 * الأمان:
 * - لا يمكن حذف بائع لديه منتجات
 * - استخدم التعطيل بدلاً من ذلك
 * 
 * @param id - Vendor ID
 * @returns Success response
 */
export async function deleteVendor(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`/vendors/${id}/`, {
    method: 'DELETE',
  })
}


/**
 * Update vendor status
 * تحديث حالة البائع
 * 
 * @param id - Vendor ID
 * @param data - Status update payload
 * @returns Updated vendor details
 */
export async function updateVendorStatus(
  id: number,
  data: VendorStatusUpdatePayload
): Promise<ApiResponse<VendorDetail>> {
  return adminFetch<VendorDetail>(`/vendors/${id}/status/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Update vendor commission rate
 * تحديث نسبة عمولة البائع
 * 
 * @param id - Vendor ID
 * @param data - Commission update payload
 * @returns Updated vendor details
 */
export async function updateVendorCommission(
  id: number,
  data: VendorCommissionUpdatePayload
): Promise<ApiResponse<VendorDetail>> {
  return adminFetch<VendorDetail>(`/vendors/${id}/commission/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Perform bulk action on multiple vendors
 * تنفيذ عملية مجمعة على عدة بائعين
 * 
 * @param payload - Bulk action payload
 * @returns Affected count
 */
export async function bulkVendorAction(
  payload: VendorBulkActionPayload
): Promise<ApiResponse<{ affected_count: number }>> {
  return adminFetch<{ affected_count: number }>('/vendors/bulk-action/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}


/**
 * Get vendor statistics
 * الحصول على إحصائيات البائعين
 * 
 * @returns Vendor statistics
 */
export async function getVendorStats(): Promise<ApiResponse<VendorStats>> {
  return adminFetch<VendorStats>('/vendors/stats/')
}

