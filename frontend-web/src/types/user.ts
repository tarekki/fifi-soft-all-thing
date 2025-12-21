/**
 * User Types
 * أنواع المستخدمين
 */

export type UserRole = 'customer' | 'vendor' | 'admin'

export type User = {
  id: number
  email: string
  phone: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserProfile = {
  address: string
  avatar: string | null
  preferred_language: 'ar' | 'en'
}

export type AuthTokens = {
  access: string
  refresh: string
}

