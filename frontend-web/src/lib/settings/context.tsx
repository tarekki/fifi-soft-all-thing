'use client'

/**
 * Settings Context
 * سياق الإعدادات
 * 
 * Provides site settings throughout the application using React Context.
 * يوفر إعدادات الموقع في جميع أنحاء التطبيق باستخدام React Context.
 * 
 * Features:
 * - Global access to site settings (name, logo, contact)
 * - Navigation menus (header, footer)
 * - Social links
 * - Trust signals
 * - Payment & shipping methods
 * - Language support with RTL detection
 * - Automatic caching via React Query
 * 
 * Usage:
 * 1. Wrap app with <SettingsProvider>
 * 2. Use useSettings() hook to access settings
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  useMemo,
  type ReactNode 
} from 'react'
import type { 
  AllSettings, 
  SiteSettings, 
  SocialLink, 
  Language, 
  NavigationMenu,
  TrustSignal, 
  PaymentMethod, 
  ShippingMethod 
} from '@/types/settings'
import { getAllSettings } from '@/lib/api/public/settings'

// =============================================================================
// Types
// الأنواع
// =============================================================================

/**
 * Settings context state
 * حالة سياق الإعدادات
 */
interface SettingsContextState {
  // Data - البيانات
  settings: AllSettings | null
  site: SiteSettings | null
  socialLinks: SocialLink[]
  languages: Language[]
  navigation: NavigationMenu | null
  trustSignals: TrustSignal[]
  paymentMethods: PaymentMethod[]
  shippingMethods: ShippingMethod[]
  
  // State - الحالة
  isLoading: boolean
  isError: boolean
  error: string | null
  
  // Language - اللغة
  currentLanguage: string
  isRTL: boolean
  
  // Actions - الإجراءات
  setLanguage: (code: string) => void
  refreshSettings: () => Promise<void>
  
  // Helpers - المساعدات
  getSiteName: () => string
  getTagline: () => string
  formatPrice: (price: number | string) => string
}

// =============================================================================
// Default Values
// القيم الافتراضية
// =============================================================================

/**
 * Default site settings (fallback)
 * إعدادات الموقع الافتراضية (احتياطي)
 */
const defaultSiteSettings: SiteSettings = {
  site_name: 'Yalla Buy',
  site_name_ar: 'يلا باي',
  tagline: 'Order in Seconds',
  tagline_ar: 'اطلبها بثواني',
  logo_url: '',
  logo_dark_url: '',
  favicon_url: '',
  meta_title: 'Yalla Buy - Online Shopping',
  meta_title_ar: 'يلا باي - تسوق اونلاين',
  meta_description: 'Shop the latest shoes and bags',
  meta_description_ar: 'تسوق أحدث الأحذية والحقائب',
  currency_code: 'SYP',
  currency_symbol: 'ل.س',
  currency_position: 'after',
  is_maintenance_mode: false,
  maintenance_message: '',
  maintenance_message_ar: ''
}

/**
 * Default context value
 * قيمة السياق الافتراضية
 */
const defaultContextValue: SettingsContextState = {
  settings: null,
  site: defaultSiteSettings,
  socialLinks: [],
  languages: [],
  navigation: null,
  trustSignals: [],
  paymentMethods: [],
  shippingMethods: [],
  isLoading: true,
  isError: false,
  error: null,
  currentLanguage: 'ar',
  isRTL: true,
  setLanguage: () => {},
  refreshSettings: async () => {},
  getSiteName: () => 'Yalla Buy',
  getTagline: () => 'اطلبها بثواني',
  formatPrice: (price) => `${price} ل.س`
}

// =============================================================================
// Context Creation
// إنشاء السياق
// =============================================================================

const SettingsContext = createContext<SettingsContextState>(defaultContextValue)

// =============================================================================
// Provider Component
// مكون المزود
// =============================================================================

interface SettingsProviderProps {
  children: ReactNode
  /** Initial settings (for SSR) - الإعدادات الأولية */
  initialSettings?: AllSettings | null
  /** Default language code - رمز اللغة الافتراضي */
  defaultLanguage?: string
}

/**
 * Settings Provider Component
 * مكون مزود الإعدادات
 * 
 * Wraps the application and provides settings context.
 * يغلف التطبيق ويوفر سياق الإعدادات.
 * 
 * @example
 * // In layout.tsx
 * <SettingsProvider>
 *   {children}
 * </SettingsProvider>
 * 
 * // With SSR initial data
 * <SettingsProvider initialSettings={settings}>
 *   {children}
 * </SettingsProvider>
 */
