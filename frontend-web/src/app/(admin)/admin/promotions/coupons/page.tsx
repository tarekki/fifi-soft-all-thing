'use client'

/**
 * Admin Coupons Management Page
 * صفحة إدارة كوبونات الخصم
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Coupon {
  id: string
  code: string
  description: string
  descriptionAr: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableTo: 'all' | 'category' | 'product' | 'user'
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
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  ),
  tag: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WINTER25',
    description: '25% off on all products',
    descriptionAr: 'خصم 25% على جميع المنتجات',
    discountType: 'percentage',
    discountValue: 25,
    minOrderAmount: 50,
    maxDiscount: 100,
    usageLimit: 200,
    usedCount: 156,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    isActive: true,
    applicableTo: 'all',
  },
  {
    id: '2',
    code: 'FIRST10',
    description: '10% off for first order',
    descriptionAr: 'خصم 10% على الطلب الأول',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 50,
    usageLimit: null,
    usedCount: 423,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    isActive: true,
    applicableTo: 'user',
  },
  {
    id: '3',
    code: 'FREESHIP',
    description: 'Free shipping on orders over $100',
    descriptionAr: 'شحن مجاني للطلبات فوق 100$',
    discountType: 'fixed',
    discountValue: 10,
    minOrderAmount: 100,
    maxDiscount: null,
    usageLimit: 500,
    usedCount: 289,
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    isActive: true,
    applicableTo: 'all',
  },
  {
    id: '4',
    code: 'TECH20',
    description: '20% off electronics',
    descriptionAr: 'خصم 20% على الإلكترونيات',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 100,
    maxDiscount: 200,
    usageLimit: 100,
    usedCount: 100,
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    isActive: false,
    applicableTo: 'category',
  },
  {
    id: '5',
    code: 'VIP50',
    description: '$50 off for VIP customers',
    descriptionAr: 'خصم 50$ لعملاء VIP',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 200,
    maxDiscount: null,
    usageLimit: 50,
    usedCount: 12,
    startDate: '2024-12-15',
    endDate: '2025-01-15',
    isActive: true,
    applicableTo: 'user',
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
// Helpers
// =============================================================================

const getUsagePercentage = (coupon: Coupon) => {
  if (!coupon.usageLimit) return null
  return Math.round((coupon.usedCount / coupon.usageLimit) * 100)
}

const getApplicableLabel = (type: Coupon['applicableTo']) => {
  const labels = {
    all: 'جميع المنتجات',
    category: 'فئة محددة',
    product: 'منتج محدد',
    user: 'مستخدم محدد',
  }
  return labels[type]
}

// =============================================================================
// Main Component
// =============================================================================

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(mockCoupons)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleToggle = useCallback((id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكوبون؟')) {
      setCoupons(prev => prev.filter(c => c.id !== id))
    }
  }, [])

  const handleEdit = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingCoupon(null)
    setIsModalOpen(true)
  }, [])

  const handleCopyCode = useCallback((id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.descriptionAr.includes(searchQuery)
    const matchesStatus = !filterStatus || 
      (filterStatus === 'active' && c.isActive) ||
      (filterStatus === 'inactive' && !c.isActive) ||
      (filterStatus === 'expired' && new Date(c.endDate) < new Date())
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/promotions"
            className="p-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
          >
            {Icons.back}
          </a>
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal">كوبونات الخصم</h1>
            <p className="text-historical-charcoal/50 mt-1">إنشاء وإدارة أكواد الخصم</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>إنشاء كوبون</span>
        </button>
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
            placeholder="بحث بالكود أو الوصف..."
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
          <option value="inactive">غير نشط</option>
          <option value="expired">منتهي</option>
        </select>
      </motion.div>

      {/* Coupons Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50">
              <tr>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الكود</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الوصف</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الخصم</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الاستخدام</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الصلاحية</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">الحالة</th>
                <th className="w-24 px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {filteredCoupons.map((coupon) => {
                const usagePercent = getUsagePercentage(coupon)
                const isExpired = new Date(coupon.endDate) < new Date()
                
                return (
                  <tr key={coupon.id} className="hover:bg-historical-gold/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
                          {Icons.tag}
                        </div>
                        <div>
                          <code className="font-bold text-historical-charcoal">{coupon.code}</code>
                          <button
                            onClick={() => handleCopyCode(coupon.id, coupon.code)}
                            className="mr-2 p-1 text-historical-charcoal/30 hover:text-historical-gold transition-colors"
                            title="نسخ الكود"
                          >
                            {copiedId === coupon.id ? '✓' : Icons.copy}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-historical-charcoal">{coupon.descriptionAr}</p>
                      <p className="text-xs text-historical-charcoal/50">{getApplicableLabel(coupon.applicableTo)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-historical-gold">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </span>
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-xs text-historical-charcoal/50">حد أدنى: ${coupon.minOrderAmount}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-historical-charcoal">
                          {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                        </p>
                        {usagePercent !== null && (
                          <div className="w-20 h-1.5 bg-historical-stone rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-historical-charcoal">
                        {new Date(coupon.startDate).toLocaleDateString('ar-SY')}
                      </p>
                      <p className="text-xs text-historical-charcoal/50">
                        إلى {new Date(coupon.endDate).toLocaleDateString('ar-SY')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {isExpired ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          منتهي
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggle(coupon.id)}
                          className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                            coupon.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{ x: coupon.isActive ? 22 : 4 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
                        >
                          {Icons.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {Icons.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
                <h2 className="text-lg font-bold text-historical-charcoal">
                  {editingCoupon ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:bg-historical-gold/10"
                >
                  {Icons.close}
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">كود الخصم</label>
                  <input
                    type="text"
                    defaultValue={editingCoupon?.code}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 uppercase"
                    placeholder="مثال: SUMMER20"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">الوصف (عربي)</label>
                  <input
                    type="text"
                    defaultValue={editingCoupon?.descriptionAr}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">نوع الخصم</label>
                    <select
                      defaultValue={editingCoupon?.discountType || 'percentage'}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    >
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">قيمة الخصم</label>
                    <input
                      type="number"
                      defaultValue={editingCoupon?.discountValue}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">الحد الأدنى للطلب</label>
                    <input
                      type="number"
                      defaultValue={editingCoupon?.minOrderAmount || 0}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">الحد الأقصى للخصم</label>
                    <input
                      type="number"
                      defaultValue={editingCoupon?.maxDiscount || ''}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      placeholder="غير محدد"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">عدد مرات الاستخدام</label>
                  <input
                    type="number"
                    defaultValue={editingCoupon?.usageLimit || ''}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    placeholder="غير محدود"
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">تاريخ البداية</label>
                    <input
                      type="date"
                      defaultValue={editingCoupon?.startDate}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">تاريخ النهاية</label>
                    <input
                      type="date"
                      defaultValue={editingCoupon?.endDate}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">ينطبق على</label>
                  <select
                    defaultValue={editingCoupon?.applicableTo || 'all'}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  >
                    <option value="all">جميع المنتجات</option>
                    <option value="category">فئة محددة</option>
                    <option value="product">منتج محدد</option>
                    <option value="user">مستخدم محدد</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-historical-gold/10">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10"
                >
                  إلغاء
                </button>
                <button className="px-6 py-2.5 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors">
                  {editingCoupon ? 'حفظ التغييرات' : 'إنشاء الكوبون'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

