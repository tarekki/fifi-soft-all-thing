'use client'

/**
 * Admin Settings - Payment Methods Page
 * صفحة إعدادات طرق الدفع
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface PaymentMethod {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  type: 'cash' | 'card' | 'bank' | 'wallet'
  fee: number
  feeType: 'fixed' | 'percentage'
  minAmount: number
  maxAmount: number | null
  isActive: boolean
  instructions: string
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
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  cash: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  card: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  bank: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  wallet: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'Cash on Delivery',
    nameAr: 'الدفع عند الاستلام',
    description: 'Pay when you receive your order',
    descriptionAr: 'ادفع عند استلام طلبك',
    icon: 'cash',
    type: 'cash',
    fee: 0,
    feeType: 'fixed',
    minAmount: 0,
    maxAmount: 5000,
    isActive: true,
    instructions: 'يرجى تجهيز المبلغ المطلوب عند الاستلام',
  },
  {
    id: '2',
    name: 'Credit/Debit Card',
    nameAr: 'بطاقة ائتمان/مدين',
    description: 'Pay securely with your card',
    descriptionAr: 'ادفع بأمان ببطاقتك',
    icon: 'card',
    type: 'card',
    fee: 2.5,
    feeType: 'percentage',
    minAmount: 10,
    maxAmount: null,
    isActive: true,
    instructions: '',
  },
  {
    id: '3',
    name: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    description: 'Transfer directly to our bank account',
    descriptionAr: 'حول مباشرة لحسابنا البنكي',
    icon: 'bank',
    type: 'bank',
    fee: 0,
    feeType: 'fixed',
    minAmount: 100,
    maxAmount: null,
    isActive: false,
    instructions: 'رقم الحساب: 1234567890\nاسم البنك: بنك سوريا',
  },
  {
    id: '4',
    name: 'SyriaTel Cash',
    nameAr: 'سيريتل كاش',
    description: 'Pay using SyriaTel Cash mobile wallet',
    descriptionAr: 'ادفع باستخدام محفظة سيريتل كاش',
    icon: 'wallet',
    type: 'wallet',
    fee: 1,
    feeType: 'percentage',
    minAmount: 5,
    maxAmount: 1000,
    isActive: true,
    instructions: '',
  },
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
// Helper
// =============================================================================

const getIcon = (type: PaymentMethod['type']) => {
  const icons = {
    cash: Icons.cash,
    card: Icons.card,
    bank: Icons.bank,
    wallet: Icons.wallet,
  }
  return icons[type]
}

const getTypeLabel = (type: PaymentMethod['type']) => {
  const labels = {
    cash: 'نقداً',
    card: 'بطاقة',
    bank: 'بنك',
    wallet: 'محفظة',
  }
  return labels[type]
}

const getTypeColor = (type: PaymentMethod['type']) => {
  const colors = {
    cash: 'bg-green-100 text-green-700',
    card: 'bg-blue-100 text-blue-700',
    bank: 'bg-purple-100 text-purple-700',
    wallet: 'bg-orange-100 text-orange-700',
  }
  return colors[type]
}

// =============================================================================
// Main Component
// =============================================================================

export default function PaymentSettingsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = useCallback((id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
    setHasChanges(true)
  }, [])

  const handleUpdateFee = useCallback((id: string, fee: number) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, fee } : m))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
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
          <h1 className="text-2xl font-bold text-historical-charcoal">طرق الدفع</h1>
          <p className="text-historical-charcoal/50 mt-1">تفعيل وإعداد طرق الدفع المتاحة</p>
        </div>
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
      </motion.div>

      {/* Payment Methods */}
      <motion.div variants={itemVariants} className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border shadow-soft overflow-hidden transition-colors ${
              method.isActive ? 'border-green-200' : 'border-historical-gold/10'
            }`}
          >
            {/* Header */}
            <div
              className="flex items-center gap-4 p-5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === method.id ? null : method.id)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(method.type)}`}>
                {getIcon(method.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-historical-charcoal">{method.nameAr}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(method.type)}`}>
                    {getTypeLabel(method.type)}
                  </span>
                </div>
                <p className="text-sm text-historical-charcoal/50">{method.descriptionAr}</p>
              </div>
              {method.fee > 0 && (
                <div className="text-left">
                  <p className="text-sm font-medium text-historical-charcoal">
                    {method.fee}{method.feeType === 'percentage' ? '%' : '$'}
                  </p>
                  <p className="text-xs text-historical-charcoal/50">رسوم</p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggle(method.id)
                }}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                  method.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{ x: method.isActive ? 26 : 4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
                />
              </button>
            </div>

            {/* Expanded Settings */}
            <AnimatePresence>
              {expandedId === method.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-historical-gold/10"
                >
                  <div className="p-5 space-y-4 bg-historical-stone/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-historical-charcoal mb-2">
                          الرسوم
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            value={method.fee}
                            onChange={(e) => handleUpdateFee(method.id, parseFloat(e.target.value) || 0)}
                            className="flex-1 px-4 py-2.5 rounded-r-xl border border-l-0 border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                            min="0"
                            step="0.1"
                          />
                          <span className="px-4 py-2.5 rounded-l-xl border border-historical-gold/20 bg-historical-stone text-historical-charcoal/70">
                            {method.feeType === 'percentage' ? '%' : '$'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-historical-charcoal mb-2">
                          الحد الأدنى
                        </label>
                        <input
                          type="number"
                          value={method.minAmount}
                          className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-historical-charcoal mb-2">
                          الحد الأقصى
                        </label>
                        <input
                          type="text"
                          value={method.maxAmount ?? 'غير محدود'}
                          className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                          readOnly
                        />
                      </div>
                    </div>
                    {method.instructions && (
                      <div>
                        <label className="block text-sm font-medium text-historical-charcoal mb-2">
                          تعليمات للعميل
                        </label>
                        <textarea
                          value={method.instructions}
                          className="w-full px-4 py-3 rounded-xl border border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30 resize-none"
                          rows={2}
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

