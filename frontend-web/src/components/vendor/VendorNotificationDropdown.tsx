'use client'

/**
 * Vendor Notification Dropdown Component
 * مكون قائمة إشعارات البائع المنسدلة
 * 
 * Displays a dropdown with vendor notifications.
 * يعرض قائمة منسدلة بإشعارات البائع.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useVendorNotifications } from '@/lib/vendor/hooks/useVendorNotifications'
import { useRouter } from 'next/navigation'
import { Bell, Package, ShoppingBag, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VendorNotification } from '@/lib/vendor/api'

// =============================================================================
// Helper Functions
// دوال مساعدة
// =============================================================================

/**
 * Format relative time
 * تنسيق الوقت النسبي
 */
function formatRelativeTime(dateStr: string, language: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return language === 'ar' ? 'الآن' : 'Now'
  if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
  if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
  if (diffDays === 1) return language === 'ar' ? 'أمس' : 'Yesterday'
  if (diffDays < 7) return language === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays}d ago`
  
  return date.toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get notification icon
 * الحصول على أيقونة الإشعار
 */
function getNotificationIcon(type: VendorNotification['type']) {
  switch (type) {
    case 'order':
      return <ShoppingBag className="w-4 h-4" />
    case 'product':
      return <Package className="w-4 h-4" />
    case 'system':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Bell className="w-4 h-4" />
  }
}

/**
 * Get notification color classes
 * الحصول على classes الألوان للإشعار
 */
function getNotificationColor(type: VendorNotification['type']): string {
  switch (type) {
    case 'order':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'product':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
    case 'system':
      return 'bg-historical-gold/10 text-historical-gold dark:text-yellow-400'
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get navigation URL from notification
 * الحصول على رابط التنقل من الإشعار
 */
function getNotificationUrl(notification: VendorNotification): string | null {
  if (notification.target_type === 'order' && notification.target_id) {
    return `/vendor/orders/${notification.target_id}`
  }
  if (notification.target_type === 'product' && notification.target_id) {
    return `/vendor/products/${notification.target_id}`
  }
  return null
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export function VendorNotificationDropdown() {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Use notifications hook with auto-refresh every 30 seconds
  // استخدام خطاف الإشعارات مع التحديث التلقائي كل 30 ثانية
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead: markAsReadAPI,
    markAllAsRead: markAllAsReadAPI,
    refreshNotifications,
  } = useVendorNotifications(30000, { limit: 20 })

  // Refresh when dropdown opens
  // التحديث عند فتح القائمة المنسدلة
  useEffect(() => {
    if (isOpen) {
      refreshNotifications()
    }
  }, [isOpen, refreshNotifications])

  const markAsRead = useCallback(async (id: string | number) => {
    await markAsReadAPI(id)
  }, [markAsReadAPI])

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadAPI()
  }, [markAllAsReadAPI])

  const handleNotificationClick = useCallback((notification: VendorNotification) => {
    // Mark as read
    // تحديد كمقروء
    markAsRead(notification.id)
    
    // Navigate if URL exists
    // التنقل إذا كان الرابط موجوداً
    const url = getNotificationUrl(notification)
    if (url) {
      router.push(url)
      setIsOpen(false)
    }
  }, [markAsRead, router])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
        aria-label={language === 'ar' ? 'الإشعارات' : 'Notifications'}
        title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-historical-charcoal dark:group-hover:text-gray-200 transition-colors" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-2 h-2 bg-red-500 dark:bg-red-400 border-2 border-white dark:border-gray-800 rounded-full transition-colors duration-300"
          />
        )}
        {unreadCount > 0 && unreadCount <= 99 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 dark:bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
        {unreadCount > 99 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 dark:bg-red-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-800"
          >
            99+
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-300",
                dir === 'rtl' ? 'left-0' : 'right-0'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                <h3 className="font-semibold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                  {t.vendor.notifications || 'الإشعارات'}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-historical-gold hover:text-historical-red transition-colors"
                  >
                    {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {isLoading && notifications.length === 0 ? (
                  <div className="p-8 text-center text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-historical-gold dark:border-gray-500 mb-2"></div>
                    <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                    <p>{t.vendor.noNotifications || 'لا توجد إشعارات'}</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    // Use Arabic message if available and language is Arabic
                    // استخدام الرسالة العربية إذا كانت متاحة واللغة عربية
                    const message = (language === 'ar' && notification.message_ar)
                      ? notification.message_ar
                      : notification.message

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-historical-gold/5 dark:border-gray-700/50",
                          "hover:bg-historical-gold/5 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                          !notification.is_read && "bg-historical-gold/5 dark:bg-gray-700/30"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn("p-2 rounded-lg shrink-0", getNotificationColor(notification.type))}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300",
                            !notification.is_read && "font-medium"
                          )}>
                            {message}
                          </p>
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-0.5 transition-colors duration-300">
                            {formatRelativeTime(notification.timestamp, language)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-historical-gold dark:bg-yellow-400 rounded-full shrink-0 mt-2" />
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      router.push('/vendor/notifications')
                    }}
                    className="text-xs text-historical-gold hover:text-historical-charcoal dark:hover:text-gray-200 transition-colors w-full text-center"
                  >
                    {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

