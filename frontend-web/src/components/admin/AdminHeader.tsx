'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAdminAuth, adminFetch } from '@/lib/admin'
import { useLanguage } from '@/lib/i18n/context'
import { useNotifications } from '@/lib/admin/hooks/useNotifications'
import { useUIStore } from '@/store/uiStore'
import type { Notification as NotificationType } from '@/lib/admin/types/notifications'

// =============================================================================
// Types & Interfaces
// =============================================================================

interface AdminHeaderProps {
  title?: string
  titleAr?: string
  subtitle?: string
  subtitleAr?: string
}

// Notification interface is now imported from types

// =============================================================================
// Icons
// =============================================================================

// Icon Components (functions that return JSX)
// مكونات الأيقونات (دوال ترجع JSX)
const Icons = {
  search: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  notification: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  sun: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5 dark:text-yellow-400"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  moon: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5 dark:text-blue-300"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  globe: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  logout: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  user: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  order: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  chevronDown: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  check: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  close: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

// =============================================================================
// Helper Functions
// دوال مساعدة
// =============================================================================

/**
 * Format timestamp to relative time
 * تنسيق الطابع الزمني إلى وقت نسبي
 */
function formatRelativeTime(timestamp: string, language: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (language === 'ar') {
    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays === 1) return 'أمس'
    if (diffDays < 7) return `منذ ${diffDays} أيام`
    return date.toLocaleDateString('ar-SY')
  } else {
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US')
  }
}

// =============================================================================
// Sub-Components
// =============================================================================

