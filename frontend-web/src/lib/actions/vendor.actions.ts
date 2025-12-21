/**
 * Vendor Server Actions
 * إجراءات الخادم للبائعين
 * 
 * Server Actions for vendor management
 * These actions run on the server and use Vendor Service with Repository
 * 
 * إجراءات الخادم لإدارة البائعين
 * هذه الإجراءات تعمل على الخادم وتستخدم خدمة البائعين مع المستودع
 * 
 * Architecture:
 * Server Action → Service → Repository → API Client → Backend
 * 
 * البنية المعمارية:
 * Server Action → Service → Repository → API Client → Backend
 */

'use server'

import { VendorService } from '@/core/services/vendor.service'
import { VendorRepository } from '@/core/repositories/vendor.repository'
import type { Vendor } from '@/types/vendor'
import type { ApiPaginatedResponse } from '@/types/api'

/**
 * Get all vendors
 * الحصول على جميع البائعين
 * 
 * @param params - Filtering and pagination parameters
 * @returns Paginated list of vendors
 * 
 * Security: Only returns active vendors by default
 * Business Logic: Applies vendor visibility rules
 * 
 * الأمان: يعيد فقط البائعين النشطين افتراضياً
 * منطق العمل: يطبق قواعد إظهار البائعين
 */
export async function getVendorsAction(params?: {
  is_active?: boolean
  search?: string
  page?: number
}): Promise<ApiPaginatedResponse<Vendor>> {
  try {
    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new VendorRepository()
    const service = new VendorService(repository)

    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getVendors(params)
  } catch (error) {
    console.error('Error in getVendorsAction:', error)
    throw error
  }
}

/**
 * Get vendor by ID
 * الحصول على بائع بالمعرف
 * 
 * @param id - Vendor ID
 * @returns Vendor details
 * 
 * Security: Checks if vendor is active and can be viewed
 * Business Logic: Applies vendor visibility rules
 * 
 * الأمان: يتحقق من إذا كان البائع نشط ويمكن عرضه
 * منطق العمل: يطبق قواعد إظهار البائعين
 */
export async function getVendorByIdAction(id: number): Promise<Vendor> {
  try {
    if (!id || id <= 0) {
      throw new Error('Invalid vendor ID')
    }

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new VendorRepository()
    const service = new VendorService(repository)

    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getVendorById(id)
  } catch (error) {
    console.error('Error in getVendorByIdAction:', error)
    throw error
  }
}

/**
 * Get vendor by slug
 * الحصول على بائع بالـ slug
 * 
 * @param slug - Vendor slug
 * @returns Vendor details
 * 
 * Security: Checks if vendor is active and can be viewed
 * Business Logic: Applies vendor visibility rules
 * 
 * الأمان: يتحقق من إذا كان البائع نشط ويمكن عرضه
 * منطق العمل: يطبق قواعد إظهار البائعين
 */
export async function getVendorBySlugAction(slug: string): Promise<Vendor> {
  try {
    if (!slug || slug.trim().length === 0) {
      throw new Error('Vendor slug is required')
    }

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new VendorRepository()
    const service = new VendorService(repository)

    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getVendorBySlug(slug)
  } catch (error) {
    console.error('Error in getVendorBySlugAction:', error)
    throw error
  }
}

