/**
 * Public Vendors API
 * API البائعين العامة
 * 
 * Read-only vendor data fetching
 * جلب بيانات البائعين للقراءة فقط
 */

import { apiClient } from '../client'
import type { ApiPaginatedResponse } from '@/types/api'
import type { Vendor } from '@/types/vendor'

export async function getVendors(params?: {
  is_active?: boolean
  search?: string
  page?: number
}): Promise<ApiPaginatedResponse<Vendor>> {
  const queryParams = new URLSearchParams()
  
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }
  if (params?.search) {
    queryParams.append('search', params.search)
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString())
  }

  const query = queryParams.toString()
  const endpoint = `/vendors/${query ? `?${query}` : ''}`
  
  return apiClient<ApiPaginatedResponse<Vendor>>(endpoint)
}

export async function getVendorById(id: number): Promise<Vendor> {
  return apiClient<Vendor>(`/vendors/${id}/`)
}

export async function getVendorBySlug(slug: string): Promise<Vendor> {
  // TODO: Implement when backend supports slug-based retrieval
  // For now, we'll need to get all vendors and filter
  const vendors = await getVendors({ search: slug })
  const vendor = vendors.data?.results.find(v => v.slug === slug)
  
  if (!vendor) {
    throw new Error('Vendor not found')
  }
  
  return vendor
}

