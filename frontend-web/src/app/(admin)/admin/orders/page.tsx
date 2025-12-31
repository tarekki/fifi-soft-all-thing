'use client'

/**
 * Admin Orders Management Page
 * صفحة إدارة الطلبات
 * 
 * Features / الميزات:
 * - Orders list with filters (connected to API)
 * - Status management with validation
 * - Order details modal
 * - Bulk status updates
 * - Real-time statistics
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/lib/admin'
import type {
  Order,
  OrderDetail,
  OrderStatus,
  OrderFilters,
  OrderBulkAction,
} from '@/lib/admin/types/orders'
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
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  print: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
  package: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  truck: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
// الدوال المساعدة
// =============================================================================

/**
 * Get status style classes
 * الحصول على أنماط الحالة
 */
const getStatusStyle = (status: OrderStatus) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
}

/**
 * Get status label
 * الحصول على تسمية الحالة
 */
const getStatusLabel = (status: OrderStatus, t: any) => {
  const labels: Record<OrderStatus, string> = {
    pending: t.admin.orders.statuses.pending,
    confirmed: t.admin.orders.statuses.confirmed,
    shipped: t.admin.orders.statuses.shipped,
    delivered: t.admin.orders.statuses.delivered,
    cancelled: t.admin.orders.statuses.cancelled,
  }
  return labels[status] || status
}

/**
 * Get status icon
 * الحصول على أيقونة الحالة
 */
const getStatusIcon = (status: OrderStatus) => {
  const icons: Record<OrderStatus, JSX.Element> = {
    pending: Icons.clock,
    confirmed: Icons.package,
    shipped: Icons.truck,
    delivered: Icons.check,
    cancelled: Icons.x,
  }
  return icons[status] || Icons.clock
}

