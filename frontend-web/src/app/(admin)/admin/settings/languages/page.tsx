'use client'

/**
 * Admin Settings - Languages Page
 * صفحة إعدادات اللغات
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  isDefault: boolean
  isActive: boolean
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
  delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialLanguages: Language[] = [
  { id: '1', code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isDefault: true, isActive: true },
  { id: '2', code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: false, isActive: true },
  { id: '3', code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', isDefault: false, isActive: false },
]

const availableLanguages = [
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' as const },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' as const },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' as const },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr' as const },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' as const },
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
// Main Component
// =============================================================================

export default function LanguagesSettingsPage() {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleToggle = useCallback((id: string) => {
    setLanguages(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l))
    setHasChanges(true)
  }, [])

  const handleSetDefault = useCallback((id: string) => {
    setLanguages(prev => prev.map(l => ({ ...l, isDefault: l.id === id, isActive: l.id === id ? true : l.isActive })))
    setHasChanges(true)
  }, [])

  const handleDelete = useCallback((id: string) => {
    const lang = languages.find(l => l.id === id)
    if (lang?.isDefault) {
      alert('لا يمكن حذف اللغة الافتراضية')
      return
    }
    setLanguages(prev => prev.filter(l => l.id !== id))
    setHasChanges(true)
  }, [languages])

  const handleAdd = useCallback((code: string) => {
    const langData = availableLanguages.find(l => l.code === code)
    if (!langData) return
    const newLang: Language = {
      id: Date.now().toString(),
      ...langData,
      isDefault: false,
      isActive: false,
    }
    setLanguages(prev => [...prev, newLang])
    setHasChanges(true)
    setShowAddModal(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
  }

  const usedCodes = languages.map(l => l.code)
  const unusedLanguages = availableLanguages.filter(l => !usedCodes.includes(l.code))

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
          <h1 className="text-2xl font-bold text-historical-charcoal">إدارة اللغات</h1>
          <p className="text-historical-charcoal/50 mt-1">تحديد اللغات المدعومة واللغة الافتراضية</p>
        </div>
        <div className="flex items-center gap-3">
          {unusedLanguages.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-historical-gold/20 text-historical-gold font-medium hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.add}
              <span>إضافة لغة</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              hasChanges && !isSaving
                ? 'bg-gradient-to-l from-historical-gold to-historical-red text-white shadow-lg hover:shadow-xl'
                : 'bg-historical-charcoal/10 text-historical-charcoal/40 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              Icons.save
            )}
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>
        </div>
      </motion.div>

      {/* Languages List */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  lang.isDefault 
                    ? 'border-historical-gold/30 bg-historical-gold/5' 
                    : 'border-historical-gold/10 bg-historical-stone/30'
                } group`}
              >
                {/* Flag/Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-historical-gold/20 to-historical-gold/5 flex items-center justify-center text-historical-gold">
                  {Icons.globe}
                </div>

                {/* Language Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-historical-charcoal">{lang.nativeName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-historical-charcoal/10 text-historical-charcoal/50 uppercase">
                      {lang.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lang.direction === 'rtl' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lang.direction.toUpperCase()}
                    </span>
                    {lang.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        {Icons.star}
                        افتراضية
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-historical-charcoal/50">{lang.name}</p>
                </div>

                {/* Set Default */}
                {!lang.isDefault && lang.isActive && (
                  <button
                    onClick={() => handleSetDefault(lang.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-historical-gold border border-historical-gold/20 hover:bg-historical-gold/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    تعيين كافتراضية
                  </button>
                )}

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(lang.id)}
                  disabled={lang.isDefault}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    lang.isDefault ? 'cursor-not-allowed' : ''
                  } ${lang.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'}`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: lang.isActive ? 22 : 4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
                  />
                </button>

                {/* Delete */}
                {!lang.isDefault && (
                  <button
                    onClick={() => handleDelete(lang.id)}
                    className="p-2 rounded-lg text-historical-charcoal/30 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {Icons.delete}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Add Language Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-historical-gold/10">
                <h2 className="text-lg font-bold text-historical-charcoal">إضافة لغة جديدة</h2>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {unusedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleAdd(lang.code)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-historical-gold/10 hover:bg-historical-gold/5 transition-colors text-right"
                  >
                    <div className="w-10 h-10 rounded-lg bg-historical-gold/10 flex items-center justify-center text-historical-gold">
                      {Icons.globe}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-historical-charcoal">{lang.nativeName}</p>
                      <p className="text-sm text-historical-charcoal/50">{lang.name}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-historical-charcoal/10 text-historical-charcoal/50 uppercase">
                      {lang.code}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

