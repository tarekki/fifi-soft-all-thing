'use client'

/**
 * Vendor Products Management Page
 * صفحة إدارة منتجات البائع
 * 
 * Features:
 * - Product list with table view (connected to API)
 * - Create/Edit/Delete products
 * - Search and filters
 * - Pagination
 * 
 * الميزات:
 * - قائمة المنتجات مع عرض جدول (مربوطة بـ API)
 * - إنشاء/تعديل/حذف المنتجات
 * - البحث والفلترة
 * - التقسيم
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useLanguage } from '@/lib/i18n/context'
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  X,
  Loader2,
  Warehouse,
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getVendorProducts,
  getVendorProduct,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorCategories,
  updateVendorProductStock,
  createVendorProductVariant,
  type VendorProduct,
  type VendorProductDetail,
  type VendorProductCreatePayload,
  type VendorProductVariantCreatePayload,
  type VendorProductUpdatePayload,
  type VendorProductFilters,
  type VendorCategory,
} from '@/lib/vendor/api'

// =============================================================================
// Types
// الأنواع
// =============================================================================

interface ProductFormData {
  name: string
  description: string
  base_price: number
  product_type: string
  category_id: number | null
  is_active: boolean
  images?: File[]
}

// =============================================================================
// Icons
// الأيقونات
// =============================================================================

const Icons = {
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  loader: (
    <Loader2 className="w-5 h-5 animate-spin" />
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
// دوال مساعدة
// =============================================================================

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    out_of_stock: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  }
  return styles[status] || styles.draft
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="w-3 h-3" />
    case 'out_of_stock':
      return <AlertCircle className="w-3 h-3" />
    case 'draft':
      return <Clock className="w-3 h-3" />
    default:
      return null
  }
}

const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
  }).format(numPrice)
}

// =============================================================================
// Product Modal Component
// مكون Modal المنتج
// =============================================================================

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
  product?: VendorProduct | null
  categories: VendorCategory[]
  isSubmitting: boolean
}

function ProductModal({ isOpen, onClose, onSave, product, categories, isSubmitting }: ProductModalProps) {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    base_price: 0,
    product_type: '',
    category_id: null,
    is_active: true,
    images: [],
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        base_price: parseFloat(product.base_price),
        product_type: product.product_type || '',
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
            {product ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-historical-charcoal dark:text-gray-200">
            {Icons.close}
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
              {language === 'ar' ? 'اسم المنتج' : 'Product Name'} <span className="text-red-500">*</span>
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
              {language === 'ar' ? 'الوصف' : 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 resize-none transition-colors duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {language === 'ar' ? 'السعر الأساسي' : 'Base Price'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                min={0}
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-1 transition-colors duration-300">
                {language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
              >
                <option value="">{language === 'ar' ? 'بدون فئة' : 'No Category'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ar' ? (cat.name_ar || cat.name) : cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Images Upload */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
              {language === 'ar' ? 'صور المنتج' : 'Product Images'}
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
                          URL.revokeObjectURL(preview)
                          setFormData({ ...formData, images: newImages })
                          setImagePreviews(newPreviews)
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-historical-gold text-white text-[10px] rounded">
                          {language === 'ar' ? 'أساسية' : 'Primary'}
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
                    <span className="font-semibold">{language === 'ar' ? 'اضغط للرفع' : 'Click to upload'}</span>
                  </p>
                  <p className="text-xs text-historical-charcoal/40 dark:text-gray-500">
                    PNG, JPG, GIF {language === 'ar' ? '(حتى 5MB)' : '(up to 5MB)'}
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
                      
                      const newPreviews = files.map(file => URL.createObjectURL(file))
                      setImagePreviews([...imagePreviews, ...newPreviews])
                    }
                  }}
                />
              </label>
              {formData.images && formData.images.length > 0 && (
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400">
                  {language === 'ar' ? 'الصور المحددة' : 'Selected Images'}: {formData.images.length}
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
              {language === 'ar' ? 'تفعيل المنتج' : 'Activate Product'} - {formData.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
            {product ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إنشاء' : 'Create')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 font-medium hover:bg-historical-gold/5 dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// Alert & Confirm Modals
// نوافذ التنبيه والتأكيد
// =============================================================================

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4 p-6 border ${colors[type]}`}
      >
        <h3 className="font-bold mb-2">{title}</h3>
        <p className="text-sm mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-gold/90 transition-colors"
        >
          OK
        </button>
      </motion.div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  const { language } = useLanguage()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4 p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="font-bold text-historical-charcoal dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function ProductsPage() {
  const { t, dir } = useTranslation()
  const { language } = useLanguage()
  
  // State
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [categories, setCategories] = useState<VendorCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'active' | 'draft' | 'out_of_stock' | ''>('')
  const [filterCategory, setFilterCategory] = useState<number | ''>('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<VendorProduct | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<VendorProduct | null>(null)
  
  // Stock Management Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [stockProduct, setStockProduct] = useState<VendorProductDetail | null>(null)
  const [stockVariants, setStockVariants] = useState<Array<{id: number, stock_quantity: number}>>([])
  const [isLoadingStock, setIsLoadingStock] = useState(false)
  
  
  // Alert State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })
  
  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getVendorCategories({ is_active: true, page_size: 100 })
      if (response.success && response.data) {
        setCategories(response.data.results)
      }
    } catch (err) {
    }
  }, [])
  
  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters: VendorProductFilters = {
        page: currentPage,
        page_size: pageSize,
      }
      
      if (search) {
        filters.search = search
      }
      if (filterStatus) {
        filters.status = filterStatus
      }
      if (filterCategory) {
        filters.category = filterCategory
      }
      
      const response = await getVendorProducts(filters)
      
      if (response.success && response.data) {
        setProducts(response.data.results)
        setTotalPages(response.data.pagination.total_pages)
        setTotalCount(response.data.pagination.count)
      } else {
        setError(response.message || 'Failed to fetch products')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search, filterStatus, filterCategory])
  
  // Initial Load
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])
  
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])
  
  // Show Alert
  const showAlert = useCallback((title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type })
  }, [])
  
  // Handle Save Product
  const handleSaveProduct = useCallback(async (formData: ProductFormData) => {
    if (!formData.name || !formData.name.trim()) {
      showAlert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'اسم المنتج مطلوب' : 'Product name is required',
        'error'
      )
      return
    }
    
    if (!formData.base_price || formData.base_price <= 0) {
      showAlert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'السعر مطلوب ويجب أن يكون أكبر من صفر' : 'Price is required and must be greater than zero',
        'error'
      )
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (editingProduct) {
        // Update product
        const payload: VendorProductUpdatePayload = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          base_price: formData.base_price,
          category_id: formData.category_id || null,
          is_active: formData.is_active,
        }
        
        const response = await updateVendorProduct(editingProduct.id, payload)
        
        if (response.success) {
          showAlert(
            language === 'ar' ? 'نجح' : 'Success',
            language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully',
            'success'
          )
          setIsModalOpen(false)
          setEditingProduct(null)
          await fetchProducts()
        } else {
          showAlert(
            language === 'ar' ? 'خطأ' : 'Error',
            response.message || (language === 'ar' ? 'فشل تحديث المنتج' : 'Failed to update product'),
            'error'
          )
        }
      } else {
        // Create product
        const payload: VendorProductCreatePayload = {
          name: formData.name.trim(),
          base_price: formData.base_price,
          is_active: formData.is_active ?? true,
        }
        
        if (formData.description?.trim()) {
          payload.description = formData.description.trim()
        }
        if (formData.category_id) {
          payload.category_id = formData.category_id
        }
        
        const response = await createVendorProduct(payload)
        
        if (response.success) {
          showAlert(
            language === 'ar' ? 'نجح' : 'Success',
            language === 'ar' ? 'تم إنشاء المنتج بنجاح' : 'Product created successfully',
            'success'
          )
          setIsModalOpen(false)
          await fetchProducts()
          
          // TODO: Upload images if provided
          // Note: Image upload will be handled in a separate step after product creation
        } else {
          showAlert(
            language === 'ar' ? 'خطأ' : 'Error',
            response.message || (language === 'ar' ? 'فشل إنشاء المنتج' : 'Failed to create product'),
            'error'
          )
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showAlert(
        language === 'ar' ? 'خطأ' : 'Error',
        errorMessage,
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [editingProduct, fetchProducts, showAlert, language])
  
  // Handle Delete Product
  const handleDeleteProduct = useCallback(async () => {
    if (!deletingProduct) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await deleteVendorProduct(deletingProduct.id)
      
      if (response.success) {
        showAlert(
          language === 'ar' ? 'نجح' : 'Success',
          language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully',
          'success'
        )
        setIsDeleteModalOpen(false)
        setDeletingProduct(null)
        await fetchProducts()
      } else {
        showAlert(
          language === 'ar' ? 'خطأ' : 'Error',
          response.message || (language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product'),
          'error'
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showAlert(
        language === 'ar' ? 'خطأ' : 'Error',
        errorMessage,
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [deletingProduct, fetchProducts, showAlert, language])
  
  // Handle Edit
  const handleEdit = useCallback((product: VendorProduct) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }, [])
  
  // Handle Delete Click
  const handleDeleteClick = useCallback((product: VendorProduct) => {
    setDeletingProduct(product)
    setIsDeleteModalOpen(true)
  }, [])
  
  // Handle Add New
  const handleAddNew = useCallback(() => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }, [])
  
  // Handle Stock Management
  const handleStockManagement = useCallback(async (product: VendorProduct) => {
    setIsLoadingStock(true)
    
    // Set basic product info immediately to show modal
    // ضبط معلومات المنتج الأساسية فوراً لعرض Modal
    const basicProductData: VendorProductDetail = {
      ...product,
      images: [],
      variants: [],
    } as VendorProductDetail
    
    setStockProduct(basicProductData)
    setStockVariants([])
    setIsStockModalOpen(true)
    
    try {
      const response = await getVendorProduct(product.id)
      
      if (response.success && response.data) {
        setStockProduct(response.data)
        
        // Ensure we have variants data
        const variantsData = response.data.variants && Array.isArray(response.data.variants) && response.data.variants.length > 0
          ? response.data.variants.map(v => ({
              id: v.id,
              stock_quantity: v.stock_quantity || 0
            }))
          : []
        
        setStockVariants(variantsData)
      } else {
        showAlert(
          language === 'ar' ? 'تحذير' : 'Warning',
          response.message || (language === 'ar' ? 'فشل جلب تفاصيل المنتج، لكن يمكنك إدارة المخزون' : 'Failed to fetch product details, but you can manage stock'),
          'warning'
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showAlert(
        language === 'ar' ? 'تحذير' : 'Warning',
        language === 'ar' ? 'فشل جلب تفاصيل المنتج، لكن يمكنك إدارة المخزون' : 'Failed to fetch product details, but you can manage stock',
        'warning'
      )
    } finally {
      setIsLoadingStock(false)
    }
  }, [showAlert, language])
  
  
  // Handle Stock Update
  const handleStockUpdate = useCallback(async () => {
    if (!stockProduct) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare variants data for API
      // تحضير بيانات المتغيرات للـ API
      const variantsPayload = stockVariants.map(v => ({
        id: v.id,
        stock_quantity: v.stock_quantity,
      }))
      
      // Call API to update stock
      // استدعاء API لتحديث المخزون
      const response = await updateVendorProductStock(stockProduct.id, variantsPayload)
      
      if (response.success && response.data) {
        showAlert(
          language === 'ar' ? 'نجح' : 'Success',
          language === 'ar' ? 'تم تحديث المخزون بنجاح' : 'Stock updated successfully',
          'success'
        )
        
        // Update local state with new data
        // تحديث الحالة المحلية بالبيانات الجديدة
        setStockProduct(response.data)
        setStockVariants(response.data.variants.map(v => ({
          id: v.id,
          stock_quantity: v.stock_quantity
        })))
        
        // Refresh products list
        // تحديث قائمة المنتجات
        await fetchProducts()
        
        // Close modal after short delay
        // إغلاق الـ modal بعد تأخير قصير
        setTimeout(() => {
          setIsStockModalOpen(false)
          setStockProduct(null)
          setStockVariants([])
        }, 1500)
      } else {
        showAlert(
          language === 'ar' ? 'خطأ' : 'Error',
          response.message || (language === 'ar' ? 'فشل تحديث المخزون' : 'Failed to update stock'),
          'error'
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showAlert(
        language === 'ar' ? 'خطأ' : 'Error',
        errorMessage,
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [stockProduct, stockVariants, showAlert, language, fetchProducts])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-historical-charcoal dark:text-gray-100 tracking-tight flex items-center gap-3 transition-colors duration-300">
            <Package className="w-8 h-8 text-[#C5A065] dark:text-yellow-400 transition-colors duration-300" />
            {t.vendor.products}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors duration-300">
            {t.vendor.manageProductsDesc}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-historical-gold/10 dark:bg-yellow-900/20 text-[#C5A065] dark:text-yellow-400 font-black rounded-2xl hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 hover:scale-105 transition-all shadow-xl shadow-historical-gold/10 dark:shadow-yellow-900/20 group"
        >
          <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
          {t.vendor.addProduct}
        </button>
      </motion.div>

      {/* Filters & Search Bar */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#C5A065] transition-colors",
            dir === 'rtl' ? "right-4" : "left-4"
          )} />
          <input
            type="text"
            placeholder={t.vendor.searchProducts}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className={cn(
              "w-full h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#C5A065]/5 focus:border-[#C5A065]/30 outline-none transition-all",
              dir === 'rtl' ? "pr-12 pl-6" : "pl-12 pr-6"
            )}
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as typeof filterStatus)
              setCurrentPage(1)
            }}
            className="flex items-center gap-2 px-6 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
            <option value="out_of_stock">{language === 'ar' ? 'نفد المخزون' : 'Out of Stock'}</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value ? Number(e.target.value) : '')
              setCurrentPage(1)
            }}
            className="flex items-center gap-2 px-6 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <option value="">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {language === 'ar' ? (cat.name_ar || cat.name) : cat.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C5A065] dark:text-yellow-400" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-4 py-2 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-gold/90 transition-colors"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">{language === 'ar' ? 'لا توجد منتجات' : 'No products found'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.product}</th>
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.category}</th>
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.price}</th>
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.stock}</th>
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{typeof t.vendor.status === 'string' ? t.vendor.status : (t.vendor.statusLabel || 'الحالة')}</th>
                    <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {product.main_image ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-700 group-hover:scale-110 transition-transform">
                              <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className={cn("font-bold text-historical-charcoal dark:text-gray-100 line-clamp-1", dir === 'rtl' ? "text-right" : "text-left")}>
                              {product.name}
                            </span>
                            <span className={cn("text-xs text-gray-400 dark:text-gray-500 font-medium mt-0.5", dir === 'rtl' ? "text-right" : "text-left")}>
                              ID: #{product.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={cn("px-8 py-6 text-sm font-bold text-gray-600 dark:text-gray-400", dir === 'rtl' ? "text-right" : "text-left")}>
                        {product.category_name ? (
                          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                            {language === 'ar' ? (product.category_name_ar || product.category_name) : product.category_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">{language === 'ar' ? 'بدون فئة' : 'No Category'}</span>
                        )}
                      </td>
                      <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                        <span className="font-black text-historical-charcoal dark:text-gray-100">
                          {formatPrice(product.base_price)}
                        </span>
                      </td>
                      <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "font-bold text-sm",
                            product.total_stock === 0 ? "text-red-500 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {product.total_stock} {t.vendor.unit}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                product.total_stock === 0 ? "bg-red-500 w-0" :
                                  product.total_stock < 10 ? "bg-orange-500 w-1/3" : "bg-green-500 w-full"
                              )}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black border",
                          getStatusStyle(product.status)
                        )}>
                          {getStatusIcon(product.status)}
                          {product.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') :
                            product.status === 'out_of_stock' ? (language === 'ar' ? 'نفد المخزون' : 'Out of Stock') :
                              (language === 'ar' ? 'مسودة' : 'Draft')}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleStockManagement(product)
                            }}
                            className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-blue-500 dark:text-blue-400"
                            title={language === 'ar' ? 'إدارة المخزون' : 'Manage Stock'}
                          >
                            <Warehouse className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:border-[#C5A065]/30 dark:hover:border-yellow-600/30 hover:text-[#C5A065] dark:hover:text-yellow-400 transition-all text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100"
                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:border-red-100 dark:hover:border-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100"
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-8 bg-gray-50/30 dark:bg-gray-700/30 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {language === 'ar' 
                    ? `عرض ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} من ${totalCount}`
                    : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`
                  }
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-gray-400 dark:text-gray-500 cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C5A065] dark:hover:border-yellow-600 hover:text-[#C5A065] dark:hover:text-yellow-400 transition-all disabled:hover:border-gray-200 disabled:hover:text-gray-400"
                  >
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-black text-[#0A0A0B] dark:text-gray-100 hover:border-[#C5A065] dark:hover:border-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal
            key="product-modal"
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingProduct(null)
            }}
            onSave={handleSaveProduct}
            product={editingProduct}
            categories={categories}
            isSubmitting={isSubmitting}
          />
        )}
        
        {isDeleteModalOpen && deletingProduct && (
          <ConfirmModal
            key="delete-modal"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false)
              setDeletingProduct(null)
            }}
            onConfirm={handleDeleteProduct}
            title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            message={language === 'ar' 
              ? `هل أنت متأكد من حذف المنتج "${deletingProduct.name}"؟`
              : `Are you sure you want to delete product "${deletingProduct.name}"?`
            }
          />
        )}
        
        {alertModal.isOpen && (
          <AlertModal
            key="alert-modal"
            isOpen={alertModal.isOpen}
            onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
            title={alertModal.title}
            message={alertModal.message}
            type={alertModal.type}
          />
        )}
        
        {isStockModalOpen && stockProduct && (
          <StockManagementModal
            key="stock-modal"
            isOpen={isStockModalOpen}
            product={stockProduct}
            variants={stockVariants}
            onClose={() => {
              setIsStockModalOpen(false)
              setStockProduct(null)
              setStockVariants([])
            }}
            onSave={handleStockUpdate}
            onVariantChange={(variantId, stockQuantity) => {
              setStockVariants(prev => 
                prev.map(v => v.id === variantId ? { ...v, stock_quantity: stockQuantity } : v)
              )
            }}
            isSubmitting={isSubmitting}
            isLoading={isLoadingStock}
          />
        )}
        
      </AnimatePresence>
    </motion.div>
  )
}

