/**
 * Admin Vendor Applications API
 * واجهة برمجة طلبات انضمام البائعين للإدارة
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  VendorApplication,
  VendorApplicationDetail,
  VendorApplicationFilters,
  VendorApplicationApprovePayload,
  VendorApplicationRejectPayload,
  VendorApplicationStats,
} from '../types/vendorApplications'
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
// Vendor Applications API Functions
// دوال API طلبات الانضمام
// =============================================================================

/**
 * Get all vendor applications with optional filters
 * جلب جميع طلبات الانضمام مع فلاتر اختيارية
 */
export async function getVendorApplications(
  filters?: VendorApplicationFilters
): Promise<ApiResponse<PaginatedResponse<VendorApplication>>> {
  const params = new URLSearchParams()
  
  if (filters) {
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.business_type) params.append('business_type', filters.business_type)
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.page_size) params.append('page_size', String(filters.page_size))
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `/vendor-applications/?${queryString}` : '/vendor-applications/'
  
  return adminFetch<PaginatedResponse<VendorApplication>>(endpoint)
}


/**
 * Get single vendor application details
 * جلب تفاصيل طلب انضمام واحد
 */
export async function getVendorApplication(
  id: number
): Promise<ApiResponse<VendorApplicationDetail>> {
  return adminFetch<VendorApplicationDetail>(`/vendor-applications/${id}/`)
}


/**
 * Approve a vendor application
 * الموافقة على طلب انضمام
 */
export async function approveVendorApplication(
  id: number,
  data?: VendorApplicationApprovePayload
): Promise<ApiResponse<VendorApplicationDetail>> {
  return adminFetch<VendorApplicationDetail>(`/vendor-applications/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  })
}


/**
 * Reject a vendor application
 * رفض طلب انضمام
 */
export async function rejectVendorApplication(
  id: number,
  data: VendorApplicationRejectPayload
): Promise<ApiResponse<VendorApplicationDetail>> {
  return adminFetch<VendorApplicationDetail>(`/vendor-applications/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}


/**
 * Get vendor application statistics
 * الحصول على إحصائيات طلبات الانضمام
 */
export async function getVendorApplicationStats(): Promise<ApiResponse<VendorApplicationStats>> {
  return adminFetch<VendorApplicationStats>('/vendor-applications/stats/')
}

