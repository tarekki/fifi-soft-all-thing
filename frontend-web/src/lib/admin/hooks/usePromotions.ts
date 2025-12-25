/**
 * usePromotions Hooks
 * خطافات العروض والحملات
 * 
 * This file contains hooks for managing Banners, Stories, and Coupons.
 * هذا الملف يحتوي على خطافات إدارة البانرات والقصص والكوبونات.
 * 
 * @author Yalla Buy Team
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  trackBannerClick,
  trackBannerView,
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  trackStoryView,
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getPromotionStats,
} from '../api/promotions'
import type {
  Banner,
  BannerDetail,
  BannerPayload,
  BannerFilters,
  PaginatedBanners,
  Story,
  StoryDetail,
  StoryPayload,
  StoryFilters,
  PaginatedStories,
  Coupon,
  CouponDetail,
  CouponPayload,
  CouponFilters,
  PaginatedCoupons,
  PromotionStats,
} from '../types/promotions'

// =============================================================================
// useBanners Hook
// خطاف البانرات
// =============================================================================

interface UseBannersReturn {
  // State
  banners: Banner[]
  selectedBanner: BannerDetail | null
  total: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  filters: BannerFilters
  
  // Actions
  fetchBanners: (filters?: BannerFilters) => Promise<void>
  fetchBannerDetails: (id: number) => Promise<void>
  create: (data: BannerPayload) => Promise<boolean>
  update: (id: number, data: BannerPayload) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  trackClick: (id: number) => Promise<void>
  trackView: (id: number) => Promise<void>
  setFilters: (filters: BannerFilters) => void
  clearSelectedBanner: () => void
  refresh: () => void
}

export function useBanners(initialFilters: BannerFilters = {}): UseBannersReturn {
  const [banners, setBanners] = useState<Banner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<BannerDetail | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<BannerFilters>(initialFilters)
  
  const refreshRef = useRef<(() => void) | null>(null)
  
  const fetchBanners = useCallback(async (newFilters?: BannerFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mergedFilters = { ...filters, ...newFilters }
      const response = await getBanners(mergedFilters)
      
      if (response.success && response.data) {
        setBanners(response.data.results)
        setTotal(response.data.count)
        setHasNextPage(!!response.data.next)
        setHasPreviousPage(!!response.data.previous)
        setFiltersState(mergedFilters)
      } else {
        throw new Error(response.message || 'فشل في جلب البانرات')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch banners:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  const fetchBannerDetails = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getBanner(id)
      
      if (response.success && response.data) {
        setSelectedBanner(response.data)
      } else {
        throw new Error(response.message || 'فشل في جلب تفاصيل البانر')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch banner details:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const create = useCallback(async (data: BannerPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await createBanner(data)
      
      if (response.success) {
        refreshRef.current?.()
        return true
      } else {
        console.error('Failed to create banner:', response.message)
        setError(response.message || 'فشل في إنشاء البانر')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error creating banner:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])
  
  const update = useCallback(async (id: number, data: BannerPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await updateBanner(id, data)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedBanner && selectedBanner.id === id) {
          await fetchBannerDetails(id)
        }
        return true
      } else {
        console.error('Failed to update banner:', response.message)
        setError(response.message || 'فشل في تحديث البانر')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error updating banner:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedBanner, fetchBannerDetails])
  
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await deleteBanner(id)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedBanner && selectedBanner.id === id) {
          setSelectedBanner(null)
        }
        return true
      } else {
        console.error('Failed to delete banner:', response.message)
        setError(response.message || 'فشل في حذف البانر')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error deleting banner:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedBanner])
  
  const trackClick = useCallback(async (id: number) => {
    try {
      await trackBannerClick(id)
      refreshRef.current?.()
    } catch (err) {
      console.error('Failed to track banner click:', err)
    }
  }, [])
  
  const trackView = useCallback(async (id: number) => {
    try {
      await trackBannerView(id)
      refreshRef.current?.()
    } catch (err) {
      console.error('Failed to track banner view:', err)
    }
  }, [])
  
  const setFilters = useCallback((newFilters: BannerFilters) => {
    setFiltersState(newFilters)
    setCurrentPage(1)
  }, [])
  
  const clearSelectedBanner = useCallback(() => {
    setSelectedBanner(null)
  }, [])
  
  const refresh = useCallback(() => {
    fetchBanners()
  }, [fetchBanners])
  
  refreshRef.current = refresh
  
  useEffect(() => {
    fetchBanners()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    banners,
    selectedBanner,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isProcessing,
    error,
    filters,
    fetchBanners,
    fetchBannerDetails,
    create,
    update,
    remove,
    trackClick,
    trackView,
    setFilters,
    clearSelectedBanner,
    refresh,
  }
}

// =============================================================================
// useStories Hook
// خطاف القصص
// =============================================================================

interface UseStoriesReturn {
  // State
  stories: Story[]
  selectedStory: StoryDetail | null
  total: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  filters: StoryFilters
  
  // Actions
  fetchStories: (filters?: StoryFilters) => Promise<void>
  fetchStoryDetails: (id: number) => Promise<void>
  create: (data: StoryPayload) => Promise<boolean>
  update: (id: number, data: StoryPayload) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  trackView: (id: number) => Promise<void>
  setFilters: (filters: StoryFilters) => void
  clearSelectedStory: () => void
  refresh: () => void
}

export function useStories(initialFilters: StoryFilters = {}): UseStoriesReturn {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<StoryDetail | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<StoryFilters>(initialFilters)
  
  const refreshRef = useRef<(() => void) | null>(null)
  
  const fetchStories = useCallback(async (newFilters?: StoryFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mergedFilters = { ...filters, ...newFilters }
      const response = await getStories(mergedFilters)
      
      if (response.success && response.data) {
        setStories(response.data.results)
        setTotal(response.data.count)
        setHasNextPage(!!response.data.next)
        setHasPreviousPage(!!response.data.previous)
        setFiltersState(mergedFilters)
      } else {
        throw new Error(response.message || 'فشل في جلب القصص')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch stories:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  const fetchStoryDetails = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getStory(id)
      
      if (response.success && response.data) {
        setSelectedStory(response.data)
      } else {
        throw new Error(response.message || 'فشل في جلب تفاصيل القصة')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch story details:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const create = useCallback(async (data: StoryPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await createStory(data)
      
      if (response.success) {
        refreshRef.current?.()
        return true
      } else {
        console.error('Failed to create story:', response.message)
        setError(response.message || 'فشل في إنشاء القصة')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error creating story:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])
  
  const update = useCallback(async (id: number, data: StoryPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await updateStory(id, data)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedStory && selectedStory.id === id) {
          await fetchStoryDetails(id)
        }
        return true
      } else {
        console.error('Failed to update story:', response.message)
        setError(response.message || 'فشل في تحديث القصة')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error updating story:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedStory, fetchStoryDetails])
  
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await deleteStory(id)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedStory && selectedStory.id === id) {
          setSelectedStory(null)
        }
        return true
      } else {
        console.error('Failed to delete story:', response.message)
        setError(response.message || 'فشل في حذف القصة')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error deleting story:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedStory])
  
  const trackView = useCallback(async (id: number) => {
    try {
      await trackStoryView(id)
      refreshRef.current?.()
    } catch (err) {
      console.error('Failed to track story view:', err)
    }
  }, [])
  
  const setFilters = useCallback((newFilters: StoryFilters) => {
    setFiltersState(newFilters)
    setCurrentPage(1)
  }, [])
  
  const clearSelectedStory = useCallback(() => {
    setSelectedStory(null)
  }, [])
  
  const refresh = useCallback(() => {
    fetchStories()
  }, [fetchStories])
  
  refreshRef.current = refresh
  
  useEffect(() => {
    fetchStories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    stories,
    selectedStory,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isProcessing,
    error,
    filters,
    fetchStories,
    fetchStoryDetails,
    create,
    update,
    remove,
    trackView,
    setFilters,
    clearSelectedStory,
    refresh,
  }
}

// =============================================================================
// useCoupons Hook
// خطاف الكوبونات
// =============================================================================

interface UseCouponsReturn {
  // State
  coupons: Coupon[]
  selectedCoupon: CouponDetail | null
  total: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  filters: CouponFilters
  
  // Actions
  fetchCoupons: (filters?: CouponFilters) => Promise<void>
  fetchCouponDetails: (id: number) => Promise<void>
  create: (data: CouponPayload) => Promise<boolean>
  update: (id: number, data: CouponPayload) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  setFilters: (filters: CouponFilters) => void
  clearSelectedCoupon: () => void
  refresh: () => void
}

export function useCoupons(initialFilters: CouponFilters = {}): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<CouponDetail | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<CouponFilters>(initialFilters)
  
  const refreshRef = useRef<(() => void) | null>(null)
  
  const fetchCoupons = useCallback(async (newFilters?: CouponFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const mergedFilters = { ...filters, ...newFilters }
      const response = await getCoupons(mergedFilters)
      
      if (response.success && response.data) {
        setCoupons(response.data.results)
        setTotal(response.data.count)
        setHasNextPage(!!response.data.next)
        setHasPreviousPage(!!response.data.previous)
        setFiltersState(mergedFilters)
      } else {
        throw new Error(response.message || 'فشل في جلب الكوبونات')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch coupons:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  const fetchCouponDetails = useCallback(async (id: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getCoupon(id)
      
      if (response.success && response.data) {
        setSelectedCoupon(response.data)
      } else {
        throw new Error(response.message || 'فشل في جلب تفاصيل الكوبون')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch coupon details:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const create = useCallback(async (data: CouponPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await createCoupon(data)
      
      if (response.success) {
        refreshRef.current?.()
        return true
      } else {
        console.error('Failed to create coupon:', response.message)
        setError(response.message || 'فشل في إنشاء الكوبون')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error creating coupon:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])
  
  const update = useCallback(async (id: number, data: CouponPayload): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await updateCoupon(id, data)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedCoupon && selectedCoupon.id === id) {
          await fetchCouponDetails(id)
        }
        return true
      } else {
        console.error('Failed to update coupon:', response.message)
        setError(response.message || 'فشل في تحديث الكوبون')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error updating coupon:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedCoupon, fetchCouponDetails])
  
  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const response = await deleteCoupon(id)
      
      if (response.success) {
        refreshRef.current?.()
        if (selectedCoupon && selectedCoupon.id === id) {
          setSelectedCoupon(null)
        }
        return true
      } else {
        console.error('Failed to delete coupon:', response.message)
        setError(response.message || 'فشل في حذف الكوبون')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Error deleting coupon:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [selectedCoupon])
  
  const setFilters = useCallback((newFilters: CouponFilters) => {
    setFiltersState(newFilters)
    setCurrentPage(1)
  }, [])
  
  const clearSelectedCoupon = useCallback(() => {
    setSelectedCoupon(null)
  }, [])
  
  const refresh = useCallback(() => {
    fetchCoupons()
  }, [fetchCoupons])
  
  refreshRef.current = refresh
  
  useEffect(() => {
    fetchCoupons()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    coupons,
    selectedCoupon,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isProcessing,
    error,
    filters,
    fetchCoupons,
    fetchCouponDetails,
    create,
    update,
    remove,
    setFilters,
    clearSelectedCoupon,
    refresh,
  }
}

// =============================================================================
// usePromotionStats Hook
// خطاف إحصائيات العروض
// =============================================================================

interface UsePromotionStatsReturn {
  stats: PromotionStats | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  refresh: () => void
}

export function usePromotionStats(): UsePromotionStatsReturn {
  const [stats, setStats] = useState<PromotionStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getPromotionStats()
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        throw new Error(response.message || 'فشل في جلب الإحصائيات')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
      console.error('Failed to fetch promotion stats:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const refresh = useCallback(() => {
    fetchStats()
  }, [fetchStats])
  
  useEffect(() => {
    fetchStats()
  }, [fetchStats])
  
  return {
    stats,
    isLoading,
    error,
    fetchStats,
    refresh,
  }
}

