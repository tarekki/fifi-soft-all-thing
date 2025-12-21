/**
 * Auth Server Actions
 * إجراءات الخادم للمصادقة
 * 
 * Server Actions for authentication and user management
 * These actions run on the server and use the Auth API Client
 * 
 * إجراءات الخادم للمصادقة وإدارة المستخدمين
 * هذه الإجراءات تعمل على الخادم وتستخدم عميل API المصادقة
 * 
 * Security:
 * - Tokens are stored in HttpOnly cookies (XSS protection)
 * - Automatic token refresh on expiration
 * - Password validation and strength requirements
 * 
 * الأمان:
 * - الرموز مخزنة في HttpOnly cookies (حماية من XSS)
 * - تجديد الرمز تلقائياً عند انتهاء الصلاحية
 * - التحقق من كلمة المرور ومتطلبات القوة
 */

'use server'

import * as authApi from '@/lib/api/authenticated/auth'
import { setTokens, removeAllTokens, getRefreshToken } from '@/lib/auth/cookies'
import type { User, AuthTokens } from '@/types/user'
import type { ApiResponse } from '@/types/api'

/**
 * Register a new user
 * تسجيل مستخدم جديد
 * 
 * @param data - Registration data (email, phone, password, etc.)
 * @returns User and authentication tokens
 * 
 * Security: 
 * - Validates email format and uniqueness
 * - Validates phone format and uniqueness
 * - Enforces password strength requirements
 * - Checks password confirmation match
 * 
 * Business Logic: 
 * - Creates user account
 * - Sends verification email
 * - Returns JWT tokens for immediate login
 * - Stores tokens in HttpOnly cookies
 * 
 * الأمان:
 * - يتحقق من تنسيق البريد الإلكتروني وعدم التكرار
 * - يتحقق من تنسيق الهاتف وعدم التكرار
 * - يفرض متطلبات قوة كلمة المرور
 * - يتحقق من تطابق تأكيد كلمة المرور
 * 
 * منطق العمل:
 * - ينشئ حساب مستخدم
 * - يرسل بريد التحقق
 * - يعيد رموز JWT لتسجيل الدخول الفوري
 * - يخزن الرموز في HttpOnly cookies
 */
export async function registerAction(data: {
  email: string
  phone: string
  full_name: string
  password: string
  password_confirm: string
  role?: 'customer' | 'vendor' | 'admin'
}): Promise<{ user: User; tokens: AuthTokens }> {
  try {
    // Validate input
    // التحقق من الإدخال
    if (!data.email || data.email.trim().length === 0) {
      throw new Error('Email is required')
    }

    if (!data.phone || data.phone.trim().length === 0) {
      throw new Error('Phone is required')
    }

    if (!data.full_name || data.full_name.trim().length === 0) {
      throw new Error('Full name is required')
    }

    if (!data.password || data.password.length === 0) {
      throw new Error('Password is required')
    }

    if (data.password !== data.password_confirm) {
      throw new Error('Passwords do not match')
    }

    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<{ user: User; tokens: AuthTokens }> = await authApi.register({
      email: data.email.trim(),
      phone: data.phone.trim(),
      full_name: data.full_name.trim(),
      password: data.password,
      password_confirm: data.password_confirm,
      role: data.role || 'customer',
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed')
    }

    // Store tokens in HttpOnly cookies
    // تخزين الرموز في HttpOnly cookies
    await setTokens(response.data.tokens.access, response.data.tokens.refresh)

    return response.data
  } catch (error) {
    console.error('Error in registerAction:', error)
    throw error
  }
}

/**
 * Login user
 * تسجيل دخول المستخدم
 * 
 * @param email - User email
 * @param password - User password
 * @returns User and authentication tokens
 * 
 * Security: 
 * - Validates credentials
 * - Returns JWT tokens (access + refresh)
 * - Stores tokens in HttpOnly cookies
 * 
 * Business Logic: 
 * - Checks if user is active
 * - Checks if email is verified (if verification is required)
 * 
 * الأمان:
 * - يتحقق من بيانات الاعتماد
 * - يعيد رموز JWT (access + refresh)
 * - يخزن الرموز في HttpOnly cookies
 * 
 * منطق العمل:
 * - يتحقق من إذا كان المستخدم نشطاً
 * - يتحقق من إذا كان البريد الإلكتروني مؤكداً (إذا كان التحقق مطلوباً)
 */
export async function loginAction(
  email: string,
  password: string
): Promise<{ user: User; tokens: AuthTokens }> {
  try {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required')
    }

    if (!password || password.length === 0) {
      throw new Error('Password is required')
    }

    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<{ user: User; tokens: AuthTokens }> = await authApi.login(
      email.trim(),
      password
    )

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed')
    }

    // Store tokens in HttpOnly cookies
    // تخزين الرموز في HttpOnly cookies
    await setTokens(response.data.tokens.access, response.data.tokens.refresh)

    return response.data
  } catch (error) {
    console.error('Error in loginAction:', error)
    throw error
  }
}

