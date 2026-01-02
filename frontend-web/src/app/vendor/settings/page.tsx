'use client'

/**
 * Vendor Settings Page
 * صفحة إعدادات البائع
 * 
 * Comprehensive settings page with tabs:
 * - Profile: User info, avatar, language
 * - Vendor Info: Description, logo, brand color
 * - Security: Password change, active sessions
 * - Notifications: Notification preferences
 * - Store Settings: Auto-confirm, stock alerts, etc.
 * 
 * صفحة إعدادات شاملة مع تبويبات:
 * - الملف الشخصي: معلومات المستخدم، الصورة، اللغة
 * - معلومات البائع: الوصف، الشعار، اللون
 * - الأمان: تغيير كلمة المرور، الجلسات النشطة
 * - الإشعارات: تفضيلات الإشعارات
 * - إعدادات المتجر: التأكيد التلقائي، تنبيهات المخزون، إلخ
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import {
  User,
  Store,
  Lock,
  Bell,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Trash2,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react'
import {
  getVendorProfile,
  updateVendorProfile,
  uploadVendorProfileAvatar,
  getVendorInfo,
  updateVendorInfo,
  uploadVendorLogo,
  getVendorNotificationPreferences,
  updateVendorNotificationPreferences,
  getVendorStoreSettings,
  updateVendorStoreSettings,
  getVendorActiveSessions,
  revokeVendorSession,
  changeVendorPassword,
} from '@/lib/vendor/api'
import type {
  VendorProfile,
  VendorProfileUpdate,
  VendorInfo,
  VendorInfoUpdate,
  VendorNotificationPreferences,
  VendorNotificationPreferencesUpdate,
  VendorStoreSettings,
  VendorStoreSettingsUpdate,
  VendorActiveSession,
} from '@/lib/vendor/types'

// =============================================================================
// Animation Variants
// متغيرات الحركة
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
// المكون الرئيسي
// =============================================================================

export default function VendorSettingsPage() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = React.useState<'profile' | 'vendor' | 'security' | 'notifications' | 'store'>('profile')
  
  // Data state
  const [profile, setProfile] = React.useState<VendorProfile | null>(null)
  const [vendorInfo, setVendorInfo] = React.useState<VendorInfo | null>(null)
  const [notifications, setNotifications] = React.useState<VendorNotificationPreferences | null>(null)
  const [storeSettings, setStoreSettings] = React.useState<VendorStoreSettings | null>(null)
  const [sessions, setSessions] = React.useState<VendorActiveSession[]>([])
  
  // Loading state
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  // Fetch all data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [profileRes, vendorRes, notificationsRes, storeRes, sessionsRes] = await Promise.all([
        getVendorProfile(),
        getVendorInfo(),
        getVendorNotificationPreferences(),
        getVendorStoreSettings(),
        getVendorActiveSessions(),
      ])

      // Log all responses for debugging
      console.log('[Settings] API Responses:', {
        profile: profileRes,
        vendor: vendorRes,
        notifications: notificationsRes,
        store: storeRes,
        sessions: sessionsRes,
      })
      
      if (profileRes?.success && profileRes?.data) {
        setProfile(profileRes.data)
      } else if (profileRes && !profileRes.success) {
        console.error('[Settings] Failed to fetch profile:', profileRes.message, profileRes.errors)
        // Don't set error here - let user see the loading state
      }
      
      if (vendorRes?.success && vendorRes?.data) {
        setVendorInfo(vendorRes.data)
      } else if (vendorRes && !vendorRes.success) {
        console.error('[Settings] Failed to fetch vendor info:', vendorRes.message, vendorRes.errors)
      }
      
      if (notificationsRes?.success && notificationsRes?.data) {
        setNotifications(notificationsRes.data)
      } else if (notificationsRes && !notificationsRes.success) {
        console.error('[Settings] Failed to fetch notifications:', notificationsRes.message, notificationsRes.errors)
      }
      
      if (storeRes?.success && storeRes?.data) {
        setStoreSettings(storeRes.data)
      } else if (storeRes && !storeRes.success) {
        console.error('[Settings] Failed to fetch store settings:', storeRes.message, storeRes.errors)
      }
      
      if (sessionsRes?.success && sessionsRes?.data) {
        setSessions(sessionsRes.data)
      } else if (sessionsRes && !sessionsRes.success) {
        console.error('[Settings] Failed to fetch sessions:', sessionsRes.message, sessionsRes.errors)
      }
      
      // Show error if all requests failed
      if (
        (!profileRes || !profileRes.success) &&
        (!vendorRes || !vendorRes.success) &&
        (!notificationsRes || !notificationsRes.success) &&
        (!storeRes || !storeRes.success)
      ) {
        setError('فشل في جلب البيانات. يرجى المحاولة مرة أخرى / Failed to fetch data. Please try again.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings'
      setError(errorMessage)
      console.error('Error fetching settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Clear messages after 5 seconds
  React.useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const tabs = [
    { id: 'profile', label: t.vendor.profile || 'الملف الشخصي', icon: User },
    { id: 'vendor', label: t.vendor.vendorInfo || 'معلومات البائع', icon: Store },
    { id: 'security', label: t.vendor.security || 'الأمان', icon: Lock },
    { id: 'notifications', label: t.vendor.notifications || 'الإشعارات', icon: Bell },
    { id: 'store', label: t.vendor.storeSettings || 'إعدادات المتجر', icon: SettingsIcon },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-historical-charcoal dark:text-white transition-colors duration-300">
            {t.vendor.settings || 'الإعدادات'}
          </h1>
          <p className="text-historical-charcoal/70 dark:text-gray-300 mt-2 transition-colors duration-300">
            {t.vendor.settingsDescription || 'إدارة إعدادات حسابك ومتجرك'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 rounded-xl hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors duration-300 disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          {t.vendor.refresh || 'تحديث'}
        </button>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
          >
            <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 border-b border-historical-gold/10 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors duration-300 whitespace-nowrap',
              activeTab === tab.id
                ? 'border-historical-gold dark:border-yellow-400 text-historical-gold dark:text-yellow-400'
                : 'border-transparent text-historical-charcoal/70 dark:text-gray-300 hover:text-historical-gold dark:hover:text-yellow-400'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-historical-gold" />
        </div>
      ) : (
        <>
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              onUpdate={async (data) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await updateVendorProfile(data)
                  if (res?.success && res?.data) {
                    setProfile(res.data)
                    setSuccess(t.vendor.profileUpdated || 'تم تحديث الملف الشخصي بنجاح')
                  } else {
                    setError(res?.message || 'Failed to update profile')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update profile')
                } finally {
                  setIsSaving(false)
                }
              }}
              onAvatarUpload={async (file) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await uploadVendorProfileAvatar(file)
                  if (res?.success && res?.data) {
                    await fetchData()
                    setSuccess(t.vendor.avatarUploaded || 'تم رفع الصورة بنجاح')
                  } else {
                    setError(res?.message || 'Failed to upload avatar')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to upload avatar')
                } finally {
                  setIsSaving(false)
                }
              }}
              isLoading={isSaving}
              language={language}
              t={t}
            />
          )}
          {activeTab === 'vendor' && (
            <VendorTab
              vendorInfo={vendorInfo}
              onUpdate={async (data) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await updateVendorInfo(data)
                  if (res?.success && res?.data) {
                    setVendorInfo(res.data)
                    setSuccess(t.vendor.vendorInfoUpdated || 'تم تحديث معلومات البائع بنجاح')
                  } else {
                    setError(res?.message || 'Failed to update vendor info')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update vendor info')
                } finally {
                  setIsSaving(false)
                }
              }}
              onLogoUpload={async (file) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await uploadVendorLogo(file)
                  if (res?.success && res?.data) {
                    await fetchData()
                    setSuccess(t.vendor.logoUploaded || 'تم رفع الشعار بنجاح')
                  } else {
                    setError(res?.message || 'Failed to upload logo')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to upload logo')
                } finally {
                  setIsSaving(false)
                }
              }}
              isLoading={isSaving}
              language={language}
              t={t}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab
              sessions={sessions}
              onRevokeSession={async (sessionKey) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await revokeVendorSession(sessionKey)
                  if (res?.success) {
                    await fetchData()
                    setSuccess(t.vendor.sessionRevoked || 'تم إلغاء الجلسة بنجاح')
                  } else {
                    setError(res?.message || 'Failed to revoke session')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to revoke session')
                } finally {
                  setIsSaving(false)
                }
              }}
              language={language}
              t={t}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={notifications}
              onUpdate={async (data) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await updateVendorNotificationPreferences(data)
                  if (res?.success && res?.data) {
                    setNotifications(res.data)
                    setSuccess(t.vendor.notificationsUpdated || 'تم تحديث تفضيلات الإشعارات بنجاح')
                  } else {
                    setError(res?.message || 'Failed to update notifications')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update notifications')
                } finally {
                  setIsSaving(false)
                }
              }}
              isLoading={isSaving}
              t={t}
            />
          )}
          {activeTab === 'store' && (
            <StoreTab
              storeSettings={storeSettings}
              onUpdate={async (data) => {
                setIsSaving(true)
                setError(null)
                try {
                  const res = await updateVendorStoreSettings(data)
                  if (res?.success && res?.data) {
                    setStoreSettings(res.data)
                    setSuccess(t.vendor.storeSettingsUpdated || 'تم تحديث إعدادات المتجر بنجاح')
                  } else {
                    setError(res?.message || 'Failed to update store settings')
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update store settings')
                } finally {
                  setIsSaving(false)
                }
              }}
              isLoading={isSaving}
              t={t}
            />
          )}
        </>
      )}
    </motion.div>
  )
}

// =============================================================================
// Tab Components
// مكونات التبويبات
// =============================================================================

function ProfileTab({
  profile,
  onUpdate,
  onAvatarUpload,
  isLoading,
  language,
  t,
}: {
  profile: VendorProfile | null
  onUpdate: (data: VendorProfileUpdate) => Promise<void>
  onAvatarUpload: (file: File) => Promise<void>
  isLoading: boolean
  language: string
  t: any
}) {
  const [formData, setFormData] = React.useState<VendorProfileUpdate>({})
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone || '',
        preferred_language: profile.preferred_language as 'ar' | 'en',
      })
      setAvatarPreview(profile.avatar_url)
    }
  }, [profile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (avatarFile) {
      await onAvatarUpload(avatarFile)
      setAvatarFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    await onUpdate(formData)
  }

  // Show loading or empty state if profile not loaded yet
  if (!profile) {
    return (
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-historical-gold mx-auto mb-4" />
            <p className="text-historical-charcoal/70 dark:text-gray-300">
              {t.vendor.loadingProfile || 'جاري تحميل الملف الشخصي...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-historical-gold/10 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-historical-gold/50" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-historical-gold text-white rounded-full hover:bg-historical-red transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-historical-charcoal dark:text-white">{profile.full_name}</h3>
            <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">{profile.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.email || 'البريد الإلكتروني'} *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.phone || 'رقم الهاتف'}
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.firstName || 'الاسم الأول'}
            </label>
            <input
              type="text"
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.lastName || 'الاسم الأخير'}
            </label>
            <input
              type="text"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.preferredLanguage || 'اللغة المفضلة'}
            </label>
            <select
              value={formData.preferred_language || 'ar'}
              onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'ar' | 'en' })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-historical-gold/10 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-historical-gold to-historical-red text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t.vendor.save || 'حفظ'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

function VendorTab({
  vendorInfo,
  onUpdate,
  onLogoUpload,
  isLoading,
  language,
  t,
}: {
  vendorInfo: VendorInfo | null
  onUpdate: (data: VendorInfoUpdate) => Promise<void>
  onLogoUpload: (file: File) => Promise<void>
  isLoading: boolean
  language: string
  t: any
}) {
  const [formData, setFormData] = React.useState<VendorInfoUpdate>({})
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (vendorInfo) {
      setFormData({
        description: vendorInfo.description,
        primary_color: vendorInfo.primary_color,
      })
      setLogoPreview(vendorInfo.logo_url)
    }
  }, [vendorInfo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. الحد الأقصى 5MB')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (logoFile) {
      await onLogoUpload(logoFile)
      setLogoFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    await onUpdate(formData)
  }

  // Show loading or empty state if vendor info not loaded yet
  if (!vendorInfo) {
    return (
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-historical-gold mx-auto mb-4" />
            <p className="text-historical-charcoal/70 dark:text-gray-300">
              {t.vendor.loadingVendorInfo || 'جاري تحميل معلومات البائع...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl bg-historical-gold/10 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-historical-gold/20">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Store className="w-16 h-16 text-historical-gold/50" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-historical-gold text-white rounded-full hover:bg-historical-red transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-semibold text-historical-charcoal dark:text-white">{vendorInfo.name}</h3>
            <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">{vendorInfo.slug}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.description || 'الوصف'}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.primaryColor || 'اللون الأساسي'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color || '#000000'}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-16 h-16 rounded-lg border border-historical-gold/20 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color || '#000000'}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#E91E63"
                className="flex-1 px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-historical-gold/10 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-historical-gold to-historical-red text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t.vendor.save || 'حفظ'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

function SecurityTab({
  sessions,
  onRevokeSession,
  language,
  t,
}: {
  sessions: VendorActiveSession[]
  onRevokeSession: (sessionKey: string) => Promise<void>
  language: string
  t: any
}) {
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 8) {
      setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة')
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await changeVendorPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      if (res?.success) {
        setPasswordSuccess('تم تغيير كلمة المرور بنجاح')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(res?.message || 'فشل تغيير كلمة المرور')
      }
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.changePassword || 'تغيير كلمة المرور'}
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-300 text-sm">
              {passwordSuccess}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.currentPassword || 'كلمة المرور الحالية'} *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-12 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-historical-charcoal/50 dark:text-gray-400"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.newPassword || 'كلمة المرور الجديدة'} *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 pr-12 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-historical-charcoal/50 dark:text-gray-400"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.confirmPassword || 'تأكيد كلمة المرور'} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 pr-12 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-historical-charcoal/50 dark:text-gray-400"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-historical-gold to-historical-red text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {t.vendor.changePassword || 'تغيير كلمة المرور'}
          </button>
        </form>
      </motion.div>

      {/* Active Sessions */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-historical-charcoal dark:text-white mb-4">
          {t.vendor.activeSessions || 'الجلسات النشطة'}
        </h3>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.session_key}
              className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-historical-charcoal dark:text-white">
                    {session.is_current ? '(الجلسة الحالية)' : session.ip_address || 'Unknown IP'}
                  </p>
                  {session.is_current && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-historical-charcoal/70 dark:text-gray-300 mt-1">
                  {session.user_agent || 'Unknown device'}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1">
                  {new Date(session.last_activity).toLocaleString(language === 'ar' ? 'ar-SY' : 'en-US')}
                </p>
              </div>
              {!session.is_current && (
                <button
                  onClick={() => onRevokeSession(session.session_key)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function NotificationsTab({
  notifications,
  onUpdate,
  isLoading,
  t,
}: {
  notifications: VendorNotificationPreferences | null
  onUpdate: (data: VendorNotificationPreferencesUpdate) => Promise<void>
  isLoading: boolean
  t: any
}) {
  const [formData, setFormData] = React.useState<VendorNotificationPreferencesUpdate>({})

  React.useEffect(() => {
    if (notifications) {
      setFormData({
        notify_new_orders: notifications.notify_new_orders,
        notify_order_status_changes: notifications.notify_order_status_changes,
        notify_order_cancellations: notifications.notify_order_cancellations,
        notify_low_stock: notifications.notify_low_stock,
        notify_out_of_stock: notifications.notify_out_of_stock,
        notify_new_customers: notifications.notify_new_customers,
        email_notifications_enabled: notifications.email_notifications_enabled,
      })
    }
  }, [notifications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onUpdate(formData)
  }

  // Show loading or empty state if notifications not loaded yet
  if (!notifications) {
    return (
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-historical-gold mx-auto mb-4" />
            <p className="text-historical-charcoal/70 dark:text-gray-300">
              {t.vendor.loadingNotifications || 'جاري تحميل تفضيلات الإشعارات...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  const toggleSwitch = (key: keyof VendorNotificationPreferencesUpdate) => {
    setFormData({ ...formData, [key]: !formData[key] })
  }

  return (
    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
            <div>
              <p className="font-medium text-historical-charcoal dark:text-white">
                {t.vendor.notifyNewOrders || 'إشعارات الطلبات الجديدة'}
              </p>
              <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                {t.vendor.notifyNewOrdersDesc || 'تلقي إشعارات عند استلام طلبات جديدة'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSwitch('notify_new_orders')}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.notify_new_orders ? 'bg-historical-gold' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.notify_new_orders && 'translate-x-6'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
            <div>
              <p className="font-medium text-historical-charcoal dark:text-white">
                {t.vendor.notifyOrderStatusChanges || 'إشعارات تغيير حالة الطلب'}
              </p>
              <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                {t.vendor.notifyOrderStatusChangesDesc || 'تلقي إشعارات عند تغيير حالة الطلب'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSwitch('notify_order_status_changes')}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.notify_order_status_changes ? 'bg-historical-gold' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.notify_order_status_changes && 'translate-x-6'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
            <div>
              <p className="font-medium text-historical-charcoal dark:text-white">
                {t.vendor.notifyLowStock || 'إشعارات المخزون المنخفض'}
              </p>
              <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                {t.vendor.notifyLowStockDesc || 'تلقي إشعارات عند انخفاض المخزون'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSwitch('notify_low_stock')}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.notify_low_stock ? 'bg-historical-gold' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.notify_low_stock && 'translate-x-6'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
            <div>
              <p className="font-medium text-historical-charcoal dark:text-white">
                {t.vendor.emailNotifications || 'إشعارات البريد الإلكتروني'}
              </p>
              <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                {t.vendor.emailNotificationsDesc || 'تفعيل إشعارات البريد الإلكتروني'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSwitch('email_notifications_enabled')}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.email_notifications_enabled ? 'bg-historical-gold' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.email_notifications_enabled && 'translate-x-6'
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-historical-gold/10 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-historical-gold to-historical-red text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t.vendor.save || 'حفظ'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

function StoreTab({
  storeSettings,
  onUpdate,
  isLoading,
  t,
}: {
  storeSettings: VendorStoreSettings | null
  onUpdate: (data: VendorStoreSettingsUpdate) => Promise<void>
  isLoading: boolean
  t: any
}) {
  const [formData, setFormData] = React.useState<VendorStoreSettingsUpdate>({})

  React.useEffect(() => {
    if (storeSettings) {
      setFormData({
        auto_confirm_orders: storeSettings.auto_confirm_orders,
        default_order_status: storeSettings.default_order_status,
        stock_alert_threshold: storeSettings.stock_alert_threshold,
        auto_archive_orders_after_days: storeSettings.auto_archive_orders_after_days,
      })
    }
  }, [storeSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onUpdate(formData)
  }

  // Show loading or empty state if store settings not loaded yet
  if (!storeSettings) {
    return (
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-historical-gold mx-auto mb-4" />
            <p className="text-historical-charcoal/70 dark:text-gray-300">
              {t.vendor.loadingStoreSettings || 'جاري تحميل إعدادات المتجر...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-historical-gold/5 dark:bg-gray-700/30 rounded-lg">
            <div>
              <p className="font-medium text-historical-charcoal dark:text-white">
                {t.vendor.autoConfirmOrders || 'تأكيد الطلبات تلقائياً'}
              </p>
              <p className="text-sm text-historical-charcoal/70 dark:text-gray-300">
                {t.vendor.autoConfirmOrdersDesc || 'تأكيد الطلبات الجديدة تلقائياً'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, auto_confirm_orders: !formData.auto_confirm_orders })}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.auto_confirm_orders ? 'bg-historical-gold' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
                  formData.auto_confirm_orders && 'translate-x-6'
                )}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.defaultOrderStatus || 'حالة الطلب الافتراضية'}
            </label>
            <select
              value={formData.default_order_status || 'pending'}
              onChange={(e) => setFormData({ ...formData, default_order_status: e.target.value as any })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            >
              <option value="pending">{t.vendor.pending || 'معلق'}</option>
              <option value="confirmed">{t.vendor.confirmed || 'مؤكد'}</option>
              <option value="processing">{t.vendor.processing || 'قيد المعالجة'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.stockAlertThreshold || 'حد تنبيه المخزون'}
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_alert_threshold || 10}
              onChange={(e) => setFormData({ ...formData, stock_alert_threshold: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2">
              {t.vendor.autoArchiveOrdersAfterDays || 'أرشفة الطلبات تلقائياً بعد (أيام)'}
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={formData.auto_archive_orders_after_days || ''}
              onChange={(e) => setFormData({ ...formData, auto_archive_orders_after_days: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="اتركه فارغاً لتعطيل الأرشفة التلقائية"
              className="w-full px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-white focus:ring-2 focus:ring-historical-gold/30"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-historical-gold/10 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-historical-gold to-historical-red text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t.vendor.save || 'حفظ'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
