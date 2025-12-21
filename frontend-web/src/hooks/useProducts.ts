/**
 * useProducts Hook
 * Hook للمنتجات
 * 
 * Custom hook for product data fetching
 * Hook مخصص لجلب بيانات المنتجات
 * 
 * Features:
 * - Fetch products with filtering and pagination
 * - Fetch product by slug
 * - Loading and error states
 * 
 * المميزات:
 * - جلب المنتجات مع الفلترة والترقيم
 * - جلب منتج بالـ slug
 * - حالات التحميل والخطأ
 */

'use client'

import { useState, useCallback } from 'react'
import * as productActions from '@/lib/actions/product.actions'
import type { Product } from '@/types/product'
import type { ApiPaginatedResponse } from '@/types/api'

interface UseProductsOptions {
  vendor_slug?: string
  product_type?: string
  search?: string
  page?: number
}

interface UseProductsReturn {
  products: Product[]
  pagination: ApiPaginatedResponse<Product>['data']['pagination'] | null
  isLoading: boolean
  error: string | null
  fetchProducts: (options?: UseProductsOptions) => Promise<void>
  clearError: () => void
}

/**
 * useProducts Hook
 * 
 * @param initialOptions - Initial fetch options
 * @returns Products data and operations
 */
export function useProducts(initialOptions?: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ApiPaginatedResponse<Product>['data']['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch products
   * جلب المنتجات
   */
  const fetchProducts = useCallback(async (options?: UseProductsOptions) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { ...initialOptions, ...options }
      const response = await productActions.getProductsAction(params)
      
      if (response.success && response.data) {
        setProducts(response.data.results)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || 'Failed to fetch products')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      setProducts([])
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
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
    clearError,
  }
}

/**
 * useProduct Hook
 * Hook لمنتج واحد
 * 
 * Custom hook for fetching a single product by slug
 * Hook مخصص لجلب منتج واحد بالـ slug
 */
interface UseProductReturn {
  product: Product | null
  isLoading: boolean
  error: string | null
  fetchProduct: (slug: string) => Promise<void>
  clearError: () => void
}

export function useProduct(): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch product by slug
   * جلب منتج بالـ slug
   */
  const fetchProduct = useCallback(async (slug: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const productData = await productActions.getProductBySlugAction(slug)
      setProduct(productData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product'
      setError(errorMessage)
      setProduct(null)
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
    product,
    isLoading,
    error,
    fetchProduct,
    clearError,
  }
}

