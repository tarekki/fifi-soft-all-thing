'use client'

/**
 * Admin Promotions Management Page
 * صفحة إدارة العروض والحملات
 * 
 * Features:
 * - Banners management
 * - Stories management
 * - Coupons management
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/context'

// =============================================================================
// Types
// =============================================================================

interface PromotionSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  count: number
  activeCount: number
  color: string
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  banner: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  story: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  coupon: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  add: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  arrow: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
}

// =============================================================================
// Mock Data
// =============================================================================

const getPromotionSections = (t: any): PromotionSection[] => [
  {
    id: 'banners',
    title: t.admin.promotions.banners.title,
    description: t.admin.promotions.banners.subtitle,
    icon: Icons.banner,
    href: '/admin/promotions/banners',
    count: 8,
    activeCount: 5,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'stories',
    title: t.admin.promotions.stories.title,
    description: t.admin.promotions.stories.subtitle,
    icon: Icons.story,
    href: '/admin/promotions/stories',
    count: 12,
    activeCount: 8,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'coupons',
    title: t.admin.promotions.coupons.title,
    description: t.admin.promotions.coupons.subtitle,
    icon: Icons.coupon,
    href: '/admin/promotions/coupons',
    count: 15,
    activeCount: 10,
    color: 'from-historical-gold to-historical-red',
  },
]

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Recent Promotions Mock Data
// =============================================================================

const recentPromotions = [
  { id: '1', type: 'banner', title: 'عروض الشتاء', status: 'active', views: 1250, clicks: 89 },
  { id: '2', type: 'story', title: 'منتجات جديدة', status: 'active', views: 3400, clicks: 234 },
  { id: '3', type: 'coupon', title: 'WINTER25', status: 'active', uses: 156, remaining: 44 },
  { id: '4', type: 'banner', title: 'تخفيضات نهاية العام', status: 'scheduled', views: 0, clicks: 0 },
  { id: '5', type: 'coupon', title: 'FIRST10', status: 'expired', uses: 200, remaining: 0 },
]

// =============================================================================
// Main Component
// =============================================================================

export default function PromotionsPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'all' | 'banners' | 'stories' | 'coupons'>('all')
  const promotionSections = getPromotionSections(t)

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
          <h1 className="text-2xl font-bold text-historical-charcoal">{t.admin.promotions.title}</h1>
          <p className="text-historical-charcoal/50 mt-1">{t.admin.promotions.subtitle}</p>
        </div>
      </motion.div>

      {/* Promotion Sections */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promotionSections.map((section) => (
          <motion.div key={section.id} variants={itemVariants}>
            <Link href={section.href} className="block group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden hover:shadow-soft-lg transition-all">
                {/* Header with gradient */}
                <div className={`bg-gradient-to-l ${section.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {section.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-bold">{section.count}</p>
                      <p className="text-sm opacity-80">{section.activeCount} {t.admin.promotions.active}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-historical-charcoal text-lg mb-1">{section.title}</h3>
                  <p className="text-sm text-historical-charcoal/50 mb-4">{section.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 text-sm font-medium text-historical-gold hover:text-historical-red transition-colors">
                      {Icons.add}
                      <span>{t.admin.promotions.addNew}</span>
                    </button>
                    <span className="text-historical-charcoal/30 group-hover:text-historical-gold transition-colors">
                      {Icons.arrow}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 shadow-soft overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-historical-gold/10">
          <h2 className="text-lg font-bold text-historical-charcoal">{t.admin.promotions.recentActivity}</h2>
          <div className="flex items-center gap-2">
            {(['all', 'banners', 'stories', 'coupons'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-historical-gold/20 text-historical-gold'
                    : 'text-historical-charcoal/50 hover:bg-historical-gold/10'
                }`}
              >
                {tab === 'all' && t.admin.promotions.all}
                {tab === 'banners' && t.admin.promotions.banners.title}
                {tab === 'stories' && t.admin.promotions.stories.title}
                {tab === 'coupons' && t.admin.promotions.coupons.title}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-historical-stone/50">
              <tr>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">{t.admin.promotions.type}</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">{t.admin.promotions.titleLabel}</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">{t.admin.promotions.status}</th>
                <th className="text-right text-xs font-medium text-historical-charcoal/50 px-6 py-3">{t.admin.promotions.performance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-historical-gold/5">
              {recentPromotions
                .filter(p => activeTab === 'all' || p.type === activeTab.slice(0, -1))
                .map((promo) => (
                <tr key={promo.id} className="hover:bg-historical-gold/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      promo.type === 'banner' ? 'bg-blue-100 text-blue-700' :
                      promo.type === 'story' ? 'bg-purple-100 text-purple-700' :
                      'bg-historical-gold/20 text-historical-gold'
                    }`}>
                      {promo.type === 'banner' && t.admin.promotions.banner}
                      {promo.type === 'story' && t.admin.promotions.story}
                      {promo.type === 'coupon' && t.admin.promotions.coupon}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-historical-charcoal">{promo.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      promo.status === 'active' ? 'bg-green-100 text-green-700' :
                      promo.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {promo.status === 'active' && t.admin.promotions.active}
                      {promo.status === 'scheduled' && t.admin.promotions.scheduled}
                      {promo.status === 'expired' && t.admin.promotions.expired}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {promo.type === 'coupon' ? (
                      <span className="text-sm text-historical-charcoal/70">
                        {promo.uses} {t.admin.promotions.uses} • {promo.remaining} {t.admin.promotions.remaining}
                      </span>
                    ) : (
                      <span className="text-sm text-historical-charcoal/70">
                        {promo.views?.toLocaleString()} {t.admin.promotions.views} • {promo.clicks} {t.admin.promotions.clicks}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

