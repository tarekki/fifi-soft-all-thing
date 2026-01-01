/**
 * useVendorApplications Hook
 * خطاف إدارة طلبات انضمام البائعين
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  VendorApplication,
  VendorApplicationDetail,
  VendorApplicationFilters,
  VendorApplicationApprovePayload,
  VendorApplicationRejectPayload,
  VendorApplicationStats,
} from '../types/vendorApplications'
import {
  getVendorApplications,
  getVendorApplication,
  approveVendorApplication,
  rejectVendorApplication,
  getVendorApplicationStats,
} from '../api/vendorApplications'


// =============================================================================
// Hook Return Interface
// واجهة الإرجاع
// =============================================================================

interface UseVendorApplicationsReturn {
  // State
  applications: VendorApplication[]
  selectedApplication: VendorApplicationDetail | null
  stats: VendorApplicationStats | null
  total: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  isLoadingDetails: boolean
  isProcessing: boolean
  isLoadingStats: boolean
  error: string | null
  filters: VendorApplicationFilters
  
  // Functions
  fetchApplications: (filters?: VendorApplicationFilters) => Promise<void>
  fetchApplicationDetails: (id: number) => Promise<void>
  approve: (id: number, data?: VendorApplicationApprovePayload) => Promise<boolean>
  reject: (id: number, data: VendorApplicationRejectPayload) => Promise<boolean>
  fetchStats: () => Promise<void>
  setFilters: (filters: VendorApplicationFilters) => void
  clearSelectedApplication: () => void
  refresh: () => void
}


// =============================================================================
// useVendorApplications Hook
// =============================================================================

export function useVendorApplications(
  initialFilters: VendorApplicationFilters = {}
): UseVendorApplicationsReturn {
  // =========================================================================
  // State
  // =========================================================================
  
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<VendorApplicationDetail | null>(null)
  const [stats, setStats] = useState<VendorApplicationStats | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [filters, setFiltersState] = useState<VendorApplicationFilters>(initialFilters)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Error state
  const [error, setError] = useState<string | null>(null)
  
  
  // =========================================================================
  // Fetch Applications
  // =========================================================================
  
  const fetchApplications = useCallback(async (customFilters?: VendorApplicationFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const appliedFilters = customFilters || filters
      const response = await getVendorApplications(appliedFilters)
      
      if (response.success && response.data) {
        if ('results' in response.data) {
          setApplications(response.data.results)
          setTotal(response.data.count)
          setHasNextPage(!!response.data.next)
          setHasPreviousPage(!!response.data.previous)
        } else if (Array.isArray(response.data)) {
          setApplications(response.data as unknown as VendorApplication[])
          setTotal((response.data as unknown as VendorApplication[]).length)
          setHasNextPage(false)
          setHasPreviousPage(false)
        }
        
        setCurrentPage(appliedFilters.page || 1)
      } else {
        console.error('Failed to fetch applications:', response.message)
        setError(response.message || 'فشل في جلب الطلبات')
        setApplications([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching applications:', errorMessage)
      setError(errorMessage)
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  
  // =========================================================================
  // Fetch Application Details
  // =========================================================================
  
  const fetchApplicationDetails = useCallback(async (id: number) => {
    setIsLoadingDetails(true)
    setError(null)
    
    try {
      const response = await getVendorApplication(id)
      
      if (response.success && response.data) {
        setSelectedApplication(response.data)
      } else {
        console.error('Failed to fetch application details:', response.message)
        setError(response.message || 'فشل في جلب تفاصيل الطلب')
        setSelectedApplication(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching application details:', errorMessage)
      setError(errorMessage)
      setSelectedApplication(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])
  
  
  // =========================================================================
  // Approve Application
  // =========================================================================
  
  const approve = useCallback(async (
    id: number,
    data?: VendorApplicationApprovePayload
  ): Promise<boolean | { temp_password: string }> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await approveVendorApplication(id, data)
      
      if (response.success) {
        // Refresh list and stats
        await fetchApplications()
        await fetchStats()
        
        // Update selected if same
        if (selectedApplication && selectedApplication.id === id) {
          setSelectedApplication(response.data || null)
        }
        
        // Debug: Log response data
        // تسجيل بيانات الاستجابة للتشخيص
        console.log('Approve response data:', response.data)
        console.log('Temp password in response:', response.data?.temp_password)
        
        // Return temp_password if available
        // إرجاع temp_password إذا كان متاحاً
        if (response.data?.temp_password) {
          console.log('Returning temp_password:', response.data.temp_password)
          return { temp_password: response.data.temp_password }
        }
        
        console.log('No temp_password in response (user probably already existed)')
        return true
      } else {
        console.error('Failed to approve application:', response.message)
        setError(response.message || 'فشل في الموافقة على الطلب')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error approving application:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchApplications, selectedApplication]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Reject Application
  // =========================================================================
  
  const reject = useCallback(async (
    id: number,
    data: VendorApplicationRejectPayload
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await rejectVendorApplication(id, data)
      
      if (response.success) {
        // Refresh list and stats
        await fetchApplications()
        await fetchStats()
        
        // Update selected if same
        if (selectedApplication && selectedApplication.id === id) {
          setSelectedApplication(response.data || null)
        }
        
        return true
      } else {
        console.error('Failed to reject application:', response.message)
        setError(response.message || 'فشل في رفض الطلب')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error rejecting application:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchApplications, selectedApplication]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Fetch Statistics
  // =========================================================================
  
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    
    try {
      const response = await getVendorApplicationStats()
      
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
  // =========================================================================
  
  const setFilters = useCallback((newFilters: VendorApplicationFilters) => {
    setFiltersState(newFilters)
  }, [])
  
  
  // =========================================================================
  // Clear Selected Application
  // =========================================================================
  
  const clearSelectedApplication = useCallback(() => {
    setSelectedApplication(null)
  }, [])
  
  
  // =========================================================================
  // Refresh
  // =========================================================================
  
  const refresh = useCallback(() => {
    fetchApplications()
    fetchStats()
  }, [fetchApplications, fetchStats])
  
  
  // =========================================================================
  // Initial Fetch
  // =========================================================================
  
  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Return
  // =========================================================================
  
  return {
    applications,
    selectedApplication,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isProcessing,
    isLoadingStats,
    error,
    filters,
    fetchApplications,
    fetchApplicationDetails,
    approve,
    reject,
    fetchStats,
    setFilters,
    clearSelectedApplication,
    refresh,
  }
}


export default useVendorApplications

