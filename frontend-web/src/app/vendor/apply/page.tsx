'use client'

/**
 * Vendor Application Page
 * صفحة طلب انضمام البائع
 * 
 * Professional vendor application form with:
 * - Complete application form
 * - File uploads (logo, license)
 * - Form validation
 * - Error handling
 * - Success message
 * - Dark mode support
 * - Beautiful design matching the app
 * 
 * نموذج طلب انضمام بائع احترافي مع:
 * - نموذج طلب كامل
 * - رفع الملفات (شعار، رخصة)
 * - التحقق من النموذج
 * - معالجة الأخطاء
 * - رسالة نجاح
 * - دعم الوضع الداكن
 * - تصميم جميل متسق مع التطبيق
 */

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'
import { submitVendorApplication } from '@/lib/vendor/api'
import type { VendorApplicationData } from '@/lib/vendor/types'
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Upload, 
  X, 
  Check,
  Loader,
  AlertCircle
} from 'lucide-react'

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
// Icons
// =============================================================================

const Icons = {
  store: Store,
  user: User,
  mail: Mail,
  phone: Phone,
  fileText: FileText,
  mapPin: MapPin,
  upload: Upload,
  close: X,
  check: Check,
  loader: Loader,
  alert: AlertCircle,
}

// =============================================================================
// Main Component
// =============================================================================

