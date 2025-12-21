/**
 * Auth Service
 * خدمة المصادقة
 * 
 * Business logic for authentication
 * منطق العمل للمصادقة
 */

import { UserPolicy } from '../domain/user/user.policy'
import type { AuthPort } from '../ports/auth.port'
import type { User, AuthTokens } from '@/types/user'

export class AuthService {
  constructor(private authPort: AuthPort) {}

  /**
   * Register a new user
   * تسجيل مستخدم جديد
   */
  async register(data: {
    email: string
    phone: string
    full_name: string
    password: string
    password_confirm: string
    role?: string
  }): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate email
    if (!UserPolicy.validateEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Validate phone
    if (!UserPolicy.validatePhone(data.phone)) {
      throw new Error('Invalid phone number format')
    }

    // Validate password
    const passwordValidation = UserPolicy.validatePassword(data.password)
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors?.join(', ')}`)
    }

    // Check password confirmation
    if (data.password !== data.password_confirm) {
      throw new Error('Passwords do not match')
    }

    // Register user
    return this.authPort.register({
      email: data.email,
      phone: data.phone,
      full_name: data.full_name,
      password: data.password,
      role: data.role || 'customer',
    })
  }

  /**
   * Login user
   * تسجيل دخول المستخدم
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate email
    if (!UserPolicy.validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Validate password is provided
    if (!password || password.length === 0) {
      throw new Error('Password is required')
    }

    // Login
    return this.authPort.login(email, password)
  }

  /**
   * Refresh access token
   * تجديد رمز الوصول
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken || refreshToken.length === 0) {
      throw new Error('Refresh token is required')
    }

    return this.authPort.refreshToken(refreshToken)
  }

  /**
   * Get current user
   * الحصول على المستخدم الحالي
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    if (!accessToken || accessToken.length === 0) {
      throw new Error('Access token is required')
    }

    return this.authPort.getCurrentUser(accessToken)
  }

  /**
   * Verify email address
   * التحقق من البريد الإلكتروني
   */
  async verifyEmail(token: string): Promise<boolean> {
    if (!token || token.length === 0) {
      throw new Error('Verification token is required')
    }

    return this.authPort.verifyEmail(token)
  }

  /**
   * Resend verification email
   * إعادة إرسال بريد التحقق
   */
  async resendVerificationEmail(email: string): Promise<boolean> {
    if (!UserPolicy.validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    return this.authPort.resendVerificationEmail(email)
  }

  /**
   * Change user password
   * تغيير كلمة مرور المستخدم
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<boolean> {
    // Check if user can change password
    // This will be checked with actual user data at service level
    // سيتم التحقق من بيانات المستخدم الفعلية في مستوى الخدمة

    // Validate new password
    const passwordValidation = UserPolicy.validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors?.join(', ')}`)
    }

    // Check password confirmation
    if (newPassword !== newPasswordConfirm) {
      throw new Error('New passwords do not match')
    }

    // Change password
    return this.authPort.changePassword(userId, oldPassword, newPassword)
  }

  /**
   * Logout user
   * تسجيل خروج المستخدم
   */
  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken || refreshToken.length === 0) {
      throw new Error('Refresh token is required')
    }

    return this.authPort.logout(refreshToken)
  }
}

