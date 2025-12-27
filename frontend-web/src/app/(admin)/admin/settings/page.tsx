'use client'

/**
 * Admin Settings Index Page
 * صفحة فهرس الإعدادات
 * 
 * Overview of all settings sections with quick links
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/context'

// =============================================================================
// Types
// =============================================================================

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  status: 'ready' | 'coming'
}

// =============================================================================
// Icons
// =============================================================================

const Icons = {
  general: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  seo: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  contact: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  social: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  languages: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  ),
  navigation: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  payments: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  shipping: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
}

// =============================================================================
// Helper Functions
// =============================================================================

function getSettingsSections(t: any): SettingsSection[] {
  return [
    {
      id: 'general',
      title: t.admin.settings.general.title,
      description: t.admin.settings.general.subtitle || t.admin.settings.general.title,
      icon: Icons.general,
      href: '/admin/settings/general',
      status: 'ready',
    },
    {
      id: 'seo',
      title: t.admin.settings.seo.title,
      description: t.admin.settings.seo.subtitle || t.admin.settings.seo.title,
      icon: Icons.seo,
      href: '/admin/settings/seo',
      status: 'ready',
    },
    {
      id: 'contact',
      title: t.admin.settings.contact.title,
      description: t.admin.settings.contact.subtitle || t.admin.settings.contact.title,
      icon: Icons.contact,
      href: '/admin/settings/contact',
      status: 'ready',
    },
    {
      id: 'social',
      title: t.admin.settings.social.title,
      description: t.admin.settings.social.subtitle || t.admin.settings.social.title,
      icon: Icons.social,
      href: '/admin/settings/social',
      status: 'ready',
    },
    {
      id: 'languages',
      title: t.admin.settings.languages.title,
      description: t.admin.settings.languages.subtitle,
      icon: Icons.languages,
      href: '/admin/settings/languages',
      status: 'ready',
    },
    {
      id: 'navigation',
      title: t.admin.settings.navigation.title,
      description: t.admin.settings.navigation.subtitle,
      icon: Icons.navigation,
      href: '/admin/settings/navigation',
      status: 'ready',
    },
    {
      id: 'payments',
      title: t.admin.settings.payments.title,
      description: t.admin.settings.payments.subtitle || t.admin.settings.payments.title,
      icon: Icons.payments,
      href: '/admin/settings/payments',
      status: 'ready',
    },
    {
      id: 'shipping',
      title: t.admin.settings.shipping.title,
      description: t.admin.settings.shipping.subtitle || 'إعداد مناطق ورسوم الشحن',
      icon: Icons.shipping,
      href: '/admin/settings/shipping',
      status: 'ready',
    },
  ]
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
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// =============================================================================
// Main Component
// =============================================================================

export default function SettingsIndexPage() {
  const { t } = useLanguage()
  const settingsSections = getSettingsSections(t)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-historical-charcoal">{t.admin.settings.title}</h1>
        <p className="text-historical-charcoal/50 mt-1">{t.admin.settings.subtitle}</p>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {settingsSections.map((section) => (
          <motion.div key={section.id} variants={itemVariants}>
            {section.status === 'ready' ? (
              <Link href={section.href} className="block group">
                <div className="
                  relative h-full p-5 rounded-2xl bg-white/80 backdrop-blur-sm 
                  border border-historical-gold/10 shadow-soft
                  hover:shadow-soft-lg hover:border-historical-gold/30
                  transition-all duration-300
                ">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-historical-gold/20 to-historical-gold/5 w-fit mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-historical-gold">{section.icon}</span>
                  </div>
                  <h3 className="font-bold text-historical-charcoal mb-1">{section.title}</h3>
                  <p className="text-sm text-historical-charcoal/50">{section.description}</p>
                </div>
              </Link>
            ) : (
              <div className="
                relative h-full p-5 rounded-2xl bg-white/50 backdrop-blur-sm 
                border border-historical-gold/5 shadow-soft opacity-60
              ">
                <div className="p-3 rounded-xl bg-historical-charcoal/5 w-fit mb-4">
                  <span className="text-historical-charcoal/30">{section.icon}</span>
                </div>
                <h3 className="font-bold text-historical-charcoal/50 mb-1">{section.title}</h3>
                <p className="text-sm text-historical-charcoal/30">{section.description}</p>
                <span className="absolute top-4 left-4 px-2 py-1 rounded-full bg-historical-charcoal/10 text-xs text-historical-charcoal/50">
                  قريباً
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

