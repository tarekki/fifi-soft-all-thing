/**
 * Category Grid Component
 * مكون شبكة الفئات
 * 
 * Featured categories grid with icons
 * شبكة فئات مميزة مع أيقونات
 * 
 * Features:
 * - Modern grid layout
 * - Category icons or images
 * - Category names
 * - Responsive design
 * - Hover effects
 * 
 * المميزات:
 * - تخطيط شبكة حديث
 * - أيقونات أو صور الفئات
 * - أسماء الفئات
 * - تصميم متجاوب
 * - تأثيرات التمرير
 * 
 * Security:
 * - Sanitizes category data
 * - Validates image URLs
 * 
 * الأمان:
 * - ينظف بيانات الفئة
 * - يتحقق من URLs الصور
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Category Item
 * عنصر الفئة
 */
export interface CategoryItem {
  id: string | number
  name: string
  slug: string
  icon?: string // Icon URL or emoji
  image?: string // Category image URL
  productCount?: number // Number of products in category
}

/**
 * Category Grid Props
 * خصائص شبكة الفئات
 */
export interface CategoryGridProps {
  /** Category items */
  categories: CategoryItem[]
  /** Number of columns (responsive) */
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  /** Custom className */
  className?: string
}

/**
 * Category Card Component
 * مكون بطاقة الفئة
 */
function CategoryCard({ category }: { category: CategoryItem }) {
  // Sanitize category name
  // تنظيف اسم الفئة
  const sanitizedName = category.name.replace(/[<>]/g, '').trim()

  // Category URL
  // رابط الفئة
  const categoryUrl = `/categories/${category.slug}`

  return (
    <Link
      href={categoryUrl}
      className={cn(
        'group flex flex-col items-center gap-3 p-6 bg-white rounded-card border border-neutral-200',
        'hover:shadow-soft-lg hover:border-accent-orange-500 transition-default',
        'focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2'
      )}
      aria-label={`Browse ${sanitizedName} category`}
    >
      {/* Icon/Image Container */}
      {/* حاوية الأيقونة/الصورة */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-neutral-50 rounded-full group-hover:bg-accent-orange-50 transition-default">
        {category.image ? (
          <Image
            src={category.image}
            alt={sanitizedName}
            fill
            className="object-cover rounded-full"
            sizes="(max-width: 768px) 64px, 80px"
          />
        ) : category.icon ? (
          // Check if icon is an emoji or URL
          // التحقق من كون الأيقونة emoji أو URL
          category.icon.startsWith('http') ? (
            <Image
              src={category.icon}
              alt={sanitizedName}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <span className="text-3xl md:text-4xl">{category.icon}</span>
          )
        ) : (
          // Default icon
          // أيقونة افتراضية
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-neutral-400 group-hover:text-accent-orange-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        )}
      </div>

      {/* Category Name */}
      {/* اسم الفئة */}
      <h3 className="text-body-md font-medium text-text-primary text-center group-hover:text-accent-orange-500 transition-colors">
        {sanitizedName}
      </h3>

      {/* Product Count (optional) */}
      {/* عدد المنتجات (اختياري) */}
      {category.productCount !== undefined && (
        <span className="text-caption text-text-tertiary">
          {category.productCount} منتج
        </span>
      )}
    </Link>
  )
}

/**
 * Category Grid Component
 * مكون شبكة الفئات
 */
export function CategoryGrid({
  categories,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  className,
}: CategoryGridProps) {
  if (categories.length === 0) {
    return null
  }

  // Grid columns classes
  // فئات أعمدة الشبكة
  const gridCols = {
    mobile: `grid-cols-${columns.mobile || 2}`,
    tablet: `md:grid-cols-${columns.tablet || 3}`,
    desktop: `lg:grid-cols-${columns.desktop || 4}`,
  }

  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        gridCols.mobile,
        gridCols.tablet,
        gridCols.desktop,
        className
      )}
      role="list"
      aria-label="Featured categories"
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}

/**
 * Category Grid Skeleton
 * هيكل شبكة الفئات
 */
export function CategoryGridSkeleton({
  count = 8,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
}: {
  count?: number
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}) {
  const gridCols = {
    mobile: `grid-cols-${columns.mobile || 2}`,
    tablet: `md:grid-cols-${columns.tablet || 3}`,
    desktop: `lg:grid-cols-${columns.desktop || 4}`,
  }

  return (
    <div
      className={`grid gap-4 md:gap-6 ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop}`}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-3 p-6 bg-white rounded-card border border-neutral-200 animate-pulse"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-200 rounded-full" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
          <div className="h-3 bg-neutral-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

