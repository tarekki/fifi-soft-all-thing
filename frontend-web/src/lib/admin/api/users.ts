/**
 * Admin Users API
 * واجهة برمجة المستخدمين للإدارة
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  User,
  UserDetail,
  UserFilters,
  UserCreatePayload,
  UserUpdatePayload,
  UserStatusUpdatePayload,
  UserBulkActionPayload,
  UserStats,
} from '../types/users'
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
// Base Fetch Function
// دالة الجلب الأساسية
// =============================================================================

async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ADMIN_API_URL}${endpoint}`
  
  let accessToken = getAccessToken()
  
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
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


async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    
    if (!response.ok) return null
    
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
// Users API Functions
// دوال API المستخدمين
// =============================================================================

/**
 * Get all users with optional filters
 * جلب جميع المستخدمين مع فلاتر اختيارية
 */
export async function getUsers(
  filters?: UserFilters
): Promise<ApiResponse<PaginatedResponse<User>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active))
    if (filters.is_staff !== undefined) params.append('is_staff', String(filters.is_staff))
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.page_size) params.append('page_size', String(filters.page_size))
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/users/?${queryString}` : '/users/'
  
  return adminFetch<PaginatedResponse<User>>(endpoint)
}


/**
 * Get single user details
 * جلب تفاصيل مستخدم واحد
 */
export async function getUser(
  id: number
): Promise<ApiResponse<UserDetail>> {
  return adminFetch<UserDetail>(`/users/${id}/`)
}


/**
 * Create a new user
 * إنشاء مستخدم جديد
 */
export async function createUser(
  data: UserCreatePayload
): Promise<ApiResponse<UserDetail>> {
  return adminFetch<UserDetail>('/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


/**
 * Update a user
 * تحديث مستخدم
 */
export async function updateUser(
  id: number,
  data: UserUpdatePayload
): Promise<ApiResponse<UserDetail>> {
  return adminFetch<UserDetail>(`/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Delete a user
 * حذف مستخدم
 */
export async function deleteUser(
  id: number
): Promise<ApiResponse<void>> {
  return adminFetch<void>(`/users/${id}/`, {
    method: 'DELETE',
  })
}


/**
 * Update user status
 * تحديث حالة المستخدم
 */
export async function updateUserStatus(
  id: number,
  data: UserStatusUpdatePayload
): Promise<ApiResponse<UserDetail>> {
  return adminFetch<UserDetail>(`/users/${id}/status/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}


/**
 * Perform bulk action on users
 * تنفيذ عملية مجمعة على المستخدمين
 */
export async function bulkUserAction(
  data: UserBulkActionPayload
): Promise<ApiResponse<void>> {
  return adminFetch<void>('/users/bulk-action/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


/**
 * Get user statistics
 * الحصول على إحصائيات المستخدمين
 */
export async function getUserStats(): Promise<ApiResponse<UserStats>> {
  return adminFetch<UserStats>('/users/stats/')
}

