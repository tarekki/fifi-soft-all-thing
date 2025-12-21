/**
 * useOrders Hook
 * Hook للطلبات
 * 
 * Custom hook for order data fetching and management
 * Hook مخصص لجلب وإدارة بيانات الطلبات
 * 
 * Features:
 * - Fetch orders with filtering and pagination
 * - Fetch order by ID
 * - Create order
 * - Update order status
 * - Cancel order
 * 
 * المميزات:
 * - جلب الطلبات مع الفلترة والترقيم
 * - جلب طلب بالمعرف
 * - إنشاء طلب
 * - تحديث حالة الطلب
 * - إلغاء طلب
 */

'use client'

import { useState, useCallback } from 'react'
import * as orderActions from '@/lib/actions/order.actions'
import type { Order, CreateOrderDTO, OrderStatus } from '@/types/order'
import type { ApiPaginatedResponse } from '@/types/api'

interface UseOrdersOptions {
  vendor_id?: number
  status?: OrderStatus
  order_type?: 'online' | 'pos'
  page?: number
  search?: string
}

interface UseOrdersReturn {
  orders: Order[]
  pagination: ApiPaginatedResponse<Order>['data']['pagination'] | null
  isLoading: boolean
  error: string | null
  fetchOrders: (options?: UseOrdersOptions) => Promise<void>
  createOrder: (data: CreateOrderDTO) => Promise<Order>
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<Order>
  cancelOrder: (id: number) => Promise<Order>
  clearError: () => void
}

/**
 * useOrders Hook
 * 
 * @param initialOptions - Initial fetch options
 * @returns Orders data and operations
 */
export function useOrders(initialOptions?: UseOrdersOptions): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<ApiPaginatedResponse<Order>['data']['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch orders
   * جلب الطلبات
   */
  const fetchOrders = useCallback(async (options?: UseOrdersOptions) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = { ...initialOptions, ...options }
      const response = await orderActions.getOrdersAction(params)
      
      if (response.success && response.data) {
        setOrders(response.data.results)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || 'Failed to fetch orders')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      setOrders([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [initialOptions])

  /**
   * Create order
   * إنشاء طلب
   */
  const createOrder = useCallback(async (data: CreateOrderDTO): Promise<Order> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const order = await orderActions.createOrderAction(data)
      
      // Refresh orders list
      // تحديث قائمة الطلبات
      await fetchOrders()
      
      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchOrders])

  /**
   * Update order status
   * تحديث حالة الطلب
   */
  const updateOrderStatus = useCallback(async (id: number, status: OrderStatus): Promise<Order> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const order = await orderActions.updateOrderStatusAction(id, status)
      
      // Update order in list
      // تحديث الطلب في القائمة
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? order : o))
      )
      
      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Cancel order
   * إلغاء طلب
   */
  const cancelOrder = useCallback(async (id: number): Promise<Order> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const order = await orderActions.cancelOrderAction(id)
      
      // Update order in list
      // تحديث الطلب في القائمة
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? order : o))
      )
      
      return order
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(errorMessage)
      throw err
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
    orders,
    pagination,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    clearError,
  }
}

/**
 * useOrder Hook
 * Hook لطلب واحد
 * 
 * Custom hook for fetching a single order by ID
 * Hook مخصص لجلب طلب واحد بالمعرف
 */
interface UseOrderReturn {
  order: Order | null
  isLoading: boolean
  error: string | null
  fetchOrder: (id: number) => Promise<void>
  clearError: () => void
}

export function useOrder(): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch order by ID
   * جلب طلب بالمعرف
   */
  const fetchOrder = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const orderData = await orderActions.getOrderByIdAction(id)
      setOrder(orderData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order'
      setError(errorMessage)
      setOrder(null)
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
    order,
    isLoading,
    error,
    fetchOrder,
    clearError,
  }
}

