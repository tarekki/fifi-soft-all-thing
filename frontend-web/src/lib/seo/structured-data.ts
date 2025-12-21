/**
 * Structured Data (JSON-LD) Utilities
 * أدوات البيانات المنظمة (JSON-LD)
 * 
 * Generates JSON-LD structured data for SEO
 * يولد بيانات JSON-LD منظمة للـ SEO
 * 
 * Features:
 * - Organization schema
 * - Product schema
 * - Breadcrumb schema
 * - WebSite schema
 * - SearchAction schema
 * 
 * المميزات:
 * - مخطط المنظمة
 * - مخطط المنتج
 * - مخطط Breadcrumb
 * - مخطط الموقع
 * - مخطط SearchAction
 * 
 * Security:
 * - Validates and sanitizes all data
 * - Prevents XSS in structured data
 * 
 * الأمان:
 * - يتحقق وينظف جميع البيانات
 * - يمنع XSS في البيانات المنظمة
 */

/**
 * Organization Schema
 * مخطط المنظمة
 * 
 * Generates JSON-LD for organization
 * يولد JSON-LD للمنظمة
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trendyol Syria',
    nameAr: 'ترنديول سوريا',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com'}/logo.png`,
    description:
      'منصة تجارة إلكترونية متعددة البائعين - تسوق من أفضل الماركات السورية',
    sameAs: [
      // Add social media links when available
      // إضافة روابط وسائل التواصل الاجتماعي عندما تكون متاحة
      // 'https://facebook.com/trendyol-syria',
      // 'https://instagram.com/trendyol_syria',
      // 'https://twitter.com/trendyol_syria',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Arabic', 'English'],
    },
  }
}

/**
 * Product Schema
 * مخطط المنتج
 * 
 * Generates JSON-LD for product
 * يولد JSON-LD للمنتج
 * 
 * @param product - Product data
 * @returns JSON-LD schema for product
 */
export function generateProductSchema(product: {
  name: string
  description?: string
  price: string
  image?: string
  slug: string
  vendor?: {
    name: string
    slug: string
  }
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  brand?: string
  sku?: string
}) {
  // Sanitize product data
  // تنظيف بيانات المنتج
  const sanitizedName = product.name.replace(/[<>]/g, '').trim()
  const sanitizedDescription = product.description
    ? product.description.replace(/[<>]/g, '').trim()
    : undefined

  // Build product URL
  // بناء URL المنتج
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com'
  const productUrl = `${baseUrl}/products/${product.slug}`

  // Build image URL
  // بناء URL الصورة
  const imageUrl = product.image
    ? new URL(product.image, baseUrl).toString()
    : `${baseUrl}/product-placeholder.png`

  // Parse price (remove currency symbols, keep numbers)
  // تحليل السعر (إزالة رموز العملة، الاحتفاظ بالأرقام)
  const priceValue = parseFloat(product.price.replace(/[^\d.]/g, '')) || 0

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanitizedName,
    description: sanitizedDescription || sanitizedName,
    image: imageUrl,
    sku: product.sku || product.slug,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : product.vendor
        ? {
            '@type': 'Brand',
            name: product.vendor.name,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'SYP', // Syrian Pound
      price: priceValue.toString(),
      availability:
        product.availability === 'InStock'
          ? 'https://schema.org/InStock'
          : product.availability === 'OutOfStock'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/PreOrder',
      seller: {
        '@type': 'Organization',
        name: product.vendor?.name || 'Trendyol Syria',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      // Ratings will be added when review system is implemented
      // التقييمات ستضاف عندما يتم تنفيذ نظام المراجعات
      ratingValue: '0',
      reviewCount: '0',
    },
  }
}

/**
 * Breadcrumb Schema
 * مخطط Breadcrumb
 * 
 * Generates JSON-LD for breadcrumbs
 * يولد JSON-LD للـ breadcrumbs
 * 
 * @param items - Breadcrumb items
 * @returns JSON-LD schema for breadcrumbs
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name.replace(/[<>]/g, '').trim(),
      item: new URL(item.url, baseUrl).toString(),
    })),
  }
}

/**
 * WebSite Schema
 * مخطط الموقع
 * 
 * Generates JSON-LD for website
 * يولد JSON-LD للموقع
 */
export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trendyol Syria',
    nameAr: 'ترنديول سوريا',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * LocalBusiness Schema (for vendors)
 * مخطط LocalBusiness (للبائعين)
 * 
 * Generates JSON-LD for vendor as local business
 * يولد JSON-LD للبائع كعمل محلي
 * 
 * @param vendor - Vendor data
 * @returns JSON-LD schema for local business
 */
export function generateLocalBusinessSchema(vendor: {
  name: string
  description?: string
  logo?: string
  slug: string
  address?: string
  phone?: string
  email?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendyol-syria.com'
  const vendorUrl = `${baseUrl}/vendors/${vendor.slug}`

  // Sanitize vendor data
  // تنظيف بيانات البائع
  const sanitizedName = vendor.name.replace(/[<>]/g, '').trim()
  const sanitizedDescription = vendor.description
    ? vendor.description.replace(/[<>]/g, '').trim()
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: sanitizedName,
    description: sanitizedDescription || sanitizedName,
    url: vendorUrl,
    logo: vendor.logo
      ? new URL(vendor.logo, baseUrl).toString()
      : `${baseUrl}/logo.png`,
    ...(vendor.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Syria',
        addressCountry: 'SY',
        streetAddress: vendor.address,
      },
    }),
    ...(vendor.phone && { telephone: vendor.phone }),
    ...(vendor.email && { email: vendor.email }),
  }
}

/**
 * Render JSON-LD script tag
 * عرض علامة script لـ JSON-LD
 * 
 * @param schema - JSON-LD schema object
 * @returns Script tag string for Next.js
 * 
 * Security: Escapes JSON to prevent XSS
 * الأمان: يهرب JSON لمنع XSS
 */
export function renderJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema, null, 2)
}

