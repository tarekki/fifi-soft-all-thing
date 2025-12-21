/**
 * HttpOnly Cookies Management
 * إدارة HttpOnly Cookies
 * 
 * Secure cookie management for JWT tokens
 * إدارة آمنة للكوكيز لرموز JWT
 * 
 * Security Best Practices:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: Only sent over HTTPS (in production)
 * - SameSite: CSRF protection
 * - Path: Restrict cookie scope
 * 
 * أفضل ممارسات الأمان:
 * - HttpOnly: يمنع الوصول من JavaScript (حماية من XSS)
 * - Secure: يُرسل فقط عبر HTTPS (في الإنتاج)
 * - SameSite: حماية من CSRF
 * - Path: تقييد نطاق الكوكي
 */

import { cookies } from 'next/headers'

/**
 * Cookie names
 * أسماء الكوكيز
 */
const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

/**
 * Cookie options (secure defaults)
 * خيارات الكوكي (افتراضيات آمنة)
 */
const COOKIE_OPTIONS = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  path: '/', // Available site-wide
  maxAge: 60 * 15, // 15 minutes (access token lifetime)
}

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 60 * 60 * 24 * 7, // 7 days (refresh token lifetime)
}

/**
 * Set access token in HttpOnly cookie
 * تعيين رمز الوصول في HttpOnly cookie
 * 
 * @param token - JWT access token
 * 
 * Security: HttpOnly cookie prevents XSS attacks
 * الأمان: HttpOnly cookie يمنع هجمات XSS
 */
export async function setAccessToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, COOKIE_OPTIONS)
}

/**
 * Set refresh token in HttpOnly cookie
 * تعيين رمز التحديث في HttpOnly cookie
 * 
 * @param token - JWT refresh token
 * 
 * Security: HttpOnly cookie prevents XSS attacks
 * الأمان: HttpOnly cookie يمنع هجمات XSS
 */
export async function setRefreshToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, REFRESH_COOKIE_OPTIONS)
}

/**
 * Set both access and refresh tokens
 * تعيين رمزي الوصول والتحديث
 * 
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setAccessToken(accessToken),
    setRefreshToken(refreshToken),
  ])
}

/**
 * Get access token from HttpOnly cookie
 * الحصول على رمز الوصول من HttpOnly cookie
 * 
 * @returns Access token or null
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)
  return token?.value || null
}

/**
 * Get refresh token from HttpOnly cookie
 * الحصول على رمز التحديث من HttpOnly cookie
 * 
 * @returns Refresh token or null
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE)
  return token?.value || null
}

/**
 * Get both tokens
 * الحصول على كلا الرمزين
 * 
 * @returns Object with access and refresh tokens
 */
export async function getTokens(): Promise<{ access: string | null; refresh: string | null }> {
  const [access, refresh] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ])

  return { access, refresh }
}

/**
 * Remove access token (logout)
 * إزالة رمز الوصول (تسجيل خروج)
 */
export async function removeAccessToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
}

/**
 * Remove refresh token (logout)
 * إزالة رمز التحديث (تسجيل خروج)
 */
export async function removeRefreshToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

/**
 * Remove all tokens (logout)
 * إزالة جميع الرموز (تسجيل خروج)
 */
export async function removeAllTokens(): Promise<void> {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
  ])
}

