/**
 * useCategories Hook
 * خطاف الفئات
 * 
 * هذا الخطاف يوفر إدارة حالة الفئات مع الـ CRUD operations.
 * This hook provides categories state management with CRUD operations.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  bulkCategoryAction,
  toggleCategoryActive,
  toggleCategoryFeatured,
} from '../api/categories'
import type {
  Category,
  CategoryDetail,
  CategoryTreeNode,
  CategoryFormData,
  CategoryListParams,
  CategoryBulkAction,
} from '../types/categories'

// =============================================================================
// Types
// الأنواع
// =============================================================================

interface CategoriesState {
  // Data
  categories: Category[]
  selectedCategory: CategoryDetail | null
  categoryTree: CategoryTreeNode[]
  
  // Pagination
  totalCount: number
  currentPage: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  
  // UI State
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  
  // Filters
  filters: CategoryListParams
}

interface UseCategoriesReturn extends CategoriesState {
  // Actions
  fetchCategories: (params?: CategoryListParams) => Promise<void>
  fetchCategory: (id: number) => Promise<CategoryDetail | null>
  fetchCategoryTree: (activeOnly?: boolean) => Promise<void>
  addCategory: (data: CategoryFormData) => Promise<CategoryDetail | null>
  editCategory: (id: number, data: Partial<CategoryFormData>) => Promise<CategoryDetail | null>
  removeCategory: (id: number) => Promise<boolean>
  toggleActive: (id: number, isActive: boolean) => Promise<boolean>
  toggleFeatured: (id: number, isFeatured: boolean) => Promise<boolean>
  bulkAction: (action: CategoryBulkAction) => Promise<boolean>
  
  // Pagination
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
  
  // Filters
  setFilters: (filters: CategoryListParams) => void
  clearFilters: () => void
  
  // Selection
  selectCategory: (category: CategoryDetail | null) => void
  clearSelection: () => void
  
  // Refresh
  refresh: () => Promise<void>
  clearError: () => void
}

// =============================================================================
// Initial State
// الحالة الابتدائية
// =============================================================================

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
  categoryTree: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {},
}

// =============================================================================
// Hook Implementation
// تنفيذ الخطاف
// =============================================================================

export function useCategories(): UseCategoriesReturn {
  const [state, setState] = useState<CategoriesState>(initialState)
  
  // ===========================================================================
  // Fetch Categories
  // جلب الفئات
  // ===========================================================================
  
  const fetchCategories = useCallback(async (params?: CategoryListParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const mergedParams = { ...state.filters, ...params }
      const response = await getCategories({
        ...mergedParams,
        page: mergedParams.page || state.currentPage,
        page_size: mergedParams.page_size || state.pageSize,
      })
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: response.data!.results,
          totalCount: response.data!.count,
          hasNextPage: !!response.data!.next,
          hasPreviousPage: !!response.data!.previous,
          isLoading: false,
          filters: mergedParams,
        }))
      } else {
        throw new Error(response.message || 'Failed to fetch categories')
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      }))
    }
  }, [state.filters, state.currentPage, state.pageSize])
  
  // ===========================================================================
  // Fetch Single Category
  // جلب فئة واحدة
  // ===========================================================================
  
  const fetchCategory = useCallback(async (id: number): Promise<CategoryDetail | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await getCategory(id)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          selectedCategory: response.data,
          isLoading: false,
        }))
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch category')
      }
    } catch (err) {
      console.error('Failed to fetch category:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      }))
      return null
    }
  }, [])
  
  // ===========================================================================
  // Fetch Category Tree
  // جلب شجرة الفئات
  // ===========================================================================
  
  const fetchCategoryTree = useCallback(async (activeOnly: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await getCategoryTree(activeOnly)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categoryTree: response.data!,
          isLoading: false,
        }))
      } else {
        throw new Error(response.message || 'Failed to fetch category tree')
      }
    } catch (err) {
      console.error('Failed to fetch category tree:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      }))
    }
  }, [])
  
  // ===========================================================================
  // Create Category
  // إنشاء فئة
  // ===========================================================================
  
  const addCategory = useCallback(async (data: CategoryFormData): Promise<CategoryDetail | null> => {
    setState(prev => ({ ...prev, isCreating: true, error: null }))
    
    try {
      const response = await createCategory(data)
      
      if (response.success && response.data) {
        // Refresh the list
        await fetchCategories()
        
        setState(prev => ({
          ...prev,
          isCreating: false,
        }))
        
        return response.data
      } else {
        throw new Error(response.message || 'Failed to create category')
      }
    } catch (err) {
      console.error('Failed to create category:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isCreating: false,
      }))
      return null
    }
  }, [fetchCategories])
  
  // ===========================================================================
  // Update Category
  // تحديث فئة
  // ===========================================================================
  
  const editCategory = useCallback(async (
    id: number,
    data: Partial<CategoryFormData>
  ): Promise<CategoryDetail | null> => {
    setState(prev => ({ ...prev, isUpdating: true, error: null }))
    
    try {
      const response = await updateCategory(id, data)
      
      if (response.success && response.data) {
        // Update in local state
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat =>
            cat.id === id ? { ...cat, ...response.data } : cat
          ),
          selectedCategory: prev.selectedCategory?.id === id
            ? response.data
            : prev.selectedCategory,
          isUpdating: false,
        }))
        
        return response.data
      } else {
        throw new Error(response.message || 'Failed to update category')
      }
    } catch (err) {
      console.error('Failed to update category:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isUpdating: false,
      }))
      return null
    }
  }, [])
  
  // ===========================================================================
  // Delete Category
  // حذف فئة
  // ===========================================================================
  
  const removeCategory = useCallback(async (id: number): Promise<boolean> => {
    setState(prev => ({ ...prev, isDeleting: true, error: null }))
    
    try {
      const response = await deleteCategory(id)
      
      if (response.success) {
        // Remove from local state
        setState(prev => ({
          ...prev,
          categories: prev.categories.filter(cat => cat.id !== id),
          selectedCategory: prev.selectedCategory?.id === id
            ? null
            : prev.selectedCategory,
          totalCount: prev.totalCount - 1,
          isDeleting: false,
        }))
        
        return true
      } else {
        throw new Error(response.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Failed to delete category:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isDeleting: false,
      }))
      return false
    }
  }, [])
  
  // ===========================================================================
  // Toggle Active Status
  // تبديل حالة التفعيل
  // ===========================================================================
  
  const toggleActive = useCallback(async (id: number, isActive: boolean): Promise<boolean> => {
    try {
      const response = await toggleCategoryActive(id, isActive)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat =>
            cat.id === id ? { ...cat, is_active: isActive } : cat
          ),
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to toggle active:', err)
      return false
    }
  }, [])
  
  // ===========================================================================
  // Toggle Featured Status
  // تبديل حالة التمييز
  // ===========================================================================
  
  const toggleFeatured = useCallback(async (id: number, isFeatured: boolean): Promise<boolean> => {
    try {
      const response = await toggleCategoryFeatured(id, isFeatured)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          categories: prev.categories.map(cat =>
            cat.id === id ? { ...cat, is_featured: isFeatured } : cat
          ),
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to toggle featured:', err)
      return false
    }
  }, [])
  
  // ===========================================================================
  // Bulk Action
  // عملية مجمعة
  // ===========================================================================
  
  const bulkAction = useCallback(async (action: CategoryBulkAction): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await bulkCategoryAction(action)
      
      if (response.success) {
        // Refresh the list
        await fetchCategories()
        return true
      } else {
        throw new Error(response.message || 'Failed to perform bulk action')
      }
    } catch (err) {
      console.error('Failed to perform bulk action:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false,
      }))
      return false
    }
  }, [fetchCategories])
  
  // ===========================================================================
  // Pagination
  // الترقيم
  // ===========================================================================
  
  const goToPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])
  
  const setPageSize = useCallback((size: number) => {
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }))
  }, [])
  
  // ===========================================================================
  // Filters
  // الفلاتر
  // ===========================================================================
  
  const setFilters = useCallback((filters: CategoryListParams) => {
    setState(prev => ({
      ...prev,
      filters,
      currentPage: 1, // Reset to first page when filtering
    }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      currentPage: 1,
    }))
  }, [])
  
  // ===========================================================================
  // Selection
  // الاختيار
  // ===========================================================================
  
  const selectCategory = useCallback((category: CategoryDetail | null) => {
    setState(prev => ({ ...prev, selectedCategory: category }))
  }, [])
  
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedCategory: null }))
  }, [])
  
  // ===========================================================================
  // Refresh & Clear Error
  // التحديث ومسح الخطأ
  // ===========================================================================
  
  const refresh = useCallback(async () => {
    await fetchCategories()
  }, [fetchCategories])
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])
  
  // ===========================================================================
  // Effect: Fetch on page/pageSize change
  // تأثير: الجلب عند تغيير الصفحة/حجم الصفحة
  // ===========================================================================
  
  useEffect(() => {
    fetchCategories()
  }, [state.currentPage, state.pageSize]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // ===========================================================================
  // Return
  // الإرجاع
  // ===========================================================================
  
  return {
    ...state,
    fetchCategories,
    fetchCategory,
    fetchCategoryTree,
    addCategory,
    editCategory,
    removeCategory,
    toggleActive,
    toggleFeatured,
    bulkAction,
    goToPage,
    setPageSize,
    setFilters,
    clearFilters,
    selectCategory,
    clearSelection,
    refresh,
    clearError,
  }
}

