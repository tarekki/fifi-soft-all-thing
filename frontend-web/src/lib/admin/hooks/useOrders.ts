/**
 * useOrders Hook
 * خطاف إدارة الطلبات
 * 
 * Custom React hook for managing orders in the admin panel.
 * خطاف React مخصص لإدارة الطلبات في لوحة الإدارة.
 * 
 * Features:
 * - Fetch orders with filters and pagination
 * - Get order details
 * - Update order status
 * - Bulk actions
 * - Order statistics
 * - Loading and error states
 * 
 * الميزات:
 * - جلب الطلبات مع الفلاتر والترقيم
 * - الحصول على تفاصيل الطلب
 * - تحديث حالة الطلب
 * - عمليات مجمعة
 * - إحصائيات الطلبات
 * - حالات التحميل والأخطاء
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Order,
  OrderDetail,
  OrderFilters,
  OrderStatusUpdatePayload,
  OrderBulkActionPayload,
  OrderStats,
  OrderStatus,
} from '../types/orders'
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  bulkOrderAction,
  getOrderStats,
} from '../api/orders'


// =============================================================================
// Hook State Interface
// واجهة حالة الخطاف
// =============================================================================

interface UseOrdersState {
  /** قائمة الطلبات */
  orders: Order[]
  /** تفاصيل الطلب المحدد */
  selectedOrder: OrderDetail | null
  /** إحصائيات الطلبات */
  stats: OrderStats | null
  /** إجمالي عدد الطلبات */
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
  /** حالة تحديث الحالة */
  isUpdatingStatus: boolean
  /** حالة تحميل الإحصائيات */
  isLoadingStats: boolean
  /** رسالة الخطأ */
  error: string | null
}

interface UseOrdersReturn extends UseOrdersState {
  /** جلب الطلبات */
  fetchOrders: (filters?: OrderFilters) => Promise<void>
  /** جلب تفاصيل طلب */
  fetchOrderDetails: (id: number) => Promise<void>
  /** تحديث حالة طلب */
  updateStatus: (id: number, data: OrderStatusUpdatePayload) => Promise<boolean>
  /** تنفيذ عملية مجمعة */
  executeBulkAction: (payload: OrderBulkActionPayload) => Promise<boolean>
  /** جلب الإحصائيات */
  fetchStats: () => Promise<void>
  /** تحديث الفلاتر والجلب */
  setFilters: (filters: OrderFilters) => void
  /** الفلاتر الحالية */
  filters: OrderFilters
  /** مسح الطلب المحدد */
  clearSelectedOrder: () => void
  /** تحديث البيانات */
  refresh: () => void
}


// =============================================================================
// useOrders Hook
// =============================================================================

/**
 * Custom hook for managing orders
 * خطاف مخصص لإدارة الطلبات
 * 
 * @param initialFilters - Initial filters for orders list
 * @returns Orders state and functions
 * 
 * @example
 * const {
 *   orders,
 *   isLoading,
 *   fetchOrders,
 *   updateStatus,
 *   filters,
 *   setFilters,
 * } = useOrders({ status: 'pending' })
 */
