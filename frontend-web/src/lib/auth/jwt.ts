/**
 * JWT Token Handling
 * التعامل مع رموز JWT
 * 
 * Secure JWT token decoding and validation
 * فك تشفير والتحقق من رموز JWT بشكل آمن
 * 
 * Security Notes:
 * - Never store tokens in localStorage (XSS risk)
 * - Use HttpOnly cookies for token storage
 * - Validate token expiration
 * - Never expose sensitive data in token payload
 * 
 * ملاحظات الأمان:
 * - لا تخزن الرموز في localStorage (خطر XSS)
 * - استخدم HttpOnly cookies لتخزين الرموز
 * - تحقق من انتهاء صلاحية الرمز
 * - لا تعرض بيانات حساسة في payload الرمز
 */

import type { User, UserRole } from '@/types/user'

/**
 * JWT Token Payload Structure
 * هيكل payload رمز JWT
 */
export type JWTPayload = {
  user_id: number
  email: string
  role: UserRole
  token_type: 'access' | 'refresh'
  exp: number // Expiration timestamp
  iat: number // Issued at timestamp
}

/**
 * Decode JWT token (without verification)
 * فك تشفير رمز JWT (بدون التحقق)
 * 
 * Note: This only decodes the token, does NOT verify signature
 * For production, token signature should be verified on the server
 * 
 * ملاحظة: هذا يفك التشفير فقط، لا يتحقق من التوقيع
 * للإنتاج، يجب التحقق من توقيع الرمز على الخادم
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || token.length === 0) {
      return null
    }

    // JWT format: header.payload.signature
    // Split token into parts
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode payload (base64url)
    const payload = parts[1]
    
    // Add padding if needed (base64url doesn't require padding, but some decoders do)
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    
    // Decode from base64url
    const decodedPayload = Buffer.from(paddedPayload, 'base64url').toString('utf-8')
    
    // Parse JSON
    const parsed = JSON.parse(decodedPayload) as JWTPayload

    return parsed
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * التحقق من إذا كان رمز JWT منتهي الصلاحية
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) {
    return true
  }

  // Check expiration (exp is in seconds, Date.now() is in milliseconds)
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Get user data from JWT token
 * الحصول على بيانات المستخدم من رمز JWT
 * 
 * @param token - JWT access token
 * @returns User data from token payload
 * 
 * Security: Only extracts data, does NOT verify token signature
 * For production, always verify token on server side
 * 
 * الأمان: يستخرج البيانات فقط، لا يتحقق من توقيع الرمز
 * للإنتاج، تحقق دائماً من الرمز على جانب الخادم
 */
export function getUserFromToken(token: string): Partial<User> | null {
  const payload = decodeJWT(token)
  if (!payload) {
    return null
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    return null
  }

  // Extract user data
  return {
    id: payload.user_id,
    email: payload.email,
    role: payload.role,
  }
}

/**
 * Validate JWT token structure
 * التحقق من هيكل رمز JWT
 * 
 * Checks:
 * - Token format (3 parts separated by dots)
 * - Token is not expired
 * - Token type is 'access' (for access tokens)
 * 
 * التحقق من:
 * - تنسيق الرمز (3 أجزاء مفصولة بنقاط)
 * - الرمز غير منتهي الصلاحية
 * - نوع الرمز هو 'access' (لرموز الوصول)
 */
export function validateToken(token: string, expectedType: 'access' | 'refresh' = 'access'): boolean {
  if (!token || token.length === 0) {
    return false
  }

  const payload = decodeJWT(token)
  if (!payload) {
    return false
  }

  // Check token type
  if (payload.token_type !== expectedType) {
    return false
  }

  // Check expiration
  if (isTokenExpired(token)) {
    return false
  }

  return true
}