// =============================================================================
// Stock Management Modal
// Modal إدارة المخزون
// =============================================================================

interface StockManagementModalProps {
  isOpen: boolean
  product: VendorProductDetail
  variants: Array<{id: number, stock_quantity: number}>
  onClose: () => void
  onSave: () => void
  onVariantChange: (variantId: number, stockQuantity: number) => void
  isSubmitting: boolean
  isLoading: boolean
}

function StockManagementModal({
  isOpen,
  product,
  variants,
  onClose,
  onSave,
  onVariantChange,
  isSubmitting,
  isLoading
}: StockManagementModalProps) {
  const { t, language } = useLanguage()
  const { dir } = useTranslation()
  
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [isCreatingVariant, setIsCreatingVariant] = useState(false)
  const [newVariantData, setNewVariantData] = useState({
    color: '',
    color_hex: '#000000',
    size: '',
    model: '',
    stock_quantity: 0,
    sku: ''
  })
  
  const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)
  
  const handleAddVariant = useCallback(async () => {
    if (!newVariantData.color.trim()) {
      alert(language === 'ar' ? 'اللون مطلوب' : 'Color is required')
      return
    }
    
    setIsCreatingVariant(true)
    try {
      const response = await createVendorProductVariant(product.id, {
        color: newVariantData.color.trim(),
        color_hex: newVariantData.color_hex || null,
        size: newVariantData.size.trim() || null,
        model: newVariantData.model.trim() || null,
        stock_quantity: newVariantData.stock_quantity || 0,
        sku: newVariantData.sku.trim() || null,
        is_available: true,
      })
      
      if (response.success && response.data) {
        setShowAddVariant(false)
        setNewVariantData({ color: '', color_hex: '#000000', size: '', model: '', stock_quantity: 0, sku: '' })
        alert(language === 'ar' ? 'تم إضافة المتغير بنجاح' : 'Variant added successfully')
        window.location.reload()
      } else {
        alert(response.message || (language === 'ar' ? 'فشل إضافة المتغير' : 'Failed to add variant'))
      }
    } catch (err) {
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred')
    } finally {
      setIsCreatingVariant(false)
    }
  }, [product.id, newVariantData, language])
  
  if (!isOpen) return null
  
  return (
    <>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4 my-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-historical-gold/10 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100">
                {language === 'ar' ? 'إدارة المخزون' : 'Stock Management'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {product.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-historical-charcoal dark:text-gray-200"
          >
            {Icons.close}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-historical-gold" />
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {language === 'ar' ? 'لا توجد متغيرات لهذا المنتج' : 'No variants for this product'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {language === 'ar' 
                  ? 'ابدأ بإضافة أول متغير للمنتج' 
                  : 'Start by adding the first variant to the product'}
              </p>
              <button
                onClick={() => setShowAddVariant(true)}
                className="px-6 py-3 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                {language === 'ar' ? 'إضافة أول متغير' : 'Add First Variant'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Total Stock Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {language === 'ar' ? 'إجمالي المخزون' : 'Total Stock'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalStock}
                  </span>
                </div>
              </div>
              
              {/* Variants List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {language === 'ar' ? 'المتغيرات' : 'Variants'} ({variants.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddVariant(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {language === 'ar' ? 'إضافة متغير' : 'Add Variant'}
                  </button>
                </div>
                {variants.map((variant) => {
                  const originalVariant = product.variants.find(v => v.id === variant.id)
                  if (!originalVariant) return null
                  
                  return (
                    <div
                      key={variant.id}
                      className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {originalVariant.color_hex && (
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                                style={{ backgroundColor: originalVariant.color_hex }}
                                title={originalVariant.color_hex}
                              />
                            )}
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                              {originalVariant.color}
                            </span>
                            {originalVariant.size && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {language === 'ar' ? 'مقاس' : 'Size'}: {originalVariant.size}
                              </span>
                            )}
                            {originalVariant.model && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {originalVariant.model}
                              </span>
                            )}
                          </div>
                          {originalVariant.sku && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              <span className="font-medium">SKU:</span> {originalVariant.sku}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {language === 'ar' ? 'الكمية' : 'Quantity'}:
                          </label>
                          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = Math.max(0, variant.stock_quantity - 1)
                                onVariantChange(variant.id, newValue)
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={variant.stock_quantity === 0}
                              title={language === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={variant.stock_quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                onVariantChange(variant.id, Math.max(0, value))
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault()
                                  onVariantChange(variant.id, variant.stock_quantity + 1)
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault()
                                  onVariantChange(variant.id, Math.max(0, variant.stock_quantity - 1))
                                }
                              }}
                              className="w-20 px-2 py-2 text-center font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = variant.stock_quantity + 1
                                onVariantChange(variant.id, newValue)
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors text-gray-600 dark:text-gray-400"
                              title={language === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onVariantChange(variant.id, variant.stock_quantity + 10)}
                              className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title={language === 'ar' ? 'إضافة 10' : 'Add 10'}
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => onVariantChange(variant.id, Math.max(0, variant.stock_quantity - 10))}
                              className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={variant.stock_quantity < 10}
                              title={language === 'ar' ? 'طرح 10' : 'Subtract 10'}
                            >
                              -10
                            </button>
                          </div>
                          {/* Stock Status Indicator */}
                          {variant.stock_quantity === 0 ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-xs font-medium">{language === 'ar' ? 'نفد' : 'Out'}</span>
                            </div>
                          ) : variant.stock_quantity < 10 ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                              <TrendingDown className="w-3 h-3" />
                              <span className="text-xs font-medium">{language === 'ar' ? 'منخفض' : 'Low'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              <span className="text-xs font-medium">{language === 'ar' ? 'جيد' : 'Good'}</span>
                            </div>
                          )}
                        </div>
                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Add edit variant functionality
                              alert(language === 'ar' ? 'لتعديل المتغير، يرجى استخدام صفحة تعديل المنتج' : 'To edit variant, please use the edit product page')
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                            title={language === 'ar' ? 'تعديل المتغير' : 'Edit Variant'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: Add delete variant functionality
                              if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المتغير؟' : 'Are you sure you want to delete this variant?')) {
                                alert(language === 'ar' ? 'لحذف المتغير، يرجى استخدام صفحة تعديل المنتج' : 'To delete variant, please use the edit product page')
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                            title={language === 'ar' ? 'حذف المتغير' : 'Delete Variant'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-historical-gold/10 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={onSave}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              language === 'ar' ? 'حفظ المخزون' : 'Save Stock'
            )}
          </button>
        </div>
      </motion.div>
    </div>
    
    {/* Add Variant Modal */}
    {showAddVariant && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddVariant(false)} />
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{language === 'ar' ? 'إضافة متغير جديد' : 'Add New Variant'}</h3>
            <button onClick={() => setShowAddVariant(false)} className="text-gray-500 hover:text-gray-700">
              {Icons.close}
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'اللون *' : 'Color *'}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newVariantData.color_hex}
                  onChange={(e) => setNewVariantData({ ...newVariantData, color_hex: e.target.value })}
                  className="w-12 h-10 rounded border"
                />
                <input
                  type="text"
                  value={newVariantData.color}
                  onChange={(e) => setNewVariantData({ ...newVariantData, color: e.target.value })}
                  placeholder={language === 'ar' ? 'اسم اللون' : 'Color name'}
                  className="flex-1 px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'المقاس' : 'Size'}</label>
              <input
                type="text"
                value={newVariantData.size}
                onChange={(e) => setNewVariantData({ ...newVariantData, size: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: 38, L' : 'e.g., 38, L'}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'الموديل' : 'Model'}</label>
              <input
                type="text"
                value={newVariantData.model}
                onChange={(e) => setNewVariantData({ ...newVariantData, model: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'كمية المخزون *' : 'Stock Quantity *'}</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewVariantData({ ...newVariantData, stock_quantity: Math.max(0, newVariantData.stock_quantity - 1) })}
                  className="px-3 py-1 border rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={newVariantData.stock_quantity}
                  onChange={(e) => setNewVariantData({ ...newVariantData, stock_quantity: parseInt(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 border rounded-lg text-center"
                />
                <button
                  type="button"
                  onClick={() => setNewVariantData({ ...newVariantData, stock_quantity: newVariantData.stock_quantity + 1 })}
                  className="px-3 py-1 border rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                value={newVariantData.sku}
                onChange={(e) => setNewVariantData({ ...newVariantData, sku: e.target.value })}
                placeholder={language === 'ar' ? 'اختياري' : 'Optional'}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddVariant(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isCreatingVariant}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleAddVariant}
              disabled={isCreatingVariant || !newVariantData.color.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreatingVariant ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'إضافة' : 'Add')}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

