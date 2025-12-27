'use client'

/**
 * Admin Dashboard Page
 * صفحة لوحة التحكم الرئيسية
 * 
 * Overview dashboard with REAL DATA from API:
 * - KPI cards (Sales, Orders, Users, Revenue)
 * - Sales trend chart
 * - Recent orders table
 * - Recent activity log
 * 
 * لوحة تحكم شاملة مع بيانات حقيقية من الـ API:
 * - بطاقات المؤشرات الرئيسية
 * - رسم بياني لاتجاهات المبيعات
 * - جدول آخر الطلبات
 * - سجل النشاط الأخير
 */

import { motion } from 'framer-motion'
import { useDashboard } from '@/lib/admin'
import type { RecentOrder, RecentActivity } from '@/lib/admin'
import { useLanguage } from '@/lib/i18n/context'

// =============================================================================
// Types
// =============================================================================

interface KPICard {
  id: string
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: 'gold' | 'blue' | 'green' | 'red'
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  revenue: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  vendors: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  arrowUp: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
    </svg>
  ),
  arrowDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  refresh: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format number as currency
 * تنسيق الرقم كعملة
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format number with commas
 * تنسيق الرقم بالفواصل
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Get status style classes
 * الحصول على classes حسب الحالة
 */
function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

/**
 * Get status label (translated)
 * الحصول على اسم الحالة (مترجم)
 */
function getStatusLabel(status: string, t: any): string {
  const labels: Record<string, string> = {
    pending: t.admin.dashboard.status?.pending || 'قيد الانتظار',
    processing: t.admin.dashboard.status?.processing || 'قيد المعالجة',
    shipped: t.admin.dashboard.status?.shipped || 'تم الشحن',
    delivered: t.admin.dashboard.status?.delivered || 'تم التسليم',
    cancelled: t.admin.dashboard.status?.cancelled || 'ملغي',
    completed: t.admin.dashboard.status?.completed || 'مكتمل',
  }
  return labels[status] || status
}

/**
 * Format date relative to now (translated)
 * تنسيق التاريخ نسبة للآن (مترجم)
 */
function formatRelativeDate(dateStr: string, t: any): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return t.admin.dashboard.time?.now || 'الآن'
  if (diffMins < 60) return (t.admin.dashboard.time?.minutesAgo || 'منذ {n} دقيقة').replace('{n}', diffMins.toString())
  if (diffHours < 24) return (t.admin.dashboard.time?.hoursAgo || 'منذ {n} ساعة').replace('{n}', diffHours.toString())
  if (diffDays === 1) return t.admin.dashboard.time?.yesterday || 'أمس'
  if (diffDays < 7) return (t.admin.dashboard.time?.daysAgo || 'منذ {n} أيام').replace('{n}', diffDays.toString())
  
  return date.toLocaleDateString(t.admin.dashboard.time?.locale || 'ar-SA')
}

/**
 * Get KPI color classes
 * الحصول على ألوان مؤشرات الأداء
 */
function getKPIColorClasses(color: KPICard['color']) {
  const colors = {
    gold: {
      bg: 'bg-gradient-to-br from-historical-gold/20 to-historical-gold/5',
      icon: 'bg-historical-gold/20 text-historical-gold',
      border: 'border-historical-gold/20',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      icon: 'bg-blue-500/20 text-blue-600',
      border: 'border-blue-500/10',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
      icon: 'bg-green-500/20 text-green-600',
      border: 'border-green-500/10',
    },
    red: {
      bg: 'bg-gradient-to-br from-historical-red/10 to-historical-red/5',
      icon: 'bg-historical-red/20 text-historical-red',
      border: 'border-historical-red/10',
    },
  }
  return colors[color]
}

/**
 * Get activity icon based on type
 * الحصول على أيقونة النشاط حسب النوع
 */
function getActivityIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    order: (
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
        {Icons.orders}
      </div>
    ),
    user: (
      <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
        {Icons.users}
      </div>
    ),
    vendor: (
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
        {Icons.vendors}
      </div>
    ),
    product: (
      <div className="w-8 h-8 rounded-lg bg-historical-gold/10 text-historical-gold flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
    ),
  }
  return icons[type] || icons.order
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * KPI Card Component
 * مكون بطاقة مؤشر الأداء
 */
