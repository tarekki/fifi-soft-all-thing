/**
 * useVendors Hook
 * Hook للبائعين
 * 
 * Custom hook for vendor data fetching
 * Hook مخصص لجلب بيانات البائعين
 * 
 * Features:
 * - Fetch vendors with filtering and pagination
 * - Fetch vendor by ID
 * - Fetch vendor by slug
 * - Loading and error states
 * 
 * المميزات:
 * - جلب البائعين مع الفلترة والترقيم
 * - جلب بائع بالمعرف
 * - جلب بائع بالـ slug
 * - حالات التحميل والخطأ
 */

'use client'

import { useState, useCallback } from 'react'
import * as vendorActions from '@/lib/actions/vendor.actions'
import type { Vendor } from '@/types/vendor'
import type { ApiPaginatedResponse } from '@/types/api'

interface UseVendorsOptions {
  is_active?: boolean
  search?: string
  page?: number
}

interface UseVendorsReturn {
  vendors: Vendor[]
  pagination: ApiPaginatedResponse<Vendor>['data']['pagination'] | null
  isLoading: boolean
  error: string | null
  fetchVendors: (options?: UseVendorsOptions) => Promise<void>
  clearError: () => void
}

/**
 * useVendors Hook
 * 
 * @param initialOptions - Initial fetch options
 * @returns Vendors data and operations
 */
export function useVendors(initialOptions?: UseVendorsOptions): UseVendorsReturn {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [pagination, setPagination] = useState<ApiPaginatedResponse<Vendor>['data']['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch vendors
   * جلب البائعين
   */
  const fetchVendors = useCallback(async (options?: UseVendorsOptions) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { ...initialOptions, ...options }
      const response = await vendorActions.getVendorsAction(params)
      
      if (response.success && response.data) {
        setVendors(response.data.results)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || 'Failed to fetch vendors')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendors'
      setError(errorMessage)
      setVendors([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [initialOptions])

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    vendors,
    pagination,
    isLoading,
    error,
    fetchVendors,
    clearError,
  }
}

/**
 * useVendor Hook
 * Hook لبائع واحد
 * 
 * Custom hook for fetching a single vendor by ID or slug
 * Hook مخصص لجلب بائع واحد بالمعرف أو slug
 */
interface UseVendorReturn {
  vendor: Vendor | null
  isLoading: boolean
  error: string | null
  fetchVendorById: (id: number) => Promise<void>
  fetchVendorBySlug: (slug: string) => Promise<void>
  clearError: () => void
}

export function useVendor(): UseVendorReturn {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch vendor by ID
   * جلب بائع بالمعرف
   */
  const fetchVendorById = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const vendorData = await vendorActions.getVendorByIdAction(id)
      setVendor(vendorData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendor'
      setError(errorMessage)
      setVendor(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Fetch vendor by slug
   * جلب بائع بالـ slug
   */
  const fetchVendorBySlug = useCallback(async (slug: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const vendorData = await vendorActions.getVendorBySlugAction(slug)
      setVendor(vendorData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendor'
      setError(errorMessage)
      setVendor(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear error
   * مسح الخطأ
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    vendor,
    isLoading,
    error,
    fetchVendorById,
    fetchVendorBySlug,
    clearError,
  }
}

