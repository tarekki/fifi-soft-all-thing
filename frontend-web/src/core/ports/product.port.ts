/**
 * Product Repository Interface
 * واجهة مستودع المنتجات
 */

import type { Product, ProductDetail } from '@/types/product'
import type { ApiPaginatedResponse } from '@/types/api'

export interface ProductPort {
  getAll(params?: {
    vendor_slug?: string
    product_type?: string
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Product>>

  getBySlug(slug: string): Promise<ProductDetail>
  getById(id: number): Promise<ProductDetail>
}

