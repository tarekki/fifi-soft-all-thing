/**
 * Vendor Repository Interface
 * واجهة مستودع البائعين
 * 
 * Defines the contract for vendor data access
 * يعرّف العقد للوصول إلى بيانات البائعين
 */

import type { Vendor } from '@/types/vendor'
import type { ApiPaginatedResponse } from '@/types/api'

export interface VendorPort {
  /**
   * Get all vendors (with filtering and pagination)
   * الحصول على جميع البائعين (مع الفلترة والترقيم)
   */
  getAll(params?: {
    is_active?: boolean
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Vendor>>

  /**
   * Get vendor by ID
   * الحصول على بائع بالمعرف
   */
  getById(id: number): Promise<Vendor>

  /**
   * Get vendor by slug
   * الحصول على بائع بالـ slug
   */
  getBySlug(slug: string): Promise<Vendor>
}

