'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { useAdminAuth } from '@/lib/admin/context'

// =============================================================================
// Types & Interfaces
// =============================================================================

interface NavItem {
  id: string
  label: string
  labelAr: string
  icon: React.ReactNode
  href?: string
  children?: NavItem[]
  roles?: string[] // Roles allowed to see this item (empty means all admin roles)
}

interface AdminSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// =============================================================================
// Icons (Inline SVG for cleaner code)
// =============================================================================

// Icon Components (functions that return JSX)
// مكونات الأيقونات (دوال ترجع JSX)
const Icons = {
  dashboard: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  settings: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  categories: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
    </svg>
  ),
  products: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  vendors: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  orders: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  shoppingCart: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a4.5 4.5 0 01-4.884-4.248l1.209-4.54m0 0A4.5 4.5 0 015.378 3h12.75a4.5 4.5 0 013.244 1.438l-4.5 16.5m-2.25-16.5H5.25m0 0h3.75m-3.75 0a3 3 0 00-3 3v1.5m0 0V18a3 3 0 003 3h12.75m-9.75-3h9.75m-9.75 0a3 3 0 01-3-3m3 3v-9.75m0 0H5.25m0 0h3.75m-3.75 0a3 3 0 00-3 3v9.75" />
    </svg>
  ),
  users: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  promotions: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  reports: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  chevronDown: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronRight: (props?: { className?: string }) => (
    <svg className={props?.className || "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  collapse: (props?: { className?: string }) => (
    <svg className={props?.className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
    </svg>
  ),
}

// =============================================================================
// Navigation Structure
// =============================================================================

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    icon: Icons.dashboard(),
    href: '/admin/dashboard',
    roles: ['admin', 'content_manager', 'order_manager', 'support'],
  },
  {
    id: 'settings',
    label: 'Site Settings',
    labelAr: 'إعدادات الموقع',
    icon: Icons.settings(),
    roles: ['admin'],
    children: [
      { id: 'settings-general', label: 'General', labelAr: 'عام', icon: Icons.settings(), href: '/admin/settings/general' },
      { id: 'settings-seo', label: 'SEO', labelAr: 'تحسين البحث', icon: Icons.settings(), href: '/admin/settings/seo' },
      { id: 'settings-contact', label: 'Contact', labelAr: 'التواصل', icon: Icons.settings(), href: '/admin/settings/contact' },
      { id: 'settings-social', label: 'Social Links', labelAr: 'الروابط الاجتماعية', icon: Icons.settings(), href: '/admin/settings/social' },
      { id: 'settings-languages', label: 'Languages', labelAr: 'اللغات', icon: Icons.settings(), href: '/admin/settings/languages' },
      { id: 'settings-navigation', label: 'Navigation', labelAr: 'القوائم', icon: Icons.settings(), href: '/admin/settings/navigation' },
      { id: 'settings-payments', label: 'Payments', labelAr: 'طرق الدفع', icon: Icons.settings(), href: '/admin/settings/payments' },
      { id: 'settings-shipping', label: 'Shipping', labelAr: 'الشحن', icon: Icons.settings(), href: '/admin/settings/shipping' },
    ],
  },
  {
    id: 'categories',
    label: 'Categories',
    labelAr: 'الفئات',
    icon: Icons.categories(),
    href: '/admin/categories',
    roles: ['admin', 'content_manager'],
  },
  {
    id: 'products',
    label: 'Products',
    labelAr: 'المنتجات',
    icon: Icons.products(),
    href: '/admin/products',
    roles: ['admin', 'content_manager'],
  },
  {
    id: 'vendors',
    label: 'Vendors',
    labelAr: 'البائعون',
    icon: Icons.vendors(),
    href: '/admin/vendors',
    roles: ['admin', 'support'],
  },
  {
    id: 'vendor-applications',
    label: 'Vendor Applications',
    labelAr: 'طلبات الانضمام',
    icon: Icons.vendors(),
    href: '/admin/vendor-applications',
    roles: ['admin', 'support'],
  },
  {
    id: 'orders',
    label: 'Orders',
    labelAr: 'الطلبات',
    icon: Icons.orders(),
    href: '/admin/orders',
    roles: ['admin', 'order_manager'],
  },
  {
    id: 'carts',
    label: 'Carts',
    labelAr: 'السلل',
    icon: Icons.shoppingCart(),
    href: '/admin/carts',
    roles: ['admin', 'order_manager'],
  },
  {
    id: 'users',
    label: 'Users',
    labelAr: 'المخدمون',
    labelAr: 'المستخدمون',
    icon: Icons.users(),
    href: '/admin/users',
    roles: ['admin', 'support'],
  },
  {
    id: 'promotions',
    label: 'Promotions',
    labelAr: 'العروض',
    icon: Icons.promotions(),
    roles: ['admin', 'content_manager'],
    children: [
      { id: 'promo-banners', label: 'Banners', labelAr: 'البانرات', icon: Icons.promotions(), href: '/admin/promotions/banners' },
      { id: 'promo-stories', label: 'Stories', labelAr: 'القصص', icon: Icons.promotions(), href: '/admin/promotions/stories' },
      { id: 'promo-coupons', label: 'Coupons', labelAr: 'الكوبونات', icon: Icons.promotions(), href: '/admin/promotions/coupons' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    labelAr: 'التقارير',
    icon: Icons.reports(),
    href: '/admin/reports',
    roles: ['admin', 'order_manager'],
  },
]

// =============================================================================
// Sub-Components
// =============================================================================

interface NavItemComponentProps {
  item: NavItem
  isCollapsed: boolean
  isActive: boolean
  pathname: string
}

function NavItemComponent({ item, isCollapsed, isActive, pathname }: NavItemComponentProps) {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-open if any child is active
    return item.children?.some(child => child.href === pathname) ?? false
  })

  const hasChildren = item.children && item.children.length > 0
  const isChildActive = hasChildren && item.children.some(child => child.href === pathname)

  const toggleOpen = useCallback(() => {
    if (hasChildren) {
      setIsOpen(prev => !prev)
    }
  }, [hasChildren])
  
  const displayLabel = language === 'ar' ? item.labelAr : item.label

  // Base styles
  const baseStyles = `
    group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
    transition-all duration-200 ease-out cursor-pointer
  `

  // Active/Hover styles
  const activeStyles = isActive || isChildActive
    ? 'bg-gradient-to-l from-historical-gold/20 dark:from-historical-gold/30 to-historical-gold/5 dark:to-gray-700/50 text-historical-charcoal dark:text-gray-100 border-r-2 border-historical-gold dark:border-gray-600'
    : 'text-historical-charcoal/70 dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 hover:text-historical-charcoal dark:hover:text-gray-100'

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={toggleOpen}
          className={`${baseStyles} ${activeStyles} w-full justify-between`}
          title={isCollapsed ? displayLabel : undefined}
        >
          <span className="flex items-center gap-3">
            <span className="flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {displayLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          {!isCollapsed && (
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {Icons.chevronDown()}
            </motion.span>
          )}
        </button>

        {/* Children */}
        <AnimatePresence>
          {isOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mr-4 mt-1 border-r-2 border-historical-gold/20 dark:border-gray-700/50 pr-2 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.id}
                    href={child.href!}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      transition-all duration-150
                      ${pathname === child.href
                        ? 'bg-historical-gold/15 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-100 font-medium'
                        : 'text-historical-charcoal/60 dark:text-gray-400 hover:bg-historical-gold/8 dark:hover:bg-gray-700/30 hover:text-historical-charcoal dark:hover:text-gray-200'
                      }
                    `}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {language === 'ar' ? child.labelAr : child.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={`${baseStyles} ${activeStyles}`}
      title={isCollapsed ? displayLabel : undefined}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {displayLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function AdminSidebar({ isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAdminAuth()

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

  // Get user display name
  // الحصول على اسم المستخدم للعرض
  const getUserDisplayName = () => {
    if (user?.full_name) {
      return user.full_name
    }
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user?.first_name) {
      return user.first_name
    }
    return 'Admin'
  }

  // Get user email
  // الحصول على إيميل المستخدم
  const getUserEmail = () => {
    return user?.email || 'admin@yallabuy.com'
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-screen sticky top-0 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-historical-gold/20 dark:border-gray-700 shadow-soft-xl overflow-hidden transition-colors duration-300"
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="font-bold text-historical-charcoal dark:text-gray-100 text-lg leading-tight transition-colors duration-300">Yalla Buy</h1>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">لوحة التحكم</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-historical-gold to-historical-red flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">Y</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className={`
            p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200
            hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-all duration-200
            ${isCollapsed ? 'mx-auto mt-2' : ''}
          `}
          title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {Icons.collapse()}
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navigationItems
          .filter(item => {
            if (!item.roles || item.roles.length === 0) return true
            return user?.role && item.roles.includes(user.role)
          })
          .map(item => (
            <NavItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={item.href === pathname}
              pathname={pathname}
            />
          ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-historical-gold/5 dark:bg-gray-700/50 transition-colors duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-historical-blue to-historical-charcoal flex items-center justify-center">
                <span className="text-white text-sm font-medium">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate transition-colors duration-300">{getUserDisplayName()}</p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate transition-colors duration-300">{getUserEmail()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

