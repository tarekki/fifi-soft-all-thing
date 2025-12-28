'use client'

/**
 * Admin Settings - Navigation Page
 * صفحة إعدادات قوائم التنقل
 * 
 * This page is connected to the backend API for full CRUD operations
 * هذه الصفحة متصلة بالباك إند API لعمليات CRUD كاملة
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  useNavigation,
  type NavigationItem, 
  type NavigationLocation,
  type NavigationItemPayload,
} from '@/lib/admin'

// =============================================================================
// Types
// =============================================================================

interface MenuTab {
  id: NavigationLocation
  name: string
  nameEn: string
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  save: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
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
  drag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
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
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
}

// =============================================================================
// Menu Tabs Configuration
// =============================================================================

const menuTabs: MenuTab[] = [
  { id: 'header', name: 'القائمة الرئيسية', nameEn: 'Header' },
  { id: 'header_mobile', name: 'قائمة الموبايل', nameEn: 'Mobile Header' },
  { id: 'footer_about', name: 'عن الموقع', nameEn: 'Footer - About' },
  { id: 'footer_support', name: 'الدعم', nameEn: 'Footer - Support' },
  { id: 'footer_legal', name: 'قانوني', nameEn: 'Footer - Legal' },
  { id: 'sidebar', name: 'الشريط الجانبي', nameEn: 'Sidebar' },
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

interface NavItemRowProps {
  item: NavigationItem
  onEdit: (item: NavigationItem) => void
  onDelete: (id: number) => void
  onToggle: (id: number, isActive: boolean) => void
  isProcessing: boolean
}

function NavItemRow({ item, onEdit, onDelete, onToggle, isProcessing }: NavItemRowProps) {
  return (
    <Reorder.Item
      value={item}
      id={String(item.id)}
      className="flex items-center gap-3 p-3 rounded-lg border border-historical-gold/10 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 group transition-colors duration-300 cursor-grab active:cursor-grabbing"
    >
      <div className="p-1 text-historical-charcoal/30 dark:text-gray-500">
        {Icons.drag}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 truncate">{item.label_ar}</p>
        <div className="flex items-center gap-2 text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
          <span dir="ltr">{item.url}</span>
          {item.children_count > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400">
              {item.children_count} عناصر فرعية
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onToggle(item.id, !item.is_active)}
        disabled={isProcessing}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
          item.is_active ? 'bg-green-500 dark:bg-green-600' : 'bg-historical-charcoal/20 dark:bg-gray-600'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ x: item.is_active ? 18 : 4 }}
          transition={{ duration: 0.2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-200 shadow transition-colors duration-300"
        />
      </button>
      <button
        onClick={() => onEdit(item)}
        disabled={isProcessing}
        className="p-1.5 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-30"
      >
        {Icons.edit}
      </button>
      <button
        onClick={() => onDelete(item.id)}
        disabled={isProcessing}
        className="p-1.5 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-30"
      >
        {Icons.delete}
      </button>
    </Reorder.Item>
  )
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  editingItem: NavigationItem | null
  selectedLocation: NavigationLocation
  onSave: (data: NavigationItemPayload) => Promise<void>
  isProcessing: boolean
}

function EditModal({ isOpen, onClose, editingItem, selectedLocation, onSave, isProcessing }: EditModalProps) {
  const [formData, setFormData] = useState<NavigationItemPayload>({
    location: selectedLocation,
    label: '',
    label_ar: '',
    url: '',
    icon: '',
    is_active: true,
    visibility: 'all',
    open_in_new_tab: false,
  })

  // Reset form when modal opens with editing item
  useState(() => {
    if (editingItem) {
      setFormData({
        location: editingItem.location,
        label: editingItem.label,
        label_ar: editingItem.label_ar,
        url: editingItem.url,
        icon: editingItem.icon,
        is_active: editingItem.is_active,
        visibility: editingItem.visibility,
        open_in_new_tab: editingItem.open_in_new_tab,
      })
    } else {
      setFormData({
        location: selectedLocation,
        label: '',
        label_ar: '',
        url: '',
        icon: '',
        is_active: true,
        visibility: 'all',
        open_in_new_tab: false,
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  if (!isOpen) return null

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
        className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
            {editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
          >
            {Icons.close}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                العنوان (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label_ar}
                onChange={(e) => setFormData({ ...formData, label_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                Label (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                dir="ltr"
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
              الرابط (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="/page-name أو https://example.com"
              dir="ltr"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                الأيقونة (اختياري)
              </label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                placeholder="🏠 أو fas fa-home"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                الظهور لـ
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as NavigationItemPayload['visibility'] })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                disabled={isProcessing}
              >
                <option value="all">الجميع</option>
                <option value="guest">الزوار فقط</option>
                <option value="authenticated">المسجلين فقط</option>
                <option value="customer">العملاء فقط</option>
                <option value="vendor">البائعين فقط</option>
                <option value="admin">الأدمن فقط</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-historical-gold/20 dark:border-gray-600 text-historical-gold focus:ring-historical-gold/30"
                disabled={isProcessing}
              />
              <span className="text-sm text-historical-charcoal dark:text-gray-200">مفعّل</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.open_in_new_tab}
                onChange={(e) => setFormData({ ...formData, open_in_new_tab: e.target.checked })}
                className="w-4 h-4 rounded border-historical-gold/20 dark:border-gray-600 text-historical-gold focus:ring-historical-gold/30"
                disabled={isProcessing}
              />
              <span className="text-sm text-historical-charcoal dark:text-gray-200">فتح في تبويب جديد</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-historical-gold/10 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-historical-charcoal/70 dark:text-gray-300 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors disabled:opacity-50"
            >
              {isProcessing ? Icons.loading : Icons.save}
              <span>حفظ</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function NavigationSettingsPage() {
  const {
    menus,
    items,
    isLoading,
    isProcessing,
    error,
    selectedLocation,
    setSelectedLocation,
    refresh,
    create,
    update,
    remove,
  } = useNavigation('header')

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localItems, setLocalItems] = useState<NavigationItem[]>([])

  // Sync local items with hook items
  useMemo(() => {
    setLocalItems(items)
  }, [items])

  const currentTab = menuTabs.find(t => t.id === selectedLocation)

  const handleToggle = useCallback(async (id: number, isActive: boolean) => {
    await update(id, { is_active: isActive })
  }, [update])

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      await remove(id)
    }
  }, [remove])

  const handleEdit = useCallback((item: NavigationItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setIsModalOpen(true)
  }, [])

  const handleSaveItem = useCallback(async (data: NavigationItemPayload) => {
    if (editingItem) {
      await update(editingItem.id, data)
    } else {
      await create({ ...data, location: selectedLocation })
    }
    setIsModalOpen(false)
    setEditingItem(null)
  }, [editingItem, create, update, selectedLocation])

  const handleReorder = useCallback(async (newItems: NavigationItem[]) => {
    setLocalItems(newItems)
    // Update order for each item
    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].order !== i) {
        await update(newItems[i].id, { order: i })
      }
    }
  }, [update])

  // Loading State
  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {Icons.loading}
          <p className="text-historical-charcoal/50 dark:text-gray-400">جاري تحميل القوائم...</p>
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
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">قوائم التنقل</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">إدارة قوائم الهيدر والفوتر - متصل بالباك إند</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
        >
          <span className={isLoading ? 'animate-spin' : ''}>{Icons.refresh}</span>
          <span>تحديث</span>
        </button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {Icons.error}
          <div>
            <p className="font-medium">حدث خطأ</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Menu Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {menuTabs.map((tab) => {
          const itemCount = menus?.[tab.id]?.length || 0
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedLocation(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                selectedLocation === tab.id
                  ? 'bg-historical-gold dark:bg-yellow-600 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300'
              }`}
            >
              {tab.name}
              <span className={`mr-2 px-1.5 py-0.5 rounded-full text-xs ${
                selectedLocation === tab.id
                  ? 'bg-white/20'
                  : 'bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400'
              }`}>
                {itemCount}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Current Menu Items */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl transition-colors duration-300 border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <div>
            <h2 className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{currentTab?.name}</h2>
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{currentTab?.nameEn}</p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-gold dark:text-yellow-400 font-medium hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
          >
            {Icons.add}
            <span>إضافة عنصر</span>
          </button>
        </div>

        <div className="p-4">
          {localItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-historical-gold/10 dark:bg-gray-700/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-historical-gold/50 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </div>
              <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">لا توجد عناصر في هذه القائمة</p>
              <button
                onClick={handleAddNew}
                className="mt-4 text-historical-gold hover:text-historical-red transition-colors"
              >
                أضف أول عنصر
              </button>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={localItems}
              onReorder={handleReorder}
              className="space-y-2"
            >
              {localItems.map((item) => (
                <NavItemRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  isProcessing={isProcessing}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </motion.div>

      {/* API Status Badge */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          متصل بالـ API
        </div>
      </motion.div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <EditModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingItem(null)
            }}
            editingItem={editingItem}
            selectedLocation={selectedLocation}
            onSave={handleSaveItem}
            isProcessing={isProcessing}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
