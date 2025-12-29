/**
 * Notification Types
 * أنواع الإشعارات
 * 
 * This file contains TypeScript types for notifications.
 * هذا الملف يحتوي على أنواع TypeScript للإشعارات.
 */

import type { TargetRef } from './shared'

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
  target_id?: string | number  // Backward compatibility: derived from target_ref
  target_type?: string  // Backward compatibility: derived from target_ref
  target_ref?: TargetRef  // New: structured reference for frontend navigation
  target_label?: string  // New: human-readable label (e.g., order number, product name)
  target_model_label?: string  // New: human-readable model name (e.g., "Order", "Product")
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

