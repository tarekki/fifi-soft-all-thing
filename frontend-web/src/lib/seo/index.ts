/**
 * SEO Utilities - Main Export
 * أدوات SEO - التصدير الرئيسي
 * 
 * Central export point for all SEO utilities
 * نقطة التصدير المركزية لجميع أدوات SEO
 * 
 * Usage:
 * import { generateMetadata, generateProductSchema } from '@/lib/seo'
 * 
 * الاستخدام:
 * import { generateMetadata, generateProductSchema } from '@/lib/seo'
 */

// Metadata utilities
// أدوات metadata
export {
  baseMetadata,
  generateMetadata,
  generateProductMetadata,
  generateVendorMetadata,
  sanitizeMetadataText,
} from './metadata'

// Structured Data utilities
// أدوات البيانات المنظمة
export {
  generateOrganizationSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  generateLocalBusinessSchema,
  renderJsonLd,
} from './structured-data'

// Sitemap utilities
// أدوات sitemap
export {
  generateStaticSitemap,
  generateProductsSitemap,
  generateVendorsSitemap,
  generateCompleteSitemap,
  validateSitemapEntry,
} from './sitemap'

