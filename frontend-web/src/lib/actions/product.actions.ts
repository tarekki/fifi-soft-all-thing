/**
 * Product Server Actions
 * إجراءات الخادم للمنتجات
 * 
 * Server Actions for product management
 * These actions run on the server and use Product Service with Repository
 * 
 * إجراءات الخادم لإدارة المنتجات
 * هذه الإجراءات تعمل على الخادم وتستخدم خدمة المنتجات مع المستودع
 * 
 * Architecture:
 * Server Action → Service → Repository → API Client → Backend
 * 
 * البنية المعمارية:
 * Server Action → Service → Repository → API Client → Backend
 */

'use server'

import { ProductService } from '@/core/services/product.service'
import { ProductRepository } from '@/core/repositories/product.repository'
import type { Product } from '@/types/product'
import type { ApiPaginatedResponse } from '@/types/api'

/**
 * Get products with filtering and pagination
 * الحصول على المنتجات مع الفلترة والترقيم
 * 
 * @param params - Filtering and pagination parameters
 * @returns Paginated list of products
 * 
 * Security: Public endpoint (no authentication required)
 * 
 * Business Logic: Handled by ProductService
 * 
 * الأمان: endpoint عام (لا يتطلب المصادقة)
 * 
 * منطق العمل: يتم التعامل معه بواسطة ProductService
 */
export async function getProductsAction(params?: {
  vendor_slug?: string
  product_type?: string
  search?: string
  page?: number
}): Promise<ApiPaginatedResponse<Product>> {
  try {
    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new ProductRepository()
    const service = new ProductService(repository)
    
    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getProducts(params)
  } catch (error) {
    console.error('Error in getProductsAction:', error)
    throw error
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
 * Business Logic: 
 * - Handled by ProductService
 * - Applies business rules (e.g., product availability)
 * 
 * الأمان: endpoint عام (لا يتطلب المصادقة)
 * 
 * منطق العمل:
 * - يتم التعامل معه بواسطة ProductService
 * - يطبق قواعد العمل (مثلاً، توفر المنتج)
 */
export async function getProductBySlugAction(slug: string): Promise<Product> {
  try {
    if (!slug || slug.trim().length === 0) {
      throw new Error('Product slug is required')
    }

    // Initialize Repository and Service
    // تهيئة المستودع والخدمة
    const repository = new ProductRepository()
    const service = new ProductService(repository)
    
    // Call Service method
    // استدعاء طريقة الخدمة
    return await service.getProductBySlug(slug)
  } catch (error) {
    console.error('Error in getProductBySlugAction:', error)
    throw error
  }
}

