/**
 * useCarts Hook
 * خطاف إدارة السلل
 * 
 * Custom React hook for managing carts in the admin panel.
 * خطاف React مخصص لإدارة السلل في لوحة الإدارة.
 * 
 * Features:
 * - Fetch carts with filters and pagination
 * - Get cart details
 * - Add item to user's cart
 * - Update item in user's cart
 * - Remove item from user's cart
 * - Clear user's cart
 * - Delete cart
 * - Cart statistics
 * - Loading and error states
 * 
 * الميزات:
 * - جلب السلل مع الفلاتر والترقيم
 * - الحصول على تفاصيل السلة
 * - إضافة عنصر لسلة مستخدم
 * - تحديث عنصر في سلة مستخدم
 * - إزالة عنصر من سلة مستخدم
 * - مسح سلة مستخدم
 * - حذف سلة
 * - إحصائيات السلل
 * - حالات التحميل والأخطاء
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Cart,
  CartDetail,
  CartFilters,
  CartStats,
  CartItemAddPayload,
  CartItemUpdatePayload,
} from '../types/carts'
import {
  getCarts,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  deleteCart,
  getCartStats,
} from '../api/carts'


// =============================================================================
// Hook State Interface
// واجهة حالة الخطاف
// =============================================================================

interface UseCartsState {
  /** قائمة السلل */
  carts: Cart[]
  /** تفاصيل السلة المحددة */
  selectedCart: CartDetail | null
  /** إحصائيات السلل */
  stats: CartStats | null
  /** إجمالي عدد السلل */
  total: number
  /** الصفحة الحالية */
  currentPage: number
  /** هل هناك صفحة تالية */
  hasNextPage: boolean
  /** هل هناك صفحة سابقة */
  hasPreviousPage: boolean
  /** حالة التحميل العامة */
  isLoading: boolean
  /** حالة تحميل التفاصيل */
  isLoadingDetails: boolean
  /** حالة إضافة عنصر */
  isAddingItem: boolean
  /** حالة تحديث عنصر */
  isUpdatingItem: boolean
  /** حالة إزالة عنصر */
  isRemovingItem: boolean
  /** حالة مسح السلة */
  isClearingCart: boolean
  /** حالة حذف السلة */
  isDeletingCart: boolean
  /** حالة تحميل الإحصائيات */
  isLoadingStats: boolean
  /** رسالة الخطأ */
  error: string | null
}

interface UseCartsReturn extends UseCartsState {
  /** جلب السلل */
  fetchCarts: (filters?: CartFilters) => Promise<void>
  /** جلب تفاصيل سلة */
  fetchCartDetails: (id: number) => Promise<void>
  /** إضافة عنصر لسلة */
  addItem: (id: number, data: CartItemAddPayload) => Promise<boolean>
  /** تحديث عنصر في سلة */
  updateItem: (id: number, itemId: number, data: CartItemUpdatePayload) => Promise<boolean>
  /** إزالة عنصر من سلة */
  removeItem: (id: number, itemId: number) => Promise<boolean>
  /** مسح سلة */
  clearCartItems: (id: number) => Promise<boolean>
  /** حذف سلة */
  deleteCartById: (id: number) => Promise<boolean>
  /** جلب الإحصائيات */
  fetchStats: () => Promise<void>
  /** تحديث الفلاتر والجلب */
  setFilters: (filters: CartFilters) => void
  /** الفلاتر الحالية */
  filters: CartFilters
  /** مسح السلة المحددة */
  clearSelectedCart: () => void
  /** تحديث البيانات */
  refresh: () => void
}


// =============================================================================
// useCarts Hook
// =============================================================================

/**
 * Custom hook for managing carts
 * خطاف مخصص لإدارة السلل
 * 
 * @param initialFilters - Initial filters for carts list
 * @returns Carts state and functions
 * 
 * @example
 * const {
 *   carts,
 *   isLoading,
 *   fetchCarts,
 *   addItem,
 *   filters,
 *   setFilters,
 * } = useCarts({ is_guest: false })
 */