/**
 * Format currency
 * تنسيق العملة
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SY', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(amount) + ' ل.س'
}


// =============================================================================
// Order Detail Modal
// مودال تفاصيل الطلب
// =============================================================================

interface OrderDetailModalProps {
  order: OrderDetail | null
  isOpen: boolean
  isLoading: boolean
  isUpdating: boolean
  onClose: () => void
  onUpdateStatus: (orderId: number, status: OrderStatus) => Promise<void>
}

function OrderDetailModal({
  order,
  isOpen,
  isLoading,
  isUpdating,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
            <div>
              <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
                {isLoading ? 'جاري التحميل...' : `تفاصيل الطلب ${order?.order_number || ''}`}
              </h2>
              {order && (
                <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {new Date(order.created_at).toLocaleDateString('ar-SY', { dateStyle: 'full' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors">
                {Icons.print}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
              >
                {Icons.close}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                {Icons.loader}
                <span className="mr-2 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.loadingDetails}</span>
              </div>
            ) : order ? (
              <>
                {/* Status */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-2 transition-colors duration-300">{t.admin.orders.orderStatus}</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status, t)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-2 transition-colors duration-300">{t.admin.orders.orderType}</p>
                    <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {order.order_type_display}
                    </span>
                  </div>
                </div>

                {/* Update Status - Only show available transitions */}
                {order.available_statuses.length > 0 && (
                  <div>
                    <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-2 transition-colors duration-300">{t.admin.orders.updateStatus}</p>
                    <div className="flex flex-wrap gap-2">
                      {order.available_statuses.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => onUpdateStatus(order.id, value)}
                          disabled={isUpdating}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUpdating
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-historical-stone dark:bg-gray-700 hover:bg-historical-gold/20 dark:hover:bg-gray-600 text-historical-charcoal dark:text-gray-200'
                            }`}
                        >
                          {isUpdating ? Icons.loader : null}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="bg-historical-stone/50 dark:bg-gray-700/50 rounded-xl p-4 transition-colors duration-300">
                  <h3 className="font-medium text-historical-charcoal dark:text-gray-100 mb-3 transition-colors duration-300">{t.admin.orders.customerInfo}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.name}</p>
                      <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.phone}</p>
                      <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300" dir="ltr">{order.customer_phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.shippingAddress}</p>
                      <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_address}</p>
                    </div>
                    {order.user_email && (
                      <div className="col-span-2">
                        <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.email}</p>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.user_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-medium text-historical-charcoal dark:text-gray-100 mb-3 transition-colors duration-300">{t.admin.orders.products} ({order.items.length})</h3>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-historical-stone/30 dark:bg-gray-700/30 rounded-xl transition-colors duration-300">
                        <div className="w-16 h-16 bg-historical-stone dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden transition-colors duration-300">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-historical-charcoal/30 dark:text-gray-600">
                              {Icons.package}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-historical-charcoal dark:text-gray-200 truncate transition-colors duration-300">{item.product_name}</p>
                          {item.variant_info && (
                            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{item.variant_info}</p>
                          )}
                          {item.vendor_name && (
                            <p className="text-xs text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">{t.admin.orders.vendor} {item.vendor_name}</p>
                          )}
                          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.quantity} {item.quantity}</p>
                        </div>
                        <p className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h3 className="font-medium text-yellow-800 mb-2">{t.admin.orders.notes}</h3>
                    <p className="text-sm text-yellow-700">{order.notes}</p>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-historical-gold/5 rounded-xl p-4 border border-historical-gold/10">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-historical-charcoal/70">{t.admin.orders.subtotal}</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-historical-charcoal/70">{t.admin.orders.deliveryFee}</span>
                      <span className="font-medium">
                        {order.delivery_fee === 0 ? t.admin.orders.free : formatCurrency(order.delivery_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-historical-charcoal/50">
                      <span>{t.admin.orders.platformCommission}</span>
                      <span>{formatCurrency(order.platform_commission)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-historical-gold/20">
                      <span className="font-bold text-historical-charcoal">{t.admin.orders.total}</span>
                      <span className="font-bold text-historical-gold text-lg">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                {t.admin.orders.orderNotFound}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function OrdersPage() {
  // =========================================================================
  // Hook - Fetch orders from API
  // الخطاف - جلب الطلبات من API
  // =========================================================================
  const { t, language } = useLanguage()
  const {
    orders,
    selectedOrder,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isUpdatingStatus,
    error,
    filters,
    fetchOrders,
    fetchOrderDetails,
    updateStatus,
    executeBulkAction,
    setFilters,
    clearSelectedOrder,
    refresh,
  } = useOrders()

  // =========================================================================
  // Local State
  // الحالة المحلية
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([])

  // =========================================================================
  // Handlers
  // المعالجات
  // =========================================================================

  /**
   * Handle search with debounce
   * معالجة البحث مع تأخير
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters: OrderFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterStatus) {
        newFilters.status = filterStatus
      } else {
        delete newFilters.status
      }
      setFilters(newFilters)
      fetchOrders(newFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle view order details
   * معالجة عرض تفاصيل الطلب
   */
  const handleViewOrder = useCallback((order: Order) => {
    setIsModalOpen(true)
    fetchOrderDetails(order.id)
  }, [fetchOrderDetails])

  /**
   * Handle close modal
   * معالجة إغلاق المودال
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    clearSelectedOrder()
  }, [clearSelectedOrder])

  /**
   * Handle update status
   * معالجة تحديث الحالة
   */
  const handleUpdateStatus = useCallback(async (orderId: number, status: OrderStatus) => {
    const success = await updateStatus(orderId, { status })
    if (success) {
      // Refresh list to get updated data
      // تحديث القائمة للحصول على البيانات المحدثة
      fetchOrders()
    }
  }, [updateStatus, fetchOrders])

  /**
   * Handle select all orders
   * معالجة تحديد كل الطلبات
   */
  const handleSelectAll = useCallback(() => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([])
    } else {
      setSelectedOrderIds(orders.map(o => o.id))
    }
  }, [selectedOrderIds.length, orders])

  /**
   * Handle select single order
   * معالجة تحديد طلب واحد
   */
  const handleSelectOrder = useCallback((id: number) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  /**
   * Handle bulk action
   * معالجة العملية المجمعة
   */
  const handleBulkAction = useCallback(async (action: OrderBulkAction) => {
    if (selectedOrderIds.length === 0) return

    const success = await executeBulkAction({
      order_ids: selectedOrderIds,
      action,
    })

    if (success) {
      setSelectedOrderIds([])
    }
  }, [selectedOrderIds, executeBulkAction])

  /**
   * Handle page change
   * معالجة تغيير الصفحة
   */
  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    fetchOrders(newFilters)
  }, [currentPage, filters, setFilters, fetchOrders])

  // =========================================================================
  // Render
  // العرض
  // =========================================================================

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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.orders.title}</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{t.admin.orders.subtitle}</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? Icons.loader : Icons.refresh}
          {t.admin.dashboard.refresh}
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              {Icons.clock}
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
                {stats?.by_status.pending || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.statuses.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {Icons.package}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                {stats?.by_status.confirmed || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.statuses.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              {Icons.truck}
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                {stats?.by_status.shipped || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.statuses.shipped}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-green-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                {stats?.by_status.delivered || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.statuses.delivered}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 dark:border-red-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">
                {stats?.by_status.cancelled || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.statuses.cancelled}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30 dark:text-gray-500 transition-colors duration-300">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.orders.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
        >
          <option value="">{t.admin.orders.allStatuses}</option>
          <option value="pending">{t.admin.orders.statuses.pending}</option>
          <option value="confirmed">{t.admin.orders.statuses.confirmed}</option>
          <option value="shipped">{t.admin.orders.statuses.shipped}</option>
          <option value="delivered">{t.admin.orders.statuses.delivered}</option>
          <option value="cancelled">{t.admin.orders.statuses.cancelled}</option>
        </select>

        {/* Bulk Actions */}
        {selectedOrderIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-historical-charcoal/50">
              {selectedOrderIds.length} {t.admin.orders.selected}
            </span>
            <button
              onClick={() => handleBulkAction('confirm')}
              className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 transition-colors"
            >
              {t.admin.orders.confirm}
            </button>
            <button
              onClick={() => handleBulkAction('ship')}
              className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm hover:bg-purple-200 transition-colors"
            >
              {t.admin.orders.ship}
            </button>
            <button
              onClick={() => handleBulkAction('cancel')}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200 transition-colors"
            >
              {t.admin.orders.cancel}
            </button>
          </div>
        )}
      </motion.div>

      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        {isLoading && orders.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            {Icons.loader}
            <span className="mr-2 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.orders.loading}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            <div className="text-4xl mb-4">📦</div>
            {t.admin.orders.noOrders}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
                  <tr>
                    <th className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                      />
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.orderNumber}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.customer}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.type}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.amount}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.status}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.items}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.orders.date}</th>
                    <th className="w-16 px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
                  {orders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.order_number}</span>
                        {order.is_guest_order && (
                          <span className="mr-2 px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded transition-colors duration-300">{t.admin.orders.guest}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_name}</p>
                          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300" dir="ltr">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{order.order_type_display}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{t.admin.orders.itemsCount.replace('{count}', order.items_count.toString())}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                          {new Date(order.created_at).toLocaleDateString('ar-SY')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                          title={t.admin.orders.viewDetails}
                        >
                          {Icons.eye}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/30">
              <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                {t.admin.orders.showingOrders.replace('{count}', orders.length.toString()).replace('{total}', total.toString())}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={!hasPreviousPage || isLoading}
                  className="p-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronRight}
                </button>
                <span className="px-4 py-2 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                  {t.admin.orders.page} {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!hasNextPage || isLoading}
                  className="p-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronLeft}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        isLoading={isLoadingDetails}
        isUpdating={isUpdatingStatus}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
      />
    </motion.div>
  )
}
