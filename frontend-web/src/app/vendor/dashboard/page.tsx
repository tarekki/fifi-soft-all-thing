'use client'

/**
 * Vendor Dashboard Page
 * صفحة لوحة تحكم البائع
 * 
 * Overview dashboard matching Admin Dashboard design:
 * - KPI cards (Sales, Orders, Products, Visits)
 * - Sales trend chart
 * - Recent orders table
 * - Tips & insights
 * 
 * لوحة تحكم شاملة مطابقة لتصميم لوحة تحكم الأدمن:
 * - بطاقات المؤشرات الرئيسية
 * - رسم بياني لاتجاهات المبيعات
 * - جدول آخر الطلبات
 * - نصائح ورؤى
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useLanguage } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { Plus, History } from 'lucide-react'
import { getVendorDashboardOverview, exportVendorReport, getVendorRecentOrders, type VendorRecentOrder } from '@/lib/vendor/api'
import { useVendorAuth } from '@/lib/vendor'
import type { VendorDashboardOverview } from '@/lib/vendor/types'

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
  color: 'gold' | 'blue' | 'green' | 'purple'
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
  products: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  visits: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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
  plus: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
function formatCurrency(value: number, locale: string = 'ar-SY', currencySymbol: string = 'ل.س'): string {
  if (locale === 'ar-SY') {
    return new Intl.NumberFormat('ar-SY', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(value) + ' ' + currencySymbol
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(value) + ' ' + (currencySymbol === 'ل.س' ? 'SYP' : currencySymbol)
  }
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
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipping: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }
  return styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

/**
 * Get status label (translated)
 * الحصول على اسم الحالة (مترجم)
 */
