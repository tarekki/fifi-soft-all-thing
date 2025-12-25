/**
 * useVendors Hook
 * خطاف إدارة البائعين
 * 
 * Custom React hook for managing vendors in the admin panel.
 * خطاف React مخصص لإدارة البائعين في لوحة الإدارة.
 * 
 * Features:
 * - Fetch vendors with filters and pagination
 * - Create new vendor
 * - Get vendor details
 * - Update vendor
 * - Delete vendor
 * - Update status and commission
 * - Bulk actions
 * - Vendor statistics
 * - Loading and error states
 * 
 * الميزات:
 * - جلب البائعين مع الفلاتر والترقيم
 * - إنشاء بائع جديد
 * - الحصول على تفاصيل البائع
 * - تعديل البائع
 * - حذف البائع
 * - تحديث الحالة والعمولة
 * - عمليات مجمعة
 * - إحصائيات البائعين
 * - حالات التحميل والأخطاء
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Vendor,
  VendorDetail,
  VendorFilters,
  VendorCreatePayload,
  VendorUpdatePayload,
  VendorBulkActionPayload,
  VendorStats,
} from '../types/vendors'
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
  updateVendorCommission,
  bulkVendorAction,
  getVendorStats,
} from '../api/vendors'


// =============================================================================
// Hook State Interface
// واجهة حالة الخطاف
// =============================================================================

interface UseVendorsState {
  /** قائمة البائعين */
  vendors: Vendor[]
  /** تفاصيل البائع المحدد */
  selectedVendor: VendorDetail | null
  /** إحصائيات البائعين */
  stats: VendorStats | null
  /** إجمالي عدد البائعين */
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
  /** حالة الإنشاء/التعديل */
  isSaving: boolean
  /** حالة الحذف */
  isDeleting: boolean
  /** حالة تحميل الإحصائيات */
  isLoadingStats: boolean
  /** رسالة الخطأ */
  error: string | null
}

interface UseVendorsReturn extends UseVendorsState {
  /** جلب البائعين */
  fetchVendors: (filters?: VendorFilters) => Promise<void>
  /** جلب تفاصيل بائع */
  fetchVendorDetails: (id: number) => Promise<void>
  /** إنشاء بائع جديد */
  create: (data: VendorCreatePayload) => Promise<boolean>
  /** تعديل بائع */
  update: (id: number, data: VendorUpdatePayload) => Promise<boolean>
  /** حذف بائع */
  remove: (id: number) => Promise<boolean>
  /** تحديث حالة بائع */
  toggleStatus: (id: number, isActive: boolean) => Promise<boolean>
  /** تحديث عمولة بائع */
  updateCommission: (id: number, rate: number) => Promise<boolean>
  /** تنفيذ عملية مجمعة */
  executeBulkAction: (payload: VendorBulkActionPayload) => Promise<boolean>
  /** جلب الإحصائيات */
  fetchStats: () => Promise<void>
  /** تحديث الفلاتر والجلب */
  setFilters: (filters: VendorFilters) => void
  /** الفلاتر الحالية */
  filters: VendorFilters
  /** مسح البائع المحدد */
  clearSelectedVendor: () => void
  /** تحديث البيانات */
  refresh: () => void
}


// =============================================================================
// useVendors Hook
// =============================================================================

/**
 * Custom hook for managing vendors
 * خطاف مخصص لإدارة البائعين
 * 
 * @param initialFilters - Initial filters for vendors list
 * @returns Vendors state and functions
 */
