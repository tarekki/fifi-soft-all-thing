/**
 * User Business Rules / Policies
 * قواعد العمل للمستخدمين
 * 
 * Contains all business rules and validation logic for users
 * يحتوي على جميع قواعد العمل ومنطق التحقق للمستخدمين
 */

import type { UserEntity, PasswordValidationResult } from './user.types'

export class UserPolicy {
  /**
   * Check if user can access admin features
   * التحقق من إمكانية الوصول لميزات المسؤول
   */
  static isAdmin(user: UserEntity | null): boolean {
    if (!user) return false
    return user.role === 'admin' || (user as any).is_superuser === true
  }

  /**
   * Check if user can access vendor features
   * التحقق من إمكانية الوصول لميزات البائع
   */
  static isVendor(user: UserEntity | null): boolean {
    if (!user) return false
    return user.role === 'vendor'
  }

  /**
   * Check if user can access customer features
   * التحقق من إمكانية الوصول لميزات الزبون
   */
  static isCustomer(user: UserEntity | null): boolean {
    if (!user) return false
    return user.role === 'customer'
  }

  /**
   * Check if user can manage a specific vendor
   * التحقق من إمكانية إدارة بائع محدد
   * 
   * Note: This requires vendor association check (will be done at service level)
   * ملاحظة: هذا يتطلب فحص ارتباط البائع (سيتم في مستوى الخدمة)
   */
  static canManageVendor(user: UserEntity | null, vendorId: number): boolean {
    if (!user) return false
    
    // Admin can manage any vendor
    if (this.isAdmin(user)) {
      return true
    }

    // Vendor can manage their own vendor (if associated)
    if (this.isVendor(user)) {
      // Service will check vendor association
      return true
    }

    return false
  }

  /**
   * Validate password strength
   * التحقق من قوة كلمة المرور
   * 
   * Rules:
   * - Minimum 8 characters
   * - At least one letter
   * - At least one number
   * 
   * القواعد:
   * - الحد الأدنى 8 أحرف
   * - حرف واحد على الأقل
   * - رقم واحد على الأقل
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = []

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Validate email format
   * التحقق من تنسيق البريد الإلكتروني
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone number format
   * التحقق من تنسيق رقم الهاتف
   * 
   * Accepts Syrian phone numbers (09xxxxxxxx or +9639xxxxxxxx)
   * يقبل أرقام الهواتف السورية
   */
  static validatePhone(phone: string): boolean {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')
    
    // Check if it's a valid Syrian phone number
    // Syrian numbers: 09xxxxxxxx (10 digits) or +9639xxxxxxxx (13 digits)
    if (digitsOnly.length === 10 && digitsOnly.startsWith('09')) {
      return true
    }
    if (digitsOnly.length === 13 && digitsOnly.startsWith('9639')) {
      return true
    }
    
    return false
  }

  /**
   * Check if user can change their password
   * التحقق من إمكانية تغيير كلمة المرور
   */
  static canChangePassword(user: UserEntity | null): boolean {
    if (!user) return false
    return user.is_active === true
  }

  /**
   * Check if user can update their profile
   * التحقق من إمكانية تحديث الملف الشخصي
   */
  static canUpdateProfile(user: UserEntity | null, targetUserId: number): boolean {
    if (!user) return false
    
    // User can update their own profile
    if (user.id === targetUserId) {
      return true
    }

    // Admin can update any profile
    if (this.isAdmin(user)) {
      return true
    }

    return false
  }
}

