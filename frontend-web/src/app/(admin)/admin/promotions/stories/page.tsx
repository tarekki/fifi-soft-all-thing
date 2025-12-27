'use client'

/**
 * Admin Stories Management Page
 * صفحة إدارة القصص
 * 
 * Features:
 * - Story list with grid view
 * - Filters (active status)
 * - Search
 * - Create/Update/Delete stories
 * - Real-time API integration
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useStories } from '@/lib/admin'
import type { Story, StoryPayload } from '@/lib/admin'
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
  image: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
}

// =============================================================================
// Helper Functions
// دوال مساعدة
// =============================================================================

const getLinkTypeLabel = (linkType: 'url' | 'product' | 'category', t: any) => {
  const labels = {
    url: t.admin.promotions.stories.directLink,
    product: t.admin.promotions.stories.product,
    category: t.admin.promotions.stories.category,
  }
  return labels[linkType]
}

const getLinkTypeColor = (linkType: 'url' | 'product' | 'category') => {
  const colors = {
    url: 'bg-blue-100 text-blue-700',
    product: 'bg-green-100 text-green-700',
    category: 'bg-purple-100 text-purple-700',
  }
  return colors[linkType]
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

const getTimeRemaining = (expiresAt: string, t: any) => {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  
  if (diff < 0) return t.admin.promotions.stories.expired
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} ${t.admin.promotions.stories.days}`
  return `${hours} ${t.admin.promotions.stories.hours}`
}

// =============================================================================
// Main Component
// =============================================================================

export default function StoriesPage() {
  const { t } = useLanguage()
  const {
    stories,
    total,
    isLoading,
    isProcessing,
    error,
    create,
    update,
    remove,
    refresh,
  } = useStories()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)

  const handleToggle = useCallback(async (id: number, isActive: boolean) => {
    const story = stories.find(s => s.id === id)
    if (!story) return
    
    const success = await update(id, {
      ...story,
      is_active: !isActive,
    } as StoryPayload)
    
    if (success) {
      refresh()
    }
  }, [stories, update, refresh])

  const handleDelete = useCallback(async (id: number) => {
    if (confirm(t.admin.promotions.stories.confirmDelete)) {
      const success = await remove(id)
      if (success) {
        refresh()
      }
    }
  }, [remove, refresh, t])

  const handleEdit = useCallback((story: Story) => {
    setEditingStory(story)
    setIsModalOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setEditingStory(null)
    setIsModalOpen(true)
  }, [])

  const activeStories = stories.filter(s => s.is_active)

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
            className="p-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
          >
            {Icons.back}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-historical-charcoal">{t.admin.promotions.stories.pageTitle}</h1>
            <p className="text-historical-charcoal/50 mt-1">{t.admin.promotions.stories.pageSubtitle}</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {Icons.add}
          <span>{t.admin.promotions.stories.addStory}</span>
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Stories Preview (Instagram-style) */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft p-6">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 rounded-full bg-historical-stone animate-pulse" />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft p-6">
          <h2 className="text-sm font-medium text-historical-charcoal/50 mb-4">{t.admin.promotions.stories.preview}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {activeStories.map((story) => (
              <div key={story.id} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-historical-gold via-historical-red to-historical-gold">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                    {story.image_url ? (
                      <img src={story.image_url} alt={story.title_ar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-historical-stone flex items-center justify-center">
                        {Icons.image}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-historical-charcoal mt-2 max-w-[64px] truncate">{story.title_ar}</p>
              </div>
            ))}
            {activeStories.length === 0 && (
              <p className="text-sm text-historical-charcoal/50">{t.admin.promotions.stories.noActiveStories}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Stories List */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-historical-stone animate-pulse rounded-xl" />
          ))}
        </motion.div>
      ) : stories.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10"
        >
          <p className="text-historical-charcoal/50">{t.admin.promotions.stories.noStories}</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden">
          <div className="p-4 space-y-3">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                layout
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${
                  story.is_active ? 'border-green-200 bg-green-50/30' : 'border-historical-gold/10 bg-historical-stone/30'
                }`}
              >
                {/* Story Image */}
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-historical-stone flex-shrink-0">
                  {story.image_url ? (
                    <img src={story.image_url} alt={story.title_ar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {Icons.image}
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-historical-charcoal truncate">{story.title_ar}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLinkTypeColor(story.link_type)}`}>
                      {getLinkTypeLabel(story.link_type, t)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-historical-charcoal/50">
                    <span className="flex items-center gap-1">
                      {Icons.eye}
                      {story.views.toLocaleString()}
                    </span>
                    <span>{t.admin.promotions.stories.expiresAt}: {new Date(story.expires_at).toLocaleDateString('ar-SY')}</span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(story.id, story.is_active)}
                  disabled={isProcessing}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                    story.is_active ? 'bg-green-500' : 'bg-historical-charcoal/20'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: story.is_active ? 22 : 4 }}
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
                    disabled={isProcessing}
                    className="p-2 rounded-lg text-historical-charcoal/50 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {Icons.delete}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <StoryModal
        isOpen={isModalOpen}
        isProcessing={isProcessing}
        story={editingStory}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStory(null)
        }}
        onSave={async (data) => {
          let success = false
          if (editingStory) {
            success = await update(editingStory.id, data)
          } else {
            success = await create(data)
          }
          if (success) {
            setIsModalOpen(false)
            setEditingStory(null)
            refresh()
          }
          return success
        }}
      />
    </motion.div>
  )
}

