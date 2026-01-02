'use client'

/**
 * Vendor Analytics Page
 * صفحة تحليلات البائع
 * 
 * Comprehensive analytics dashboard with:
 * - Overview metrics (AOV, CLV, conversion rate)
 * - Sales analytics with charts
 * - Product analytics (top products, category breakdown)
 * - Customer analytics (growth, top customers)
 * - Time analysis (hourly, day of week, monthly)
 * - Period comparison
 * 
 * لوحة تحكم تحليلات شاملة مع:
 * - مؤشرات نظرة عامة (AOV, CLV, معدل التحويل)
 * - تحليلات المبيعات مع الرسوم البيانية
 * - تحليلات المنتجات (أفضل المنتجات، توزيع الفئات)
 * - تحليلات الزبائن (النمو، أفضل الزبائن)
 * - التحليل الزمني (ساعات، أيام الأسبوع، شهري)
 * - مقارنة الفترات
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Clock,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  getVendorAnalyticsOverview,
  getVendorSalesAnalytics,
  getVendorProductAnalytics,
  getVendorCustomerAnalytics,
  getVendorTimeAnalysis,
  getVendorComparisonAnalytics,
} from '@/lib/vendor/api'
import type {
  VendorAnalyticsOverview,
  VendorSalesAnalytics,
  VendorProductAnalytics,
  VendorCustomerAnalytics,
  VendorTimeAnalysis,
  VendorComparisonAnalytics,
} from '@/lib/vendor/types'

// =============================================================================
// Animation Variants
// متغيرات الحركة
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
    transition: {
      duration: 0.5,
    },
  },
}

// =============================================================================
// Helper Functions
// دوال مساعدة
// =============================================================================

function formatCurrency(value: string | number, locale: string = 'ar-SY', currencySymbol: string = 'ل.س'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0 ' + currencySymbol
  
  if (locale === 'ar-SY') {
    return new Intl.NumberFormat('ar-SY', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue) + ' ' + currencySymbol
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue) + ' ' + (currencySymbol === 'ل.س' ? 'SYP' : currencySymbol)
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-SY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// =============================================================================
// Chart Components
// مكونات الرسوم البيانية
// =============================================================================

/**
 * Bar Chart Component
 * مكون الرسم البياني العمودي
 */
function BarChart({
  data,
  labels,
  maxValue,
  color = 'gold',
  isLoading,
}: {
  data: number[]
  labels: string[]
  maxValue: number
  color?: 'gold' | 'blue' | 'green' | 'purple'
  isLoading?: boolean
}) {
  const colorClasses = {
    gold: 'from-historical-gold dark:from-yellow-600 to-historical-gold/50 dark:to-yellow-700/50',
    blue: 'from-blue-500 dark:from-blue-600 to-blue-500/50 dark:to-blue-700/50',
    green: 'from-green-500 dark:from-green-600 to-green-500/50 dark:to-green-700/50',
    purple: 'from-purple-500 dark:from-purple-600 to-purple-500/50 dark:to-purple-700/50',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-historical-gold" />
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-2 h-64">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
              'w-full bg-gradient-to-t rounded-t-lg relative group min-h-[4px] transition-colors duration-300',
              colorClasses[color]
            )}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-historical-charcoal dark:bg-gray-700 text-white dark:text-gray-200 text-xs px-2 py-1 rounded-lg whitespace-nowrap transition-colors duration-300">
                {formatNumber(value)}
              </div>
            </div>
          </motion.div>
          <span className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate max-w-full transition-colors duration-300 text-center">
            {labels[index]?.split('-').pop() || labels[index]}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Line Chart Component
 * مكون الرسم البياني الخطي
 */
function LineChart({
  data,
  labels,
  maxValue,
  color = 'gold',
  isLoading,
}: {
  data: number[]
  labels: string[]
  maxValue: number
  color?: 'gold' | 'blue' | 'green' | 'purple'
  isLoading?: boolean
}) {
  const colorClasses = {
    gold: 'stroke-historical-gold dark:stroke-yellow-400',
    blue: 'stroke-blue-500 dark:stroke-blue-400',
    green: 'stroke-green-500 dark:stroke-green-400',
    purple: 'stroke-purple-500 dark:stroke-purple-400',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-historical-gold" />
      </div>
    )
  }

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - (value / maxValue) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="relative h-64">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          strokeWidth="2"
          className={colorClasses[color]}
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1 || 1)) * 100
          const y = 100 - (value / maxValue) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              className={colorClasses[color]}
              fill="currentColor"
            />
          )
        })}
      </svg>
    </div>
  )
}

