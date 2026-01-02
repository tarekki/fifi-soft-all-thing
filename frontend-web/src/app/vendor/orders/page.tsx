'use client'

/**
 * Vendor Orders Management Page
 * صفحة إدارة طلبات البائع
 * 
 * Features:
 * - Orders list with table view (connected to API)
 * - Search and filters (status, date range)
 * - Pagination
 * - View order details
 * 
 * الميزات:
 * - قائمة الطلبات مع عرض جدول (مربوطة بـ API)
 * - البحث والفلترة (الحالة، نطاق التاريخ)
 * - التقسيم
 * - عرض تفاصيل الطلب
 */

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useLanguage } from '@/lib/i18n/context'
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getVendorOrders,
  type VendorOrder,
  type VendorOrderFilters,
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
 * Format date
 * تنسيق التاريخ
 */
function formatDate(dateStr: string, language: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(language === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get status style classes
 * الحصول على classes حسب الحالة
 */
function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function OrdersPage() {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get customer_key from URL if exists (for filtering)
  // الحصول على customer_key من URL إذا كان موجوداً (للتصفية)
  const customerKeyFromUrl = searchParams.get('customer_key')
  
  // State
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  
  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters: VendorOrderFilters = {
        search: search || undefined,
        status: statusFilter || undefined,
        customer_key: customerKeyFromUrl || undefined,
        sort_by: 'created_at',
        sort_dir: 'desc',
        page: currentPage,
        page_size: pageSize,
      }
      
      const response = await getVendorOrders(filters)
      
      if (response.success && response.data) {
        setOrders(response.data.results)
        setTotalCount(response.data.count)
        // Calculate total pages
        setTotalPages(Math.ceil(response.data.count / pageSize))
      } else {
        setError(response.message || 'فشل جلب الطلبات / Failed to fetch orders')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, currentPage, customerKeyFromUrl])
  
  // Fetch on mount and when filters change
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])
  
  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page
  }, [])
  
  // Handle status filter
  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page
  }, [])
  
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
            {t.vendor.orders || 'الطلبات'}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.vendor.manageOrders || 'إدارة طلباتك'}
          </p>
        </div>
      </motion.div>
      
      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/40 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t.vendor.searchOrders || 'البحث في الطلبات...'}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-historical-gold/10 dark:border-gray-700 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-historical-gold/20 dark:focus:ring-yellow-600/30 transition-colors duration-300"
          />
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-historical-gold/10 dark:border-gray-700 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/20 dark:focus:ring-yellow-600/30 transition-colors duration-300"
        >
          <option value="">{t.vendor.allStatuses || 'جميع الحالات'}</option>
          <option value="pending">{t.vendor.status?.pending || 'قيد الانتظار'}</option>
          <option value="confirmed">{t.vendor.status?.confirmed || 'مؤكد'}</option>
          <option value="shipped">{t.vendor.status?.shipped || 'تم الشحن'}</option>
          <option value="delivered">{t.vendor.status?.delivered || 'تم التسليم'}</option>
          <option value="cancelled">{t.vendor.status?.cancelled || 'ملغي'}</option>
        </select>
      </motion.div>
      
      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
        >
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </motion.div>
      )}
      
      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
              <tr>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.orderNumber || 'رقم الطلب'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.customer || 'العميل'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.total || 'الإجمالي'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.status || 'الحالة'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.date || 'التاريخ'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.actions || 'الإجراءات'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-historical-gold dark:text-yellow-400" />
                  </td>
                </tr>
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
                      <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.customer_key ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/vendor/customers?customer_key=${order.customer_key}`)
                          }}
                          className="text-sm text-historical-gold dark:text-yellow-400 hover:text-historical-red dark:hover:text-yellow-300 hover:underline transition-colors duration-300 font-medium"
                        >
                          {order.customer_name}
                        </button>
                      ) : (
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
                          {order.customer_name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                      {formatCurrency(Number(order.total), language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", getStatusStyle(order.status))}>
                        {order.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                      {formatDate(order.created_at, language)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/vendor/orders/${order.id}`)}
                        className="p-2 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors"
                        title={t.vendor.viewOrder || 'عرض الطلب'}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
            <div className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
              {t.vendor.showing || 'عرض'} {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} {t.vendor.of || 'من'} {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-historical-gold/10 dark:border-gray-700 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-historical-gold/10 dark:border-gray-700 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
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

