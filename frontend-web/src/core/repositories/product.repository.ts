/**
 * Product Repository Implementation
 * تنفيذ مستودع المنتجات
 * 
 * Implements ProductPort interface using Public API Client
 * ينفذ واجهة ProductPort باستخدام عميل API العام
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
 */

import type { ProductPort } from '../ports/product.port'
import type { Product, ProductDetail } from '@/types/product'
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api'

/**
 * Product Repository
 * مستودع المنتجات
 * 
 * Implements ProductPort interface
 * Uses Public API Client for read-only product data
 * 
 * ينفذ واجهة ProductPort
 * يستخدم عميل API العام لبيانات المنتجات للقراءة فقط
 */
export class ProductRepository implements ProductPort {
  /**
   * Get all products with filtering and pagination
   * الحصول على جميع المنتجات مع الفلترة والترقيم
   * 
   * @param params - Filtering and pagination parameters
   * @returns Paginated list of products
   * 
   * Security: Public endpoint (no authentication required)
   * الأمان: endpoint عام (لا يتطلب المصادقة)
   */
  async getAll(params?: {
    vendor_slug?: string
    product_type?: string
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Product>> {
    try {
      // Import Public API Client dynamically to avoid circular dependencies
      // استيراد عميل API العام ديناميكياً لتجنب التبعيات الدائرية
      const { getProducts } = await import('@/lib/api/public/products')
      
      // Call Public API Client
      // استدعاء عميل API العام
      const response = await getProducts(params)
      
      return response
    } catch (error) {
      // Log error for debugging (in production, use proper logging)
      // تسجيل الخطأ للتشخيص (في الإنتاج، استخدم تسجيل مناسب)
      console.error('Error in ProductRepository.getAll:', error)
      
      // Re-throw error with context
      // إعادة رمي الخطأ مع السياق
      if (error instanceof Error) {
        throw new Error(`Failed to get products: ${error.message}`)
      }
      throw new Error('Failed to get products: Unknown error')
    }
  }

  /**
   * Get product by slug
   * الحصول على منتج بالـ slug
   * 
   * @param slug - Product slug (URL-friendly identifier)
   * @returns Product details
   * 
   * Security: Public endpoint (no authentication required)
   * 
   * Note: This endpoint may not be implemented in backend yet
   * If not available, we can use getById with slug-to-id mapping
   * 
   * الأمان: endpoint عام (لا يتطلب المصادقة)
   * 
   * ملاحظة: قد لا يكون هذا endpoint منفذاً في الخادم بعد
   * إذا لم يكن متاحاً، يمكننا استخدام getById مع تحويل slug إلى id
   */
  async getBySlug(slug: string): Promise<ProductDetail> {
    try {
      if (!slug || slug.trim().length === 0) {
        throw new Error('Product slug is required')
      }

      // TODO: Implement when backend supports slug-based retrieval
      // سيتم التنفيذ عندما يدعم الخادم الاسترجاع بالـ slug
      // For now, we'll need to get all products and filter by slug
      // حالياً، سنحتاج للحصول على جميع المنتجات والفلترة بالـ slug
      
      // This is a temporary implementation
      // هذا تنفيذ مؤقت
      const { getProducts } = await import('@/lib/api/public/products')
      
      // Get all products and find by slug
      // الحصول على جميع المنتجات والعثور بالـ slug
      const response = await getProducts({ search: slug })
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get products')
      }

      // Find product with matching slug
      // العثور على منتج بـ slug مطابق
      const product = response.data.results.find((p) => p.slug === slug)
      
      if (!product) {
        throw new Error(`Product with slug "${slug}" not found`)
      }

      // Return as ProductDetail (assuming ProductDetail extends Product)
      // إرجاع كـ ProductDetail (بافتراض أن ProductDetail يمتد من Product)
      return product as ProductDetail
    } catch (error) {
      console.error('Error in ProductRepository.getBySlug:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to get product by slug: Unknown error`)
    }
  }

  /**
   * Get product by ID
   * الحصول على منتج بالمعرف
   * 
   * @param id - Product ID
   * @returns Product details
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
  async getById(id: number): Promise<ProductDetail> {
    try {
      if (!id || id <= 0) {
        throw new Error('Product ID must be a positive number')
      }

      // TODO: Implement when backend supports direct ID retrieval
      // سيتم التنفيذ عندما يدعم الخادم الاسترجاع المباشر بالـ ID
      // For now, we'll need to get all products and filter by id
      // حالياً، سنحتاج للحصول على جميع المنتجات والفلترة بالـ id
      
      // This is a temporary implementation
      // هذا تنفيذ مؤقت
      const { getProducts } = await import('@/lib/api/public/products')
      
      // Get all products and find by id
      // الحصول على جميع المنتجات والعثور بالـ id
      // Note: This is inefficient for large datasets
      // ملاحظة: هذا غير فعال لمجموعات البيانات الكبيرة
      let page = 1
      let found = false
      let product: Product | undefined

      while (!found) {
        const response = await getProducts({ page })
        
        if (!response.success || !response.data) {
          throw new Error('Failed to get products')
        }

        // Find product with matching id
        // العثور على منتج بـ id مطابق
        product = response.data.results.find((p) => p.id === id)
        
        if (product) {
          found = true
        } else if (response.data.pagination.next === null) {
          // No more pages
          // لا توجد صفحات أخرى
          break
        } else {
          page++
        }
      }

      if (!product) {
        throw new Error(`Product with ID ${id} not found`)
      }

      // Return as ProductDetail (assuming ProductDetail extends Product)
      // إرجاع كـ ProductDetail (بافتراض أن ProductDetail يمتد من Product)
      return product as ProductDetail
    } catch (error) {
      console.error('Error in ProductRepository.getById:', error)
      
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to get product by ID: Unknown error`)
    }
  }
}

