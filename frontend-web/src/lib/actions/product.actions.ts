/**
 * Product Server Actions
 * إجراءات الخادم للمنتجات
 */

'use server'

import { ProductService } from '@/core/services/product.service'
import type { Product } from '@/types/product'
import type { ApiPaginatedResponse } from '@/types/api'

// TODO: Implement ProductRepository
// سيتم تنفيذ ProductRepository لاحقاً
// For now, we'll use the public API directly
// حالياً، سنستخدم الـ API العام مباشرة

export async function getProductsAction(params?: {
  vendor_slug?: string
  product_type?: string
  search?: string
  page?: number
}): Promise<ApiPaginatedResponse<Product>> {
  // TODO: Initialize ProductService with ProductRepository when ready
  // const repository = new ProductRepository()
  // const service = new ProductService(repository)
  // return service.getProducts(params)
  
  // Temporary: Use public API directly
  const { getProducts } = await import('@/lib/api/public/products')
  return getProducts(params)
}

export async function getProductBySlugAction(slug: string): Promise<Product> {
  // TODO: Implement
  throw new Error('Not implemented yet')
}