function KPICardComponent({ card, isLoading }: { card: KPICard; isLoading?: boolean }) {
  const colors = getKPIColorClasses(card.color)
  const isPositive = card.change >= 0

  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="w-16 h-5 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="w-24 h-8 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
          <div className="w-20 h-4 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${colors.border} dark:border-gray-700
        shadow-soft dark:shadow-soft-lg hover:shadow-soft-lg transition-all duration-300
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${colors.bg} opacity-50`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.icon}`}>
            {card.icon}
          </div>
          <div className={`
            flex items-center gap-1 text-sm font-medium
            ${isPositive ? 'text-green-600' : 'text-red-500'}
          `}>
            {isPositive ? Icons.arrowUp : Icons.arrowDown}
            <span>{Math.abs(card.change)}%</span>
          </div>
        </div>

        {/* Value */}
        <p className="text-3xl font-bold text-historical-charcoal dark:text-gray-100 mb-1 transition-colors duration-300">
          {card.value}
        </p>

        {/* Title & Change Label */}
        <p className="text-sm text-historical-charcoal/60 dark:text-gray-300 transition-colors duration-300">{card.title}</p>
        <p className="text-xs text-historical-charcoal/40 dark:text-gray-400 mt-1 transition-colors duration-300">{card.changeLabel}</p>
      </div>
    </motion.div>
  )
}

/**
 * Sales Chart Component
 * مكون رسم المبيعات
 */
