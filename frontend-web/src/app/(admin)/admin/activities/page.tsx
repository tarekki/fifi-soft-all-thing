'use client'

/**
 * Admin Activities Page
 * صفحة الأنشطة
 * 
 * Features / الميزات:
 * - Full activity log with pagination
 * - Filter by activity type
 * - Search activities
 * - Real-time updates
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getRecentActivity } from '@/lib/admin/api'
import type { RecentActivity } from '@/lib/admin/types/dashboard'
import { useLanguage } from '@/lib/i18n/context'

// =============================================================================
// Icons
// الأيقونات
// =============================================================================

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  order: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  product: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  user: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  vendor: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  category: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  vendorApplication: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
}

// =============================================================================
// Animation Variants
// متغيرات الحركة
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

// =============================================================================
// Helper Functions
// الدوال المساعدة
// =============================================================================

function getActivityIcon(type: string) {
  const iconClass = "w-8 h-8 p-1.5 rounded-lg"
  const colorClass = "text-historical-gold dark:text-yellow-400 bg-historical-gold/10 dark:bg-yellow-900/20"
  
  switch (type) {
    case 'order':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.order}</div>
    case 'product':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.product}</div>
    case 'user':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.user}</div>
    case 'vendor':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.vendor}</div>
    case 'category':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.category}</div>
    case 'vendor_application':
      return <div className={`${iconClass} ${colorClass}`}>{Icons.vendorApplication}</div>
    default:
      return <div className={`${iconClass} ${colorClass}`}>{Icons.order}</div>
  }
}

function formatRelativeDate(dateString: string, t: any): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t.admin.dashboard.justNow || 'الآن'
  if (diffMins < 60) return `${diffMins} ${t.admin.dashboard.minutesAgo || 'دقيقة'}`
  if (diffHours < 24) return `${diffHours} ${t.admin.dashboard.hoursAgo || 'ساعة'}`
  if (diffDays < 7) return `${diffDays} ${t.admin.dashboard.daysAgo || 'يوم'}`
  
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function ActivitiesPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [limit, setLimit] = useState(50)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch activities
  const fetchActivities = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await getRecentActivity(limit)
      
      if (response?.success && response?.data) {
        setActivities(response.data)
      } else {
        const errorMsg = response?.message || 'فشل في جلب الأنشطة'
        setError(errorMsg)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الأنشطة'
      setError(message)
      console.error('Activities fetch error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [limit])

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Filter by type
    if (filterType !== 'all') {
      const targetType = activity.target_ref?.type || activity.target_type || ''
      if (targetType !== filterType) return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchableText = [
        activity.action_display,
        activity.target_name,
        activity.user_name,
        activity.user_email,
      ].join(' ').toLowerCase()
      
      if (!searchableText.includes(query)) return false
    }

    return true
  })

  // Get unique activity types
  const activityTypes = Array.from(
    new Set(
      activities.map((a) => a.target_ref?.type || a.target_type || 'other')
    )
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            {t.admin.activities?.title || 'Activity Log'}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.admin.activities?.subtitle || 'View all system activities and events'}
          </p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={() => fetchActivities(true)}
          disabled={isRefreshing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400
            hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors
            disabled:opacity-50
          `}
        >
          <span className={isRefreshing ? 'animate-spin' : ''}>
            {Icons.refresh}
          </span>
          <span className="text-sm font-medium">
            {isRefreshing ? (t.admin.dashboard.refreshing || 'Refreshing...') : (t.admin.dashboard.refresh || 'Refresh')}
          </span>
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {Icons.search}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.admin.activities?.searchPlaceholder || 'Search activities...'}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          >
            <option value="all">{t.admin.activities?.allTypes || 'All Types'}</option>
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Activities List */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
            {t.admin.activities?.noActivities || 'No activities found'}
          </div>
        ) : (
          <div className="divide-y divide-historical-gold/10 dark:divide-gray-700">
            {filteredActivities.map((activity) => {
              const targetType = activity.target_ref?.type || activity.target_type || 'order'
              
              return (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-historical-stone/5 dark:hover:bg-gray-700/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3">
                    {getActivityIcon(targetType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                        <span className="font-medium">{activity.user_name}</span>
                        {' '}
                        {activity.action_display}
                        {activity.target_name && (
                          <span className="font-medium"> - {activity.target_name}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-historical-charcoal/40 dark:text-gray-400 transition-colors duration-300">
                          {formatRelativeDate(activity.timestamp, t)}
                        </p>
                        {activity.user_email && (
                          <p className="text-xs text-historical-charcoal/40 dark:text-gray-400 transition-colors duration-300">
                            {activity.user_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      {!isLoading && (
        <motion.div
          variants={itemVariants}
          className="text-sm text-historical-charcoal/50 dark:text-gray-400 text-center transition-colors duration-300"
        >
          {t.admin.activities?.showing || 'Showing'} {filteredActivities.length} {t.admin.activities?.of || 'of'} {activities.length} {t.admin.activities?.activities || 'activities'}
        </motion.div>
      )}
    </motion.div>
  )
}

