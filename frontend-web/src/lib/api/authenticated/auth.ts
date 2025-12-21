/**
 * Auth API Client
 * عميل API للمصادقة
 * 
 * Authenticated API client for authentication and user management
 * عميل API مصادق عليه للمصادقة وإدارة المستخدمين
 * 
 * Endpoints:
 * - POST /api/v1/auth/register/ - User registration
 * - POST /api/v1/auth/login/ - User login
 * - POST /api/v1/auth/refresh/ - Refresh access token
 * - POST /api/v1/auth/verify-email/ - Verify email address
 * - POST /api/v1/auth/resend-verification/ - Resend verification email
 * - GET /api/v1/users/profile/ - Get user profile
 * - PUT /api/v1/users/profile/ - Update user profile
 * - POST /api/v1/users/profile/change_password/ - Change password
 * 
 * Security:
 * - Registration and login are public (no auth required)
 * - Profile endpoints require authentication (JWT token)
 * - Tokens stored in HttpOnly cookies (XSS protection)
 * - Password changes require current password
 * 
 * الأمان:
 * - التسجيل وتسجيل الدخول عامان (لا يتطلبان المصادقة)
 * - نقاط نهاية الملف الشخصي تتطلب المصادقة (رمز JWT)
 * - الرموز مخزنة في HttpOnly cookies (حماية من XSS)
 * - تغيير كلمة المرور يتطلب كلمة المرور الحالية
 */

import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from './client'
import type { ApiResponse } from '@/types/api'
import type { User, UserProfile, AuthTokens } from '@/types/user'

/**
 * Register a new user
 * تسجيل مستخدم جديد
 * 
 * @param data - Registration data (email, phone, password, etc.)
 * @returns User and authentication tokens
 * 
 * Security: 
 * - Validates email format
 * - Validates phone format
 * - Enforces password strength
 * - Checks for duplicate email/phone
 * 
 * Business Logic:
 * - Creates user account
 * - Sends verification email
 * - Returns JWT tokens for immediate login
 * 
 * الأمان:
 * - يتحقق من تنسيق البريد الإلكتروني
 * - يتحقق من تنسيق الهاتف
 * - يفرض قوة كلمة المرور
 * - يتحقق من تكرار البريد الإلكتروني/الهاتف
 * 
 * منطق العمل:
 * - ينشئ حساب مستخدم
 * - يرسل بريد التحقق
 * - يعيد رموز JWT لتسجيل الدخول الفوري
 */
export async function register(data: {
  email: string
  phone: string
  full_name: string
  password: string
  password_confirm: string
  role?: 'customer' | 'vendor' | 'admin'
}): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  // Note: Registration is public, but we use authenticated client for consistency
  // ملاحظة: التسجيل عام، لكننا نستخدم عميل مصادق للاتساق
  // In production, you might want a separate public client for registration/login
  // في الإنتاج، قد تريد عميل عام منفصل للتسجيل/تسجيل الدخول
  return authenticatedPost<ApiResponse<{ user: User; tokens: AuthTokens }>>(
    '/auth/register/',
    data
  )
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
 * - Tokens should be stored in HttpOnly cookies
 * 
 * Business Logic:
 * - Checks if user is active
 * - Checks if email is verified (if verification is required)
 * 
 * الأمان:
 * - يتحقق من بيانات الاعتماد
 * - يعيد رموز JWT (access + refresh)
 * - يجب تخزين الرموز في HttpOnly cookies
 * 
 * منطق العمل:
 * - يتحقق من إذا كان المستخدم نشطاً
 * - يتحقق من إذا كان البريد الإلكتروني مؤكداً (إذا كان التحقق مطلوباً)
 */
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
  return authenticatedPost<ApiResponse<{ user: User; tokens: AuthTokens }>>(
    '/auth/login/',
    { email, password }
  )
}

