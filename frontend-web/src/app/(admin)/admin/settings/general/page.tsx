'use client'

/**
 * Admin Settings - General Page
 * صفحة الإعدادات العامة للموقع
 * 
 * This page is connected to the backend API for real data
 * هذه الصفحة متصلة بالباك إند للبيانات الحقيقية
 * 
 * Site configuration including:
 * - Site name & tagline
 * - Logo & favicon
 * - Currency settings
 * - Maintenance mode
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
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
// Sub-Components
// =============================================================================

interface InputFieldProps {
  label: string
  labelAr?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helperText?: string
  type?: 'text' | 'textarea'
  dir?: 'rtl' | 'ltr'
  disabled?: boolean
}

function InputField({ label, labelAr, value, onChange, placeholder, helperText, type = 'text', dir = 'rtl', disabled }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
        {label}
        {labelAr && <span className="text-historical-charcoal/50 dark:text-gray-400 mr-2 transition-colors duration-300">({labelAr})</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                     text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                     transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                     text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      )}
      {helperText && (
        <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 flex items-center gap-1 transition-colors duration-300">
          {Icons.info}
          {helperText}
        </p>
      )}
    </div>
  )
}

interface ImageUploadProps {
  label: string
  imageUrl: string
  onUpload: (url: string) => void
  aspectRatio?: string
  disabled?: boolean
}

function ImageUpload({ label, imageUrl, onUpload, aspectRatio = 'aspect-video', disabled }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</label>
      <div className={`
        relative ${aspectRatio} w-full max-w-xs rounded-xl border-2 border-dashed border-historical-gold/30 dark:border-gray-600
        bg-historical-stone/30 dark:bg-gray-700/30 overflow-hidden group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        hover:border-historical-gold/50 dark:hover:border-gray-500 transition-colors
      `}>
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-historical-charcoal/40 dark:text-gray-400 transition-colors duration-300">
            {Icons.upload}
            <span className="text-xs mt-2">اضغط للرفع</span>
          </div>
        )}
        {!disabled && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">تغيير الصورة</span>
          </div>
        )}
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onUpload(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          placeholder="URL"
          disabled={disabled}
        />
      </div>
      <input
        type="url"
        value={imageUrl}
        onChange={(e) => onUpload(e.target.value)}
        placeholder="أدخل رابط الصورة..."
        disabled={disabled}
        className="w-full max-w-xs px-3 py-2 text-sm rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                   text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400
                   focus:outline-none focus:ring-1 focus:ring-historical-gold/30 dark:focus:ring-yellow-600
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        dir="ltr"
      />
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

function ToggleSwitch({ label, description, checked, onChange, variant = 'default', disabled }: ToggleSwitchProps) {
  const colors = variant === 'danger' 
    ? 'bg-red-500 dark:bg-red-600' 
    : 'bg-historical-gold dark:bg-yellow-600'

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border border-historical-gold/10 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 transition-colors duration-300 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</p>
        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative w-14 h-8 rounded-full transition-colors duration-200 disabled:cursor-not-allowed
          ${checked ? colors : 'bg-historical-charcoal/20 dark:bg-gray-600'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ x: checked ? 24 : 4 }}
          transition={{ duration: 0.2 }}
          className="absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-colors duration-300"
        />
      </button>
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}

function SelectField({ label, value, onChange, options, disabled }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                   text-historical-charcoal dark:text-gray-200
                   focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                   transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-gray-700">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function SettingsGeneralPage() {
  const { settings, isLoading, isSaving, error, refresh, save } = useSiteSettings()
  const [formData, setFormData] = useState<SiteSettingsUpdate>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name,
        site_name_ar: settings.site_name_ar,
        tagline: settings.tagline,
        tagline_ar: settings.tagline_ar,
        logo_url: settings.logo_url,
        logo_dark_url: settings.logo_dark_url,
        favicon_url: settings.favicon_url,
        currency_code: settings.currency_code,
        currency_symbol: settings.currency_symbol,
        currency_position: settings.currency_position,
        is_maintenance_mode: settings.is_maintenance_mode,
        maintenance_message: settings.maintenance_message,
        maintenance_message_ar: settings.maintenance_message_ar,
      })
    }
  }, [settings])

  const updateField = useCallback(<K extends keyof SiteSettingsUpdate>(key: K, value: SiteSettingsUpdate[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    const success = await save(formData)
    if (success) {
      setHasChanges(false)
    }
  }

  // Loading state
  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {Icons.loading}
          <p className="text-historical-charcoal/50 dark:text-gray-400">جاري تحميل الإعدادات...</p>
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">الإعدادات العامة</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">إعدادات الموقع الأساسية والهوية البصرية - متصل بالباك إند</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
          >
            <span className={isLoading ? 'animate-spin' : ''}>{Icons.refresh}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${hasChanges && !isSaving
                ? 'bg-gradient-to-l from-historical-gold to-historical-red text-white shadow-lg hover:shadow-xl'
                : 'bg-historical-charcoal/10 dark:bg-gray-700/50 text-historical-charcoal/40 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? Icons.loading : Icons.save}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
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

      {/* Site Identity */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">هوية الموقع</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Site Name (English)"
            value={formData.site_name || ''}
            onChange={(v) => updateField('site_name', v)}
            placeholder="Yalla Buy"
            dir="ltr"
            disabled={isSaving}
          />
          <InputField
            label="اسم الموقع (عربي)"
            value={formData.site_name_ar || ''}
            onChange={(v) => updateField('site_name_ar', v)}
            placeholder="يلا باي"
            disabled={isSaving}
          />
          <InputField
            label="Tagline (English)"
            value={formData.tagline || ''}
            onChange={(v) => updateField('tagline', v)}
            placeholder="Order it in seconds"
            dir="ltr"
            disabled={isSaving}
          />
          <InputField
            label="الشعار (عربي)"
            value={formData.tagline_ar || ''}
            onChange={(v) => updateField('tagline_ar', v)}
            placeholder="اطلبها بثواني"
            disabled={isSaving}
          />
        </div>
      </motion.div>

      {/* Logo & Favicon */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">الشعار والأيقونة</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ImageUpload
            label="الشعار (الوضع الفاتح)"
            imageUrl={formData.logo_url || ''}
            onUpload={(url) => updateField('logo_url', url)}
            disabled={isSaving}
          />
          <ImageUpload
            label="الشعار (الوضع الداكن)"
            imageUrl={formData.logo_dark_url || ''}
            onUpload={(url) => updateField('logo_dark_url', url)}
            disabled={isSaving}
          />
          <ImageUpload
            label="أيقونة الموقع (Favicon)"
            imageUrl={formData.favicon_url || ''}
            onUpload={(url) => updateField('favicon_url', url)}
            aspectRatio="aspect-square"
            disabled={isSaving}
          />
        </div>
      </motion.div>

      {/* Currency Settings */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">إعدادات العملة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="رمز العملة"
            value={formData.currency_code || ''}
            onChange={(v) => updateField('currency_code', v)}
            placeholder="SYP"
            helperText="مثال: USD, EUR, SYP"
            dir="ltr"
            disabled={isSaving}
          />
          <InputField
            label="رمز العملة المختصر"
            value={formData.currency_symbol || ''}
            onChange={(v) => updateField('currency_symbol', v)}
            placeholder="ل.س"
            helperText="مثال: $, €, ل.س"
            dir="ltr"
            disabled={isSaving}
          />
          <SelectField
            label="موقع رمز العملة"
            value={formData.currency_position || 'after'}
            onChange={(v) => updateField('currency_position', v as 'before' | 'after')}
            options={[
              { value: 'before', label: 'قبل المبلغ ($100)' },
              { value: 'after', label: 'بعد المبلغ (100$)' },
            ]}
            disabled={isSaving}
          />
        </div>
      </motion.div>

      {/* Maintenance Mode */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">وضع الصيانة</h2>
        
        <div className="space-y-6">
          <ToggleSwitch
            label="تفعيل وضع الصيانة"
            description="عند التفعيل، سيظهر للزوار رسالة تفيد بأن الموقع تحت الصيانة"
            checked={formData.is_maintenance_mode || false}
            onChange={(v) => updateField('is_maintenance_mode', v)}
            variant="danger"
            disabled={isSaving}
          />

          {formData.is_maintenance_mode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors duration-300"
            >
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4 transition-colors duration-300">
                {Icons.warning}
                <span className="font-medium">تحذير: وضع الصيانة مفعل</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Maintenance Message (English)"
                  value={formData.maintenance_message || ''}
                  onChange={(v) => updateField('maintenance_message', v)}
                  type="textarea"
                  dir="ltr"
                  disabled={isSaving}
                />
                <InputField
                  label="رسالة الصيانة (عربي)"
                  value={formData.maintenance_message_ar || ''}
                  onChange={(v) => updateField('maintenance_message_ar', v)}
                  type="textarea"
                  disabled={isSaving}
                />
              </div>
            </motion.div>
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
    </motion.div>
  )
}