export default function VendorApplyPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  
  // Form state
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [applicantPhone, setApplicantPhone] = useState('')
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeLogo, setStoreLogo] = useState<File | null>(null)
  const [storeLogoPreview, setStoreLogoPreview] = useState<string | null>(null)
  const [businessType, setBusinessType] = useState<'individual' | 'company' | 'brand' | 'other'>('individual')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessLicense, setBusinessLicense] = useState<File | null>(null)
  const [businessLicensePreview, setBusinessLicensePreview] = useState<string | null>(null)
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const licenseInputRef = useRef<HTMLInputElement>(null)

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFieldErrors({ ...fieldErrors, store_logo: 'يجب أن يكون الملف صورة / File must be an image' })
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, store_logo: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت / File size too large. Maximum 5MB' })
        return
      }
      
      setStoreLogo(file)
      setFieldErrors({ ...fieldErrors, store_logo: '' })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setStoreLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle license upload
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors({ ...fieldErrors, business_license: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت / File size too large. Maximum 10MB' })
        return
      }
      
      setBusinessLicense(file)
      setFieldErrors({ ...fieldErrors, business_license: '' })
      
      // Create preview for PDF
      if (file.type === 'application/pdf') {
        setBusinessLicensePreview('pdf')
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setBusinessLicensePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    // Validation
    if (!applicantName.trim()) {
      setFieldErrors({ applicant_name: 'اسم المتقدم مطلوب / Applicant name is required' })
      return
    }

    if (!applicantEmail.trim()) {
      setFieldErrors({ applicant_email: 'البريد الإلكتروني مطلوب / Email is required' })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(applicantEmail)) {
      setFieldErrors({ applicant_email: 'صيغة البريد الإلكتروني غير صحيحة / Invalid email format' })
      return
    }

    if (!applicantPhone.trim()) {
      setFieldErrors({ applicant_phone: 'رقم الهاتف مطلوب / Phone number is required' })
      return
    }

    if (!storeName.trim()) {
      setFieldErrors({ store_name: 'اسم المتجر مطلوب / Store name is required' })
      return
    }

    setIsSubmitting(true)
    try {
      const applicationData: VendorApplicationData = {
        applicant_name: applicantName.trim(),
        applicant_email: applicantEmail.trim().toLowerCase(),
        applicant_phone: applicantPhone.trim(),
        store_name: storeName.trim(),
        store_description: storeDescription.trim() || undefined,
        store_logo: storeLogo || undefined,
        business_type: businessType,
        business_address: businessAddress.trim() || undefined,
        business_license: businessLicense || undefined,
      }

      const response = await submitVendorApplication(applicationData)

      if (response.success && response.data) {
        setSuccess(response.data.message || response.message || 'تم تقديم طلب الانضمام بنجاح / Application submitted successfully')
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setApplicantName('')
          setApplicantEmail('')
          setApplicantPhone('')
          setStoreName('')
          setStoreDescription('')
          setStoreLogo(null)
          setStoreLogoPreview(null)
          setBusinessType('individual')
          setBusinessAddress('')
          setBusinessLicense(null)
          setBusinessLicensePreview(null)
          setSuccess(null)
        }, 5000)
      } else {
        setError(response.message || 'فشل تقديم طلب الانضمام / Failed to submit application')
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
    <div className="min-h-screen bg-gradient-to-br from-historical-stone via-white to-historical-stone dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl"
      >
        {/* Header Card */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-historical-gold to-historical-red dark:from-yellow-600 dark:to-red-600 shadow-lg mb-4">
            <Icons.store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-historical-charcoal dark:text-gray-100 mb-2 transition-colors duration-300">
            انضم كبائع / Become a Vendor
          </h1>
          <p className="text-lg text-historical-charcoal/60 dark:text-gray-400 transition-colors duration-300">
            املأ النموذج أدناه لتقديم طلب انضمامك كبائع في منصة Yalla Buy
            <br />
            <span className="text-sm">Fill out the form below to submit your vendor application</span>
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft-xl overflow-hidden transition-colors duration-300"
        >
          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-6 flex items-start gap-4"
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <Icons.check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">
                    تم تقديم الطلب بنجاح! / Application Submitted Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    {success}
                  </p>
                </div>
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
                className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-6 flex items-start gap-4"
              >
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                  <Icons.alert className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-1">
                    خطأ / Error
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Applicant Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-historical-gold/10 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400">
                  <Icons.user className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100">
                  معلومات المتقدم / Applicant Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applicant Name */}
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                    الاسم الكامل / Full Name *
                  </label>
                  <div className="relative">
                    <Icons.user className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/30 dark:text-gray-500" />
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => {
                        setApplicantName(e.target.value)
                        setFieldErrors({ ...fieldErrors, applicant_name: '' })
                      }}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        fieldErrors.applicant_name
                          ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                          : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                      } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>
                  {fieldErrors.applicant_name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.applicant_name}
                    </p>
                  )}
                </div>

                {/* Applicant Email */}
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                    البريد الإلكتروني / Email *
                  </label>
                  <div className="relative">
                    <Icons.mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/30 dark:text-gray-500" />
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => {
                        setApplicantEmail(e.target.value)
                        setFieldErrors({ ...fieldErrors, applicant_email: '' })
                      }}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        fieldErrors.applicant_email
                          ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                          : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                      } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                      placeholder="vendor@example.com"
                      dir="ltr"
                    />
                  </div>
                  {fieldErrors.applicant_email && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.applicant_email}
                    </p>
                  )}
                </div>

                {/* Applicant Phone */}
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                    رقم الهاتف / Phone Number *
                  </label>
                  <div className="relative">
                    <Icons.phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/30 dark:text-gray-500" />
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => {
                        setApplicantPhone(e.target.value)
                        setFieldErrors({ ...fieldErrors, applicant_phone: '' })
                      }}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                        fieldErrors.applicant_phone
                          ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                          : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                      } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                      placeholder="0991234567"
                      dir="ltr"
                    />
                  </div>
                  {fieldErrors.applicant_phone && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.applicant_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Store Information Section */}
            <div className="space-y-6 pt-6 border-t border-historical-gold/10 dark:border-gray-700">
              <div className="flex items-center gap-3 pb-4 border-b border-historical-gold/10 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400">
                  <Icons.store className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100">
                  معلومات المتجر / Store Information
                </h2>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  اسم المتجر / Store Name *
                </label>
                <div className="relative">
                  <Icons.store className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/30 dark:text-gray-500" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => {
                      setStoreName(e.target.value)
                      setFieldErrors({ ...fieldErrors, store_name: '' })
                    }}
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                      fieldErrors.store_name
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                        : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                    } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 transition-colors duration-300`}
                    placeholder="اسم المتجر"
                  />
                </div>
                {fieldErrors.store_name && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.store_name}
                  </p>
                )}
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  وصف المتجر / Store Description
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => {
                    setStoreDescription(e.target.value)
                    setFieldErrors({ ...fieldErrors, store_description: '' })
                  }}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    fieldErrors.store_description
                      ? 'border-red-500 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-600'
                      : 'border-historical-gold/20 dark:border-gray-600 focus:ring-historical-gold/30 dark:focus:ring-yellow-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 text-historical-charcoal dark:text-gray-200 resize-none transition-colors duration-300`}
                  placeholder="وصف مختصر عن المتجر والمنتجات التي تقدمها"
                />
                {fieldErrors.store_description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.store_description}
                  </p>
                )}
              </div>

              {/* Store Logo */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  شعار المتجر / Store Logo
                </label>
                <div className="space-y-4">
                  {storeLogoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={storeLogoPreview}
                        alt="Store logo preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-historical-gold/20 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setStoreLogo(null)
                          setStoreLogoPreview(null)
                          if (logoInputRef.current) logoInputRef.current.value = ''
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <Icons.close className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-historical-gold/30 dark:border-gray-600 rounded-xl bg-historical-gold/5 dark:bg-gray-700/30 cursor-pointer hover:border-historical-gold/50 dark:hover:border-gray-500 transition-colors">
                      <Icons.upload className="w-8 h-8 text-historical-gold dark:text-yellow-400 mb-2" />
                      <span className="text-sm text-historical-charcoal/60 dark:text-gray-400">
                        اضغط لرفع الشعار / Click to upload logo
                      </span>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {fieldErrors.store_logo && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.store_logo}
                  </p>
                )}
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1">
                  الحد الأقصى 5 ميجابايت / Maximum 5MB
                </p>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-6 pt-6 border-t border-historical-gold/10 dark:border-gray-700">
              <div className="flex items-center gap-3 pb-4 border-b border-historical-gold/10 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400">
                  <Icons.fileText className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100">
                  معلومات العمل / Business Information
                </h2>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  نوع العمل / Business Type *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                >
                  <option value="individual">فردي / Individual</option>
                  <option value="company">شركة / Company</option>
                  <option value="brand">علامة تجارية / Brand</option>
                  <option value="other">أخرى / Other</option>
                </select>
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  عنوان العمل / Business Address
                </label>
                <div className="relative">
                  <Icons.mapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-historical-charcoal/30 dark:text-gray-500" />
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                    placeholder="عنوان العمل الكامل"
                  />
                </div>
              </div>

              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-historical-charcoal/70 dark:text-gray-300 mb-2 transition-colors duration-300">
                  رخصة العمل / Business License
                </label>
                <div className="space-y-4">
                  {businessLicensePreview ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-historical-gold/5 dark:bg-gray-700/30">
                      {businessLicensePreview === 'pdf' ? (
                        <Icons.fileText className="w-12 h-12 text-historical-gold dark:text-yellow-400" />
                      ) : (
                        <img
                          src={businessLicensePreview}
                          alt="License preview"
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200">
                          {businessLicense?.name}
                        </p>
                        <p className="text-xs text-historical-charcoal/50 dark:text-gray-400">
                          {(businessLicense?.size || 0) / 1024 / 1024} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setBusinessLicense(null)
                          setBusinessLicensePreview(null)
                          if (licenseInputRef.current) licenseInputRef.current.value = ''
                        }}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Icons.close className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-historical-gold/30 dark:border-gray-600 rounded-xl bg-historical-gold/5 dark:bg-gray-700/30 cursor-pointer hover:border-historical-gold/50 dark:hover:border-gray-500 transition-colors">
                      <Icons.upload className="w-8 h-8 text-historical-gold dark:text-yellow-400 mb-2" />
                      <span className="text-sm text-historical-charcoal/60 dark:text-gray-400">
                        اضغط لرفع الرخصة / Click to upload license
                      </span>
                      <input
                        ref={licenseInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleLicenseUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {fieldErrors.business_license && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.business_license}
                  </p>
                )}
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 mt-1">
                  الحد الأقصى 10 ميجابايت (PDF أو صورة) / Maximum 10MB (PDF or image)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-6 border-t border-historical-gold/10 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/vendor/login')}
                className="flex-1 px-6 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                إلغاء / Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !applicantName || !applicantEmail || !applicantPhone || !storeName}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Icons.loader className="w-5 h-5 animate-spin" />
                    <span>جاري الإرسال... / Submitting...</span>
                  </>
                ) : (
                  <>
                    <Icons.check className="w-5 h-5" />
                    <span>تقديم الطلب / Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer Link */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-6"
        >
          <button
            onClick={() => router.push('/vendor/login')}
            className="text-sm text-historical-charcoal/60 dark:text-gray-400 hover:text-historical-gold dark:hover:text-yellow-400 transition-colors"
          >
            لديك حساب بالفعل؟ تسجيل الدخول / Already have an account? Login
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

