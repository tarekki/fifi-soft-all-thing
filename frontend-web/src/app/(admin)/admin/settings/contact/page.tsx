'use client'

/**
 * Admin Settings - Contact Information Page
 * صفحة إعدادات معلومات الاتصال
 * 
 * Connected to backend API for real data management
 * متصلة بالباك إند لإدارة البيانات الحقيقية
 * 
 * Features:
 * - Load contact information from API
 * - Update contact information securely
 * - Validation and error handling
 * - Success/error notifications
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSiteSettings, type SiteSettingsUpdate } from '@/lib/admin'

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
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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
// Validation Functions
// دوال التحقق
// =============================================================================

/**
 * Validate email format
 * التحقق من صيغة البريد الإلكتروني
 */
function validateEmail(email: string): string | null {
  if (!email.trim()) return null // Empty is allowed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'البريد الإلكتروني غير صالح / Invalid email format'
  }
  return null
}

/**
 * Validate phone number format
 * التحقق من صيغة رقم الهاتف
 */
function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null // Empty is allowed
  const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/
  if (!phoneRegex.test(phone)) {
    return 'رقم الهاتف غير صالح / Invalid phone number format'
  }
  return null
}

/**
 * Validate URL format
 * التحقق من صيغة الرابط
 */
function validateURL(url: string): string | null {
  if (!url.trim()) return null // Empty is allowed
  try {
    new URL(url)
    return null
  } catch {
    return 'الرابط غير صالح / Invalid URL format'
  }
}

// =============================================================================
// Main Component
// =============================================================================

