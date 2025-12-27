'use client'

/**
 * Admin Settings - Shipping Methods Page
 * صفحة إعدادات طرق الشحن
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// =============================================================================
// Types
// =============================================================================

interface ShippingZone {
  id: string
  name: string
  nameAr: string
  cities: string[]
  isActive: boolean
}

interface ShippingMethod {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  estimatedDays: string
  price: number
  freeShippingThreshold: number | null
  zones: string[]
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
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  truck: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  express: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const initialZones: ShippingZone[] = [
  { id: 'z1', name: 'Damascus', nameAr: 'دمشق', cities: ['دمشق', 'ريف دمشق'], isActive: true },
  { id: 'z2', name: 'Aleppo', nameAr: 'حلب', cities: ['حلب'], isActive: true },
  { id: 'z3', name: 'Coastal', nameAr: 'الساحل', cities: ['اللاذقية', 'طرطوس'], isActive: true },
  { id: 'z4', name: 'Central', nameAr: 'الوسط', cities: ['حمص', 'حماة'], isActive: false },
]

const initialMethods: ShippingMethod[] = [
  {
    id: '1',
    name: 'Standard Shipping',
    nameAr: 'الشحن العادي',
    description: 'Delivery in 3-5 business days',
    descriptionAr: 'التوصيل خلال 3-5 أيام عمل',
    estimatedDays: '3-5',
    price: 5,
    freeShippingThreshold: 100,
    zones: ['z1', 'z2', 'z3', 'z4'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Express Shipping',
    nameAr: 'الشحن السريع',
    description: 'Next day delivery',
    descriptionAr: 'توصيل في اليوم التالي',
    estimatedDays: '1',
    price: 15,
    freeShippingThreshold: null,
    zones: ['z1', 'z2'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Same Day Delivery',
    nameAr: 'توصيل في نفس اليوم',
    description: 'Order before 2 PM',
    descriptionAr: 'اطلب قبل 2 ظهراً',
    estimatedDays: '0',
    price: 25,
    freeShippingThreshold: null,
    zones: ['z1'],
    isActive: false,
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
// Main Component
// =============================================================================

export default function ShippingSettingsPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>(initialMethods)
  const [zones, setZones] = useState<ShippingZone[]>(initialZones)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'methods' | 'zones'>('methods')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggleMethod = useCallback((id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
    setHasChanges(true)
  }, [])

  const handleToggleZone = useCallback((id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z))
    setHasChanges(true)
  }, [])

  const handleUpdatePrice = useCallback((id: string, price: number) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, price } : m))
    setHasChanges(true)
  }, [])

  const handleUpdateThreshold = useCallback((id: string, threshold: number | null) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, freeShippingThreshold: threshold } : m))
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
  }

  const getZoneNames = (zoneIds: string[]) => {
    return zoneIds.map(id => zones.find(z => z.id === id)?.nameAr).filter(Boolean).join('، ')
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
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">طرق الشحن</h1>
          <p className="text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50 mt-1">إعداد مناطق وطرق الشحن</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            hasChanges && !isSaving
              ? 'bg-gradient-to-l from-historical-gold to-historical-red text-white shadow-lg hover:shadow-xl'
              : 'bg-historical-charcoal/10 text-historical-charcoal dark:text-gray-200 transition-colors duration-300/40 cursor-not-allowed'
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

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'methods'
              ? 'bg-historical-gold text-white'
              : 'bg-white/80 border border-historical-gold/20 text-historical-charcoal dark:text-gray-200 transition-colors duration-300 hover:bg-historical-gold/10'
          }`}
        >
          طرق الشحن
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            activeTab === 'zones'
              ? 'bg-historical-gold text-white'
              : 'bg-white/80 border border-historical-gold/20 text-historical-charcoal dark:text-gray-200 transition-colors duration-300 hover:bg-historical-gold/10'
          }`}
        >
          مناطق الشحن
        </button>
      </motion.div>

      {/* Shipping Methods */}
      <AnimatePresence mode="wait">
        {activeTab === 'methods' && (
          <motion.div
            key="methods"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {methods.map((method) => (
              <div
                key={method.id}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl transition-colors duration-300 border shadow-soft overflow-hidden transition-colors ${
                  method.isActive ? 'border-green-200' : 'border-historical-gold/10'
                }`}
              >
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === method.id ? null : method.id)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    method.estimatedDays === '0' ? 'bg-red-100 text-red-600' :
                    method.estimatedDays === '1' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {method.estimatedDays === '0' || method.estimatedDays === '1' ? Icons.express : Icons.truck}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{method.nameAr}</h3>
                    <p className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50">{method.descriptionAr}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-historical-gold">${method.price}</p>
                    {method.freeShippingThreshold && (
                      <p className="text-xs text-green-600">مجاني فوق ${method.freeShippingThreshold}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleMethod(method.id)
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
                            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                              سعر الشحن
                            </label>
                            <div className="flex">
                              <span className="px-4 py-2.5 rounded-r-xl border border-l-0 border-historical-gold/20 bg-historical-stone text-historical-charcoal dark:text-gray-200 transition-colors duration-300/70">
                                $
                              </span>
                              <input
                                type="number"
                                value={method.price}
                                onChange={(e) => handleUpdatePrice(method.id, parseFloat(e.target.value) || 0)}
                                className="flex-1 px-4 py-2.5 rounded-l-xl border border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                                min="0"
                                step="0.5"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                              الشحن المجاني فوق
                            </label>
                            <div className="flex">
                              <span className="px-4 py-2.5 rounded-r-xl border border-l-0 border-historical-gold/20 bg-historical-stone text-historical-charcoal dark:text-gray-200 transition-colors duration-300/70">
                                $
                              </span>
                              <input
                                type="number"
                                value={method.freeShippingThreshold ?? ''}
                                onChange={(e) => handleUpdateThreshold(method.id, e.target.value ? parseFloat(e.target.value) : null)}
                                className="flex-1 px-4 py-2.5 rounded-l-xl border border-historical-gold/20 bg-white focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                                placeholder="غير محدد"
                                min="0"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                              مدة التوصيل
                            </label>
                            <input
                              type="text"
                              value={method.estimatedDays === '0' ? 'نفس اليوم' : method.estimatedDays === '1' ? 'اليوم التالي' : `${method.estimatedDays} أيام`}
                              className="w-full px-4 py-2.5 rounded-xl border border-historical-gold/20 bg-white focus:outline-none"
                              readOnly
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300 mb-2">
                            المناطق المتاحة
                          </label>
                          <p className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300/70 bg-white px-4 py-3 rounded-xl border border-historical-gold/20">
                            {getZoneNames(method.zones) || 'جميع المناطق'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}

        {/* Shipping Zones */}
        {activeTab === 'zones' && (
          <motion.div
            key="zones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl transition-colors duration-300 border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    zone.isActive ? 'border-green-200 bg-green-50/50' : 'border-historical-gold/10 bg-historical-stone/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-historical-gold/10 flex items-center justify-center text-historical-gold">
                    {Icons.location}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">{zone.nameAr}</h3>
                    <p className="text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300/50">{zone.cities.join('، ')}</p>
                  </div>
                  <button
                    onClick={() => handleToggleZone(zone.id)}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                      zone.isActive ? 'bg-green-500' : 'bg-historical-charcoal/20'
                    }`}
                  >
                    <motion.div
                      initial={false}
                      animate={{ x: zone.isActive ? 22 : 4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-historical-gold/10 bg-historical-stone/20">
              <button className="flex items-center gap-2 text-sm font-medium text-historical-gold hover:text-historical-red transition-colors">
                {Icons.add}
                <span>إضافة منطقة جديدة</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

