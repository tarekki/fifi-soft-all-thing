'use client'

/**
 * Vendor Auth Context
 * سياق مصادقة البائع
 * 
 * هذا الملف يوفر Context و Provider لإدارة حالة مصادقة البائع.
 * This file provides Context and Provider for managing vendor auth state.
 * 
 * Features:
 * - Login/Logout functionality
 * - Auto session restore on mount
 * - Vendor information management
 * - Loading and error states
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { useRouter } from 'next/navigation'
import type { VendorLoginCredentials, VendorLoginResponse } from './types'
import {
  vendorLogin,
  vendorLogout,
  vendorFetch,
  getAccessToken,
} from './api'

// =============================================================================
// Types
// الأنواع
// =============================================================================

export interface VendorUser {
  id: number
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
}

export interface Vendor {
  id: number
  name: string
  slug: string
  description: string
  logo: string | null
  commission_rate: string
  is_active: boolean
}

export interface VendorUserInfo {
  id: number
  is_owner: boolean
  permissions: Record<string, any>
}

export interface VendorAuthState {
  user: VendorUser | null
  vendor: Vendor | null
  vendorUser: VendorUserInfo | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface VendorAuthContextType extends VendorAuthState {
  // Actions
  // العمليات
  login: (credentials: VendorLoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

// =============================================================================
// Context Creation
// إنشاء السياق
// =============================================================================

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined)

// =============================================================================
// Provider Component
// مكون المزود
// =============================================================================

interface VendorAuthProviderProps {
  children: React.ReactNode
}

export function VendorAuthProvider({ children }: VendorAuthProviderProps) {
  // State
  // الحالة
  const [user, setUser] = useState<VendorUser | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [vendorUser, setVendorUser] = useState<VendorUserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // =================================================================
  // Computed Values
  // القيم المحسوبة
  // =================================================================

  const isAuthenticated = useMemo(() => !!user && !!vendor, [user, vendor])

  // =================================================================
  // Get Current Vendor Info
  // الحصول على معلومات البائع الحالي
  // =================================================================

  const getVendorMe = useCallback(async () => {
    try {
      const response = await vendorFetch<{
        user: VendorUser
        vendor: Vendor
        vendor_user: VendorUserInfo
      }>('/auth/me/')

      if (response.success && response.data) {
        setUser(response.data.user)
        setVendor(response.data.vendor)
        setVendorUser(response.data.vendor_user)
        setError(null)
        return true
      } else {
        setUser(null)
        setVendor(null)
        setVendorUser(null)
        setError(response.message || 'Failed to get vendor info')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setUser(null)
      setVendor(null)
      setVendorUser(null)
      return false
    }
  }, [])

  // =================================================================
  // Restore Session on Mount
  // استعادة الجلسة عند التحميل
  // =================================================================

  useEffect(() => {
    const restoreSession = async () => {
      // Check if we have a token
      // التحقق من وجود توكن
      const token = getAccessToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Try to get current vendor info
        // محاولة الحصول على معلومات البائع الحالي
        await getVendorMe()
      } catch (err) {
        // Session expired or invalid
        // الجلسة منتهية أو غير صالحة
        setUser(null)
        setVendor(null)
        setVendorUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [getVendorMe])

  // =================================================================
  // Login
  // تسجيل الدخول
  // =================================================================

  const login = useCallback(async (credentials: VendorLoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await vendorLogin(credentials)

      if (response.success && response.data) {
        setUser(response.data.user)
        setVendor(response.data.vendor)
        setVendorUser(response.data.vendor_user)
        setError(null)
        return true
      } else {
        setError(response.message || 'Login failed')
        setUser(null)
        setVendor(null)
        setVendorUser(null)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      setUser(null)
      setVendor(null)
      setVendorUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // =================================================================
  // Logout
  // تسجيل الخروج
  // =================================================================

  const logout = useCallback(async () => {
    try {
      await vendorLogout()
    } catch (err) {
      // Ignore logout errors
      // تجاهل أخطاء تسجيل الخروج
    } finally {
      setUser(null)
      setVendor(null)
      setVendorUser(null)
      setError(null)
      router.push('/vendor/login')
    }
  }, [router])

  // =================================================================
  // Refresh User
  // تحديث معلومات المستخدم
  // =================================================================

  const refreshUser = useCallback(async () => {
    await getVendorMe()
  }, [getVendorMe])

  // =================================================================
  // Context Value
  // قيمة السياق
  // =================================================================

  const value: VendorAuthContextType = useMemo(
    () => ({
      user,
      vendor,
      vendorUser,
      isLoading,
      error,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }),
    [user, vendor, vendorUser, isLoading, error, isAuthenticated, login, logout, refreshUser]
  )

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>
}

// =============================================================================
// Hook
// الهوك
// =============================================================================

export function useVendorAuth(): VendorAuthContextType {
  const context = useContext(VendorAuthContext)

  if (context === undefined) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider')
  }

  return context
}

// =============================================================================
// Protected Route Component
// مكون الطريق المحمي
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component to protect routes that require vendor authentication
 * مكون لحماية الطرق التي تتطلب مصادقة البائع
 * 
 * @param children - Content to render if authorized
 * @param fallback - Content to show while loading
 */
export function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useVendorAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/vendor/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  // عرض حالة التحميل
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-historical-stone dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-historical-gold/30 border-t-historical-gold dark:border-yellow-500/30 dark:border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-historical-charcoal/50 dark:text-gray-400 text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  // إعادة التوجيه إذا لم يكن مسجل دخول
  if (!isAuthenticated) {
    return null
  }

  // Render protected content
  // عرض المحتوى المحمي
  return <>{children}</>
}