/**
 * Refresh access token
 * تجديد رمز الوصول
 * 
 * @param refreshToken - Refresh token (optional, will get from cookies if not provided)
 * @returns New access and refresh tokens
 * 
 * Security: 
 * - Validates refresh token
 * - Returns new tokens
 * - Old refresh token is invalidated (if token rotation is enabled)
 * - Stores new tokens in HttpOnly cookies
 * 
 * الأمان:
 * - يتحقق من رمز التحديث
 * - يعيد رموز جديدة
 * - رمز التحديث القديم يُبطل (إذا كان تدوير الرموز مفعلاً)
 * - يخزن الرموز الجديدة في HttpOnly cookies
 */
export async function refreshTokenAction(refreshToken?: string): Promise<AuthTokens> {
  try {
    // Get refresh token from cookies if not provided
    // الحصول على رمز التحديث من الكوكيز إذا لم يتم توفيره
    const token = refreshToken || (await getRefreshToken())
    
    if (!token || token.length === 0) {
      throw new Error('Refresh token is required')
    }

    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<AuthTokens> = await authApi.refreshToken(token)

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to refresh token')
    }

    // Store new tokens in HttpOnly cookies
    // تخزين الرموز الجديدة في HttpOnly cookies
    await setTokens(response.data.access, response.data.refresh)

    return response.data
  } catch (error) {
    console.error('Error in refreshTokenAction:', error)
    throw error
  }
}

/**
 * Get current authenticated user
 * الحصول على المستخدم الحالي المصادق عليه
 * 
 * @returns Current user with profile
 * 
 * Security: 
 * - Requires authentication (JWT token from cookies)
 * - Returns user data based on token
 * 
 * الأمان:
 * - يتطلب المصادقة (رمز JWT من الكوكيز)
 * - يعيد بيانات المستخدم بناءً على الرمز
 */
export async function getCurrentUserAction(): Promise<User & { profile?: import('@/types/user').UserProfile }> {
  try {
    // Call Auth API Client
    // استدعاء عميل API المصادقة
    // The API client automatically uses JWT token from HttpOnly cookies
    // عميل API يستخدم تلقائياً رمز JWT من HttpOnly cookies
    const response: ApiResponse<User & { profile?: import('@/types/user').UserProfile }> = 
      await authApi.getCurrentUser()

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get current user')
    }

    return response.data
  } catch (error) {
    console.error('Error in getCurrentUserAction:', error)
    throw error
  }
}

/**
 * Verify email address
 * التحقق من البريد الإلكتروني
 * 
 * @param token - Verification token
 * @returns Success message
 * 
 * Security: 
 * - Validates verification token
 * - Checks token expiration
 * - Marks email as verified
 * 
 * الأمان:
 * - يتحقق من رمز التحقق
 * - يتحقق من انتهاء صلاحية الرمز
 * - يضع علامة على البريد الإلكتروني كمؤكد
 */
