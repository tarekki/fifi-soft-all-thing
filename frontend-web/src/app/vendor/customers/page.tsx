'use client'

/**
 * Vendor Customers Management Page
 * صفحة إدارة زبائن البائع
 * 
 * Features:
 * - Customers list with table view (connected to API)
 * - KPIs cards (total customers, new customers, top spenders)
 * - Search and filters (date range)
 * - Pagination
 * - Sorting
 * 
 * الميزات:
 * - قائمة الزبائن مع عرض جدول (مربوطة بـ API)
 * - بطاقات KPIs (إجمالي الزبائن، زبائن جدد، أعلى إنفاق)
 * - البحث والفلترة (نطاق التاريخ)
 * - التقسيم
 * - الترتيب
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useLanguage } from '@/lib/i18n/context'
import {
  Users,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  UserPlus,
  DollarSign,
  ArrowUpDown,
  ShoppingBag,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getVendorCustomers,
  type VendorCustomer,
  type VendorCustomerFilters,
} from '@/lib/vendor/api'

// =============================================================================
// Animation Variants
// متغيرات الحركة
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

// =============================================================================
// Helper Functions
// دوال مساعدة
// =============================================================================

/**
 * Format number as currency
 * تنسيق الرقم كعملة
 */
function formatCurrency(value: string | number, locale: string = 'ar-SY', currencySymbol: string = 'ل.س'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '0 ' + currencySymbol
  
  if (locale === 'ar-SY') {
    return new Intl.NumberFormat('ar-SY', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(numValue) + ' ' + currencySymbol
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(numValue) + ' ' + (currencySymbol === 'ل.س' ? 'SYP' : currencySymbol)
  }
}

/**
 * Format date
 * تنسيق التاريخ
 */
function formatDate(dateStr: string | null, language: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// =============================================================================
// KPI Cards Component
// مكون بطاقات KPIs
// =============================================================================

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'gold' | 'blue' | 'green' | 'purple'
  isLoading?: boolean
}

function KPICard({ title, value, icon, color, isLoading }: KPICardProps) {
  const colorClasses = {
    gold: 'bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 border-historical-gold/20 dark:border-yellow-800',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  }

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border transition-colors duration-300',
        colorClasses[color]
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-historical-charcoal/50 dark:text-gray-400 mb-2 transition-colors duration-300">
            {title}
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-lg font-bold text-historical-charcoal dark:text-gray-100">...</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {value}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function CustomersPage() {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get customer_key from URL if exists (for filtering)
  // الحصول على customer_key من URL إذا كان موجوداً (للتصفية)
  const customerKeyFromUrl = searchParams.get('customer_key')
  
  // State
  const [customers, setCustomers] = useState<VendorCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '30' | '90'>('all')
  const [sortBy, setSortBy] = useState<'last_order_at' | 'orders_count' | 'total_spent' | 'name'>('last_order_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  
  // Calculate KPIs from customers data
  // حساب KPIs من بيانات الزبائن
  const kpis = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    const newCustomers30 = customers.filter(c => {
      if (!c.first_order_at) return false
      const firstOrderDate = new Date(c.first_order_at)
      return firstOrderDate >= thirtyDaysAgo
    }).length
    
    const topSpender = customers.reduce((max, customer) => {
      const spent = parseFloat(customer.total_spent) || 0
      const maxSpent = parseFloat(max.total_spent) || 0
      return spent > maxSpent ? customer : max
    }, customers[0] || { total_spent: '0' })
    
    return {
      total: customers.length,
      new30: newCustomers30,
      topSpender: parseFloat(topSpender?.total_spent || '0'),
    }
  }, [customers])
  
  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Calculate date filters
      // حساب فلاتر التاريخ
      let dateFrom: string | undefined
      let dateTo: string | undefined
      
      if (dateFilter === '30') {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        dateFrom = date.toISOString().split('T')[0]
      } else if (dateFilter === '90') {
        const date = new Date()
        date.setDate(date.getDate() - 90)
        dateFrom = date.toISOString().split('T')[0]
      }
      
      const filters: VendorCustomerFilters = {
        search: search || undefined,
        date_from: dateFrom,
        sort_by: sortBy,
        sort_dir: sortDir,
        page: currentPage,
        page_size: pageSize,
      }
      
      const response = await getVendorCustomers(filters)
      
      if (response.success && response.data) {
        setCustomers(response.data.results)
        setTotalCount(response.data.pagination.count)
        setTotalPages(response.data.pagination.total_pages)
      } else {
        setError(response.message || 'فشل جلب الزبائن / Failed to fetch customers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching customers:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search, dateFilter, sortBy, sortDir, currentPage])
  
  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])
  
  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page
  }, [])
  
  // Handle date filter
  const handleDateFilter = useCallback((filter: 'all' | '30' | '90') => {
    setDateFilter(filter)
    setCurrentPage(1) // Reset to first page
  }, [])
  
  // Handle sort
  const handleSort = useCallback((field: 'last_order_at' | 'orders_count' | 'total_spent' | 'name') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
    setCurrentPage(1) // Reset to first page
  }, [sortBy, sortDir])
  
  // Handle customer click - navigate to orders with filter
  const handleCustomerClick = useCallback((customerKey: string) => {
    router.push(`/vendor/orders?customer_key=${customerKey}`)
  }, [router])
  
  // Handle view orders button click
  const handleViewOrders = useCallback((e: React.MouseEvent, customerKey: string) => {
    e.stopPropagation() // Prevent row click
    router.push(`/vendor/orders?customer_key=${customerKey}`)
  }, [router])
  
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
            {t.vendor.customers || 'الزبائن'}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.vendor.manageCustomers || 'إدارة زبائنك ومتابعة نشاطهم'}
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title={t.vendor.totalCustomers || 'إجمالي الزبائن'}
          value={kpis.total}
          icon={<Users className="w-6 h-6" />}
          color="gold"
          isLoading={isLoading}
        />
        <KPICard
          title={t.vendor.newCustomers30 || 'زبائن جدد (30 يوم)'}
          value={kpis.new30}
          icon={<UserPlus className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <KPICard
          title={t.vendor.topSpender || 'أعلى إنفاق'}
          value={formatCurrency(kpis.topSpender, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency || 'ل.س')}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-historical-gold/10 dark:border-gray-700 p-4 transition-colors duration-300"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/40 dark:text-gray-500",
              dir === 'rtl' ? 'right-3' : 'left-3'
            )} />
            <input
              type="text"
              placeholder={t.vendor.searchCustomers || 'البحث بالاسم أو البريد...'}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-700",
                "bg-white dark:bg-gray-900 text-historical-charcoal dark:text-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50",
                "transition-colors duration-300",
                dir === 'rtl' && "pr-10 pl-4"
              )}
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-historical-charcoal/40 dark:text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilter(e.target.value as 'all' | '30' | '90')}
              className={cn(
                "px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-700",
                "bg-white dark:bg-gray-900 text-historical-charcoal dark:text-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50",
                "transition-colors duration-300"
              )}
            >
              <option value="all">{t.vendor.allTime || 'كل الوقت'}</option>
              <option value="30">{t.vendor.last30Days || 'آخر 30 يوم'}</option>
              <option value="90">{t.vendor.last90Days || 'آخر 90 يوم'}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden transition-colors duration-300"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
              <tr>
                <th className={cn(
                  "text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300 cursor-pointer hover:bg-historical-gold/10 dark:hover:bg-gray-700",
                  dir === 'rtl' ? 'text-right' : 'text-left'
                )} onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    {t.vendor.customerName || 'اسم العميل'}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className={cn(
                  "text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300 cursor-pointer hover:bg-historical-gold/10 dark:hover:bg-gray-700",
                  dir === 'rtl' ? 'text-right' : 'text-left'
                )} onClick={() => handleSort('orders_count')}>
                  <div className="flex items-center gap-2">
                    {t.vendor.ordersCount || 'عدد الطلبات'}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className={cn(
                  "text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300 cursor-pointer hover:bg-historical-gold/10 dark:hover:bg-gray-700",
                  dir === 'rtl' ? 'text-right' : 'text-left'
                )} onClick={() => handleSort('total_spent')}>
                  <div className="flex items-center gap-2">
                    {t.vendor.totalSpent || 'إجمالي الإنفاق'}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className={cn(
                  "text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300 cursor-pointer hover:bg-historical-gold/10 dark:hover:bg-gray-700",
                  dir === 'rtl' ? 'text-right' : 'text-left'
                )} onClick={() => handleSort('last_order_at')}>
                  <div className="flex items-center gap-2">
                    {t.vendor.lastOrder || 'آخر طلب'}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className={cn(
                  "text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300",
                  dir === 'rtl' ? 'text-right' : 'text-left'
                )}>
                  {t.vendor.actions || 'الإجراءات'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
                    {t.vendor.noCustomers || 'لا يوجد زبائن'}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.customer_key}
                    className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => handleCustomerClick(customer.customer_key)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                          {customer.name}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                      {customer.orders_count}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                      {formatCurrency(customer.total_spent, language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency || 'ل.س')}
                    </td>
                    <td className="px-6 py-4 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                      {formatDate(customer.last_order_at, language)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleViewOrders(e, customer.customer_key)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                          "bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400",
                          "hover:bg-historical-gold/20 dark:hover:bg-yellow-900/40",
                          "transition-colors duration-300",
                          "border border-historical-gold/20 dark:border-yellow-800"
                        )}
                        title={t.vendor.viewOrders || 'عرض طلباته'}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.vendor.viewOrders || 'عرض طلباته'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && customers.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
              {t.vendor.showing || 'عرض'} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} {t.vendor.of || 'من'} {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  currentPage === 1
                    ? "text-historical-charcoal/20 dark:text-gray-600 cursor-not-allowed"
                    : "text-historical-charcoal dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  currentPage === totalPages
                    ? "text-historical-charcoal/20 dark:text-gray-600 cursor-not-allowed"
                    : "text-historical-charcoal dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

