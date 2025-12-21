/**
 * User Domain Types
 * أنواع نطاق المستخدم
 * 
 * Domain-specific types for User entity
 * أنواع خاصة بالنطاق لكيان المستخدم
 */

import type { User, UserProfile, UserRole } from '@/types/user'

export type UserEntity = User

export type UserProfileEntity = UserProfile

export type UserRoleEntity = UserRole

/**
 * Authentication result
 * نتيجة المصادقة
 */
export type AuthResult = {
  user: UserEntity
  tokens: {
    access: string
    refresh: string
  }
}

/**
 * Password validation result
 * نتيجة التحقق من كلمة المرور
 */
export type PasswordValidationResult = {
  valid: boolean
  errors?: string[]
}

