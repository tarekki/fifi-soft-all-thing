/**
 * Sitemap Generation Utilities
 * أدوات توليد Sitemap
 * 
 * Generates sitemap for SEO
 * يولد sitemap للـ SEO
 * 
 * Features:
 * - Dynamic sitemap generation
 * - Product pages sitemap
 * - Vendor pages sitemap
 * - Static pages sitemap
 * 
 * المميزات:
 * - توليد sitemap ديناميكي
 * - sitemap صفحات المنتجات
 * - sitemap صفحات البائعين
 * - sitemap الصفحات الثابتة
 * 
 * Security:
 * - Validates URLs
 * - Sanitizes data
 * 
 * الأمان:
 * - يتحقق من URLs
 * - ينظف البيانات
 */

import type { MetadataRoute } from 'next'

/**
 * Site Configuration
 * إعدادات الموقع
 */
const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com',
  defaultChangeFrequency: 'daily' as const,
  defaultPriority: 0.8,
}

/**
 * Static Routes
 * المسارات الثابتة
 * 
 * Routes that don't change frequently
 * مسارات لا تتغير بشكل متكرر
 */
const STATIC_ROUTES = [
  {
    url: '/',
    changefreq: 'daily' as const,
    priority: 1.0,
  },
  {
    url: '/products',
    changefreq: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/vendors',
    changefreq: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: '/auth/login',
    changefreq: 'monthly' as const,
    priority: 0.3,
  },
  {
    url: '/auth/register',
    changefreq: 'monthly' as const,
    priority: 0.3,
  },
]

/**
 * Generate sitemap entry
 * توليد إدخال sitemap
 * 
 * @param url - Page URL (relative)
 * @param lastModified - Last modified date
 * @param changefreq - Change frequency
 * @param priority - Priority (0.0 to 1.0)
 * @returns Sitemap entry
 */
function createSitemapEntry(
  url: string,
  lastModified?: Date,
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = SITE_CONFIG.defaultChangeFrequency,
  priority: number = SITE_CONFIG.defaultPriority
): MetadataRoute.Sitemap[0] {
  // Validate and build full URL
  // التحقق وبناء URL الكامل
  const fullUrl = new URL(url, SITE_CONFIG.url).toString()

  return {
    url: fullUrl,
    lastModified: lastModified || new Date(),
    changeFrequency: changefreq,
    priority: Math.max(0, Math.min(1, priority)), // Clamp between 0 and 1
  }
}

/**
 * Generate static pages sitemap
 * توليد sitemap للصفحات الثابتة
 * 
 * @returns Sitemap entries for static pages
 */
export function generateStaticSitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) =>
    createSitemapEntry(route.url, undefined, route.changefreq, route.priority)
  )
}

/**
 * Generate products sitemap
 * توليد sitemap للمنتجات
 * 
 * @param products - Product data with slugs
 * @returns Sitemap entries for products
 * 
 * Note: This should be called from a Server Component or API route
 * ملاحظة: يجب استدعاء هذا من Server Component أو API route
 */
export function generateProductsSitemap(products: Array<{ slug: string; updated_at?: string }>): MetadataRoute.Sitemap {
  return products.map((product) =>
    createSitemapEntry(
      `/products/${product.slug}`,
      product.updated_at ? new Date(product.updated_at) : undefined,
      'weekly',
      0.7
    )
  )
}

/**
 * Generate vendors sitemap
 * توليد sitemap للبائعين
 * 
 * @param vendors - Vendor data with slugs
 * @returns Sitemap entries for vendors
 * 
 * Note: This should be called from a Server Component or API route
 * ملاحظة: يجب استدعاء هذا من Server Component أو API route
 */
export function generateVendorsSitemap(vendors: Array<{ slug: string; updated_at?: string }>): MetadataRoute.Sitemap {
  return vendors.map((vendor) =>
    createSitemapEntry(
      `/vendors/${vendor.slug}`,
      vendor.updated_at ? new Date(vendor.updated_at) : undefined,
      'weekly',
      0.8
    )
  )
}

/**
 * Generate complete sitemap
 * توليد sitemap كامل
 * 
 * @param options - Sitemap generation options
 * @returns Complete sitemap
 * 
 * Note: This should be called from a Server Component or API route
 * Products and vendors should be fetched from API
 * ملاحظة: يجب استدعاء هذا من Server Component أو API route
 * المنتجات والبائعون يجب جلبهم من API
 */
export async function generateCompleteSitemap(options?: {
  products?: Array<{ slug: string; updated_at?: string }>
  vendors?: Array<{ slug: string; updated_at?: string }>
}): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = []

  // Add static routes
  // إضافة المسارات الثابتة
  sitemap.push(...generateStaticSitemap())

  // Add product routes if provided
  // إضافة مسارات المنتجات إذا تم توفيرها
  if (options?.products && options.products.length > 0) {
    sitemap.push(...generateProductsSitemap(options.products))
  }

  // Add vendor routes if provided
  // إضافة مسارات البائعين إذا تم توفيرها
  if (options?.vendors && options.vendors.length > 0) {
    sitemap.push(...generateVendorsSitemap(options.vendors))
  }

  return sitemap
}

/**
 * Validate sitemap entry
 * التحقق من إدخال sitemap
 * 
 * @param entry - Sitemap entry
 * @returns True if entry is valid
 * 
 * Security: Validates URL format and prevents malicious URLs
 * الأمان: يتحقق من تنسيق URL ويمنع URLs خبيثة
 */
export function validateSitemapEntry(entry: MetadataRoute.Sitemap[0]): boolean {
  try {
    const url = new URL(entry.url)
    
    // Ensure URL belongs to our domain
    // التأكد من أن URL ينتمي لنطاقنا
    const siteUrl = new URL(SITE_CONFIG.url)
    if (url.origin !== siteUrl.origin) {
      return false
    }

    // Validate priority
    // التحقق من الأولوية
    if (entry.priority < 0 || entry.priority > 1) {
      return false
    }

    return true
  } catch {
    return false
  }
}

