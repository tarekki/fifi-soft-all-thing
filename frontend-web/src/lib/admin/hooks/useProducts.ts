/**
 * useProducts Hook
 * هوك المنتجات
 * 
 * Custom React hook for managing products in the admin panel.
 * هوك React مخصص لإدارة المنتجات في لوحة الإدارة.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkProductAction,
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../api/products'
import type {
  Product,
  ProductDetail,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductFilters,
  ProductBulkAction,
  ProductVariant,
  ProductVariantCreatePayload,
} from '../types/products'


// =============================================================================
// Hook State Interface
// واجهة حالة الهوك
// =============================================================================

interface UseProductsState {
  // Products data
  // بيانات المنتجات
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
  
  // Loading states
  // حالات التحميل
  isLoading: boolean
  isSubmitting: boolean
  
  // Error state
  // حالة الخطأ
  error: string | null
  
  // Selected product for editing
  // المنتج المحدد للتعديل
  selectedProduct: ProductDetail | null
}


// =============================================================================
// Hook Return Interface
// واجهة إرجاع الهوك
// =============================================================================

interface UseProductsReturn extends UseProductsState {
  // Fetch functions
  // دوال الجلب
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  fetchProduct: (id: number) => Promise<ProductDetail | null>
  
  // CRUD functions
  // دوال CRUD
  addProduct: (data: ProductCreatePayload) => Promise<ProductDetail | null>
  editProduct: (id: number, data: ProductUpdatePayload) => Promise<ProductDetail | null>
  removeProduct: (id: number) => Promise<boolean>
  
  // Bulk actions
  // العمليات المجمعة
  bulkAction: (productIds: number[], action: ProductBulkAction) => Promise<boolean>
  
  // Variant functions
  // دوال المتغيرات
  fetchVariants: (productId: number) => Promise<ProductVariant[]>
  addVariant: (productId: number, data: ProductVariantCreatePayload) => Promise<ProductVariant | null>
  editVariant: (productId: number, variantId: number, data: Partial<ProductVariantCreatePayload>) => Promise<ProductVariant | null>
  removeVariant: (productId: number, variantId: number) => Promise<boolean>
  
  // State setters
  // محددات الحالة
  setSelectedProduct: (product: ProductDetail | null) => void
  clearError: () => void
  
  // Pagination
  // الترقيم
  goToPage: (page: number) => void
  
  // Refresh
  // التحديث
  refresh: () => Promise<void>
}


// =============================================================================
// useProducts Hook
// =============================================================================

export function useProducts(initialFilters?: ProductFilters): UseProductsReturn {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null)
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(initialFilters || {})
  
  const pageSize = initialFilters?.page_size || 10
  
  
  // =============================================================================
  // Fetch Products
  // جلب المنتجات
  // =============================================================================
  
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const filtersToUse = filters || currentFilters
      setCurrentFilters(filtersToUse)
      
      const response = await getProducts({
        ...filtersToUse,
        page_size: pageSize,
      })
      
      if (response.success && response.data) {
        setProducts(response.data.results)
        setTotalCount(response.data.count)
        setTotalPages(Math.ceil(response.data.count / pageSize))
        setCurrentPage(filtersToUse.page || 1)
      } else {
        setError(response.message || 'فشل في جلب المنتجات')
        console.error('Failed to fetch products:', response.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentFilters, pageSize])
  
  
  // =============================================================================
  // Fetch Single Product
  // جلب منتج واحد
  // =============================================================================
  
  const fetchProduct = useCallback(async (id: number): Promise<ProductDetail | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getProduct(id)
      
      if (response.success && response.data) {
        setSelectedProduct(response.data)
        return response.data
      } else {
        setError(response.message || 'فشل في جلب المنتج')
        console.error('Failed to fetch product:', response.message)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error fetching product:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  
  // =============================================================================
  // Add Product
  // إضافة منتج
  // =============================================================================
  
  const addProduct = useCallback(async (data: ProductCreatePayload): Promise<ProductDetail | null> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await createProduct(data)
      
      if (response.success && response.data) {
        // Refresh products list
        await fetchProducts(currentFilters)
        return response.data
      } else {
        // Show detailed error message
        let errorMsg = response.message || 'فشل في إنشاء المنتج'
        if (response.errors) {
          const errorDetails = Object.entries(response.errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n')
          errorMsg = `${errorMsg}\n${errorDetails}`
        }
        setError(errorMsg)
        console.error('Failed to create product:', response.message, response.errors)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error creating product:', err)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchProducts, currentFilters])
  
  
  // =============================================================================
  // Edit Product
  // تعديل منتج
  // =============================================================================
  
  const editProduct = useCallback(async (
    id: number,
    data: ProductUpdatePayload
  ): Promise<ProductDetail | null> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await updateProduct(id, data)
      
      if (response.success && response.data) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...response.data } : p
        ))
        
        if (selectedProduct?.id === id) {
          setSelectedProduct(response.data)
        }
        
        return response.data
      } else {
        setError(response.message || 'فشل في تحديث المنتج')
        console.error('Failed to update product:', response.message)
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error updating product:', err)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct])
  
  
  // =============================================================================
  // Remove Product
  // حذف منتج
  // =============================================================================
  
  const removeProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await deleteProduct(id)
      
      if (response.success) {
        // Remove from local state
        setProducts(prev => prev.filter(p => p.id !== id))
        setTotalCount(prev => prev - 1)
        
        if (selectedProduct?.id === id) {
          setSelectedProduct(null)
        }
        
        return true
      } else {
        setError(response.message || 'فشل في حذف المنتج')
        console.error('Failed to delete product:', response.message)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error deleting product:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct])
  
  
  // =============================================================================
  // Bulk Action
  // العمليات المجمعة
  // =============================================================================
  
  const bulkAction = useCallback(async (
    productIds: number[],
    action: ProductBulkAction
  ): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await bulkProductAction({
        product_ids: productIds,
        action,
      })
      
      if (response.success) {
        // Refresh products list
        await fetchProducts(currentFilters)
        return true
      } else {
        setError(response.message || 'فشل في تنفيذ العملية')
        console.error('Failed to perform bulk action:', response.message)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      console.error('Error performing bulk action:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [fetchProducts, currentFilters])
  
  
  // =============================================================================
  // Variant Functions
  // دوال المتغيرات
  // =============================================================================
  
  const fetchVariants = useCallback(async (productId: number): Promise<ProductVariant[]> => {
    try {
      const response = await getProductVariants(productId)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (err) {
      console.error('Error fetching variants:', err)
      return []
    }
  }, [])
  
  const addVariant = useCallback(async (
    productId: number,
    data: ProductVariantCreatePayload
  ): Promise<ProductVariant | null> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await createProductVariant(productId, data)
      
      if (response.success && response.data) {
        // Refresh product if it's selected
        if (selectedProduct?.id === productId) {
          await fetchProduct(productId)
        }
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء المتغير')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, fetchProduct])
  
  const editVariant = useCallback(async (
    productId: number,
    variantId: number,
    data: Partial<ProductVariantCreatePayload>
  ): Promise<ProductVariant | null> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await updateProductVariant(productId, variantId, data)
      
      if (response.success && response.data) {
        if (selectedProduct?.id === productId) {
          await fetchProduct(productId)
        }
        return response.data
      } else {
        setError(response.message || 'فشل في تحديث المتغير')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, fetchProduct])
  
  const removeVariant = useCallback(async (
    productId: number,
    variantId: number
  ): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await deleteProductVariant(productId, variantId)
      
      if (response.success) {
        if (selectedProduct?.id === productId) {
          await fetchProduct(productId)
        }
        return true
      } else {
        setError(response.message || 'فشل في حذف المتغير')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, fetchProduct])
  
  
  // =============================================================================
  // Pagination
  // الترقيم
  // =============================================================================
  
  const goToPage = useCallback((page: number) => {
    fetchProducts({ ...currentFilters, page })
  }, [fetchProducts, currentFilters])
  
  
  // =============================================================================
  // Utility Functions
  // الدوال المساعدة
  // =============================================================================
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const refresh = useCallback(async () => {
    await fetchProducts(currentFilters)
  }, [fetchProducts, currentFilters])
  
  
  // =============================================================================
  // Initial Fetch
  // الجلب الأولي
  // =============================================================================
  
  useEffect(() => {
    fetchProducts(initialFilters)
  }, []) // Only run on mount
  
  
  // =============================================================================
  // Return
  // =============================================================================
  
  return {
    // State
    products,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    isSubmitting,
    error,
    selectedProduct,
    
    // Functions
    fetchProducts,
    fetchProduct,
    addProduct,
    editProduct,
    removeProduct,
    bulkAction,
    
    // Variants
    fetchVariants,
    addVariant,
    editVariant,
    removeVariant,
    
    // Utilities
    setSelectedProduct,
    clearError,
    goToPage,
    refresh,
  }
}

