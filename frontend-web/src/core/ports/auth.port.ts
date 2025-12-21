/**
 * Auth Repository Interface
 * واجهة مستودع المصادقة
 * 
 * Defines the contract for authentication data access
 * يعرّف العقد للوصول إلى بيانات المصادقة
 */

import type { User, AuthTokens } from '@/types/user'

export interface AuthPort {
  /**
   * Register a new user
   * تسجيل مستخدم جديد
   */
  register(data: {
    email: string
    phone: string
    full_name: string
    password: string
    role?: string
  }): Promise<{ user: User; tokens: AuthTokens }>

  /**
   * Login user
   * تسجيل دخول المستخدم
   */
  login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }>

  /**
   * Refresh access token
   * تجديد رمز الوصول
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>

  /**
   * Get current user from token
   * الحصول على المستخدم الحالي من الرمز
   */
  getCurrentUser(accessToken: string): Promise<User>

  /**
   * Verify email address
   * التحقق من البريد الإلكتروني
   */
  verifyEmail(token: string): Promise<boolean>

  /**
   * Resend verification email
   * إعادة إرسال بريد التحقق
   */
  resendVerificationEmail(email: string): Promise<boolean>

  /**
   * Change user password
   * تغيير كلمة مرور المستخدم
   */
  changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean>

  /**
   * Logout user (invalidate refresh token)
   * تسجيل خروج المستخدم (إبطال رمز التحديث)
   */
  logout(refreshToken: string): Promise<boolean>
}

