'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/use-translation'
import { useCart } from '@/lib/cart/context'

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
 * Product Card Component - "Sugar Glass" Edition
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
  const [isLiked, setIsLiked] = useState(false)
  const { t, language } = useTranslation();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart();
      return;
    }

    addToCart({
      id: id.toString(),
      slug: slug,
      name: { ar: name, en: name }, // Fallback to current name for both if not structured
      price: parseFloat(finalPrice.replace(/[^\d.]/g, '')),
      image: image,
      quantity: 1,
      vendor: { ar: vendorName || '', en: vendorName || '' },
    });
  };

  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''))
    if (isNaN(numericPrice)) return price

    return new Intl.NumberFormat(language === 'ar' ? 'ar-SY' : 'en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice)
  }

  const sanitizedName = name.replace(/[<>]/g, '').trim()
  const hasDiscount = discountPercentage > 0 && parseFloat(basePrice) > parseFloat(finalPrice)
  const productUrl = `/products/${slug}`

  return (
    <div
      className={`group relative bg-white/70 backdrop-blur-md rounded-[2rem] border border-stone-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(197,160,101,0.15)] hover:border-historical-gold/30 hover:-translate-y-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link href={productUrl} className="block relative aspect-[4/5] bg-[#FDFBF7] overflow-hidden">
        {/* Soft decorative background circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-historical-gold/5 rounded-full blur-2xl group-hover:bg-historical-gold/10 transition-colors duration-500" />

        {!imageError && image ? (
          <Image
            src={image}
            alt={sanitizedName}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 mix-blend-multiply"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <span className="text-5xl drop-shadow-sm">🧺</span>
          </div>
        )}

        {/* Discount Badge - Elegant Pill */}
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-historical-red text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-historical-red/10 z-10 tracking-widest uppercase">
            {t.product.sale} {discountPercentage}%
          </div>
        )}

        {/* Like Button (Heart) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 shadow-sm ${isLiked
            ? 'bg-red-50 text-red-500 scale-110'
            : 'bg-white/80 text-stone-400 hover:text-red-400 hover:scale-105'
            }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button - Glassy Slide-up */}
        <div className={`absolute inset-x-4 bottom-4 z-10 transition-all duration-300 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              className="w-full bg-white/90 backdrop-blur-md text-historical-blue py-3 rounded-2xl shadow-lg border border-white/50 text-xs font-bold hover:bg-historical-blue hover:text-white transition-all active:scale-95"
            >
              {t.product.quickView}
            </button>
          )}
        </div>

        {/* Unavailable Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-stone-800 text-white px-5 py-2 rounded-xl font-bold text-xs tracking-wider shadow-lg">
              {t.product.soldOut}
            </span>
          </div>
        )}
      </Link>

      {/* Product Details - Clean & Minimal */}
      <div className="p-5 text-center">
        {vendorName && (
          <p className="text-[10px] font-bold text-historical-gold/80 uppercase tracking-[0.15em] mb-2">{vendorName}</p>
        )}

        <Link href={productUrl}>
          <h3 className="text-base font-bold text-stone-700 mb-2 line-clamp-2 leading-relaxed group-hover:text-historical-gold transition-colors font-display">
            {sanitizedName}
          </h3>
        </Link>

        {/* Rating - Minimal Dots */}
        {(rating > 0 || reviewCount > 0) && (
          <div className="flex items-center justify-center gap-1 mb-3 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex text-historical-gold text-xs gap-0.5">
              {'★'.repeat(Math.ceil(rating || 5))}
            </div>
            <span className="text-[10px] text-stone-400">({reviewCount})</span>
          </div>
        )}

        {/* Price Section - Vertical Stack for elegance */}
        <div className="flex flex-col items-center gap-1 mb-4">
          <span className="text-xl font-display font-bold text-historical-blue">
            {formatPrice(finalPrice)} <span className="text-xs font-sans font-normal text-stone-400">{t.common.currency}</span>
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone-300 line-through decoration-historical-red/30">
              {formatPrice(basePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart - Minimal Icon Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="w-full bg-[#FAF9F6] text-stone-600 py-3 rounded-2xl font-bold text-sm border border-stone-100 hover:bg-historical-gold hover:text-white hover:border-historical-gold hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span>{t.product.addToCart}</span>
          <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
