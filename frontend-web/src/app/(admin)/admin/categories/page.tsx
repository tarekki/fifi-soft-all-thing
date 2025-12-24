'use client'

/**
 * Admin Categories Management Page
 * صفحة إدارة الفئات
 * 
 * Features:
 * - Tree view of categories
 * - Add/Edit/Delete categories
 * - Featured toggle
 * - Real-time API integration
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCategories, type Category, type CategoryFormData } from '@/lib/admin'

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
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  folderOpen: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
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
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  loading: (
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
// Category Item Component
// =============================================================================

interface CategoryItemProps {
  category: Category
  level: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleFeatured: (id: number, isFeatured: boolean) => void
  onToggleActive: (id: number, isActive: boolean) => void
  isDeleting?: boolean
}

function CategoryItem({ 
  category, 
  level, 
  onEdit, 
  onDelete, 
  onToggleFeatured,
  onToggleActive,
  isDeleting 
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = category.is_parent

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          group flex items-center gap-3 px-4 py-3 rounded-xl
          hover:bg-historical-gold/5 transition-colors
          ${level > 0 ? 'mr-6 border-r-2 border-historical-gold/10' : ''}
          ${!category.is_active ? 'opacity-50' : ''}
        `}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-historical-gold/10 transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              {Icons.chevronDown}
            </motion.div>
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon */}
        <span className="text-xl">{category.icon || '📁'}</span>

        {/* Folder Icon */}
        <span className="text-historical-gold">
          {hasChildren && isExpanded ? Icons.folderOpen : Icons.folder}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-historical-charcoal truncate">{category.name_ar}</p>
          <p className="text-xs text-historical-charcoal/50">
            {category.name} • {category.products_count} منتج
            {!category.is_active && <span className="text-red-500 mr-2">(معطل)</span>}
          </p>
        </div>

        {/* Featured Star */}
        <button
          onClick={() => onToggleFeatured(category.id, !category.is_featured)}
          className={`p-1.5 rounded-lg transition-colors ${
            category.is_featured
              ? 'text-yellow-500 hover:bg-yellow-50'
              : 'text-historical-charcoal/20 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          title={category.is_featured ? 'إلغاء التمييز' : 'تمييز الفئة'}
        >
          {category.is_featured ? Icons.star : Icons.starOutline}
        </button>

        {/* Active Toggle */}
        <button
          onClick={() => onToggleActive(category.id, !category.is_active)}
          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
            category.is_active
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {category.is_active ? 'مفعل' : 'معطل'}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            title="تعديل"
          >
            {Icons.edit}
          </button>
          <button
            onClick={() => onDelete(category)}
            disabled={isDeleting}
            className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="حذف"
          >
            {isDeleting ? Icons.loading : Icons.delete}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// Category Modal Component
// =============================================================================

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  categories: Category[]
  onSave: (data: CategoryFormData) => Promise<void>
  isLoading: boolean
}

function CategoryModal({ isOpen, onClose, category, categories, onSave, isLoading }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    icon: '📁',
    parent: null,
    display_order: 0,
    is_active: true,
    is_featured: false,
  })
  const [error, setError] = useState<string | null>(null)

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        name_ar: category.name_ar,
        slug: category.slug,
        description: category.description || '',
        description_ar: category.description_ar || '',
        icon: category.icon || '📁',
        parent: category.parent,
        display_order: category.display_order,
        is_active: category.is_active,
        is_featured: category.is_featured,
      })
    } else {
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        description_ar: '',
        icon: '📁',
        parent: null,
        display_order: 0,
        is_active: true,
        is_featured: false,
      })
    }
    setError(null)
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
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
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <h2 className="text-lg font-bold text-historical-charcoal">
              {category ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors disabled:opacity-50"
            >
              {Icons.close}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  الاسم (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder="مثال: إلكترونيات"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder="e.g. Electronics"
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  الرابط (Slug)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder="electronics (تلقائي)"
                  dir="ltr"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  الأيقونة (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 text-center text-2xl"
                  placeholder="📁"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                الفئة الأم
              </label>
              <select
                value={formData.parent || ''}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                disabled={isLoading}
              >
                <option value="">بدون (فئة رئيسية)</option>
                {categories
                  .filter(c => c.id !== category?.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar} - {c.name}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                min={0}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-historical-gold/10 bg-historical-stone/30">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  disabled={isLoading}
                />
                <label htmlFor="is_active" className="text-sm text-historical-charcoal">
                  فئة مفعلة
                </label>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl border border-historical-gold/10 bg-historical-stone/30">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                  disabled={isLoading}
                />
                <label htmlFor="is_featured" className="text-sm text-historical-charcoal">
                  فئة مميزة
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              >
                {isLoading && Icons.loading}
                {category ? 'حفظ التغييرات' : 'إضافة الفئة'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// Delete Confirmation Modal
// =============================================================================

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  categoryName: string
  isLoading: boolean
}

function DeleteModal({ isOpen, onClose, onConfirm, categoryName, isLoading }: DeleteModalProps) {
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-historical-charcoal mb-2">تأكيد الحذف</h3>
          <p className="text-historical-charcoal/70 mb-6">
            هل أنت متأكد من حذف الفئة &quot;{categoryName}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading && Icons.loading}
              حذف
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse">
          <div className="w-6 h-6 bg-historical-gold/10 rounded" />
          <div className="w-8 h-8 bg-historical-gold/10 rounded-full" />
          <div className="w-5 h-5 bg-historical-gold/10 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-historical-gold/10 rounded w-32" />
            <div className="h-3 bg-historical-gold/10 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function CategoriesPage() {
  // Categories hook
  const {
    categories,
    totalCount,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    toggleActive,
    toggleFeatured,
    refresh,
    clearError,
  } = useCategories()

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Handle search
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCategories({ search: searchQuery || undefined })
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback((category: Category) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) return
    
    const success = await removeCategory(categoryToDelete.id)
    if (success) {
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, removeCategory])

  const handleToggleFeatured = useCallback(async (id: number, isFeatured: boolean) => {
    await toggleFeatured(id, isFeatured)
  }, [toggleFeatured])

  const handleToggleActive = useCallback(async (id: number, isActive: boolean) => {
    await toggleActive(id, isActive)
  }, [toggleActive])

  const handleSave = useCallback(async (data: CategoryFormData) => {
    if (editingCategory) {
      await editCategory(editingCategory.id, data)
    } else {
      await addCategory(data)
    }
  }, [editingCategory, editCategory, addCategory])

  const handleAddNew = useCallback(() => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }, [])

  // Count stats
  const mainCategoriesCount = categories.filter(c => !c.parent).length
  const subCategoriesCount = categories.filter(c => c.parent).length

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-red-600 text-white shadow-lg flex items-center gap-3"
          >
            <span>{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-red-700 rounded">
              {Icons.close}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة الفئات</h1>
          <p className="text-historical-charcoal/50 mt-1">تنظيم وإدارة فئات المنتجات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors disabled:opacity-50"
            title="تحديث"
          >
            {isLoading ? Icons.loading : Icons.refresh}
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {Icons.add}
            <span>إضافة فئة</span>
          </button>
        </div>
      </motion.div>

      {/* Search & Stats */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الفئات..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-historical-gold/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-historical-charcoal">{totalCount}</p>
            <p className="text-xs text-historical-charcoal/50">إجمالي الفئات</p>
          </div>
          <div className="w-px h-10 bg-historical-gold/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-historical-charcoal">{mainCategoriesCount}</p>
            <p className="text-xs text-historical-charcoal/50">رئيسية</p>
          </div>
          <div className="w-px h-10 bg-historical-gold/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-historical-gold">{subCategoriesCount}</p>
            <p className="text-xs text-historical-charcoal/50">فرعية</p>
          </div>
        </div>
      </motion.div>

      {/* Categories List */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        {isLoading && categories.length === 0 ? (
          <LoadingSkeleton />
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-historical-charcoal/50">
            <p className="text-lg mb-2">لا توجد فئات</p>
            <p className="text-sm">ابدأ بإضافة فئة جديدة</p>
          </div>
        ) : (
          <div className="p-2">
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                level={category.depth}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                onToggleActive={handleToggleActive}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
        categories={categories}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setCategoryToDelete(null)
        }}
        onConfirm={confirmDelete}
        categoryName={categoryToDelete?.name_ar || ''}
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