function SearchBar() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    products: Array<{ id: number; name: string; name_ar?: string }>
    users: Array<{ id: number; full_name: string; email: string }>
    orders: Array<{ id: number; order_number: string; customer_name: string }>
    vendors: Array<{ id: number; name: string; name_ar?: string }>
  }>({
    products: [],
    users: [],
    orders: [],
    vendors: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounced search function
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ products: [], users: [], orders: [], vendors: [] })
      setShowResults(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Search in parallel across all endpoints using adminFetch
        const [productsRes, usersRes, ordersRes, vendorsRes] = await Promise.allSettled([
          adminFetch(`/products/?search=${encodeURIComponent(query)}&page_size=3`),
          adminFetch(`/users/?search=${encodeURIComponent(query)}&page_size=3`),
          adminFetch(`/orders/?search=${encodeURIComponent(query)}&page_size=3`),
          adminFetch(`/vendors/?search=${encodeURIComponent(query)}&page_size=3`),
        ])

        const newResults = {
          products: [],
          users: [],
          orders: [],
          vendors: [],
        }

        if (productsRes.status === 'fulfilled' && productsRes.value.success && productsRes.value.data?.results) {
          newResults.products = productsRes.value.data.results
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.success && usersRes.value.data?.results) {
          newResults.users = usersRes.value.data.results
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.success && ordersRes.value.data?.results) {
          newResults.orders = ordersRes.value.data.results
        }

        if (vendorsRes.status === 'fulfilled' && vendorsRes.value.success && vendorsRes.value.data?.results) {
          newResults.vendors = vendorsRes.value.data.results
        }

        setResults(newResults)
        setShowResults(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleResultClick = (type: 'products' | 'users' | 'orders' | 'vendors', id: number) => {
    setQuery('')
    setShowResults(false)
    setIsExpanded(false)
    
    switch (type) {
      case 'products':
        router.push(`/admin/products?id=${id}`)
        break
      case 'users':
        router.push(`/admin/users?id=${id}`)
        break
      case 'orders':
        router.push(`/admin/orders?id=${id}`)
        break
      case 'vendors':
        router.push(`/admin/vendors?id=${id}`)
        break
    }
  }

  const totalResults = results.products.length + results.users.length + results.orders.length + results.vendors.length

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 400 : 44 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center bg-historical-stone/50 dark:bg-gray-800/50 rounded-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden transition-colors duration-300"
      >
        <button
          onClick={() => {
            setIsExpanded(!isExpanded)
            if (isExpanded) {
              setQuery('')
              setShowResults(false)
            }
          }}
          className="p-2.5 text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 transition-colors"
        >
          {Icons.search()}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center"
            >
              <input
                type="text"
                placeholder={t.admin.header.search || (language === 'ar' ? 'ابحث عن منتجات، مستخدمين، طلبات...' : 'Search products, users, orders...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                className="flex-1 bg-transparent py-2.5 pl-4 pr-2 text-sm text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/40 dark:placeholder:text-gray-500 outline-none transition-colors duration-300"
                autoFocus
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-historical-gold/30 border-t-historical-gold rounded-full animate-spin mr-2" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isExpanded && showResults && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-300 max-h-[500px] overflow-y-auto custom-scrollbar"
          >
            {totalResults === 0 && !isSearching ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-historical-gold/10 dark:bg-gray-700/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-historical-gold/50 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-1 transition-colors duration-300">
                  {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {language === 'ar' 
                    ? `لم يتم العثور على "${query}" في المنتجات، المستخدمين، الطلبات أو البائعين`
                    : `No results found for "${query}" in products, users, orders or vendors`}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {/* Products */}
                {results.products.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-2 text-xs font-semibold text-historical-charcoal/60 dark:text-gray-400 uppercase">
                      {language === 'ar' ? 'المنتجات' : 'Products'}
                    </h4>
                    {results.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick('products', product.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate">
                            {language === 'ar' && product.name_ar ? product.name_ar : product.name}
                          </p>
                        </div>
                        {Icons.search({ className: "w-4 h-4 text-historical-charcoal/30 dark:text-gray-500" })}
                      </button>
                    ))}
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-2 text-xs font-semibold text-historical-charcoal/60 dark:text-gray-400 uppercase">
                      {language === 'ar' ? 'المستخدمين' : 'Users'}
                    </h4>
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleResultClick('users', user.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        {Icons.user({ className: "w-4 h-4 text-historical-charcoal/30 dark:text-gray-500" })}
                      </button>
                    ))}
                  </div>
                )}

                {/* Orders */}
                {results.orders.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-2 text-xs font-semibold text-historical-charcoal/60 dark:text-gray-400 uppercase">
                      {language === 'ar' ? 'الطلبات' : 'Orders'}
                    </h4>
                    {results.orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleResultClick('orders', order.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate">
                            {order.customer_name}
                          </p>
                        </div>
                        {Icons.order({ className: "w-4 h-4 text-historical-charcoal/30 dark:text-gray-500" })}
                      </button>
                    ))}
                  </div>
                )}

                {/* Vendors */}
                {results.vendors.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-2 text-xs font-semibold text-historical-charcoal/60 dark:text-gray-400 uppercase">
                      {language === 'ar' ? 'البائعين' : 'Vendors'}
                    </h4>
                    {results.vendors.map((vendor) => (
                      <button
                        key={vendor.id}
                        onClick={() => handleResultClick('vendors', vendor.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors text-right"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate">
                            {language === 'ar' && vendor.name_ar ? vendor.name_ar : vendor.name}
                          </p>
                        </div>
                        {Icons.user({ className: "w-4 h-4 text-historical-charcoal/30 dark:text-gray-500" })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowResults(false)
              setIsExpanded(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NotificationDropdown() {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  
  // Use notifications hook with auto-refresh every 30 seconds
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead: markAsReadAPI,
    markAllAsRead: markAllAsReadAPI,
    refreshNotifications,
  } = useNotifications(30000, { limit: 20 })

  // Refresh when dropdown opens
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

  const getNotificationIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'order': return Icons.order({ className: "w-4 h-4" })
      case 'user': return Icons.user({ className: "w-4 h-4" })
      case 'vendor': return Icons.user({ className: "w-4 h-4" })
      case 'product': 
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        )
      case 'category':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        )
      default: return Icons.notification({ className: "w-4 h-4" })
    }
  }

  const getNotificationColor = (type: NotificationType['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-500/10 text-blue-600'
      case 'user': return 'bg-green-500/10 text-green-600'
      case 'vendor': return 'bg-purple-500/10 text-purple-600'
      case 'product': return 'bg-orange-500/10 text-orange-600'
      case 'category': return 'bg-indigo-500/10 text-indigo-600'
      default: return 'bg-historical-gold/10 text-historical-gold'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-historical-charcoal/60 dark:text-yellow-400 hover:text-historical-charcoal dark:hover:text-yellow-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-all duration-200"
      >
        {Icons.notification()}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount}
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
              className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                <h3 className="font-semibold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{t.admin.header.notifications}</h3>
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
                    <p>{t.admin.header.noNotifications}</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    // Use Arabic message if available and language is Arabic
                    const message = (language === 'ar' && notification.message_ar) 
                      ? notification.message_ar 
                      : notification.message
                    
                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        className={`
                          flex items-start gap-3 px-4 py-3 border-b border-historical-gold/5 dark:border-gray-700/50
                          hover:bg-historical-gold/5 dark:hover:bg-gray-700/50 transition-colors cursor-pointer
                          ${!notification.is_read ? 'bg-historical-gold/5 dark:bg-gray-700/30' : ''}
                        `}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''} text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}>
                            {message}
                          </p>
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-0.5 transition-colors duration-300">
                            {formatRelativeTime(notification.timestamp, language)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-historical-gold mt-2" />
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                <button className="w-full text-center text-sm text-historical-gold hover:text-historical-red transition-colors">
                  {t.admin.header.viewAll}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const { language } = useLanguage()
  
  // Determine if dark mode is active
  // تحديد ما إذا كان الوضع الداكن نشطاً
  const isDark = theme === 'dark' || (
    theme === 'system' && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  
  const toggleTheme = useCallback(() => {
    // Toggle between light and dark (skip system for simplicity)
    // التبديل بين الفاتح والداكن (تخطي النظام للبساطة)
    const newTheme = (theme === 'light' || theme === 'system') ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Apply theme immediately to document
    // تطبيق المظهر فوراً على المستند
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, setTheme])
  
  // Apply theme when it changes
  // تطبيق المظهر عند تغييره
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (theme === 'system') {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl text-historical-charcoal/60 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-all duration-200"
      title={
        language === 'ar' 
          ? (isDark ? 'الوضع الفاتح' : 'الوضع الداكن')
          : (isDark ? 'Light Mode' : 'Dark Mode')
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? Icons.moon() : Icons.sun()}
        </motion.div>
      </AnimatePresence>
    </button>
  )
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  const isArabic = language === 'ar'

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex items-center gap-3 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-historical-gold/30 dark:border-gray-600 hover:border-historical-gold/50 dark:hover:border-gray-500 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
      title={isArabic ? 'Switch to English' : 'التبديل للعربية'}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-historical-gold/5 to-historical-red/5 dark:from-yellow-900/20 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Content wrapper */}
      <div className="relative flex items-center gap-2.5 z-10">
        {/* Arabic option */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: isArabic ? 1.2 : 1,
              opacity: isArabic ? 1 : 0.4,
            }}
            transition={{ duration: 0.2 }}
            className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
          >
            ع
          </motion.div>
          <span className={`text-xs font-semibold transition-colors duration-200 ${isArabic ? 'text-historical-charcoal dark:text-gray-200' : 'text-historical-charcoal/40 dark:text-gray-500'}`}>
            عربي
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-historical-charcoal/20 dark:bg-gray-600 transition-colors duration-200" />

        {/* Toggle Switch - Simple Design */}
        <div className="relative w-11 h-6 rounded-full bg-historical-charcoal/15 dark:bg-gray-700 p-0.5 transition-colors duration-200">
          <motion.div
            className="w-5 h-5 rounded-full bg-white dark:bg-gray-600 shadow-md transition-colors duration-200"
            animate={{
              x: isArabic ? 0 : 20,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-historical-charcoal/20 dark:bg-gray-600 transition-colors duration-200" />

        {/* English option */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold transition-colors duration-200 ${!isArabic ? 'text-historical-charcoal dark:text-gray-200' : 'text-historical-charcoal/40 dark:text-gray-500'}`}>
            EN
          </span>
          <motion.div
            animate={{
              scale: !isArabic ? 1.2 : 1,
              opacity: !isArabic ? 1 : 0.4,
            }}
            transition={{ duration: 0.2 }}
            className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
          >
            EN
          </motion.div>
        </div>
      </div>
    </motion.button>
  )
}

function UserMenu() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, logout } = useAdminAuth()

  // Handle logout
  // معالجة تسجيل الخروج
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Handle profile navigation
  // معالجة التنقل إلى الملف الشخصي
  const handleProfileClick = () => {
    setIsOpen(false)
    router.push('/admin/users')
  }

  // Handle settings navigation
  // معالجة التنقل إلى الإعدادات
  const handleSettingsClick = () => {
    setIsOpen(false)
    router.push('/admin/settings')
  }

  // Get user initials for avatar
  // الحصول على الأحرف الأولى للصورة الرمزية
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'A'
  }

  // Get role display name
  // الحصول على اسم الدور للعرض
  const getRoleDisplay = () => {
    if (language === 'ar') {
      switch (user?.role) {
        case 'super_admin':
          return 'مدير عام'
        case 'admin':
          return 'مدير النظام'
        case 'moderator':
          return 'مشرف'
        default:
          return 'مستخدم'
      }
    } else {
      switch (user?.role) {
        case 'super_admin':
          return 'Super Admin'
        case 'admin':
          return 'Admin'
        case 'moderator':
          return 'Moderator'
        default:
          return 'User'
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">{getInitials()}</span>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
            {user?.full_name || 'Admin'}
          </p>
          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{getRoleDisplay()}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300"
        >
          {Icons.chevronDown()}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-soft-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-300"
            >
              {/* User Info */}
              <div className="p-3 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate transition-colors duration-300">
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate transition-colors duration-300">
                  {user?.email || 'admin@yallabuy.com'}
                </p>
              </div>
              
              <div className="p-2">
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
                >
                  {Icons.user()}
                  <span>{t.admin.header.profile || (language === 'ar' ? 'الملف الشخصي' : 'Profile')}</span>
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
                >
                  {Icons.search()}
                  <span>{t.admin.header.settings || (language === 'ar' ? 'الإعدادات' : 'Settings')}</span>
                </button>
              </div>
              <div className="border-t border-historical-gold/10 dark:border-gray-700 p-2 transition-colors duration-300">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <svg className="w-5 h-5 animate-spin\" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    Icons.logout()
                  )}
                  <span>{isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function AdminHeader({ title, titleAr, subtitle, subtitleAr }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title Section */}
        <div>
          {(titleAr || title) && (
            <h1 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {titleAr || title}
            </h1>
          )}
          {(subtitleAr || subtitle) && (
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mt-0.5 transition-colors duration-300">
              {subtitleAr || subtitle}
            </p>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2">
          <SearchBar />
          <div className="w-px h-6 bg-historical-gold/20 mx-2 hidden sm:block" />
          <NotificationDropdown />
          <ThemeToggle />
          <LanguageToggle />
          <div className="w-px h-6 bg-historical-gold/20 mx-2 hidden sm:block" />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

