'use client'

/**
 * Admin Vendors Management Page
 * صفحة إدارة البائعين
 * 
 * Features:
 * - Vendor list with cards/table view
 * - Approval workflow
 * - Vendor statistics
 * - Commission management
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Vendor {
  id: string
  name: string
  nameAr: string
  logo: string
  email: string
  phone: string
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  isFeatured: boolean
  commissionRate: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  joinedAt: string
  rating: number
  reviewCount: number
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  add: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  starOutline: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  store: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  package: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  money: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  mail: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  grid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  list: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Tech Store',
    nameAr: 'متجر التقنية',
    logo: 'https://via.placeholder.com/100',
    email: 'tech@store.com',
    phone: '+963 912 345 678',
    status: 'active',
    isFeatured: true,
    commissionRate: 10,
    totalProducts: 156,
    totalOrders: 1234,
    totalRevenue: 45678,
    joinedAt: '2024-01-15',
    rating: 4.8,
    reviewCount: 324,
  },
  {
    id: '2',
    name: 'Fashion House',
    nameAr: 'بيت الأزياء',
    logo: 'https://via.placeholder.com/100',
    email: 'fashion@house.com',
    phone: '+963 922 345 678',
    status: 'active',
    isFeatured: true,
    commissionRate: 12,
    totalProducts: 234,
    totalOrders: 892,
    totalRevenue: 34567,
    joinedAt: '2024-02-20',
    rating: 4.6,
    reviewCount: 198,
  },
  {
    id: '3',
    name: 'Sports World',
    nameAr: 'عالم الرياضة',
    logo: 'https://via.placeholder.com/100',
    email: 'sports@world.com',
    phone: '+963 932 345 678',
    status: 'pending',
    isFeatured: false,
    commissionRate: 10,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    joinedAt: '2024-12-20',
    rating: 0,
    reviewCount: 0,
  },
  {
    id: '4',
    name: 'Home Decor',
    nameAr: 'ديكور المنزل',
    logo: 'https://via.placeholder.com/100',
    email: 'home@decor.com',
    phone: '+963 942 345 678',
    status: 'suspended',
    isFeatured: false,
    commissionRate: 15,
    totalProducts: 89,
    totalOrders: 234,
    totalRevenue: 12345,
    joinedAt: '2024-03-10',
    rating: 3.2,
    reviewCount: 45,
  },
  {
    id: '5',
    name: 'Kids Corner',
    nameAr: 'ركن الأطفال',
    logo: 'https://via.placeholder.com/100',
    email: 'kids@corner.com',
    phone: '+963 952 345 678',
    status: 'active',
    isFeatured: false,
    commissionRate: 10,
    totalProducts: 67,
    totalOrders: 456,
    totalRevenue: 23456,
    joinedAt: '2024-04-05',
    rating: 4.4,
    reviewCount: 112,
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

const getStatusStyle = (status: Vendor['status']) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
    rejected: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return styles[status]
}

const getStatusLabel = (status: Vendor['status']) => {
  const labels = {
    pending: 'بانتظار الموافقة',
    active: 'نشط',
    suspended: 'موقوف',
    rejected: 'مرفوض',
  }
  return labels[status]
}

// =============================================================================
// Sub-Components
// =============================================================================

interface VendorCardProps {
  vendor: Vendor
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onView: (id: string) => void
  onToggleFeatured: (id: string) => void
}

function VendorCard({ vendor, onApprove, onReject, onView, onToggleFeatured }: VendorCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden hover:shadow-soft-lg transition-shadow group"
    >
      {/* Header */}
      <div className="relative p-4 border-b border-historical-gold/10 bg-gradient-to-l from-historical-gold/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-historical-stone overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
            <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-historical-charcoal truncate">{vendor.nameAr}</h3>
              {vendor.isFeatured && (
                <span className="text-yellow-500">{Icons.star}</span>
              )}
            </div>
            <p className="text-sm text-historical-charcoal/50 truncate">{vendor.name}</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(vendor.status)}`}>
              {getStatusLabel(vendor.status)}
            </span>
          </div>
        </div>

        {/* Featured Toggle */}
        <button
          onClick={() => onToggleFeatured(vendor.id)}
          className={`absolute top-4 left-4 p-2 rounded-lg transition-colors ${
            vendor.isFeatured
              ? 'text-yellow-500 bg-yellow-50'
              : 'text-historical-charcoal/30 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          title={vendor.isFeatured ? 'إلغاء التمييز' : 'تمييز البائع'}
        >
          {vendor.isFeatured ? Icons.star : Icons.starOutline}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-historical-gold/10 rtl:divide-x-reverse">
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal">{vendor.totalProducts}</p>
          <p className="text-xs text-historical-charcoal/50">منتج</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal">{vendor.totalOrders}</p>
          <p className="text-xs text-historical-charcoal/50">طلب</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-gold">${vendor.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-historical-charcoal/50">إيرادات</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 border-t border-historical-gold/10">
        <div className="flex items-center gap-2 text-sm text-historical-charcoal/70">
          {Icons.mail}
          <span className="truncate" dir="ltr">{vendor.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-historical-charcoal/70">
          {Icons.phone}
          <span dir="ltr">{vendor.phone}</span>
        </div>
        {vendor.rating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">{Icons.star}</span>
            <span className="text-sm font-medium text-historical-charcoal">{vendor.rating}</span>
            <span className="text-xs text-historical-charcoal/50">({vendor.reviewCount} تقييم)</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-historical-gold/10 bg-historical-stone/30">
        {vendor.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove(vendor.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
            >
              {Icons.check}
              <span>قبول</span>
            </button>
            <button
              onClick={() => onReject(vendor.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              {Icons.x}
              <span>رفض</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onView(vendor.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-historical-gold/10 text-historical-gold font-medium hover:bg-historical-gold/20 transition-colors"
          >
            {Icons.eye}
            <span>عرض التفاصيل</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function VendorsPage() {
  const [vendors, setVendors] = useState(mockVendors)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleApprove = useCallback((id: string) => {
    setVendors(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'active' as const } : v
    ))
  }, [])

  const handleReject = useCallback((id: string) => {
    setVendors(prev => prev.map(v => 
      v.id === id ? { ...v, status: 'rejected' as const } : v
    ))
  }, [])

  const handleView = useCallback((id: string) => {
    // TODO: Navigate to vendor details
    console.log('View vendor:', id)
  }, [])

  const handleToggleFeatured = useCallback((id: string) => {
    setVendors(prev => prev.map(v => 
      v.id === id ? { ...v, isFeatured: !v.isFeatured } : v
    ))
  }, [])

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.nameAr.includes(searchQuery) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filterStatus || v.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    pending: vendors.filter(v => v.status === 'pending').length,
    suspended: vendors.filter(v => v.status === 'suspended').length,
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
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة البائعين</h1>
          <p className="text-historical-charcoal/50 mt-1">عرض وإدارة جميع البائعين</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow">
          {Icons.add}
          <span>إضافة بائع</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal">{stats.total}</p>
              <p className="text-xs text-historical-charcoal/50">إجمالي البائعين</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-historical-charcoal/50">نشط</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-historical-charcoal/50">بانتظار الموافقة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
              <p className="text-xs text-historical-charcoal/50">موقوف</p>
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
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="pending">بانتظار الموافقة</option>
          <option value="suspended">موقوف</option>
          <option value="rejected">مرفوض</option>
        </select>

        <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-historical-gold/20 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-historical-gold/20 text-historical-gold' : 'text-historical-charcoal/50'}`}
          >
            {Icons.grid}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-historical-gold/20 text-historical-gold' : 'text-historical-charcoal/50'}`}
          >
            {Icons.list}
          </button>
        </div>
      </motion.div>

      {/* Vendors Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredVendors.length === 0 ? (
          <motion.div variants={itemVariants} className="col-span-full text-center py-12">
            <p className="text-historical-charcoal/50">لا يوجد بائعين مطابقين للبحث</p>
          </motion.div>
        ) : (
          filteredVendors.map(vendor => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
              onToggleFeatured={handleToggleFeatured}
            />
          ))
        )}
      </motion.div>
    </motion.div>
  )
}

