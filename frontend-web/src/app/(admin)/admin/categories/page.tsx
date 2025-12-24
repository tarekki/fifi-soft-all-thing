'use client'

/**
 * Admin Categories Management Page
 * صفحة إدارة الفئات
 * 
 * Features:
 * - Tree view of categories
 * - Add/Edit/Delete categories
 * - Drag & drop reordering
 * - Featured toggle
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Category {
  id: string
  name: string
  nameAr: string
  slug: string
  icon: string
  image: string
  parentId: string | null
  isFeatured: boolean
  productCount: number
  order: number
  children?: Category[]
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
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
  drag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    slug: 'electronics',
    icon: '📱',
    image: '',
    parentId: null,
    isFeatured: true,
    productCount: 156,
    order: 1,
    children: [
      {
        id: '1-1',
        name: 'Phones',
        nameAr: 'هواتف',
        slug: 'phones',
        icon: '📞',
        image: '',
        parentId: '1',
        isFeatured: true,
        productCount: 89,
        order: 1,
      },
      {
        id: '1-2',
        name: 'Laptops',
        nameAr: 'لابتوبات',
        slug: 'laptops',
        icon: '💻',
        image: '',
        parentId: '1',
        isFeatured: false,
        productCount: 45,
        order: 2,
      },
      {
        id: '1-3',
        name: 'Accessories',
        nameAr: 'إكسسوارات',
        slug: 'accessories',
        icon: '🎧',
        image: '',
        parentId: '1',
        isFeatured: false,
        productCount: 22,
        order: 3,
      },
    ],
  },
  {
    id: '2',
    name: 'Fashion',
    nameAr: 'أزياء',
    slug: 'fashion',
    icon: '👗',
    image: '',
    parentId: null,
    isFeatured: true,
    productCount: 234,
    order: 2,
    children: [
      {
        id: '2-1',
        name: 'Women',
        nameAr: 'نسائي',
        slug: 'women',
        icon: '👠',
        image: '',
        parentId: '2',
        isFeatured: true,
        productCount: 120,
        order: 1,
      },
      {
        id: '2-2',
        name: 'Men',
        nameAr: 'رجالي',
        slug: 'men',
        icon: '👔',
        image: '',
        parentId: '2',
        isFeatured: false,
        productCount: 78,
        order: 2,
      },
      {
        id: '2-3',
        name: 'Kids',
        nameAr: 'أطفال',
        slug: 'kids',
        icon: '👶',
        image: '',
        parentId: '2',
        isFeatured: false,
        productCount: 36,
        order: 3,
      },
    ],
  },
  {
    id: '3',
    name: 'Home & Garden',
    nameAr: 'المنزل والحديقة',
    slug: 'home-garden',
    icon: '🏠',
    image: '',
    parentId: null,
    isFeatured: false,
    productCount: 89,
    order: 3,
  },
  {
    id: '4',
    name: 'Sports',
    nameAr: 'رياضة',
    slug: 'sports',
    icon: '⚽',
    image: '',
    parentId: null,
    isFeatured: false,
    productCount: 67,
    order: 4,
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
// Sub-Components
// =============================================================================

interface CategoryItemProps {
  category: Category
  level: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleFeatured: (category: Category) => void
}

function CategoryItem({ category, level, onEdit, onDelete, onToggleFeatured }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = category.children && category.children.length > 0

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          group flex items-center gap-3 px-4 py-3 rounded-xl
          hover:bg-historical-gold/5 transition-colors
          ${level > 0 ? 'mr-6 border-r-2 border-historical-gold/10' : ''}
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

        {/* Drag Handle */}
        <button className="p-1 rounded cursor-grab text-historical-charcoal/30 hover:text-historical-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity">
          {Icons.drag}
        </button>

        {/* Icon */}
        <span className="text-xl">{category.icon}</span>

        {/* Folder Icon */}
        <span className="text-historical-gold">
          {hasChildren && isExpanded ? Icons.folderOpen : Icons.folder}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-historical-charcoal truncate">{category.nameAr}</p>
          <p className="text-xs text-historical-charcoal/50">{category.name} • {category.productCount} منتج</p>
        </div>

        {/* Featured Star */}
        <button
          onClick={() => onToggleFeatured(category)}
          className={`p-1.5 rounded-lg transition-colors ${
            category.isFeatured
              ? 'text-yellow-500 hover:bg-yellow-50'
              : 'text-historical-charcoal/20 hover:text-yellow-500 hover:bg-yellow-50'
          }`}
          title={category.isFeatured ? 'إلغاء التمييز' : 'تمييز الفئة'}
        >
          {category.isFeatured ? Icons.star : Icons.starOutline}
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
            className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="حذف"
          >
            {Icons.delete}
          </button>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {category.children!.map(child => (
              <CategoryItem
                key={child.id}
                category={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFeatured={onToggleFeatured}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  categories: Category[]
  onSave: (data: Partial<Category>) => void
}

function CategoryModal({ isOpen, onClose, category, categories, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    nameAr: category?.nameAr || '',
    slug: category?.slug || '',
    icon: category?.icon || '📁',
    parentId: category?.parentId || '',
    isFeatured: category?.isFeatured || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
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
              {category ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  الاسم (عربي)
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder="مثال: إلكترونيات"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  placeholder="e.g. Electronics"
                  dir="ltr"
                  required
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
                  placeholder="electronics"
                  dir="ltr"
                  required
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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                الفئة الأم
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
              >
                <option value="">بدون (فئة رئيسية)</option>
                {categories.filter(c => c.id !== category?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-historical-gold/10 bg-historical-stone/30">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
              />
              <label htmlFor="isFeatured" className="text-sm text-historical-charcoal">
                تمييز هذه الفئة (ستظهر في الصفحة الرئيسية)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
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
// Main Component
// =============================================================================

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback((category: Category) => {
    if (confirm(`هل أنت متأكد من حذف الفئة "${category.nameAr}"؟`)) {
      // TODO: Call API
      setCategories(prev => prev.filter(c => c.id !== category.id))
    }
  }, [])

  const handleToggleFeatured = useCallback((category: Category) => {
    // TODO: Call API
    setCategories(prev => prev.map(c => 
      c.id === category.id ? { ...c, isFeatured: !c.isFeatured } : c
    ))
  }, [])

  const handleSave = useCallback((data: Partial<Category>) => {
    // TODO: Call API
    console.log('Saving category:', data)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }, [])

  // Filter categories based on search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nameAr.includes(searchQuery)
  )

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
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة الفئات</h1>
          <p className="text-historical-charcoal/50 mt-1">تنظيم وإدارة فئات المنتجات</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>إضافة فئة</span>
        </button>
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
            <p className="text-2xl font-bold text-historical-charcoal">{categories.length}</p>
            <p className="text-xs text-historical-charcoal/50">فئة رئيسية</p>
          </div>
          <div className="w-px h-10 bg-historical-gold/20" />
          <div className="text-center">
            <p className="text-2xl font-bold text-historical-gold">
              {categories.reduce((acc, c) => acc + (c.children?.length || 0), 0)}
            </p>
            <p className="text-xs text-historical-charcoal/50">فئة فرعية</p>
          </div>
        </div>
      </motion.div>

      {/* Categories Tree */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="p-2">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-historical-charcoal/50">
              <p>لا توجد فئات مطابقة للبحث</p>
            </div>
          ) : (
            filteredCategories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                level={0}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        categories={categories}
        onSave={handleSave}
      />
    </motion.div>
  )
}

