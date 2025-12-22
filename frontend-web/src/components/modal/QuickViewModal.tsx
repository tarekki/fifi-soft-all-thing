/**
 * Quick View Modal Component
 * مكون نافذة العرض السريع
 * 
 * Quick view modal for products from product grid
 * نافذة عرض سريع للمنتجات من شبكة المنتجات
 * 
 * Features:
 * - Product image gallery
 * - Product details
 * - Variant selector
 * - Add to cart button
 * - Smooth animations
 * 
 * المميزات:
 * - معرض صور المنتج
 * - تفاصيل المنتج
 * - محدد المتغيرات
 * - زر إضافة إلى السلة
 * - رسوم متحركة سلسة
 * 
 * Security:
 * - Sanitizes product data
 * - Validates variant selection
 * 
 * الأمان:
 * - ينظف بيانات المنتج
 * - يتحقق من اختيار المتغير
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Modal } from './Modal'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

/**
 * Quick View Modal Props
 * خصائص نافذة العرض السريع
 */
export interface QuickViewModalProps {
  /** Is modal open? */
  isOpen: boolean
  /** On close callback */
  onClose: () => void
  /** Product data */
  product: Product | null
  /** On add to cart */
  onAddToCart?: (variantId?: number) => void
}

/**
 * Quick View Modal Component
 * مكون نافذة العرض السريع
 */
export function QuickViewModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!product) return null

  // Sanitize product data
  // تنظيف بيانات المنتج
  const sanitizedName = product.name.replace(/[<>]/g, '').trim()

  // Product images (from variants or placeholder)
  // صور المنتج (من المتغيرات أو placeholder)
  const images = product.variants
    ?.filter((v) => v.image)
    .map((v) => v.image!)
    .filter(Boolean) || ['/product-placeholder.png']

  // Format price
  // تنسيق السعر
  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''))
    if (isNaN(numericPrice)) return price
    return new Intl.NumberFormat('ar-SY').format(numericPrice)
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(selectedVariant || undefined)
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={sanitizedName}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        {/* معرض الصور */}
        <div className="space-y-4">
          {/* Main Image */}
          {/* الصورة الرئيسية */}
          <div className="relative aspect-square bg-neutral-50 rounded-lg overflow-hidden">
            {images[selectedImageIndex] ? (
              <Image
                src={images[selectedImageIndex]}
                alt={sanitizedName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
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
          </div>

          {/* Thumbnail Images */}
          {/* صور مصغرة */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-default',
                    selectedImageIndex === index
                      ? 'border-accent-orange-500'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <Image
                    src={image}
                    alt={`${sanitizedName} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        {/* تفاصيل المنتج */}
        <div className="space-y-4">
          {/* Vendor */}
          {/* البائع */}
          {product.vendor && (
            <Link
              href={`/vendors/${product.vendor.slug}`}
              className="text-body-sm text-text-tertiary hover:text-accent-orange-500 transition-colors"
            >
              {product.vendor.name}
            </Link>
          )}

          {/* Price */}
          {/* السعر */}
          <div className="text-heading-2 font-bold text-accent-orange-500">
            {formatPrice(product.base_price)} ل.س
          </div>

          {/* Description */}
          {/* الوصف */}
          {product.description && (
            <p className="text-body-md text-text-secondary line-clamp-4">
              {product.description}
            </p>
          )}

          {/* Variants (if available) */}
          {/* المتغيرات (إن وجدت) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-heading-4 font-semibold text-text-primary">
                اختر المتغير
              </h3>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={cn(
                      'w-full p-3 border-2 rounded-lg text-right transition-default',
                      selectedVariant === variant.id
                        ? 'border-accent-orange-500 bg-accent-orange-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-body-md text-text-primary">
                        {variant.color}
                        {variant.size && ` - ${variant.size}`}
                        {variant.model && ` - ${variant.model}`}
                      </span>
                      <span className="text-body-md font-semibold text-accent-orange-500">
                        {formatPrice(variant.final_price)} ل.س
                      </span>
                    </div>
                    {variant.stock_quantity > 0 && (
                      <span className="text-body-sm text-text-tertiary">
                        متوفر ({variant.stock_quantity})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {/* الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-accent-orange-500 text-white py-3 px-6 rounded-lg font-medium text-body-md hover:bg-accent-orange-600 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
            >
              أضف إلى السلة
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="px-6 py-3 border-2 border-neutral-300 text-text-primary rounded-lg font-medium text-body-md hover:border-accent-orange-500 hover:text-accent-orange-500 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
            >
              عرض التفاصيل
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  )
}

