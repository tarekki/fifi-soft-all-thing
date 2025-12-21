/**
 * Vendor Entity
 * كيان البائع
 * 
 * Domain entity for Vendor with business logic methods
 * كيان النطاق للبائع مع طرق منطق العمل
 */

import type { VendorEntity as VendorEntityType } from './vendor.types'
import { VendorPolicy } from './vendor.policy'

export class VendorEntity implements VendorEntityType {
  // TODO: Implement entity with business logic methods
  // سيتم تنفيذ الكيان مع طرق منطق العمل
  
  /**
   * Check if vendor is active
   * التحقق من إذا كان البائع نشط
   */
  isActive(): boolean {
    return VendorPolicy.isActive(this as any)
  }

  /**
   * Check if vendor can be viewed
   * التحقق من إمكانية عرض البائع
   */
  canBeViewed(): boolean {
    return VendorPolicy.canView(this as any)
  }
}

