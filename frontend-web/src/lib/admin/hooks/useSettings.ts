/**
 * Admin Settings Hooks
 * هوكات إعدادات الأدمن
 * 
 * This file contains custom hooks for managing admin settings.
 * يحتوي هذا الملف على هوكات مخصصة لإدارة إعدادات الأدمن.
 * 
 * @author Yalla Buy Team
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  SiteSettings,
  SiteSettingsUpdate,
  SocialLink,
  SocialLinkPayload,
  Language,
  LanguagePayload,
  NavigationItem,
  NavigationItemPayload,
  NavigationMenus,
  NavigationLocation,
  TrustSignal,
  TrustSignalPayload,
  PaymentMethod,
  PaymentMethodPayload,
  ShippingMethod,
  ShippingMethodPayload,
  AllSettings,
} from '../types'
import {
  getSiteSettings,
  updateSiteSettings,
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  getNavigationMenus,
  getNavigationByLocation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  bulkUpdateNavigation,
  getTrustSignals,
  createTrustSignal,
  updateTrustSignal,
  deleteTrustSignal,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  getAllSettings,
} from '../api/settings'

// =============================================================================
// Site Settings Hook
// =============================================================================

interface UseSiteSettingsReturn {
  settings: SiteSettings | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  refresh: () => Promise<void>
  save: (data: SiteSettingsUpdate) => Promise<boolean>
}

/**
 * Hook for managing site settings
 * هوك لإدارة إعدادات الموقع
 */
