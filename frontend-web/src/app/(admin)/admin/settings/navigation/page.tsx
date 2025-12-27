'use client'

/**
 * Admin Settings - Navigation Page
 * صفحة إعدادات قوائم التنقل
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  id: string
  label: string
  labelAr: string
  url: string
  order: number
  isActive: boolean
  children?: NavItem[]
}

interface NavMenu {
  id: string
  name: string
  location: string
  items: NavItem[]
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
  chevronDown: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialMenus: NavMenu[] = [
  {
    id: 'header',
    name: 'القائمة الرئيسية',
    location: 'Header',
    items: [
      { id: '1', label: 'Home', labelAr: 'الرئيسية', url: '/', order: 1, isActive: true },
      { id: '2', label: 'Categories', labelAr: 'الفئات', url: '/categories', order: 2, isActive: true },
      { id: '3', label: 'Offers', labelAr: 'العروض', url: '/offers', order: 3, isActive: true },
      { id: '4', label: 'New Arrivals', labelAr: 'وصل حديثاً', url: '/new', order: 4, isActive: true },
    ],
  },
  {
    id: 'footer-about',
    name: 'عن الموقع',
    location: 'Footer - About',
    items: [
      { id: '5', label: 'About Us', labelAr: 'من نحن', url: '/about', order: 1, isActive: true },
      { id: '6', label: 'Contact', labelAr: 'اتصل بنا', url: '/contact', order: 2, isActive: true },
      { id: '7', label: 'Careers', labelAr: 'وظائف', url: '/careers', order: 3, isActive: true },
    ],
  },
  {
    id: 'footer-support',
    name: 'الدعم',
    location: 'Footer - Support',
    items: [
      { id: '8', label: 'FAQ', labelAr: 'الأسئلة الشائعة', url: '/faq', order: 1, isActive: true },
      { id: '9', label: 'Shipping', labelAr: 'الشحن', url: '/shipping', order: 2, isActive: true },
      { id: '10', label: 'Returns', labelAr: 'الإرجاع', url: '/returns', order: 3, isActive: true },
    ],
  },
  {
    id: 'footer-legal',
    name: 'قانوني',
    location: 'Footer - Legal',
    items: [
      { id: '11', label: 'Privacy Policy', labelAr: 'سياسة الخصوصية', url: '/privacy', order: 1, isActive: true },
      { id: '12', label: 'Terms', labelAr: 'الشروط والأحكام', url: '/terms', order: 2, isActive: true },
    ],
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

interface NavItemRowProps {
  item: NavItem
  onEdit: (item: NavItem) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

function NavItemRow({ item, onEdit, onDelete, onToggle }: NavItemRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-historical-gold/10 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 group transition-colors duration-300">
      <button className="p-1 rounded cursor-grab text-historical-charcoal/30 dark:text-gray-500 hover:text-historical-charcoal/60 dark:hover:text-gray-300 transition-colors duration-300">
        {Icons.drag}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 truncate">{item.labelAr}</p>
        <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300" dir="ltr">{item.url}</p>
      </div>
      <button
        onClick={() => onToggle(item.id)}
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
          item.isActive ? 'bg-green-500 dark:bg-green-600' : 'bg-historical-charcoal/20 dark:bg-gray-600'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ x: item.isActive ? 18 : 4 }}
          transition={{ duration: 0.2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-200 shadow transition-colors duration-300"
        />
      </button>
      <button
        onClick={() => onEdit(item)}
        className="p-1.5 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        {Icons.edit}
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 rounded-lg text-historical-charcoal/40 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        {Icons.delete}
      </button>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function NavigationSettingsPage() {
  const [menus, setMenus] = useState<NavMenu[]>(initialMenus)
  const [activeMenu, setActiveMenu] = useState<string>('header')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingItem, setEditingItem] = useState<NavItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentMenu = menus.find(m => m.id === activeMenu)

  const handleToggle = useCallback((menuId: string, itemId: string) => {
    setMenus(prev => prev.map(menu => 
      menu.id === menuId 
        ? { ...menu, items: menu.items.map(item => item.id === itemId ? { ...item, isActive: !item.isActive } : item) }
        : menu
    ))
    setHasChanges(true)
  }, [])

  const handleDelete = useCallback((menuId: string, itemId: string) => {
    setMenus(prev => prev.map(menu => 
      menu.id === menuId 
        ? { ...menu, items: menu.items.filter(item => item.id !== itemId) }
        : menu
    ))
    setHasChanges(true)
  }, [])

  const handleEdit = useCallback((item: NavItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingItem(null)
    setIsModalOpen(true)
  }, [])

  const handleSaveItem = useCallback((data: Partial<NavItem>) => {
    if (editingItem) {
      // Update existing
      setMenus(prev => prev.map(menu => 
        menu.id === activeMenu 
          ? { ...menu, items: menu.items.map(item => item.id === editingItem.id ? { ...item, ...data } : item) }
          : menu
      ))
    } else {
      // Add new
      const newItem: NavItem = {
        id: Date.now().toString(),
        label: data.label || '',
        labelAr: data.labelAr || '',
        url: data.url || '',
        order: (currentMenu?.items.length || 0) + 1,
        isActive: true,
      }
      setMenus(prev => prev.map(menu => 
        menu.id === activeMenu 
          ? { ...menu, items: [...menu.items, newItem] }
          : menu
      ))
    }
    setHasChanges(true)
    setIsModalOpen(false)
  }, [activeMenu, currentMenu, editingItem])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
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
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">إدارة قوائم الهيدر والفوتر</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            hasChanges && !isSaving
              ? 'bg-gradient-to-l from-historical-gold to-historical-red text-white shadow-lg hover:shadow-xl'
              : 'bg-historical-charcoal/10 dark:bg-gray-700/50 text-historical-charcoal/40 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            Icons.save
          )}
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
        </button>
      </motion.div>

      {/* Menu Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeMenu === menu.id
                ? 'bg-historical-gold dark:bg-yellow-600 text-white'
                : 'bg-white/80 dark:bg-gray-800/80 border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300'
            }`}
          >
            {menu.name}
            <span className="mr-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
              {menu.items.length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Current Menu Items */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl transition-colors duration-300 border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <div>
            <h2 className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{currentMenu?.name}</h2>
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{currentMenu?.location}</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-gold dark:text-yellow-400 font-medium hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
          >
            {Icons.add}
            <span>إضافة عنصر</span>
          </button>
        </div>

        <div className="p-4 space-y-2">
          {currentMenu?.items.length === 0 ? (
            <p className="text-center py-8 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">لا توجد عناصر في هذه القائمة</p>
          ) : (
            currentMenu?.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={(id) => handleDelete(activeMenu, id)}
                onToggle={(id) => handleToggle(activeMenu, id)}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Edit/Add Modal */}
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
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                  {editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
                >
                  {Icons.close}
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleSaveItem({
                    label: formData.get('label') as string,
                    labelAr: formData.get('labelAr') as string,
                    url: formData.get('url') as string,
                  })
                }}
                className="p-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                    العنوان (عربي)
                  </label>
                  <input
                    type="text"
                    name="labelAr"
                    defaultValue={editingItem?.labelAr}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                    Label (English)
                  </label>
                  <input
                    type="text"
                    name="label"
                    defaultValue={editingItem?.label}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                    الرابط (URL)
                  </label>
                  <input
                    type="text"
                    name="url"
                    defaultValue={editingItem?.url}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                    placeholder="/page-name"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-historical-charcoal/70 dark:text-gray-300 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

