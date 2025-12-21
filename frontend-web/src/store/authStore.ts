/**
 * Auth Store (Zustand)
 * متجر المصادقة (Zustand)
 * 
 * Global state management for authentication
 * إدارة الحالة العامة للمصادقة
 * 
 * Features:
 * - User state
 * - Authentication status
 * - Token management (references only, actual tokens in HttpOnly cookies)
 * - Login/logout actions
 * 
 * المميزات:
 * - حالة المستخدم
 * - حالة المصادقة
 * - إدارة الرموز (مراجع فقط، الرموز الفعلية في HttpOnly cookies)
 * - إجراءات تسجيل الدخول/تسجيل الخروج
 * 
 * Security:
 * - Tokens are stored in HttpOnly cookies (not in store)
 * - Store only contains user data and auth status
 * - All token operations go through auth actions
 * 
 * الأمان:
 * - الرموز مخزنة في HttpOnly cookies (ليس في المتجر)
 * - المتجر يحتوي فقط على بيانات المستخدم وحالة المصادقة
 * - جميع عمليات الرموز تتم من خلال إجراءات المصادقة
 */

import { create } from 'zustand'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  logout: () => void
}

type AuthStore = AuthState & AuthActions

/**
 * Auth Store
 * متجر المصادقة
 * 
 * Global state for authentication
 * الحالة العامة للمصادقة
 */
export const useAuthStore = create<AuthStore>((set) => ({
  // State
  // الحالة
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  // الإجراءات
  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  clearError: () =>
    set({
      error: null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),
}))