export function SettingsProvider({ 
  children, 
  initialSettings = null,
  defaultLanguage = 'ar'
}: SettingsProviderProps) {
  // ---------------------------------------------------------------------------
  // State
  // الحالة
  // ---------------------------------------------------------------------------
  
  const [settings, setSettings] = useState<AllSettings | null>(initialSettings)
  const [isLoading, setIsLoading] = useState(!initialSettings)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage)
  
  // ---------------------------------------------------------------------------
  // Derived State
  // الحالة المشتقة
  // ---------------------------------------------------------------------------
  
  const isRTL = useMemo(() => {
    if (settings?.languages) {
      const lang = settings.languages.find(l => l.code === currentLanguage)
      return lang?.is_rtl ?? true
    }
    return currentLanguage === 'ar'
  }, [settings?.languages, currentLanguage])
  
  // ---------------------------------------------------------------------------
  // Fetch Settings
  // جلب الإعدادات
  // ---------------------------------------------------------------------------
  
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      setError(null)
      
      const data = await getAllSettings()
      setSettings(data)
      
      // Set default language from API
      // تعيين اللغة الافتراضية من API
      const defaultLang = data.languages.find(l => l.is_default)
      if (defaultLang && !initialSettings) {
        setCurrentLanguage(defaultLang.code)
      }
    } catch (err) {
      setIsError(true)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings'
      setError(errorMessage)
      console.error('[SettingsProvider] Error fetching settings:', err)
      
      // Log additional debugging info
      // تسجيل معلومات إضافية للتشخيص
      if (errorMessage.includes('Failed to connect')) {
        console.warn('[SettingsProvider] Backend connection issue. Check:')
        console.warn('1. Is backend running on https://localhost?')
        console.warn('2. Check CORS settings in backend')
        console.warn('3. Check NEXT_PUBLIC_API_URL environment variable')
      }
    } finally {
      setIsLoading(false)
    }
  }, [initialSettings])
  
  // ---------------------------------------------------------------------------
  // Effects
  // التأثيرات
  // ---------------------------------------------------------------------------
  
  // Fetch settings on mount if not provided
  // جلب الإعدادات عند التحميل إذا لم تُقدم
  useEffect(() => {
    if (!initialSettings) {
      fetchSettings()
    }
  }, [fetchSettings, initialSettings])
  
  // Update document direction based on language
  // تحديث اتجاه المستند بناءً على اللغة
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
      document.documentElement.lang = currentLanguage
    }
  }, [isRTL, currentLanguage])
  
  // ---------------------------------------------------------------------------
  // Actions
  // الإجراءات
  // ---------------------------------------------------------------------------
  
  const setLanguage = useCallback((code: string) => {
    setCurrentLanguage(code)
    // Persist to localStorage
    // حفظ في التخزين المحلي
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferred_language', code)
    }
  }, [])
  
  const refreshSettings = useCallback(async () => {
    await fetchSettings()
  }, [fetchSettings])
  
  // ---------------------------------------------------------------------------
  // Helpers
  // المساعدات
  // ---------------------------------------------------------------------------
  
  const getSiteName = useCallback(() => {
    if (!settings?.site) return defaultSiteSettings.site_name_ar
    return currentLanguage === 'ar' 
      ? settings.site.site_name_ar 
      : settings.site.site_name
  }, [settings?.site, currentLanguage])
  
  const getTagline = useCallback(() => {
    if (!settings?.site) return defaultSiteSettings.tagline_ar
    return currentLanguage === 'ar' 
      ? settings.site.tagline_ar 
      : settings.site.tagline
  }, [settings?.site, currentLanguage])
  
  const formatPrice = useCallback((price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    const symbol = settings?.site?.currency_symbol || 'ل.س'
    const position = settings?.site?.currency_position || 'after'
    
    // Format number with commas
    // تنسيق الرقم بالفواصل
    const formattedNum = numPrice.toLocaleString('en-US')
    
    return position === 'before' 
      ? `${symbol} ${formattedNum}`
      : `${formattedNum} ${symbol}`
  }, [settings?.site?.currency_symbol, settings?.site?.currency_position])
  
  // ---------------------------------------------------------------------------
  // Context Value
  // قيمة السياق
  // ---------------------------------------------------------------------------
  
  const contextValue = useMemo<SettingsContextState>(() => ({
    settings,
    site: settings?.site ?? defaultSiteSettings,
    socialLinks: settings?.social_links ?? [],
    languages: settings?.languages ?? [],
    navigation: settings?.navigation ?? null,
    trustSignals: settings?.trust_signals ?? [],
    paymentMethods: settings?.payment_methods ?? [],
    shippingMethods: settings?.shipping_methods ?? [],
    isLoading,
    isError,
    error,
    currentLanguage,
    isRTL,
    setLanguage,
    refreshSettings,
    getSiteName,
    getTagline,
    formatPrice
  }), [
    settings,
    isLoading,
    isError,
    error,
    currentLanguage,
    isRTL,
    setLanguage,
    refreshSettings,
    getSiteName,
    getTagline,
    formatPrice
  ])
  
  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