function getStatusLabel(status: string, t: any): string {
  const labels: Record<string, string> = {
    pending: t.vendor.status?.pending || 'قيد الانتظار',
    processing: t.vendor.status?.processing || 'قيد المعالجة',
    shipping: t.vendor.status?.shipping || 'قيد الشحن',
    delivered: t.vendor.status?.delivered || 'تم التسليم',
    cancelled: t.vendor.status?.cancelled || 'ملغي',
    completed: t.vendor.status?.completed || 'مكتمل',
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
  
  if (diffMins < 1) return t.vendor.time?.now || 'الآن'
  if (diffMins < 60) return (t.vendor.time?.minutesAgo || 'منذ {n} دقيقة').replace('{n}', diffMins.toString())
  if (diffHours < 24) return (t.vendor.time?.hoursAgo || 'منذ {n} ساعة').replace('{n}', diffHours.toString())
  if (diffDays === 1) return t.vendor.time?.yesterday || 'أمس'
  if (diffDays < 7) return (t.vendor.time?.daysAgo || 'منذ {n} أيام').replace('{n}', diffDays.toString())
  
  return date.toLocaleDateString(t.vendor.time?.locale || 'ar-SA')
}

/**
 * Generate simple text report from dashboard data
 * إنشاء تقرير نصي بسيط من بيانات لوحة التحكم
 */
function generateSimpleReport(
  data: VendorDashboardOverview,
  t: any,
  language: string
): string {
  const currency = t.common?.currency || 'ل.س'
  const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US')
  
  const report = [
    '='.repeat(50),
    language === 'ar' ? 'تقرير البائع' : 'Vendor Report',
    '='.repeat(50),
    '',
    `${language === 'ar' ? 'تاريخ التقرير:' : 'Report Date:'} ${date}`,
    '',
    '-'.repeat(50),
    language === 'ar' ? 'إحصائيات المبيعات' : 'Sales Statistics',
    '-'.repeat(50),
    `${language === 'ar' ? 'إجمالي المبيعات:' : 'Total Sales:'} ${formatCurrency(data.total_sales, language === 'ar' ? 'ar-SY' : 'en-US', currency)}`,
    `${language === 'ar' ? 'التغيير من الشهر الماضي:' : 'Change from Last Month:'} ${data.total_sales_change > 0 ? '+' : ''}${data.total_sales_change.toFixed(2)}%`,
    `${language === 'ar' ? 'مبيعات اليوم:' : 'Today Sales:'} ${formatCurrency(data.today_sales, language === 'ar' ? 'ar-SY' : 'en-US', currency)}`,
    '',
    '-'.repeat(50),
    language === 'ar' ? 'إحصائيات الطلبات' : 'Orders Statistics',
    '-'.repeat(50),
    `${language === 'ar' ? 'إجمالي الطلبات:' : 'Total Orders:'} ${data.total_orders}`,
    `${language === 'ar' ? 'التغيير من الشهر الماضي:' : 'Change from Last Month:'} ${data.total_orders_change > 0 ? '+' : ''}${data.total_orders_change.toFixed(2)}%`,
    `${language === 'ar' ? 'طلبات اليوم:' : 'Today Orders:'} ${data.today_orders}`,
    `${language === 'ar' ? 'طلبات قيد الانتظار:' : 'Pending Orders:'} ${data.pending_orders}`,
    `${language === 'ar' ? 'طلبات قيد المعالجة:' : 'Processing Orders:'} ${data.processing_orders}`,
    '',
    '-'.repeat(50),
    language === 'ar' ? 'إحصائيات المنتجات' : 'Products Statistics',
    '-'.repeat(50),
    `${language === 'ar' ? 'إجمالي المنتجات:' : 'Total Products:'} ${data.total_products}`,
    `${language === 'ar' ? 'المنتجات النشطة:' : 'Active Products:'} ${data.active_products}`,
    `${language === 'ar' ? 'منتجات قليلة المخزون:' : 'Low Stock Products:'} ${data.low_stock_products}`,
    `${language === 'ar' ? 'منتجات نفد المخزون:' : 'Out of Stock Products:'} ${data.out_of_stock_products}`,
    '',
    '-'.repeat(50),
    language === 'ar' ? 'إحصائيات الزيارات' : 'Visits Statistics',
    '-'.repeat(50),
    `${language === 'ar' ? 'إجمالي الزيارات:' : 'Total Visits:'} ${data.total_visits}`,
    `${language === 'ar' ? 'التغيير من الأسبوع الماضي:' : 'Change from Last Week:'} ${data.total_visits_change > 0 ? '+' : ''}${data.total_visits_change.toFixed(2)}%`,
    `${language === 'ar' ? 'زيارات اليوم:' : 'Today Visits:'} ${data.today_visits}`,
    '',
    '='.repeat(50),
    language === 'ar' ? 'نهاية التقرير' : 'End of Report',
    '='.repeat(50),
  ]
  
  return report.join('\n')
}

/**
 * Get KPI color classes
 * الحصول على ألوان مؤشرات الأداء
 */
function getKPIColorClasses(color: KPICard['color']) {
  const colors = {
    gold: {
      bg: 'bg-gradient-to-br from-historical-gold/20 to-historical-gold/5',
      icon: 'bg-historical-gold/20 text-historical-gold dark:bg-historical-gold/30 dark:text-yellow-400',
      border: 'border-historical-gold/20 dark:border-historical-gold/30',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
      icon: 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-400',
      border: 'border-blue-500/10 dark:border-blue-500/20',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500/10 to-green-500/5',
      icon: 'bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400',
      border: 'border-green-500/10 dark:border-green-500/20',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500/10 to-purple-500/5',
      icon: 'bg-purple-500/20 text-purple-600 dark:bg-purple-500/30 dark:text-purple-400',
      border: 'border-purple-500/10 dark:border-purple-500/20',
    },
  }
  return colors[color]
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
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border ${colors.border}
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
            ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}
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
  const chartData = data?.labels.map((label, index) => ({
    label,
    value: data.revenue[index] || 0,
  })) || []
  
  const maxValue = Math.max(...chartData.map(d => d.value), 1)
  const { t, language } = useLanguage()

  const periodLabels = {
    week: t.vendor.period?.week || 'أسبوع',
    month: t.vendor.period?.month || 'شهر',
    year: t.vendor.period?.year || 'سنة',
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.vendor.salesTrend}</h3>
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
          {Array.from({ length: 7 }).map((_, i) => {
            // Use fixed heights based on index to avoid hydration mismatch
            // استخدام ارتفاعات ثابتة بناءً على الفهرس لتجنب عدم تطابق الـ hydration
            const heights = [60, 75, 90, 45, 55, 80, 70] // Fixed percentages
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"
                  style={{ height: `${heights[i] || 50}%` }}
                />
                <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            )
          })}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
          {t.vendor.noData || 'لا توجد بيانات'}
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
                    {formatCurrency(item.value, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
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
  orders: Array<{
    id: string
    customer: string
    date: string
    total: string
    status: string
    statusAr?: string
    orderId?: number
  }>
  isLoading?: boolean 
}) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { dir } = useTranslation()
  
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center justify-between p-6 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
        <div>
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.vendor.recentOrders}</h3>
          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            {isLoading ? t.vendor.loading || 'جاري التحميل...' : (t.vendor.ordersCount || 'عدد الطلبات: {count}').replace('{count}', orders.length.toString())}
          </p>
        </div>
        <button 
          onClick={() => router.push('/vendor/orders')}
          className="text-sm text-historical-gold dark:text-yellow-400 hover:text-historical-red dark:hover:text-yellow-300 transition-colors font-medium cursor-pointer"
        >
          {t.vendor.viewAll || 'عرض الكل'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
            <tr>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>{t.vendor.orderId || 'رقم الطلب'}</th>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>{t.vendor.customer || 'العميل'}</th>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>{t.vendor.total || 'الإجمالي'}</th>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>{t.vendor.status || 'الحالة'}</th>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>{t.vendor.date || 'التاريخ'}</th>
              <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  <td className="px-6 py-4"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
                  {t.vendor.noOrders || 'لا توجد طلبات'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{order.customer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                    {order.total}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)} transition-colors duration-300`}>
                      {dir === 'rtl' && order.statusAr ? order.statusAr : getStatusLabel(order.status, t)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => router.push(`/vendor/orders/${order.orderId || order.id.replace('#', '')}`)}
                      className="p-2 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors"
                      title={t.vendor.viewOrder || 'عرض الطلب'}
                    >
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

// =============================================================================
// Main Component
// =============================================================================

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const router = useRouter()
  const { user } = useVendorAuth()
  
  // Get user name for greeting
  // الحصول على اسم المستخدم للترحيب
  const userName = React.useMemo(() => {
    if (user?.full_name) {
      // Extract first name if full name exists
      // استخراج الاسم الأول إذا كان الاسم الكامل موجوداً
      const firstName = user.full_name.split(' ')[0]
      return firstName
    }
    if (user?.email) {
      // Use email username as fallback
      // استخدام اسم المستخدم من البريد الإلكتروني كبديل
      return user.email.split('@')[0]
    }
    // Default fallback
    // البديل الافتراضي
    return language === 'ar' ? 'البائع' : 'Vendor'
  }, [user, language])
  
  // State management
  // إدارة الحالة
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [dashboardData, setDashboardData] = React.useState<VendorDashboardOverview | null>(null)
  const [recentOrders, setRecentOrders] = React.useState<VendorRecentOrder[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = React.useState(false)
  const [chartPeriod, setChartPeriod] = React.useState<'week' | 'month' | 'year'>('month')
  const [isExporting, setIsExporting] = React.useState(false)
  
  // Fetch dashboard data from API
  // جلب بيانات لوحة التحكم من API
  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await getVendorDashboardOverview()
        
        if (response.success && response.data) {
          setDashboardData(response.data)
        } else {
          setError(response.message || 'فشل جلب بيانات لوحة التحكم / Failed to fetch dashboard data')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error fetching vendor dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  // Fetch recent orders from API
  // جلب الطلبات الأخيرة من API
  React.useEffect(() => {
    async function fetchRecentOrders() {
      try {
        setIsLoadingOrders(true)
        
        const response = await getVendorRecentOrders(10)
        
        if (response.success && response.data) {
          setRecentOrders(response.data)
        }
      } catch (err) {
        console.error('Error fetching recent orders:', err)
        // Don't show error for orders, just use empty array
        // لا تعرض خطأ للطلبات، استخدم مصفوفة فارغة فقط
        setRecentOrders([])
      } finally {
        setIsLoadingOrders(false)
      }
    }
    
    fetchRecentOrders()
  }, [])
  
  // Handle export report
  // معالجة تصدير التقرير
  const handleExportReport = React.useCallback(async () => {
    try {
      setIsExporting(true)
      
      // Try to export from backend first
      // محاولة التصدير من الـ backend أولاً
      try {
        const blob = await exportVendorReport('30days')
        
        // Create download link
        // إنشاء رابط التحميل
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vendor-report-${new Date().toISOString().split('T')[0]}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        return
      } catch (backendError) {
        // If backend export fails, create a simple client-side report
        // إذا فشل تصدير الـ backend، إنشاء تقرير بسيط من جانب العميل
        console.warn('Backend export failed, creating client-side report:', backendError)
      }
      
      // Fallback: Create a simple text report from dashboard data
      // البديل: إنشاء تقرير نصي بسيط من بيانات لوحة التحكم
      if (dashboardData) {
        const reportContent = generateSimpleReport(dashboardData, t, language)
        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vendor-report-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error(t.vendor.noDataToExport || 'لا توجد بيانات للتصدير')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export report'
      setError(errorMessage)
      console.error('Error exporting report:', err)
    } finally {
      setIsExporting(false)
    }
  }, [dashboardData, t, language])
  
  // Build STATS from API data
  // بناء STATS من بيانات API
  const STATS = React.useMemo(() => {
    if (!dashboardData) {
      // Return empty stats while loading
      return [
        {
          id: 'sales',
          title: t.vendor.totalSales || 'إجمالي المبيعات',
          value: '0',
          change: 0,
          changeLabel: t.vendor.fromLastMonth || 'من الشهر الماضي',
          icon: Icons.revenue,
          color: 'gold' as const,
        },
        {
          id: 'orders',
          title: t.vendor.totalOrders || 'إجمالي الطلبات',
          value: '0',
          change: 0,
          changeLabel: t.vendor.fromLastMonth || 'من الشهر الماضي',
          icon: Icons.orders,
          color: 'blue' as const,
        },
        {
          id: 'products',
          title: t.vendor.activeProducts || 'المنتجات النشطة',
          value: '0',
          change: 0,
          changeLabel: t.vendor.stable || 'مستقر',
          icon: Icons.products,
          color: 'green' as const,
        },
        {
          id: 'visits',
          title: t.vendor.shopVisits || 'زيارات المتجر',
          value: '0',
          change: 0,
          changeLabel: t.vendor.fromLastWeek || 'من الأسبوع الماضي',
          icon: Icons.visits,
          color: 'purple' as const,
        },
      ]
    }
    
    return [
      {
        id: 'sales',
        title: t.vendor.totalSales || 'إجمالي المبيعات',
        value: formatCurrency(
          Number(dashboardData.total_sales),
          language === 'ar' ? 'ar-SY' : 'en-US',
          t.common.currency
        ),
        change: dashboardData.total_sales_change,
        changeLabel: t.vendor.fromLastMonth || 'من الشهر الماضي',
        icon: Icons.revenue,
        color: 'gold' as const,
      },
      {
        id: 'orders',
        title: t.vendor.totalOrders || 'إجمالي الطلبات',
        value: formatNumber(dashboardData.total_orders),
        change: dashboardData.total_orders_change,
        changeLabel: t.vendor.fromLastMonth || 'من الشهر الماضي',
        icon: Icons.orders,
        color: 'blue' as const,
      },
      {
        id: 'products',
        title: t.vendor.activeProducts || 'المنتجات النشطة',
        value: formatNumber(dashboardData.active_products),
        change: 0, // Products don't have change percentage from API
        changeLabel: t.vendor.stable || 'مستقر',
        icon: Icons.products,
        color: 'green' as const,
      },
      {
        id: 'visits',
        title: t.vendor.shopVisits || 'زيارات المتجر',
        value: formatNumber(dashboardData.total_visits),
        change: dashboardData.total_visits_change,
        changeLabel: t.vendor.fromLastWeek || 'من الأسبوع الماضي',
        icon: Icons.visits,
        color: 'purple' as const,
      },
    ]
  }, [dashboardData, t, language])

  // Transform recent orders from API to component format
  // تحويل الطلبات الأخيرة من API إلى تنسيق المكون
  const RECENT_ORDERS = React.useMemo(() => {
    return recentOrders.map((order) => ({
      id: order.order_number,
      customer: order.customer_name,
      date: formatRelativeDate(order.created_at, t),
      total: formatCurrency(
        Number(order.total),
        language === 'ar' ? 'ar-SY' : 'en-US',
        t.common.currency
      ),
      status: order.status,
      statusAr: order.status_display,
      orderId: order.id, // Store actual order ID for navigation
    }))
  }, [recentOrders, t, language])

  // Sales chart data - TODO: Replace with API when endpoint is ready
  // بيانات رسم المبيعات - TODO: استبدال بـ API عندما يكون endpoint جاهزاً
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    revenue: [120000, 190000, 300000, 250000, 220000, 350000, 280000],
  }
  
  // Show error message if API call failed
  // عرض رسالة خطأ إذا فشلت استدعاء API
  if (error && !isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6"
        >
          <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">
            {t.vendor.error || 'خطأ'}
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error}
          </p>
        </motion.div>
      </motion.div>
    )
  }

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
            {t.vendor.welcomeBack?.replace('{name}', userName) || (language === 'ar' ? `مرحباً بك، ${userName}` : `Welcome Back, ${userName}`)}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.vendor.performanceToday || 'أداءك اليوم'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/vendor/products?action=add')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/20 text-[#C5A065] dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">{t.vendor.addProduct || 'إضافة منتج'}</span>
          </button>
          <button
            onClick={handleExportReport}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <History className={`w-5 h-5 ${isExporting ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isExporting 
                ? (t.vendor.exporting || 'جاري التصدير...') 
                : (t.vendor.exportReport || 'تصدير تقرير')
              }
            </span>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((card) => (
          <KPICardComponent key={card.id} card={card} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart
            data={salesChartData}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-6">
          {/* Tips Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-historical-gold opacity-10 dark:opacity-20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity" />
            <h4 className="text-historical-gold dark:text-yellow-400 font-black uppercase tracking-widest text-xs mb-4 transition-colors duration-300">
              {t.vendor.tipOfDay || 'نصيحة اليوم'}
            </h4>
            <p className="font-medium text-historical-charcoal dark:text-gray-200 leading-relaxed transition-colors duration-300">
              {dir === 'rtl'
                ? <>لقد نفذت كمية <b className="text-historical-charcoal dark:text-gray-100">"حذاء فيفي أطفال - أحمر"</b>. قم بتحديث المخزون الآن لضمان عدم ضياع أي طلبات محتملة.</>
                : <>The stock for <b className="text-historical-charcoal dark:text-gray-100">"Fifi Kids Shoes - Red"</b> is out. Update inventory now to avoid losing potential orders.</>
              }
            </p>
            <button className="mt-6 w-full py-3 bg-historical-gold dark:bg-yellow-600 text-white dark:text-white font-black rounded-xl hover:scale-105 transition-all text-sm">
              {t.vendor.updateStock || 'تحديث المخزون'}
            </button>
          </motion.div>

          {/* Response Rate Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft transition-colors duration-300"
          >
            <h4 className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs mb-6 transition-colors duration-300">
              {t.vendor.responseSpeed || 'سرعة الاستجابة'}
            </h4>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
                {t.vendor.responseRate || 'معدل الاستجابة'}
              </span>
              <span className="font-bold text-green-500 dark:text-green-400 transition-colors duration-300">98%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden transition-colors duration-300">
              <div className="w-[98%] h-full bg-green-500 dark:bg-green-600 rounded-full transition-colors duration-300" />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-4 italic font-medium transition-colors duration-300">
              {t.vendor.keepItUp || 'استمر في الأداء الممتاز!'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={RECENT_ORDERS} isLoading={isLoading || isLoadingOrders} />
    </motion.div>
  )
}