export function useCarts(initialFilters: CartFilters = {}): UseCartsReturn {
  // =========================================================================
  // State
  // الحالة
  // =========================================================================
  
  const [carts, setCarts] = useState<Cart[]>([])
  const [selectedCart, setSelectedCart] = useState<CartDetail | null>(null)
  const [stats, setStats] = useState<CartStats | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [filters, setFiltersState] = useState<CartFilters>(initialFilters)
  
  // Loading states
  // حالات التحميل
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isUpdatingItem, setIsUpdatingItem] = useState(false)
  const [isRemovingItem, setIsRemovingItem] = useState(false)
  const [isClearingCart, setIsClearingCart] = useState(false)
  const [isDeletingCart, setIsDeletingCart] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Error state
  // حالة الخطأ
  const [error, setError] = useState<string | null>(null)
  
  
  // =========================================================================
  // Fetch Carts
  // جلب السلل
  // =========================================================================
  
  const fetchCarts = useCallback(async (customFilters?: CartFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const appliedFilters = customFilters || filters
      const response = await getCarts(appliedFilters)
      
      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        // معالجة الاستجابات المُرقّمة وغير المُرقّمة
        if ('results' in response.data) {
          setCarts(response.data.results)
          setTotal(response.data.count)
          setHasNextPage(!!response.data.next)
          setHasPreviousPage(!!response.data.previous)
        } else if (Array.isArray(response.data)) {
          setCarts(response.data as unknown as Cart[])
          setTotal((response.data as unknown as Cart[]).length)
          setHasNextPage(false)
          setHasPreviousPage(false)
        }
        
        // Update current page from filters
        // تحديث الصفحة الحالية من الفلاتر
        setCurrentPage(appliedFilters.page || 1)
      } else {
        console.error('Failed to fetch carts:', response.message)
        setError(response.message || 'فشل في جلب السلل / Failed to fetch carts')
        setCarts([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching carts:', errorMessage)
      setError(errorMessage)
      setCarts([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  
  // =========================================================================
  // Fetch Cart Details
  // جلب تفاصيل السلة
  // =========================================================================
  
  const fetchCartDetails = useCallback(async (id: number) => {
    setIsLoadingDetails(true)
    setError(null)
    
    try {
      const response = await getCart(id)
      
      if (response.success && response.data) {
        setSelectedCart(response.data)
      } else {
        console.error('Failed to fetch cart details:', response.message)
        setError(response.message || 'فشل في جلب تفاصيل السلة / Failed to fetch cart details')
        setSelectedCart(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching cart details:', errorMessage)
      setError(errorMessage)
      setSelectedCart(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])
  
  
  // =========================================================================
  // Add Item to Cart
  // إضافة عنصر للسلة
  // =========================================================================
  
  const addItem = useCallback(async (
    id: number,
    data: CartItemAddPayload
  ): Promise<boolean> => {
    setIsAddingItem(true)
    setError(null)
    
    try {
      const response = await addCartItem(id, data)
      
      if (response.success && response.data) {
        // Update cart in list
        // تحديث السلة في القائمة
        setCarts(prev => prev.map(cart =>
          cart.id === id
            ? {
                ...cart,
                item_count: response.data!.item_count,
                subtotal: response.data!.subtotal,
                updated_at: response.data!.updated_at,
              }
            : cart
        ))
        
        // Update selected cart if it's the same
        // تحديث السلة المحددة إذا كانت نفسها
        if (selectedCart?.id === id) {
          setSelectedCart(response.data)
        }
        
        return true
      } else {
        console.error('Failed to add item:', response.message)
        setError(response.message || 'فشل في إضافة العنصر / Failed to add item')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error adding item:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsAddingItem(false)
    }
  }, [selectedCart])
  
  
  // =========================================================================
  // Update Cart Item
  // تحديث عنصر السلة
  // =========================================================================
  
  const updateItem = useCallback(async (
    id: number,
    itemId: number,
    data: CartItemUpdatePayload
  ): Promise<boolean> => {
    setIsUpdatingItem(true)
    setError(null)
    
    try {
      const response = await updateCartItem(id, itemId, data)
      
      if (response.success && response.data) {
        // Update cart in list
        // تحديث السلة في القائمة
        setCarts(prev => prev.map(cart =>
          cart.id === id
            ? {
                ...cart,
                item_count: response.data!.item_count,
                subtotal: response.data!.subtotal,
                updated_at: response.data!.updated_at,
              }
            : cart
        ))
        
        // Update selected cart if it's the same
        // تحديث السلة المحددة إذا كانت نفسها
        if (selectedCart?.id === id) {
          setSelectedCart(response.data)
        }
        
        return true
      } else {
        console.error('Failed to update item:', response.message)
        setError(response.message || 'فشل في تحديث العنصر / Failed to update item')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating item:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsUpdatingItem(false)
    }
  }, [selectedCart])
  
  
  // =========================================================================
  // Remove Cart Item
  // إزالة عنصر السلة
  // =========================================================================
  
  const removeItem = useCallback(async (
    id: number,
    itemId: number
  ): Promise<boolean> => {
    setIsRemovingItem(true)
    setError(null)
    
    try {
      const response = await removeCartItem(id, itemId)
      
      if (response.success && response.data) {
        // Update cart in list
        // تحديث السلة في القائمة
        setCarts(prev => prev.map(cart =>
          cart.id === id
            ? {
                ...cart,
                item_count: response.data!.item_count,
                subtotal: response.data!.subtotal,
                updated_at: response.data!.updated_at,
              }
            : cart
        ))
        
        // Update selected cart if it's the same
        // تحديث السلة المحددة إذا كانت نفسها
        if (selectedCart?.id === id) {
          setSelectedCart(response.data)
        }
        
        return true
      } else {
        console.error('Failed to remove item:', response.message)
        setError(response.message || 'فشل في إزالة العنصر / Failed to remove item')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error removing item:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsRemovingItem(false)
    }
  }, [selectedCart])
  
  
  // =========================================================================
  // Clear Cart
  // مسح السلة
  // =========================================================================
  
  const clearCartItems = useCallback(async (id: number): Promise<boolean> => {
    setIsClearingCart(true)
    setError(null)
    
    try {
      const response = await clearCart(id)
      
      if (response.success && response.data) {
        // Update cart in list
        // تحديث السلة في القائمة
        setCarts(prev => prev.map(cart =>
          cart.id === id
            ? {
                ...cart,
                item_count: 0,
                subtotal: '0.00',
                updated_at: response.data!.updated_at,
              }
            : cart
        ))
        
        // Update selected cart if it's the same
        // تحديث السلة المحددة إذا كانت نفسها
        if (selectedCart?.id === id) {
          setSelectedCart(response.data)
        }
        
        return true
      } else {
        console.error('Failed to clear cart:', response.message)
        setError(response.message || 'فشل في مسح السلة / Failed to clear cart')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error clearing cart:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsClearingCart(false)
    }
  }, [selectedCart])
  
  
  // =========================================================================
  // Delete Cart
  // حذف السلة
  // =========================================================================
  
  const deleteCartById = useCallback(async (id: number): Promise<boolean> => {
    setIsDeletingCart(true)
    setError(null)
    
    try {
      const response = await deleteCart(id)
      
      if (response.success) {
        // Remove cart from list
        // إزالة السلة من القائمة
        setCarts(prev => prev.filter(cart => cart.id !== id))
        
        // Clear selected cart if it's the same
        // مسح السلة المحددة إذا كانت نفسها
        if (selectedCart?.id === id) {
          setSelectedCart(null)
        }
        
        return true
      } else {
        console.error('Failed to delete cart:', response.message)
        setError(response.message || 'فشل في حذف السلة / Failed to delete cart')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error deleting cart:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsDeletingCart(false)
    }
  }, [selectedCart])
  
  
  // =========================================================================
  // Fetch Statistics
  // جلب الإحصائيات
  // =========================================================================
  
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    setError(null)
    
    try {
      const response = await getCartStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        console.error('Failed to fetch cart stats:', response.message)
        setError(response.message || 'فشل في جلب إحصائيات السلل / Failed to fetch cart stats')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching cart stats:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])
  
  
  // =========================================================================
  // Set Filters
  // تعيين الفلاتر
  // =========================================================================
  
  const setFilters = useCallback((newFilters: CartFilters) => {
    setFiltersState(newFilters)
  }, [])
  
  
  // =========================================================================
  // Clear Selected Cart
  // مسح السلة المحددة
  // =========================================================================
  
  const clearSelectedCart = useCallback(() => {
    setSelectedCart(null)
  }, [])
  
  
  // =========================================================================
  // Refresh
  // تحديث
  // =========================================================================
  
  const refresh = useCallback(() => {
    fetchCarts()
    fetchStats()
  }, [fetchCarts, fetchStats])
  
  
  // =========================================================================
  // Initial Fetch
  // الجلب الأولي
  // =========================================================================
  
  useEffect(() => {
    fetchCarts()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Return
  // الإرجاع
  // =========================================================================
  
  return {
    // State
    carts,
    selectedCart,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem,
    isClearingCart,
    isDeletingCart,
    isLoadingStats,
    error,
    filters,
    
    // Functions
    fetchCarts,
    fetchCartDetails,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    deleteCartById,
    fetchStats,
    setFilters,
    clearSelectedCart,
    refresh,
  }
}

