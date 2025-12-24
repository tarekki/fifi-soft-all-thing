'use client'

/**
 * Admin Orders Management Page
 * صفحة إدارة الطلبات
 * 
 * Features:
 * - Orders list with filters
 * - Status management
 * - Order details modal
 * - Bulk status updates
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface OrderItem {
  id: string
  productName: string
  productImage: string
  quantity: number
  price: number
  variant?: string
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentMethod: string
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  shippingAddress: string
  vendor: string
  createdAt: string
  updatedAt: string
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
}

// =============================================================================
// Mock Data
// =============================================================================

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#ORD-1234',
    customer: { name: 'أحمد محمد', email: 'ahmed@email.com', phone: '+963 912 345 678' },
    items: [
      { id: '1', productName: 'آيفون 15 برو ماكس', productImage: '', quantity: 1, price: 1199, variant: '256GB - أسود' },
      { id: '2', productName: 'كفر حماية', productImage: '', quantity: 2, price: 25 },
    ],
    subtotal: 1249,
    shipping: 10,
    total: 1259,
    status: 'pending',
    paymentMethod: 'الدفع عند الاستلام',
    paymentStatus: 'pending',
    shippingAddress: 'دمشق، المزة، شارع الجلاء، بناء رقم 15',
    vendor: 'متجر التقنية',
    createdAt: '2024-12-24T10:30:00',
    updatedAt: '2024-12-24T10:30:00',
  },
  {
    id: '2',
    orderNumber: '#ORD-1233',
    customer: { name: 'سارة علي', email: 'sara@email.com', phone: '+963 922 345 678' },
    items: [
      { id: '1', productName: 'فستان أنيق', productImage: '', quantity: 1, price: 89, variant: 'M - أحمر' },
    ],
    subtotal: 89,
    shipping: 5,
    total: 94,
    status: 'processing',
    paymentMethod: 'بطاقة ائتمان',
    paymentStatus: 'paid',
    shippingAddress: 'حلب، العزيزية، شارع النيال',
    vendor: 'بيت الأزياء',
    createdAt: '2024-12-24T09:15:00',
    updatedAt: '2024-12-24T09:45:00',
  },
  {
    id: '3',
    orderNumber: '#ORD-1232',
    customer: { name: 'محمد خالد', email: 'mohammad@email.com', phone: '+963 932 345 678' },
    items: [
      { id: '1', productName: 'ماك بوك برو 14', productImage: '', quantity: 1, price: 1999 },
    ],
    subtotal: 1999,
    shipping: 0,
    total: 1999,
    status: 'shipped',
    paymentMethod: 'تحويل بنكي',
    paymentStatus: 'paid',
    shippingAddress: 'اللاذقية، الزراعة، بناء السعادة',
    vendor: 'متجر التقنية',
    createdAt: '2024-12-23T16:20:00',
    updatedAt: '2024-12-24T08:00:00',
  },
  {
    id: '4',
    orderNumber: '#ORD-1231',
    customer: { name: 'فاطمة أحمد', email: 'fatima@email.com', phone: '+963 942 345 678' },
    items: [
      { id: '1', productName: 'حذاء رياضي نايك', productImage: '', quantity: 1, price: 129, variant: '42 - أسود' },
    ],
    subtotal: 129,
    shipping: 5,
    total: 134,
    status: 'delivered',
    paymentMethod: 'الدفع عند الاستلام',
    paymentStatus: 'paid',
    shippingAddress: 'طرطوس، الكورنيش',
    vendor: 'عالم الرياضة',
    createdAt: '2024-12-22T14:10:00',
    updatedAt: '2024-12-24T11:00:00',
  },
  {
    id: '5',
    orderNumber: '#ORD-1230',
    customer: { name: 'علي حسن', email: 'ali@email.com', phone: '+963 952 345 678' },
    items: [
      { id: '1', productName: 'سماعات سوني', productImage: '', quantity: 1, price: 349 },
    ],
    subtotal: 349,
    shipping: 10,
    total: 359,
    status: 'cancelled',
    paymentMethod: 'بطاقة ائتمان',
    paymentStatus: 'refunded',
    shippingAddress: 'حمص، الحمرا',
    vendor: 'متجر التقنية',
    createdAt: '2024-12-21T10:00:00',
    updatedAt: '2024-12-22T15:30:00',
  },
]

// =============================================================================
// Animation Variants
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
// =============================================================================

const getStatusStyle = (status: Order['status']) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  }
  return styles[status]
}

const getStatusLabel = (status: Order['status']) => {
  const labels = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    refunded: 'مسترد',
  }
  return labels[status]
}

const getStatusIcon = (status: Order['status']) => {
  const icons = {
    pending: Icons.clock,
    processing: Icons.package,
    shipped: Icons.truck,
    delivered: Icons.check,
    cancelled: Icons.x,
    refunded: Icons.refresh,
  }
  return icons[status]
}

const getPaymentStatusStyle = (status: Order['paymentStatus']) => {
  const styles = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
  }
  return styles[status]
}

const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
  const labels = {
    paid: 'مدفوع',
    pending: 'بانتظار الدفع',
    failed: 'فشل الدفع',
    refunded: 'مسترد',
  }
  return labels[status]
}

// =============================================================================
// Sub-Components
// =============================================================================

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, status: Order['status']) => void
}

function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus }: OrderDetailModalProps) {
  if (!isOpen || !order) return null

  const statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

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
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <div>
              <h2 className="text-lg font-bold text-historical-charcoal">تفاصيل الطلب {order.orderNumber}</h2>
              <p className="text-sm text-historical-charcoal/50">
                {new Date(order.createdAt).toLocaleDateString('ar-SY', { dateStyle: 'full' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors">
                {Icons.print}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
              >
                {Icons.close}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Status & Payment */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-historical-charcoal/50 mb-2">حالة الطلب</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-historical-charcoal/50 mb-2">حالة الدفع</p>
                <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusStyle(order.paymentStatus)}`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            {/* Update Status */}
            <div>
              <p className="text-sm text-historical-charcoal/50 mb-2">تحديث الحالة</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(order.id, status)}
                    disabled={order.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === status
                        ? 'bg-historical-gold text-white cursor-default'
                        : 'bg-historical-stone hover:bg-historical-gold/20 text-historical-charcoal'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-historical-stone/50 rounded-xl p-4">
              <h3 className="font-medium text-historical-charcoal mb-3">معلومات العميل</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-historical-charcoal/50">الاسم</p>
                  <p className="font-medium text-historical-charcoal">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-historical-charcoal/50">الهاتف</p>
                  <p className="font-medium text-historical-charcoal" dir="ltr">{order.customer.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-historical-charcoal/50">عنوان الشحن</p>
                  <p className="font-medium text-historical-charcoal">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-medium text-historical-charcoal mb-3">المنتجات</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-historical-stone/30 rounded-xl">
                    <div className="w-16 h-16 bg-historical-stone rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-historical-charcoal truncate">{item.productName}</p>
                      {item.variant && (
                        <p className="text-sm text-historical-charcoal/50">{item.variant}</p>
                      )}
                      <p className="text-sm text-historical-charcoal/50">الكمية: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-historical-charcoal">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-historical-gold/5 rounded-xl p-4 border border-historical-gold/10">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-historical-charcoal/70">المجموع الفرعي</span>
                  <span className="font-medium">${order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-historical-charcoal/70">الشحن</span>
                  <span className="font-medium">{order.shipping === 0 ? 'مجاني' : `$${order.shipping}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-historical-gold/20">
                  <span className="font-bold text-historical-charcoal">الإجمالي</span>
                  <span className="font-bold text-historical-gold text-lg">${order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const totalPages = Math.ceil(orders.length / itemsPerPage)

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }, [])

  const handleUpdateStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null)
    }
  }, [selectedOrder])

  const handleSelectAll = useCallback(() => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o.id))
    }
  }, [selectedOrders.length, orders])

  const handleSelectOrder = useCallback((id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.includes(searchQuery) ||
      o.customer.phone.includes(searchQuery)
    const matchesStatus = !filterStatus || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-historical-charcoal">إدارة الطلبات</h1>
        <p className="text-historical-charcoal/50 mt-1">عرض وإدارة جميع الطلبات</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              {Icons.clock}
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-historical-charcoal/50">قيد الانتظار</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {Icons.package}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
              <p className="text-xs text-historical-charcoal/50">قيد المعالجة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              {Icons.truck}
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-xs text-historical-charcoal/50">قيد الشحن</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-xs text-historical-charcoal/50">تم التسليم</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب أو اسم العميل..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="processing">قيد المعالجة</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">تم التسليم</option>
          <option value="cancelled">ملغي</option>
        </select>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  />
                </th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">رقم الطلب</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">العميل</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">البائع</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">المبلغ</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الحالة</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">الدفع</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4">التاريخ</th>
                <th className="w-16 px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-historical-gold/5 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-historical-charcoal">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-historical-charcoal">{order.customer.name}</p>
                      <p className="text-xs text-historical-charcoal/50" dir="ltr">{order.customer.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/70">{order.vendor}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-historical-charcoal">${order.total}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusStyle(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-historical-charcoal/50">
                      {new Date(order.createdAt).toLocaleDateString('ar-SY')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="عرض التفاصيل"
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
          <p className="text-sm text-historical-charcoal/50">
            عرض {filteredOrders.length} من {orders.length} طلب
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {Icons.chevronRight}
            </button>
            <span className="px-4 py-2 text-sm text-historical-charcoal">
              صفحة {currentPage} من {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {Icons.chevronLeft}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </motion.div>
  )
}

