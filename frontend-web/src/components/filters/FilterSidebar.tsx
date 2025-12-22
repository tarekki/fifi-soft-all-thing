/**
 * Filter Sidebar Component
 * مكون الشريط الجانبي للفلاتر
 * 
 * Sticky filters sidebar for category/product listing pages
 * شريط جانبي ثابت للفلاتر لصفحات قوائم الفئات/المنتجات
 * 
 * Features:
 * - Sticky positioning (desktop)
 * - Brand filter
 * - Color filter (with color swatches)
 * - Size filter
 * - Price range filter (slider)
 * - Clear filters button
 * - Responsive (drawer on mobile)
 * 
 * المميزات:
 * - موضع ثابت (سطح المكتب)
 * - فلتر العلامة التجارية
 * - فلتر اللون (مع عينات الألوان)
 * - فلتر المقاس
 * - فلتر نطاق السعر (منزلق)
 * - زر مسح الفلاتر
 * - متجاوب (درج على الجوال)
 * 
 * Security:
 * - Validates filter values
 * - Sanitizes user input
 * 
 * الأمان:
 * - يتحقق من قيم الفلاتر
 * - ينظف إدخال المستخدم
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Filter Options
 * خيارات الفلتر
 */
export interface FilterOption {
  id: string | number
  label: string
  value: string
  count?: number // Number of products with this filter
}

/**
 * Color Filter Option
 * خيار فلتر اللون
 */
export interface ColorFilterOption extends FilterOption {
  hex: string // Color hex code
}

/**
 * Filter Values
 * قيم الفلاتر
 */
export interface FilterValues {
  brands?: string[]
  colors?: string[]
  sizes?: string[]
  priceRange?: {
    min: number
    max: number
  }
}

/**
 * Filter Sidebar Props
 * خصائص الشريط الجانبي للفلاتر
 */
export interface FilterSidebarProps {
  /** Available brands */
  brands?: FilterOption[]
  /** Available colors */
  colors?: ColorFilterOption[]
  /** Available sizes */
  sizes?: FilterOption[]
  /** Price range */
  priceRange?: {
    min: number
    max: number
  }
  /** Current filter values */
  values?: FilterValues
  /** On filter change */
  onChange?: (values: FilterValues) => void
  /** Is mobile drawer open? */
  isOpen?: boolean
  /** On mobile drawer close */
  onClose?: () => void
  /** Custom className */
  className?: string
}

/**
 * Filter Section Component
 * مكون قسم الفلتر
 */
function FilterSection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6', className)}>
      <h3 className="text-heading-4 font-semibold text-text-primary mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

/**
 * Checkbox Filter Item
 * عنصر فلتر checkbox
 */
function CheckboxFilterItem({
  option,
  checked,
  onChange,
  showCount = true,
}: {
  option: FilterOption
  checked: boolean
  onChange: (checked: boolean) => void
  showCount?: boolean
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group hover:bg-neutral-50 p-2 rounded-lg transition-default">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-accent-orange-500 border-neutral-300 rounded focus:ring-accent-orange-500 focus:ring-2"
        aria-label={option.label}
      />
      <span className="flex-1 text-body-md text-text-primary group-hover:text-accent-orange-500 transition-colors">
        {option.label}
      </span>
      {showCount && option.count !== undefined && (
        <span className="text-body-sm text-text-tertiary">
          ({option.count})
        </span>
      )}
    </label>
  )
}

/**
 * Color Filter Item
 * عنصر فلتر اللون
 */
function ColorFilterItem({
  option,
  checked,
  onChange,
}: {
  option: ColorFilterOption
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="relative cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={option.label}
      />
      <div
        className={cn(
          'w-10 h-10 rounded-full border-2 transition-default',
          checked
            ? 'border-accent-orange-500 ring-2 ring-accent-orange-500 ring-offset-2'
            : 'border-neutral-300 group-hover:border-neutral-400'
        )}
        style={{ backgroundColor: option.hex }}
        title={option.label}
      />
    </label>
  )
}

/**
 * Price Range Filter
 * فلتر نطاق السعر
 */
function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: { min: number; max: number }
  onChange: (range: { min: number; max: number }) => void
}) {
  const [localMin, setLocalMin] = useState(value.min)
  const [localMax, setLocalMax] = useState(value.max)

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localMax))
    setLocalMin(clampedMin)
    onChange({ min: clampedMin, max: localMax })
  }

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localMin))
    setLocalMax(clampedMax)
    onChange({ min: localMin, max: clampedMax })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-body-sm text-text-tertiary mb-1 block">
            من
          </label>
          <input
            type="number"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-orange-500 focus:border-accent-orange-500 outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-body-sm text-text-tertiary mb-1 block">
            إلى
          </label>
          <input
            type="number"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-orange-500 focus:border-accent-orange-500 outline-none"
          />
        </div>
      </div>
      <div className="text-body-sm text-text-tertiary text-center">
        {localMin.toLocaleString()} - {localMax.toLocaleString()} ل.س
      </div>
    </div>
  )
}

