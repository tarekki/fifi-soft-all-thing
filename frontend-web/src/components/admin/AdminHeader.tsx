'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types & Interfaces
// =============================================================================

interface AdminHeaderProps {
  title?: string
  titleAr?: string
  subtitle?: string
  subtitleAr?: string
}

interface Notification {
  id: string
  type: 'order' | 'user' | 'vendor' | 'system'
  message: string
  time: string
  isRead: boolean
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  notification: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  order: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

// =============================================================================
// Mock Data (TODO: Replace with real data from API)
// =============================================================================

const mockNotifications: Notification[] = [
  { id: '1', type: 'order', message: 'طلب جديد #1234 بانتظار المراجعة', time: 'منذ 5 دقائق', isRead: false },
  { id: '2', type: 'vendor', message: 'بائع جديد "متجر الأناقة" بانتظار الموافقة', time: 'منذ 15 دقيقة', isRead: false },
  { id: '3', type: 'user', message: 'تسجيل 25 مستخدم جديد اليوم', time: 'منذ ساعة', isRead: true },
  { id: '4', type: 'system', message: 'تم تحديث النظام بنجاح', time: 'منذ 3 ساعات', isRead: true },
]

// =============================================================================
// Sub-Components
// =============================================================================

function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ width: isExpanded ? 320 : 44 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center bg-historical-stone/50 rounded-xl border border-historical-gold/10 overflow-hidden"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 text-historical-charcoal/50 hover:text-historical-charcoal transition-colors"
        >
          {Icons.search}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="text"
              placeholder="بحث..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent py-2.5 pl-4 text-sm text-historical-charcoal placeholder:text-historical-charcoal/40 outline-none"
              autoFocus
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return Icons.order
      case 'user': return Icons.user
      case 'vendor': return Icons.user
      default: return Icons.notification
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order': return 'bg-blue-500/10 text-blue-600'
      case 'user': return 'bg-green-500/10 text-green-600'
      case 'vendor': return 'bg-purple-500/10 text-purple-600'
      default: return 'bg-historical-gold/10 text-historical-gold'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-historical-charcoal/60 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-all duration-200"
      >
        {Icons.notification}
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
              className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-xl border border-historical-gold/10 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-historical-gold/10 bg-historical-stone/30">
                <h3 className="font-semibold text-historical-charcoal">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-historical-gold hover:text-historical-red transition-colors"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-historical-charcoal/50">
                    <p>لا توجد إشعارات</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <motion.div
                      key={notification.id}
                      layout
                      className={`
                        flex items-start gap-3 px-4 py-3 border-b border-historical-gold/5
                        hover:bg-historical-gold/5 transition-colors cursor-pointer
                        ${!notification.isRead ? 'bg-historical-gold/5' : ''}
                      `}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} text-historical-charcoal`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-historical-charcoal/50 mt-0.5">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-historical-gold mt-2" />
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-historical-gold/10 bg-historical-stone/30">
                <button className="w-full text-center text-sm text-historical-gold hover:text-historical-red transition-colors">
                  عرض جميع الإشعارات
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
  const [isDark, setIsDark] = useState(false)

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2.5 rounded-xl text-historical-charcoal/60 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-all duration-200"
      title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? Icons.moon : Icons.sun}
      </motion.div>
    </button>
  )
}

function LanguageToggle() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')

  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-historical-charcoal/60 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-all duration-200"
      title="تغيير اللغة"
    >
      {Icons.globe}
      <span>{lang === 'ar' ? 'AR' : 'EN'}</span>
    </button>
  )
}

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-historical-gold/10 transition-all duration-200"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-historical-charcoal">Admin</p>
          <p className="text-xs text-historical-charcoal/50">مدير النظام</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-historical-charcoal/40"
        >
          {Icons.chevronDown}
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
              className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-xl border border-historical-gold/10 overflow-hidden z-50"
            >
              <div className="p-2">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-historical-charcoal hover:bg-historical-gold/10 transition-colors">
                  {Icons.user}
                  <span>الملف الشخصي</span>
                </button>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-historical-charcoal hover:bg-historical-gold/10 transition-colors">
                  {Icons.search}
                  <span>الإعدادات</span>
                </button>
              </div>
              <div className="border-t border-historical-gold/10 p-2">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                  {Icons.logout}
                  <span>تسجيل الخروج</span>
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-historical-gold/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title Section */}
        <div>
          {(titleAr || title) && (
            <h1 className="text-xl font-bold text-historical-charcoal">
              {titleAr || title}
            </h1>
          )}
          {(subtitleAr || subtitle) && (
            <p className="text-sm text-historical-charcoal/50 mt-0.5">
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