export function useOrders(initialFilters: OrderFilters = {}): UseOrdersReturn {
  // =========================================================================
  // State
  // الحالة
  // =========================================================================
  
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [filters, setFiltersState] = useState<OrderFilters>(initialFilters)
  
  // Loading states
  // حالات التحميل
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Error state
  // حالة الخطأ
  const [error, setError] = useState<string | null>(null)
  
  
  // =========================================================================
  // Fetch Orders
  // جلب الطلبات
  // =========================================================================
  
  const fetchOrders = useCallback(async (customFilters?: OrderFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const appliedFilters = customFilters || filters
      const response = await getOrders(appliedFilters)
      
      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        // معالجة الاستجابات المُرقّمة وغير المُرقّمة
        if ('results' in response.data) {
          setOrders(response.data.results)
          setTotal(response.data.count)
          setHasNextPage(!!response.data.next)
          setHasPreviousPage(!!response.data.previous)
        } else if (Array.isArray(response.data)) {
          setOrders(response.data as unknown as Order[])
          setTotal((response.data as unknown as Order[]).length)
          setHasNextPage(false)
          setHasPreviousPage(false)
        }
        
        // Update current page from filters
        // تحديث الصفحة الحالية من الفلاتر
        setCurrentPage(appliedFilters.page || 1)
      } else {
        console.error('Failed to fetch orders:', response.message)
        setError(response.message || 'فشل في جلب الطلبات / Failed to fetch orders')
        setOrders([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching orders:', errorMessage)
      setError(errorMessage)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  
  // =========================================================================
  // Fetch Order Details
  // جلب تفاصيل الطلب
  // =========================================================================
  
  const fetchOrderDetails = useCallback(async (id: number) => {
    setIsLoadingDetails(true)
    setError(null)
    
    try {
      const response = await getOrder(id)
      
      if (response.success && response.data) {
        setSelectedOrder(response.data)
      } else {
        console.error('Failed to fetch order details:', response.message)
        setError(response.message || 'فشل في جلب تفاصيل الطلب / Failed to fetch order details')
        setSelectedOrder(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching order details:', errorMessage)
      setError(errorMessage)
      setSelectedOrder(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])
  
  
  // =========================================================================
  // Update Order Status
  // تحديث حالة الطلب
  // =========================================================================
  
  const updateStatus = useCallback(async (
    id: number,
    data: OrderStatusUpdatePayload
  ): Promise<boolean> => {
    setIsUpdatingStatus(true)
    setError(null)
    
    try {
      const response = await updateOrderStatus(id, data)
      
      if (response.success) {
        // Update order in list
        // تحديث الطلب في القائمة
        setOrders(prev => prev.map(order =>
          order.id === id
            ? { ...order, status: data.status, status_display: getStatusDisplay(data.status) }
            : order
        ))
        
        // Update selected order if it's the same
        // تحديث الطلب المحدد إذا كان نفسه
        if (selectedOrder && selectedOrder.id === id && response.data) {
          setSelectedOrder(response.data)
        }
        
        return true
      } else {
        console.error('Failed to update status:', response.message)
        setError(response.message || 'فشل في تحديث الحالة / Failed to update status')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating status:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsUpdatingStatus(false)
    }
  }, [selectedOrder])
  
  
  // =========================================================================
  // Execute Bulk Action
  // تنفيذ عملية مجمعة
  // =========================================================================
  
  const executeBulkAction = useCallback(async (
    payload: OrderBulkActionPayload
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await bulkOrderAction(payload)
      
      if (response.success) {
        // Refresh orders list after bulk action
        // تحديث قائمة الطلبات بعد العملية المجمعة
        await fetchOrders()
        return true
      } else {
        console.error('Bulk action failed:', response.message)
        setError(response.message || 'فشلت العملية المجمعة / Bulk action failed')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error in bulk action:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchOrders])
  
  
  // =========================================================================
  // Fetch Statistics
  // جلب الإحصائيات
  // =========================================================================
  
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    
    try {
      const response = await getOrderStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        console.error('Failed to fetch stats:', response.message)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])
  
  
  // =========================================================================
  // Set Filters
  // تعيين الفلاتر
  // =========================================================================
  
  const setFilters = useCallback((newFilters: OrderFilters) => {
    setFiltersState(newFilters)
  }, [])
  
  
  // =========================================================================
  // Clear Selected Order
  // مسح الطلب المحدد
  // =========================================================================
  
  const clearSelectedOrder = useCallback(() => {
    setSelectedOrder(null)
  }, [])
  
  
  // =========================================================================
  // Refresh
  // تحديث
  // =========================================================================
  
  const refresh = useCallback(() => {
    fetchOrders()
    fetchStats()
  }, [fetchOrders, fetchStats])
  
  
  // =========================================================================
  // Initial Fetch
  // الجلب الأولي
  // =========================================================================
  
  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Return
  // الإرجاع
  // =========================================================================
  
  return {
    // State
    orders,
    selectedOrder,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isUpdatingStatus,
    isLoadingStats,
    error,
    filters,
    
    // Functions
    fetchOrders,
    fetchOrderDetails,
    updateStatus,
    executeBulkAction,
    fetchStats,
    setFilters,
    clearSelectedOrder,
    refresh,
  }
}


// =============================================================================
// Helper Functions
// الدوال المساعدة
// =============================================================================

/**
 * Get display label for order status
 * الحصول على تسمية العرض لحالة الطلب
 */
function getStatusDisplay(status: OrderStatus): string {
  const statusLabels: Record<OrderStatus, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغى',
  }
  return statusLabels[status] || status
}


// =============================================================================
// Export Default
// =============================================================================

export default useOrders