// =============================================================================
// Hook
// الـ Hook
// =============================================================================

/**
 * Use Settings Hook
 * Hook استخدام الإعدادات
 * 
 * Access site settings from any component.
 * الوصول لإعدادات الموقع من أي مكون.
 * 
 * @returns Settings context state
 * @throws Error if used outside SettingsProvider
 * 
 * @example
 * function Header() {
 *   const { site, getSiteName, socialLinks } = useSettings()
 *   
 *   return (
 *     <header>
 *       <img src={site.logo_url} alt={getSiteName()} />
 *       <h1>{getSiteName()}</h1>
 *     </header>
 *   )
 * }
 */
export function useSettings(): SettingsContextState {
  const context = useContext(SettingsContext)
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  
  return context
}

// =============================================================================
// Specialized Hooks
// الـ Hooks المتخصصة
// =============================================================================

/**
 * Use Site Info Hook
 * Hook معلومات الموقع
 * 
 * @returns Site settings only
 */
export function useSiteInfo() {
  const { site, getSiteName, getTagline, formatPrice, isLoading } = useSettings()
  return { site, getSiteName, getTagline, formatPrice, isLoading }
}

/**
 * Use Navigation Hook
 * Hook التنقل
 * 
 * @returns Navigation menus
 */
export function useNavigation() {
  const { navigation, isLoading } = useSettings()
  return { navigation, isLoading }
}

/**
 * Use Language Hook
 * Hook اللغة
 * 
 * @returns Language state and setter
 */
export function useLanguage() {
  const { languages, currentLanguage, isRTL, setLanguage, isLoading } = useSettings()
  return { languages, currentLanguage, isRTL, setLanguage, isLoading }
}

/**
 * Use Social Links Hook
 * Hook روابط السوشيال
 * 
 * @returns Social links array
 */
export function useSocialLinks() {
  const { socialLinks, isLoading } = useSettings()
  return { socialLinks, isLoading }
}

/**
 * Use Trust Signals Hook
 * Hook مؤشرات الثقة
 * 
 * @returns Trust signals array
 */
export function useTrustSignals() {
  const { trustSignals, currentLanguage, isLoading } = useSettings()
  
  // Return localized trust signals
  // إرجاع مؤشرات الثقة المترجمة
  const localizedSignals = useMemo(() => {
    return trustSignals.map(signal => ({
      ...signal,
      title: currentLanguage === 'ar' ? signal.title_ar : signal.title,
      description: currentLanguage === 'ar' ? signal.description_ar : signal.description
    }))
  }, [trustSignals, currentLanguage])
  
  return { trustSignals: localizedSignals, isLoading }
}

/**
 * Use Payment Methods Hook
 * Hook طرق الدفع
 * 
 * @returns Payment methods array
 */
export function usePaymentMethods() {
  const { paymentMethods, currentLanguage, isLoading } = useSettings()
  
  // Return localized payment methods
  // إرجاع طرق الدفع المترجمة
  const localizedMethods = useMemo(() => {
    return paymentMethods.map(method => ({
      ...method,
      name: currentLanguage === 'ar' ? method.name_ar : method.name,
      description: currentLanguage === 'ar' ? method.description_ar : method.description,
      instructions: currentLanguage === 'ar' ? method.instructions_ar : method.instructions
    }))
  }, [paymentMethods, currentLanguage])
  
  return { paymentMethods: localizedMethods, isLoading }
}

/**
 * Use Shipping Methods Hook
 * Hook طرق الشحن
 * 
 * @returns Shipping methods array
 */
export function useShippingMethods() {
  const { shippingMethods, currentLanguage, isLoading } = useSettings()
  
  // Return localized shipping methods
  // إرجاع طرق الشحن المترجمة
  const localizedMethods = useMemo(() => {
    return shippingMethods.map(method => ({
      ...method,
      name: currentLanguage === 'ar' ? method.name_ar : method.name,
      description: currentLanguage === 'ar' ? method.description_ar : method.description
    }))
  }, [shippingMethods, currentLanguage])
  
  return { shippingMethods: localizedMethods, isLoading }
}

// =============================================================================
// Export
// التصدير
// =============================================================================

export { SettingsContext }

