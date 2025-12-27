'use client'

/**
 * Admin Coupons Management Page
 * صفحة إدارة كوبونات الخصم
 * 
 * Features:
 * - Coupon list with table view
 * - Filters (discount type, applicable to, active status)
 * - Search
 * - Create/Update/Delete coupons
 * - Real-time API integration
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCoupons, useCategories, useProducts, useUsers } from '@/lib/admin'
import type { Coupon, CouponPayload, CouponDiscountType, CouponApplicableTo } from '@/lib/admin'
import { useLanguage } from '@/lib/i18n/context'

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
// Helper Functions
// دوال مساعدة
// =============================================================================

const getDiscountTypeLabel = (type: CouponDiscountType, t: any) => {
  const labels = {
    percentage: t.admin.promotions.coupons.percentage,
    fixed: t.admin.promotions.coupons.fixed,
  }
  return labels[type]
}

const getApplicableToLabel = (applicable: CouponApplicableTo, t: any) => {
  const labels = {
    all: t.admin.promotions.coupons.allProducts,
    category: t.admin.promotions.coupons.specificCategory,
    product: t.admin.promotions.coupons.specificProduct,
    user: t.admin.promotions.coupons.specificUser,
  }
  return labels[applicable]
}

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

// Note: getUsagePercentage removed - calculated inline
// ملاحظة: getUsagePercentage تم إزالته - يتم حسابه مباشرة

// Note: getApplicableLabel renamed to getApplicableToLabel
// ملاحظة: getApplicableLabel تم تغيير اسمه إلى getApplicableToLabel

// =============================================================================
// Main Component
// =============================================================================

export default function CouponsPage() {
  const { t } = useLanguage()
  const {
    coupons,
    total,
    isLoading,
    isProcessing,
    error,
    filters,
    fetchCoupons,
    create,
    update,
    remove,
    setFilters,
    refresh,
  } = useCoupons()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<boolean | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Update filters when search or status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterStatus !== '') {
        newFilters.is_active = filterStatus as boolean
      } else {
        delete newFilters.is_active
      }
      setFilters(newFilters)
      fetchCoupons(newFilters)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = useCallback(async (id: number, isActive: boolean) => {
    const coupon = coupons.find(c => c.id === id)
    if (!coupon) return
    
    const success = await update(id, {
      ...coupon,
      is_active: !isActive,
    } as CouponPayload)
    
    if (success) {
      refresh()
    }
  }, [coupons, update, refresh])

  const handleDelete = useCallback(async (id: number) => {
    if (confirm(t.admin.promotions.coupons.confirmDelete)) {
      const success = await remove(id)
      if (success) {
        refresh()
      }
    }
  }, [remove, refresh, t])

  const handleEdit = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingCoupon(null)
    setIsModalOpen(true)
  }, [])

  const handleCopyCode = useCallback((id: number, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/promotions"
            className="p-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
          >
            {Icons.back}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal">{t.admin.promotions.coupons.pageTitle}</h1>
            <p className="text-historical-charcoal/50 mt-1">{t.admin.promotions.coupons.pageSubtitle}</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>{t.admin.promotions.coupons.createCoupon}</span>
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
            placeholder={t.admin.promotions.coupons.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value === '' ? '' : e.target.value === 'true')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">{t.admin.promotions.coupons.allStatuses}</option>
          <option value="true">{t.admin.promotions.coupons.active}</option>
          <option value="false">{t.admin.promotions.coupons.inactive}</option>
        </select>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Coupons Table */}
      {isLoading ? (
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft p-6"
        >
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-historical-stone animate-pulse rounded-xl" />
            ))}
          </div>
        </motion.div>
      ) : coupons.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10"
        >
          <p className="text-historical-charcoal/50">{t.admin.promotions.coupons.noCoupons}</p>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-historical-stone/50">
                <tr>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.code}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.description}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.discount}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.usage}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.validity}</th>
                  <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-4">{t.admin.promotions.coupons.status}</th>
                  <th className="w-24 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-historical-gold/5">
                {coupons.map((coupon) => {
                  const usagePercent = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0
                  const isExpired = coupon.end_date ? new Date(coupon.end_date) < new Date() : false
                  
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
                              title={t.admin.promotions.coupons.copyCode}
                            >
                              {copiedId === coupon.id ? '✓' : Icons.copy}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-historical-charcoal">{coupon.description_ar}</p>
                        <p className="text-xs text-historical-charcoal/50">{getApplicableToLabel(coupon.applicable_to, t)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-historical-gold">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} ${t.admin.promotions.coupons.syr}`}
                        </span>
                        {coupon.min_order > 0 && (
                          <p className="text-xs text-historical-charcoal/50">{t.admin.promotions.coupons.minOrder}: {coupon.min_order} {t.admin.promotions.coupons.syr}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-historical-charcoal">
                            {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}
                          </p>
                          {coupon.usage_limit && (
                            <div className="w-20 h-1.5 bg-historical-stone rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-historical-charcoal">
                          {new Date(coupon.start_date).toLocaleDateString('ar-SY')}
                        </p>
                        {coupon.end_date && (
                          <p className="text-xs text-historical-charcoal/50">
                            {t.admin.promotions.coupons.to} {new Date(coupon.end_date).toLocaleDateString('ar-SY')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {t.admin.promotions.coupons.expired}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggle(coupon.id, coupon.is_active)}
                            disabled={isProcessing}
                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                              coupon.is_active ? 'bg-green-500' : 'bg-historical-charcoal/20'
                            }`}
                          >
                            <motion.div
                              initial={false}
                              animate={{ x: coupon.is_active ? 22 : 4 }}
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
                            disabled={isProcessing}
                            className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
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
      )}

      {/* Add/Edit Modal */}
      <CouponModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        coupon={editingCoupon}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCoupon(null)
        }}
        onSave={async (data) => {
          let success = false
          if (editingCoupon) {
            success = await update(editingCoupon.id, data)
          } else {
            success = await create(data)
          }
          if (success) {
            setIsModalOpen(false)
            setEditingCoupon(null)
            refresh()
          }
          return success
        }}
      />
    </motion.div>
  )
}

// =============================================================================
// Coupon Modal Component
// مكون Modal الكوبون
// =============================================================================

interface CouponModalProps {
  isOpen: boolean
  isProcessing: boolean
  coupon: Coupon | null
  onClose: () => void
  onSave: (data: CouponPayload) => Promise<boolean>
}

function CouponModal({
  isOpen,
  isProcessing,
  coupon,
  onClose,
  onSave,
}: CouponModalProps) {
  const { t } = useLanguage()
  const { categoryTree, fetchCategoryTree } = useCategories()
  const { products, fetchProducts } = useProducts()
  const { users, fetchUsers } = useUsers()
  
  // Create a separate useCoupons instance for fetching details
  const couponHook = useCoupons()
  
  // Flatten category tree to simple array
  const categories = categoryTree.flatMap(cat => [
    cat,
    ...(cat.children || []).flatMap(child => [
      child,
      ...(child.children || [])
    ])
  ])
  
  const [formData, setFormData] = useState<CouponPayload>({
    code: '',
    description: '',
    description_ar: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order: 0,
    max_discount: null,
    usage_limit: null,
    applicable_to: 'all',
    applicable_categories: [],
    applicable_products: [],
    applicable_users: [],
    start_date: new Date().toISOString().slice(0, 16),
    end_date: null,
    is_active: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [searchCategory, setSearchCategory] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormErrors({})
      setSearchCategory('')
      setSearchProduct('')
      setSearchUser('')
      
      // Fetch data for dropdowns
      fetchCategoryTree(true)
      fetchProducts({ page_size: 100 })
      fetchUsers({ page_size: 100 })
      
      // Fetch coupon details if editing
      if (coupon) {
        setIsLoadingDetails(true)
        couponHook.fetchCouponDetails(coupon.id).then(() => {
          setIsLoadingDetails(false)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coupon?.id])

  // Update form when coupon details are loaded
  useEffect(() => {
    if (couponHook.selectedCoupon && coupon && coupon.id === couponHook.selectedCoupon.id && isOpen) {
      setFormData({
        code: couponHook.selectedCoupon.code,
        description: couponHook.selectedCoupon.description || '',
        description_ar: couponHook.selectedCoupon.description_ar || '',
        discount_type: couponHook.selectedCoupon.discount_type,
        discount_value: couponHook.selectedCoupon.discount_value,
        min_order: couponHook.selectedCoupon.min_order,
        max_discount: couponHook.selectedCoupon.max_discount,
        usage_limit: couponHook.selectedCoupon.usage_limit,
        applicable_to: couponHook.selectedCoupon.applicable_to,
        applicable_categories: couponHook.selectedCoupon.applicable_categories || [],
        applicable_products: couponHook.selectedCoupon.applicable_products || [],
        applicable_users: couponHook.selectedCoupon.applicable_users || [],
        start_date: couponHook.selectedCoupon.start_date.slice(0, 16),
        end_date: couponHook.selectedCoupon.end_date ? couponHook.selectedCoupon.end_date.slice(0, 16) : null,
        is_active: couponHook.selectedCoupon.is_active,
      })
    } else if (coupon && !couponHook.selectedCoupon && isOpen) {
      // Use basic coupon data if details not loaded yet
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        description_ar: coupon.description_ar || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order: coupon.min_order,
        max_discount: coupon.max_discount,
        usage_limit: coupon.usage_limit,
        applicable_to: coupon.applicable_to,
        applicable_categories: [],
        applicable_products: [],
        applicable_users: [],
        start_date: coupon.start_date.slice(0, 16),
        end_date: coupon.end_date ? coupon.end_date.slice(0, 16) : null,
        is_active: coupon.is_active,
      })
    } else if (!coupon && isOpen) {
      setFormData({
        code: '',
        description: '',
        description_ar: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order: 0,
        max_discount: null,
        usage_limit: null,
        applicable_to: 'all',
        applicable_categories: [],
        applicable_products: [],
        applicable_users: [],
        start_date: new Date().toISOString().slice(0, 16),
        end_date: null,
        is_active: true,
      })
    }
  }, [coupon, couponHook.selectedCoupon, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    if (!formData.code.trim()) {
      setFormErrors({ code: t.admin.promotions.coupons.codeRequired })
      return
    }
    if (formData.code.length < 3) {
      setFormErrors({ code: t.admin.promotions.coupons.codeMinLength })
      return
    }
    if (!formData.description_ar.trim()) {
      setFormErrors({ description_ar: t.admin.promotions.coupons.descriptionArRequired })
      return
    }
    if (formData.discount_value <= 0) {
      setFormErrors({ discount_value: t.admin.promotions.coupons.discountValueRequired })
      return
    }
    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      setFormErrors({ discount_value: t.admin.promotions.coupons.discountValueMax })
      return
    }

    const payload: CouponPayload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    }

    const success = await onSave(payload)
    if (success) {
      // Form will be reset by useEffect when modal closes
    }
  }

  const toggleCategory = (categoryId: number) => {
    setFormData(prev => {
      const current = prev.applicable_categories || []
      const newCategories = current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
      return { ...prev, applicable_categories: newCategories }
    })
  }

  const toggleProduct = (productId: number) => {
    setFormData(prev => {
      const current = prev.applicable_products || []
      const newProducts = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
      return { ...prev, applicable_products: newProducts }
    })
  }

  const toggleUser = (userId: number) => {
    setFormData(prev => {
      const current = prev.applicable_users || []
      const newUsers = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId]
      return { ...prev, applicable_users: newUsers }
    })
  }

  const filteredCategories = categories.filter(cat =>
    cat.name_ar.toLowerCase().includes(searchCategory.toLowerCase()) ||
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  )

  const filteredProducts = products.filter(prod =>
    prod.name_ar.toLowerCase().includes(searchProduct.toLowerCase()) ||
    prod.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchUser.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchUser.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
            <h2 className="text-lg font-bold text-historical-charcoal">
              {coupon ? t.admin.promotions.coupons.editCoupon : t.admin.promotions.coupons.createNewCoupon}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.coupons.codeLabel} *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 uppercase"
                placeholder={t.admin.promotions.coupons.codePlaceholder}
                dir="ltr"
                required
              />
              {formErrors.code && (
                <p className="text-sm text-red-600 mt-1">{formErrors.code}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.descriptionAr} *
                </label>
                <input
                  type="text"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  required
                />
                {formErrors.description_ar && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.description_ar}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.descriptionEn}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.discountType} *
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as CouponDiscountType })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  required
                >
                  <option value="percentage">{t.admin.promotions.coupons.percentage}</option>
                  <option value="fixed">{t.admin.promotions.coupons.fixed}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.discountValue} *
                </label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  min="0"
                  step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  required
                />
                {formErrors.discount_value && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.discount_value}</p>
                )}
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.minOrderLabel}
                </label>
                <input
                  type="number"
                  value={formData.min_order}
                  onChange={(e) => setFormData({ ...formData, min_order: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.maxDiscount}
                </label>
                <input
                  type="number"
                  value={formData.max_discount || ''}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder={t.admin.promotions.coupons.unlimited}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-historical-charcoal/50 mt-1">{t.admin.promotions.coupons.maxDiscountNote}</p>
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.coupons.usageLimit}
              </label>
              <input
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                placeholder={t.admin.promotions.coupons.unlimitedUsage}
                min="1"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.startDate} *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.endDate}
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                />
              </div>
            </div>

            {/* Applicable To */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.coupons.applicableTo} *
              </label>
              <select
                value={formData.applicable_to}
                onChange={(e) => {
                  const newApplicableTo = e.target.value as CouponApplicableTo
                  setFormData({
                    ...formData,
                    applicable_to: newApplicableTo,
                    // Clear selections when changing applicable_to
                    applicable_categories: newApplicableTo !== 'category' ? [] : formData.applicable_categories,
                    applicable_products: newApplicableTo !== 'product' ? [] : formData.applicable_products,
                    applicable_users: newApplicableTo !== 'user' ? [] : formData.applicable_users,
                  })
                }}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                required
              >
                <option value="all">{t.admin.promotions.coupons.allProducts}</option>
                <option value="category">{t.admin.promotions.coupons.specificCategory}</option>
                <option value="product">{t.admin.promotions.coupons.specificProduct}</option>
                <option value="user">{t.admin.promotions.coupons.specificUser}</option>
              </select>
            </div>

            {/* Category Selection */}
            {formData.applicable_to === 'category' && (
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.selectCategories}
                </label>
                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder={t.admin.promotions.coupons.searchCategory}
                  className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 mb-3 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                />
                <div className="max-h-48 overflow-y-auto border border-historical-gold/20 rounded-lg p-3 space-y-2">
                  {filteredCategories.length === 0 ? (
                    <p className="text-sm text-historical-charcoal/50 text-center py-4">{t.admin.promotions.coupons.noCategories}</p>
                  ) : (
                    filteredCategories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-historical-gold/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.applicable_categories || []).includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                        />
                        <span className="text-sm text-historical-charcoal">{category.name_ar}</span>
                      </label>
                    ))
                  )}
                </div>
                {(formData.applicable_categories || []).length > 0 && (
                  <p className="text-xs text-historical-charcoal/50 mt-2">
                    {t.admin.promotions.coupons.selectedCategories.replace('{count}', (formData.applicable_categories?.length || 0).toString())}
                  </p>
                )}
              </div>
            )}

            {/* Product Selection */}
            {formData.applicable_to === 'product' && (
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.selectProducts}
                </label>
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder={t.admin.promotions.coupons.searchProduct}
                  className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 mb-3 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                />
                <div className="max-h-48 overflow-y-auto border border-historical-gold/20 rounded-lg p-3 space-y-2">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-historical-charcoal/50 text-center py-4">{t.admin.promotions.coupons.noProducts}</p>
                  ) : (
                    filteredProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-historical-gold/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.applicable_products || []).includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                        />
                        <span className="text-sm text-historical-charcoal">{product.name_ar}</span>
                      </label>
                    ))
                  )}
                </div>
                {(formData.applicable_products || []).length > 0 && (
                  <p className="text-xs text-historical-charcoal/50 mt-2">
                    {t.admin.promotions.coupons.selectedProducts.replace('{count}', (formData.applicable_products?.length || 0).toString())}
                  </p>
                )}
              </div>
            )}

            {/* User Selection */}
            {formData.applicable_to === 'user' && (
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.coupons.selectUsers}
                </label>
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder={t.admin.promotions.coupons.searchUser}
                  className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 mb-3 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                />
                <div className="max-h-48 overflow-y-auto border border-historical-gold/20 rounded-lg p-3 space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-historical-charcoal/50 text-center py-4">{t.admin.promotions.coupons.noUsers}</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-historical-gold/10 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.applicable_users || []).includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                        />
                        <span className="text-sm text-historical-charcoal">
                          {user.email} {user.first_name && `(${user.first_name} ${user.last_name || ''})`}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {(formData.applicable_users || []).length > 0 && (
                  <p className="text-xs text-historical-charcoal/50 mt-2">
                    {t.admin.promotions.coupons.selectedUsers.replace('{count}', (formData.applicable_users?.length || 0).toString())}
                  </p>
                )}
              </div>
            )}

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                />
                <span className="text-sm text-historical-charcoal">{t.admin.promotions.active}</span>
              </label>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-historical-gold/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10 transition-colors"
            >
              {t.admin.promotions.coupons.cancel}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors disabled:opacity-50"
            >
              {isProcessing ? t.admin.promotions.coupons.saving : (coupon ? t.admin.promotions.coupons.saveChanges : t.admin.promotions.coupons.createCoupon)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

