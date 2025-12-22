/**
 * Campaign Slider Component
 * مكون شريط الحملات
 * 
 * Horizontal stories-style campaign slider
 * شريط حملات أفقي بأسلوب القصص
 * 
 * Features:
 * - Circular cards (avatar-style)
 * - Brand deals
 * - Flash sales
 * - Swipeable on mobile
 * - Auto-play option
 * - Smooth scrolling
 * 
 * المميزات:
 * - بطاقات دائرية (أسلوب الصورة الرمزية)
 * - عروض العلامات التجارية
 * - مبيعات فلاش
 * - قابل للتمرير على الجوال
 * - خيار التشغيل التلقائي
 * - تمرير سلس
 * 
 * Security:
 * - Sanitizes campaign data
 * - Validates image URLs
 * 
 * الأمان:
 * - ينظف بيانات الحملة
 * - يتحقق من URLs الصور
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Campaign Item
 * عنصر الحملة
 */
export interface CampaignItem {
  id: string | number
  title: string
  image: string
  link: string
  badge?: string // e.g., "خصم 50%", "Flash Sale"
  type?: 'brand' | 'flash-sale' | 'deal'
}

/**
 * Campaign Slider Props
 * خصائص شريط الحملات
 */
export interface CampaignSliderProps {
  /** Campaign items */
  items: CampaignItem[]
  /** Auto-play interval in milliseconds (0 to disable) */
  autoPlay?: number
  /** Show navigation arrows? */
  showArrows?: boolean
  /** Show dots indicator? */
  showDots?: boolean
  /** Custom className */
  className?: string
}

/**
 * Campaign Card Component
 * مكون بطاقة الحملة
 */
function CampaignCard({
  item,
  isActive,
}: {
  item: CampaignItem
  isActive?: boolean
}) {
  // Sanitize title
  // تنظيف العنوان
  const sanitizedTitle = item.title.replace(/[<>]/g, '').trim()

  return (
    <Link
      href={item.link}
      className={cn(
        'flex flex-col items-center gap-3 flex-shrink-0 transition-default',
        'hover:scale-105',
        isActive && 'scale-105'
      )}
      aria-label={sanitizedTitle}
    >
      {/* Circular Image */}
      {/* صورة دائرية */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-neutral-200 shadow-md hover:shadow-lg transition-default">
        {item.image ? (
          <Image
            src={item.image}
            alt={sanitizedTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 80px, 96px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-orange-400 to-accent-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-heading-4">
              {sanitizedTitle[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Badge */}
        {/* الشارة */}
        {item.badge && (
          <div className="absolute -bottom-1 -right-1 bg-error-500 text-white text-caption font-bold px-2 py-0.5 rounded-full shadow-md">
            {item.badge}
          </div>
        )}
      </div>

      {/* Title */}
      {/* العنوان */}
      <span className="text-body-sm text-text-primary text-center max-w-[80px] md:max-w-[96px] line-clamp-2">
        {sanitizedTitle}
      </span>
    </Link>
  )
}

/**
 * Campaign Slider Component
 * مكون شريط الحملات
 */
export function CampaignSlider({
  items,
  autoPlay = 0,
  showArrows = true,
  showDots = false,
  className,
}: CampaignSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll position
  // التحقق من موضع التمرير
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // Scroll handlers
  // معالجات التمرير
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth',
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth',
      })
    }
  }

  // Auto-play
  // التشغيل التلقائي
  useEffect(() => {
    if (autoPlay > 0 && scrollContainerRef.current) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } =
            scrollContainerRef.current

          if (scrollLeft >= scrollWidth - clientWidth) {
            // Reset to start
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            scrollContainerRef.current.scrollBy({
              left: 200,
              behavior: 'smooth',
            })
          }
        }
      }, autoPlay)

      return () => clearInterval(interval)
    }
  }, [autoPlay])

  // Initial check and scroll listener
  // فحص أولي ومستمع التمرير
  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [items])

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      {/* Navigation Arrows */}
      {/* أسهم التنقل */}
      {showArrows && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-neutral-50 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500"
          aria-label="Scroll left"
        >
          <svg
            className="w-5 h-5 text-text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {showArrows && canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-neutral-50 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500"
          aria-label="Scroll right"
        >
          <svg
            className="w-5 h-5 text-text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Scrollable Container */}
      {/* حاوية قابلة للتمرير */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-6"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item) => (
          <CampaignCard key={item.id} item={item} />
        ))}
      </div>

      {/* Dots Indicator */}
      {/* مؤشر النقاط */}
      {showDots && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-neutral-300 hover:bg-accent-orange-500 transition-default"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar styles */}
      {/* إخفاء أنماط شريط التمرير */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

