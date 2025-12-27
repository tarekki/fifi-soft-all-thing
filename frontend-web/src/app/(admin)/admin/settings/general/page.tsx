'use client'

/**
 * Admin Settings - General Page
 * صفحة الإعدادات العامة للموقع
 * 
 * Site configuration including:
 * - Site name & tagline
 * - Logo & favicon
 * - Currency settings
 * - Maintenance mode
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface SiteSettings {
  siteName: string
  siteNameAr: string
  tagline: string
  taglineAr: string
  logoUrl: string
  logoDarkUrl: string
  faviconUrl: string
  currencyCode: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  isMaintenanceMode: boolean
  maintenanceMessage: string
  maintenanceMessageAr: string
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
}

// =============================================================================
// Mock Data (TODO: Fetch from API)
// =============================================================================

const initialSettings: SiteSettings = {
  siteName: 'Yalla Buy',
  siteNameAr: 'يلا باي',
  tagline: 'Order it in seconds',
  taglineAr: 'اطلبها بثواني',
  logoUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  currencyCode: 'USD',
  currencySymbol: '$',
  currencyPosition: 'before',
  isMaintenanceMode: false,
  maintenanceMessage: 'We are currently under maintenance. Please check back soon.',
  maintenanceMessageAr: 'الموقع تحت الصيانة حالياً. يرجى العودة لاحقاً.',
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
}

function InputField({ label, labelAr, value, onChange, placeholder, helperText, type = 'text', dir = 'rtl' }: InputFieldProps) {
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
          className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                     text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                     transition-all duration-200 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                     text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                     transition-all duration-200"
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
}

function ImageUpload({ label, imageUrl, onUpload, aspectRatio = 'aspect-video' }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</label>
      <div className={`
        relative ${aspectRatio} w-full max-w-xs rounded-xl border-2 border-dashed border-historical-gold/30 dark:border-gray-600
        bg-historical-stone/30 dark:bg-gray-700/30 overflow-hidden group cursor-pointer
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
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">تغيير الصورة</span>
        </div>
      </div>
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  variant?: 'default' | 'danger'
}

function ToggleSwitch({ label, description, checked, onChange, variant = 'default' }: ToggleSwitchProps) {
  const colors = variant === 'danger' 
    ? 'bg-red-500 dark:bg-red-600' 
    : 'bg-historical-gold dark:bg-yellow-600'

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-historical-gold/10 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 transition-colors duration-300">
      <div>
        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</p>
        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-14 h-8 rounded-full transition-colors duration-200
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
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50
                   text-historical-charcoal dark:text-gray-200
                   focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 focus:border-historical-gold dark:focus:border-yellow-600
                   transition-all duration-200 appearance-none cursor-pointer"
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
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = useCallback(<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Call API to save settings
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">الإعدادات العامة</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">إعدادات الموقع الأساسية والهوية البصرية</p>
        </div>
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
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            Icons.save
          )}
          <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </motion.div>

      {/* Site Identity */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">هوية الموقع</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Site Name (English)"
            value={settings.siteName}
            onChange={(v) => updateSetting('siteName', v)}
            placeholder="Yalla Buy"
            dir="ltr"
          />
          <InputField
            label="اسم الموقع (عربي)"
            value={settings.siteNameAr}
            onChange={(v) => updateSetting('siteNameAr', v)}
            placeholder="يلا باي"
          />
          <InputField
            label="Tagline (English)"
            value={settings.tagline}
            onChange={(v) => updateSetting('tagline', v)}
            placeholder="Order it in seconds"
            dir="ltr"
          />
          <InputField
            label="الشعار (عربي)"
            value={settings.taglineAr}
            onChange={(v) => updateSetting('taglineAr', v)}
            placeholder="اطلبها بثواني"
          />
        </div>
      </motion.div>

      {/* Logo & Favicon */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">الشعار والأيقونة</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ImageUpload
            label="الشعار (الوضع الفاتح)"
            imageUrl={settings.logoUrl}
            onUpload={(url) => updateSetting('logoUrl', url)}
          />
          <ImageUpload
            label="الشعار (الوضع الداكن)"
            imageUrl={settings.logoDarkUrl}
            onUpload={(url) => updateSetting('logoDarkUrl', url)}
          />
          <ImageUpload
            label="أيقونة الموقع (Favicon)"
            imageUrl={settings.faviconUrl}
            onUpload={(url) => updateSetting('faviconUrl', url)}
            aspectRatio="aspect-square"
          />
        </div>
      </motion.div>

      {/* Currency Settings */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-historical-gold/10 dark:border-gray-700 shadow-soft transition-colors duration-300">
        <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 mb-6 transition-colors duration-300">إعدادات العملة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="رمز العملة"
            value={settings.currencyCode}
            onChange={(v) => updateSetting('currencyCode', v)}
            placeholder="USD"
            helperText="مثال: USD, EUR, SYP"
            dir="ltr"
          />
          <InputField
            label="رمز العملة المختصر"
            value={settings.currencySymbol}
            onChange={(v) => updateSetting('currencySymbol', v)}
            placeholder="$"
            helperText="مثال: $, €, ل.س"
            dir="ltr"
          />
          <SelectField
            label="موقع رمز العملة"
            value={settings.currencyPosition}
            onChange={(v) => updateSetting('currencyPosition', v as 'before' | 'after')}
            options={[
              { value: 'before', label: 'قبل المبلغ ($100)' },
              { value: 'after', label: 'بعد المبلغ (100$)' },
            ]}
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
            checked={settings.isMaintenanceMode}
            onChange={(v) => updateSetting('isMaintenanceMode', v)}
            variant="danger"
          />

          {settings.isMaintenanceMode && (
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
                  value={settings.maintenanceMessage}
                  onChange={(v) => updateSetting('maintenanceMessage', v)}
                  type="textarea"
                  dir="ltr"
                />
                <InputField
                  label="رسالة الصيانة (عربي)"
                  value={settings.maintenanceMessageAr}
                  onChange={(v) => updateSetting('maintenanceMessageAr', v)}
                  type="textarea"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

