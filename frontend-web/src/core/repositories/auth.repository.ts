/**
 * Auth Repository Implementation
 * تنفيذ مستودع المصادقة
 * 
 * Implements AuthPort interface using Authenticated API Client
 * ينفذ واجهة AuthPort باستخدام عميل API المصادق عليه
 * 
 * This repository acts as an adapter between the Core Layer (Services)
 * and the Data Layer (API Clients)
 * 
 * هذا المستودع يعمل كـ adapter بين طبقة Core (Services)
 * وطبقة Data (API Clients)
 * 
 * Architecture:
 * Service → Repository (Port) → API Client → Backend
 * 
 * البنية المعمارية:
 * Service → Repository (Port) → API Client → Backend
 * 
 * Security:
 * - Registration and login are public (no auth required)
 * - Profile operations require authentication (JWT token)
 * - Tokens are managed by API Client (HttpOnly cookies)
 * 
 * الأمان:
 * - التسجيل وتسجيل الدخول عامان (لا يتطلبان المصادقة)
 * - عمليات الملف الشخصي تتطلب المصادقة (رمز JWT)
 * - الرموز يتم إدارتها بواسطة عميل API (HttpOnly cookies)
 */

import type { AuthPort } from '../ports/auth.port'
import type { User, AuthTokens } from '@/types/user'
import type { ApiResponse } from '@/types/api'

/**
 * Auth Repository
 * مستودع المصادقة
 * 
 * Implements AuthPort interface
 * Uses Authenticated API Client for auth operations
 * 
 * ينفذ واجهة AuthPort
 * يستخدم عميل API المصادق عليه لعمليات المصادقة
 */
