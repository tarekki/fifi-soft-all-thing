'use client'

/**
 * Admin Stories Management Page
 * صفحة إدارة القصص
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Story {
  id: string
  title: string
  titleAr: string
  image: string
  link: string
  linkType: 'product' | 'category' | 'offer' | 'external'
  expiresAt: string
  isActive: boolean
  order: number
  views: number
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
  play: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  drag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockStories: Story[] = [
  {
    id: '1',
    title: 'New iPhone 15',
    titleAr: 'آيفون 15 الجديد',
    image: 'https://via.placeholder.com/200x350',
    link: '/products/iphone-15',
    linkType: 'product',
    expiresAt: '2024-12-25T23:59:59',
    isActive: true,
    order: 1,
    views: 5400,
  },
  {
    id: '2',
    title: 'Fashion Week',
    titleAr: 'أسبوع الموضة',
    image: 'https://via.placeholder.com/200x350',
    link: '/categories/fashion',
    linkType: 'category',
    expiresAt: '2024-12-26T23:59:59',
    isActive: true,
    order: 2,
    views: 3200,
  },
  {
    id: '3',
    title: '50% Off Electronics',
    titleAr: '50% خصم إلكترونيات',
    image: 'https://via.placeholder.com/200x350',
    link: '/offers/electronics',
    linkType: 'offer',
    expiresAt: '2024-12-31T23:59:59',
    isActive: true,
    order: 3,
    views: 8100,
  },
  {
    id: '4',
    title: 'Winter Collection',
    titleAr: 'مجموعة الشتاء',
    image: 'https://via.placeholder.com/200x350',
    link: '/categories/winter',
    linkType: 'category',
    expiresAt: '2025-01-15T23:59:59',
    isActive: true,
    order: 4,
    views: 2800,
  },
  {
    id: '5',
    title: 'Flash Sale',
    titleAr: 'تخفيضات خاطفة',
    image: 'https://via.placeholder.com/200x350',
    link: '/flash-sale',
    linkType: 'offer',
    expiresAt: '2024-12-24T18:00:00',
    isActive: false,
    order: 5,
    views: 1200,
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

const getLinkTypeLabel = (type: Story['linkType']) => {
  const labels = {
    product: 'منتج',
    category: 'فئة',
    offer: 'عرض',
    external: 'خارجي',
  }
  return labels[type]
}

const getLinkTypeColor = (type: Story['linkType']) => {
  const colors = {
    product: 'bg-blue-100 text-blue-700',
    category: 'bg-green-100 text-green-700',
    offer: 'bg-orange-100 text-orange-700',
    external: 'bg-gray-100 text-gray-700',
  }
  return colors[type]
}

const getTimeRemaining = (expiresAt: string) => {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff < 0) return 'منتهي'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} يوم`
  return `${hours} ساعة`
}

// =============================================================================
// Main Component
// =============================================================================

export default function StoriesPage() {
  const [stories, setStories] = useState(mockStories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)

  const handleToggle = useCallback((id: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s))
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه القصة؟')) {
      setStories(prev => prev.filter(s => s.id !== id))
    }
  }, [])

  const handleEdit = useCallback((story: Story) => {
    setEditingStory(story)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingStory(null)
    setIsModalOpen(true)
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
          <a
            href="/admin/promotions"
            className="p-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
          >
            {Icons.back}
          </a>
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal">القصص (Stories)</h1>
            <p className="text-historical-charcoal/50 mt-1">إدارة القصص المؤقتة للمنتجات والعروض</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>إضافة قصة</span>
        </button>
      </motion.div>

      {/* Stories Preview (Instagram-style) */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft p-6">
        <h2 className="text-sm font-medium text-historical-charcoal/50 mb-4">معاينة كما تظهر للمستخدم</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stories.filter(s => s.isActive).map((story) => (
            <div key={story.id} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-historical-gold via-historical-red to-historical-gold">
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                  <img src={story.image} alt={story.titleAr} className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-xs text-historical-charcoal mt-2 max-w-[64px] truncate">{story.titleAr}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stories List */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden">
        <div className="p-4 space-y-3">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              layout
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${
                story.isActive ? 'border-green-200 bg-green-50/30' : 'border-historical-gold/10 bg-historical-stone/30'
              }`}
            >
              {/* Drag Handle */}
              <button className="p-1 rounded cursor-grab text-historical-charcoal/30 hover:text-historical-charcoal/60">
                {Icons.drag}
              </button>

              {/* Story Image */}
              <div className="w-14 h-20 rounded-lg overflow-hidden bg-historical-stone flex-shrink-0">
                <img src={story.image} alt={story.titleAr} className="w-full h-full object-cover" />
              </div>

              {/* Story Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-historical-charcoal truncate">{story.titleAr}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLinkTypeColor(story.linkType)}`}>
                    {getLinkTypeLabel(story.linkType)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-historical-charcoal/50">
                  <span className="flex items-center gap-1">
                    {Icons.eye}
                    {story.views.toLocaleString()}
                  </span>
                  <span>ينتهي: {getTimeRemaining(story.expiresAt)}</span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(story.id)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  story.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: story.isActive ? 22 : 4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                />
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(story)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
                >
                  {Icons.edit}
                </button>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  {Icons.delete}
                </button>
              </div>
            </motion.div>
          ))}
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
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
                <h2 className="text-lg font-bold text-historical-charcoal">
                  {editingStory ? 'تعديل القصة' : 'إضافة قصة جديدة'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:bg-historical-gold/10"
                >
                  {Icons.close}
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Image Upload */}
                <div className="flex justify-center">
                  <div className="w-32 h-48 rounded-xl border-2 border-dashed border-historical-gold/30 bg-historical-stone/30 flex items-center justify-center cursor-pointer hover:bg-historical-gold/10 transition-colors">
                    <div className="text-center">
                      <div className="text-historical-gold mb-2">{Icons.play}</div>
                      <p className="text-xs text-historical-charcoal/50">رفع صورة</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">العنوان (عربي)</label>
                  <input
                    type="text"
                    defaultValue={editingStory?.titleAr}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">نوع الرابط</label>
                  <select
                    defaultValue={editingStory?.linkType || 'product'}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  >
                    <option value="product">منتج</option>
                    <option value="category">فئة</option>
                    <option value="offer">عرض</option>
                    <option value="external">رابط خارجي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">الرابط</label>
                  <input
                    type="text"
                    defaultValue={editingStory?.link}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-2">تاريخ الانتهاء</label>
                  <input
                    type="datetime-local"
                    defaultValue={editingStory?.expiresAt}
                    className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  />
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
                  {editingStory ? 'حفظ التغييرات' : 'إضافة القصة'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

