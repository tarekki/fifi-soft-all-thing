/**
 * UI Store (Zustand)
 * متجر واجهة المستخدم (Zustand)
 * 
 * Global state management for UI state
 * إدارة الحالة العامة لحالة واجهة المستخدم
 * 
 * Features:
 * - Theme (light/dark)
 * - Language (ar/en)
 * - Modal states
 * - Toast notifications
 * - Sidebar states
 * 
 * المميزات:
 * - المظهر (فاتح/داكن)
 * - اللغة (عربي/إنجليزي)
 * - حالات النوافذ المنبثقة
 * - إشعارات Toast
 * - حالات الشريط الجانبي
 */

import { create } from 'zustand'
// Note: persist middleware is available in zustand v4+
// ملاحظة: middleware persist متاح في zustand v4+
// If persist is not available, remove it and use regular create
// إذا لم يكن persist متاحاً، أزله واستخدم create العادي

type Theme = 'light' | 'dark' | 'system'
type Language = 'ar' | 'en'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface UIState {
  theme: Theme
  language: Language
  modals: {
    [key: string]: boolean
  }
  toasts: Toast[]
  sidebar: {
    isOpen: boolean
  }
  isVendorSidebarCollapsed: boolean
}

interface UIActions {
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  closeAllModals: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (toastId: string) => void
  clearToasts: () => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  toggleVendorSidebar: () => void
}

type UIStore = UIState & UIActions

/**
 * UI Store
 * متجر واجهة المستخدم
 * 
 * Global state for UI
 * الحالة العامة لواجهة المستخدم
 */
// Using persist middleware for localStorage persistence
// استخدام middleware persist للاستمرارية في localStorage
// If persist is not available, use: create<UIStore>((set) => ({
// إذا لم يكن persist متاحاً، استخدم: create<UIStore>((set) => ({
export const useUIStore = create<UIStore>((set) => ({
  // State
  // الحالة
  theme: 'system',
  language: 'ar',
  modals: {},
  toasts: [],
  sidebar: {
    isOpen: false,
  },
  isVendorSidebarCollapsed: false,

  // Actions
  // الإجراءات
  setTheme: (theme) => {
    set({ theme })
    // Apply theme to document
    // تطبيق المظهر على المستند
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        // Save to localStorage
        try {
          localStorage.setItem('ui-store-theme', 'dark')
        } catch (e) {
          console.warn('Failed to save theme to localStorage:', e)
        }
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
        // Save to localStorage
        try {
          localStorage.setItem('ui-store-theme', 'light')
        } catch (e) {
          console.warn('Failed to save theme to localStorage:', e)
        }
      } else {
        // System theme
        // مظهر النظام
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        // Save to localStorage
        try {
          localStorage.setItem('ui-store-theme', 'system')
        } catch (e) {
          console.warn('Failed to save theme to localStorage:', e)
        }
      }
    }
  },

  setLanguage: (language) => {
    set({ language })
    // Apply language to document
    // تطبيق اللغة على المستند
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  },

  openModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: true,
      },
    }))
  },

  closeModal: (modalId) => {
    set((state) => {
      const newModals = { ...state.modals }
      delete newModals[modalId]
      return { modals: newModals }
    })
  },

  closeAllModals: () => {
    set({ modals: {} })
  },

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove toast after duration
    // إزالة Toast تلقائياً بعد المدة
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        useUIStore.getState().removeToast(id)
      }, newToast.duration)
    }
  },

  removeToast: (toastId) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebar: {
        isOpen: !state.sidebar.isOpen,
      },
    }))
  },

  setSidebarOpen: (isOpen) => {
    set({
      sidebar: {
        isOpen,
      },
    })
  },

  toggleVendorSidebar: () => {
    set((state) => ({
      isVendorSidebarCollapsed: !state.isVendorSidebarCollapsed,
    }))
  },
})
)

// TODO: Add localStorage persistence if needed
// سيتم إضافة الاستمرارية في localStorage إذا لزم الأمر
// Can use zustand/middleware/persist or manual localStorage sync
// يمكن استخدام zustand/middleware/persist أو مزامنة localStorage يدوياً


