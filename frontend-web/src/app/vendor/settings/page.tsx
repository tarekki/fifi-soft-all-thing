'use client'

/**
 * Vendor Settings Page
 * صفحة إعدادات البائع
 * 
 * Allows vendor to:
 * - Change password
 * - Update profile information (future)
 * 
 * يسمح للبائع بـ:
 * - تغيير كلمة المرور
 * - تحديث معلومات الملف الشخصي (مستقبلاً)
 */

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { changeVendorPassword } from '@/lib/vendor/api'
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react'

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

export default function VendorSettingsPage() {
  const { t, language } = useLanguage()
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Handle password change
  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    // Validation
    if (!currentPassword) {
      setFieldErrors({ current_password: 'كلمة المرور الحالية مطلوبة / Current password is required' })
      return
    }

    if (!newPassword) {
      setFieldErrors({ new_password: 'كلمة المرور الجديدة مطلوبة / New password is required' })
      return
    }

    if (newPassword.length < 8) {
      setFieldErrors({ new_password: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل / Password must be at least 8 characters' })
      return
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirm_password: 'كلمات المرور غير متطابقة / Passwords do not match' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await changeVendorPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      if (response.success) {
        setSuccess(response.message || 'تم تغيير كلمة المرور بنجاح / Password changed successfully')
        // Reset form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(response.message || 'فشل تغيير كلمة المرور / Failed to change password')
        if (response.errors) {
          const errors: Record<string, string> = {}
          Object.entries(response.errors).forEach(([key, value]) => {
            errors[key] = Array.isArray(value) ? value[0] : String(value)
          })
          setFieldErrors(errors)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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
            {t.vendor.settings || 'الإعدادات'}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            إدارة إعدادات حسابك / Manage your account settings
          </p>
        </div>
      </motion.div>

      {/* Success Message */}
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
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
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

      {/* Password Change Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-gradient-to-l from-historical-gold/5 dark:from-gray-700/30 to-transparent transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400 transition-colors duration-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
                تغيير كلمة المرور / Change Password
              </h2>
              <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                قم بتحديث كلمة المرور لحسابك / Update your account password
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
              كلمة المرور الحالية / Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setFieldErrors({ ...fieldErrors, current_password: '' })
                }}
                required
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                  fieldErrors.current_password
                    ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                    : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-600 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.current_password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                {fieldErrors.current_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
              كلمة المرور الجديدة / New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setFieldErrors({ ...fieldErrors, new_password: '' })
                }}
                required
                minLength={8}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                  fieldErrors.new_password
                    ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                    : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.new_password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                {fieldErrors.new_password}
              </p>
            )}
            <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
              يجب أن تكون كلمة المرور 8 أحرف على الأقل / Password must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
              تأكيد كلمة المرور / Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setFieldErrors({ ...fieldErrors, confirm_password: '' })
                }}
                required
                minLength={8}
                className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                  fieldErrors.confirm_password
                    ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                    : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 transition-colors duration-300">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4 border-t border-historical-gold/10 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري التغيير... / Changing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>تغيير كلمة المرور / Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

