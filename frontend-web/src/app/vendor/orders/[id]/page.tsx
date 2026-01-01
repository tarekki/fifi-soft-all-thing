'use client'

/**
 * Vendor Order Detail Page
 * صفحة تفاصيل طلب البائع
 * 
 * Features:
 * - Order details (customer info, items, totals)
 * - Order status display
 * - Order items list
 * 
 * الميزات:
 * - تفاصيل الطلب (معلومات العميل، العناصر، الإجماليات)
 * - عرض حالة الطلب
 * - قائمة عناصر الطلب
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/context'
import { useTranslation } from '@/lib/i18n/use-translation'
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getVendorOrder,
  type VendorOrderDetail,
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

export default function OrderDetailPage() {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id ? parseInt(params.id as string) : null
  
  // State
  const [order, setOrder] = useState<VendorOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError('معرف الطلب غير صحيح / Invalid order ID')
      setIsLoading(false)
      return
    }
    
    async function fetchOrder() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await getVendorOrder(orderId)
        
        if (response.success && response.data) {
          setOrder(response.data)
        } else {
          setError(response.message || 'فشل جلب تفاصيل الطلب / Failed to fetch order details')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error fetching order details:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderId])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-historical-gold dark:text-yellow-400" />
      </div>
    )
  }
  
  if (error || !order) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <button
            onClick={() => router.push('/vendor/orders')}
            className="flex items-center gap-2 text-historical-charcoal/60 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.vendor.backToOrders || 'العودة إلى الطلبات'}</span>
          </button>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6"
        >
          <p className="text-red-600 dark:text-red-300">{error || 'الطلب غير موجود / Order not found'}</p>
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
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => router.push('/vendor/orders')}
          className="flex items-center gap-2 text-historical-charcoal/60 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.vendor.backToOrders || 'العودة إلى الطلبات'}</span>
        </button>
      </motion.div>
      
      {/* Order Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {order.order_number}
            </h1>
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
              {formatDate(order.created_at, language)}
            </p>
          </div>
          <span className={cn("inline-flex px-4 py-2 rounded-full text-sm font-medium", getStatusStyle(order.status))}>
            {order.status_display}
          </span>
        </div>
      </motion.div>
      
      {/* Customer Info */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-4 transition-colors duration-300">
          {t.vendor.customerInfo || 'معلومات العميل'}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-historical-charcoal/40 dark:text-gray-500" />
            <span className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_name}</span>
          </div>
          {order.customer_email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-historical-charcoal/40 dark:text-gray-500" />
              <span className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_email}</span>
            </div>
          )}
          {order.customer_phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-historical-charcoal/40 dark:text-gray-500" />
              <span className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_phone}</span>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-historical-charcoal/40 dark:text-gray-500 mt-0.5" />
            <span className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{order.customer_address}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Order Items */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        <div className="p-6 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            {t.vendor.orderItems || 'عناصر الطلب'} ({order.items_count})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
              <tr>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.product || 'المنتج'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.quantity || 'الكمية'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.price || 'السعر'}
                </th>
                <th className={cn("text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-6 py-3 transition-colors duration-300", dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {t.vendor.subtotal || 'المجموع الفرعي'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                          {item.product_name}
                        </p>
                        {item.variant_name && (
                          <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                            {item.variant_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                    {formatCurrency(Number(item.price), language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                    {formatCurrency(Number(item.subtotal), language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Order Summary */}
        <div className="p-6 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {t.vendor.total || 'الإجمالي'}
            </span>
            <span className="text-xl font-bold text-historical-gold dark:text-yellow-400 transition-colors duration-300">
              {formatCurrency(Number(order.subtotal), language === 'ar' ? 'ar-SY' : 'en-US', t.common.currency)}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Notes */}
      {order.notes && (
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
        >
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-2 transition-colors duration-300">
            {t.vendor.notes || 'ملاحظات'}
          </h2>
          <p className="text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
            {order.notes}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

