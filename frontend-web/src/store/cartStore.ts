/**
 * Cart Store (Zustand)
 * متجر السلة (Zustand)
 * 
 * Global state management for shopping cart
 * إدارة الحالة العامة لسلة التسوق
 * 
 * Features:
 * - Cart items
 * - Item quantities
 * - Total calculations
 * - Add/remove/update operations
 * 
 * المميزات:
 * - عناصر السلة
 * - كميات العناصر
 * - حسابات الإجمالي
 * - عمليات الإضافة/الإزالة/التحديث
 * 
 * Persistence:
 * - Cart can be persisted to localStorage (optional)
 * - Syncs with server on checkout
 * 
 * الاستمرارية:
 * - يمكن حفظ السلة في localStorage (اختياري)
 * - يتزامن مع الخادم عند الدفع
 */

import { create } from 'zustand'
// Note: persist middleware is available in zustand v4+
// ملاحظة: middleware persist متاح في zustand v4+
// If persist is not available, remove it and use regular create
// إذا لم يكن persist متاحاً، أزله واستخدم create العادي
import type { ProductVariant } from '@/types/product'

interface CartItem {
  variant: ProductVariant
  quantity: number
}

interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: number) => void
  updateQuantity: (variantId: number, quantity: number) => void
  clearCart: () => void
  getItem: (variantId: number) => CartItem | undefined
  getItemCount: () => number
  getTotal: () => number
}

type CartStore = CartState & CartActions

/**
 * Cart Store
 * متجر السلة
 * 
 * Global state for shopping cart
 * الحالة العامة لسلة التسوق
 */
// Using persist middleware for localStorage persistence
// استخدام middleware persist للاستمرارية في localStorage
// If persist is not available, use: create<CartStore>((set, get) => ({
// إذا لم يكن persist متاحاً، استخدم: create<CartStore>((set, get) => ({
export const useCartStore = create<CartStore>((set, get) => ({
      // State
      // الحالة
      items: [],

      // Actions
      // الإجراءات
      addItem: (variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.variant.id === variant.id
          )

          if (existingItem) {
            // Update quantity if item already exists
            // تحديث الكمية إذا كان العنصر موجوداً
            return {
              items: state.items.map((item) =>
                item.variant.id === variant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          } else {
            // Add new item
            // إضافة عنصر جديد
            return {
              items: [...state.items, { variant, quantity }],
            }
          }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant.id !== variantId),
        }))
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.variant.id === variantId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItem: (variantId) => {
        return get().items.find((item) => item.variant.id === variantId)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) =>           sum + parseFloat(item.variant.price) * item.quantity,
          0
        )
      },
    })
)

// TODO: Add localStorage persistence if needed
// سيتم إضافة الاستمرارية في localStorage إذا لزم الأمر
// Can use zustand/middleware/persist or manual localStorage sync
// يمكن استخدام zustand/middleware/persist أو مزامنة localStorage يدوياً

