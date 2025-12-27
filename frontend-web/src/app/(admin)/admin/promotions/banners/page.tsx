'use client'

/**
 * Admin Banners Management Page
 * صفحة إدارة البانرات الإعلانية
 * 
 * Features:
 * - Banner list with grid view
 * - Filters (location, active status)
 * - Search
 * - Create/Update/Delete banners
 * - Real-time API integration
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useBanners } from '@/lib/admin'
import type { Banner, BannerPayload, BannerLocation } from '@/lib/admin'
import { useLanguage } from '@/lib/i18n/context'

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
// Helper Functions
// دوال مساعدة
// =============================================================================

const getLocationLabel = (location: BannerLocation, t: any) => {
  const labels = {
    hero: t.admin.promotions.banners.hero,
    sidebar: t.admin.promotions.banners.sidebar,
    popup: t.admin.promotions.banners.popup,
    category: t.admin.promotions.banners.category,
  }
  return labels[location] || location
}

const getLocationColor = (location: BannerLocation) => {
  const colors = {
    hero: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    sidebar: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    popup: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    category: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }
  return colors[location] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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
// Main Component
// =============================================================================

export default function BannersPage() {
  const { t } = useLanguage()
  const {
    banners,
    total,
    isLoading,
    isProcessing,
    error,
    filters,
    fetchBanners,
    create,
    update,
    remove,
    setFilters,
    refresh,
  } = useBanners()
  
  const [filterLocation, setFilterLocation] = useState<BannerLocation | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  
  // Update filters when location filter changes
  useEffect(() => {
    const newFilters = { ...filters }
    if (filterLocation) {
      newFilters.location = filterLocation
    } else {
      delete newFilters.location
    }
    setFilters(newFilters)
    fetchBanners(newFilters)
  }, [filterLocation]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = useCallback(async (id: number, isActive: boolean) => {
    const banner = banners.find(b => b.id === id)
    if (!banner) return
    
    const success = await update(id, {
      ...banner,
      is_active: !isActive,
    } as BannerPayload)
    
    if (success) {
      refresh()
    }
  }, [banners, update, refresh])

  const handleDelete = useCallback(async (id: number) => {
    if (confirm(t.admin.promotions.banners.confirmDelete)) {
      const success = await remove(id)
      if (success) {
        refresh()
      }
    }
  }, [remove, refresh, t])

  const handleEdit = useCallback((banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingBanner(null)
    setIsModalOpen(true)
  }, [])

  const filteredBanners = banners.filter(b => !filterLocation || b.location === filterLocation)
  const activeBanners = banners.filter(b => b.is_active)

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
          <Link
            href="/admin/promotions"
            className="p-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50 hover:text-historical-charcoal dark:text-gray-200 transition-colors duration-300 hover:bg-historical-gold/10 transition-colors"
          >
            {Icons.back}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{t.admin.promotions.banners.pageTitle}</h1>
            <p className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50 mt-1">{t.admin.promotions.banners.pageSubtitle}</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>{t.admin.promotions.banners.addBanner}</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value as BannerLocation | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[180px]"
        >
          <option value="">{t.admin.promotions.banners.allLocations}</option>
          <option value="hero">{t.admin.promotions.banners.hero}</option>
          <option value="sidebar">{t.admin.promotions.banners.sidebar}</option>
          <option value="popup">{t.admin.promotions.banners.popup}</option>
          <option value="category">{t.admin.promotions.banners.category}</option>
        </select>
        <div className="flex-1" />
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50">
            <div className="w-4 h-4 border-2 border-historical-gold border-t-transparent rounded-full animate-spin" />
            <span>{t.admin.promotions.banners.loading}</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50">
            <span>{t.admin.promotions.banners.total}: {total}</span>
            <span>•</span>
            <span className="text-green-600 dark:text-green-400 transition-colors duration-300">{t.admin.promotions.active}: {activeBanners.length}</span>
          </div>
        )}
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Banners Grid */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300 rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft h-64 animate-pulse" />
          ))}
        </motion.div>
      ) : filteredBanners.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300 rounded-2xl border border-historical-gold/10 dark:border-gray-700"
        >
          <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.promotions.banners.noBanners}</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <motion.div
              key={banner.id}
              variants={itemVariants}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors duration-300 rounded-2xl border shadow-soft overflow-hidden group ${
                banner.is_active ? 'border-green-200 dark:border-green-800' : 'border-historical-gold/10 dark:border-gray-700'
              }`}
            >
              {/* Banner Image Preview */}
              <div className="relative h-40 bg-historical-stone overflow-hidden">
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title_ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-historical-stone">
                    {Icons.image}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-white font-bold text-lg">{banner.title_ar}</h3>
                  {banner.subtitle_ar && (
                    <p className="text-white/80 text-sm">{banner.subtitle_ar}</p>
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLocationColor(banner.location)}`}>
                    {getLocationLabel(banner.location, t)}
                  </span>
                </div>
                {!banner.is_active && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 transition-colors duration-300">
                      {t.admin.promotions.banners.inactive}
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Details */}
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                    {Icons.eye}
                    <span>{banner.views.toLocaleString()} {t.admin.promotions.views}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                    {Icons.click}
                    <span>{banner.clicks.toLocaleString()} {t.admin.promotions.clicks}</span>
                  </div>
                  <div className="flex-1" />
                  {banner.views > 0 && (
                    <span className="text-xs text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300">
                      {((banner.clicks / banner.views) * 100).toFixed(1)}% CTR
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300 mb-4">
                  <span>{t.admin.promotions.banners.from}: {new Date(banner.start_date).toLocaleDateString('ar-SY')}</span>
                  {banner.end_date && (
                    <>
                      <span>-</span>
                      <span>{t.admin.promotions.banners.to}: {new Date(banner.end_date).toLocaleDateString('ar-SY')}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(banner.id, banner.is_active)}
                    disabled={isProcessing}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                      banner.is_active ? 'bg-green-500 dark:bg-green-600' : 'bg-historical-charcoal/20 dark:bg-gray-600'
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{ x: banner.is_active ? 22 : 4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-200 shadow transition-colors duration-300"
                    />
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
                  >
                    {Icons.edit}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    disabled={isProcessing}
                    className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300 disabled:opacity-50"
                  >
                    {Icons.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <BannerModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        banner={editingBanner}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBanner(null)
        }}
        onSave={async (data) => {
          let success = false
          if (editingBanner) {
            success = await update(editingBanner.id, data)
          } else {
            success = await create(data)
          }
          if (success) {
            setIsModalOpen(false)
            setEditingBanner(null)
            refresh()
          }
          return success
        }}
      />
    </motion.div>
  )
}

// =============================================================================
// Banner Modal Component
// مكون Modal البانر
// =============================================================================

interface BannerModalProps {
  isOpen: boolean
  isProcessing: boolean
  banner: Banner | null
  onClose: () => void
  onSave: (data: BannerPayload) => Promise<boolean>
}

function BannerModal({
  isOpen,
  isProcessing,
  banner,
  onClose,
  onSave,
}: BannerModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<BannerPayload>({
    title: '',
    title_ar: '',
    subtitle: '',
    subtitle_ar: '',
    link_type: 'url',
    link: '',
    location: 'hero',
    order: 0,
    start_date: new Date().toISOString().slice(0, 16),
    end_date: null,
    is_active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (banner) {
        setFormData({
          title: banner.title,
          title_ar: banner.title_ar,
          subtitle: banner.subtitle || '',
          subtitle_ar: banner.subtitle_ar || '',
          link_type: banner.link_type,
          link: banner.link,
          location: banner.location,
          order: banner.order,
          start_date: banner.start_date.slice(0, 16),
          end_date: banner.end_date ? banner.end_date.slice(0, 16) : null,
          is_active: banner.is_active,
        })
        setImagePreview(banner.image_url || null)
      } else {
        setFormData({
          title: '',
          title_ar: '',
          subtitle: '',
          subtitle_ar: '',
          link_type: 'url',
          link: '',
          location: 'hero',
          order: 0,
          start_date: new Date().toISOString().slice(0, 16),
          end_date: null,
          is_active: true,
        })
        setImagePreview(null)
      }
      setImageFile(null)
      setFormErrors({})
    }
  }, [isOpen, banner])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validation
    if (!formData.title_ar.trim()) {
      setFormErrors({ title_ar: t.admin.promotions.banners.titleArRequired })
      return
    }
    if (!formData.title.trim()) {
      setFormErrors({ title: t.admin.promotions.banners.titleEnRequired })
      return
    }
    if (!formData.link.trim()) {
      setFormErrors({ link: t.admin.promotions.banners.linkRequired })
      return
    }
    if (!banner && !imageFile && !imagePreview) {
      setFormErrors({ image: t.admin.promotions.banners.imageRequired })
      return
    }

    const payload: BannerPayload = {
      ...formData,
      image: imageFile || undefined,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    }

    const success = await onSave(payload)
    if (success) {
      // Form will be reset by useEffect when modal closes
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
              {banner ? t.admin.promotions.banners.editBanner : t.admin.promotions.banners.addNewBanner}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
            >
              {Icons.close}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">{t.admin.promotions.banners.image}</label>
              <div className="border-2 border-dashed border-historical-gold/30 dark:border-gray-600 rounded-xl p-8 text-center bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg mb-4"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                      }}
                      className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-300"
                    >
                      {t.admin.promotions.banners.removeImage}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-historical-gold mb-3">{Icons.image}</div>
                    <p className="text-sm text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">{t.admin.promotions.banners.dragImage}</p>
                    <label className="inline-block px-4 py-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 text-sm font-medium cursor-pointer hover:bg-historical-gold/20 dark:hover:bg-yellow-900/40 transition-colors duration-300">
                      {t.admin.promotions.banners.chooseFile}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
              {formErrors.image && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">{formErrors.image}</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.titleAr} *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  required
                />
                {formErrors.title_ar && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.title_ar}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.titleEn} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  dir="ltr"
                  required
                />
                {formErrors.title && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.subtitleAr}
                </label>
                <input
                  type="text"
                  value={formData.subtitle_ar}
                  onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.subtitleEn}
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.linkType}
                </label>
                <select
                  value={formData.link_type}
                  onChange={(e) => setFormData({ ...formData, link_type: e.target.value as 'url' | 'product' | 'category' })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                >
                  <option value="url">{t.admin.promotions.banners.directLink}</option>
                  <option value="product">{t.admin.promotions.banners.product}</option>
                  <option value="category">{t.admin.promotions.banners.category}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.link} *
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  dir="ltr"
                  required
                />
                {formErrors.link && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.link}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.location}
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value as BannerLocation })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                >
                  <option value="hero">{t.admin.promotions.banners.hero}</option>
                  <option value="sidebar">{t.admin.promotions.banners.sidebar}</option>
                  <option value="popup">{t.admin.promotions.banners.popup}</option>
                  <option value="category">{t.admin.promotions.banners.category}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.order}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.startDate} *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                  {t.admin.promotions.banners.endDate}
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-historical-gold/30 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-gold dark:text-yellow-400 focus:ring-historical-gold dark:focus:ring-yellow-600 transition-colors duration-300"
                />
                <span className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{t.admin.promotions.active}</span>
              </label>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 dark:text-gray-300 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300"
            >
              {t.admin.promotions.banners.cancel}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors disabled:opacity-50"
            >
              {isProcessing ? t.admin.promotions.banners.saving : (banner ? t.admin.promotions.banners.saveChanges : t.admin.promotions.banners.addBanner)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

