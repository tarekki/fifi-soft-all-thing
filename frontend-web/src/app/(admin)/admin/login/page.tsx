'use client'

/**
 * Admin Login Page
 * صفحة تسجيل دخول الأدمن
 * 
 * Secure login page for admin dashboard access.
 * صفحة تسجيل دخول آمنة للوصول للوحة التحكم.
 * 
 * Features:
 * - Email/Password authentication
 * - Form validation
 * - Error handling
 * - Redirect after login
 * - Beautiful glassmorphism design
 */

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useAdminAuth } from '@/lib/admin'

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

// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function AdminLoginPage() {
  // State
  // الحالة
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Hooks
  const router = useRouter()
  const { login, isLoading: isContextLoading, error, isAuthenticated } = useAdminAuth()
  
  // Redirect if already authenticated
  // إعادة التوجيه إذا كان المستخدم مسجلاً بالفعل
  useEffect(() => {
    if (!isContextLoading && isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isContextLoading, isAuthenticated, router])
  
  // Show loading while checking auth
  // عرض التحميل أثناء التحقق من المصادقة
  if (isContextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-historical-stone via-white to-historical-gold/10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-historical-gold/30 border-t-historical-gold rounded-full animate-spin" />
          <p className="text-historical-charcoal/50 text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }
  
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
      setFormError('البريد الإلكتروني مطلوب')
      return
    }
    
    if (!password) {
      setFormError('كلمة المرور مطلوبة')
      return
    }
    
    // Email format validation
    // التحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError('صيغة البريد الإلكتروني غير صحيحة')
      return
    }
    
    // Attempt login
    // محاولة تسجيل الدخول
    setIsSubmitting(true)
    try {
      const success = await login({ email: email.trim(), password })
      
      if (success) {
        router.push('/admin/dashboard')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // =================================================================
  // Render
  // العرض
  // =================================================================
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-historical-stone via-white to-historical-gold/10 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Login Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-historical-gold/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-historical-gold via-historical-red to-historical-gold p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            >
              <Image
                src="/logo.svg"
                alt="Yalla Buy"
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  // Fallback to text if image fails
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">
              لوحة التحكم
            </h1>
            <p className="text-white/80 text-sm">
              Yalla Buy Admin Dashboard
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {(formError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
              >
                <span className="text-red-500">{Icons.alert}</span>
                <p className="text-sm text-red-700">{formError || error}</p>
              </motion.div>
            )}
            
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-historical-charcoal mb-2"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
                  {Icons.email}
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yallabuy.com"
                  className="w-full pr-12 pl-4 py-3.5 rounded-xl border border-historical-gold/20 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30 focus:border-historical-gold transition-all"
                  dir="ltr"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-historical-charcoal mb-2"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
                  {Icons.lock}
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-12 py-3.5 rounded-xl border border-historical-gold/20 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30 focus:border-historical-gold transition-all"
                  dir="ltr"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30 hover:text-historical-charcoal transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  {Icons.loader}
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </button>
            
            {/* Footer */}
            <p className="text-center text-xs text-historical-charcoal/40 pt-4">
              هذه الصفحة للمسؤولين فقط
              <br />
              <span dir="ltr">© 2024 Yalla Buy - All rights reserved</span>
            </p>
          </form>
        </motion.div>
        
        {/* Security Badge */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-historical-gold/10 text-sm text-historical-charcoal/50">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>اتصال آمن ومشفر</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

