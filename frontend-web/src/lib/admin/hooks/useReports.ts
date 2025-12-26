'use client'

/**
 * useReports Hook
 * هوك التقارير
 * 
 * هذا الهوك يوفر جميع بيانات التقارير مع إدارة الحالة.
 * This hook provides all reports data with state management.
 * 
 * Features:
 * - Fetches reports data based on date range
 * - Loading and error states
 * - Export functionality
 * - Report type selection
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getSalesReport,
  getProductsReport,
  getUsersReport,
  getCommissionsReport,
  exportReport,
} from '../api'
import type {
  SalesReport,
  ProductsReport,
  UsersReport,
  CommissionsReport,
  DateRange,
  ReportType,
} from '../types/reports'

// =============================================================================
// Types
// الأنواع
// =============================================================================

interface UseReportsState {
  // Data
  // البيانات
  salesReport: SalesReport | null
  productsReport: ProductsReport | null
  usersReport: UsersReport | null
  commissionsReport: CommissionsReport | null
  
  // State
  // الحالة
  isLoading: boolean
  error: string | null
  
  // Settings
  // الإعدادات
  dateRange: DateRange
  reportType: ReportType
}

interface UseReportsReturn extends UseReportsState {
  // Actions
  // العمليات
  fetchSalesReport: () => Promise<void>
  fetchProductsReport: () => Promise<void>
  fetchUsersReport: () => Promise<void>
  fetchCommissionsReport: () => Promise<void>
  fetchAllReports: () => Promise<void>
  setDateRange: (range: DateRange) => void
  setReportType: (type: ReportType) => void
  exportReportAsWord: (type?: ReportType) => Promise<void>
}

// =============================================================================
// Hook
// الهوك
// =============================================================================

export function useReports(
  initialDateRange: DateRange = '30days',
  initialReportType: ReportType = 'sales'
): UseReportsReturn {
  // =================================================================
  // State
  // الحالة
  // =================================================================
  
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [productsReport, setProductsReport] = useState<ProductsReport | null>(null)
  const [usersReport, setUsersReport] = useState<UsersReport | null>(null)
  const [commissionsReport, setCommissionsReport] = useState<CommissionsReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRangeState] = useState<DateRange>(initialDateRange)
  const [reportType, setReportTypeState] = useState<ReportType>(initialReportType)
  
  // =================================================================
  // Fetch Functions
  // دوال الجلب
  // =================================================================
  
  const fetchSalesReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getSalesReport(dateRange)
      if (response?.success && response?.data) {
        console.log('Sales Report Data:', response.data)
        console.log('Orders in report:', response.data.orders)
        setSalesReport(response.data)
      } else {
        const errorMsg = response?.message || 'فشل في جلب تقرير المبيعات'
        setError(errorMsg)
        console.error('Failed to fetch sales report:', errorMsg)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب تقرير المبيعات'
      setError(message)
      console.error('Sales report fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])
  
  const fetchProductsReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getProductsReport(dateRange)
      if (response?.success && response?.data) {
        setProductsReport(response.data)
      } else {
        const errorMsg = response?.message || 'فشل في جلب تقرير المنتجات'
        setError(errorMsg)
        console.error('Failed to fetch products report:', errorMsg)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب تقرير المنتجات'
      setError(message)
      console.error('Products report fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])
  
  const fetchUsersReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getUsersReport(dateRange)
      if (response?.success && response?.data) {
        console.log('Users Report Data:', response.data)
        console.log('Users in report:', response.data.users)
        setUsersReport(response.data)
      } else {
        const errorMsg = response?.message || 'فشل في جلب تقرير المستخدمين'
        setError(errorMsg)
        console.error('Failed to fetch users report:', errorMsg)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب تقرير المستخدمين'
      setError(message)
      console.error('Users report fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])
  
  const fetchCommissionsReport = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getCommissionsReport(dateRange)
      if (response?.success && response?.data) {
        console.log('Commissions Report Data:', response.data)
        console.log('Commissions in report:', response.data.commissions)
        setCommissionsReport(response.data)
      } else {
        const errorMsg = response?.message || 'فشل في جلب تقرير العمولات'
        setError(errorMsg)
        console.error('Failed to fetch commissions report:', errorMsg)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب تقرير العمولات'
      setError(message)
      console.error('Commissions report fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])
  
  const fetchAllReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch all reports in parallel but don't set loading in individual functions
      const [salesResult, productsResult, usersResult, commissionsResult] = await Promise.allSettled([
        getSalesReport(dateRange),
        getProductsReport(dateRange),
        getUsersReport(dateRange),
        getCommissionsReport(dateRange),
      ])
      
      // Process sales report
      if (salesResult.status === 'fulfilled' && salesResult.value?.success && salesResult.value?.data) {
        setSalesReport(salesResult.value.data)
      }
      
      // Process products report
      if (productsResult.status === 'fulfilled' && productsResult.value?.success && productsResult.value?.data) {
        setProductsReport(productsResult.value.data)
      }
      
      // Process users report
      if (usersResult.status === 'fulfilled' && usersResult.value?.success && usersResult.value?.data) {
        setUsersReport(usersResult.value.data)
      }
      
      // Process commissions report
      if (commissionsResult.status === 'fulfilled' && commissionsResult.value?.success && commissionsResult.value?.data) {
        setCommissionsReport(commissionsResult.value.data)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب التقارير'
      setError(message)
      console.error('Reports fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])
  
  // =================================================================
  // Export Function
  // دالة التصدير
  // =================================================================
  
  const exportReportAsWord = useCallback(async (type?: ReportType) => {
    const reportTypeToExport = type || reportType
    
    try {
      const blob = await exportReport(reportTypeToExport, dateRange)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${reportTypeToExport}_${dateRange}_${new Date().toISOString().split('T')[0]}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تصدير التقرير'
      setError(message)
      console.error('Export error:', err)
    }
  }, [reportType, dateRange])
  
  // =================================================================
  // Setters
  // الدوال المعدلة
  // =================================================================
  
  const handleSetDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range)
  }, [])
  
  const handleSetReportType = useCallback((type: ReportType) => {
    setReportTypeState(type)
  }, [])
  
  // =================================================================
  // Auto Fetch on Date Range Change
  // الجلب التلقائي عند تغيير نطاق التاريخ
  // =================================================================
  
  // Initial fetch and fetch on date range change
  useEffect(() => {
    // Fetch all reports when date range changes
    // جلب جميع التقارير عند تغيير نطاق التاريخ
    setIsLoading(true)
    setError(null)
    
    const fetchAll = async () => {
      try {
        // Fetch all reports in parallel
        const [salesResult, productsResult, usersResult, commissionsResult] = await Promise.allSettled([
          getSalesReport(dateRange),
          getProductsReport(dateRange),
          getUsersReport(dateRange),
          getCommissionsReport(dateRange),
        ])
        
        // Process sales report
        console.log('📊 Sales Result:', {
          status: salesResult.status,
          hasValue: !!salesResult.value,
          success: salesResult.status === 'fulfilled' ? salesResult.value?.success : false,
          hasData: salesResult.status === 'fulfilled' ? !!salesResult.value?.data : false,
          message: salesResult.status === 'fulfilled' ? salesResult.value?.message : undefined,
          fullResponse: salesResult.status === 'fulfilled' ? salesResult.value : salesResult.reason,
        })
        
        if (salesResult.status === 'fulfilled' && salesResult.value?.success && salesResult.value?.data) {
          console.log('✅ Sales report loaded:', salesResult.value.data)
          setSalesReport(salesResult.value.data)
        } else if (salesResult.status === 'rejected') {
          console.error('❌ Sales report fetch error:', salesResult.reason)
          setError(`خطأ في جلب تقرير المبيعات: ${salesResult.reason}`)
        } else if (salesResult.status === 'fulfilled') {
          console.warn('⚠️ Sales report response:', salesResult.value)
          if (salesResult.value?.message) {
            setError(salesResult.value.message)
          }
        }
        
        // Process products report
        console.log('📦 Products Result:', {
          status: productsResult.status,
          hasValue: !!productsResult.value,
          success: productsResult.status === 'fulfilled' ? productsResult.value?.success : false,
          hasData: productsResult.status === 'fulfilled' ? !!productsResult.value?.data : false,
          message: productsResult.status === 'fulfilled' ? productsResult.value?.message : undefined,
        })
        
        if (productsResult.status === 'fulfilled' && productsResult.value?.success && productsResult.value?.data) {
          console.log('✅ Products report loaded:', productsResult.value.data)
          setProductsReport(productsResult.value.data)
        } else if (productsResult.status === 'rejected') {
          console.error('❌ Products report fetch error:', productsResult.reason)
        } else if (productsResult.status === 'fulfilled') {
          console.warn('⚠️ Products report response:', productsResult.value)
        }
        
        // Process users report
        console.log('👥 Users Result:', {
          status: usersResult.status,
          hasValue: !!usersResult.value,
          success: usersResult.status === 'fulfilled' ? usersResult.value?.success : false,
          hasData: usersResult.status === 'fulfilled' ? !!usersResult.value?.data : false,
        })
        
        if (usersResult.status === 'fulfilled' && usersResult.value?.success && usersResult.value?.data) {
          console.log('✅ Users report loaded:', usersResult.value.data)
          setUsersReport(usersResult.value.data)
        } else if (usersResult.status === 'rejected') {
          console.error('❌ Users report fetch error:', usersResult.reason)
        } else if (usersResult.status === 'fulfilled') {
          console.warn('⚠️ Users report response:', usersResult.value)
        }
        
        // Process commissions report
        console.log('💰 Commissions Result:', {
          status: commissionsResult.status,
          hasValue: !!commissionsResult.value,
          success: commissionsResult.status === 'fulfilled' ? commissionsResult.value?.success : false,
          hasData: commissionsResult.status === 'fulfilled' ? !!commissionsResult.value?.data : false,
        })
        
        if (commissionsResult.status === 'fulfilled' && commissionsResult.value?.success && commissionsResult.value?.data) {
          console.log('✅ Commissions report loaded:', commissionsResult.value.data)
          setCommissionsReport(commissionsResult.value.data)
        } else if (commissionsResult.status === 'rejected') {
          console.error('❌ Commissions report fetch error:', commissionsResult.reason)
        } else if (commissionsResult.status === 'fulfilled') {
          console.warn('⚠️ Commissions report response:', commissionsResult.value)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب التقارير'
        setError(message)
        console.error('Reports fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])
  
  // =================================================================
  // Return
  // الإرجاع
  // =================================================================
  
  return {
    // Data
    salesReport,
    productsReport,
    usersReport,
    commissionsReport,
    
    // State
    isLoading,
    error,
    dateRange,
    reportType,
    
    // Actions
    fetchSalesReport,
    fetchProductsReport,
    fetchUsersReport,
    fetchCommissionsReport,
    fetchAllReports,
    setDateRange: handleSetDateRange,
    setReportType: handleSetReportType,
    exportReportAsWord,
  }
}

