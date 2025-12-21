/**
 * Public Products API
 * API المنتجات العامة
 * 
 * Read-only product data fetching
 * جلب بيانات المنتجات للقراءة فقط
 */

import { apiClient } from '../client'
import type { ApiPaginatedResponse } from '@/types/api'
import type { Product } from '@/types/product'

export async function getProducts(params?: {
  vendor_slug?: string
  product_type?: string
  search?: string
  page?: number
}): Promise<ApiPaginatedResponse<Product>> {
  const queryParams = new URLSearchParams()
  
  if (params?.vendor_slug) queryParams.append('vendor_slug', params.vendor_slug)
  if (params?.product_type) queryParams.append('product_type', params.product_type)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.page) queryParams.append('page', params.page.toString())

  const query = queryParams.toString()
  const endpoint = `/products/${query ? `?${query}` : ''}`
  
  return apiClient<ApiPaginatedResponse<Product>>(endpoint)
}

export async function getProductBySlug(slug: string): Promise<Product> {
  // TODO: Implement when backend supports slug-based retrieval
  throw new Error('Not implemented yet')
}

