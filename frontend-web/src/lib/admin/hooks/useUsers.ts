/**
 * useUsers Hook
 * خطاف إدارة المستخدمين
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  User,
  UserDetail,
  UserFilters,
  UserCreatePayload,
  UserUpdatePayload,
  UserStatusUpdatePayload,
  UserBulkActionPayload,
  UserStats,
} from '../types/users'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUserAction,
  getUserStats,
} from '../api/users'


// =============================================================================
// Hook Return Interface
// واجهة الإرجاع
// =============================================================================

interface UseUsersReturn {
  // State
  users: User[]
  selectedUser: UserDetail | null
  stats: UserStats | null
  total: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  isLoadingDetails: boolean
  isProcessing: boolean
  isLoadingStats: boolean
  error: string | null
  filters: UserFilters

  // Functions
  fetchUsers: (filters?: UserFilters) => Promise<void>
  fetchUserDetails: (id: number) => Promise<void>
  create: (data: UserCreatePayload) => Promise<boolean>
  update: (id: number, data: UserUpdatePayload) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  updateStatus: (id: number, data: UserStatusUpdatePayload) => Promise<boolean>
  bulkAction: (data: UserBulkActionPayload) => Promise<boolean>
  fetchStats: () => Promise<void>
  setFilters: (filters: UserFilters) => void
  clearSelectedUser: () => void
  refresh: () => void
}


// =============================================================================
// useUsers Hook
// =============================================================================

export function useUsers(
  initialFilters: UserFilters = {}
): UseUsersReturn {
  // =========================================================================
  // State
  // =========================================================================

  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Ref to store refresh function (defined later)
  // مرجع لحفظ دالة refresh (معرّفة لاحقاً)
  const refreshRef = useRef<(() => void) | null>(null)


  // =========================================================================
  // Fetch Users
  // =========================================================================

  const fetchUsers = useCallback(async (customFilters?: UserFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const appliedFilters = customFilters || filters
      const response = await getUsers(appliedFilters)

      if (response.success && response.data) {
        if ('results' in response.data) {
          setUsers(response.data.results)
          setTotal(response.data.count)
          setHasNextPage(!!response.data.next)
          setHasPreviousPage(!!response.data.previous)
        } else if (Array.isArray(response.data)) {
          setUsers(response.data as unknown as User[])
          setTotal((response.data as unknown as User[]).length)
          setHasNextPage(false)
          setHasPreviousPage(false)
        }

        setCurrentPage(appliedFilters.page || 1)
      } else {
        console.error('Failed to fetch users:', response.message)
        setError(response.message || 'فشل في جلب المستخدمين')
        setUsers([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching users:', errorMessage)
      setError(errorMessage)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])


  // =========================================================================
  // Fetch User Details
  // =========================================================================

  const fetchUserDetails = useCallback(async (id: number) => {
    setIsLoadingDetails(true)
    setError(null)

    try {
      const response = await getUser(id)

      if (response.success && response.data) {
        setSelectedUser(response.data)
      } else {
        console.error('Failed to fetch user details:', response.message)
        setError(response.message || 'فشل في جلب تفاصيل المستخدم')
        setSelectedUser(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error fetching user details:', errorMessage)
      setError(errorMessage)
      setSelectedUser(null)
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])


  // =========================================================================
  // Create User
  // =========================================================================

  const create = useCallback(async (data: UserCreatePayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await createUser(data)

      if (response.success) {
        // Refresh list and stats
        await fetchUsers()
        await fetchStats()
        return true
      } else {
        console.error('Failed to create user:', response.message, response.errors)

        // Extract detailed error message
        let errorMsg = response.message || 'فشل في إنشاء المستخدم'
        if (response.errors) {
          if (typeof response.errors === 'object') {
            const errorValues = Object.values(response.errors).flat()
            if (errorValues.length > 0) {
              errorMsg = String(errorValues[0])
            }
          } else {
            errorMsg = String(response.errors)
          }
        }

        setError(errorMsg)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating user:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchUsers]) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Update User
  // =========================================================================

  const update = useCallback(async (
    id: number,
    data: UserUpdatePayload
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await updateUser(id, data)

      if (response.success) {
        // Refresh list and stats
        await fetchUsers()
        await fetchStats()

        // Update selected if same
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser(response.data || null)
        }

        return true
      } else {
        console.error('Failed to update user:', response.message, response.errors)

        // Extract detailed error message
        let errorMsg = response.message || 'فشل في تحديث المستخدم'
        if (response.errors) {
          if (typeof response.errors === 'object') {
            const errorValues = Object.values(response.errors).flat()
            if (errorValues.length > 0) {
              errorMsg = String(errorValues[0])
            }
          } else {
            errorMsg = String(response.errors)
          }
        }

        setError(errorMsg)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating user:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchUsers, selectedUser]) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Delete User
  // =========================================================================

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await deleteUser(id)

      if (response.success) {
        // Refresh list and stats
        await fetchUsers()
        await fetchStats()

        // Clear selected if same
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser(null)
        }

        return true
      } else {
        console.error('Failed to delete user:', response.message)
        setError(response.message || 'فشل في حذف المستخدم')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error deleting user:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchUsers, selectedUser]) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Update User Status
  // =========================================================================

  const updateStatus = useCallback(async (
    id: number,
    data: UserStatusUpdatePayload
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Log the data being sent for debugging
      console.log('Updating user status:', { id, data })

      const response = await updateUserStatus(id, data)

      if (response.success) {
        // Update selected if same
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser(response.data || null)
        }

        // Refresh data using refresh function if available
        // تحديث البيانات باستخدام دالة refresh إن كانت متاحة
        if (refreshRef.current) {
          refreshRef.current()
        } else {
          // Fallback: call fetchUsers directly
          // بديل: استدعاء fetchUsers مباشرة
          await fetchUsers()
        }

        return true
      } else {
        console.error('Failed to update user status:', response.message, response.errors)
        const errorMsg = response.errors
          ? JSON.stringify(response.errors)
          : (response.message || 'فشل في تحديث حالة المستخدم')
        setError(errorMsg)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating user status:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedUser]) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Bulk Action
  // =========================================================================

  const bulkAction = useCallback(async (
    data: UserBulkActionPayload
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Log the data being sent for debugging
      console.log('Performing bulk action:', data)

      const response = await bulkUserAction(data)

      if (response.success) {
        // Refresh data using refresh function if available
        // تحديث البيانات باستخدام دالة refresh إن كانت متاحة
        if (refreshRef.current) {
          refreshRef.current()
        } else {
          // Fallback: call fetchUsers directly
          // بديل: استدعاء fetchUsers مباشرة
          await fetchUsers()
        }
        return true
      } else {
        console.error('Failed to perform bulk action:', response.message, response.errors)

        // Extract error message from errors object
        // استخراج رسالة الخطأ من كائن errors
        let errorMsg = response.message || 'فشل في تنفيذ العملية المجمعة'

        if (response.errors) {
          if (typeof response.errors === 'object') {
            const errorValues = Object.values(response.errors).flat()
            if (errorValues.length > 0) {
              errorMsg = String(errorValues[0])
            }
          } else {
            errorMsg = String(response.errors)
          }
        }

        setError(errorMsg)
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error performing bulk action:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [fetchUsers]) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Fetch Statistics
  // =========================================================================

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true)

    try {
      const response = await getUserStats()

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

  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState(newFilters)
  }, [])


  // =========================================================================
  // Clear Selected User
  // =========================================================================

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null)
  }, [])


  // =========================================================================
  // Refresh
  // =========================================================================

  const refresh = useCallback(() => {
    fetchUsers()
    fetchStats()
  }, [fetchUsers, fetchStats])

  // Store refresh function in ref
  // حفظ دالة refresh في المرجع
  refreshRef.current = refresh


  // =========================================================================
  // Initial Fetch
  // =========================================================================

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  // =========================================================================
  // Return
  // =========================================================================

  return {
    users,
    selectedUser,
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
    fetchUsers,
    fetchUserDetails,
    create,
    update,
    remove,
    updateStatus,
    bulkAction,
    fetchStats,
    setFilters,
    clearSelectedUser,
    refresh,
  }
}


export default useUsers

