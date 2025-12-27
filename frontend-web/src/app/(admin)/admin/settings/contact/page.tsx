'use client'

/**
 * Admin Settings - Contact Information Page
 * صفحة إعدادات معلومات الاتصال
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface ContactSettings {
  email: string
  phone: string
  whatsapp: string
  address: string
  addressAr: string
  city: string
  country: string
  postalCode: string
  googleMapsUrl: string
  workingHours: {
    weekdays: string
    weekend: string
  }
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
  mail: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialSettings: ContactSettings = {
  email: 'support@yallabuy.com',
  phone: '+963 11 123 4567',
  whatsapp: '+963 912 345 678',
  address: 'Mazzeh Street, Building 15, Floor 3',
  addressAr: 'شارع المزة، بناء رقم 15، الطابق الثالث',
  city: 'Damascus',
  country: 'Syria',
  postalCode: '',
  googleMapsUrl: 'https://maps.google.com/?q=33.5138,36.2765',
  workingHours: {
    weekdays: '9:00 AM - 6:00 PM',
    weekend: '10:00 AM - 2:00 PM',
  },
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

export default function ContactSettingsPage() {
  const [settings, setSettings] = useState<ContactSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = useCallback(<K extends keyof ContactSettings>(key: K, value: ContactSettings[K]) => {
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">معلومات الاتصال</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">بيانات التواصل والعنوان</p>
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

      {/* Contact Methods */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.phone}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">طرق التواصل</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => updateSetting('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              واتساب
            </label>
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={(e) => updateSetting('whatsapp', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      {/* Address */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.location}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">العنوان</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                Address (English)
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                العنوان (عربي)
              </label>
              <input
                type="text"
                value={settings.addressAr}
                onChange={(e) => updateSetting('addressAr', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                المدينة
              </label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => updateSetting('city', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                البلد
              </label>
              <input
                type="text"
                value={settings.country}
                onChange={(e) => updateSetting('country', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                الرمز البريدي
              </label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => updateSetting('postalCode', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              رابط خرائط Google
            </label>
            <input
              type="url"
              value={settings.googleMapsUrl}
              onChange={(e) => updateSetting('googleMapsUrl', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>

      {/* Working Hours */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.clock}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">ساعات العمل</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              أيام الأسبوع (السبت - الخميس)
            </label>
            <input
              type="text"
              value={settings.workingHours.weekdays}
              onChange={(e) => updateSetting('workingHours', { ...settings.workingHours, weekdays: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="9:00 AM - 6:00 PM"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              نهاية الأسبوع (الجمعة)
            </label>
            <input
              type="text"
              value={settings.workingHours.weekend}
              onChange={(e) => updateSetting('workingHours', { ...settings.workingHours, weekend: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="مغلق أو 10:00 AM - 2:00 PM"
              dir="ltr"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

