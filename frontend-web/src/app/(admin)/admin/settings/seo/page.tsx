'use client'

/**
 * Admin Settings - SEO Page
 * صفحة إعدادات تحسين محركات البحث
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface SEOSettings {
  metaTitle: string
  metaTitleAr: string
  metaDescription: string
  metaDescriptionAr: string
  metaKeywords: string
  metaKeywordsAr: string
  ogImage: string
  twitterHandle: string
  googleAnalyticsId: string
  googleTagManagerId: string
  facebookPixelId: string
  enableIndexing: boolean
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
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  search: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialSettings: SEOSettings = {
  metaTitle: 'Yalla Buy - Multi-vendor E-commerce',
  metaTitleAr: 'يلا باي - متجر متعدد البائعين',
  metaDescription: 'Shop the best products from trusted vendors. Fast delivery, secure payments.',
  metaDescriptionAr: 'تسوق أفضل المنتجات من بائعين موثوقين. توصيل سريع ودفع آمن.',
  metaKeywords: 'shopping, ecommerce, online store, Syria, Damascus',
  metaKeywordsAr: 'تسوق, متجر الكتروني, سوريا, دمشق',
  ogImage: '',
  twitterHandle: '@yallabuy',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  googleTagManagerId: 'GTM-XXXXXXX',
  facebookPixelId: '',
  enableIndexing: true,
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Main Component
// =============================================================================

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState<SEOSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = useCallback(<K extends keyof SEOSettings>(key: K, value: SEOSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">إعدادات SEO</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">تحسين ظهور الموقع في محركات البحث</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
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
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </motion.div>

      {/* Meta Tags */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.search}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">Meta Tags</h2>
        </div>

        <div className="space-y-6">
          {/* Meta Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                Meta Title (English)
              </label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => updateSetting('metaTitle', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                dir="ltr"
              />
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{settings.metaTitle.length}/60 حرف</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                عنوان الصفحة (عربي)
              </label>
              <input
                type="text"
                value={settings.metaTitleAr}
                onChange={(e) => updateSetting('metaTitleAr', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              />
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{settings.metaTitleAr.length}/60 حرف</p>
            </div>
          </div>

          {/* Meta Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                Meta Description (English)
              </label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) => updateSetting('metaDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 resize-none transition-colors duration-300"
                dir="ltr"
              />
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{settings.metaDescription.length}/160 حرف</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                وصف الصفحة (عربي)
              </label>
              <textarea
                value={settings.metaDescriptionAr}
                onChange={(e) => updateSetting('metaDescriptionAr', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 resize-none transition-colors duration-300"
              />
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{settings.metaDescriptionAr.length}/160 حرف</p>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                Keywords (English)
              </label>
              <input
                type="text"
                value={settings.metaKeywords}
                onChange={(e) => updateSetting('metaKeywords', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                placeholder="keyword1, keyword2, keyword3"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                الكلمات المفتاحية (عربي)
              </label>
              <input
                type="text"
                value={settings.metaKeywordsAr}
                onChange={(e) => updateSetting('metaKeywordsAr', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                placeholder="كلمة1، كلمة2، كلمة3"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tracking Codes */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">أكواد التتبع</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 font-mono text-sm transition-colors duration-300"
              placeholder="G-XXXXXXXXXX"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              Google Tag Manager ID
            </label>
            <input
              type="text"
              value={settings.googleTagManagerId}
              onChange={(e) => updateSetting('googleTagManagerId', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 font-mono text-sm transition-colors duration-300"
              placeholder="GTM-XXXXXXX"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              Facebook Pixel ID
            </label>
            <input
              type="text"
              value={settings.facebookPixelId}
              onChange={(e) => updateSetting('facebookPixelId', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 font-mono text-sm transition-colors duration-300"
              placeholder="XXXXXXXXXXXXXXXX"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              Twitter Handle
            </label>
            <input
              type="text"
              value={settings.twitterHandle}
              onChange={(e) => updateSetting('twitterHandle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="@username"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      {/* Indexing */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">الفهرسة</h2>

        <div className="flex items-center justify-between p-4 rounded-xl border border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
          <div>
            <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">السماح بفهرسة الموقع</p>
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">السماح لمحركات البحث بفهرسة صفحات الموقع</p>
          </div>
          <button
            onClick={() => updateSetting('enableIndexing', !settings.enableIndexing)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              settings.enableIndexing ? 'bg-historical-gold dark:bg-yellow-600' : 'bg-historical-charcoal/20 dark:bg-gray-600'
            }`}
          >
            <motion.div
              initial={false}
              animate={{ x: settings.enableIndexing ? 24 : 4 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-colors duration-300"
            />
          </button>
        </div>

        {!settings.enableIndexing && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-3 transition-colors duration-300">
            {Icons.info}
            <p className="text-sm text-yellow-700 dark:text-yellow-400 transition-colors duration-300">
              تم تعطيل الفهرسة. لن تظهر صفحات الموقع في نتائج محركات البحث.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

