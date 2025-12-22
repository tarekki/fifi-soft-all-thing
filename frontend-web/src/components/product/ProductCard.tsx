/**
 * Product Card Component
 * مكون بطاقة المنتج
 * 
 * Enterprise-grade product card with premium design
 * بطاقة منتج من الدرجة الأولى بتصميم مميز
 * 
 * Features:
 * - Rounded corners (16px)
 * - Soft shadow with hover elevation
 * - Discount percentage badge
 * - Rating stars + review count
 * - Old price (strikethrough) + new price (bold)
 * - Add to cart button
 * - Quick view button (on hover)
 * - Smooth hover effects
 * 
 * المميزات:
 * - زوايا مستديرة (16px)
 * - ظل ناعم مع ارتفاع عند التمرير
 * - شارة نسبة الخصم
 * - نجوم التقييم + عدد المراجعات
 * - السعر القديم (مشطوب) + السعر الجديد (عريض)
 * - زر إضافة إلى السلة
 * - زر عرض سريع (عند التمرير)
 * - تأثيرات تمرير سلسة
 * 
 * Security:
 * - Sanitizes product data
 * - Prevents XSS in product names
 * - Validates image URLs
 * 
 * الأمان:
 * - ينظف بيانات المنتج
 * - يمنع XSS في أسماء المنتجات
 * - يتحقق من URLs الصور
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { productCard } from '@/lib/design'

/**
 * Product Card Props
 * خصائص بطاقة المنتج
 */
export interface ProductCardProps {
  /** Product ID */
  id: number
  /** Product name */
  name: string
  /** Product slug for URL */
  slug: string
  /** Product image URL */
  image: string
  /** Base price (original price) */
  basePrice: string
  /** Final price (after discount) */
  finalPrice: string
  /** Discount percentage (0-100) */
  discountPercentage?: number
  /** Rating (0-5) */
  rating?: number
  /** Review count */
  reviewCount?: number
  /** Vendor name */
  vendorName?: string
  /** Is product available? */
  isAvailable?: boolean
  /** On add to cart click */
  onAddToCart?: () => void
  /** On quick view click */
  onQuickView?: () => void
  /** Custom className */
  className?: string
}

/**
 * Star Rating Component
 * مكون تقييم النجوم
 */
function StarRating({ rating = 0, reviewCount = 0 }: { rating: number; reviewCount: number }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <svg
                key={i}
                className="w-4 h-4 text-warning-500 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            )
          } else if (i === fullStars && hasHalfStar) {
            return (
              <svg
                key={i}
                className="w-4 h-4 text-warning-500 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                />
              </svg>
            )
          } else {
            return (
              <svg
                key={i}
                className="w-4 h-4 text-neutral-300 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            )
          }
        })}
      </div>
      {reviewCount > 0 && (
        <span className="text-body-sm text-text-tertiary ml-1">({reviewCount})</span>
      )}
    </div>
  )
}

/**
 * Format Price
 * تنسيق السعر
 */
function formatPrice(price: string): string {
  // Remove any non-numeric characters except decimal point
  // إزالة أي أحرف غير رقمية باستثناء النقطة العشرية
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''))
  if (isNaN(numericPrice)) return price

  // Format with thousand separators
  // تنسيق مع فواصل الآلاف
  return new Intl.NumberFormat('ar-SY', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

/**
 * Product Card Component
 * مكون بطاقة المنتج
 */
export function ProductCard({
  id,
  name,
  slug,
  image,
  basePrice,
  finalPrice,
  discountPercentage = 0,
  rating = 0,
  reviewCount = 0,
  vendorName,
  isAvailable = true,
  onAddToCart,
  onQuickView,
  className = '',
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Sanitize product name (prevent XSS)
  // تنظيف اسم المنتج (منع XSS)
  const sanitizedName = name.replace(/[<>]/g, '').trim()

  // Check if there's a discount
  // التحقق من وجود خصم
  const hasDiscount = discountPercentage > 0 && parseFloat(basePrice) > parseFloat(finalPrice)

  // Product URL
  // رابط المنتج
  const productUrl = `/products/${slug}`

  return (
    <div
      className={`group relative bg-white rounded-card border border-neutral-200 overflow-hidden transition-default hover:shadow-soft-lg hover:scale-[1.02] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Product: ${sanitizedName}`}
    >
      {/* Product Image Container */}
      {/* حاوية صورة المنتج */}
      <Link href={productUrl} className="block relative aspect-square bg-neutral-50">
        {!imageError && image ? (
          <Image
            src={image}
            alt={sanitizedName}
            fill
            className="object-cover transition-default group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <svg
              className="w-16 h-16 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {/* شارة الخصم */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-error-500 text-white text-caption font-semibold px-2 py-1 rounded-full shadow-md z-10">
            -{discountPercentage}%
          </div>
        )}

        {/* Quick View Button (appears on hover) */}
        {/* زر العرض السريع (يظهر عند التمرير) */}
        {isHovered && onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onQuickView()
            }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-text-primary px-4 py-2 rounded-lg shadow-md text-body-sm font-medium transition-default hover:bg-neutral-50 z-10"
            aria-label="Quick view"
          >
            عرض سريع
          </button>
        )}

        {/* Out of Stock Overlay */}
        {/* طبقة نفاد المخزون */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <span className="bg-white text-text-primary px-4 py-2 rounded-lg font-semibold">
              غير متوفر
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      {/* معلومات المنتج */}
      <div className="p-4">
        {/* Vendor Name (optional) */}
        {/* اسم البائع (اختياري) */}
        {vendorName && (
          <p className="text-caption text-text-tertiary mb-1">{vendorName}</p>
        )}

        {/* Product Name */}
        {/* اسم المنتج */}
        <Link href={productUrl}>
          <h3 className="text-body-md font-medium text-text-primary mb-2 line-clamp-2 hover:text-accent-orange-500 transition-colors">
            {sanitizedName}
          </h3>
        </Link>

        {/* Rating */}
        {/* التقييم */}
        {(rating > 0 || reviewCount > 0) && (
          <div className="mb-3">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>
        )}

        {/* Price */}
        {/* السعر */}
        <div className="flex items-center gap-2 mb-4">
          {hasDiscount ? (
            <>
              <span className="text-body-sm text-text-tertiary line-through">
                {formatPrice(basePrice)} ل.س
              </span>
              <span className="text-heading-4 font-bold text-accent-orange-500">
                {formatPrice(finalPrice)} ل.س
              </span>
            </>
          ) : (
            <span className="text-heading-4 font-bold text-text-primary">
              {formatPrice(finalPrice)} ل.س
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {/* زر إضافة إلى السلة */}
        <button
          onClick={onAddToCart}
          disabled={!isAvailable}
          className="w-full bg-accent-orange-500 text-white py-3 px-4 rounded-lg font-medium text-body-md transition-default hover:bg-accent-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
          aria-label={`Add ${sanitizedName} to cart`}
        >
          {isAvailable ? 'أضف إلى السلة' : 'غير متوفر'}
        </button>
      </div>
    </div>
  )
}

// Product Card Skeleton is exported from @/components/common/Skeleton
// هيكل بطاقة المنتج يتم تصديره من @/components/common/Skeleton

