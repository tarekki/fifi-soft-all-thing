/**
 * SEO Metadata Utilities
 * أدوات metadata للـ SEO
 * 
 * Generates SEO-friendly metadata for Next.js pages
 * يولد metadata صديق للـ SEO لصفحات Next.js
 * 
 * Features:
 * - Page-specific metadata
 * - Open Graph tags
 * - Twitter Card tags
 * - Canonical URLs
 * - Language and locale support
 * 
 * المميزات:
 * - metadata خاص بالصفحة
 * - علامات Open Graph
 * - علامات Twitter Card
 * - URLs Canonical
 * - دعم اللغة والمنطقة
 * 
 * Security:
 * - Sanitizes user-generated content
 * - Prevents XSS in metadata
 * - Validates URLs
 * 
 * الأمان:
 * - ينظف المحتوى المولد من المستخدم
 * - يمنع XSS في metadata
 * - يتحقق من URLs
 */

import type { Metadata } from 'next'

/**
 * Site Configuration
 * إعدادات الموقع
 */
const SITE_CONFIG = {
  name: 'Trendyol Syria',
  nameAr: 'ترنديول سوريا',
  description: 'منصة تجارة إلكترونية متعددة البائعين - تسوق من أفضل الماركات السورية',
  descriptionEn: 'Multi-vendor e-commerce platform - Shop from the best Syrian brands',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com',
  locale: 'ar_SY',
  localeAlternate: ['en_US'],
  defaultLanguage: 'ar',
  twitterHandle: '@trendyol_syria',
  ogImage: '/og-image.jpg', // Default OG image
}

/**
 * Base Metadata
 * Metadata الأساسي
 * 
 * Default metadata for all pages
 * metadata افتراضي لجميع الصفحات
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.nameAr,
    template: `%s | ${SITE_CONFIG.nameAr}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'تجارة إلكترونية',
    'تسوق أونلاين',
    'سوريا',
    'أحذية أطفال',
    'أحذية نسائية',
    'حقائب',
    'Fifi',
    'Soft',
    'e-commerce',
    'Syria',
    'online shopping',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    alternateLocale: SITE_CONFIG.localeAlternate,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.nameAr,
    title: SITE_CONFIG.nameAr,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.nameAr,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.nameAr,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // إضافة رموز التحقق عندما تكون متاحة
    // google: 'verification-code',
    // yandex: 'verification-code',
    // yahoo: 'verification-code',
  },
}

/**
 * Generate page metadata
 * توليد metadata للصفحة
 * 
 * @param options - Metadata options
 * @returns Metadata object for Next.js
 * 
 * Security: Sanitizes all user-generated content
 * الأمان: ينظف جميع المحتوى المولد من المستخدم
 */
export function generateMetadata(options: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  noindex?: boolean
  nofollow?: boolean
}): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    noindex = false,
    nofollow = false,
  } = options

  // Sanitize title
  // تنظيف العنوان
  const sanitizedTitle = title
    ? title.replace(/[<>]/g, '').trim()
    : undefined

  // Sanitize description
  // تنظيف الوصف
  const sanitizedDescription = description
    ? description.replace(/[<>]/g, '').trim().substring(0, 160)
    : undefined

  // Build full title
  // بناء العنوان الكامل
  const fullTitle = sanitizedTitle
    ? `${sanitizedTitle} | ${SITE_CONFIG.nameAr}`
    : SITE_CONFIG.nameAr

  // Build canonical URL
  // بناء URL Canonical
  const canonicalUrl = url
    ? new URL(url, SITE_CONFIG.url).toString()
    : SITE_CONFIG.url

  // Build OG image URL
  // بناء URL صورة OG
  const ogImageUrl = image
    ? new URL(image, SITE_CONFIG.url).toString()
    : new URL(SITE_CONFIG.ogImage, SITE_CONFIG.url).toString()

  return {
    title: sanitizedTitle || SITE_CONFIG.nameAr,
    description: sanitizedDescription || SITE_CONFIG.description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ar-SY': canonicalUrl,
        'en-US': canonicalUrl,
      },
    },
    openGraph: {
      type,
      locale: SITE_CONFIG.locale,
      alternateLocale: SITE_CONFIG.localeAlternate,
      url: canonicalUrl,
      siteName: SITE_CONFIG.nameAr,
      title: fullTitle,
      description: sanitizedDescription || SITE_CONFIG.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: sanitizedTitle || SITE_CONFIG.nameAr,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && authors.length > 0 && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: sanitizedDescription || SITE_CONFIG.description,
      images: [ogImageUrl],
      creator: SITE_CONFIG.twitterHandle,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate product metadata
 * توليد metadata للمنتج
 * 
 * @param product - Product data
 * @returns Metadata object for product page
 * 
 * Security: Sanitizes product data
 * الأمان: ينظف بيانات المنتج
 */
export function generateProductMetadata(product: {
  name: string
  description?: string
  price: string
  image?: string
  slug: string
  vendor?: { name: string; slug: string }
}): Metadata {
  // Sanitize product data
  // تنظيف بيانات المنتج
  const sanitizedName = product.name.replace(/[<>]/g, '').trim()
  const sanitizedDescription = product.description
    ? product.description.replace(/[<>]/g, '').trim().substring(0, 160)
    : undefined

  // Build product URL
  // بناء URL المنتج
  const productUrl = `/products/${product.slug}`

  // Build keywords
  // بناء الكلمات المفتاحية
  const keywords = [
    sanitizedName,
    product.vendor?.name || '',
    'تسوق أونلاين',
    'سوريا',
    'e-commerce',
    'Syria',
  ].filter(Boolean)

  return generateMetadata({
    title: sanitizedName,
    description:
      sanitizedDescription ||
      `تسوق ${sanitizedName} من ${product.vendor?.name || 'Trendyol Syria'}. السعر: ${product.price} ليرة سورية`,
    keywords,
    url: productUrl,
    type: 'product',
    image: product.image,
  })
}

/**
 * Generate vendor metadata
 * توليد metadata للبائع
 * 
 * @param vendor - Vendor data
 * @returns Metadata object for vendor page
 */
export function generateVendorMetadata(vendor: {
  name: string
  description?: string
  logo?: string
  slug: string
}): Metadata {
  // Sanitize vendor data
  // تنظيف بيانات البائع
  const sanitizedName = vendor.name.replace(/[<>]/g, '').trim()
  const sanitizedDescription = vendor.description
    ? vendor.description.replace(/[<>]/g, '').trim().substring(0, 160)
    : undefined

  // Build vendor URL
  // بناء URL البائع
  const vendorUrl = `/vendors/${vendor.slug}`

  // Build keywords
  // بناء الكلمات المفتاحية
  const keywords = [
    sanitizedName,
    'ماركة سورية',
    'تسوق أونلاين',
    'سوريا',
    'Syrian brand',
    'e-commerce',
  ].filter(Boolean)

  return generateMetadata({
    title: sanitizedName,
    description:
      sanitizedDescription ||
      `تسوق من ${sanitizedName} - أفضل الماركات السورية على Trendyol Syria`,
    keywords,
    url: vendorUrl,
    type: 'website',
    image: vendor.logo,
  })
}

/**
 * Sanitize text for metadata
 * تنظيف النص للـ metadata
 * 
 * @param text - Text to sanitize
 * @param maxLength - Maximum length
 * @returns Sanitized text
 * 
 * Security: Removes HTML tags and limits length
 * الأمان: يزيل علامات HTML ويحدد الطول
 */
export function sanitizeMetadataText(text: string, maxLength: number = 160): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, maxLength)
}

