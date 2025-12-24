'use client'

/**
 * Admin Banners Management Page
 * صفحة إدارة البانرات الإعلانية
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Banner {
  id: string
  title: string
  titleAr: string
  subtitle: string
  subtitleAr: string
  image: string
  link: string
  location: 'hero' | 'sidebar' | 'popup' | 'category'
  startDate: string
  endDate: string
  isActive: boolean
  order: number
  clicks: number
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
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  click: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  image: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'Winter Sale',
    titleAr: 'تخفيضات الشتاء',
    subtitle: 'Up to 50% off',
    subtitleAr: 'خصم حتى 50%',
    image: 'https://via.placeholder.com/1200x400',
    link: '/offers/winter',
    location: 'hero',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    isActive: true,
    order: 1,
    clicks: 1250,
    views: 15000,
  },
  {
    id: '2',
    title: 'New Arrivals',
    titleAr: 'وصل حديثاً',
    subtitle: 'Check out the latest',
    subtitleAr: 'اكتشف الجديد',
    image: 'https://via.placeholder.com/1200x400',
    link: '/new',
    location: 'hero',
    startDate: '2024-12-15',
    endDate: '2025-01-15',
    isActive: true,
    order: 2,
    clicks: 890,
    views: 12000,
  },
  {
    id: '3',
    title: 'Flash Deal',
    titleAr: 'عرض خاطف',
    subtitle: 'Limited time only',
    subtitleAr: 'لفترة محدودة',
    image: 'https://via.placeholder.com/300x250',
    link: '/flash-deals',
    location: 'sidebar',
    startDate: '2024-12-24',
    endDate: '2024-12-25',
    isActive: true,
    order: 1,
    clicks: 340,
    views: 5000,
  },
  {
    id: '4',
    title: 'Subscribe Now',
    titleAr: 'اشترك الآن',
    subtitle: 'Get 10% off your first order',
    subtitleAr: 'احصل على خصم 10% على طلبك الأول',
    image: 'https://via.placeholder.com/600x400',
    link: '/subscribe',
    location: 'popup',
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    isActive: false,
    order: 1,
    clicks: 150,
    views: 3000,
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

const getLocationLabel = (location: Banner['location']) => {
  const labels = {
    hero: 'الصفحة الرئيسية',
    sidebar: 'الشريط الجانبي',
    popup: 'نافذة منبثقة',
    category: 'صفحة الفئة',
  }
  return labels[location]
}

const getLocationColor = (location: Banner['location']) => {
  const colors = {
    hero: 'bg-blue-100 text-blue-700',
    sidebar: 'bg-purple-100 text-purple-700',
    popup: 'bg-orange-100 text-orange-700',
    category: 'bg-green-100 text-green-700',
  }
  return colors[location]
}

// =============================================================================
// Main Component
// =============================================================================

export default function BannersPage() {
  const [banners, setBanners] = useState(mockBanners)
  const [filterLocation, setFilterLocation] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const handleToggle = useCallback((id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b))
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البانر؟')) {
      setBanners(prev => prev.filter(b => b.id !== id))
    }
  }, [])

  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingBanner(null)
    setIsModalOpen(true)
  }, [])

  const filteredBanners = banners.filter(b => !filterLocation || b.location === filterLocation)

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
            <h1 className="text-2xl font-bold text-historical-charcoal">البانرات الإعلانية</h1>
            <p className="text-historical-charcoal/50 mt-1">إدارة البانرات في مختلف أقسام الموقع</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>إضافة بانر</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[180px]"
        >
          <option value="">كل المواقع</option>
          <option value="hero">الصفحة الرئيسية</option>
          <option value="sidebar">الشريط الجانبي</option>
          <option value="popup">نافذة منبثقة</option>
          <option value="category">صفحة الفئة</option>
        </select>
        <div className="flex-1" />
        <div className="flex items-center gap-4 text-sm text-historical-charcoal/50">
          <span>الإجمالي: {filteredBanners.length}</span>
          <span>•</span>
          <span className="text-green-600">نشط: {filteredBanners.filter(b => b.isActive).length}</span>
        </div>
      </motion.div>

      {/* Banners Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanners.map((banner) => (
          <motion.div
            key={banner.id}
            variants={itemVariants}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-soft overflow-hidden group ${
              banner.isActive ? 'border-green-200' : 'border-historical-gold/10'
            }`}
          >
            {/* Banner Image Preview */}
            <div className="relative h-40 bg-historical-stone overflow-hidden">
              <img
                src={banner.image}
                alt={banner.titleAr}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 right-3 left-3">
                <h3 className="text-white font-bold text-lg">{banner.titleAr}</h3>
                <p className="text-white/80 text-sm">{banner.subtitleAr}</p>
              </div>
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLocationColor(banner.location)}`}>
                  {getLocationLabel(banner.location)}
                </span>
              </div>
              {!banner.isActive && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    غير نشط
                  </span>
                </div>
              )}
            </div>

            {/* Banner Details */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-historical-charcoal/50">
                  {Icons.eye}
                  <span>{banner.views.toLocaleString()} مشاهدة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-historical-charcoal/50">
                  {Icons.click}
                  <span>{banner.clicks.toLocaleString()} نقرة</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-historical-charcoal/40">
                  {((banner.clicks / banner.views) * 100).toFixed(1)}% CTR
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-historical-charcoal/50 mb-4">
                <span>من: {new Date(banner.startDate).toLocaleDateString('ar-SY')}</span>
                <span>-</span>
                <span>إلى: {new Date(banner.endDate).toLocaleDateString('ar-SY')}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(banner.id)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    banner.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: banner.isActive ? 22 : 4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                  />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
                >
                  {Icons.edit}
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  {Icons.delete}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
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
              className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
                <h2 className="text-lg font-bold text-historical-charcoal">
                  {editingBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-historical-charcoal/50 hover:bg-historical-gold/10"
                >
                  {Icons.close}
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-historical-gold/30 rounded-xl p-8 text-center bg-historical-stone/30">
                  <div className="text-historical-gold mb-3">{Icons.image}</div>
                  <p className="text-sm text-historical-charcoal/70 mb-2">اسحب الصورة هنا أو</p>
                  <button className="px-4 py-2 rounded-lg bg-historical-gold/10 text-historical-gold text-sm font-medium">
                    اختر ملف
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">العنوان (عربي)</label>
                    <input
                      type="text"
                      defaultValue={editingBanner?.titleAr}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">Title (English)</label>
                    <input
                      type="text"
                      defaultValue={editingBanner?.title}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">العنوان الفرعي (عربي)</label>
                    <input
                      type="text"
                      defaultValue={editingBanner?.subtitleAr}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">Subtitle (English)</label>
                    <input
                      type="text"
                      defaultValue={editingBanner?.subtitle}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">الرابط</label>
                    <input
                      type="text"
                      defaultValue={editingBanner?.link}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">الموقع</label>
                    <select
                      defaultValue={editingBanner?.location || 'hero'}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    >
                      <option value="hero">الصفحة الرئيسية</option>
                      <option value="sidebar">الشريط الجانبي</option>
                      <option value="popup">نافذة منبثقة</option>
                      <option value="category">صفحة الفئة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">تاريخ البداية</label>
                    <input
                      type="date"
                      defaultValue={editingBanner?.startDate}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-historical-charcoal mb-2">تاريخ النهاية</label>
                    <input
                      type="date"
                      defaultValue={editingBanner?.endDate}
                      className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                  </div>
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
                  {editingBanner ? 'حفظ التغييرات' : 'إضافة البانر'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