/**
 * Refresh access token
 * تجديد رمز الوصول
 * 
 * @param refreshToken - Refresh token from cookie
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
export async function refreshToken(
  refreshToken: string
): Promise<ApiResponse<AuthTokens>> {
  return authenticatedPost<ApiResponse<AuthTokens>>('/auth/refresh/', {
    refresh: refreshToken,
  })
}

/**
 * Verify email address
 * التحقق من عنوان البريد الإلكتروني
 * 
 * @param token - Email verification token
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
export async function verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
  return authenticatedPost<ApiResponse<{ message: string }>>('/auth/verify-email/', {
    token,
  })
}

/**
 * Resend verification email
 * إعادة إرسال بريد التحقق
 * 
 * @param email - User email (optional, uses current user if not provided)
 * @returns Success message
 * 
 * Security:
 * - Requires authentication
 * - Rate limiting applies (prevents spam)
 * 
 * الأمان:
 * - يتطلب المصادقة
 * - يطبق تحديد المعدل (يمنع البريد المزعج)
 */
export async function resendVerification(
  email?: string
): Promise<ApiResponse<{ message: string }>> {
  return authenticatedPost<ApiResponse<{ message: string }>>(
    '/auth/resend-verification/',
    email ? { email } : {}
  )
}

/**
 * Get current user profile
 * الحصول على الملف الشخصي للمستخدم الحالي
 * 
 * @returns User profile with full details
 * 
 * Security: Requires authentication (JWT token)
 * 
 * الأمان: يتطلب المصادقة (رمز JWT)
 */
export async function getCurrentUser(): Promise<ApiResponse<User & { profile?: UserProfile }>> {
  return authenticatedGet<ApiResponse<User & { profile?: UserProfile }>>('/users/profile/')
}

/**
 * Update user profile
 * تحديث الملف الشخصي للمستخدم
 * 
 * @param data - Profile update data
 * @returns Updated user profile
 * 
 * Security:
 * - Requires authentication
 * - Validates input data
 * - Prevents email/phone changes (if restricted)
 * 
 * الأمان:
 * - يتطلب المصادقة
 * - يتحقق من بيانات الإدخال
 * - يمنع تغيير البريد الإلكتروني/الهاتف (إذا كان مقيداً)
 */
export async function updateProfile(data: {
  full_name?: string
  phone?: string
  address?: string
  avatar?: string
  preferred_language?: 'ar' | 'en'
}): Promise<ApiResponse<User & { profile?: UserProfile }>> {
  return authenticatedPut<ApiResponse<User & { profile?: UserProfile }>>(
    '/users/profile/',
    data
  )
}

/**
 * Change password
 * تغيير كلمة المرور
 * 
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param newPasswordConfirm - New password confirmation
 * @returns Success message
 * 
 * Security:
 * - Requires authentication
 * - Validates current password
 * - Enforces password strength
 * - Requires password confirmation
 * 
 * الأمان:
 * - يتطلب المصادقة
 * - يتحقق من كلمة المرور الحالية
 * - يفرض قوة كلمة المرور
 * - يتطلب تأكيد كلمة المرور
 */
export async function changePassword(data: {
  current_password: string
  new_password: string
  new_password_confirm: string
}): Promise<ApiResponse<{ message: string }>> {
  return authenticatedPost<ApiResponse<{ message: string }>>(
    '/users/profile/change_password/',
    data
  )
}

/**
 * Logout user
 * تسجيل خروج المستخدم
 * 
 * Note: This is a client-side operation (removes tokens from cookies)
 * If backend supports token blacklisting, this endpoint would invalidate tokens
 * 
 * ملاحظة: هذه عملية على جانب العميل (تزيل الرموز من الكوكيز)
 * إذا كان الخادم يدعم إبطال الرموز، فإن هذا endpoint سيبطل الرموز
 * 
 * @returns Success message
 */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  // If backend has logout endpoint, call it here
  // إذا كان الخادم لديه endpoint تسجيل خروج، استدعه هنا
  // For now, logout is handled client-side (removing cookies)
  // حالياً، تسجيل الخروج يتم التعامل معه على جانب العميل (إزالة الكوكيز)
  
  // Return success (actual logout handled by auth actions)
  // إرجاع النجاح (تسجيل الخروج الفعلي يتم التعامل معه بواسطة إجراءات المصادقة)
  return Promise.resolve({
    success: true,
    data: { message: 'Logged out successfully' },
    message: 'Logged out successfully',
  } as ApiResponse<{ message: string }>)
}

