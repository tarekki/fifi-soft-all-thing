'use client'

/**
 * useDashboard Hook
 * هوك لوحة التحكم
 * 
 * هذا الهوك يوفر جميع بيانات لوحة التحكم مع إدارة الحالة.
 * This hook provides all dashboard data with state management.
 * 
 * Features:
 * - Fetches all dashboard data in parallel
 * - Loading and error states
 * - Auto-refresh capability
 * - Chart period selection
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getDashboardOverview,
  getSalesChart,
  getRecentOrders,
  getRecentActivity,
} from '../api'
import type {
  DashboardOverview,
  SalesChartData,
  RecentOrder,
  RecentActivity,
} from '../types'

// Internal type for processed chart data (revenue converted to numbers)
// نوع داخلي لبيانات الرسم البياني المعالجة (revenue محول إلى أرقام)
interface ProcessedSalesChartData {
  labels: string[]
  revenue: number[]  // Converted from string[] for display
  orders: number[]
  period: 'week' | 'month' | 'year'
}

// =============================================================================
// Types
// الأنواع
// =============================================================================

type ChartPeriod = 'week' | 'month' | 'year'

interface UseDashboardState {
  // Data
  // البيانات
  overview: DashboardOverview | null
  salesChart: ProcessedSalesChartData | null  // Processed: revenue as number[]
  recentOrders: RecentOrder[]
  recentActivity: RecentActivity[]
  
  // State
  // الحالة
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Chart period
  // فترة الرسم البياني
  chartPeriod: ChartPeriod
}

interface UseDashboardReturn extends UseDashboardState {
  // Actions
  // العمليات
  refresh: () => Promise<void>
  setChartPeriod: (period: ChartPeriod) => void
}

// =============================================================================
// Hook
// الهوك
// =============================================================================

export function useDashboard(
  autoRefreshInterval?: number // in milliseconds, e.g., 30000 for 30 seconds
): UseDashboardReturn {
  // =================================================================
  // State
  // الحالة
  // =================================================================
  
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [salesChart, setSalesChart] = useState<SalesChartData | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('week')
  
  // =================================================================
  // Fetch All Data
  // جلب جميع البيانات
  // =================================================================
  
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)
    
    try {
      // Fetch all data in parallel for better performance
      // جلب جميع البيانات بشكل متوازي لأداء أفضل
      const [overviewRes, chartRes, ordersRes, activityRes] = await Promise.all([
        getDashboardOverview(),
        getSalesChart(chartPeriod),
        getRecentOrders(10),
        getRecentActivity(10),
      ])
      
      // Update state with results
      // تحديث الحالة بالنتائج
      if (overviewRes?.success && overviewRes?.data) {
        setOverview(overviewRes.data)
      } else if (overviewRes && !overviewRes.success) {
        const errorMsg = overviewRes.message || 'فشل في جلب نظرة عامة على لوحة التحكم'
        console.error('Failed to fetch overview:', errorMsg)
        setError(errorMsg)
      }
      
      if (chartRes?.success && chartRes?.data) {
        // Convert revenue strings to numbers for display
        // تحويل revenue من strings إلى numbers للعرض
        const processedChart: ProcessedSalesChartData = {
          labels: chartRes.data.labels,
          revenue: chartRes.data.revenue.map((v) => Number.parseFloat(v || '0') || 0),
          orders: chartRes.data.orders,
          period: chartRes.data.period,
        }
        setSalesChart(processedChart)
      } else if (chartRes && !chartRes.success) {
        const errorMsg = chartRes.message || 'فشل في جلب بيانات الرسم البياني'
        console.error('Failed to fetch chart:', errorMsg)
      }
      
      if (ordersRes?.success && ordersRes?.data) {
        setRecentOrders(ordersRes.data)
      } else if (ordersRes && !ordersRes.success) {
        const errorMsg = ordersRes.message || 'فشل في جلب الطلبات الأخيرة'
        console.error('Failed to fetch orders:', errorMsg)
      }
      
      if (activityRes?.success && activityRes?.data) {
        setRecentActivity(activityRes.data)
      } else if (activityRes && !activityRes.success) {
        const errorMsg = activityRes.message || 'فشل في جلب النشاطات الأخيرة'
        console.error('Failed to fetch activity:', errorMsg)
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات'
      setError(message)
      console.error('Dashboard fetch error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [chartPeriod])
  
  // =================================================================
  // Refresh Function
  // دالة التحديث
  // =================================================================
  
  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])
  
  // =================================================================
  // Handle Chart Period Change
  // معالجة تغيير فترة الرسم البياني
  // =================================================================
  
  const handleSetChartPeriod = useCallback((period: ChartPeriod) => {
    setChartPeriod(period)
  }, [])
  
  // =================================================================
  // Initial Fetch
  // الجلب الأولي
  // =================================================================
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // =================================================================
  // Auto Refresh
  // التحديث التلقائي
  // =================================================================
  
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval < 5000) {
      return
    }
    
    const interval = setInterval(() => {
      fetchData(true)
    }, autoRefreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefreshInterval, fetchData])
  
  // =================================================================
  // Return
  // الإرجاع
  // =================================================================
  
  return {
    // Data
    overview,
    salesChart,
    recentOrders,
    recentActivity,
    
    // State
    isLoading,
    isRefreshing,
    error,
    chartPeriod,
    
    // Actions
    refresh,
    setChartPeriod: handleSetChartPeriod,
  }
}