export default function ContactSettingsPage() {
  const { settings, isLoading, isSaving, error, refresh, save } = useSiteSettings()
  const [formData, setFormData] = useState<SiteSettingsUpdate>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialize form data from settings
  // تهيئة بيانات النموذج من الإعدادات
  useEffect(() => {
    if (settings) {
      setFormData({
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_whatsapp: settings.contact_whatsapp || '',
        address: settings.address || '',
        address_ar: settings.address_ar || '',
        google_maps_url: settings.google_maps_url || '',
        working_hours: settings.working_hours || '',
        working_hours_ar: settings.working_hours_ar || '',
      })
      setHasChanges(false)
      setValidationErrors({})
    }
  }, [settings])

  // Update field handler with validation
  // معالج تحديث الحقل مع التحقق
  const updateField = useCallback(<K extends keyof SiteSettingsUpdate>(
    key: K,
    value: SiteSettingsUpdate[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSuccessMessage(null)
    
    // Clear validation error for this field
    // مسح خطأ التحقق لهذا الحقل
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })
  }, [])

  // Validate all fields before save
  // التحقق من جميع الحقول قبل الحفظ
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.contact_email !== undefined) {
      const emailError = validateEmail(formData.contact_email)
      if (emailError) errors.contact_email = emailError
    }

    if (formData.contact_phone !== undefined) {
      const phoneError = validatePhone(formData.contact_phone)
      if (phoneError) errors.contact_phone = phoneError
    }

    if (formData.contact_whatsapp !== undefined) {
      const whatsappError = validatePhone(formData.contact_whatsapp)
      if (whatsappError) errors.contact_whatsapp = whatsappError
    }

    if (formData.google_maps_url !== undefined) {
      const urlError = validateURL(formData.google_maps_url)
      if (urlError) errors.google_maps_url = urlError
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle save with validation and error handling
  // معالج الحفظ مع التحقق ومعالجة الأخطاء
  const handleSave = async () => {
    // Validate form
    // التحقق من النموذج
    if (!validateForm()) {
      return
    }

    // Prepare data for API (sanitize and trim)
    // تحضير البيانات للـ API (تنظيف وتقليم)
    const dataToSave: SiteSettingsUpdate = {}
    
    if (formData.contact_email !== undefined) {
      dataToSave.contact_email = formData.contact_email.trim()
    }
    if (formData.contact_phone !== undefined) {
      dataToSave.contact_phone = formData.contact_phone.trim()
    }
    if (formData.contact_whatsapp !== undefined) {
      dataToSave.contact_whatsapp = formData.contact_whatsapp.trim()
    }
    if (formData.address !== undefined) {
      dataToSave.address = formData.address.trim()
    }
    if (formData.address_ar !== undefined) {
      dataToSave.address_ar = formData.address_ar.trim()
    }
    if (formData.google_maps_url !== undefined) {
      dataToSave.google_maps_url = formData.google_maps_url.trim()
    }
    if (formData.working_hours !== undefined) {
      dataToSave.working_hours = formData.working_hours.trim()
    }
    if (formData.working_hours_ar !== undefined) {
      dataToSave.working_hours_ar = formData.working_hours_ar.trim()
    }

    // Save to backend
    // الحفظ في الباك إند
    const success = await save(dataToSave)
    
    if (success) {
      setHasChanges(false)
      setSuccessMessage('تم حفظ معلومات الاتصال بنجاح / Contact information saved successfully')
      setValidationErrors({})
      
      // Clear success message after 5 seconds
      // مسح رسالة النجاح بعد 5 ثواني
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }
  }

  // Loading state
  // حالة التحميل
  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {Icons.loading}
          <p className="text-historical-charcoal/50 dark:text-gray-400">جاري تحميل معلومات الاتصال...</p>
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            معلومات الاتصال
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            بيانات التواصل والعنوان - متصل بالباك إند
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
            title="تحديث / Refresh"
          >
            <span className={isLoading ? 'animate-spin' : ''}>{Icons.refresh}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              hasChanges && !isSaving
                ? 'bg-gradient-to-l from-historical-gold to-historical-red text-white shadow-lg hover:shadow-xl'
                : 'bg-historical-charcoal/10 dark:bg-gray-700/50 text-historical-charcoal/40 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? Icons.loading : Icons.save}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
          >
            {Icons.success}
            <div>
              <p className="font-medium">نجح!</p>
              <p className="text-sm opacity-80">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
        >
          {Icons.error}
          <div>
            <p className="font-medium">حدث خطأ</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Contact Methods */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.phone}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            طرق التواصل
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => updateField('contact_email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 transition-colors duration-300 ${
                validationErrors.contact_email
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-300 dark:focus:ring-red-700'
                  : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
              }`}
              dir="ltr"
              placeholder="info@example.com"
            />
            {validationErrors.contact_email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.contact_email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.contact_phone || ''}
              onChange={(e) => updateField('contact_phone', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 transition-colors duration-300 ${
                validationErrors.contact_phone
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-300 dark:focus:ring-red-700'
                  : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
              }`}
              dir="ltr"
              placeholder="+963 11 123 4567"
            />
            {validationErrors.contact_phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.contact_phone}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              واتساب
            </label>
            <input
              type="tel"
              value={formData.contact_whatsapp || ''}
              onChange={(e) => updateField('contact_whatsapp', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 transition-colors duration-300 ${
                validationErrors.contact_whatsapp
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-300 dark:focus:ring-red-700'
                  : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
              }`}
              dir="ltr"
              placeholder="+963 912 345 678"
            />
            {validationErrors.contact_whatsapp && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.contact_whatsapp}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Address */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.location}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            العنوان
          </h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address English */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                Address (English)
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300 resize-none"
                dir="ltr"
                placeholder="Damascus, Syria"
              />
            </div>

            {/* Address Arabic */}
            <div>
              <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
                العنوان (عربي)
              </label>
              <textarea
                value={formData.address_ar || ''}
                onChange={(e) => updateField('address_ar', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300 resize-none"
                placeholder="دمشق، سوريا"
              />
            </div>
          </div>

          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              رابط خرائط Google
            </label>
            <input
              type="url"
              value={formData.google_maps_url || ''}
              onChange={(e) => updateField('google_maps_url', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 transition-colors duration-300 ${
                validationErrors.google_maps_url
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-300 dark:focus:ring-red-700'
                  : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
              }`}
              dir="ltr"
              placeholder="https://maps.google.com/?q=33.5138,36.2765"
            />
            {validationErrors.google_maps_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.google_maps_url}</p>
            )}
            <p className="mt-1 text-xs text-historical-charcoal/50 dark:text-gray-400">
              رابط خرائط Google أو رابط مشاركة الموقع / Google Maps link or location share URL
            </p>
          </div>
        </div>
      </motion.div>

      {/* Working Hours */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
            {Icons.clock}
          </div>
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            ساعات العمل
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Working Hours English */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              Working Hours (English)
            </label>
            <input
              type="text"
              value={formData.working_hours || ''}
              onChange={(e) => updateField('working_hours', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="Sunday - Thursday: 9:00 AM - 6:00 PM"
              dir="ltr"
            />
            <p className="mt-1 text-xs text-historical-charcoal/50 dark:text-gray-400">
              مثال: Sunday - Thursday: 9:00 AM - 6:00 PM
            </p>
          </div>

          {/* Working Hours Arabic */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-2 transition-colors duration-300">
              ساعات العمل (عربي)
            </label>
            <input
              type="text"
              value={formData.working_hours_ar || ''}
              onChange={(e) => updateField('working_hours_ar', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 transition-colors duration-300"
              placeholder="الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً"
            />
            <p className="mt-1 text-xs text-historical-charcoal/50 dark:text-gray-400">
              مثال: الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
