/**
 * useCart Hook
 * Hook للسلة
 * 
 * Custom hook for shopping cart management
 * Hook مخصص لإدارة سلة التسوق
 * 
 * Features:
 * - Add items to cart
 * - Remove items from cart
 * - Update item quantities
 * - Calculate totals
 * - Clear cart
 * 
 * المميزات:
 * - إضافة عناصر للسلة
 * - إزالة عناصر من السلة
 * - تحديث كميات العناصر
 * - حساب الإجماليات
 * - مسح السلة
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import type { ProductVariant } from '@/types/product'

interface CartItem {
  variant: ProductVariant
  quantity: number
}

interface UseCartReturn {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: number) => void
  updateQuantity: (variantId: number, quantity: number) => void
  clearCart: () => void
  getItem: (variantId: number) => CartItem | undefined
}

/**
 * useCart Hook
 * 
 * @returns Cart state and operations
 */
export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])

  /**
   * Add item to cart
   * إضافة عنصر للسلة
   */
  const addItem = useCallback((variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.variant.id === variant.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        // تحديث الكمية إذا كان العنصر موجوداً
        return prev.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        // إضافة عنصر جديد
        return [...prev, { variant, quantity }]
      }
    })
  }, [])

  /**
   * Remove item from cart
   * إزالة عنصر من السلة
   */
  const removeItem = useCallback((variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variant.id !== variantId))
  }, [])

  /**
   * Update item quantity
   * تحديث كمية عنصر
   */
  const updateQuantity = useCallback((variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  /**
   * Clear cart
   * مسح السلة
   */
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  /**
   * Get item by variant ID
   * الحصول على عنصر بمعرف المتغير
   */
  const getItem = useCallback(
    (variantId: number) => items.find((item) => item.variant.id === variantId),
    [items]
  )

  /**
   * Calculate total item count
   * حساب إجمالي عدد العناصر
   */
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  /**
   * Calculate total price
   * حساب السعر الإجمالي
   */
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + parseFloat(item.variant.price) * item.quantity,
        0
      ),
    [items]
  )

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
  }
}