export function useVendors(initialFilters: VendorFilters = {}): UseVendorsReturn {
  // =========================================================================
  // State
  // الحالة
  // =========================================================================
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<VendorDetail | null>(null)
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [filters, setFiltersState] = useState<VendorFilters>(initialFilters)
  
  // Loading states
  // حالات التحميل
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Error state
  // حالة الخطأ
  const [error, setError] = useState<string | null>(null)
  
  
  // =========================================================================
  // Fetch Vendors
  // جلب البائعين
  // =========================================================================
  
  const fetchVendors = useCallback(async (customFilters?: VendorFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const appliedFilters = customFilters || filters
      const response = await getVendors(appliedFilters)
      
      if (response.success && response.data) {
        // Handle both paginated and non-paginated responses
        // معالجة الاستجابات المُرقّمة وغير المُرقّمة
        if ('results' in response.data) {
          setVendors(response.data.results)
          setTotal(response.data.count)
          setHasNextPage(!!response.data.next)
          setHasPreviousPage(!!response.data.previous)
        } else if (Array.isArray(response.data)) {
          setVendors(response.data as unknown as Vendor[])
          setTotal((response.data as unknown as Vendor[]).length)
          setHasNextPage(false)
          setHasPreviousPage(false)
        }
        
        setCurrentPage(appliedFilters.page || 1)
      } else {
        console.error('Failed to fetch vendors:', response.message)
        setError(response.message || 'فشل في جلب البائعين / Failed to fetch vendors')
        setVendors([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching vendors:', errorMessage)
      setError(errorMessage)
      setVendors([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  
  // =========================================================================
  // Fetch Vendor Details
  // جلب تفاصيل البائع
  // =========================================================================
  
  const fetchVendorDetails = useCallback(async (id: number) => {
    setIsLoadingDetails(true)
    setError(null)
    
    try {
      const response = await getVendor(id)
      
      if (response.success && response.data) {
        setSelectedVendor(response.data)
      } else {
        console.error('Failed to fetch vendor details:', response.message)
        setError(response.message || 'فشل في جلب تفاصيل البائع / Failed to fetch vendor details')
        setSelectedVendor(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching vendor details:', errorMessage)
      setError(errorMessage)
      setSelectedVendor(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])
  
  
  // =========================================================================
  // Create Vendor
  // إنشاء بائع
  // =========================================================================
  
  const create = useCallback(async (data: VendorCreatePayload): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await createVendor(data)
      
      if (response.success) {
        // Refresh list after creation
        // تحديث القائمة بعد الإنشاء
        await fetchVendors()
        await fetchStats()
        return true
      } else {
        console.error('Failed to create vendor:', response.message)
        setError(response.message || 'فشل في إنشاء البائع / Failed to create vendor')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating vendor:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [fetchVendors]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Update Vendor
  // تعديل بائع
  // =========================================================================
  
  const update = useCallback(async (
    id: number,
    data: VendorUpdatePayload
  ): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await updateVendor(id, data)
      
      if (response.success && response.data) {
        // Update vendor in list
        // تحديث البائع في القائمة
        setVendors(prev => prev.map(v =>
          v.id === id ? { ...v, ...response.data } : v
        ))
        
        // Update selected vendor if same
        // تحديث البائع المحدد إذا كان نفسه
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(response.data)
        }
        
        return true
      } else {
        console.error('Failed to update vendor:', response.message)
        setError(response.message || 'فشل في تعديل البائع / Failed to update vendor')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating vendor:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [selectedVendor])
  
  
  // =========================================================================
  // Delete Vendor
  // حذف بائع
  // =========================================================================
  
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsDeleting(true)
    setError(null)
    
    try {
      const response = await deleteVendor(id)
      
      if (response.success) {
        // Remove vendor from list
        // إزالة البائع من القائمة
        setVendors(prev => prev.filter(v => v.id !== id))
        setTotal(prev => prev - 1)
        
        // Clear selected vendor if same
        // مسح البائع المحدد إذا كان نفسه
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(null)
        }
        
        // Refresh stats
        // تحديث الإحصائيات
        await fetchStats()
        
        return true
      } else {
        console.error('Failed to delete vendor:', response.message)
        setError(response.message || 'فشل في حذف البائع / Failed to delete vendor')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error deleting vendor:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [selectedVendor]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Toggle Vendor Status
  // تغيير حالة البائع
  // =========================================================================
  
  const toggleStatus = useCallback(async (
    id: number,
    isActive: boolean
  ): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await updateVendorStatus(id, { is_active: isActive })
      
      if (response.success && response.data) {
        // Update vendor in list
        // تحديث البائع في القائمة
        setVendors(prev => prev.map(v =>
          v.id === id ? { ...v, is_active: isActive } : v
        ))
        
        // Update selected vendor if same
        // تحديث البائع المحدد إذا كان نفسه
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(response.data)
        }
        
        // Refresh stats
        // تحديث الإحصائيات
        await fetchStats()
        
        return true
      } else {
        console.error('Failed to update vendor status:', response.message)
        setError(response.message || 'فشل في تحديث حالة البائع / Failed to update vendor status')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating vendor status:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [selectedVendor]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Update Commission
  // تحديث العمولة
  // =========================================================================
  
  const updateCommissionRate = useCallback(async (
    id: number,
    rate: number
  ): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await updateVendorCommission(id, { commission_rate: rate })
      
      if (response.success && response.data) {
        // Update vendor in list
        // تحديث البائع في القائمة
        setVendors(prev => prev.map(v =>
          v.id === id ? { ...v, commission_rate: rate } : v
        ))
        
        // Update selected vendor if same
        // تحديث البائع المحدد إذا كان نفسه
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(response.data)
        }
        
        return true
      } else {
        console.error('Failed to update commission:', response.message)
        setError(response.message || 'فشل في تحديث العمولة / Failed to update commission')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating commission:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [selectedVendor])
  
  
  // =========================================================================
  // Execute Bulk Action
  // تنفيذ عملية مجمعة
  // =========================================================================
  
  const executeBulkAction = useCallback(async (
    payload: VendorBulkActionPayload
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await bulkVendorAction(payload)
      
      if (response.success) {
        // Refresh vendors list
        // تحديث قائمة البائعين
        await fetchVendors()
        await fetchStats()
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
  }, [fetchVendors]) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Fetch Statistics
  // جلب الإحصائيات
  // =========================================================================
  
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)
    
    try {
      const response = await getVendorStats()
      
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
  
  const setFilters = useCallback((newFilters: VendorFilters) => {
    setFiltersState(newFilters)
  }, [])
  
  
  // =========================================================================
  // Clear Selected Vendor
  // مسح البائع المحدد
  // =========================================================================
  
  const clearSelectedVendor = useCallback(() => {
    setSelectedVendor(null)
  }, [])
  
  
  // =========================================================================
  // Refresh
  // تحديث
  // =========================================================================
  
  const refresh = useCallback(() => {
    fetchVendors()
    fetchStats()
  }, [fetchVendors, fetchStats])
  
  
  // =========================================================================
  // Initial Fetch
  // الجلب الأولي
  // =========================================================================
  
  useEffect(() => {
    fetchVendors()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  
  // =========================================================================
  // Return
  // الإرجاع
  // =========================================================================
  
  return {
    // State
    vendors,
    selectedVendor,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isSaving,
    isDeleting,
    isLoadingStats,
    error,
    filters,
    
    // Functions
    fetchVendors,
    fetchVendorDetails,
    create,
    update,
    remove,
    toggleStatus,
    updateCommission: updateCommissionRate,
    executeBulkAction,
    fetchStats,
    setFilters,
    clearSelectedVendor,
    refresh,
  }
}


// =============================================================================
// Export Default
// =============================================================================

export default useVendors

