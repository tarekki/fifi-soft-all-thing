# SEO Utilities - دليل الاستخدام

## نظرة عامة

أدوات SEO شاملة لتحسين محركات البحث في Next.js 14.

**Features:**
- ✅ Metadata generators (Open Graph, Twitter Cards)
- ✅ Structured Data (JSON-LD) schemas
- ✅ Sitemap generation
- ✅ Security: XSS prevention, URL validation, data sanitization

---

## الاستخدام

### 1. Metadata في الصفحات

```typescript
// app/products/[slug]/page.tsx
import { generateProductMetadata } from '@/lib/seo'

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  return generateProductMetadata({
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    slug: product.slug,
    vendor: {
      name: product.vendor.name,
      slug: product.vendor.slug,
    },
  })
}
```

### 2. Structured Data (JSON-LD)

```typescript
// app/products/[slug]/page.tsx
import { generateProductSchema, renderJsonLd } from '@/lib/seo'

export default function ProductPage({ product }) {
  const schema = generateProductSchema({
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    slug: product.slug,
    vendor: product.vendor,
    availability: 'InStock',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(schema) }}
      />
      {/* Product content */}
    </>
  )
}
```

### 3. Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { generateCompleteSitemap } from '@/lib/seo'
import { getProducts } from '@/lib/actions/product.actions'
import { getVendors } from '@/lib/actions/vendor.actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, vendors] = await Promise.all([
    getProducts({ limit: 10000 }), // Get all products
    getVendors({ limit: 1000 }),   // Get all vendors
  ])

  return generateCompleteSitemap({
    products: products.data.map((p) => ({
      slug: p.slug,
      updated_at: p.updated_at,
    })),
    vendors: vendors.data.map((v) => ({
      slug: v.slug,
      updated_at: v.updated_at,
    })),
  })
}
```

### 4. Breadcrumbs

```typescript
import { generateBreadcrumbSchema, renderJsonLd } from '@/lib/seo'

const breadcrumbs = generateBreadcrumbSchema([
  { name: 'الرئيسية', url: '/' },
  { name: 'المنتجات', url: '/products' },
  { name: product.name, url: `/products/${product.slug}` },
])

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbs) }}
/>
```

---

## الأمان

جميع الأدوات تتضمن:
- ✅ **Sanitization**: تنظيف جميع البيانات من HTML tags
- ✅ **XSS Prevention**: منع XSS في metadata و structured data
- ✅ **URL Validation**: التحقق من صحة URLs
- ✅ **Length Limits**: حدود طول النصوص (160 حرف للوصف)

---

## الملفات

- `metadata.ts` - Metadata generators
- `structured-data.ts` - JSON-LD schemas
- `sitemap.ts` - Sitemap generation
- `index.ts` - Central export

---

## ملاحظات

1. **Environment Variables**: تأكد من تعيين `NEXT_PUBLIC_SITE_URL` في `.env.local`
2. **Server Components**: استخدم SEO utilities في Server Components فقط
3. **Performance**: Sitemap generation يجب أن يكون في `app/sitemap.ts` (Next.js route)

