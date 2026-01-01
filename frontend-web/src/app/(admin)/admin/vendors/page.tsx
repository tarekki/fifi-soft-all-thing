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

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVendors, createVendorWithUser } from '@/lib/admin'
import type {
  Vendor,
  VendorDetail,
  VendorFilters,
  VendorCreatePayload,
  VendorWithUserCreatePayload,
} from '@/lib/admin/types/vendors'
import { useLanguage } from '@/lib/i18n/context'


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
const formatCurrency = (amount: number, currencySymbol: string = 'ل.س', locale: string = 'ar-SY') => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' ' + currencySymbol
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
  const { t, language } = useLanguage()
  const locale = language === 'ar' ? 'ar-SY' : 'en-US'
  return (
    <motion.div
      variants={itemVariants}
      initial="visible"
      animate="visible"
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden hover:shadow-soft-lg transition-all duration-300 group"
    >
      {/* Header */}
      <div className="relative p-4 border-b border-historical-gold/10 dark:border-gray-700 bg-gradient-to-l from-historical-gold/5 dark:from-gray-700/30 to-transparent transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300"
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
            <h3 className="font-bold text-historical-charcoal dark:text-gray-100 truncate transition-colors duration-300">{vendor.name}</h3>
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 truncate transition-colors duration-300">{vendor.slug}</p>
            <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
              vendor.is_active
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {vendor.is_active ? t.admin.vendors.status.active : t.admin.vendors.status.inactive}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-historical-gold/10 dark:divide-gray-700 rtl:divide-x-reverse transition-colors duration-300">
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{vendor.products_count}</p>
          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.productsCount}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{vendor.orders_count}</p>
          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.ordersCount}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-bold text-historical-gold dark:text-yellow-400 transition-colors duration-300">{formatCurrency(vendor.total_revenue, t.common.currency, locale)}</p>
          <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.revenue}</p>
        </div>
      </div>

      {/* Commission */}
      <div className="px-4 py-3 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/20 dark:bg-gray-700/30 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{t.admin.vendors.commissionRateLabel}</span>
          <span className="font-bold text-historical-gold dark:text-yellow-400 transition-colors duration-300">{vendor.commission_rate}%</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{t.admin.vendors.stock}</span>
          <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{vendor.total_stock} {t.admin.vendors.unit}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onEdit(vendor)}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 font-medium hover:bg-historical-gold/20 dark:hover:bg-yellow-900/40 transition-colors"
          >
            {Icons.edit}
            <span>{t.admin.vendors.edit}</span>
          </button>
          <button
            onClick={() => onToggleStatus(vendor.id, !vendor.is_active)}
            disabled={isUpdating}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              vendor.is_active
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40'
            }`}
          >
            {isUpdating ? Icons.loader : (vendor.is_active ? Icons.x : Icons.check)}
            <span>{vendor.is_active ? t.admin.vendors.deactivate : t.admin.vendors.activate}</span>
          </button>
          <button
            onClick={() => onDelete(vendor.id)}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            title={t.admin.vendors.delete}
          >
            {Icons.trash}
            <span>{t.admin.vendors.delete}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}


// =============================================================================
// Delete Confirmation Modal
// مودال تأكيد الحذف
// =============================================================================

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  vendorName: string
  isDeleting: boolean
}

function DeleteModal({ isOpen, onClose, onConfirm, vendorName, isDeleting }: DeleteModalProps) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 mb-4 transition-colors duration-300">
            {t.admin.vendors.confirmDelete || 'تأكيد الحذف'}
          </h2>
          <p className="text-historical-charcoal/70 dark:text-gray-300 mb-6 transition-colors duration-300">
            {(t.admin.vendors.confirmDeleteMessage || 'هل أنت متأكد من حذف البائع "{name}"؟ لا يمكن التراجع عن هذا الإجراء.').replace('{name}', vendorName)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? Icons.loader : Icons.trash}
              {t.admin.vendors.delete}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 font-medium hover:bg-historical-gold/5 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {t.admin.users.form.cancel || 'إلغاء'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#D4AF37')
  const [commissionRate, setCommissionRate] = useState(10)
  const [isActive, setIsActive] = useState(true)
  const [logo, setLogo] = useState<File | null>(null)
  const [primaryColorError, setPrimaryColorError] = useState<string | null>(null)

  // Validation function for hex color
  // دالة التحقق من صيغة hex color
  const validateHexColor = (color: string): string | null => {
    if (!color) {
      return null // Empty is allowed (will use default)
    }
    // Hex color regex: # followed by exactly 6 hexadecimal characters
    // تعبير منتظم للون hex: # متبوع بـ 6 أحرف hex بالضبط
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexColorRegex.test(color)) {
      return t.admin.vendors.invalidHexColor || 'اللون يجب أن يكون بصيغة hex (مثال: #D4AF37)'
    }
    return null
  }

  // Handle primary color change with validation
  // معالجة تغيير اللون الأساسي مع التحقق
  const handlePrimaryColorChange = (value: string) => {
    setPrimaryColor(value)
    // Clear error if user is typing
    // مسح الخطأ إذا كان المستخدم يكتب
    if (primaryColorError) {
      const error = validateHexColor(value)
      setPrimaryColorError(error)
    }
  }

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
      setPrimaryColorError(null)
    } else if (isOpen && !vendor) {
      setName('')
      setDescription('')
      setPrimaryColor('#D4AF37')
      setCommissionRate(10)
      setIsActive(true)
      setLogo(null)
      setPrimaryColorError(null)
    }
  }, [isOpen, vendor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate primary color before submission
    // التحقق من اللون الأساسي قبل الإرسال
    const colorError = validateHexColor(primaryColor)
    if (colorError) {
      setPrimaryColorError(colorError)
      return
    }
    
    // Clear any previous errors
    // مسح أي أخطاء سابقة
    setPrimaryColorError(null)
    
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
          className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
            <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {vendor ? t.admin.vendors.edit : t.admin.vendors.addVendor}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {t.admin.vendors.name} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                placeholder={t.admin.vendors.namePlaceholder}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {t.admin.vendors.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 resize-none transition-colors duration-300"
                placeholder={t.admin.vendors.descriptionPlaceholder}
              />
            </div>

            {/* Color and Commission */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                  {t.admin.vendors.primaryColor}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-historical-gold/20 dark:border-gray-600 cursor-pointer transition-colors duration-300"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      onBlur={() => {
                        // Validate on blur (when user leaves the field)
                        // التحقق عند فقدان التركيز (عند مغادرة المستخدم للحقل)
                        const error = validateHexColor(primaryColor)
                        setPrimaryColorError(error)
                      }}
                      className={`w-full px-3 py-2 rounded-xl border ${
                        primaryColorError
                          ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                          : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                      } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                      placeholder="#D4AF37"
                    />
                    {primaryColorError && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                        {primaryColorError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                  {t.admin.vendors.commissionRate}
                </label>
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {t.admin.vendors.logo}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-historical-gold/10 dark:file:bg-yellow-900/30 file:text-historical-gold dark:file:text-yellow-400 hover:file:bg-historical-gold/20 dark:hover:file:bg-yellow-900/40"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-historical-gold/40 dark:border-gray-500 bg-white dark:bg-gray-700 text-historical-gold dark:text-yellow-400 focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50 cursor-pointer transition-all duration-300 flex-shrink-0"
              />
              <label htmlFor="is_active" className="text-base font-semibold text-historical-charcoal dark:text-gray-100 transition-colors duration-300 cursor-pointer select-none">
                تفعيل البائع - {isActive ? t.admin.vendors.status.active : t.admin.vendors.status.inactive}
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-stone/50 dark:hover:bg-gray-700 transition-colors"
              >
                {t.admin.users.form.cancel}
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? Icons.loader : Icons.check}
                <span>{vendor ? t.admin.vendors.saveChanges : t.admin.vendors.addVendorButton}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Vendor with User Modal Component
// مكون Modal إنشاء بائع مع مستخدم
// =============================================================================

interface VendorWithUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tempPassword: string | null) => void
}

