'use client'

/**
 * Admin Auth Context
 * سياق مصادقة الأدمن
 * 
 * هذا الملف يوفر Context و Provider لإدارة حالة مصادقة الأدمن.
 * This file provides Context and Provider for managing admin auth state.
 * 
 * Features:
 * - Login/Logout functionality
 * - Auto session restore on mount
 * - Permission checking
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
import type { AdminUser, AdminLoginCredentials, AdminAuthState } from './types'
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  getAccessToken,
  hasPermission,
  hasAnyPermission,
} from './api'

// =============================================================================
// Context Type
// نوع السياق
// =============================================================================

interface AdminAuthContextType extends AdminAuthState {
  // Actions
  // العمليات
  login: (credentials: AdminLoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>

  // Permission helpers
  // مساعدات الصلاحيات
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean

  // Computed
  // محسوبة
  isSuperAdmin: boolean
  isAdmin: boolean
}

// =============================================================================
// Context Creation
// إنشاء السياق
// =============================================================================

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// =============================================================================
// Provider Component
// مكون المزود
// =============================================================================

interface AdminAuthProviderProps {
  children: React.ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  // State
  // الحالة
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // =================================================================
  // Computed Values
  // القيم المحسوبة
  // =================================================================

  const isAuthenticated = useMemo(() => !!user, [user])
  const isSuperAdmin = useMemo(() => user?.role === 'admin', [user])
  const isAdmin = useMemo(() => {
    const adminRoles: string[] = ['admin', 'content_manager', 'order_manager', 'support']
    return user?.role ? adminRoles.includes(user.role) : false
  }, [user])

  // =================================================================
  // Permission Helpers
  // مساعدات الصلاحيات
  // =================================================================

  const can = useCallback(
    (permission: string) => hasPermission(user, permission),
    [user]
  )

  const canAny = useCallback(
    (permissions: string[]) => hasAnyPermission(user, permissions),
    [user]
  )

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
        // Try to get current user info
        // محاولة الحصول على معلومات المستخدم الحالي
        const response = await getAdminMe()

        if (response.success && response.data) {
          setUser(response.data)
        } else {
          // Invalid token, clear it
          // توكن غير صالح، امسحه
          setUser(null)
        }
      } catch (err) {
        // Session expired or invalid
        // الجلسة منتهية أو غير صالحة
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  // =================================================================
  // Login
  // تسجيل الدخول
  // =================================================================

  const login = useCallback(
    async (credentials: AdminLoginCredentials): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await adminLogin(credentials)

        if (response.success && response.data?.user) {
          setUser(response.data.user)
          return true
        } else {
          setError(response.message || 'فشل تسجيل الدخول')
          return false
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        setError(message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =================================================================
  // Logout
  // تسجيل الخروج
  // =================================================================

  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      await adminLogout()
    } catch {
      // Ignore errors, just clear state
      // تجاهل الأخطاء، فقط امسح الحالة
    } finally {
      setUser(null)
      setError(null)
      setIsLoading(false)

      // Redirect to login page
      // إعادة التوجيه لصفحة الدخول
      router.push('/admin/login')
    }
  }, [router])

  // =================================================================
  // Refresh User
  // تحديث بيانات المستخدم
  // =================================================================

  const refreshUser = useCallback(async () => {
    try {
      const response = await getAdminMe()

      if (response.success && response.data) {
        // Force update by creating a new object reference
        // فرض التحديث عن طريق إنشاء مرجع كائن جديد
        setUser({ ...response.data })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Ignore errors but log them
    }
  }, [])

  // =================================================================
  // Context Value
  // قيمة السياق
  // =================================================================

  const value = useMemo<AdminAuthContextType>(
    () => ({
      // State
      user,
      isAuthenticated,
      isLoading,
      error,

      // Actions
      login,
      logout,
      refreshUser,

      // Permission helpers
      can,
      canAny,

      // Computed
      isSuperAdmin,
      isAdmin,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      refreshUser,
      can,
      canAny,
      isSuperAdmin,
      isAdmin,
    ]
  )

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// =============================================================================
// Hook
// الـ Hook
// =============================================================================

/**
 * Hook to access admin auth context
 * Hook للوصول لسياق مصادقة الأدمن
 * 
 * @throws Error if used outside AdminAuthProvider
 */
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext)

  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }

  return context
}

// =============================================================================
// Protected Route Component
// مكون الطريق المحمي
// =============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

/**
 * Component to protect routes that require authentication
 * مكون لحماية الطرق التي تتطلب المصادقة
 * 
 * @param children - Content to render if authorized
 * @param permission - Single permission required
 * @param permissions - Multiple permissions (any or all based on requireAll)
 * @param requireAll - If true, user must have all permissions
 * @param fallback - Content to show while loading
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, can, canAny } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  // عرض حالة التحميل
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-historical-stone">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-historical-gold/30 border-t-historical-gold rounded-full animate-spin" />
          <p className="text-historical-charcoal/50 text-sm">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  // غير مصادق عليه
  if (!isAuthenticated) {
    return null
  }

  // Check specific permission
  // التحقق من صلاحية معينة
  if (permission && !can(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-historical-stone">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-historical-charcoal mb-2">
            غير مصرح
          </h1>
          <p className="text-historical-charcoal/50">
            ليس لديك صلاحية للوصول لهذه الصفحة
          </p>
        </div>
      </div>
    )
  }

  // Check multiple permissions
  // التحقق من صلاحيات متعددة
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(p => can(p))
      : canAny(permissions)

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-historical-stone">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-historical-charcoal mb-2">
              غير مصرح
            </h1>
            <p className="text-historical-charcoal/50">
              ليس لديك صلاحية للوصول لهذه الصفحة
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

