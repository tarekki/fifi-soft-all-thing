'use client'

/**
 * Admin Vendors Management Page
 * صفحة إدارة البائعين
 * 
 * Features / الميزات:
 * - Vendor list with cards view (connected to API)
 * - Create/Edit vendor
 * - Status management
 * - Commission management
 * - Vendor statistics
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVendors } from '@/lib/admin'
import type {
  Vendor,
  VendorDetail,
  VendorFilters,
  VendorCreatePayload,
} from '@/lib/admin/types/vendors'


// =============================================================================
// Icons
// الأيقونات
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
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
 * Format currency
 * تنسيق العملة
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SY', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' ل.س'
}


// =============================================================================
// Vendor Card Component
// مكون بطاقة البائع
// =============================================================================

interface VendorCardProps {
  vendor: Vendor
  onEdit: (vendor: Vendor) => void
  onToggleStatus: (id: number, isActive: boolean) => void
  onDelete: (id: number) => void
  isUpdating: boolean
}

function VendorCard({ vendor, onEdit, onToggleStatus, onDelete, isUpdating }: VendorCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden hover:shadow-soft-lg transition-shadow group"
    >
      {/* Header */}
      <div className="relative p-4 border-b border-historical-gold/10 bg-gradient-to-l from-historical-gold/5 to-transparent">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: vendor.primary_color || '#f5f5f5' }}
          >
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {vendor.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-historical-charcoal truncate">{vendor.name}</h3>
            <p className="text-sm text-historical-charcoal/50 truncate">{vendor.slug}</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              vendor.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {vendor.is_active ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-historical-gold/10 rtl:divide-x-reverse">
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal">{vendor.products_count}</p>
          <p className="text-xs text-historical-charcoal/50">منتج</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal">{vendor.orders_count}</p>
          <p className="text-xs text-historical-charcoal/50">طلب</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-gold">{formatCurrency(vendor.total_revenue)}</p>
          <p className="text-xs text-historical-charcoal/50">إيرادات</p>
        </div>
      </div>

      {/* Commission */}
      <div className="px-4 py-3 border-t border-historical-gold/10 bg-historical-stone/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-historical-charcoal/70">نسبة العمولة</span>
          <span className="font-bold text-historical-gold">{vendor.commission_rate}%</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-historical-charcoal/70">المخزون</span>
          <span className="font-medium text-historical-charcoal">{vendor.total_stock} وحدة</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-historical-gold/10 bg-historical-stone/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(vendor)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-historical-gold/10 text-historical-gold font-medium hover:bg-historical-gold/20 transition-colors"
          >
            {Icons.edit}
            <span>تعديل</span>
          </button>
          <button
            onClick={() => onToggleStatus(vendor.id, !vendor.is_active)}
            disabled={isUpdating}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              vendor.is_active
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isUpdating ? Icons.loader : (vendor.is_active ? Icons.x : Icons.check)}
            <span>{vendor.is_active ? 'تعطيل' : 'تفعيل'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}


// =============================================================================
// Vendor Modal Component
// مكون مودال البائع
// =============================================================================

interface VendorModalProps {
  isOpen: boolean
  vendor: Vendor | null
  isSaving: boolean
  onClose: () => void
  onSave: (data: VendorCreatePayload) => Promise<void>
}

function VendorModal({ isOpen, vendor, isSaving, onClose, onSave }: VendorModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#D4AF37')
  const [commissionRate, setCommissionRate] = useState(10)
  const [isActive, setIsActive] = useState(true)
  const [logo, setLogo] = useState<File | null>(null)

  // Reset form when modal opens/closes or vendor changes
  // إعادة تعيين النموذج عند فتح/إغلاق المودال أو تغيير البائع
  useEffect(() => {
    if (isOpen && vendor) {
      setName(vendor.name)
      setDescription(vendor.description || '')
      setPrimaryColor(vendor.primary_color || '#D4AF37')
      setCommissionRate(vendor.commission_rate)
      setIsActive(vendor.is_active)
      setLogo(null)
    } else if (isOpen && !vendor) {
      setName('')
      setDescription('')
      setPrimaryColor('#D4AF37')
      setCommissionRate(10)
      setIsActive(true)
      setLogo(null)
    }
  }, [isOpen, vendor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await onSave({
      name,
      description,
      primary_color: primaryColor,
      commission_rate: commissionRate,
      is_active: isActive,
      logo,
    })
  }

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
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <h2 className="text-lg font-bold text-historical-charcoal">
              {vendor ? 'تعديل البائع' : 'إضافة بائع جديد'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                اسم البائع *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                placeholder="مثال: متجر التقنية"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 resize-none"
                placeholder="وصف مختصر عن البائع..."
              />
            </div>

            {/* Color and Commission */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  اللون الأساسي
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-historical-gold/20 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-sm"
                    placeholder="#D4AF37"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-1">
                  نسبة العمولة (%)
                </label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-1">
                الشعار
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
              />
              <label htmlFor="is_active" className="text-sm text-historical-charcoal">
                البائع نشط
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-historical-gold/20 text-historical-charcoal hover:bg-historical-stone/50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? Icons.loader : Icons.check}
                <span>{vendor ? 'حفظ التعديلات' : 'إضافة البائع'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function VendorsPage() {
  // =========================================================================
  // Hook - Fetch vendors from API
  // الخطاف - جلب البائعين من API
  // =========================================================================
  const {
    vendors,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isSaving,
    error,
    filters,
    fetchVendors,
    create,
    update,
    toggleStatus,
    setFilters,
    refresh,
  } = useVendors()

  // =========================================================================
  // Local State
  // الحالة المحلية
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

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
      const newFilters: VendorFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterStatus === 'active') {
        newFilters.is_active = true
      } else if (filterStatus === 'inactive') {
        newFilters.is_active = false
      } else {
        delete newFilters.is_active
      }
      setFilters(newFilters)
      fetchVendors(newFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle add vendor
   * معالجة إضافة بائع
   */
  const handleAddVendor = useCallback(() => {
    setEditingVendor(null)
    setIsModalOpen(true)
  }, [])

  /**
   * Handle edit vendor
   * معالجة تعديل بائع
   */
  const handleEditVendor = useCallback((vendor: Vendor) => {
    setEditingVendor(vendor)
    setIsModalOpen(true)
  }, [])

  /**
   * Handle save vendor
   * معالجة حفظ البائع
   */
  const handleSaveVendor = useCallback(async (data: VendorCreatePayload) => {
    let success = false
    
    if (editingVendor) {
      success = await update(editingVendor.id, data)
    } else {
      success = await create(data)
    }
    
    if (success) {
      setIsModalOpen(false)
      setEditingVendor(null)
    }
  }, [editingVendor, create, update])

  /**
   * Handle toggle status
   * معالجة تغيير الحالة
   */
  const handleToggleStatus = useCallback(async (id: number, isActive: boolean) => {
    await toggleStatus(id, isActive)
  }, [toggleStatus])

  /**
   * Handle delete vendor
   * معالجة حذف بائع
   */
  const handleDeleteVendor = useCallback(async (id: number) => {
    // TODO: Add confirmation dialog
    console.log('Delete vendor:', id)
  }, [])

  /**
   * Handle page change
   * معالجة تغيير الصفحة
   */
  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    fetchVendors(newFilters)
  }, [currentPage, filters, setFilters, fetchVendors])

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
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة البائعين</h1>
          <p className="text-historical-charcoal/50 mt-1">عرض وإدارة جميع البائعين</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? Icons.loader : Icons.refresh}
          </button>
          <button
            onClick={handleAddVendor}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {Icons.add}
            <span>إضافة بائع</span>
          </button>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal">
                {stats?.total_vendors || 0}
              </p>
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
              <p className="text-2xl font-bold text-green-600">
                {stats?.active_vendors || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50">نشط</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats?.inactive_vendors || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50">غير نشط</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {Icons.money}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.average_commission_rate || 0}%
              </p>
              <p className="text-xs text-historical-charcoal/50">متوسط العمولة</p>
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
            placeholder="بحث بالاسم أو الوصف..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </motion.div>

      {/* Vendors Grid */}
      {isLoading && vendors.length === 0 ? (
        <motion.div variants={itemVariants} className="flex items-center justify-center py-12">
          {Icons.loader}
          <span className="mr-2 text-historical-charcoal/50">جاري تحميل البائعين...</span>
        </motion.div>
      ) : vendors.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="text-4xl mb-4">🏪</div>
          <p className="text-historical-charcoal/50">لا يوجد بائعين حالياً</p>
          <button
            onClick={handleAddVendor}
            className="mt-4 px-6 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors"
          >
            إضافة أول بائع
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {vendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onEdit={handleEditVendor}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteVendor}
                isUpdating={isSaving}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {(hasNextPage || hasPreviousPage) && (
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => handlePageChange('prev')}
                disabled={!hasPreviousPage || isLoading}
                className="px-4 py-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/70 hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الصفحة السابقة
              </button>
              <span className="text-historical-charcoal/50">
                صفحة {currentPage}
              </span>
              <button
                onClick={() => handlePageChange('next')}
                disabled={!hasNextPage || isLoading}
                className="px-4 py-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/70 hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الصفحة التالية
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        vendor={editingVendor}
        isSaving={isSaving}
        onClose={() => {
          setIsModalOpen(false)
          setEditingVendor(null)
        }}
        onSave={handleSaveVendor}
      />
    </motion.div>
  )
}
