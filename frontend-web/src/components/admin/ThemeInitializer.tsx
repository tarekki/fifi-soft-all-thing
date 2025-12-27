'use client'

/**
 * Theme Initializer
 * مهيئ المظهر
 * 
 * Initializes theme on app load from localStorage or system preference
 * تهيئة المظهر عند تحميل التطبيق من localStorage أو تفضيلات النظام
 */

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function ThemeInitializer() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    // Initialize theme on mount
    // تهيئة المظهر عند التحميل
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        // Load theme from localStorage if available
        // تحميل المظهر من localStorage إذا كان متاحاً
        const savedTheme = localStorage.getItem('ui-store-theme') || 'light'
        
        // Apply theme immediately to prevent flash
        // تطبيق المظهر فوراً لمنع الوميض
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (savedTheme === 'light') {
          document.documentElement.classList.remove('dark')
        } else if (savedTheme === 'system') {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        
        // Set theme in store
        // تعيين المظهر في المتجر
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setTheme(savedTheme as 'light' | 'dark' | 'system')
        }
      } catch (e) {
        console.warn('Failed to load theme from localStorage:', e)
        // Default to light theme
        document.documentElement.classList.remove('dark')
        setTheme('light')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system theme changes when theme is 'system'
  // الاستماع لتغييرات مظهر النظام عندما يكون المظهر 'system'
  useEffect(() => {
    if (typeof window !== 'undefined' && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      // Set initial value
      // تعيين القيمة الأولية
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return null
}

