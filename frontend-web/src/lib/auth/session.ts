/**
 * Session Management
 * إدارة الجلسة
 * 
 * Manages user session using HttpOnly cookies
 * يدير جلسة المستخدم باستخدام HttpOnly cookies
 * 
 * Security:
 * - Tokens stored in HttpOnly cookies (XSS protection)
 * - Automatic token refresh
 * - Session validation
 * 
 * الأمان:
 * - الرموز مخزنة في HttpOnly cookies (حماية من XSS)
 * - تجديد الرمز تلقائياً
 * - التحقق من الجلسة
 */

import { getAccessToken, getRefreshToken } from './cookies'
import { getUserFromToken, isTokenExpired, validateToken } from './jwt'
import type { User } from '@/types/user'

/**
 * Get current authenticated user from session
 * الحصول على المستخدم الحالي المصادق عليه من الجلسة
 * 
 * @returns Current user or null if not authenticated
 * 
 * Security: Validates token and extracts user data
 * الأمان: يتحقق من الرمز ويستخرج بيانات المستخدم
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return null
    }

    // Validate token
    if (!validateToken(accessToken, 'access')) {
      return null
    }

    // Check if expired
    if (isTokenExpired(accessToken)) {
      // Try to refresh token
      const refreshed = await refreshSession()
      if (!refreshed) {
        return null
      }
      // Get new token
      const newToken = await getAccessToken()
      if (!newToken) {
        return null
      }
      return getUserFromToken(newToken) as User | null
    }

    // Extract user data from token
    const userData = getUserFromToken(accessToken)
    if (!userData) {
      return null
    }

    // TODO: Fetch full user data from API if needed
    // سيتم جلب بيانات المستخدم الكاملة من API إذا لزم الأمر
    // For now, return data from token
    return userData as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * التحقق من إذا كان المستخدم مصادق عليه
 * 
 * @returns True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Refresh access token using refresh token
 * تجديد رمز الوصول باستخدام رمز التحديث
 * 
 * @returns True if refresh was successful
 * 
 * Security: Validates refresh token before use
 * الأمان: يتحقق من رمز التحديث قبل الاستخدام
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      return false
    }

    // Validate refresh token
    if (!validateToken(refreshToken, 'refresh')) {
      return false
    }

    // TODO: Call refresh token API
    // سيتم استدعاء API تجديد الرمز
    // const { refreshTokenAction } = await import('@/lib/actions/auth.actions')
    // const newTokens = await refreshTokenAction(refreshToken)
    // await setTokens(newTokens.access, newTokens.refresh)

    // For now, return false (not implemented yet)
    return false
  } catch (error) {
    console.error('Error refreshing session:', error)
    return false
  }
}

/**
 * Clear user session (logout)
 * مسح جلسة المستخدم (تسجيل خروج)
 */
export async function clearSession(): Promise<void> {
  const { removeAllTokens } = await import('./cookies')
  await removeAllTokens()
}

