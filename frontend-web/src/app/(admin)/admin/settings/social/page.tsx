'use client'

/**
 * Admin Settings - Social Links Page
 * صفحة إعدادات روابط التواصل الاجتماعي
 * 
 * This page is connected to the backend API for real data
 * هذه الصفحة متصلة بالباك إند للبيانات الحقيقية
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  useSocialLinks, 
  type SocialLink, 
  type SocialLinkPayload,
  type SocialPlatform 
} from '@/lib/admin'

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
  drag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
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

// Platform Icons
const PlatformIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  whatsapp: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  telegram: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  snapchat: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.122.112.228.083.351l-.334 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/>
    </svg>
  ),
  pinterest: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.122.112.228.083.351l-.334 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/>
    </svg>
  ),
  other: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
}

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white',
  twitter: 'bg-black text-white',
  youtube: 'bg-red-600 text-white',
  tiktok: 'bg-black text-white',
  linkedin: 'bg-blue-700 text-white',
  whatsapp: 'bg-green-500 text-white',
  telegram: 'bg-blue-500 text-white',
  snapchat: 'bg-yellow-400 text-black',
  pinterest: 'bg-red-700 text-white',
  other: 'bg-gray-500 text-white',
}

const availablePlatforms: SocialPlatform[] = [
  'facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 
  'linkedin', 'whatsapp', 'telegram', 'snapchat', 'pinterest', 'other'
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

export default function SocialSettingsPage() {
  const { 
    links, 
    isLoading, 
    isProcessing, 
    error, 
    refresh, 
    create, 
    update, 
    remove 
  } = useSocialLinks()
  
  const [editingUrl, setEditingUrl] = useState<Record<number, string>>({})

  const handleToggle = useCallback(async (id: number, isActive: boolean) => {
    await update(id, { is_active: isActive })
  }, [update])

  const handleUpdateUrl = useCallback((id: number, url: string) => {
    setEditingUrl(prev => ({ ...prev, [id]: url }))
  }, [])

  const handleSaveUrl = useCallback(async (id: number) => {
    const url = editingUrl[id]
    if (url !== undefined) {
      await update(id, { url })
      setEditingUrl(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
  }, [editingUrl, update])

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
      await remove(id)
    }
  }, [remove])

  const handleAdd = useCallback(async (platform: SocialPlatform) => {
    const newLink: SocialLinkPayload = {
      platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      url: '',
      icon: platform,
      order: links.length,
      is_active: false,
      open_in_new_tab: true,
    }
    await create(newLink)
  }, [create, links.length])

  const usedPlatforms = links.map(l => l.platform)
  const unusedPlatforms = availablePlatforms.filter(p => !usedPlatforms.includes(p))

  // Loading state
  if (isLoading && links.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          {Icons.loading}
          <p className="text-historical-charcoal/50 dark:text-gray-400">جاري تحميل الروابط...</p>
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">روابط التواصل الاجتماعي</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">إدارة حسابات التواصل الاجتماعي - متصل بالباك إند</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 transition-colors duration-300 disabled:opacity-50"
        >
          <span className={isLoading ? 'animate-spin' : ''}>{Icons.refresh}</span>
          <span>تحديث</span>
        </button>
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

      {/* Social Links List */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300">
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {links.map((link) => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 group transition-colors duration-300"
              >
                {/* Drag Handle */}
                <button 
                  className="p-1 rounded cursor-grab text-historical-charcoal/30 dark:text-gray-500 hover:text-historical-charcoal/60 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isProcessing}
                >
                  {Icons.drag}
                </button>

                {/* Platform Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${platformColors[link.platform] || 'bg-gray-500 text-white'}`}>
                  {PlatformIcons[link.platform] || PlatformIcons.other}
                </div>

                {/* Platform Name & URL */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{link.platform_display || link.name}</p>
                  <input
                    type="url"
                    value={editingUrl[link.id] ?? link.url}
                    onChange={(e) => handleUpdateUrl(link.id, e.target.value)}
                    onBlur={() => handleSaveUrl(link.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl(link.id)}
                    disabled={isProcessing}
                    className="w-full text-sm text-historical-charcoal/50 dark:text-gray-400 bg-transparent focus:outline-none placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-500 transition-colors duration-300 disabled:opacity-50"
                    placeholder={`https://${link.platform}.com/...`}
                    dir="ltr"
                  />
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(link.id, !link.is_active)}
                  disabled={isProcessing}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                    link.is_active ? 'bg-green-500 dark:bg-green-600' : 'bg-historical-charcoal/20 dark:bg-gray-600'
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: link.is_active ? 22 : 4 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-200 shadow-lg transition-colors duration-300"
                  />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={isProcessing}
                  className="p-2 rounded-lg text-historical-charcoal/30 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30"
                >
                  {Icons.delete}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {links.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-historical-gold/10 dark:bg-gray-700/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-historical-gold/50 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">لا توجد روابط سوشيال ميديا</p>
              <p className="text-sm text-historical-charcoal/30 dark:text-gray-500 mt-2">أضف أول رابط من القائمة أدناه</p>
            </div>
          )}
        </div>

        {/* Add New */}
        {unusedPlatforms.length > 0 && (
          <div className="p-4 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/20 dark:bg-gray-700/30 transition-colors duration-300">
            <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-3 transition-colors duration-300">إضافة منصة جديدة:</p>
            <div className="flex flex-wrap gap-2">
              {unusedPlatforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => handleAdd(platform)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-historical-gold/10 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <span className={`w-6 h-6 rounded flex items-center justify-center ${platformColors[platform] || 'bg-gray-500 text-white'}`}>
                    {PlatformIcons[platform] || PlatformIcons.other}
                  </span>
                  <span className="text-sm font-medium text-historical-charcoal dark:text-gray-200 capitalize transition-colors duration-300">{platform}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
