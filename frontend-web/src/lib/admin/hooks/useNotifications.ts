/**
 * useNotifications Hook
 * خطاف الإشعارات
 * 
 * هذا الخطاف يوفر إدارة حالة الإشعارات مع التحديث التلقائي.
 * This hook provides notifications state management with auto-refresh.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadAPI,
  markAllAsRead as markAllAsReadAPI,
  markMultipleAsRead,
  getNotificationStats,
} from '../api/notifications'
import type {
  Notification,
  NotificationFilters,
  NotificationStats,
} from '../types/notifications'

// =============================================================================
// Types
// الأنواع
// =============================================================================

interface UseNotificationsReturn {
  // Data
  notifications: Notification[]
  unreadCount: number
  stats: NotificationStats | null
  
  // State
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>
  refreshNotifications: () => Promise<void>
  markAsRead: (id: string | number) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  markMultipleAsRead: (ids: (string | number)[]) => Promise<boolean>
  fetchStats: () => Promise<void>
  clearError: () => void
}

// =============================================================================
// Hook Implementation
// تنفيذ الخطاف
// =============================================================================

export function useNotifications(
  autoRefreshInterval?: number, // in milliseconds, e.g., 30000 for 30 seconds
  initialFilters?: NotificationFilters
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const filtersRef = useRef<NotificationFilters | undefined>(initialFilters)

  // ===========================================================================
  // Fetch Notifications
  // جلب الإشعارات
  // ===========================================================================
  
  const fetchNotifications = useCallback(async (customFilters?: NotificationFilters) => {
    const filters = customFilters || filtersRef.current || {}
    filtersRef.current = filters
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getNotifications(filters)
      
      if (response.success && response.data) {
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unread_count || 0)
      } else {
        throw new Error(response.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to fetch notifications:', errorMessage)
      setError(errorMessage)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ===========================================================================
  // Refresh Notifications
  // تحديث الإشعارات
  // ===========================================================================
  
  const refreshNotifications = useCallback(async () => {
    setIsRefreshing(true)
    // Don't clear error on refresh - keep previous error if exists
    // لا تمسح الخطأ عند التحديث - احتفظ بالخطأ السابق إذا كان موجوداً
    
    try {
      // Fetch both notifications and unread count
      // جلب كل من الإشعارات وعدد غير المقروءة
      const [notificationsRes, unreadRes] = await Promise.all([
        getNotifications(filtersRef.current),
        getUnreadCount(),
      ])
      
      // Clear error on successful refresh
      // مسح الخطأ عند التحديث الناجح
      if (notificationsRes.success || unreadRes.success) {
        setError(null)
      }
      
      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data.notifications || [])
        setUnreadCount(notificationsRes.data.unread_count || 0)
      } else if (!notificationsRes.success) {
        // Only set error if it's not a session expired error (to avoid spam)
        // تعيين الخطأ فقط إذا لم يكن خطأ انتهاء الجلسة (لتجنب الإزعاج)
        if (!notificationsRes.message?.includes('Session expired') && 
            !notificationsRes.message?.includes('login again')) {
          setError(notificationsRes.message || 'Failed to refresh notifications')
        }
      }
      
      if (unreadRes.success && unreadRes.data) {
        setUnreadCount(unreadRes.data.unread_count || 0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      // Only log and set error if it's not a session expired error
      // تسجيل وتعيين الخطأ فقط إذا لم يكن خطأ انتهاء الجلسة
      if (!errorMessage.includes('Session expired') && 
          !errorMessage.includes('login again')) {
        console.error('Failed to refresh notifications:', errorMessage)
        setError(errorMessage)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // ===========================================================================
  // Mark as Read
  // تحديد كمقروء
  // ===========================================================================
  
  const markAsRead = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const response = await markAsReadAPI(id)
      
      if (response.success) {
        // Update local state optimistically
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      return false
    }
  }, [])

  // ===========================================================================
  // Mark All as Read
  // تحديد الكل كمقروء
  // ===========================================================================
  
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const response = await markAllAsReadAPI()
      
      if (response.success) {
        // Update local state optimistically
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      return false
    }
  }, [])

  // ===========================================================================
  // Mark Multiple as Read
  // تحديد عدة إشعارات كمقروءة
  // ===========================================================================
  
  const markMultipleAsReadAction = useCallback(async (
    ids: (string | number)[]
  ): Promise<boolean> => {
    try {
      const response = await markMultipleAsRead({ notification_ids: ids })
      
      if (response.success) {
        // Update local state optimistically
        setNotifications(prev =>
          prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - ids.length))
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to mark multiple notifications as read:', err)
      return false
    }
  }, [])

  // ===========================================================================
  // Fetch Stats
  // جلب الإحصائيات
  // ===========================================================================
  
  const fetchStats = useCallback(async () => {
    try {
      const response = await getNotificationStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err)
    }
  }, [])

  // ===========================================================================
  // Clear Error
  // مسح الخطأ
  // ===========================================================================
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ===========================================================================
  // Auto Refresh
  // التحديث التلقائي
  // ===========================================================================
  
  useEffect(() => {
    // Initial fetch
    fetchNotifications()
    
    // Set up auto-refresh if interval is provided
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refreshNotifications()
      }, autoRefreshInterval)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoRefreshInterval, fetchNotifications, refreshNotifications])

  // ===========================================================================
  // Return
  // الإرجاع
  // ===========================================================================
  
  return {
    notifications,
    unreadCount,
    stats,
    isLoading,
    isRefreshing,
    error,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead: markMultipleAsReadAction,
    fetchStats,
    clearError,
  }
}