export async function verifyEmailAction(token: string): Promise<string> {
  try {
    if (!token || token.length === 0) {
      throw new Error('Verification token is required')
    }

    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<{ message: string }> = await authApi.verifyEmail(token)

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Email verification failed')
    }

    return response.data.message
  } catch (error) {
    console.error('Error in verifyEmailAction:', error)
    throw error
  }
}

/**
 * Resend verification email
 * إعادة إرسال بريد التحقق
 * 
 * @param email - User email (optional, uses current user if not provided)
 * @returns Success message
 * 
 * Security: 
 * - Requires authentication (if email not provided)
 * - Rate limiting applies (prevents spam)
 * 
 * الأمان:
 * - يتطلب المصادقة (إذا لم يتم توفير البريد الإلكتروني)
 * - يطبق تحديد المعدل (يمنع البريد المزعج)
 */
export async function resendVerificationEmailAction(email?: string): Promise<string> {
  try {
    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<{ message: string }> = await authApi.resendVerification(email)

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to resend verification email')
    }

    return response.data.message
  } catch (error) {
    console.error('Error in resendVerificationEmailAction:', error)
    throw error
  }
}

/**
 * Change user password
 * تغيير كلمة مرور المستخدم
 * 
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param newPasswordConfirm - New password confirmation
 * @returns Success message
 * 
 * Security: 
 * - Requires authentication
 * - Validates current password
 * - Enforces password strength rules
 * - Requires password confirmation
 * 
 * Business Logic: 
 * - Applies password validation policies
 * - Prevents reuse of recent passwords (if implemented)
 * 
 * الأمان:
 * - يتطلب المصادقة
 * - يتحقق من كلمة المرور الحالية
 * - يفرض قواعد قوة كلمة المرور
 * - يتطلب تأكيد كلمة المرور
 * 
 * منطق العمل:
 * - يطبق سياسات التحقق من كلمة المرور
 * - يمنع إعادة استخدام كلمات المرور الأخيرة (إذا تم تنفيذها)
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string
): Promise<string> {
  try {
    if (!currentPassword || currentPassword.length === 0) {
      throw new Error('Current password is required')
    }

    if (!newPassword || newPassword.length === 0) {
      throw new Error('New password is required')
    }

    if (newPassword !== newPasswordConfirm) {
      throw new Error('New passwords do not match')
    }

    // Call Auth API Client
    // استدعاء عميل API المصادقة
    const response: ApiResponse<{ message: string }> = await authApi.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to change password')
    }

    return response.data.message
  } catch (error) {
    console.error('Error in changePasswordAction:', error)
    throw error
  }
}

/**
 * Logout user
 * تسجيل خروج المستخدم
 * 
 * @returns Success message
 * 
 * Security: 
 * - Removes tokens from HttpOnly cookies
 * - If backend supports token blacklisting, invalidates tokens
 * 
 * الأمان:
 * - يزيل الرموز من HttpOnly cookies
 * - إذا كان الخادم يدعم إبطال الرموز، يبطل الرموز
 */
export async function logoutAction(): Promise<string> {
  try {
    // Call Auth API Client (if backend has logout endpoint)
    // استدعاء عميل API المصادقة (إذا كان الخادم لديه endpoint تسجيل خروج)
    // For now, logout is handled client-side (removing cookies)
    // حالياً، تسجيل الخروج يتم التعامل معه على جانب العميل (إزالة الكوكيز)
    const response: ApiResponse<{ message: string }> = await authApi.logout()

    // Remove tokens from HttpOnly cookies
    // إزالة الرموز من HttpOnly cookies
    await removeAllTokens()

    return response.data?.message || 'Logged out successfully'
  } catch (error) {
    // Even if API call fails, remove tokens from cookies
    // حتى لو فشلت استدعاء API، أزل الرموز من الكوكيز
    await removeAllTokens()
    
    console.error('Error in logoutAction:', error)
    return 'Logged out successfully'
  }
}

