/**
 * Vendor Business Rules / Policies
 * قواعد العمل للبائعين
 * 
 * Contains all business rules and validation logic for vendors
 * يحتوي على جميع قواعد العمل ومنطق التحقق للبائعين
 */

import type { VendorEntity } from './vendor.types'

export class VendorPolicy {
  /**
   * Check if vendor is active
   * التحقق من إذا كان البائع نشط
   */
  static isActive(vendor: VendorEntity): boolean {
    return vendor.is_active === true
  }

  /**
   * Check if vendor can be viewed
   * التحقق من إمكانية عرض البائع
   */
  static canView(vendor: VendorEntity): boolean {
    return this.isActive(vendor)
  }

  /**
   * Check if vendor can be managed
   * التحقق من إمكانية إدارة البائع
   * 
   * Note: User permission check will be done at service level
   * ملاحظة: فحص صلاحيات المستخدم سيتم في مستوى الخدمة
   */
  static canManage(vendor: VendorEntity): boolean {
    return this.isActive(vendor)
  }

  /**
   * Validate commission rate
   * التحقق من معدل العمولة
   * 
   * Rules:
   * - Must be between 0 and 100
   * - Default is 10%
   * 
   * القواعد:
   * - يجب أن يكون بين 0 و 100
   * - الافتراضي هو 10%
   */
  static validateCommissionRate(rate: number): boolean {
    return rate >= 0 && rate <= 100
  }

  /**
   * Get default commission rate
   * الحصول على معدل العمولة الافتراضي
   */
  static getDefaultCommissionRate(): number {
    return 10.0 // 10% default
  }
}