function SalesChart({
  data,
  period,
  onPeriodChange,
  isLoading,
}: {
  data: { labels: string[]; revenue: number[] } | null
  period: 'week' | 'month' | 'year'
  onPeriodChange: (period: 'week' | 'month' | 'year') => void
  isLoading?: boolean
}) {
  // Use real data or empty arrays
  const chartData = data?.labels.map((label, index) => ({
    label,
    value: data.revenue[index] || 0,
  })) || []
  
  const maxValue = Math.max(...chartData.map(d => d.value), 1)
  const { t } = useLanguage()

  const periodLabels = {
    week: t.admin.reports.dateRange['7days'] || 'Week',
    month: t.admin.reports.dateRange['30days'] || 'Month',
    year: t.admin.reports.dateRange['year'] || 'Year',
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.dashboard.salesTrend}</h3>
          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            {period === 'week' ? periodLabels.week : period === 'month' ? periodLabels.month : periodLabels.year}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as 'week' | 'month' | 'year')}
          className="text-sm bg-historical-stone/50 dark:bg-gray-700/50 border border-historical-gold/10 dark:border-gray-600 rounded-lg px-3 py-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
        >
          <option value="week">{periodLabels.week}</option>
          <option value="month">{periodLabels.month}</option>
          <option value="year">{periodLabels.year}</option>
        </select>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-end justify-between gap-2 h-48 animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
              <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
          {t.admin.reports.noData}
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2 h-48">
          {chartData.map((item, index) => (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full bg-gradient-to-t from-historical-gold dark:from-yellow-600 to-historical-gold/50 dark:to-yellow-700/50 rounded-t-lg relative group min-h-[4px] transition-colors duration-300"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-historical-charcoal dark:bg-gray-700 text-white dark:text-gray-200 text-xs px-2 py-1 rounded-lg whitespace-nowrap transition-colors duration-300">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </motion.div>
              <span className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate max-w-full transition-colors duration-300">
                {item.label.split('-').pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Recent Orders Table Component
 * مكون جدول الطلبات الأخيرة
 */
function RecentOrdersTable({ 
  orders, 
  isLoading 
}: { 
  orders: RecentOrder[]
  isLoading?: boolean 
}) {
  const { t, language } = useLanguage()
  
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center justify-between p-6 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.dashboard.recentOrders}</h3>
          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            {isLoading ? t.admin.dashboard.loading : (t.admin.dashboard.ordersCount || '').replace('{count}', orders.length.toString())}
          </p>
        </div>
        <button className="text-sm text-historical-gold dark:text-yellow-400 hover:text-historical-red dark:hover:text-yellow-300 transition-colors font-medium">
          {t.admin.dashboard.viewAll}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
            <tr>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300">{t.admin.reports.orderNumber}</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300">{t.admin.reports.customer}</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300">{t.admin.reports.total}</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300">{t.admin.reports.status}</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300">{t.admin.reports.date}</th>
              <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-20 h-6 bg-gray-200 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-8 h-8 bg-gray-200 rounded-lg" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-historical-charcoal/40">
                  {t.admin.dashboard.noOrders}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-historical-gold/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-historical-charcoal">{order.order_number}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal/70">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-historical-charcoal">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status, t)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal/50">
                    {formatRelativeDate(order.created_at, t)}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 rounded-lg text-historical-charcoal/40 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors">
                      {Icons.eye}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

/**
 * Recent Activity List Component
 * مكون قائمة النشاطات الأخيرة
 */
function RecentActivityList({ 
  activities, 
  isLoading 
}: { 
  activities: RecentActivity[]
  isLoading?: boolean 
}) {
  const { t } = useLanguage()
  
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft h-full transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.dashboard.recentActivity}</h3>
          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.dashboard.recentActivity}</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center text-historical-charcoal/40 dark:text-gray-500 py-8 transition-colors duration-300">
            {t.admin.dashboard.noActivity}
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              {getActivityIcon(activity.target_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                  {activity.action_display}
                  {activity.target_name && (
                    <span className="font-medium"> - {activity.target_name}</span>
                  )}
                </p>
                <p className="text-xs text-historical-charcoal/40 dark:text-gray-400 mt-0.5 transition-colors duration-300">
                  {formatRelativeDate(activity.timestamp, t)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-6 text-center text-sm text-historical-gold dark:text-yellow-400 hover:text-historical-red dark:hover:text-yellow-300 transition-colors font-medium">
        {t.admin.dashboard.viewAllActivity}
      </button>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function AdminDashboardPage() {
  const { t, language } = useLanguage()
  
  // Use the dashboard hook with 30 seconds auto-refresh
  // استخدام هوك لوحة التحكم مع تحديث تلقائي كل 30 ثانية
  const {
    overview,
    salesChart,
    recentOrders,
    recentActivity,
    isLoading,
    isRefreshing,
    error,
    chartPeriod,
    refresh,
    setChartPeriod,
  } = useDashboard(30000)

  // Build KPI cards from real data
  // بناء بطاقات مؤشرات الأداء من البيانات الحقيقية
  const kpiCards: KPICard[] = [
    {
      id: 'revenue',
      title: t.admin.dashboard.totalRevenue,
      value: overview ? formatCurrency(overview.total_revenue) : '$0',
      change: overview?.total_revenue_change || 0,
      changeLabel: t.admin.dashboard.fromLastMonth,
      icon: Icons.revenue,
      color: 'gold',
    },
    {
      id: 'orders',
      title: t.admin.dashboard.totalOrders,
      value: overview ? formatNumber(overview.total_orders) : '0',
      change: overview?.total_orders_change || 0,
      changeLabel: t.admin.dashboard.fromLastMonth,
      icon: Icons.orders,
      color: 'blue',
    },
    {
      id: 'users',
      title: t.admin.dashboard.totalUsers,
      value: overview ? formatNumber(overview.total_users) : '0',
      change: overview?.new_users_week || 0,
      changeLabel: t.admin.dashboard.newThisWeek,
      icon: Icons.users,
      color: 'green',
    },
    {
      id: 'vendors',
      title: t.admin.dashboard.activeVendors,
      value: overview ? formatNumber(overview.active_vendors) : '0',
      change: overview?.pending_vendors || 0,
      changeLabel: t.admin.dashboard.pending,
      icon: Icons.vendors,
      color: 'red',
    },
  ]

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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.dashboard.title}</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.admin.dashboard.subtitle}
          </p>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={refresh}
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
            {isRefreshing ? t.admin.dashboard.refreshing : t.admin.dashboard.refresh}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <KPICardComponent key={card.id} card={card} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={salesChart}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RecentActivityList activities={recentActivity} isLoading={isLoading} />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={recentOrders} isLoading={isLoading} />
    </motion.div>
  )
}
