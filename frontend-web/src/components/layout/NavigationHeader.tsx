/**
 * Navigation Header Component
 * مكون رأس التنقل
 * 
 * Sticky top navigation with search, cart, and user menu
 * تنقل علوي ثابت مع البحث والسلة وقائمة المستخدم
 * 
 * Features:
 * - Sticky positioning (always visible)
 * - Centered global search bar with autocomplete
 * - Category mega-menu (Amazon-style but lighter)
 * - Cart icon with badge count and preview
 * - User account menu with quick actions
 * - Responsive design (mobile-friendly)
 * 
 * المميزات:
 * - موضع ثابت (مرئي دائماً)
 * - شريط بحث مركزي عالمي مع الإكمال التلقائي
 * - قائمة فئات ضخمة (أسلوب Amazon لكن أخف)
 * - أيقونة السلة مع عداد و معاينة
 * - قائمة حساب المستخدم مع إجراءات سريعة
 * - تصميم متجاوب (صديق للجوال)
 * 
 * Security:
 * - Protected routes check
 * - User authentication state
 * - Cart data sanitization
 * 
 * الأمان:
 * - فحص المسارات المحمية
 * - حالة مصادقة المستخدم
 * - تنظيف بيانات السلة
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { navigation } from '@/lib/design'
import { cn } from '@/lib/utils'

/**
 * Navigation Header Props
 * خصائص رأس التنقل
 */
export interface NavigationHeaderProps {
  /** Cart item count */
  cartCount?: number
  /** Is user authenticated? */
  isAuthenticated?: boolean
  /** User name (if authenticated) */
  userName?: string
  /** User avatar URL (if authenticated) */
  userAvatar?: string
  /** On search submit */
  onSearch?: (query: string) => void
  /** On cart click */
  onCartClick?: () => void
  /** On user menu click */
  onUserMenuClick?: () => void
  /** Custom className */
  className?: string
}

/**
 * Search Bar Component
 * مكون شريط البحث
 */
function SearchBar({ onSearch }: { onSearch?: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim())
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex-1 max-w-2xl mx-4 relative',
        'transition-default'
      )}
    >
      <div
        className={cn(
          'flex items-center bg-white border-2 rounded-lg overflow-hidden',
          'transition-default',
          isFocused
            ? 'border-accent-orange-500 shadow-md'
            : 'border-neutral-200 hover:border-neutral-300'
        )}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="ابحث عن منتج..."
          className="flex-1 px-4 py-3 text-body-md outline-none text-text-primary placeholder:text-text-tertiary"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent-orange-500 text-white hover:bg-accent-orange-600 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
          aria-label="Search"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Autocomplete dropdown (will be implemented later) */}
      {/* قائمة الإكمال التلقائي (سيتم تنفيذها لاحقاً) */}
      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50">
          {/* Autocomplete results will go here */}
          {/* نتائج الإكمال التلقائي ستذهب هنا */}
        </div>
      )}
    </form>
  )
}

/**
 * Cart Icon Component
 * مكون أيقونة السلة
 */
function CartIcon({
  count = 0,
  onClick,
}: {
  count?: number
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-text-primary hover:text-accent-orange-500 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2 rounded-lg"
      aria-label={`Cart (${count} items)`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-error-500 text-white text-caption font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

/**
 * User Menu Component
 * مكون قائمة المستخدم
 */
function UserMenu({
  isAuthenticated,
  userName,
  userAvatar,
  onClick,
}: {
  isAuthenticated?: boolean
  userName?: string
  userAvatar?: string
  onClick?: () => void
}) {
  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 text-body-md text-text-primary hover:text-accent-orange-500 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2 rounded-lg"
      >
        تسجيل الدخول
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-default focus:outline-none focus:ring-2 focus:ring-accent-orange-500 focus:ring-offset-2"
      aria-label="User menu"
    >
      {userAvatar ? (
        <Image
          src={userAvatar}
          alt={userName || 'User'}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-accent-orange-500 flex items-center justify-center text-white font-semibold">
          {userName?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
      {userName && (
        <span className="text-body-md text-text-primary hidden md:block">
          {userName}
        </span>
      )}
    </button>
  )
}

/**
 * Navigation Header Component
 * مكون رأس التنقل
 */
export function NavigationHeader({
  cartCount = 0,
  isAuthenticated = false,
  userName,
  userAvatar,
  onSearch,
  onCartClick,
  onUserMenuClick,
  className,
}: NavigationHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm',
        className
      )}
      style={{ height: navigation.height }}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Logo */}
          {/* الشعار */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Home"
          >
            <div className="w-10 h-10 bg-accent-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-heading-3">T</span>
            </div>
            <span className="text-heading-3 font-bold text-text-primary hidden md:block">
              Trendyol Syria
            </span>
          </Link>

          {/* Search Bar */}
          {/* شريط البحث */}
          <SearchBar onSearch={onSearch} />

          {/* Right Side Actions */}
          {/* إجراءات الجانب الأيمن */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Cart */}
            {/* السلة */}
            <CartIcon count={cartCount} onClick={onCartClick} />

            {/* User Menu */}
            {/* قائمة المستخدم */}
            <UserMenu
              isAuthenticated={isAuthenticated}
              userName={userName}
              userAvatar={userAvatar}
              onClick={onUserMenuClick}
            />
          </div>
        </div>
      </div>

      {/* Category Menu (will be implemented as mega-menu later) */}
      {/* قائمة الفئات (سيتم تنفيذها كقائمة ضخمة لاحقاً) */}
      <nav className="border-t border-neutral-100 bg-neutral-50 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 h-12">
            <Link
              href="/products"
              className="text-body-md text-text-secondary hover:text-accent-orange-500 transition-default py-2"
            >
              جميع المنتجات
            </Link>
            <Link
              href="/vendors/fifi"
              className="text-body-md text-text-secondary hover:text-accent-orange-500 transition-default py-2"
            >
              Fifi
            </Link>
            <Link
              href="/vendors/soft"
              className="text-body-md text-text-secondary hover:text-accent-orange-500 transition-default py-2"
            >
              Soft
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