export class AuthRepository implements AuthPort {
  /**
   * Register a new user
   * تسجيل مستخدم جديد
   * 
   * @param data - Registration data
   * @returns User and authentication tokens
   * 
   * Security:
   * - Validates email format and uniqueness
   * - Validates phone format and uniqueness
   * - Enforces password strength requirements
   * 
   * Business Logic:
   * - Creates user account
   * - Sends verification email
   * - Returns JWT tokens for immediate login
   * 
   * الأمان:
   * - يتحقق من تنسيق البريد الإلكتروني وعدم التكرار
   * - يتحقق من تنسيق الهاتف وعدم التكرار
   * - يفرض متطلبات قوة كلمة المرور
   * 
   * منطق العمل:
   * - ينشئ حساب مستخدم
   * - يرسل بريد التحقق
   * - يعيد رموز JWT لتسجيل الدخول الفوري
   */
  async register(data: {
    email: string
    phone: string
    full_name: string
    password: string
    role?: string
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

      // Clean full_name (optional field)
      // تنظيف full_name (حقل اختياري)
      data.full_name = data.full_name?.trim() || ''

      if (!data.password || data.password.length === 0) {
        throw new Error('Password is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ user: User; tokens: AuthTokens }> = await authApi.register({
        email: data.email.trim(),
        phone: data.phone.trim(),
        full_name: data.full_name,
        password: data.password,
        password_confirm: data.password, // API requires password_confirm
        role: (data.role as 'customer' | 'vendor' | 'admin') || 'customer',
      })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed')
      }

      return response.data
    } catch (error) {
      console.error('Error in AuthRepository.register:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to register user: Unknown error')
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
   * - Tokens are stored in HttpOnly cookies by API Client
   * 
   * Business Logic:
   * - Checks if user is active
   * - Checks if email is verified (if verification is required)
   * 
   * الأمان:
   * - يتحقق من بيانات الاعتماد
   * - يعيد رموز JWT (access + refresh)
   * - الرموز مخزنة في HttpOnly cookies بواسطة عميل API
   * 
   * منطق العمل:
   * - يتحقق من إذا كان المستخدم نشطاً
   * - يتحقق من إذا كان البريد الإلكتروني مؤكداً (إذا كان التحقق مطلوباً)
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      if (!email || email.trim().length === 0) {
        throw new Error('Email is required')
      }

      if (!password || password.length === 0) {
        throw new Error('Password is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ user: User; tokens: AuthTokens }> = await authApi.login(
        email.trim(),
        password
      )

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed')
      }

      return response.data
    } catch (error) {
      console.error('Error in AuthRepository.login:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to login: Unknown error')
    }
  }

  /**
   * Refresh access token
   * تجديد رمز الوصول
   * 
   * @param refreshToken - Refresh token
   * @returns New access and refresh tokens
   * 
   * Security:
   * - Validates refresh token
   * - Returns new tokens
   * - Old refresh token is invalidated (if token rotation is enabled)
   * 
   * الأمان:
   * - يتحقق من رمز التحديث
   * - يعيد رموز جديدة
   * - رمز التحديث القديم يُبطل (إذا كان تدوير الرموز مفعلاً)
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (!refreshToken || refreshToken.length === 0) {
        throw new Error('Refresh token is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<AuthTokens> = await authApi.refreshToken(refreshToken)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to refresh token')
      }

      return response.data
    } catch (error) {
      console.error('Error in AuthRepository.refreshToken:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to refresh token: Unknown error')
    }
  }

  /**
   * Get current user from token
   * الحصول على المستخدم الحالي من الرمز
   * 
   * @param accessToken - Access token (not used, API Client gets it from cookies)
   * @returns Current user
   * 
   * Security:
   * - Requires authentication (JWT token from HttpOnly cookies)
   * - Token is automatically retrieved by API Client
   * 
   * Note: The accessToken parameter is kept for interface compatibility,
   * but the API Client automatically uses the token from cookies
   * 
   * الأمان:
   * - يتطلب المصادقة (رمز JWT من HttpOnly cookies)
   * - الرمز يتم استرجاعه تلقائياً بواسطة عميل API
   * 
   * ملاحظة: معامل accessToken محفوظ لتوافق الواجهة،
   * لكن عميل API يستخدم الرمز تلقائياً من الكوكيز
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    try {
      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client (token is automatically retrieved from cookies)
      // استدعاء عميل API المصادقة (الرمز يتم استرجاعه تلقائياً من الكوكيز)
      const response: ApiResponse<User & { profile?: import('@/types/user').UserProfile }> = 
        await authApi.getCurrentUser()

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get current user')
      }

      // Return user without profile (for interface compatibility)
      // إرجاع المستخدم بدون الملف الشخصي (لتوافق الواجهة)
      const { profile, ...user } = response.data
      return user
    } catch (error) {
      console.error('Error in AuthRepository.getCurrentUser:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to get current user: Unknown error')
    }
  }

  /**
   * Verify email address
   * التحقق من البريد الإلكتروني
   * 
   * @param token - Verification token
   * @returns Success status
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
  async verifyEmail(token: string): Promise<boolean> {
    try {
      if (!token || token.length === 0) {
        throw new Error('Verification token is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ message: string }> = await authApi.verifyEmail(token)

      if (!response.success) {
        throw new Error(response.message || 'Email verification failed')
      }

      return true
    } catch (error) {
      console.error('Error in AuthRepository.verifyEmail:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to verify email: Unknown error')
    }
  }

  /**
   * Resend verification email
   * إعادة إرسال بريد التحقق
   * 
   * @param email - User email
   * @returns Success status
   * 
   * Security:
   * - Requires authentication (if email not provided)
   * - Rate limiting applies (prevents spam)
   * 
   * الأمان:
   * - يتطلب المصادقة (إذا لم يتم توفير البريد الإلكتروني)
   * - يطبق تحديد المعدل (يمنع البريد المزعج)
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      if (!email || email.trim().length === 0) {
        throw new Error('Email is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ message: string }> = await authApi.resendVerification(email.trim())

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend verification email')
      }

      return true
    } catch (error) {
      console.error('Error in AuthRepository.resendVerificationEmail:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to resend verification email: Unknown error')
    }
  }

  /**
   * Change user password
   * تغيير كلمة مرور المستخدم
   * 
   * @param userId - User ID (not used, API Client uses current user from token)
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @returns Success status
   * 
   * Security:
   * - Requires authentication
   * - Validates current password
   * - Enforces password strength rules
   * 
   * Note: The userId parameter is kept for interface compatibility,
   * but the API Client automatically uses the current user from token
   * 
   * الأمان:
   * - يتطلب المصادقة
   * - يتحقق من كلمة المرور الحالية
   * - يفرض قواعد قوة كلمة المرور
   * 
   * ملاحظة: معامل userId محفوظ لتوافق الواجهة،
   * لكن عميل API يستخدم المستخدم الحالي تلقائياً من الرمز
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      if (!oldPassword || oldPassword.length === 0) {
        throw new Error('Current password is required')
      }

      if (!newPassword || newPassword.length === 0) {
        throw new Error('New password is required')
      }

      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ message: string }> = await authApi.changePassword({
        current_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword, // API requires password confirmation
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password')
      }

      return true
    } catch (error) {
      console.error('Error in AuthRepository.changePassword:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to change password: Unknown error')
    }
  }

  /**
   * Logout user (invalidate refresh token)
   * تسجيل خروج المستخدم (إبطال رمز التحديث)
   * 
   * @param refreshToken - Refresh token to invalidate
   * @returns Success status
   * 
   * Security:
   * - Invalidates refresh token (blacklist)
   * - Removes tokens from HttpOnly cookies
   * 
   * Note: If backend supports token blacklisting, this will invalidate the token
   * Otherwise, logout is handled client-side (removing cookies)
   * 
   * الأمان:
   * - يبطل رمز التحديث (قائمة سوداء)
   * - يزيل الرموز من HttpOnly cookies
   * 
   * ملاحظة: إذا كان الخادم يدعم إبطال الرموز، سيتم إبطال الرمز
   * وإلا، يتم التعامل مع تسجيل الخروج على جانب العميل (إزالة الكوكيز)
   */
  async logout(refreshToken: string): Promise<boolean> {
    try {
      // Import Authenticated API Client dynamically
      // استيراد عميل API المصادق عليه ديناميكياً
      const authApi = await import('@/lib/api/authenticated/auth')
      
      // Call Auth API Client
      // استدعاء عميل API المصادقة
      const response: ApiResponse<{ message: string }> = await authApi.logout()

      // Logout is successful if no error is thrown
      // تسجيل الخروج ناجح إذا لم يتم رمي خطأ
      return true
    } catch (error) {
      console.error('Error in AuthRepository.logout:', error)
      
      // Even if API call fails, logout is considered successful
      // (tokens are removed from cookies)
      // حتى لو فشلت استدعاء API، تسجيل الخروج يعتبر ناجحاً
      // (الرموز تم إزالتها من الكوكيز)
      return true
    }
  }
}

