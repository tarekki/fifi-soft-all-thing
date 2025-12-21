/**
 * Vendor Repository Implementation
 * تنفيذ مستودع البائعين
 * 
 * Implements VendorPort interface using Public API Client
 * ينفذ واجهة VendorPort باستخدام عميل API العام
 * 
 * This repository acts as an adapter between the Core Layer (Services)
 * and the Data Layer (API Clients)
 * 
 * هذا المستودع يعمل كـ adapter بين طبقة Core (Services)
 * وطبقة Data (API Clients)
 * 
 * Architecture:
 * Service → Repository (Port) → API Client → Backend
 * 
 * البنية المعمارية:
 * Service → Repository (Port) → API Client → Backend
 * 
 * Security:
 * - All operations are public (no authentication required)
 * - Vendors are read-only from this repository
 * - Vendor management (create/update/delete) would require authenticated API
 * 
 * الأمان:
 * - جميع العمليات عامة (لا تتطلب المصادقة)
 * - البائعون للقراءة فقط من هذا المستودع
 * - إدارة البائعين (إنشاء/تحديث/حذف) تتطلب API مصادق عليه
 */

import type { VendorPort } from '../ports/vendor.port'
import type { Vendor } from '@/types/vendor'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api'

/**
 * Vendor Repository
 * مستودع البائعين
 * 
 * Implements VendorPort interface
 * Uses Public API Client for read-only vendor data
 * 
 * ينفذ واجهة VendorPort
 * يستخدم عميل API العام لبيانات البائعين للقراءة فقط
 */
export class VendorRepository implements VendorPort {
  /**
   * Get all vendors with filtering and pagination
   * الحصول على جميع البائعين مع الفلترة والترقيم
   * 
   * @param params - Filtering and pagination parameters
   * @returns Paginated list of vendors
   * 
   * Security: Public endpoint (no authentication required)
   * 
   * Business Logic:
   * - Only active vendors are returned by default
   * - Supports search by name/description
   * 
   * الأمان: endpoint عام (لا يتطلب المصادقة)
   * 
   * منطق العمل:
   * - فقط البائعون النشطون يتم إرجاعهم افتراضياً
   * - يدعم البحث بالاسم/الوصف
   */
  async getAll(params?: {
    is_active?: boolean
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Vendor>> {
    try {
      // Import Public API Client dynamically
      // استيراد عميل API العام ديناميكياً
      const { getVendors } = await import('@/lib/api/public/vendors')
      
      // Call Public API Client
      // استدعاء عميل API العام
      const response = await getVendors({
        is_active: params?.is_active,
        search: params?.search,
        page: params?.page,
      })
      
      return response
    } catch (error) {
      console.error('Error in VendorRepository.getAll:', error)
      
      if (error instanceof Error) {
        throw new Error(`Failed to get vendors: ${error.message}`)
      }
      throw new Error('Failed to get vendors: Unknown error')
    }
  }

  /**
   * Get vendor by ID
   * الحصول على بائع بالمعرف
   * 
   * @param id - Vendor ID
   * @returns Vendor details
   * 
   * Security: Public endpoint (no authentication required)
   * 
   * Note: This endpoint may not be implemented in backend yet
   * If not available, we can use getAll and filter by id
   * 
   * الأمان: endpoint عام (لا يتطلب المصادقة)
   * 
   * ملاحظة: قد لا يكون هذا endpoint منفذاً في الخادم بعد
   * إذا لم يكن متاحاً، يمكننا استخدام getAll والفلترة بالـ id
   */
  async getById(id: number): Promise<Vendor> {
    try {
      if (!id || id <= 0) {
        throw new Error('Vendor ID must be a positive number')
      }

      // TODO: Implement when backend supports direct ID retrieval
      // سيتم التنفيذ عندما يدعم الخادم الاسترجاع المباشر بالـ ID
      // For now, we'll need to get all vendors and filter by id
      // حالياً، سنحتاج للحصول على جميع البائعين والفلترة بالـ id
      
      // This is a temporary implementation
      // هذا تنفيذ مؤقت
      const { getVendors } = await import('@/lib/api/public/vendors')
      
      // Get all vendors and find by id
      // الحصول على جميع البائعين والعثور بالـ id
      // Note: This is inefficient for large datasets
      // ملاحظة: هذا غير فعال لمجموعات البيانات الكبيرة
      let page = 1
      let found = false
      let vendor: Vendor | undefined

      while (!found) {
        const response = await getVendors({ page })
        
        if (!response.success || !response.data) {
          throw new Error('Failed to get vendors')
        }

        // Find vendor with matching id
        // العثور على بائع بـ id مطابق
        vendor = response.data.results.find((v) => v.id === id)
        
        if (vendor) {
          found = true
        } else if (response.data.pagination.next === null) {
          // No more pages
          // لا توجد صفحات أخرى
          break
        } else {
          page++
        }
      }

      if (!vendor) {
        throw new Error(`Vendor with ID ${id} not found`)
      }

      return vendor
    } catch (error) {
      console.error('Error in VendorRepository.getById:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to get vendor by ID: Unknown error`)
    }
  }

  /**
   * Get vendor by slug
   * الحصول على بائع بالـ slug
   * 
   * @param slug - Vendor slug (URL-friendly identifier)
   * @returns Vendor details
   * 
   * Security: Public endpoint (no authentication required)
   * 
   * Note: This endpoint may not be implemented in backend yet
   * If not available, we can use getAll and filter by slug
   * 
   * الأمان: endpoint عام (لا يتطلب المصادقة)
   * 
   * ملاحظة: قد لا يكون هذا endpoint منفذاً في الخادم بعد
   * إذا لم يكن متاحاً، يمكننا استخدام getAll والفلترة بالـ slug
   */
  async getBySlug(slug: string): Promise<Vendor> {
    try {
      if (!slug || slug.trim().length === 0) {
        throw new Error('Vendor slug is required')
      }

      // Import Public API Client dynamically
      // استيراد عميل API العام ديناميكياً
      const { getVendorBySlug } = await import('@/lib/api/public/vendors')
      
      // Try to use dedicated endpoint if available
      // محاولة استخدام endpoint مخصص إذا كان متاحاً
      try {
        const response: ApiResponse<Vendor> = await getVendorBySlug(slug)
        
        if (response.success && response.data) {
          return response.data
        }
      } catch {
        // If dedicated endpoint is not available, fall back to getAll
        // إذا لم يكن endpoint مخصص متاحاً، نعود إلى getAll
      }

      // Fallback: Get all vendors and find by slug
      // بديل: الحصول على جميع البائعين والعثور بالـ slug
      const { getVendors } = await import('@/lib/api/public/vendors')
      const response = await getVendors({ search: slug })
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get vendors')
      }

      // Find vendor with matching slug
      // العثور على بائع بـ slug مطابق
      const vendor = response.data.results.find((v) => v.slug === slug)
      
      if (!vendor) {
        throw new Error(`Vendor with slug "${slug}" not found`)
      }

      return vendor
    } catch (error) {
      console.error('Error in VendorRepository.getBySlug:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to get vendor by slug: Unknown error`)
    }
  }
}

