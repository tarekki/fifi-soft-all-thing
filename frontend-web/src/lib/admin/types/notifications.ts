/**
 * Notification Types
 * أنواع الإشعارات
 * 
 * This file contains TypeScript types for notifications.
 * هذا الملف يحتوي على أنواع TypeScript للإشعارات.
 */

// =============================================================================
// Notification Types
// أنواع الإشعارات
// =============================================================================

export type NotificationType = 'order' | 'user' | 'vendor' | 'system' | 'product' | 'category'

export interface Notification {
  id: string | number
  type: NotificationType
  message: string
  message_ar?: string
  time: string
  timestamp: string
  is_read: boolean
  target_id?: string | number
  target_type?: string
  action?: string
  metadata?: Record<string, any>
}

export interface NotificationFilters {
  is_read?: boolean
  type?: NotificationType
  limit?: number
  offset?: number
}

export interface NotificationStats {
  total: number
  unread: number
  by_type: {
    order: number
    user: number
    vendor: number
    system: number
    product: number
    category: number
  }
}

export interface MarkAsReadPayload {
  notification_ids: (string | number)[]
}

export interface NotificationResponse {
  notifications: Notification[]
  unread_count: number
  total_count: number
}

