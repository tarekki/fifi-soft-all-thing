/**
 * useAuth Hook
 * Hook للمصادقة
 * 
 * Custom hook for authentication state and operations
 * Hook مخصص لحالة المصادقة والعمليات
 * 
 * Features:
 * - Get current user
 * - Check authentication status
 * - Login, register, logout operations
 * - Token refresh
 * 
 * المميزات:
 * - الحصول على المستخدم الحالي
 * - التحقق من حالة المصادقة
 * - عمليات تسجيل الدخول، التسجيل، تسجيل الخروج
 * - تجديد الرمز
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import * as authActions from '@/lib/actions/auth.actions'
import { getCurrentUser } from '@/lib/auth/session'
import type { User, AuthTokens } from '@/types/user'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    phone: string
    full_name: string
    password: string
    password_confirm: string
    role?: 'customer' | 'vendor' | 'admin'
  }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

/**
 * useAuth Hook
 * 
 * @returns Authentication state and operations
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load current user on mount
  // تحميل المستخدم الحالي عند التحميل
  useEffect(() => {
    loadUser()
  }, [])

  /**
   * Load current user from session
   * تحميل المستخدم الحالي من الجلسة
   */
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login user
   * تسجيل دخول المستخدم
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await authActions.loginAction(email, password)
      setUser(result.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Register new user
   * تسجيل مستخدم جديد
   */
  const register = useCallback(async (data: {
    email: string
    phone: string
    full_name: string
    password: string
    password_confirm: string
    role?: 'customer' | 'vendor' | 'admin'
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await authActions.registerAction(data)
      setUser(result.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Logout user
   * تسجيل خروج المستخدم
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      await authActions.logoutAction()
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Refresh authentication state
   * تحديث حالة المصادقة
   */
  const refresh = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    error,
    login,
    register,
    logout,
    refresh,
    clearError,
  }
}

