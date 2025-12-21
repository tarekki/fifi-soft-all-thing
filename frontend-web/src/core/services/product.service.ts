/**
 * Product Service
 * خدمة المنتجات
 * 
 * Business logic for products
 * منطق العمل للمنتجات
 */

import { ProductPolicy } from '../domain/product/product.policy'
import type { ProductPort } from '../ports/product.port'
import type { Product } from '@/types/product'
import type { ApiPaginatedResponse } from '@/types/api'

export class ProductService {
  constructor(private productPort: ProductPort) {}

  async getProducts(params?: {
    vendor_slug?: string
    product_type?: string
    search?: string
    page?: number
  }): Promise<ApiPaginatedResponse<Product>> {
    // Business logic here
    // يمكن إضافة منطق العمل هنا (filtering, validation, etc.)
    return this.productPort.getAll(params)
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const product = await this.productPort.getBySlug(slug)
    
    // Apply business rules
    if (!ProductPolicy.canView(product)) {
      throw new Error('Product is not available')
    }
    
    return product
  }
}