// =============================================================================
// Story Modal Component
// مكون Modal القصة
// =============================================================================

interface StoryModalProps {
  isOpen: boolean
  isProcessing: boolean
  story: Story | null
  onClose: () => void
  onSave: (data: StoryPayload) => Promise<boolean>
}

function StoryModal({
  isOpen,
  isProcessing,
  story,
  onClose,
  onSave,
}: StoryModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<StoryPayload>({
    title: '',
    title_ar: '',
    link_type: 'url',
    link: '',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    is_active: true,
    order: 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      if (story) {
        setFormData({
          title: story.title,
          title_ar: story.title_ar,
          link_type: story.link_type,
          link: story.link || '',
          expires_at: story.expires_at.slice(0, 16),
          is_active: story.is_active,
          order: story.order,
        })
        setImagePreview(story.image_url || null)
      } else {
        setFormData({
          title: '',
          title_ar: '',
          link_type: 'url',
          link: '',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          is_active: true,
          order: 0,
        })
        setImagePreview(null)
      }
      setImageFile(null)
      setFormErrors({})
    }
  }, [isOpen, story])

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
      setFormErrors({ title_ar: t.admin.promotions.stories.titleArRequired })
      return
    }
    if (!formData.title.trim()) {
      setFormErrors({ title: t.admin.promotions.stories.titleEnRequired })
      return
    }
    if (!story && !imageFile && !imagePreview) {
      setFormErrors({ image: t.admin.promotions.stories.imageRequired })
      return
    }

    const payload: StoryPayload = {
      ...formData,
      image: imageFile || undefined,
      expires_at: new Date(formData.expires_at).toISOString(),
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
          className="w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-historical-gold/10">
            <h2 className="text-lg font-bold text-historical-charcoal">
              {story ? t.admin.promotions.stories.editStory : t.admin.promotions.stories.addNewStory}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">{t.admin.promotions.stories.image}</label>
              <div className="flex justify-center">
                <div className="w-32 h-48 rounded-xl border-2 border-dashed border-historical-gold/30 bg-historical-stone/30 flex items-center justify-center cursor-pointer hover:bg-historical-gold/10 transition-colors">
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white"
                      >
                        {Icons.close}
                      </button>
                    </div>
                  ) : (
                    <label className="text-center cursor-pointer">
                      <div className="text-historical-gold mb-2">{Icons.play}</div>
                      <p className="text-xs text-historical-charcoal/50">{t.admin.promotions.stories.uploadImage}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
              {formErrors.image && (
                <p className="text-sm text-red-600 mt-1">{formErrors.image}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.stories.titleAr} *
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                required
              />
              {formErrors.title_ar && (
                <p className="text-sm text-red-600 mt-1">{formErrors.title_ar}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.stories.titleEn} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                dir="ltr"
                required
              />
              {formErrors.title && (
                <p className="text-sm text-red-600 mt-1">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.stories.linkType}
              </label>
              <select
                value={formData.link_type}
                onChange={(e) => setFormData({ ...formData, link_type: e.target.value as 'url' | 'product' | 'category' })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
              >
                <option value="url">{t.admin.promotions.stories.directLink}</option>
                <option value="product">{t.admin.promotions.stories.product}</option>
                <option value="category">{t.admin.promotions.stories.category}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-historical-charcoal mb-2">
                {t.admin.promotions.stories.link}
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.stories.expiryDate} *
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-historical-charcoal mb-2">
                  {t.admin.promotions.stories.order}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-historical-gold/30 text-historical-gold focus:ring-historical-gold"
                />
                <span className="text-sm text-historical-charcoal">{t.admin.promotions.active}</span>
              </label>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-historical-gold/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-historical-charcoal/70 hover:bg-historical-gold/10 transition-colors"
            >
              {t.admin.promotions.stories.cancel}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-historical-gold text-white font-medium hover:bg-historical-red transition-colors disabled:opacity-50"
            >
              {isProcessing ? t.admin.promotions.stories.saving : (story ? t.admin.promotions.stories.saveChanges : t.admin.promotions.stories.addStory)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

