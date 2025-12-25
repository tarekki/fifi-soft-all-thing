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
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
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
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10 bg-historical-stone/30">
            <div>
              <h2 className="text-lg font-bold text-historical-charcoal">تفاصيل طلب الانضمام</h2>
              <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(application.status)}`}>
                {application.status_display}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-historical-charcoal/50 hover:text-historical-charcoal hover:bg-historical-gold/10 transition-colors"
            >
              {Icons.close}
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Store Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-historical-charcoal flex items-center gap-2">
                {Icons.store}
                معلومات المتجر
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-historical-charcoal/50">اسم المتجر</label>
                  <p className="font-medium text-historical-charcoal">{application.store_name}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50">نوع النشاط</label>
                  <p className="font-medium text-historical-charcoal">{application.business_type_display}</p>
                </div>
              </div>
              {application.store_description && (
                <div>
                  <label className="text-sm text-historical-charcoal/50">الوصف</label>
                  <p className="text-historical-charcoal">{application.store_description}</p>
                </div>
              )}
              {application.business_address && (
                <div>
                  <label className="text-sm text-historical-charcoal/50">العنوان</label>
                  <p className="text-historical-charcoal">{application.business_address}</p>
                </div>
              )}
            </div>

            {/* Applicant Info */}
            <div className="space-y-4 border-t border-historical-gold/10 pt-4">
              <h3 className="font-bold text-historical-charcoal flex items-center gap-2">
                {Icons.user}
                معلومات المتقدم
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-historical-charcoal/50">الاسم</label>
                  <p className="font-medium text-historical-charcoal">{application.applicant_name}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50">البريد الإلكتروني</label>
                  <p className="font-medium text-historical-charcoal" dir="ltr">{application.applicant_email}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50">الهاتف</label>
                  <p className="font-medium text-historical-charcoal" dir="ltr">{application.applicant_phone}</p>
                </div>
                <div>
                  <label className="text-sm text-historical-charcoal/50">تاريخ التقديم</label>
                  <p className="font-medium text-historical-charcoal">{formatDate(application.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Review Info (if reviewed) */}
            {application.reviewed_at && (
              <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                <h3 className="font-bold text-historical-charcoal">معلومات المراجعة</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-historical-charcoal/50">تمت المراجعة بواسطة</label>
                    <p className="font-medium text-historical-charcoal">{application.reviewed_by_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-historical-charcoal/50">تاريخ المراجعة</label>
                    <p className="font-medium text-historical-charcoal">{formatDate(application.reviewed_at)}</p>
                  </div>
                </div>
                {application.rejection_reason && (
                  <div>
                    <label className="text-sm text-historical-charcoal/50">سبب الرفض</label>
                    <p className="text-red-600">{application.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Form */}
            {showRejectForm && application.status === 'pending' && (
              <div className="space-y-4 border-t border-historical-gold/10 pt-4">
                <h3 className="font-bold text-red-600">رفض الطلب</h3>
                <div>
                  <label className="block text-sm font-medium text-historical-charcoal mb-1">
                    سبب الرفض *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                    placeholder="اكتب سبب الرفض..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {application.status === 'pending' && (
            <div className="px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/20">
              {!showRejectForm ? (
                <div className="space-y-4">
                  {/* Commission Rate */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-historical-charcoal/70 whitespace-nowrap">نسبة العمولة:</label>
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-24 px-3 py-2 rounded-lg border border-historical-gold/20 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                    />
                    <span className="text-sm text-historical-charcoal/50">%</span>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onApprove(application.id, commissionRate)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? Icons.loader : Icons.check}
                      <span>الموافقة وإنشاء البائع</span>
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {Icons.x}
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-historical-gold/20 text-historical-charcoal hover:bg-historical-stone/50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => onReject(application.id, rejectionReason)}
                    disabled={isProcessing || rejectionReason.length < 10}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? Icons.loader : Icons.x}
                    <span>تأكيد الرفض</span>
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

  const handleApprove = useCallback(async (id: number, commissionRate: number) => {
    const success = await approve(id, { commission_rate: commissionRate })
    if (success) {
      setIsModalOpen(false)
      clearSelectedApplication()
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
          <h1 className="text-2xl font-bold text-historical-charcoal">طلبات انضمام البائعين</h1>
          <p className="text-historical-charcoal/50 mt-1">مراجعة طلبات البائعين الجدد والموافقة عليها أو رفضها</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? Icons.loader : Icons.refresh}
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-historical-gold/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-historical-gold/10 text-historical-gold">
              {Icons.store}
            </div>
            <div>
              <p className="text-2xl font-bold text-historical-charcoal">{stats?.total || 0}</p>
              <p className="text-xs text-historical-charcoal/50">إجمالي الطلبات</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              {Icons.clock}
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              <p className="text-xs text-historical-charcoal/50">قيد المراجعة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              {Icons.check}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
              <p className="text-xs text-historical-charcoal/50">مقبولة</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              {Icons.x}
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
              <p className="text-xs text-historical-charcoal/50">مرفوضة</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as VendorApplicationStatus | '')}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 min-w-[150px]"
        >
          <option value="">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">مقبولة</option>
          <option value="rejected">مرفوضة</option>
        </select>
      </motion.div>

      {/* Applications Table */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 overflow-hidden">
        {isLoading && applications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            {Icons.loader}
            <span className="mr-2 text-historical-charcoal/50">جاري تحميل الطلبات...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-historical-charcoal/50">لا يوجد طلبات انضمام حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-historical-stone/30 border-b border-historical-gold/10">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">المتجر</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">المتقدم</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">نوع النشاط</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">الحالة</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">التاريخ</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-historical-charcoal/70">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-historical-gold/10">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-historical-stone/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg bg-historical-gold/10 flex items-center justify-center text-historical-gold font-bold"
                        >
                          {app.store_name.charAt(0)}
                        </div>
                        <span className="font-medium text-historical-charcoal">{app.store_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-historical-charcoal">{app.applicant_name}</p>
                        <p className="text-sm text-historical-charcoal/50" dir="ltr">{app.applicant_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-historical-charcoal">{app.business_type_display}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}`}>
                        {app.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-historical-charcoal/70">{formatDate(app.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(app.id)}
                        disabled={isLoadingDetails}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-historical-gold bg-historical-gold/10 hover:bg-historical-gold/20 transition-colors"
                      >
                        {Icons.eye}
                        <span className="text-sm">عرض</span>
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
          <div className="flex items-center justify-center gap-4 p-4 border-t border-historical-gold/10">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={!hasPreviousPage || isLoading}
              className="px-4 py-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/70 hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              الصفحة السابقة
            </button>
            <span className="text-historical-charcoal/50">صفحة {currentPage}</span>
            <button
              onClick={() => handlePageChange('next')}
              disabled={!hasNextPage || isLoading}
              className="px-4 py-2 rounded-xl border border-historical-gold/20 text-historical-charcoal/70 hover:bg-historical-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              الصفحة التالية
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
    </motion.div>
  )
}

