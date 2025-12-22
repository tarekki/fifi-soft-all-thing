/**
 * Skeleton Loader Components
 * مكونات هيكل التحميل
 * 
 * Reusable skeleton loaders for loading states
 * هياكل تحميل قابلة لإعادة الاستخدام لحالات التحميل
 * 
 * Features:
 * - Product Card Skeleton
 * - Text Skeleton (various sizes)
 * - Image Skeleton
 * - List Skeleton
 * - Customizable width and height
 * 
 * المميزات:
 * - هيكل بطاقة المنتج
 * - هيكل النص (أحجام مختلفة)
 * - هيكل الصورة
 * - هيكل القائمة
 * - قابل للتخصيص (العرض والارتفاع)
 * 
 * Security:
 * - No user input
 * - Safe rendering
 * 
 * الأمان:
 * - لا يوجد إدخال من المستخدم
 * - عرض آمن
 */

import { cn } from '@/lib/utils'

/**
 * Base Skeleton Component
 * مكون الهيكل الأساسي
 */
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200',
        className
      )}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Text Skeleton
 * هيكل النص
 */
interface TextSkeletonProps {
  lines?: number
  className?: string
  width?: string
}

export function TextSkeleton({ lines = 1, className, width = '100%' }: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          height="1rem"
          width={i === lines - 1 ? '75%' : width}
          className="h-4"
        />
      ))}
    </div>
  )
}

/**
 * Image Skeleton
 * هيكل الصورة
 */
interface ImageSkeletonProps {
  aspectRatio?: 'square' | 'wide' | 'tall'
  className?: string
}

export function ImageSkeleton({ aspectRatio = 'square', className }: ImageSkeletonProps) {
  const aspectRatios = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  }

  return (
    <Skeleton
      className={cn(aspectRatios[aspectRatio], 'w-full', className)}
      aria-hidden="true"
    />
  )
}

/**
 * Product Card Skeleton
 * هيكل بطاقة المنتج
 */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-card border border-neutral-200 overflow-hidden', className)}>
      {/* Image Skeleton */}
      <ImageSkeleton aspectRatio="square" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Vendor Name */}
        <Skeleton height="0.75rem" width="40%" className="h-3" />

        {/* Product Name (2 lines) */}
        <TextSkeleton lines={2} />

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width="1rem" height="1rem" className="rounded-full" />
          ))}
          <Skeleton width="3rem" height="0.75rem" className="h-3 ml-2" />
        </div>

        {/* Price */}
        <Skeleton height="1.5rem" width="40%" className="h-6" />

        {/* Button */}
        <Skeleton height="2.5rem" width="100%" className="h-10 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * List Skeleton
 * هيكل القائمة
 */
interface ListSkeletonProps {
  items?: number
  className?: string
}

export function ListSkeleton({ items = 3, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton width="4rem" height="4rem" className="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Grid Skeleton
 * هيكل الشبكة
 */
interface GridSkeletonProps {
  columns?: number
  rows?: number
  className?: string
  itemClassName?: string
}

export function GridSkeleton({
  columns = 4,
  rows = 2,
  className,
  itemClassName,
}: GridSkeletonProps) {
  const totalItems = columns * rows

  return (
    <div
      className={cn(
        'grid gap-6',
        `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`,
        className
      )}
    >
      {[...Array(totalItems)].map((_, i) => (
        <ProductCardSkeleton key={i} className={itemClassName} />
      ))}
    </div>
  )
}