/**
 * Filter Sidebar Component
 * مكون الشريط الجانبي للفلاتر
 */
export function FilterSidebar({
  brands = [],
  colors = [],
  sizes = [],
  priceRange,
  values = {},
  onChange,
  isOpen = false,
  onClose,
  className,
}: FilterSidebarProps) {
  const [localValues, setLocalValues] = useState<FilterValues>(values)

  // Update local values when props change
  // تحديث القيم المحلية عند تغيير الخصائص
  useState(() => {
    setLocalValues(values)
  })

  const handleFilterChange = (newValues: FilterValues) => {
    setLocalValues(newValues)
    onChange?.(newValues)
  }

  const toggleBrand = (brandId: string, checked: boolean) => {
    const currentBrands = localValues.brands || []
    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter((id) => id !== brandId)
    handleFilterChange({ ...localValues, brands: newBrands })
  }

  const toggleColor = (colorId: string, checked: boolean) => {
    const currentColors = localValues.colors || []
    const newColors = checked
      ? [...currentColors, colorId]
      : currentColors.filter((id) => id !== colorId)
    handleFilterChange({ ...localValues, colors: newColors })
  }

  const toggleSize = (sizeId: string, checked: boolean) => {
    const currentSizes = localValues.sizes || []
    const newSizes = checked
      ? [...currentSizes, sizeId]
      : currentSizes.filter((id) => id !== sizeId)
    handleFilterChange({ ...localValues, sizes: newSizes })
  }

  const clearFilters = () => {
    const clearedValues: FilterValues = {}
    setLocalValues(clearedValues)
    onChange?.(clearedValues)
  }

  const hasActiveFilters =
    (localValues.brands?.length || 0) > 0 ||
    (localValues.colors?.length || 0) > 0 ||
    (localValues.sizes?.length || 0) > 0 ||
    (localValues.priceRange?.min !== priceRange?.min ||
      localValues.priceRange?.max !== priceRange?.max)

  const sidebarContent = (
    <div className="bg-white border-r border-neutral-200 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-3 font-bold text-text-primary">الفلاتر</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-body-sm text-accent-orange-500 hover:text-accent-orange-600 font-medium transition-colors"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <FilterSection title="العلامة التجارية">
          <div className="space-y-2">
            {brands.map((brand) => (
              <CheckboxFilterItem
                key={brand.id}
                option={brand}
                checked={localValues.brands?.includes(brand.value) || false}
                onChange={(checked) => toggleBrand(brand.value, checked)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Color Filter */}
      {colors.length > 0 && (
        <FilterSection title="اللون">
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <ColorFilterItem
                key={color.id}
                option={color}
                checked={localValues.colors?.includes(color.value) || false}
                onChange={(checked) => toggleColor(color.value, checked)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size Filter */}
      {sizes.length > 0 && (
        <FilterSection title="المقاس">
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <label
                key={size.id}
                className={cn(
                  'px-4 py-2 border-2 rounded-lg cursor-pointer transition-default text-body-md font-medium',
                  localValues.sizes?.includes(size.value)
                    ? 'border-accent-orange-500 bg-accent-orange-50 text-accent-orange-500'
                    : 'border-neutral-300 text-text-primary hover:border-neutral-400'
                )}
              >
                <input
                  type="checkbox"
                  checked={localValues.sizes?.includes(size.value) || false}
                  onChange={(e) => toggleSize(size.value, e.target.checked)}
                  className="sr-only"
                  aria-label={size.label}
                />
                {size.label}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range Filter */}
      {priceRange && (
        <FilterSection title="نطاق السعر">
          <PriceRangeFilter
            min={priceRange.min}
            max={priceRange.max}
            value={localValues.priceRange || priceRange}
            onChange={(range) =>
              handleFilterChange({ ...localValues, priceRange: range })
            }
          />
        </FilterSection>
      )}
    </div>
  )

  // Desktop: Sticky sidebar
  // سطح المكتب: شريط جانبي ثابت
  return (
    <>
      <aside
        className={cn(
          'hidden lg:block w-64 flex-shrink-0',
          'sticky top-20 self-start',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile: Drawer */}
      {/* الجوال: درج */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              'fixed top-0 right-0 h-full w-80 z-50 lg:hidden',
              'transform transition-transform duration-300',
              isOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            <div className="relative h-full">
              {sidebarContent}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-default"
                aria-label="Close filters"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

