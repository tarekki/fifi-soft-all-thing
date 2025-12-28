/**
 * Admin Settings API Functions
 * دوال API للإعدادات الأدمن
 * 
 * This file contains all API calls for admin settings management.
 * يحتوي هذا الملف على جميع استدعاءات API لإدارة إعدادات الأدمن.
 * 
 * @author Yalla Buy Team
 */

import { adminFetch } from '../api'
import type { 
  ApiResponse,
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

// =============================================================================
// Base URL
// =============================================================================
const SETTINGS_URL = '/settings'

// =============================================================================
// Site Settings API
// =============================================================================

/**
 * Get site settings
 * جلب إعدادات الموقع
 */
export async function getSiteSettings(): Promise<ApiResponse<SiteSettings>> {
  return adminFetch<SiteSettings>(`${SETTINGS_URL}/site/`)
}

/**
 * Update site settings
 * تحديث إعدادات الموقع
 */
export async function updateSiteSettings(
  data: SiteSettingsUpdate
): Promise<ApiResponse<SiteSettings>> {
  return adminFetch<SiteSettings>(`${SETTINGS_URL}/site/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// =============================================================================
// Social Links API
// =============================================================================

/**
 * Get all social links
 * جلب جميع روابط السوشيال
 */
export async function getSocialLinks(): Promise<ApiResponse<SocialLink[]>> {
  return adminFetch<SocialLink[]>(`${SETTINGS_URL}/social/`)
}

/**
 * Get social link by ID
 * جلب رابط سوشيال بالـ ID
 */
export async function getSocialLink(id: number): Promise<ApiResponse<SocialLink>> {
  return adminFetch<SocialLink>(`${SETTINGS_URL}/social/${id}/`)
}

/**
 * Create social link
 * إنشاء رابط سوشيال
 */
export async function createSocialLink(
  data: SocialLinkPayload
): Promise<ApiResponse<SocialLink>> {
  return adminFetch<SocialLink>(`${SETTINGS_URL}/social/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update social link
 * تحديث رابط سوشيال
 */
export async function updateSocialLink(
  id: number,
  data: Partial<SocialLinkPayload>
): Promise<ApiResponse<SocialLink>> {
  return adminFetch<SocialLink>(`${SETTINGS_URL}/social/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete social link
 * حذف رابط سوشيال
 */
export async function deleteSocialLink(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/social/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Languages API
// =============================================================================

/**
 * Get all languages
 * جلب جميع اللغات
 */
export async function getLanguages(): Promise<ApiResponse<Language[]>> {
  return adminFetch<Language[]>(`${SETTINGS_URL}/languages/`)
}

/**
 * Create language
 * إنشاء لغة
 */
export async function createLanguage(
  data: LanguagePayload
): Promise<ApiResponse<Language>> {
  return adminFetch<Language>(`${SETTINGS_URL}/languages/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update language
 * تحديث لغة
 */
export async function updateLanguage(
  id: number,
  data: Partial<LanguagePayload>
): Promise<ApiResponse<Language>> {
  return adminFetch<Language>(`${SETTINGS_URL}/languages/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete language
 * حذف لغة
 */
export async function deleteLanguage(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/languages/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Navigation API
// =============================================================================

/**
 * Get all navigation items grouped by location
 * جلب جميع عناصر التنقل مجمعة بالموقع
 */
export async function getNavigationMenus(): Promise<ApiResponse<NavigationMenus>> {
  return adminFetch<NavigationMenus>(`${SETTINGS_URL}/navigation/`)
}

/**
 * Get navigation items by location
 * جلب عناصر التنقل بالموقع
 */
export async function getNavigationByLocation(
  location: NavigationLocation
): Promise<ApiResponse<NavigationItem[]>> {
  return adminFetch<NavigationItem[]>(`${SETTINGS_URL}/navigation/?location=${location}`)
}

/**
 * Get navigation item by ID
 * جلب عنصر تنقل بالـ ID
 */
export async function getNavigationItem(id: number): Promise<ApiResponse<NavigationItem>> {
  return adminFetch<NavigationItem>(`${SETTINGS_URL}/navigation/${id}/`)
}

/**
 * Create navigation item
 * إنشاء عنصر تنقل
 */
export async function createNavigationItem(
  data: NavigationItemPayload
): Promise<ApiResponse<NavigationItem>> {
  return adminFetch<NavigationItem>(`${SETTINGS_URL}/navigation/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update navigation item
 * تحديث عنصر تنقل
 */
export async function updateNavigationItem(
  id: number,
  data: Partial<NavigationItemPayload>
): Promise<ApiResponse<NavigationItem>> {
  return adminFetch<NavigationItem>(`${SETTINGS_URL}/navigation/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete navigation item
 * حذف عنصر تنقل
 */
export async function deleteNavigationItem(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/navigation/${id}/`, {
    method: 'DELETE',
  })
}

/**
 * Bulk update navigation items (reorder)
 * تحديث عناصر التنقل بالجملة (إعادة ترتيب)
 */
export async function bulkUpdateNavigation(
  location: NavigationLocation,
  items: NavigationItemPayload[]
): Promise<ApiResponse<NavigationItem[]>> {
  return adminFetch<NavigationItem[]>(`${SETTINGS_URL}/navigation/bulk/`, {
    method: 'POST',
    body: JSON.stringify({ location, items }),
  })
}

// =============================================================================
// Trust Signals API
// =============================================================================

/**
 * Get all trust signals
 * جلب جميع مؤشرات الثقة
 */
export async function getTrustSignals(): Promise<ApiResponse<TrustSignal[]>> {
  return adminFetch<TrustSignal[]>(`${SETTINGS_URL}/trust-signals/`)
}

/**
 * Create trust signal
 * إنشاء مؤشر ثقة
 */
export async function createTrustSignal(
  data: TrustSignalPayload
): Promise<ApiResponse<TrustSignal>> {
  return adminFetch<TrustSignal>(`${SETTINGS_URL}/trust-signals/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update trust signal
 * تحديث مؤشر ثقة
 */
export async function updateTrustSignal(
  id: number,
  data: Partial<TrustSignalPayload>
): Promise<ApiResponse<TrustSignal>> {
  return adminFetch<TrustSignal>(`${SETTINGS_URL}/trust-signals/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete trust signal
 * حذف مؤشر ثقة
 */
export async function deleteTrustSignal(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/trust-signals/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Payment Methods API
// =============================================================================

/**
 * Get all payment methods
 * جلب جميع طرق الدفع
 */
export async function getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
  return adminFetch<PaymentMethod[]>(`${SETTINGS_URL}/payments/`)
}

/**
 * Create payment method
 * إنشاء طريقة دفع
 */
export async function createPaymentMethod(
  data: PaymentMethodPayload
): Promise<ApiResponse<PaymentMethod>> {
  return adminFetch<PaymentMethod>(`${SETTINGS_URL}/payments/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update payment method
 * تحديث طريقة دفع
 */
export async function updatePaymentMethod(
  id: number,
  data: Partial<PaymentMethodPayload>
): Promise<ApiResponse<PaymentMethod>> {
  return adminFetch<PaymentMethod>(`${SETTINGS_URL}/payments/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete payment method
 * حذف طريقة دفع
 */
export async function deletePaymentMethod(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/payments/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// Shipping Methods API
// =============================================================================

/**
 * Get all shipping methods
 * جلب جميع طرق الشحن
 */
export async function getShippingMethods(): Promise<ApiResponse<ShippingMethod[]>> {
  return adminFetch<ShippingMethod[]>(`${SETTINGS_URL}/shipping/`)
}

/**
 * Create shipping method
 * إنشاء طريقة شحن
 */
export async function createShippingMethod(
  data: ShippingMethodPayload
): Promise<ApiResponse<ShippingMethod>> {
  return adminFetch<ShippingMethod>(`${SETTINGS_URL}/shipping/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update shipping method
 * تحديث طريقة شحن
 */
export async function updateShippingMethod(
  id: number,
  data: Partial<ShippingMethodPayload>
): Promise<ApiResponse<ShippingMethod>> {
  return adminFetch<ShippingMethod>(`${SETTINGS_URL}/shipping/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Delete shipping method
 * حذف طريقة شحن
 */
export async function deleteShippingMethod(id: number): Promise<ApiResponse<null>> {
  return adminFetch<null>(`${SETTINGS_URL}/shipping/${id}/`, {
    method: 'DELETE',
  })
}

// =============================================================================
// All Settings API
// =============================================================================

/**
 * Get all settings combined
 * جلب جميع الإعدادات مجمعة
 */
export async function getAllSettings(): Promise<ApiResponse<AllSettings>> {
  return adminFetch<AllSettings>(`${SETTINGS_URL}/all/`)
}

