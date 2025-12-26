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
      await Promise.all([
        fetchSalesReport(),
        fetchProductsReport(),
        fetchUsersReport(),
        fetchCommissionsReport(),
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء جلب التقارير'
      setError(message)
      console.error('Reports fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchSalesReport, fetchProductsReport, fetchUsersReport, fetchCommissionsReport])
  
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
    // Fetch reports when date range changes
    // Always fetch sales and products reports for the main reports page
    fetchSalesReport()
    fetchProductsReport()
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

