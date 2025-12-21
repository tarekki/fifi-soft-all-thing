/**
 * Vendor Service
 * خدمة البائعين
 * 
 * Business logic for vendors
 * منطق العمل للبائعين
 */

import { VendorPolicy } from '../domain/vendor/vendor.policy'
import type { VendorPort } from '../ports/vendor.port'
import type { Vendor } from '@/types/vendor'
import type { ApiPaginatedResponse } from '@/types/api'

export class VendorService {
  constructor(private vendorPort: VendorPort) {}

  /**
   * Get all vendors
   * الحصول على جميع البائعين
   */
  async getVendors(params?: {
    is_active?: boolean
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Vendor>> {
    // Only return active vendors by default
    const queryParams = {
      ...params,
      is_active: params?.is_active !== undefined ? params.is_active : true,
    }

    return this.vendorPort.getAll(queryParams)
  }

  /**
   * Get vendor by ID
   * الحصول على بائع بالمعرف
   */
  async getVendorById(id: number): Promise<Vendor> {
    const vendor = await this.vendorPort.getById(id)

    // Apply business rules
    if (!VendorPolicy.canView(vendor)) {
      throw new Error('Vendor is not available')
    }

    return vendor
  }

  /**
   * Get vendor by slug
   * الحصول على بائع بالـ slug
   */
  async getVendorBySlug(slug: string): Promise<Vendor> {
    const vendor = await this.vendorPort.getBySlug(slug)

    // Apply business rules
    if (!VendorPolicy.canView(vendor)) {
      throw new Error('Vendor is not available')
    }

    return vendor
  }
}

