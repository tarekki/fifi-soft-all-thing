/**
 * Admin Notifications API
 * واجهة برمجة الإشعارات للإدارة
 * 
 * This file contains API functions for notification management.
 * هذا الملف يحتوي على دوال API لإدارة الإشعارات.
 * 
 * Features:
 * - Get notifications list
 * - Get unread notifications count
 * - Mark notification as read
 * - Mark all notifications as read
 * - Get notification statistics
 * 
 * الميزات:
 * - الحصول على قائمة الإشعارات
 * - الحصول على عدد الإشعارات غير المقروءة
 * - تحديد إشعار كمقروء
 * - تحديد جميع الإشعارات كمقروءة
 * - الحصول على إحصائيات الإشعارات
 * 
 * @author Yalla Buy Team
 */

import type { ApiResponse } from '../types'
import type {
  Notification,
  NotificationFilters,
  NotificationStats,
  NotificationResponse,
  MarkAsReadPayload,
} from '../types/notifications'
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
    
    if (data.access) {
      saveTokens(data.access, refreshToken)
      return data.access
    }
    
    return null
  } catch {
    return null
  }
}

// =============================================================================
// Notification API Functions
// دوال API الإشعارات
// =============================================================================

/**
 * Get notifications list
 * الحصول على قائمة الإشعارات
 * 
 * @param filters - Filter options (is_read, type, limit, offset)
 * @returns Promise with notifications list
 */
export async function getNotifications(
  filters?: NotificationFilters
): Promise<ApiResponse<NotificationResponse>> {
  const params = new URLSearchParams()
  
  if (filters?.is_read !== undefined) {
    params.append('is_read', filters.is_read.toString())
  }
  if (filters?.type) {
    params.append('type', filters.type)
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString())
  }
  if (filters?.offset) {
    params.append('offset', filters.offset.toString())
  }
  
  const queryString = params.toString()
  const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`
  
  return adminFetch<NotificationResponse>(endpoint)
}

/**
 * Get unread notifications count
 * الحصول على عدد الإشعارات غير المقروءة
 * 
 * @returns Promise with unread count
 */
export async function getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
  return adminFetch<{ unread_count: number }>('/notifications/unread-count/')
}

/**
 * Mark notification as read
 * تحديد إشعار كمقروء
 * 
 * @param notificationId - Notification ID
 * @returns Promise with success status
 */
export async function markAsRead(
  notificationId: string | number
): Promise<ApiResponse<{ success: boolean }>> {
  return adminFetch<{ success: boolean }>(`/notifications/${notificationId}/mark-as-read/`, {
    method: 'POST',
  })
}

/**
 * Mark multiple notifications as read
 * تحديد عدة إشعارات كمقروءة
 * 
 * @param payload - Array of notification IDs
 * @returns Promise with success status
 */
export async function markMultipleAsRead(
  payload: MarkAsReadPayload
): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
  return adminFetch<{ success: boolean; marked_count: number }>('/notifications/mark-as-read/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Mark all notifications as read
 * تحديد جميع الإشعارات كمقروءة
 * 
 * @returns Promise with success status
 */
export async function markAllAsRead(): Promise<ApiResponse<{ success: boolean; marked_count: number }>> {
  return adminFetch<{ success: boolean; marked_count: number }>('/notifications/mark-all-as-read/', {
    method: 'POST',
  })
}

/**
 * Get notification statistics
 * الحصول على إحصائيات الإشعارات
 * 
 * @returns Promise with notification stats
 */
export async function getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
  return adminFetch<NotificationStats>('/notifications/stats/')
}