// =============================================================================
// Metric Card Component
// مكون بطاقة المؤشر
// =============================================================================

function MetricCard({
  title,
  value,
  change,
  icon,
  color = 'gold',
  isLoading,
}: {
  title: string
  value: string
  change: number | null
  icon: React.ReactNode
  color?: 'gold' | 'blue' | 'green' | 'purple'
  isLoading?: boolean
}) {
  const colorClasses = {
    gold: 'bg-historical-gold/10 dark:bg-yellow-900/20 border-historical-gold/20 dark:border-yellow-800/30',
    blue: 'bg-blue-500/10 dark:bg-blue-900/20 border-blue-500/20 dark:border-blue-800/30',
    green: 'bg-green-500/10 dark:bg-green-900/20 border-green-500/20 dark:border-green-800/30',
    purple: 'bg-purple-500/10 dark:bg-purple-900/20 border-purple-500/20 dark:border-purple-800/30',
  }

  const iconColorClasses = {
    gold: 'text-historical-gold dark:text-yellow-400',
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-green-500 dark:text-green-400',
    purple: 'text-purple-500 dark:text-purple-400',
  }

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border transition-colors duration-300',
        colorClasses[color]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>
          {icon}
        </div>
        {change !== null && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-semibold',
            change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercentage(change)}
          </div>
        )}
      </div>
      <h3 className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
        {title}
      </h3>
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-historical-gold" />
      ) : (
        <p className={cn('text-2xl font-bold transition-colors duration-300', iconColorClasses[color])}>
          {value}
        </p>
      )}
    </motion.div>
  )
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function AnalyticsPage() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = React.useState<'overview' | 'sales' | 'products' | 'customers' | 'time' | 'comparison'>('overview')
  
  // Date range state
  const [dateFrom, setDateFrom] = React.useState<string>('')
  const [dateTo, setDateTo] = React.useState<string>('')
  const [period, setPeriod] = React.useState<'week' | 'month' | 'quarter' | 'year'>('month')
  
  // Data state
  const [overview, setOverview] = React.useState<VendorAnalyticsOverview | null>(null)
  const [salesData, setSalesData] = React.useState<VendorSalesAnalytics | null>(null)
  const [productsData, setProductsData] = React.useState<VendorProductAnalytics | null>(null)
  const [customersData, setCustomersData] = React.useState<VendorCustomerAnalytics | null>(null)
  const [timeData, setTimeData] = React.useState<VendorTimeAnalysis | null>(null)
  const [comparisonData, setComparisonData] = React.useState<VendorComparisonAnalytics | null>(null)
  
  // Loading state
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch data function
  const fetchData = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const filters = {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        period: period,
      }

      // Fetch data based on active tab
      if (activeTab === 'overview') {
        const res = await getVendorAnalyticsOverview(filters)
        if (res?.success && res?.data) {
          setOverview(res.data)
        } else {
          setError(res?.message || 'Failed to fetch overview')
        }
      } else if (activeTab === 'sales') {
        const res = await getVendorSalesAnalytics(filters)
        if (res?.success && res?.data) {
          setSalesData(res.data)
        } else {
          setError(res?.message || 'Failed to fetch sales analytics')
        }
      } else if (activeTab === 'products') {
        const res = await getVendorProductAnalytics({ ...filters, limit: 10 })
        if (res?.success && res?.data) {
          setProductsData(res.data)
        } else {
          setError(res?.message || 'Failed to fetch product analytics')
        }
      } else if (activeTab === 'customers') {
        const res = await getVendorCustomerAnalytics({ ...filters, limit: 10 })
        if (res?.success && res?.data) {
          setCustomersData(res.data)
        } else {
          setError(res?.message || 'Failed to fetch customer analytics')
        }
      } else if (activeTab === 'time') {
        const res = await getVendorTimeAnalysis(filters)
        if (res?.success && res?.data) {
          setTimeData(res.data)
        } else {
          setError(res?.message || 'Failed to fetch time analysis')
        }
      } else if (activeTab === 'comparison') {
        const res = await getVendorComparisonAnalytics(filters)
        if (res?.success && res?.data) {
          setComparisonData(res.data)
        } else {
          setError(res?.message || 'Failed to fetch comparison analytics')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMessage)
      console.error('Error fetching analytics:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [activeTab, dateFrom, dateTo, period])

  // Fetch data on mount and when filters change
  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle tab change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true)
  }

  // Quick date filters
  const setQuickDateFilter = (days: number) => {
    const today = new Date()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - days)
    setDateFrom(fromDate.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-historical-charcoal dark:text-white transition-colors duration-300">
            {t.vendor.analytics || 'التحليلات'}
          </h1>
          <p className="text-historical-charcoal/70 dark:text-gray-300 mt-2 transition-colors duration-300">
            {t.vendor.analyticsDescription || 'تحليلات شاملة لأداء متجرك'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 rounded-xl hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors duration-300 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            {t.vendor.refresh || 'تحديث'}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-historical-gold/10 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-historical-charcoal/70 dark:text-gray-300" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-historical-gold/20 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-historical-charcoal dark:text-white"
            />
            <span className="text-historical-charcoal/70 dark:text-gray-300">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-historical-gold/20 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-historical-charcoal dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="px-3 py-2 border border-historical-gold/20 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-historical-charcoal dark:text-white"
            >
              <option value="week">{t.vendor.period?.week || 'أسبوع'}</option>
              <option value="month">{t.vendor.period?.month || 'شهر'}</option>
              <option value="quarter">{t.vendor.period?.quarter || 'ربع'}</option>
              <option value="year">{t.vendor.period?.year || 'سنة'}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickDateFilter(7)}
              className="px-3 py-1 text-sm bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 rounded-lg hover:bg-historical-gold/20 transition-colors"
            >
              {t.vendor.last7Days || 'آخر 7 أيام'}
            </button>
            <button
              onClick={() => setQuickDateFilter(30)}
              className="px-3 py-1 text-sm bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 rounded-lg hover:bg-historical-gold/20 transition-colors"
            >
              {t.vendor.last30Days || 'آخر 30 يوم'}
            </button>
            <button
              onClick={() => setQuickDateFilter(90)}
              className="px-3 py-1 text-sm bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 rounded-lg hover:bg-historical-gold/20 transition-colors"
            >
              {t.vendor.last90Days || 'آخر 90 يوم'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-historical-gold/10 dark:border-gray-700">
        {[
          { id: 'overview', label: t.vendor.overview || 'نظرة عامة', icon: BarChart3 },
          { id: 'sales', label: t.vendor.sales || 'المبيعات', icon: DollarSign },
          { id: 'products', label: t.vendor.products || 'المنتجات', icon: Package },
          { id: 'customers', label: t.vendor.customers || 'الزبائن', icon: Users },
          { id: 'time', label: t.vendor.timeAnalysis || 'التحليل الزمني', icon: Clock },
          { id: 'comparison', label: t.vendor.comparison || 'المقارنة', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors duration-300',
              activeTab === tab.id
                ? 'border-historical-gold dark:border-yellow-400 text-historical-gold dark:text-yellow-400'
                : 'border-transparent text-historical-charcoal/70 dark:text-gray-300 hover:text-historical-gold dark:hover:text-yellow-400'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab overview={overview} isLoading={isLoading} language={language} t={t} />
      )}
      {activeTab === 'sales' && (
        <SalesTab salesData={salesData} isLoading={isLoading} language={language} t={t} />
      )}
      {activeTab === 'products' && (
        <ProductsTab productsData={productsData} isLoading={isLoading} language={language} t={t} />
      )}
      {activeTab === 'customers' && (
        <CustomersTab customersData={customersData} isLoading={isLoading} language={language} t={t} />
      )}
      {activeTab === 'time' && (
        <TimeTab timeData={timeData} isLoading={isLoading} language={language} t={t} />
      )}
      {activeTab === 'comparison' && (
        <ComparisonTab comparisonData={comparisonData} isLoading={isLoading} language={language} t={t} />
      )}
    </motion.div>
  )
}

// =============================================================================
// Tab Components
// مكونات التبويبات
// =============================================================================

function OverviewTab({
  overview,
  isLoading,
  language,
  t,
}: {
  overview: VendorAnalyticsOverview | null
  isLoading: boolean
  language: string
  t: any
}) {
  const metrics = React.useMemo(() => {
    if (!overview) return []
    
    return [
      {
        title: t.vendor.totalRevenue || 'إجمالي الإيرادات',
        value: formatCurrency(overview.total_revenue, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency),
        change: overview.revenue_change,
        icon: <DollarSign className="w-6 h-6" />,
        color: 'gold' as const,
      },
      {
        title: t.vendor.averageOrderValue || 'متوسط قيمة الطلب',
        value: formatCurrency(overview.average_order_value, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency),
        change: null,
        icon: <ShoppingBag className="w-6 h-6" />,
        color: 'blue' as const,
      },
      {
        title: t.vendor.totalOrders || 'إجمالي الطلبات',
        value: formatNumber(overview.total_orders),
        change: overview.orders_change,
        icon: <ShoppingBag className="w-6 h-6" />,
        color: 'green' as const,
      },
      {
        title: t.vendor.totalCustomers || 'إجمالي الزبائن',
        value: formatNumber(overview.total_customers),
        change: null,
        icon: <Users className="w-6 h-6" />,
        color: 'purple' as const,
      },
      {
        title: t.vendor.customerLifetimeValue || 'قيمة العميل مدى الحياة',
        value: overview.customer_lifetime_value 
          ? formatCurrency(overview.customer_lifetime_value, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)
          : 'N/A',
        change: null,
        icon: <Users className="w-6 h-6" />,
        color: 'blue' as const,
      },
      {
        title: t.vendor.repeatCustomerRate || 'معدل تكرار الشراء',
        value: overview.repeat_customer_rate !== null 
          ? `${overview.repeat_customer_rate.toFixed(1)}%`
          : 'N/A',
        change: null,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'green' as const,
      },
    ]
  }, [overview, language, t])

  return (
    <motion.div variants={containerVariants} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
            isLoading={isLoading}
          />
        ))}
      </div>
    </motion.div>
  )
}