export function useSiteSettings(): UseSiteSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getSiteSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      } else {
        setError(response.message || 'فشل في جلب الإعدادات')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const save = useCallback(async (data: SiteSettingsUpdate): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await updateSiteSettings(data)
      if (response.success && response.data) {
        setSettings(response.data)
        return true
      } else {
        setError(response.message || 'فشل في حفظ الإعدادات')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { settings, isLoading, isSaving, error, refresh, save }
}

// =============================================================================
// Social Links Hook
// =============================================================================

interface UseSocialLinksReturn {
  links: SocialLink[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: SocialLinkPayload) => Promise<SocialLink | null>
  update: (id: number, data: Partial<SocialLinkPayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  reorder: (newOrder: number[]) => Promise<boolean>
}

/**
 * Hook for managing social links
 * هوك لإدارة روابط السوشيال
 */
export function useSocialLinks(): UseSocialLinksReturn {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getSocialLinks()
      if (response.success && response.data) {
        setLinks(response.data)
      } else {
        setError(response.message || 'فشل في جلب الروابط')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: SocialLinkPayload): Promise<SocialLink | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createSocialLink(data)
      if (response.success && response.data) {
        setLinks(prev => [...prev, response.data!].sort((a, b) => a.order - b.order))
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء الرابط')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const update = useCallback(async (id: number, data: Partial<SocialLinkPayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updateSocialLink(id, data)
      if (response.success && response.data) {
        setLinks(prev => prev.map(l => l.id === id ? response.data! : l).sort((a, b) => a.order - b.order))
        return true
      } else {
        setError(response.message || 'فشل في تحديث الرابط')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deleteSocialLink(id)
      if (response.success) {
        setLinks(prev => prev.filter(l => l.id !== id))
        return true
      } else {
        setError(response.message || 'فشل في حذف الرابط')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reorder = useCallback(async (newOrder: number[]): Promise<boolean> => {
    setIsProcessing(true)
    try {
      // Update order for each link
      for (let i = 0; i < newOrder.length; i++) {
        await updateSocialLink(newOrder[i], { order: i })
      }
      await refresh()
      return true
    } catch {
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { links, isLoading, isProcessing, error, refresh, create, update, remove, reorder }
}

// =============================================================================
// Languages Hook
// =============================================================================

interface UseLanguagesReturn {
  languages: Language[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: LanguagePayload) => Promise<Language | null>
  update: (id: number, data: Partial<LanguagePayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  setDefault: (id: number) => Promise<boolean>
}

/**
 * Hook for managing languages
 * هوك لإدارة اللغات
 */
export function useLanguages(): UseLanguagesReturn {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getLanguages()
      if (response.success && response.data) {
        setLanguages(response.data)
      } else {
        setError(response.message || 'فشل في جلب اللغات')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: LanguagePayload): Promise<Language | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createLanguage(data)
      if (response.success && response.data) {
        setLanguages(prev => [...prev, response.data!].sort((a, b) => a.order - b.order))
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء اللغة')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const update = useCallback(async (id: number, data: Partial<LanguagePayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updateLanguage(id, data)
      if (response.success && response.data) {
        setLanguages(prev => prev.map(l => l.id === id ? response.data! : l).sort((a, b) => a.order - b.order))
        return true
      } else {
        setError(response.message || 'فشل في تحديث اللغة')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deleteLanguage(id)
      if (response.success) {
        setLanguages(prev => prev.filter(l => l.id !== id))
        return true
      } else {
        setError(response.message || 'فشل في حذف اللغة')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const setDefault = useCallback(async (id: number): Promise<boolean> => {
    return update(id, { is_default: true })
  }, [update])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { languages, isLoading, isProcessing, error, refresh, create, update, remove, setDefault }
}

// =============================================================================
// Navigation Hook
// =============================================================================

interface UseNavigationReturn {
  menus: NavigationMenus | null
  items: NavigationItem[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  selectedLocation: NavigationLocation
  setSelectedLocation: (location: NavigationLocation) => void
  refresh: () => Promise<void>
  refreshLocation: (location: NavigationLocation) => Promise<void>
  create: (data: NavigationItemPayload) => Promise<NavigationItem | null>
  update: (id: number, data: Partial<NavigationItemPayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  reorder: (location: NavigationLocation, items: NavigationItemPayload[]) => Promise<boolean>
}

/**
 * Hook for managing navigation items
 * هوك لإدارة عناصر التنقل
 */
export function useNavigation(
  initialLocation: NavigationLocation = 'header'
): UseNavigationReturn {
  const [menus, setMenus] = useState<NavigationMenus | null>(null)
  const [items, setItems] = useState<NavigationItem[]>([])
  const [selectedLocation, setSelectedLocation] = useState<NavigationLocation>(initialLocation)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getNavigationMenus()
      if (response.success && response.data) {
        setMenus(response.data)
        setItems(response.data[selectedLocation] || [])
      } else {
        setError(response.message || 'فشل في جلب القوائم')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [selectedLocation])

  const refreshLocation = useCallback(async (location: NavigationLocation) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getNavigationByLocation(location)
      if (response.success && response.data) {
        setItems(response.data)
        if (menus) {
          setMenus({ ...menus, [location]: response.data })
        }
      } else {
        setError(response.message || 'فشل في جلب العناصر')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [menus])

  // Update items when location changes
  useEffect(() => {
    if (menus) {
      setItems(menus[selectedLocation] || [])
    }
  }, [selectedLocation, menus])

  const create = useCallback(async (data: NavigationItemPayload): Promise<NavigationItem | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createNavigationItem(data)
      if (response.success && response.data) {
        await refresh()
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء العنصر')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [refresh])

  const update = useCallback(async (id: number, data: Partial<NavigationItemPayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updateNavigationItem(id, data)
      if (response.success) {
        await refresh()
        return true
      } else {
        setError(response.message || 'فشل في تحديث العنصر')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [refresh])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deleteNavigationItem(id)
      if (response.success) {
        await refresh()
        return true
      } else {
        setError(response.message || 'فشل في حذف العنصر')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [refresh])

  const reorder = useCallback(async (
    location: NavigationLocation,
    newItems: NavigationItemPayload[]
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await bulkUpdateNavigation(location, newItems)
      if (response.success) {
        await refresh()
        return true
      } else {
        setError(response.message || 'فشل في إعادة الترتيب')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    menus,
    items,
    isLoading,
    isProcessing,
    error,
    selectedLocation,
    setSelectedLocation,
    refresh,
    refreshLocation,
    create,
    update,
    remove,
    reorder,
  }
}

// =============================================================================
// Trust Signals Hook
// =============================================================================

interface UseTrustSignalsReturn {
  signals: TrustSignal[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: TrustSignalPayload) => Promise<TrustSignal | null>
  update: (id: number, data: Partial<TrustSignalPayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
}

/**
 * Hook for managing trust signals
 * هوك لإدارة مؤشرات الثقة
 */
export function useTrustSignals(): UseTrustSignalsReturn {
  const [signals, setSignals] = useState<TrustSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getTrustSignals()
      if (response.success && response.data) {
        setSignals(response.data)
      } else {
        setError(response.message || 'فشل في جلب المؤشرات')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: TrustSignalPayload): Promise<TrustSignal | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createTrustSignal(data)
      if (response.success && response.data) {
        setSignals(prev => [...prev, response.data!].sort((a, b) => a.order - b.order))
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء المؤشر')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const update = useCallback(async (id: number, data: Partial<TrustSignalPayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updateTrustSignal(id, data)
      if (response.success && response.data) {
        setSignals(prev => prev.map(s => s.id === id ? response.data! : s).sort((a, b) => a.order - b.order))
        return true
      } else {
        setError(response.message || 'فشل في تحديث المؤشر')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deleteTrustSignal(id)
      if (response.success) {
        setSignals(prev => prev.filter(s => s.id !== id))
        return true
      } else {
        setError(response.message || 'فشل في حذف المؤشر')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { signals, isLoading, isProcessing, error, refresh, create, update, remove }
}

// =============================================================================
// Payment Methods Hook
// =============================================================================

interface UsePaymentMethodsReturn {
  methods: PaymentMethod[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: PaymentMethodPayload) => Promise<PaymentMethod | null>
  update: (id: number, data: Partial<PaymentMethodPayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  setDefault: (id: number) => Promise<boolean>
}

/**
 * Hook for managing payment methods
 * هوك لإدارة طرق الدفع
 */
export function usePaymentMethods(): UsePaymentMethodsReturn {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getPaymentMethods()
      if (response.success && response.data) {
        setMethods(response.data)
      } else {
        setError(response.message || 'فشل في جلب طرق الدفع')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: PaymentMethodPayload): Promise<PaymentMethod | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createPaymentMethod(data)
      if (response.success && response.data) {
        setMethods(prev => [...prev, response.data!].sort((a, b) => a.order - b.order))
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء طريقة الدفع')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const update = useCallback(async (id: number, data: Partial<PaymentMethodPayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updatePaymentMethod(id, data)
      if (response.success && response.data) {
        setMethods(prev => prev.map(m => m.id === id ? response.data! : m).sort((a, b) => a.order - b.order))
        return true
      } else {
        setError(response.message || 'فشل في تحديث طريقة الدفع')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deletePaymentMethod(id)
      if (response.success) {
        setMethods(prev => prev.filter(m => m.id !== id))
        return true
      } else {
        setError(response.message || 'فشل في حذف طريقة الدفع')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const setDefault = useCallback(async (id: number): Promise<boolean> => {
    return update(id, { is_default: true })
  }, [update])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { methods, isLoading, isProcessing, error, refresh, create, update, remove, setDefault }
}

// =============================================================================
// Shipping Methods Hook
// =============================================================================

interface UseShippingMethodsReturn {
  methods: ShippingMethod[]
  isLoading: boolean
  isProcessing: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: ShippingMethodPayload) => Promise<ShippingMethod | null>
  update: (id: number, data: Partial<ShippingMethodPayload>) => Promise<boolean>
  remove: (id: number) => Promise<boolean>
  setDefault: (id: number) => Promise<boolean>
}

/**
 * Hook for managing shipping methods
 * هوك لإدارة طرق الشحن
 */
export function useShippingMethods(): UseShippingMethodsReturn {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getShippingMethods()
      if (response.success && response.data) {
        setMethods(response.data)
      } else {
        setError(response.message || 'فشل في جلب طرق الشحن')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (data: ShippingMethodPayload): Promise<ShippingMethod | null> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await createShippingMethod(data)
      if (response.success && response.data) {
        setMethods(prev => [...prev, response.data!].sort((a, b) => a.order - b.order))
        return response.data
      } else {
        setError(response.message || 'فشل في إنشاء طريقة الشحن')
        return null
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const update = useCallback(async (id: number, data: Partial<ShippingMethodPayload>): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await updateShippingMethod(id, data)
      if (response.success && response.data) {
        setMethods(prev => prev.map(m => m.id === id ? response.data! : m).sort((a, b) => a.order - b.order))
        return true
      } else {
        setError(response.message || 'فشل في تحديث طريقة الشحن')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    try {
      const response = await deleteShippingMethod(id)
      if (response.success) {
        setMethods(prev => prev.filter(m => m.id !== id))
        return true
      } else {
        setError(response.message || 'فشل في حذف طريقة الشحن')
        return false
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const setDefault = useCallback(async (id: number): Promise<boolean> => {
    return update(id, { is_default: true })
  }, [update])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { methods, isLoading, isProcessing, error, refresh, create, update, remove, setDefault }
}

// =============================================================================
// All Settings Hook
// =============================================================================

interface UseAllSettingsReturn {
  settings: AllSettings | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for fetching all settings at once
 * هوك لجلب جميع الإعدادات مرة واحدة
 */
export function useAllSettings(): UseAllSettingsReturn {
  const [settings, setSettings] = useState<AllSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getAllSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      } else {
        setError(response.message || 'فشل في جلب الإعدادات')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { settings, isLoading, error, refresh }
}

