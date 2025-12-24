/**
 * Settings API Client
 * عميل API الإعدادات
 * 
 * Public API endpoints for site settings (no authentication required)
 * نقاط API العامة لإعدادات الموقع (لا تتطلب مصادقة)
 * 
 * Endpoints:
 *   GET /api/v1/settings/site/           - Site settings
 *   GET /api/v1/settings/social/         - Social links
 *   GET /api/v1/settings/languages/      - Languages
 *   GET /api/v1/settings/navigation/     - Navigation menus
 *   GET /api/v1/settings/trust-signals/  - Trust signals
 *   GET /api/v1/settings/payment-methods/ - Payment methods
 *   GET /api/v1/settings/shipping-methods/ - Shipping methods
 *   GET /api/v1/settings/all/            - All settings combined
 */

import { apiClient } from '../client'
import type { ApiResponse } from '@/types/api'
import type { 
  SiteSettings, 
  SocialLink, 
  Language, 
  NavigationItem,
  NavigationMenu,
  TrustSignal, 
  PaymentMethod, 
  ShippingMethod,
  AllSettings 
} from '@/types/settings'

// =============================================================================
// Site Settings API
// API إعدادات الموقع
// =============================================================================

/**
 * Get site settings (name, logo, contact, SEO, currency)
 * الحصول على إعدادات الموقع
 * 
 * @returns Site settings data
 * @throws Error if request fails
 * 
 * @example
 * const settings = await getSiteSettings()
 * console.log(settings.site_name) // "Yalla Buy"
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await apiClient<ApiResponse<SiteSettings>>('/settings/site/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch site settings')
  }
  
  return response.data
}

// =============================================================================
// Social Links API
// API روابط السوشيال
// =============================================================================

/**
 * Get social media links
 * الحصول على روابط السوشيال ميديا
 * 
 * @returns Array of social links
 * @throws Error if request fails
 * 
 * @example
 * const links = await getSocialLinks()
 * // links = [{ platform: 'facebook', url: '...', icon: 'fab fa-facebook' }]
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const response = await apiClient<ApiResponse<SocialLink[]>>('/settings/social/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch social links')
  }
  
  return response.data
}

// =============================================================================
// Languages API
// API اللغات
// =============================================================================

/**
 * Get available languages
 * الحصول على اللغات المتاحة
 * 
 * @returns Array of available languages
 * @throws Error if request fails
 * 
 * @example
 * const languages = await getLanguages()
 * // languages = [{ code: 'ar', name: 'Arabic', native_name: 'العربية', is_rtl: true }]
 */
export async function getLanguages(): Promise<Language[]> {
  const response = await apiClient<ApiResponse<Language[]>>('/settings/languages/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch languages')
  }
  
  return response.data
}

// =============================================================================
// Navigation API
// API التنقل
// =============================================================================

/**
 * Get navigation menu items
 * الحصول على عناصر قائمة التنقل
 * 
 * @param location - Optional: filter by location (header, footer_about, etc.)
 * @returns Navigation items (grouped or filtered)
 * @throws Error if request fails
 * 
 * @example
 * // Get all navigation
 * const nav = await getNavigation()
 * // nav = { header: [...], footer_about: [...], ... }
 * 
 * // Get header only
 * const headerItems = await getNavigation('header')
 * // headerItems = [{ label: 'Home', url: '/' }, ...]
 */
export async function getNavigation(
  location?: 'header' | 'header_mobile' | 'footer_about' | 'footer_support' | 'footer_legal' | 'sidebar'
): Promise<NavigationMenu | NavigationItem[]> {
  const endpoint = location 
    ? `/settings/navigation/?location=${location}`
    : '/settings/navigation/'
    
  const response = await apiClient<ApiResponse<NavigationMenu | NavigationItem[]>>(endpoint)
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch navigation')
  }
  
  return response.data
}

/**
 * Get header navigation items
 * الحصول على عناصر تنقل الهيدر
 */
export async function getHeaderNavigation(): Promise<NavigationItem[]> {
  return getNavigation('header') as Promise<NavigationItem[]>
}

/**
 * Get footer navigation items (all sections)
 * الحصول على عناصر تنقل الفوتر
 */
export async function getFooterNavigation(): Promise<{
  about: NavigationItem[]
  support: NavigationItem[]
  legal: NavigationItem[]
}> {
  const nav = await getNavigation() as NavigationMenu
  return {
    about: nav.footer_about,
    support: nav.footer_support,
    legal: nav.footer_legal
  }
}

// =============================================================================
// Trust Signals API
// API مؤشرات الثقة
// =============================================================================

/**
 * Get trust signals (free shipping, secure payment, etc.)
 * الحصول على مؤشرات الثقة
 * 
 * @returns Array of trust signals
 * @throws Error if request fails
 * 
 * @example
 * const signals = await getTrustSignals()
 * // signals = [{ icon: '🚚', title: 'Free Shipping', ... }]
 */
export async function getTrustSignals(): Promise<TrustSignal[]> {
  const response = await apiClient<ApiResponse<TrustSignal[]>>('/settings/trust-signals/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch trust signals')
  }
  
  return response.data
}

// =============================================================================
// Payment Methods API
// API طرق الدفع
// =============================================================================

/**
 * Get available payment methods
 * الحصول على طرق الدفع المتاحة
 * 
 * @returns Array of payment methods
 * @throws Error if request fails
 * 
 * @example
 * const methods = await getPaymentMethods()
 * // methods = [{ code: 'cod', name: 'Cash on Delivery', is_default: true }]
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient<ApiResponse<PaymentMethod[]>>('/settings/payment-methods/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch payment methods')
  }
  
  return response.data
}

// =============================================================================
// Shipping Methods API
// API طرق الشحن
// =============================================================================

/**
 * Get available shipping methods
 * الحصول على طرق الشحن المتاحة
 * 
 * @returns Array of shipping methods
 * @throws Error if request fails
 * 
 * @example
 * const methods = await getShippingMethods()
 * // methods = [{ code: 'standard', name: 'Standard Shipping', estimated_delivery: '3-5 days' }]
 */
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await apiClient<ApiResponse<ShippingMethod[]>>('/settings/shipping-methods/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch shipping methods')
  }
  
  return response.data
}

// =============================================================================
// All Settings API (Optimized)
// API جميع الإعدادات (محسّن)
// =============================================================================

/**
 * Get all settings in a single request (optimized for initial load)
 * الحصول على جميع الإعدادات في طلب واحد (محسّن للتحميل الأولي)
 * 
 * This endpoint reduces API calls on initial page load by returning
 * all settings in a single response.
 * 
 * @returns All settings combined
 * @throws Error if request fails
 * 
 * @example
 * const settings = await getAllSettings()
 * console.log(settings.site.site_name) // "Yalla Buy"
 * console.log(settings.social_links) // [...]
 * console.log(settings.navigation.header) // [...]
 */
export async function getAllSettings(): Promise<AllSettings> {
  const response = await apiClient<ApiResponse<AllSettings>>('/settings/all/')
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch all settings')
  }
  
  return response.data
}

