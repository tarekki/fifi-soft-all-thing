'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { BrandsFlow } from '@/components/home/BrandsFlow';
import { ProductFlipGrid } from '@/components/home/ProductFlipGrid';
import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { SearchHeader } from '@/components/home/SearchHeader';
import { DiscountSlider } from '@/components/home/DiscountSlider';
import { TrustStrip } from '@/components/home/TrustStrip';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search Header - Sticky & Smart */}
      <SearchHeader />

      {/* Hero Section - The Grand Entrance */}
      <div className="mt-4">
        <HeroSection />
      </div>

      {/* Categories Grid - Quick Navigation */}
      <CategoriesGrid />

      {/* Brands Flow - The "Flipping" Experience */}
      <div className="relative z-20 py-4">
        <BrandsFlow />
      </div>

      {/* New Arrivals Flip Grid */}
      <ProductFlipGrid title={t.home.newArrivals} />

      {/* Discount Slider - Dynamic Offers */}
      <DiscountSlider />

      {/* Best Sellers Flip Grid */}
      <ProductFlipGrid title={t.home.bestSellers} />

      {/* Trust Features Strip */}
      <TrustStrip />
    </div>
  )
}
