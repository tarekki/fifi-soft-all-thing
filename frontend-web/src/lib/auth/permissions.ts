/**
 * Role-Based Permissions
 * الصلاحيات بناءً على الأدوار
 * 
 * Permission checking utilities for role-based access control
 * أدوات فحص الصلاحيات للتحكم بالوصول بناءً على الأدوار
 * 
 * Used in:
 * - Middleware (route protection)
 * - Services (business logic permissions)
 * - Server Actions (action-level permissions)
 * 
 * يُستخدم في:
 * - Middleware (حماية المسارات)
 * - Services (صلاحيات منطق العمل)
 * - Server Actions (صلاحيات على مستوى الإجراء)
 */

import type { User, UserRole } from '@/types/user'

/**
 * Check if user has admin role
 * التحقق من إذا كان المستخدم لديه دور مسؤول
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.role === 'admin' || (user as any).is_superuser === true
}

/**
 * Check if user has vendor role
 * التحقق من إذا كان المستخدم لديه دور بائع
 */
export function isVendor(user: User | null): boolean {
  if (!user) return false
  return user.role === 'vendor'
}

/**
 * Check if user has customer role
 * التحقق من إذا كان المستخدم لديه دور زبون
 */
export function isCustomer(user: User | null): boolean {
  if (!user) return false
  return user.role === 'customer'
}

/**
 * Check if user has specific role
 * التحقق من إذا كان المستخدم لديه دور محدد
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false
  return user.role === role
}

/**
 * Check if user has any of the specified roles
 * التحقق من إذا كان المستخدم لديه أي من الأدوار المحددة
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Check if user can access customer routes
 * التحقق من إمكانية الوصول لمسارات الزبون
 */
export function canAccessCustomerRoutes(user: User | null): boolean {
  return isCustomer(user) || isAdmin(user)
}

/**
 * Check if user can access vendor routes
 * التحقق من إمكانية الوصول لمسارات البائع
 */
export function canAccessVendorRoutes(user: User | null): boolean {
  return isVendor(user) || isAdmin(user)
}

/**
 * Check if user can access admin routes
 * التحقق من إمكانية الوصول لمسارات المسؤول
 */
export function canAccessAdminRoutes(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can manage a specific vendor
 * التحقق من إمكانية إدارة بائع محدد
 * 
 * Note: Vendor association check will be done at service level
 * ملاحظة: فحص ارتباط البائع سيتم في مستوى الخدمة
 */
export function canManageVendor(user: User | null, vendorId: number): boolean {
  if (!user) return false
  
  // Admin can manage any vendor
  if (isAdmin(user)) {
    return true
  }

  // Vendor can manage their own vendor (if associated)
  // Service will check actual vendor association
  if (isVendor(user)) {
    return true // Service will verify association
  }

  return false
}

/**
 * Check if user can view an order
 * التحقق من إمكانية عرض طلب
 * 
 * Note: Full permission check (vendor association, order ownership) 
 * will be done at service level
 * 
 * ملاحظة: فحص الصلاحيات الكامل (ارتباط البائع، ملكية الطلب)
 * سيتم في مستوى الخدمة
 */
export function canViewOrder(user: User | null): boolean {
  if (!user) return false
  
  // Admin can view all orders
  if (isAdmin(user)) {
    return true
  }

  // Customer and Vendor can view orders
  // Service will filter by ownership/association
  return isCustomer(user) || isVendor(user)
}

