/**
 * useVendorNotifications Hook
 * خطاف إشعارات البائع
 * 
 * هذا الخطاف يوفر إدارة حالة إشعارات البائع مع التحديث التلقائي.
 * This hook provides vendor notifications state management with auto-refresh.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getVendorNotifications,
  getVendorUnreadCount,
  markVendorNotificationAsRead,
  markAllVendorNotificationsAsRead,
  markMultipleVendorNotificationsAsRead,
  getVendorNotificationStats,
  type VendorNotificationFilters,
  type VendorNotification,
  type VendorNotificationStats,
} from '../api'

// =============================================================================
// Types
// الأنواع
// =============================================================================

interface UseVendorNotificationsReturn {
  // Data
  notifications: VendorNotification[]
  unreadCount: number
  stats: VendorNotificationStats | null
  
  // State
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Actions
  fetchNotifications: (filters?: VendorNotificationFilters) => Promise<void>
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

export function useVendorNotifications(
  autoRefreshInterval?: number, // in milliseconds, e.g., 30000 for 30 seconds
  initialFilters?: VendorNotificationFilters
): UseVendorNotificationsReturn {
  const [notifications, setNotifications] = useState<VendorNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [stats, setStats] = useState<VendorNotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const filtersRef = useRef<VendorNotificationFilters | undefined>(initialFilters)

  // ===========================================================================
  // Fetch Notifications
  // جلب الإشعارات
  // ===========================================================================
  
  const fetchNotifications = useCallback(async (customFilters?: VendorNotificationFilters) => {
    const filters = customFilters || filtersRef.current || {}
    filtersRef.current = filters
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getVendorNotifications(filters)
      
      if (response.success && response.data) {
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unread_count || 0)
      } else {
        throw new Error(response.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to fetch vendor notifications:', errorMessage)
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
    setError(null)
    
    try {
      // Fetch both notifications and unread count
      // جلب كل من الإشعارات وعدد غير المقروءة
      const [notificationsRes, unreadRes] = await Promise.all([
        getVendorNotifications(filtersRef.current),
        getVendorUnreadCount(),
      ])
      
      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data.notifications || [])
        setUnreadCount(notificationsRes.data.unread_count || 0)
      }
      
      if (unreadRes.success && unreadRes.data) {
        setUnreadCount(unreadRes.data.unread_count || 0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to refresh vendor notifications:', errorMessage)
      setError(errorMessage)
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
      const response = await markVendorNotificationAsRead(id)
      
      if (response.success) {
        // Update local state
        // تحديث الحالة المحلية
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
      const response = await markAllVendorNotificationsAsRead()
      
      if (response.success) {
        // Update local state
        // تحديث الحالة المحلية
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
  // تحديد عدة كمقروءة
  // ===========================================================================
  
  const markMultipleAsRead = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    try {
      const response = await markMultipleVendorNotificationsAsRead(ids)
      
      if (response.success && response.data) {
        // Update local state
        // تحديث الحالة المحلية
        setNotifications(prev =>
          prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - (response.data?.marked_count || 0)))
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
      const response = await getVendorNotificationStats()
      
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
  // Auto-refresh Effect
  // تأثير التحديث التلقائي
  // ===========================================================================
  
  useEffect(() => {
    // Initial fetch
    // الجلب الأولي
    fetchNotifications()
    
    // Set up auto-refresh if interval is provided
    // إعداد التحديث التلقائي إذا تم توفير الفترة
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
    markMultipleAsRead,
    fetchStats,
    clearError,
  }
}