function SalesTab({
  salesData,
  isLoading,
  language,
  t,
}: {
  salesData: VendorSalesAnalytics | null
  isLoading: boolean
  language: string
  t: any
}) {
  const revenueData = React.useMemo(() => {
    if (!salesData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: salesData.revenue.map(r => parseFloat(r)),
      labels: salesData.labels,
      maxValue: Math.max(...salesData.revenue.map(r => parseFloat(r)), 1),
    }
  }, [salesData])

  const ordersData = React.useMemo(() => {
    if (!salesData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: salesData.orders,
      labels: salesData.labels,
      maxValue: Math.max(...salesData.orders, 1),
    }
  }, [salesData])

  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {/* Summary Cards */}
      {salesData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title={t.vendor.totalRevenue || 'إجمالي الإيرادات'}
            value={formatCurrency(salesData.total_revenue, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
            change={null}
            icon={<DollarSign className="w-6 h-6" />}
            color="gold"
            isLoading={false}
          />
          <MetricCard
            title={t.vendor.totalOrders || 'إجمالي الطلبات'}
            value={formatNumber(salesData.total_orders)}
            change={null}
            icon={<ShoppingBag className="w-6 h-6" />}
            color="blue"
            isLoading={false}
          />
          <MetricCard
            title={t.vendor.averageOrderValue || 'متوسط قيمة الطلب'}
            value={formatCurrency(salesData.average_order_value_overall, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
            change={null}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
            isLoading={false}
          />
        </div>
      )}

      {/* Charts */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.revenueChart || 'رسم بياني الإيرادات'}
        </h3>
        <BarChart
          data={revenueData.data}
          labels={revenueData.labels}
          maxValue={revenueData.maxValue}
          color="gold"
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.ordersChart || 'رسم بياني الطلبات'}
        </h3>
        <BarChart
          data={ordersData.data}
          labels={ordersData.labels}
          maxValue={ordersData.maxValue}
          color="blue"
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  )
}

function ProductsTab({
  productsData,
  isLoading,
  language,
  t,
}: {
  productsData: VendorProductAnalytics | null
  isLoading: boolean
  language: string
  t: any
}) {
  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {/* Top Products */}
      {productsData && (
        <>
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
            <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
              {t.vendor.topProducts || 'أفضل المنتجات'}
            </h3>
            <div className="space-y-4">
              {productsData.top_products.map((product) => (
                <div key={product.product_id} className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    {product.product_image && (
                      <img src={product.product_image} alt={product.product_name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div>
                      <h4 className="font-semibold text-historical-charcoal dark:text-white">{product.product_name}</h4>
                      <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                        {formatNumber(product.units_sold)} {t.vendor.unitsSold || 'وحدة'} • {formatNumber(product.orders_count)} {t.vendor.orders || 'طلب'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-historical-gold dark:text-yellow-400">
                      {formatCurrency(product.revenue, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stock Alerts */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title={t.vendor.lowStockProducts || 'منتجات بمخزون منخفض'}
              value={formatNumber(productsData.low_stock_count)}
              change={null}
              icon={<Package className="w-6 h-6" />}
              color="gold"
              isLoading={false}
            />
            <MetricCard
              title={t.vendor.outOfStockProducts || 'منتجات نفذت من المخزون'}
              value={formatNumber(productsData.out_of_stock_count)}
              change={null}
              icon={<Package className="w-6 h-6" />}
              color="purple"
              isLoading={false}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

function CustomersTab({
  customersData,
  isLoading,
  language,
  t,
}: {
  customersData: VendorCustomerAnalytics | null
  isLoading: boolean
  language: string
  t: any
}) {
  const growthData = React.useMemo(() => {
    if (!customersData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: customersData.customer_growth_data,
      labels: customersData.customer_growth_labels,
      maxValue: Math.max(...customersData.customer_growth_data, 1),
    }
  }, [customersData])

  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {/* Summary */}
      {customersData && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title={t.vendor.totalCustomers || 'إجمالي الزبائن'}
            value={formatNumber(customersData.total_customers)}
            change={null}
            icon={<Users className="w-6 h-6" />}
            color="purple"
            isLoading={false}
          />
          <MetricCard
            title={t.vendor.newCustomers || 'زبائن جدد'}
            value={formatNumber(customersData.new_customers)}
            change={null}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            isLoading={false}
          />
          <MetricCard
            title={t.vendor.returningCustomers || 'زبائن متكررون'}
            value={formatNumber(customersData.returning_customers)}
            change={null}
            icon={<Users className="w-6 h-6" />}
            color="green"
            isLoading={false}
          />
          <MetricCard
            title={t.vendor.repeatPurchaseRate || 'معدل تكرار الشراء'}
            value={customersData.repeat_purchase_rate !== null 
              ? `${customersData.repeat_purchase_rate.toFixed(1)}%`
              : 'N/A'}
            change={null}
            icon={<TrendingUp className="w-6 h-6" />}
            color="gold"
            isLoading={false}
          />
        </div>
      )}

      {/* Growth Chart */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.customerGrowth || 'نمو الزبائن'}
        </h3>
        <LineChart
          data={growthData.data}
          labels={growthData.labels}
          maxValue={growthData.maxValue}
          color="purple"
          isLoading={isLoading}
        />
      </motion.div>

      {/* Top Customers */}
      {customersData && (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
          <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
            {t.vendor.topCustomers || 'أفضل الزبائن'}
          </h3>
          <div className="space-y-4">
            {customersData.top_customers.map((customer) => (
              <div key={customer.customer_key} className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="font-semibold text-historical-charcoal dark:text-white">{customer.customer_name}</h4>
                  <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                    {formatNumber(customer.orders_count)} {t.vendor.orders || 'طلب'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-historical-gold dark:text-yellow-400">
                    {formatCurrency(customer.total_spent, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function TimeTab({
  timeData,
  isLoading,
  language,
  t,
}: {
  timeData: VendorTimeAnalysis | null
  isLoading: boolean
  language: string
  t: any
}) {
  const hourlyRevenueData = React.useMemo(() => {
    if (!timeData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: timeData.hourly_revenue.map(r => parseFloat(r)),
      labels: timeData.hourly_labels,
      maxValue: Math.max(...timeData.hourly_revenue.map(r => parseFloat(r)), 1),
    }
  }, [timeData])

  const dayOfWeekRevenueData = React.useMemo(() => {
    if (!timeData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: timeData.day_of_week_revenue.map(r => parseFloat(r)),
      labels: timeData.day_of_week_labels,
      maxValue: Math.max(...timeData.day_of_week_revenue.map(r => parseFloat(r)), 1),
    }
  }, [timeData])

  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {/* Best Times */}
      {timeData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
            <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-2">
              {t.vendor.bestSellingHour || 'أفضل ساعة بيع'}
            </h3>
            <p className="text-3xl font-bold text-historical-gold dark:text-yellow-400">
              {timeData.best_selling_hour !== null ? `${timeData.best_selling_hour}:00` : 'N/A'}
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
            <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-2">
              {t.vendor.bestSellingDay || 'أفضل يوم بيع'}
            </h3>
            <p className="text-3xl font-bold text-historical-gold dark:text-yellow-400">
              {timeData.best_selling_day || 'N/A'}
            </p>
          </motion.div>
        </div>
      )}

      {/* Hourly Chart */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.hourlySales || 'المبيعات بالساعة'}
        </h3>
        <BarChart
          data={hourlyRevenueData.data}
          labels={hourlyRevenueData.labels}
          maxValue={hourlyRevenueData.maxValue}
          color="gold"
          isLoading={isLoading}
        />
      </motion.div>

      {/* Day of Week Chart */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.dayOfWeekSales || 'المبيعات حسب يوم الأسبوع'}
        </h3>
        <BarChart
          data={dayOfWeekRevenueData.data}
          labels={dayOfWeekRevenueData.labels}
          maxValue={dayOfWeekRevenueData.maxValue}
          color="blue"
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  )
}

function ComparisonTab({
  comparisonData,
  isLoading,
  language,
  t,
}: {
  comparisonData: VendorComparisonAnalytics | null
  isLoading: boolean
  language: string
  t: any
}) {
  const currentData = React.useMemo(() => {
    if (!comparisonData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: comparisonData.current_period_data.map(r => parseFloat(r)),
      labels: comparisonData.comparison_labels,
      maxValue: Math.max(...comparisonData.current_period_data.map(r => parseFloat(r)), 1),
    }
  }, [comparisonData])

  const previousData = React.useMemo(() => {
    if (!comparisonData) return { data: [], labels: [], maxValue: 1 }
    return {
      data: comparisonData.previous_period_data.map(r => parseFloat(r)),
      labels: comparisonData.comparison_labels,
      maxValue: Math.max(...comparisonData.previous_period_data.map(r => parseFloat(r)), 1),
    }
  }, [comparisonData])

  return (
    <motion.div variants={containerVariants} className="space-y-6">
      {/* Summary Cards */}
      {comparisonData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
              <h3 className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2">
                {comparisonData.current_period_label}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-historical-gold dark:text-yellow-400">
                  {formatCurrency(comparisonData.current_revenue, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                </p>
                <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                  {formatNumber(comparisonData.current_orders)} {t.vendor.orders || 'طلب'} • {formatNumber(comparisonData.current_customers)} {t.vendor.customers || 'زبون'}
                </p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
              <h3 className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2">
                {comparisonData.previous_period_label}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-historical-charcoal/70 dark:text-gray-300">
                  {formatCurrency(comparisonData.previous_revenue, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                </p>
                <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                  {formatNumber(comparisonData.previous_orders)} {t.vendor.orders || 'طلب'} • {formatNumber(comparisonData.previous_customers)} {t.vendor.customers || 'زبون'}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title={t.vendor.revenueChange || 'تغيير الإيرادات'}
              value={formatPercentage(comparisonData.revenue_change)}
              change={comparisonData.revenue_change}
              icon={<DollarSign className="w-6 h-6" />}
              color="gold"
              isLoading={false}
            />
            <MetricCard
              title={t.vendor.ordersChange || 'تغيير الطلبات'}
              value={formatPercentage(comparisonData.orders_change)}
              change={comparisonData.orders_change}
              icon={<ShoppingBag className="w-6 h-6" />}
              color="blue"
              isLoading={false}
            />
            <MetricCard
              title={t.vendor.customersChange || 'تغيير الزبائن'}
              value={formatPercentage(comparisonData.customers_change)}
              change={comparisonData.customers_change}
              icon={<Users className="w-6 h-6" />}
              color="purple"
              isLoading={false}
            />
          </div>
        </>
      )}

      {/* Comparison Chart */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.comparisonChart || 'رسم بياني المقارنة'}
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {comparisonData?.current_period_label || ''}
            </h4>
            <BarChart
              data={currentData.data}
              labels={currentData.labels}
              maxValue={Math.max(currentData.maxValue, previousData.maxValue)}
              color="gold"
              isLoading={isLoading}
            />
          </div>
          <div>
            <h4 className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {comparisonData?.previous_period_label || ''}
            </h4>
            <BarChart
              data={previousData.data}
              labels={previousData.labels}
              maxValue={Math.max(currentData.maxValue, previousData.maxValue)}
              color="blue"
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