function VendorWithUserModal({ isOpen, onClose, onSuccess }: VendorWithUserModalProps) {
  const { t } = useLanguage()
  
  // Form state
  const [vendorName, setVendorName] = useState('')
  const [vendorDescription, setVendorDescription] = useState('')
  const [vendorLogo, setVendorLogo] = useState<File | null>(null)
  const [vendorPrimaryColor, setVendorPrimaryColor] = useState('#D4AF37')
  const [commissionRate, setCommissionRate] = useState(10)
  const [isActive, setIsActive] = useState(true)
  
  const [userEmail, setUserEmail] = useState('')
  const [userFullName, setUserFullName] = useState('')
  const [userPhone, setUserPhone] = useState('')
  
  const [useExistingUser, setUseExistingUser] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [primaryColorError, setPrimaryColorError] = useState<string | null>(null)

  // Validation
  const validateHexColor = (color: string): string | null => {
    if (!color) return null
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexColorRegex.test(color)) {
      return t.admin.vendors.invalidHexColor || 'اللون يجب أن يكون بصيغة hex (مثال: #D4AF37)'
    }
    return null
  }

  // Reset form
  useEffect(() => {
    if (isOpen) {
      setVendorName('')
      setVendorDescription('')
      setVendorLogo(null)
      setVendorPrimaryColor('#D4AF37')
      setCommissionRate(10)
      setIsActive(true)
      setUserEmail('')
      setUserFullName('')
      setUserPhone('')
      setUseExistingUser(false)
      setUserId(null)
      setError(null)
      setPrimaryColorError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!vendorName.trim()) {
      setError('اسم البائع مطلوب')
      return
    }

    if (!useExistingUser) {
      if (!userEmail.trim()) {
        setError('البريد الإلكتروني مطلوب')
        return
      }
      if (!userFullName.trim()) {
        setError('الاسم الكامل مطلوب')
        return
      }
      if (!userPhone.trim()) {
        setError('رقم الهاتف مطلوب')
        return
      }
    } else {
      if (!userId) {
        setError('يجب تحديد معرف المستخدم')
        return
      }
    }

    const colorError = validateHexColor(vendorPrimaryColor)
    if (colorError) {
      setPrimaryColorError(colorError)
      return
    }

    setIsSubmitting(true)
    try {
      const payload: VendorWithUserCreatePayload = {
        vendor_name: vendorName,
        vendor_description: vendorDescription || undefined,
        vendor_logo: vendorLogo || undefined,
        vendor_primary_color: vendorPrimaryColor,
        commission_rate: commissionRate,
        is_active: isActive,
        user_email: userEmail,
        user_full_name: userFullName,
        user_phone: userPhone,
        use_existing_user: useExistingUser,
        user_id: userId || undefined,
      }

      const response = await createVendorWithUser(payload)

      if (response.success && response.data) {
        onSuccess(response.data.temp_password || null)
      } else {
        setError(response.message || 'فشل إنشاء البائع')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 backdrop-blur-sm transition-colors duration-300">
            <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              إنشاء بائع مع مستخدم
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 transition-colors duration-300">
                {error}
              </div>
            )}

            {/* Vendor Information Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-historical-charcoal dark:text-gray-200 border-b border-historical-gold/10 dark:border-gray-700 pb-2 transition-colors duration-300">
                معلومات البائع
              </h3>

              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                  اسم البائع *
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                  placeholder="اسم المتجر"
                />
              </div>

              {/* Vendor Description */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                  وصف البائع
                </label>
                <textarea
                  value={vendorDescription}
                  onChange={(e) => setVendorDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 resize-none transition-colors duration-300"
                  placeholder="وصف مختصر عن البائع"
                />
              </div>

              {/* Color and Commission */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                    اللون الأساسي
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={vendorPrimaryColor}
                      onChange={(e) => {
                        setVendorPrimaryColor(e.target.value)
                        setPrimaryColorError(null)
                      }}
                      className="w-12 h-10 rounded-lg border border-historical-gold/20 dark:border-gray-600 cursor-pointer transition-colors duration-300"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={vendorPrimaryColor}
                        onChange={(e) => {
                          setVendorPrimaryColor(e.target.value)
                          setPrimaryColorError(null)
                        }}
                        onBlur={() => {
                          const error = validateHexColor(vendorPrimaryColor)
                          setPrimaryColorError(error)
                        }}
                        className={`w-full px-3 py-2 rounded-xl border ${
                          primaryColorError
                            ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                            : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                        } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                        placeholder="#D4AF37"
                      />
                      {primaryColorError && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                          {primaryColorError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                    نسبة العمولة (%)
                  </label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.5}
                    className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                  شعار البائع
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVendorLogo(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-historical-gold/10 dark:file:bg-yellow-900/30 file:text-historical-gold dark:file:text-yellow-400 hover:file:bg-historical-gold/20 dark:hover:file:bg-yellow-900/40"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="vendor_is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-historical-gold/40 dark:border-gray-500 bg-white dark:bg-gray-700 text-historical-gold dark:text-yellow-400 focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50 cursor-pointer transition-all duration-300 flex-shrink-0"
                />
                <label htmlFor="vendor_is_active" className="text-base font-semibold text-historical-charcoal dark:text-gray-100 transition-colors duration-300 cursor-pointer select-none">
                  تفعيل البائع
                </label>
              </div>
            </div>

            {/* User Information Section */}
            <div className="space-y-4 pt-4 border-t border-historical-gold/10 dark:border-gray-700">
              <h3 className="text-base font-semibold text-historical-charcoal dark:text-gray-200 border-b border-historical-gold/10 dark:border-gray-700 pb-2 transition-colors duration-300">
                معلومات المستخدم
              </h3>

              {/* Use Existing User Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use_existing_user"
                  checked={useExistingUser}
                  onChange={(e) => {
                    setUseExistingUser(e.target.checked)
                    if (!e.target.checked) {
                      setUserId(null)
                    }
                  }}
                  className="w-5 h-5 rounded border-2 border-historical-gold/40 dark:border-gray-500 bg-white dark:bg-gray-700 text-historical-gold dark:text-yellow-400 focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50 cursor-pointer transition-all duration-300 flex-shrink-0"
                />
                <label htmlFor="use_existing_user" className="text-base font-semibold text-historical-charcoal dark:text-gray-100 transition-colors duration-300 cursor-pointer select-none">
                  استخدام مستخدم موجود
                </label>
              </div>

              {useExistingUser ? (
                /* Existing User Selection */
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                    معرف المستخدم (User ID) *
                  </label>
                  <input
                    type="number"
                    value={userId || ''}
                    onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : null)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                    placeholder="أدخل معرف المستخدم"
                  />
                  <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
                    يمكنك العثور على معرف المستخدم من صفحة المستخدمين
                  </p>
                </div>
              ) : (
                /* New User Fields */
                <>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                      placeholder="vendor@example.com"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                      placeholder="اسم البائع الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                      placeholder="0991234567"
                      dir="ltr"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-historical-gold/10 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-stone/50 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !vendorName.trim() || (!useExistingUser && (!userEmail.trim() || !userFullName.trim() || !userPhone.trim())) || (useExistingUser && !userId)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? Icons.loader : Icons.check}
                <span>إنشاء</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Temporary Password Modal Component
// مكون Modal عرض كلمة المرور المؤقتة
// =============================================================================

interface TempPasswordModalProps {
  password: string
  onClose: () => void
}

function TempPasswordModal({ password, onClose }: TempPasswordModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
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
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-gradient-to-l from-historical-gold/10 dark:from-yellow-900/20 to-transparent transition-colors duration-300">
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            كلمة المرور المؤقتة
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
          >
            {Icons.close}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
            تم إنشاء المستخدم بنجاح. يرجى حفظ كلمة المرور المؤقتة التالية:
          </p>

          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-4 py-3 rounded-xl border-2 border-historical-gold/30 dark:border-yellow-600/30 bg-historical-gold/5 dark:bg-yellow-900/10 text-historical-charcoal dark:text-gray-200 font-mono text-center text-lg font-bold transition-colors duration-300"
            />
            <button
              onClick={handleCopy}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
            >
              {copied ? 'تم النسخ!' : 'نسخ'}
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
              ⚠️ <strong>تحذير:</strong> هذه كلمة المرور المؤقتة. يرجى إرسالها للبائع بشكل آمن. يجب على البائع تغييرها عند أول تسجيل دخول.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium hover:shadow-lg transition-shadow"
          >
            تم
          </button>
        </div>
      </motion.div>
    </motion.div>
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
  const { t, language } = useLanguage()
  const {
    vendors,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isSaving,
    isDeleting,
    error,
    filters,
    fetchVendors,
    create,
    update,
    remove,
    toggleStatus,
    setFilters,
    refresh,
  } = useVendors()

  // Debug: Log vendors data
  useEffect(() => {
    console.log('=== VENDORS DEBUG ===')
    console.log('Vendors:', vendors)
    console.log('Vendors Length:', vendors.length)
    console.log('Is Loading:', isLoading)
    console.log('Error:', error)
    console.log('Total:', total)
    console.log('Condition 1 (isLoading && vendors.length === 0):', isLoading && vendors.length === 0)
    console.log('Condition 2 (!isLoading && vendors.length === 0):', !isLoading && vendors.length === 0)
    console.log('Condition 3 (vendors.length > 0):', vendors.length > 0)
    console.log('Should show vendors?', !isLoading && vendors.length > 0)
    console.log('====================')
  }, [vendors, isLoading, error, total])

  // =========================================================================
  // Local State
  // الحالة المحلية
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null)
  const [isVendorWithUserModalOpen, setIsVendorWithUserModalOpen] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const isInitialMount = useRef(true)

  // =========================================================================
  // Effects
  // التأثيرات
  // =========================================================================

  /**
   * Handle search with debounce
   * معالجة البحث مع تأخير
   */
  useEffect(() => {
    // Skip initial mount - hook already fetches vendors
    // تخطي التحميل الأول - الـ hook يجلب البائعين بالفعل
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

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
   * Handle add vendor with user
   * معالجة إضافة بائع مع مستخدم
   */
  const handleAddVendorWithUser = useCallback(() => {
    setIsVendorWithUserModalOpen(true)
    setTempPassword(null)
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
  const handleDeleteVendor = useCallback((id: number) => {
    const vendor = vendors.find(v => v.id === id)
    if (!vendor) return
    setDeletingVendor(vendor)
    setIsDeleteModalOpen(true)
  }, [vendors])

  /**
   * Handle confirm delete
   * معالجة تأكيد الحذف
   */
  const handleConfirmDelete = useCallback(async () => {
    if (deletingVendor) {
      const success = await remove(deletingVendor.id)
      if (success) {
        setIsDeleteModalOpen(false)
        setDeletingVendor(null)
        // Refresh vendors list
        await fetchVendors()
      }
    }
  }, [deletingVendor, remove, fetchVendors])

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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.vendors.title}</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{t.admin.vendors.subtitle}</p>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors font-medium"
          >
            {Icons.add}
            <span>{t.admin.vendors.addVendor}</span>
          </button>
          <button
            onClick={handleAddVendorWithUser}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {Icons.add}
            <span>إنشاء بائع مع مستخدم</span>
          </button>
        </div>
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
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                {stats?.total_vendors || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-green-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors duration-300">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                {stats?.active_vendors || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.status.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 dark:border-red-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-300">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">
                {stats?.inactive_vendors || 0}
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.status.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors duration-300">
              {Icons.money}
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                {stats?.average_commission_rate || 0}%
              </p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.averageCommission}</p>
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
            placeholder={t.admin.vendors.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-100 transition-colors duration-300"
        >
          <option value="all">{t.admin.vendors.allStatuses}</option>
          <option value="active">{t.admin.vendors.status.active}</option>
          <option value="inactive">{t.admin.vendors.status.inactive}</option>
        </select>
      </motion.div>

      {/* Vendors Grid */}
      {isLoading && vendors.length === 0 ? (
        <motion.div variants={itemVariants} className="flex items-center justify-center py-12">
          {Icons.loader}
          <span className="mr-2 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.loading}</span>
        </motion.div>
      ) : vendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="text-4xl mb-4">🏪</div>
          <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendors.noVendors}</p>
          <button
            onClick={handleAddVendor}
            className="mt-4 px-6 py-2 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/40 transition-colors"
          >
            {t.admin.vendors.addFirstVendor}
          </button>
        </motion.div>
      )}

      {/* Pagination */}
      {vendors.length > 0 && (hasNextPage || hasPreviousPage) && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <button
            onClick={() => handlePageChange('prev')}
            disabled={!hasPreviousPage || isLoading}
            className="px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/70 dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t.admin.vendors.previousPage}
          </button>
          <span className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            {t.admin.vendors.page} {currentPage}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={!hasNextPage || isLoading}
            className="px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/70 dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t.admin.vendors.nextPage}
          </button>
        </motion.div>
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingVendor && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setDeletingVendor(null)
            }}
            onConfirm={handleConfirmDelete}
            vendorName={deletingVendor.name}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Vendor with User Modal */}
      <VendorWithUserModal
        isOpen={isVendorWithUserModalOpen}
        onClose={() => {
          setIsVendorWithUserModalOpen(false)
          setTempPassword(null)
        }}
        onSuccess={(password) => {
          setTempPassword(password)
          setIsVendorWithUserModalOpen(false)
          refresh()
        }}
      />

      {/* Temporary Password Modal */}
      <AnimatePresence>
        {tempPassword && (
          <TempPasswordModal
            password={tempPassword}
            onClose={() => setTempPassword(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
