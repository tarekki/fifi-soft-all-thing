'use client'

/**
 * Vendor Login Page
 * صفحة تسجيل دخول البائع
 * 
 * Modern, professional login page for vendors with:
 * - Email/Password authentication
 * - Form validation
 * - Error handling
 * - Dark mode support
 * - Beautiful glassmorphism design
 * - Smooth animations
 * 
 * صفحة تسجيل دخول حديثة واحترافية للبائعين مع:
 * - مصادقة البريد الإلكتروني/كلمة المرور
 * - التحقق من النموذج
 * - معالجة الأخطاء
 * - دعم الوضع الداكن
 * - تصميم زجاجي جميل
 * - حركات سلسة
 */

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { vendorLogin } from '@/lib/vendor/api'
import { useUIStore } from '@/store/uiStore'

// =============================================================================
// Icons
// الأيقونات
// =============================================================================

const Icons = {
  email: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  eyeOff: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  store: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65c0-.621.504-1.125 1.125-1.125h18.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.25v-1.5z" />
    </svg>
  ),
}

// =============================================================================
// Animation Variants
// متغيرات الحركة
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Theme Toggle Component
// مكون تبديل المظهر
// =============================================================================

function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark' || (
    theme === 'system' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  const toggleTheme = () => {
    const newTheme = (theme === 'light' || theme === 'system') ? 'dark' : 'light'
    setTheme(newTheme)

    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-historical-gold/20 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
    >
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-historical-charcoal dark:text-gray-200"
      >
        {isDark ? Icons.sun : Icons.moon}
      </motion.div>
    </button>
  )
}

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function VendorLoginPage() {
  // State
  // الحالة
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Hooks
  const router = useRouter()
  const { theme } = useUIStore()
  
  // Initialize theme on mount
  // تهيئة المظهر عند التحميل
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const savedTheme = localStorage.getItem('ui-store-theme') || 'light'
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])
  
  // =================================================================
  // Form Submit Handler
  // معالج إرسال النموذج
  // =================================================================
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    // Validation
    // التحقق
    if (!email.trim()) {
      setFormError('البريد الإلكتروني مطلوب / Email is required')
      return
    }
    
    if (!password) {
      setFormError('كلمة المرور مطلوبة / Password is required')
      return
    }
    
    // Email format validation
    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError('صيغة البريد الإلكتروني غير صحيحة / Invalid email format')
      return
    }
    
    // Attempt login
    // محاولة تسجيل الدخول
    setIsSubmitting(true)
    try {
      const response = await vendorLogin({ 
        email: email.trim(), 
        password 
      })
      
      if (response.success && response.data) {
        // Login successful - redirect to dashboard
        // تسجيل الدخول ناجح - إعادة التوجيه إلى لوحة التحكم
        router.push('/vendor/dashboard')
      } else {
        // Login failed - show error
        // فشل تسجيل الدخول - عرض الخطأ
        setFormError(response.message || 'فشل تسجيل الدخول / Login failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Show loading while mounting
  // عرض التحميل أثناء التحميل
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-historical-stone via-white to-historical-gold/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-historical-gold/30 border-t-historical-gold dark:border-yellow-500/30 dark:border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-historical-charcoal/50 dark:text-gray-400 text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }
  
  // =================================================================
  // Render
  // العرض
  // =================================================================
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-historical-stone via-white to-historical-gold/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500 relative overflow-hidden p-4">
      {/* Animated Background Elements */}
      {/* عناصر الخلفية المتحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-historical-gold/20 dark:bg-yellow-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-historical-red/20 dark:bg-red-500/10 rounded-full blur-3xl"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md z-10"
      >
        {/* Login Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-historical-gold/20 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-historical-gold via-historical-red to-historical-gold dark:from-yellow-600 dark:via-red-600 dark:to-yellow-600 p-8 text-center overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }} />
            </div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative z-10 w-20 h-20 mx-auto mb-4 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center border border-white/30"
            >
              <span className="text-white">{Icons.store}</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                لوحة تحكم البائع
              </h1>
              <p className="text-white/90 dark:text-white/80 text-sm font-medium">
                Yalla Buy Vendor Dashboard
              </p>
            </motion.div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6 dark:bg-gray-800/30">
            {/* Error Message */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-sm"
                >
                  <span className="text-red-500 dark:text-red-400 flex-shrink-0">{Icons.alert}</span>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">{formError}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-historical-charcoal dark:text-gray-200 mb-2 transition-colors"
              >
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/40 dark:text-gray-400 group-focus-within:text-historical-gold dark:group-focus-within:text-yellow-500 transition-colors">
                  {Icons.email}
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-historical-gold/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-500/30 focus:border-historical-gold dark:focus:border-yellow-500 transition-all text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-500"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-historical-charcoal dark:text-gray-200 mb-2 transition-colors"
              >
                كلمة المرور
              </label>
              <div className="relative group">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/40 dark:text-gray-400 group-focus-within:text-historical-gold dark:group-focus-within:text-yellow-500 transition-colors">
                  {Icons.lock}
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-12 py-3.5 rounded-xl border border-historical-gold/20 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-500/30 focus:border-historical-gold dark:focus:border-yellow-500 transition-all text-historical-charcoal dark:text-gray-200 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-500"
                  dir="ltr"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-historical-charcoal/40 dark:text-gray-400 hover:text-historical-gold dark:hover:text-yellow-500 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-historical-gold via-historical-red to-historical-gold dark:from-yellow-600 dark:via-red-600 dark:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-historical-red via-historical-gold to-historical-red dark:from-red-600 dark:via-yellow-600 dark:to-red-600"
                initial={{ x: '-100%' }}
                animate={{ x: isSubmitting ? '100%' : '-100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              
              <span className="relative z-10 flex items-center gap-3">
                {isSubmitting ? (
                  <>
                    {Icons.loader}
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </span>
            </motion.button>
            
            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 pt-4 border-t border-historical-gold/10 dark:border-gray-700/50"
            >
              <p className="text-center text-xs text-historical-charcoal/50 dark:text-gray-400">
                هذه الصفحة للبائعين فقط
                <br />
                <span dir="ltr" className="font-medium">© 2024 Yalla Buy - All rights reserved</span>
              </p>
              
              {/* Apply Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/vendor/apply')}
                  className="text-sm font-medium text-historical-gold dark:text-yellow-400 hover:text-historical-red dark:hover:text-yellow-300 transition-colors underline underline-offset-2"
                >
                  ليس لديك حساب؟ قدم طلب انضمام / Don't have an account? Apply to become a vendor
                </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
        
        {/* Security Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-historical-gold/20 dark:border-gray-700/50 text-sm text-historical-charcoal/60 dark:text-gray-300 shadow-lg">
            <span className="text-green-500 dark:text-green-400">{Icons.shield}</span>
            <span className="font-medium">اتصال آمن ومشفر</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

