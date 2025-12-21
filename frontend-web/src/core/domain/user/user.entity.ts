/**
 * User Entity
 * كيان المستخدم
 * 
 * Domain entity for User with business logic methods
 * كيان النطاق للمستخدم مع طرق منطق العمل
 */

import type { UserEntity as UserEntityType } from './user.types'
import { UserPolicy } from './user.policy'

export class UserEntity implements UserEntityType {
  // TODO: Implement entity with business logic methods
  // سيتم تنفيذ الكيان مع طرق منطق العمل
  
  /**
   * Check if user is admin
   * التحقق من إذا كان المستخدم مسؤول
   */
  isAdmin(): boolean {
    return UserPolicy.isAdmin(this as any)
  }

  /**
   * Check if user is vendor
   * التحقق من إذا كان المستخدم بائع
   */
  isVendor(): boolean {
    return UserPolicy.isVendor(this as any)
  }

  /**
   * Check if user is customer
   * التحقق من إذا كان المستخدم زبون
   */
  isCustomer(): boolean {
    return UserPolicy.isCustomer(this as any)
  }
}

