'use client'

/**
 * Admin Vendor Applications Page
 * صفحة طلبات انضمام البائعين
 * 
 * Features / الميزات:
 * - List all vendor applications
 * - Filter by status
 * - View application details
 * - Approve/Reject applications
 * - Statistics dashboard
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVendorApplications } from '@/lib/admin'
import type {
  VendorApplication,
  VendorApplicationDetail,
  VendorApplicationFilters,
  VendorApplicationStatus,
} from '@/lib/admin/types/vendorApplications'
import { useLanguage } from '@/lib/i18n/context'


// =============================================================================
// Icons
// =============================================================================

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  store: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  mail: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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
// Helper Functions
// =============================================================================

const getStatusStyle = (status: VendorApplicationStatus) => {
  const styles = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  return styles[status]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}


// =============================================================================
// Temporary Password Modal Component
// مكون Modal عرض كلمة المرور المؤقتة
// =============================================================================

interface TempPasswordModalProps {
  password: string
  email?: string
  onClose: () => void
}

function TempPasswordModal({ password, email, onClose }: TempPasswordModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-gradient-to-l from-historical-gold/10 dark:from-yellow-900/20 to-transparent transition-colors duration-300">
          <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            كلمة المرور المؤقتة / Temporary Password
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
          >
            {Icons.close}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
            تم إنشاء المستخدم بنجاح. يرجى حفظ كلمة المرور المؤقتة التالية:
            <br />
            <span className="text-xs">User created successfully. Please save the following temporary password:</span>
          </p>

          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-4 py-3 rounded-xl border-2 border-historical-gold/30 dark:border-yellow-600/30 bg-historical-gold/5 dark:bg-yellow-900/10 text-historical-charcoal dark:text-gray-200 font-mono text-center text-lg font-bold transition-colors duration-300"
            />
            <button
              onClick={handleCopy}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
            >
              {copied ? 'تم النسخ! / Copied!' : 'نسخ / Copy'}
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 transition-colors duration-300">
              ⚠️ <strong>تحذير / Warning:</strong> هذه كلمة المرور المؤقتة. يرجى إرسالها للبائع بشكل آمن. يجب على البائع تغييرها عند أول تسجيل دخول.
              <br />
              <span className="text-xs">This is a temporary password. Please send it to the vendor securely. The vendor must change it on first login.</span>
            </p>
          </div>

          {email && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 transition-colors duration-300">
                📧 <strong>معلومات تسجيل الدخول / Login Info:</strong>
                <br />
                البريد الإلكتروني: {email}
                <br />
                <span className="text-xs">Email: {email}</span>
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-l from-historical-gold to-historical-red text-white font-medium hover:shadow-lg transition-shadow"
          >
            تم / Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// Application Detail Modal
// =============================================================================

interface ApplicationDetailModalProps {
  isOpen: boolean
  application: VendorApplicationDetail | null
  isProcessing: boolean
  onClose: () => void
  onApprove: (id: number, commissionRate: number) => void
  onReject: (id: number, reason: string) => void
}

function ApplicationDetailModal({
  isOpen,
  application,
  isProcessing,
  onClose,
  onApprove,
  onReject,
}: ApplicationDetailModalProps) {
  const { t } = useLanguage()
  const [commissionRate, setCommissionRate] = useState(10)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCommissionRate(10)
      setRejectionReason('')
      setShowRejectForm(false)
    }
  }, [isOpen])

  if (!isOpen || !application) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30 transition-colors duration-300">
            <div>
              <h2 className="text-lg font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.vendorApplications.view}</h2>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getStatusStyle(application.status)}`}>
                {application.status_display}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Store Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-historical-charcoal dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
                {Icons.store}
                {t.admin.vendorApplications.storeInfo}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.storeName}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.store_name}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.businessType}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.business_type_display}</p>
                </div>
              </div>
              {application.store_description && (
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.description}</label>
                  <p className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.store_description}</p>
                </div>
              )}
              {application.business_address && (
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.address}</label>
                  <p className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.business_address}</p>
                </div>
              )}
            </div>

            {/* Applicant Info */}
            <div className="space-y-4 border-t border-historical-gold/10 dark:border-gray-700 pt-4 transition-colors duration-300">
              <h3 className="font-bold text-historical-charcoal dark:text-gray-100 flex items-center gap-2 transition-colors duration-300">
                {Icons.user}
                {t.admin.vendorApplications.applicantInfo}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.name}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.applicant_name}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.emailFull}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300" dir="ltr">{application.applicant_email}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.phone}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300" dir="ltr">{application.applicant_phone}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.submissionDate}</label>
                  <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{formatDate(application.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Review Info (if reviewed) */}
            {application.reviewed_at && (
              <div className="space-y-4 border-t border-historical-gold/10 dark:border-gray-700 pt-4 transition-colors duration-300">
                <h3 className="font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.vendorApplications.reviewInfo}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.reviewedBy}</label>
                    <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{application.reviewed_by_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.reviewDate}</label>
                    <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{formatDate(application.reviewed_at)}</p>
                  </div>
                </div>
                {application.rejection_reason && (
                  <div>
                    <label className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.rejectionReason}</label>
                    <p className="text-red-600 dark:text-red-400 transition-colors duration-300">{application.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Form */}
            {showRejectForm && application.status === 'pending' && (
              <div className="space-y-4 border-t border-historical-gold/10 dark:border-gray-700 pt-4 transition-colors duration-300">
                <h3 className="font-bold text-red-600 dark:text-red-400 transition-colors duration-300">{t.admin.vendorApplications.rejectApplication}</h3>
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 mb-1 transition-colors duration-300">
                    {t.admin.vendorApplications.rejectionReason} *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600 resize-none text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                    placeholder={t.admin.vendorApplications.rejectionReasonPlaceholder}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {application.status === 'pending' && (
            <div className="px-6 py-4 border-t border-historical-gold/10 dark:border-gray-700 bg-historical-stone/20 dark:bg-gray-700/20 transition-colors duration-300">
              {!showRejectForm ? (
                <div className="space-y-4">
                  {/* Commission Rate */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-historical-charcoal/70 dark:text-gray-300 whitespace-nowrap transition-colors duration-300">{t.admin.vendorApplications.commissionRate}</label>
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-24 px-3 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
                    />
                    <span className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">%</span>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onApprove(application.id, commissionRate)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? Icons.loader : Icons.check}
                      <span>{t.admin.vendorApplications.approveAndCreate}</span>
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {Icons.x}
                      <span>{t.admin.vendorApplications.reject}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 hover:bg-historical-stone/50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t.admin.users.form.cancel}
                  </button>
                  <button
                    onClick={() => onReject(application.id, rejectionReason)}
                    disabled={isProcessing || rejectionReason.length < 10}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? Icons.loader : Icons.x}
                    <span>{t.admin.vendorApplications.confirmRejection}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


// =============================================================================
// Main Component
// =============================================================================

export default function VendorApplicationsPage() {
  // =========================================================================
  // Hook
  // =========================================================================
  const { t, language } = useLanguage()
  const {
    applications,
    selectedApplication,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isProcessing,
    error,
    filters,
    fetchApplications,
    fetchApplicationDetails,
    approve,
    reject,
    setFilters,
    clearSelectedApplication,
    refresh,
  } = useVendorApplications()

  // =========================================================================
  // Local State
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<VendorApplicationStatus | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // =========================================================================
  // Handlers
  // =========================================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters: VendorApplicationFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterStatus) {
        newFilters.status = filterStatus
      } else {
        delete newFilters.status
      }
      setFilters(newFilters)
      fetchApplications(newFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewDetails = useCallback(async (id: number) => {
    await fetchApplicationDetails(id)
    setIsModalOpen(true)
  }, [fetchApplicationDetails])

  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const handleApprove = useCallback(async (id: number, commissionRate: number) => {
    console.log('handleApprove called with id:', id, 'commissionRate:', commissionRate)
    const result = await approve(id, { commission_rate: commissionRate })
    console.log('Approve result:', result)
    console.log('Result type:', typeof result)
    console.log('Is object?', typeof result === 'object')
    console.log('Has temp_password?', result && typeof result === 'object' && 'temp_password' in result)
    
    if (result && typeof result === 'object' && 'temp_password' in result) {
      // If approve returns temp_password, show modal
      // إذا كان approve يرجع temp_password، عرض modal
      console.log('Setting temp password:', result.temp_password)
      setTempPassword(result.temp_password as string)
    } else if (result) {
      // Success but no temp_password (user already existed)
      // نجاح لكن لا يوجد temp_password (المستخدم موجود مسبقاً)
      console.log('No temp_password - closing modal')
      console.log('Note: User already exists, so no temporary password was generated')
      setIsModalOpen(false)
      clearSelectedApplication()
    } else {
      console.log('Approve failed - result is false')
    }
  }, [approve, clearSelectedApplication])

  const handleReject = useCallback(async (id: number, reason: string) => {
    const success = await reject(id, { rejection_reason: reason })
    if (success) {
      setIsModalOpen(false)
      clearSelectedApplication()
    }
  }, [reject, clearSelectedApplication])

  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    fetchApplications(newFilters)
  }, [currentPage, filters, setFilters, fetchApplications])

  // =========================================================================
  // Render
  // =========================================================================

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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{t.admin.vendorApplications.title}</h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">{t.admin.vendorApplications.subtitle}</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 dark:bg-yellow-900/20 text-historical-gold dark:text-yellow-400 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors disabled:opacity-50"
        >
          {isLoading ? Icons.loader : Icons.refresh}
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 text-historical-gold dark:text-yellow-400">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">{stats?.total || 0}</p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.totalApplications}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              {Icons.clock}
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 transition-colors duration-300">{stats?.pending || 0}</p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.underReview}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-green-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{stats?.approved || 0}</p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 dark:border-red-800 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">{stats?.rejected || 0}</p>
              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.rejected}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30 dark:text-gray-500 transition-colors duration-300">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.vendorApplications.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as VendorApplicationStatus | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
        >
          <option value="">{t.admin.vendorApplications.allStatuses}</option>
          <option value="pending">{t.admin.vendorApplications.underReview}</option>
          <option value="approved">{t.admin.vendorApplications.approved}</option>
          <option value="rejected">{t.admin.vendorApplications.rejected}</option>
        </select>
      </motion.div>

      {/* Applications Table */}
      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {isLoading && applications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            {Icons.loader}
            <span className="mr-2 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.loading}</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.noApplications}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-historical-stone/30 dark:bg-gray-700/50 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.store}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.applicant}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.businessType}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.status}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.date}</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-historical-gold/10 dark:divide-gray-700/50 transition-colors duration-300">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-historical-stone/20 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg bg-historical-gold/10 dark:bg-yellow-900/30 flex items-center justify-center text-historical-gold dark:text-yellow-400 font-bold transition-colors duration-300"
                        >
                          {app.store_name.charAt(0)}
                        </div>
                        <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{app.store_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{app.applicant_name}</p>
                        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300" dir="ltr">{app.applicant_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{app.business_type_display}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getStatusStyle(app.status)}`}>
                        {app.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">{formatDate(app.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(app.id)}
                        disabled={isLoadingDetails}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-historical-gold dark:text-yellow-400 bg-historical-gold/10 dark:bg-yellow-900/20 hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 transition-colors"
                      >
                        {Icons.eye}
                        <span className="text-sm">{t.admin.vendorApplications.view}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {(hasNextPage || hasPreviousPage) && (
          <div className="flex items-center justify-center gap-4 p-4 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={!hasPreviousPage || isLoading}
              className="px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/70 dark:text-gray-400 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.admin.vendorApplications.previousPage}
            </button>
            <span className="text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">{t.admin.vendorApplications.page} {currentPage}</span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={!hasNextPage || isLoading}
              className="px-4 py-2 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/70 dark:text-gray-400 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.admin.vendorApplications.nextPage}
            </button>
          </div>
        )}
      </motion.div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={isModalOpen}
        application={selectedApplication}
        isProcessing={isProcessing}
        onClose={() => {
          setIsModalOpen(false)
          clearSelectedApplication()
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Temporary Password Modal */}
      <AnimatePresence>
        {tempPassword && (
          <TempPasswordModal
            password={tempPassword}
            email={selectedApplication?.applicant_email}
            onClose={() => {
              setTempPassword(null)
              setIsModalOpen(false)
              clearSelectedApplication()
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

