/**
 * Shared Types
 * الأنواع المشتركة
 * 
 * This file contains shared types used across multiple admin modules.
 * هذا الملف يحتوي على أنواع مشتركة مستخدمة عبر وحدات الإدارة المختلفة.
 */

// =============================================================================
// Target Reference
// مرجع الهدف
// =============================================================================

/**
 * Target reference for navigation (used in notifications, activities, etc.)
 * مرجع الهدف للتنقل (يستخدم في الإشعارات، النشاطات، إلخ)
 */
export interface TargetRef {
  type: string
  id: number
  action?: string | null
}

