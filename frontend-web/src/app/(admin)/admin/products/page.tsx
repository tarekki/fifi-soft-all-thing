'use client'

/**
 * Admin Products Management Page
 * صفحة إدارة المنتجات
 * 
 * Features:
 * - Product list with table view
 * - Filters (category, vendor, status)
 * - Search
 * - Bulk actions
 * - Quick edit
 * - Real-time API integration
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts, useCategories, useVendors } from '@/lib/admin'
import type { Product, ProductDetail, ProductStatus, ProductFilters, ProductCreatePayload } from '@/lib/admin'
import { 
  createProductImage, 
  getProduct, 
  deleteProductImage, 
  updateProductImage, 
  getProductImages,
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
} from '@/lib/admin/api/products'
import type { ProductImage, ProductVariant, ProductVariantCreatePayload } from '@/lib/admin/types/products'
import { useLanguage } from '@/lib/i18n/context'

// =============================================================================
// Types
// =============================================================================

type SortField = 'name' | 'price' | 'stock' | 'created_at'
type SortDirection = 'asc' | 'desc'

interface ProductFormData {
  name: string
  description: string
  base_price: number
  product_type: string
  vendor_id: number | null
  category_id: number | null
  is_active: boolean
  images?: File[] // صور المنتج
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
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chevronUp: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

const getStatusStyle = (status: ProductStatus) => {
  const styles = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    out_of_stock: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return styles[status]
}

const getStatusLabel = (status: ProductStatus, t: any) => {
  const labels = {
    active: t.admin.products.statuses.active,
    draft: t.admin.products.statuses.draft,
    out_of_stock: t.admin.products.statuses.outOfStock,
  }
  return labels[status] || status
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
  }).format(price)
}

// =============================================================================
// Product Modal Component
// =============================================================================

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
  product?: Product | null
  categories: { id: number; name: string; name_ar: string }[]
  vendors: { id: number; name: string }[]
  isSubmitting: boolean
}

function ProductModal({ isOpen, onClose, onSave, product, categories, vendors, isSubmitting }: ProductModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: 0,
    product_type: '',
    vendor_id: null,
    category_id: null,
    is_active: true,
    images: [],
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: '',
        base_price: product.base_price,
        product_type: '',
        vendor_id: product.vendor,
        category_id: product.category,
        is_active: product.is_active,
        images: [],
      })
      setImagePreviews([])
    } else {
      setFormData({
        name: '',
        description: '',
        base_price: 0,
        product_type: '',
        vendor_id: null,
        category_id: null,
        is_active: true,
        images: [],
      })
      setImagePreviews([])
    }
    
    // Cleanup preview URLs when modal closes
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4 my-4 transition-colors duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-historical-gold/10 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            {product ? t.admin.products.edit : t.admin.products.addProduct}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-historical-charcoal dark:text-gray-200">
            {Icons.close}
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
              {t.admin.products.name}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
              {t.admin.categories.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 resize-none transition-colors duration-300"
            />
          </div>

          {/* Vendor Selection - Required */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
              {t.admin.products.vendor} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.vendor_id || ''}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
              required
            >
              <option value="">{t.admin.products.selectVendor || 'اختر البائع / Select Vendor'}</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {t.admin.products.basePrice}
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {t.admin.products.category}
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
              >
                <option value="">{t.admin.products.noCategory}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar || cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Images Upload */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
              {t.admin.products.images || 'صور المنتج / Product Images'}
            </label>
            <div className="space-y-3">
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-historical-stone/20 dark:bg-gray-700/20 rounded-lg">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg border border-historical-gold/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images?.filter((_, i) => i !== index) || []
                          const newPreviews = imagePreviews.filter((_, i) => i !== index)
                          // Cleanup URL
                          URL.revokeObjectURL(preview)
                          setFormData({ ...formData, images: newImages })
                          setImagePreviews(newPreviews)
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-historical-gold text-white text-[10px] rounded">
                          {t.admin.products.primary || 'أساسية'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-historical-gold/30 dark:border-gray-600 rounded-xl cursor-pointer hover:border-historical-gold/50 dark:hover:border-gray-500 transition-colors bg-historical-stone/20 dark:bg-gray-700/20">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-historical-charcoal/40 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-historical-charcoal/50 dark:text-gray-400">
                    <span className="font-semibold">{t.admin.products.clickToUpload || 'اضغط للرفع / Click to upload'}</span>
                  </p>
                  <p className="text-xs text-historical-charcoal/40 dark:text-gray-500">
                    {t.admin.products.imageFormat || 'PNG, JPG, GIF (حتى 5MB)'}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      const newImages = [...(formData.images || []), ...files]
                      setFormData({ ...formData, images: newImages })
                      
                      // Create previews
                      const newPreviews = files.map(file => URL.createObjectURL(file))
                      setImagePreviews([...imagePreviews, ...newPreviews])
                    }
                  }}
                />
              </label>
              {formData.images && formData.images.length > 0 && (
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400">
                  {t.admin.products.selectedImages || 'الصور المحددة'}: {formData.images.length}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-historical-gold/40 dark:border-gray-500 bg-white dark:bg-gray-700 text-historical-gold dark:text-yellow-400 focus:ring-2 focus:ring-historical-gold/50 dark:focus:ring-yellow-500/50 cursor-pointer transition-all duration-300 flex-shrink-0"
            />
            <label htmlFor="is_active" className="text-base font-semibold text-historical-charcoal dark:text-gray-100 transition-colors duration-300 cursor-pointer select-none">
              تفعيل المنتج - {formData.is_active ? t.admin.products.statuses.active : t.admin.products.statuses.inactive || 'غير نشط'}
            </label>
          </div>

        </form>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-6 border-t border-historical-gold/10 dark:border-gray-700 flex-shrink-0">
            <button
              type="submit"
            onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
            >
              {isSubmitting ? Icons.loader : null}
              {product ? t.admin.users.form.update : t.admin.users.form.create}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 font-medium hover:bg-historical-gold/5 dark:hover:bg-gray-700 transition-colors"
            >
              {t.admin.users.form.cancel}
            </button>
          </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// Delete Confirmation Modal
// =============================================================================

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  productName: string
  isSubmitting: boolean
}

function DeleteModal({ isOpen, onClose, onConfirm, productName, isSubmitting }: DeleteModalProps) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 transition-colors duration-300"
      >
        <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 mb-4 transition-colors duration-300">{t.admin.products.confirmDelete}</h2>
        <p className="text-historical-charcoal/70 dark:text-gray-300 mb-6 transition-colors duration-300">
          {t.admin.products.confirmDeleteMessage.replace('{name}', productName)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? Icons.loader : null}
            {t.admin.products.delete}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 font-medium hover:bg-historical-gold/5 dark:hover:bg-gray-700 transition-colors"
          >
            {t.admin.users.form.cancel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// View Product Modal Component
// =============================================================================

interface ViewProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

function ViewProductModal({ isOpen, onClose, product }: ViewProductModalProps) {
  const { t } = useLanguage()
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState<number | null>(null)
  const [isUpdatingImage, setIsUpdatingImage] = useState<number | null>(null)
  const [showAddImageForm, setShowAddImageForm] = useState(false)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [replacingImageId, setReplacingImageId] = useState<number | null>(null)
  const [replaceImageFile, setReplaceImageFile] = useState<File | null>(null)
  const [replaceImagePreview, setReplaceImagePreview] = useState<string | null>(null)
  
  // Variants Management State
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [isSavingVariant, setIsSavingVariant] = useState(false)
  const [isDeletingVariant, setIsDeletingVariant] = useState<number | null>(null)
  const [variantFormData, setVariantFormData] = useState<ProductVariantCreatePayload>({
    color: '',
    color_hex: '',
    size: '',
    model: '',
    sku: '',
    stock_quantity: 0,
    price_override: null,
    image: null,
    is_available: true,
  })
  const [variantImagePreview, setVariantImagePreview] = useState<string | null>(null)
  
  // Fetch product details when modal opens
  const fetchProductDetails = useCallback(async () => {
    if (product) {
      setIsLoadingDetail(true)
      try {
        const response = await getProduct(product.id)
        if (response.success && response.data) {
          setProductDetail(response.data)
        }
      } catch (err) {
        console.error('Error fetching product details:', err)
      } finally {
        setIsLoadingDetail(false)
      }
    }
  }, [product])
  
  // Fetch variants
  const fetchVariants = useCallback(async () => {
    if (product) {
      setIsLoadingVariants(true)
      try {
        const response = await getProductVariants(product.id)
        if (response.success && response.data) {
          setVariants(response.data)
        }
      } catch (err) {
        console.error('Error fetching variants:', err)
      } finally {
        setIsLoadingVariants(false)
      }
    }
  }, [product])
  
  useEffect(() => {
    if (isOpen && product) {
      fetchProductDetails()
      fetchVariants()
    } else {
      setProductDetail(null)
      setVariants([])
      setShowAddImageForm(false)
      setShowVariantForm(false)
      setEditingVariant(null)
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview)
      }
      if (replaceImagePreview) {
        URL.revokeObjectURL(replaceImagePreview)
      }
      if (variantImagePreview) {
        URL.revokeObjectURL(variantImagePreview)
      }
      setNewImageFile(null)
      setNewImagePreview(null)
      setReplacingImageId(null)
      setReplaceImageFile(null)
      setReplaceImagePreview(null)
      setVariantFormData({
        color: '',
        color_hex: '',
        size: '',
        model: '',
        sku: '',
        stock_quantity: 0,
        price_override: null,
        image: null,
        is_available: true,
      })
      setVariantImagePreview(null)
    }
  }, [isOpen, product, fetchProductDetails, fetchVariants])
  
  // Handle delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!product || !confirm(t.admin.products.confirmDeleteImage || 'هل أنت متأكد من حذف هذه الصورة؟')) {
      return
    }
    
    setIsDeletingImage(imageId)
    try {
      const response = await deleteProductImage(product.id, imageId)
      if (response.success) {
        // Refresh product details
        await fetchProductDetails()
      } else {
        alert(response.message || 'فشل حذف الصورة')
      }
    } catch (err) {
      console.error('Error deleting image:', err)
      alert('حدث خطأ أثناء حذف الصورة')
    } finally {
      setIsDeletingImage(null)
    }
  }
  
  // Handle set primary image
  const handleSetPrimary = async (imageId: number) => {
    if (!product) return
    
    setIsUpdatingImage(imageId)
    try {
      const response = await updateProductImage(product.id, imageId, {
        is_primary: true,
      })
      if (response.success) {
        await fetchProductDetails()
      } else {
        alert(response.message || 'فشل تحديث الصورة')
      }
    } catch (err) {
      console.error('Error updating image:', err)
      alert('حدث خطأ أثناء تحديث الصورة')
    } finally {
      setIsUpdatingImage(null)
    }
  }
  
  // Handle add new image
  const handleAddImage = async () => {
    if (!product || !newImageFile) return
    
    setIsUpdatingImage(-1) // Use -1 to indicate adding new image
    try {
      const currentImagesCount = productDetail?.images?.length || 0
      const response = await createProductImage(product.id, {
        image: newImageFile,
        display_order: currentImagesCount,
        is_primary: currentImagesCount === 0, // Primary if first image
        alt_text: `${product.name} - Image ${currentImagesCount + 1}`,
      })
      
      if (response.success) {
        await fetchProductDetails()
        setShowAddImageForm(false)
        setNewImageFile(null)
        if (newImagePreview) {
          URL.revokeObjectURL(newImagePreview)
        }
        setNewImagePreview(null)
      } else {
        alert(response.message || 'فشل رفع الصورة')
      }
    } catch (err) {
      console.error('Error adding image:', err)
      alert('حدث خطأ أثناء رفع الصورة')
    } finally {
      setIsUpdatingImage(null)
    }
  }
  
  // Handle replace image
  const handleReplaceImage = async (imageId: number) => {
    if (!product || !replaceImageFile) return
    
    setIsUpdatingImage(imageId)
    try {
      const response = await updateProductImage(product.id, imageId, {
        image: replaceImageFile,
      })
      
      if (response.success) {
        await fetchProductDetails()
        setReplacingImageId(null)
        setReplaceImageFile(null)
        if (replaceImagePreview) {
          URL.revokeObjectURL(replaceImagePreview)
        }
        setReplaceImagePreview(null)
      } else {
        alert(response.message || 'فشل استبدال الصورة')
      }
    } catch (err) {
      console.error('Error replacing image:', err)
      alert('حدث خطأ أثناء استبدال الصورة')
    } finally {
      setIsUpdatingImage(null)
    }
  }
  
  // Handle replace image file selection
  const handleReplaceImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageId: number) => {
    const file = e.target.files?.[0]
    if (file) {
      setReplacingImageId(imageId)
      setReplaceImageFile(file)
      const preview = URL.createObjectURL(file)
      setReplaceImagePreview(preview)
    }
  }
  
  // =============================================================================
  // Variants Management Functions
  // =============================================================================
  
  // Handle variant image file selection
  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVariantFormData({ ...variantFormData, image: file })
      const preview = URL.createObjectURL(file)
      setVariantImagePreview(preview)
    }
  }
  
  // Open variant form for adding new variant
  const handleAddVariant = () => {
    setEditingVariant(null)
    setVariantFormData({
      color: '',
      color_hex: '',
      size: '',
      model: '',
      sku: '',
      stock_quantity: 0,
      price_override: null,
      image: null,
      is_available: true,
    })
    setVariantImagePreview(null)
    setShowVariantForm(true)
  }
  
  // Open variant form for editing
  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setVariantFormData({
      color: variant.color,
      color_hex: variant.color_hex || '',
      size: variant.size || '',
      model: variant.model || '',
      sku: variant.sku || '',
      stock_quantity: variant.stock_quantity,
      price_override: variant.price_override,
      image: null, // Don't set image file, will use existing
      is_available: variant.is_available,
    })
    setVariantImagePreview(variant.image_url || null)
    setShowVariantForm(true)
  }
  
  // Save variant (create or update)
  const handleSaveVariant = async () => {
    if (!product) return
    
    if (!variantFormData.color.trim()) {
      alert('اللون مطلوب / Color is required')
      return
    }
    
    if (variantFormData.stock_quantity < 0) {
      alert('المخزون يجب أن يكون أكبر من أو يساوي صفر / Stock must be >= 0')
      return
    }
    
    setIsSavingVariant(true)
    try {
      let response
      if (editingVariant) {
        // Update existing variant
        response = await updateProductVariant(product.id, editingVariant.id, variantFormData)
      } else {
        // Create new variant
        response = await createProductVariant(product.id, variantFormData)
      }
      
      if (response.success) {
        await fetchVariants()
        await fetchProductDetails() // Refresh to update total_stock
        setShowVariantForm(false)
        setEditingVariant(null)
        setVariantFormData({
          color: '',
          color_hex: '',
          size: '',
          model: '',
          sku: '',
          stock_quantity: 0,
          price_override: null,
          image: null,
          is_available: true,
        })
        if (variantImagePreview) {
          URL.revokeObjectURL(variantImagePreview)
        }
        setVariantImagePreview(null)
      } else {
        alert(response.message || 'فشل حفظ المتغير / Failed to save variant')
      }
    } catch (err) {
      console.error('Error saving variant:', err)
      alert('حدث خطأ أثناء حفظ المتغير / Error saving variant')
    } finally {
      setIsSavingVariant(false)
    }
  }
  
  // Delete variant
  const handleDeleteVariant = async (variantId: number) => {
    if (!product || !confirm('هل أنت متأكد من حذف هذا المتغير؟ / Are you sure you want to delete this variant?')) {
      return
    }
    
    setIsDeletingVariant(variantId)
    try {
      const response = await deleteProductVariant(product.id, variantId)
      if (response.success) {
        await fetchVariants()
        await fetchProductDetails() // Refresh to update total_stock
      } else {
        alert(response.message || 'فشل حذف المتغير / Failed to delete variant')
      }
    } catch (err) {
      console.error('Error deleting variant:', err)
      alert('حدث خطأ أثناء حذف المتغير / Error deleting variant')
    } finally {
      setIsDeletingVariant(null)
    }
  }
  
  // Handle image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageFile(file)
      const preview = URL.createObjectURL(file)
      setNewImagePreview(preview)
    }
  }
  
  if (!isOpen || !product) return null

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
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
            <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
              {t.admin.products.viewProduct || 'عرض المنتج'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-historical-gold"></div>
              </div>
            ) : (
              <>
                {/* Product Images Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100">
                      {t.admin.products.images || 'صور المنتج'}
                    </h3>
                    <button
                      onClick={() => setShowAddImageForm(!showAddImageForm)}
                      className="px-4 py-2 rounded-lg bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors text-sm font-medium"
                    >
                      {showAddImageForm ? 'إلغاء' : '+'} {t.admin.products.addImage || 'إضافة صورة'}
                    </button>
                  </div>
                  
                  {/* Add Image Form */}
                  {showAddImageForm && (
                    <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/20">
                      <div className="space-y-3">
                        {newImagePreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                setNewImageFile(null)
                                setNewImagePreview(null)
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-historical-gold/30 rounded-lg cursor-pointer hover:border-historical-gold/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-8 h-8 mb-2 text-historical-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="mb-2 text-sm text-historical-charcoal/50">
                                <span className="font-semibold">اضغط للاختيار</span>
                              </p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                          </label>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddImage}
                            disabled={!newImageFile || isUpdatingImage === -1}
                            className="flex-1 px-4 py-2 rounded-lg bg-historical-gold text-white hover:bg-historical-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isUpdatingImage === -1 ? 'جاري الرفع...' : 'رفع الصورة'}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddImageForm(false)
                              setNewImageFile(null)
                              setNewImagePreview(null)
                            }}
                            className="px-4 py-2 rounded-lg border border-historical-gold/20 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/5 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Images Grid */}
                  {productDetail?.images && productDetail.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productDetail.images.map((img, index) => (
                        <div key={img.id} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-historical-gold/20">
                            <img 
                              src={img.image_url || img.image} 
                              alt={img.alt_text || product.name} 
                              className="w-full h-full object-cover" 
                            />
                            
                            {/* Overlay with actions */}
                            {replacingImageId !== img.id && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                <button
                                  onClick={() => handleSetPrimary(img.id)}
                                  disabled={img.is_primary || isUpdatingImage === img.id}
                                  className="w-full px-3 py-1.5 rounded-lg bg-historical-gold text-white text-xs font-medium hover:bg-historical-gold/90 disabled:opacity-50 transition-colors"
                                  title="تحديد كصورة أساسية"
                                >
                                  {img.is_primary ? '⭐ أساسية' : '⭐ جعل أساسية'}
                                </button>
                                <label className="w-full px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 cursor-pointer transition-colors text-center">
                                  🔄 استبدال
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleReplaceImageFileChange(e, img.id)}
                                  />
                                </label>
                                <button
                                  onClick={() => handleDeleteImage(img.id)}
                                  disabled={isDeletingImage === img.id}
                                  className="w-full px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                                  title="حذف الصورة"
                                >
                                  {isDeletingImage === img.id ? 'جاري الحذف...' : '🗑️ حذف'}
                                </button>
                              </div>
                            )}
                            
                            {/* Replace Image Form */}
                            {replacingImageId === img.id && (
                              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-2 p-2">
                                {replaceImagePreview ? (
                                  <>
                                    <img src={replaceImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded" />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleReplaceImage(img.id)}
                                        disabled={isUpdatingImage === img.id}
                                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                                      >
                                        {isUpdatingImage === img.id ? 'جاري...' : '✓ حفظ'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReplacingImageId(null)
                                          setReplaceImageFile(null)
                                          if (replaceImagePreview) {
                                            URL.revokeObjectURL(replaceImagePreview)
                                          }
                                          setReplaceImagePreview(null)
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-gray-500 text-white text-xs font-medium hover:bg-gray-600 transition-colors"
                                      >
                                        ✕ إلغاء
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <label className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 cursor-pointer transition-colors">
                                    اختر صورة جديدة
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleReplaceImageFileChange(e, img.id)}
                                    />
                                  </label>
                                )}
                              </div>
                            )}
                            
                            {/* Primary badge */}
                            {img.is_primary && (
                              <span className="absolute top-2 left-2 px-2 py-1 bg-historical-gold text-white text-xs font-medium rounded">
                                ⭐ {t.admin.products.primary || 'أساسية'}
                              </span>
                            )}
                            
                            {/* Order badge */}
                            <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : product.main_image ? (
              <div className="w-full h-64 rounded-xl overflow-hidden bg-historical-stone dark:bg-gray-700">
                <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
              </div>
                  ) : (
                    <div className="w-full h-64 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 flex items-center justify-center">
                      <p className="text-historical-charcoal/50 dark:text-gray-400">
                        {t.admin.products.noImage || 'لا توجد صورة / No image'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Variants Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-historical-charcoal dark:text-gray-100">
                      {t.admin.products.variants || 'متغيرات المنتج / Product Variants'}
                    </h3>
                    <button
                      onClick={handleAddVariant}
                      disabled={showVariantForm}
                      className="px-4 py-2 rounded-lg bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      + {t.admin.products.addVariant || 'إضافة متغير / Add Variant'}
                    </button>
                  </div>

                  {/* Variant Form */}
                  {showVariantForm && (
                    <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/20">
                      <h4 className="text-md font-semibold text-historical-charcoal dark:text-gray-100 mb-4">
                        {editingVariant ? (t.admin.products.editVariant || 'تعديل متغير / Edit Variant') : (t.admin.products.addVariant || 'إضافة متغير جديد / Add New Variant')}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.color || 'اللون / Color'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variantFormData.color}
                            onChange={(e) => setVariantFormData({ ...variantFormData, color: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            required
                          />
                        </div>

                        {/* Color Hex */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.colorHex || 'كود اللون / Color Hex'}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={variantFormData.color_hex || '#000000'}
                              onChange={(e) => setVariantFormData({ ...variantFormData, color_hex: e.target.value })}
                              className="w-16 h-10 rounded-lg border border-historical-gold/20 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={variantFormData.color_hex || ''}
                              onChange={(e) => setVariantFormData({ ...variantFormData, color_hex: e.target.value })}
                              placeholder="#000000"
                              className="flex-1 px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.size || 'الحجم / Size'}
                          </label>
                          <input
                            type="text"
                            value={variantFormData.size || ''}
                            onChange={(e) => setVariantFormData({ ...variantFormData, size: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            placeholder="مثال: 38, 40, 42"
                          />
                        </div>

                        {/* Model */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.model || 'الموديل / Model'}
                          </label>
                          <input
                            type="text"
                            value={variantFormData.model || ''}
                            onChange={(e) => setVariantFormData({ ...variantFormData, model: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                          />
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.sku || 'SKU'}
                          </label>
                          <input
                            type="text"
                            value={variantFormData.sku || ''}
                            onChange={(e) => setVariantFormData({ ...variantFormData, sku: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            placeholder="سيتم توليده تلقائياً إذا تركت فارغاً"
                          />
                        </div>

                        {/* Stock Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.stockQuantity || 'المخزون / Stock Quantity'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={variantFormData.stock_quantity}
                            onChange={(e) => setVariantFormData({ ...variantFormData, stock_quantity: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            min={0}
                            required
                          />
                        </div>

                        {/* Price Override */}
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.priceOverride || 'سعر خاص / Price Override'}
                          </label>
                          <input
                            type="number"
                            value={variantFormData.price_override || ''}
                            onChange={(e) => setVariantFormData({ ...variantFormData, price_override: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-historical-charcoal dark:text-gray-200"
                            min={0}
                            step="0.01"
                            placeholder="اتركه فارغاً لاستخدام السعر الأساسي"
                          />
                        </div>

                        {/* Is Available */}
                        <div className="flex items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={variantFormData.is_available}
                              onChange={(e) => setVariantFormData({ ...variantFormData, is_available: e.target.checked })}
                              className="w-4 h-4 rounded border-historical-gold/20 text-historical-gold focus:ring-historical-gold/30"
                            />
                            <span className="text-sm font-medium text-historical-charcoal/70 dark:text-gray-300">
                              {t.admin.products.isAvailable || 'متاح / Available'}
                            </span>
                          </label>
                        </div>

                        {/* Variant Image */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1">
                            {t.admin.products.variantImage || 'صورة المتغير / Variant Image'}
                          </label>
                          {variantImagePreview ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-historical-gold/20">
                              <img src={variantImagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                onClick={() => {
                                  setVariantFormData({ ...variantFormData, image: null })
                                  if (variantImagePreview && !editingVariant?.image_url) {
                                    URL.revokeObjectURL(variantImagePreview)
                                  }
                                  setVariantImagePreview(null)
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-historical-gold/30 rounded-lg cursor-pointer hover:border-historical-gold/50 transition-colors">
                              <svg className="w-6 h-6 mb-1 text-historical-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="text-xs text-historical-charcoal/50">إضافة صورة</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleVariantImageChange} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleSaveVariant}
                          disabled={isSavingVariant || !variantFormData.color.trim()}
                          className="flex-1 px-4 py-2 rounded-lg bg-historical-gold text-white hover:bg-historical-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSavingVariant ? (t.admin.products.saving || 'جاري الحفظ...') : (t.admin.products.save || 'حفظ')}
                        </button>
                        <button
                          onClick={() => {
                            setShowVariantForm(false)
                            setEditingVariant(null)
                            setVariantFormData({
                              color: '',
                              color_hex: '',
                              size: '',
                              model: '',
                              sku: '',
                              stock_quantity: 0,
                              price_override: null,
                              image: null,
                              is_available: true,
                            })
                            if (variantImagePreview && !editingVariant?.image_url) {
                              URL.revokeObjectURL(variantImagePreview)
                            }
                            setVariantImagePreview(null)
                          }}
                          className="px-4 py-2 rounded-lg border border-historical-gold/20 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/5 transition-colors"
                        >
                          {t.admin.users.form.cancel || 'إلغاء'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Variants Table */}
                  {isLoadingVariants ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-historical-gold"></div>
                    </div>
                  ) : variants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-historical-stone/30 dark:bg-gray-700/30 border-b border-historical-gold/20">
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.color || 'اللون'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.size || 'الحجم'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.sku || 'SKU'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.stockQuantity || 'المخزون'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.price || 'السعر'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.status || 'الحالة'}</th>
                            <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-3">{t.admin.products.actions || 'الإجراءات'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant) => (
                            <tr key={variant.id} className="border-b border-historical-gold/10 dark:border-gray-700 hover:bg-historical-stone/10 dark:hover:bg-gray-700/10 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {variant.color_hex && (
                                    <div 
                                      className="w-4 h-4 rounded-full border border-historical-gold/20" 
                                      style={{ backgroundColor: variant.color_hex }}
                                    />
                                  )}
                                  <span className="text-sm text-historical-charcoal dark:text-gray-200">{variant.color}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-historical-charcoal dark:text-gray-200">{variant.size || '-'}</td>
                              <td className="px-4 py-3 text-sm text-historical-charcoal/70 dark:text-gray-400 font-mono">{variant.sku || '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`text-sm font-medium ${
                                  variant.stock_quantity === 0 
                                    ? 'text-red-500 dark:text-red-400' 
                                    : variant.stock_quantity < 10 
                                      ? 'text-yellow-600 dark:text-yellow-400' 
                                      : 'text-historical-charcoal dark:text-gray-200'
                                }`}>
                                  {variant.stock_quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-historical-charcoal dark:text-gray-200">
                                {formatPrice(variant.final_price)}
                                {variant.price_override && (
                                  <span className="text-xs text-historical-charcoal/50 dark:text-gray-400 block">(خاص)</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  variant.is_available 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {variant.is_available ? (t.admin.products.available || 'متاح') : (t.admin.products.unavailable || 'غير متاح')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditVariant(variant)}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title={t.admin.products.edit || 'تعديل'}
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVariant(variant.id)}
                                    disabled={isDeletingVariant === variant.id}
                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                    title={t.admin.products.delete || 'حذف'}
                                  >
                                    {isDeletingVariant === variant.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-historical-charcoal/50 dark:text-gray-400">
                      <p>{t.admin.products.noVariants || 'لا توجد متغيرات / No variants'}</p>
                      <p className="text-xs mt-1">{t.admin.products.addFirstVariant || 'اضغط على "إضافة متغير" لإضافة أول متغير / Click "Add Variant" to add the first variant'}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 mb-2 transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {product.category_name_ar || product.category_name || '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                  <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mb-1 transition-colors duration-300">
                    {t.admin.products.price}
                  </p>
                  <p className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
                    {formatPrice(product.base_price)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                  <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mb-1 transition-colors duration-300">
                    {t.admin.products.stock}
                  </p>
                  <p className={`text-lg font-bold transition-colors duration-300 ${
                    product.total_stock === 0 
                      ? 'text-red-500 dark:text-red-400' 
                      : product.total_stock < 10 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-historical-charcoal dark:text-gray-100'
                  }`}>
                    {product.total_stock}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mb-2 transition-colors duration-300">
                  {t.admin.products.status}
                </p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(product.status)}`}>
                  {getStatusLabel(product.status, t)}
                </span>
              </div>

              {product.vendor_name && (
                <div className="p-4 rounded-xl bg-historical-stone/30 dark:bg-gray-700/30 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                  <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mb-1 transition-colors duration-300">
                    {t.admin.products.vendor}
                  </p>
                  <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                    {product.vendor_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
            >
              {t.admin.users.form.cancel || 'إغلاق'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function ProductsPage() {
  // API Hooks
  const { t, language } = useLanguage()
  const {
    products,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    bulkAction,
    goToPage,
  } = useProducts({ page_size: 10 })

  const { categories } = useCategories()
  const { vendors, fetchVendors } = useVendors()
  
  // Fetch vendors on mount
  useEffect(() => {
    fetchVendors().catch(err => {
      console.error('Error fetching vendors:', err)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Local State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [filterCategory, setFilterCategory] = useState<number | ''>('')
  const [filterStatus, setFilterStatus] = useState<ProductStatus | ''>('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts({
        search: searchQuery || undefined,
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        sort_by: sortField,
        sort_dir: sortDirection,
        page: 1,
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterCategory, filterStatus, sortField, sortDirection])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }, [selectedProducts.length, products])

  const handleSelectProduct = useCallback((id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }, [])

  const handleAddClick = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleViewClick = (product: Product) => {
    setViewingProduct(product)
    setIsViewModalOpen(true)
  }

  const handleSaveProduct = async (formData: ProductFormData) => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      alert(t.admin.products.nameRequired || 'اسم المنتج مطلوب')
      return
    }
    
    if (!formData.base_price || formData.base_price <= 0) {
      alert(t.admin.products.priceRequired || 'السعر مطلوب ويجب أن يكون أكبر من صفر')
      return
    }

    // For creating new products, we need vendor_id
    // For now, we'll just use a dummy vendor_id of 1 if not editing
    // In a real app, you'd have a vendor selector
    if (editingProduct) {
      const result = await editProduct(editingProduct.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        base_price: formData.base_price,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
      })
      if (result) {
        setIsModalOpen(false)
        setEditingProduct(null)
      }
    } else {
      // For new products, vendor_id is required
      // البائع مطلوب للمنتجات الجديدة
      if (!formData.vendor_id || formData.vendor_id <= 0) {
        alert(t.admin.products.vendorRequired || 'البائع مطلوب / Vendor is required')
        return
      }
      
      const vendorId = formData.vendor_id

      const payload: ProductCreatePayload = {
        name: formData.name.trim(),
        base_price: formData.base_price,
        vendor_id: vendorId,
        is_active: formData.is_active ?? true,
      }
      
      // Add optional fields only if they have values
      if (formData.description?.trim()) {
        payload.description = formData.description.trim()
      }
      if (formData.category_id) {
        payload.category_id = formData.category_id
      }
      
      console.log('Creating product with payload:', payload)
      
      try {
        const result = await addProduct(payload)
        if (result) {
          // Upload images if any
          // رفع الصور إن وجدت
          if (formData.images && formData.images.length > 0 && result.id) {
            try {
              for (let i = 0; i < formData.images.length; i++) {
                const image = formData.images[i]
                await createProductImage(result.id, {
                  image: image,
                  display_order: i,
                  is_primary: i === 0, // First image is primary
                  alt_text: `${formData.name} - Image ${i + 1}`,
                })
              }
              console.log(`Successfully uploaded ${formData.images.length} images`)
            } catch (imageError) {
              console.error('Error uploading images:', imageError)
              // Don't fail the whole operation if images fail
              alert('تم إنشاء المنتج بنجاح، لكن حدث خطأ في رفع بعض الصور')
            }
          }
          
          setIsModalOpen(false)
          setEditingProduct(null)
          // Reset form
          // إعادة تعيين النموذج
        } else {
          // Error is already set by addProduct hook
          console.error('Failed to create product')
          // Show error message from hook
          // عرض رسالة الخطأ من الهوك
        }
      } catch (err) {
        console.error('Error in handleSaveProduct:', err)
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        alert(errorMessage)
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      const success = await removeProduct(deletingProduct.id)
      if (success) {
        setIsDeleteModalOpen(false)
        setDeletingProduct(null)
      }
    }
  }

  const handleBulkActivate = async () => {
    await bulkAction(selectedProducts, 'activate')
    setSelectedProducts([])
  }

  const handleBulkDeactivate = async () => {
    await bulkAction(selectedProducts, 'deactivate')
    setSelectedProducts([])
  }

  const handleBulkDelete = async () => {
    if (confirm(t.admin.products.confirmBulkDelete.replace('{count}', selectedProducts.length.toString()))) {
      await bulkAction(selectedProducts, 'delete')
      setSelectedProducts([])
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="mr-1 text-historical-charcoal/30">
      {sortField === field ? (
        sortDirection === 'asc' ? Icons.chevronUp : Icons.chevronDown
      ) : (
        <span className="opacity-0 group-hover:opacity-50">{Icons.chevronDown}</span>
      )}
    </span>
  )

  // Loading State
  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {Icons.loader}
          <p className="text-historical-charcoal/50">{t.admin.dashboard.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.products.title}</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {totalCount || 0} {t.admin.products.name}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>{t.admin.products.addProduct}</span>
        </button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.products.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-800 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">{t.admin.products.allCategories}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_ar || cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ProductStatus | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-800 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-100 transition-colors duration-300"
        >
          <option value="">{t.admin.products.allStatuses}</option>
          <option value="active">{t.admin.products.statuses.active}</option>
          <option value="draft">{t.admin.products.statuses.draft}</option>
          <option value="out_of_stock">{t.admin.products.statuses.outOfStock}</option>
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-historical-gold/20 dark:border-gray-700 p-1 transition-colors duration-300">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-historical-gold/20 text-historical-gold dark:text-yellow-400' : 'text-historical-charcoal/50 dark:text-gray-400'}`}
          >
            {Icons.list}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-historical-gold/20 text-historical-gold dark:text-yellow-400' : 'text-historical-charcoal/50 dark:text-gray-400'}`}
          >
            {Icons.grid}
          </button>
        </div>
      </motion.div>

      {/* Bulk Actions (when items selected) */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/20 border border-historical-gold/20 dark:border-yellow-800 transition-colors duration-300"
          >
            <span className="text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
              {t.admin.products.selectedCount.replace('{count}', selectedProducts.length.toString())}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkActivate}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {t.admin.products.activate}
              </button>
              <button
                onClick={handleBulkDeactivate}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-gray-500/10 text-gray-600 text-sm font-medium hover:bg-gray-500/20 transition-colors disabled:opacity-50"
              >
                {t.admin.products.deactivate}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {t.admin.products.delete}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-historical-charcoal/50 dark:text-gray-400 text-lg transition-colors duration-300">{t.admin.products.noProducts}</p>
            <button
              onClick={handleAddClick}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 font-medium hover:bg-historical-gold/20 dark:hover:bg-yellow-900/40 transition-colors"
            >
              {Icons.add}
              <span>{t.admin.products.addFirstProduct}</span>
            </button>
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
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                      />
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.products.name}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.products.category}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.products.vendor}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      <button onClick={() => handleSort('price')} className="flex items-center group">
                        {t.admin.products.price}
                        <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      <button onClick={() => handleSort('stock')} className="flex items-center group">
                        {t.admin.products.stock}
                        <SortIcon field="stock" />
                      </button>
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">{t.admin.products.status}</th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 px-4 py-4 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
                  {products.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-historical-stone overflow-hidden flex-shrink-0">
                            {product.main_image ? (
                              <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-historical-charcoal/30 dark:text-gray-600">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-historical-charcoal dark:text-gray-200 truncate transition-colors duration-300">{product.name}</p>
                            <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate transition-colors duration-300">
                              {product.variants_count} {t.admin.products.variant}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
                          {product.category_name_ar || product.category_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
                          {product.vendor_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                          {formatPrice(product.base_price)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium transition-colors duration-300 ${product.total_stock === 0 ? 'text-red-500 dark:text-red-400' : product.total_stock < 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-historical-charcoal dark:text-gray-200'}`}>
                          {product.total_stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(product.status)}`}>
                          {getStatusLabel(product.status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewClick(product)}
                            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title={t.admin.products.view}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
                            title={t.admin.products.edit}
                          >
                            {Icons.edit}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t.admin.products.delete}
                          >
                            {Icons.delete}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
              <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                {t.admin.products.showingProducts
                  .replace('{start}', (((currentPage - 1) * 10) + 1).toString())
                  .replace('{end}', Math.min(currentPage * 10, totalCount || 0).toString())
                  .replace('{total}', (totalCount || 0).toString())}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronRight}
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-historical-gold text-white'
                          : 'text-historical-charcoal/50 hover:bg-historical-gold/10'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                {totalPages > 5 && <span className="text-historical-charcoal/50">...</span>}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronLeft}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingProduct(null)
            }}
            onSave={handleSaveProduct}
            product={editingProduct}
            categories={categories.map(c => ({ id: c.id, name: c.name, name_ar: c.name_ar }))}
            vendors={vendors?.map(v => ({ id: v.id, name: v.name })) || []}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingProduct && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setDeletingProduct(null)
            }}
            onConfirm={handleConfirmDelete}
            productName={deletingProduct.name}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* View Product Modal */}
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewingProduct(null)
        }}
        product={viewingProduct}
      />
    </motion.div>
  )
}
