'use client';

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLanguage } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { Search, Bell, Menu, ExternalLink, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { VendorNotificationDropdown } from './VendorNotificationDropdown';
import { motion } from 'framer-motion';

// =============================================================================
// Theme Toggle Component
// =============================================================================

function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const { language } = useLanguage()

  // Determine if dark mode is active
  const isDark = theme === 'dark' || (
    theme === 'system' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  const toggleTheme = useCallback(() => {
    const newTheme = (theme === 'light' || theme === 'system') ? 'dark' : 'light'
    setTheme(newTheme)

    // Apply theme immediately to document
    if (typeof window !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, setTheme])

  // Apply theme when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? (language === 'ar' ? 'التبديل إلى الوضع الفاتح' : 'Switch to light mode') : (language === 'ar' ? 'التبديل إلى الوضع الداكن' : 'Switch to dark mode')}
    >
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-gray-500 dark:text-gray-400 group-hover:text-historical-charcoal dark:group-hover:text-gray-200 transition-colors"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.div>
    </button>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export const VendorTopBar = () => {
    const { t, dir } = useTranslation();
    const pathname = usePathname();
    const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleVendorSidebar);

    // Get current page title from pathname
    const getPageTitle = () => {
        const parts = pathname.split('/');
        const lastPart = parts[parts.length - 1];
        // Special case for root vendor path or dashboard
        if (lastPart === 'vendor' || lastPart === 'dashboard') return t.vendor.dashboard;
        return t.vendor[lastPart as keyof typeof t.vendor] || lastPart;
    };

    return (
        <header
            className="sticky top-0 z-40 flex items-center h-20 px-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 transition-all duration-500 ease-in-out"
        >
            <div className="flex items-center justify-between w-full">
                {/* Left: Title & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => toggleSidebar()}
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-historical-charcoal dark:text-gray-100 tracking-tight transition-colors duration-300">
                            {getPageTitle()}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 transition-colors duration-300">
                            <span>{t.common.appName}</span>
                            <span className="opacity-30">/</span>
                            <span className="text-historical-gold dark:text-yellow-400 transition-colors duration-300">{getPageTitle()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* View Website */}
                    <a
                        href="/"
                        target="_blank"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t.vendor.viewStore}
                    </a>

                    <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden sm:block transition-colors duration-300" />

                    {/* Language Toggle */}
                    <div className="scale-90 flex-shrink-0">
                        <LanguageToggle />
                    </div>

                    <div className="h-8 w-[1px] bg-gray-100 dark:bg-gray-700 hidden sm:block transition-colors duration-300" />

                    {/* Notifications */}
                    <VendorNotificationDropdown />

                    {/* Theme Toggle */}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};
