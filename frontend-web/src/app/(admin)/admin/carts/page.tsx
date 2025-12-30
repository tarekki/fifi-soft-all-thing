'use client'

/**
 * Admin Carts Management Page
 * صفحة إدارة السلل
 * 
 * Features / الميزات:
 * - Carts list with filters (connected to API)
 * - Cart details modal with full item management
 * - Add/Update/Remove items from any user's cart
 * - Clear cart functionality
 * - Delete cart functionality
 * - Real-time statistics
 * 
 * @author Yalla Buy Team
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarts } from '@/lib/admin'
import type {
  Cart,
  CartDetail,
  CartItem,
  CartFilters,
  CartItemAddPayload,
  CartItemUpdatePayload,
} from '@/lib/admin/types/carts'
import { useLanguage } from '@/lib/i18n/context'


// =============================================================================
// Icons
// الأيقونات
// =============================================================================

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  shoppingCart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a4.5 4.5 0 01-4.884-4.248l1.209-4.54m0 0A4.5 4.5 0 015.378 3h12.75a4.5 4.5 0 013.244 1.438l-4.5 16.5m-2.25-16.5H5.25m0 0h3.75m-3.75 0a3 3 0 00-3 3v1.5m0 0V18a3 3 0 003 3h12.75m-9.75-3h9.75m-9.75 0a3 3 0 01-3-3m3 3v-9.75m0 0H5.25m0 0h3.75m-3.75 0a3 3 0 00-3 3v9.75" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  guest: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  minus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  loader: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  clear: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  delete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
}


// =============================================================================
// Animation Variants
// متغيرات الحركة
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}


// =============================================================================
// Helper Functions
// الدوال المساعدة
// =============================================================================

/**
 * Format currency
 * تنسيق العملة
 */
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ar-SY', {
    style: 'decimal',
    minimumFractionDigits: 2,
  }).format(num) + ' ل.س'
}

/**
 * Format date
 * تنسيق التاريخ
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// =============================================================================
// Delete Confirmation Modal
// مودال تأكيد الحذف
// =============================================================================

interface DeleteCartModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

function DeleteCartModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteCartModalProps) {
  const { t } = useLanguage()
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-historical-charcoal dark:text-gray-100 mb-4 transition-colors duration-300">
            {t.admin.carts.confirmDelete}
          </h2>
          <p className="text-historical-charcoal/70 dark:text-gray-300 mb-6 transition-colors duration-300">
            {t.admin.carts.confirmDeleteMessage}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? Icons.loader : Icons.trash}
              {t.admin.carts.delete}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal dark:text-gray-200 font-medium hover:bg-historical-gold/5 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {t.admin.carts.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// =============================================================================
// Cart Detail Modal
// مودال تفاصيل السلة
// =============================================================================

interface CartDetailModalProps {
  cart: CartDetail | null
  isOpen: boolean
  isLoading: boolean
  isAddingItem: boolean
  isUpdatingItem: boolean
  isRemovingItem: boolean
  isClearingCart: boolean
  onClose: () => void
  onAddItem: (data: CartItemAddPayload) => Promise<boolean>
  onUpdateItem: (itemId: number, data: CartItemUpdatePayload) => Promise<boolean>
  onRemoveItem: (itemId: number) => Promise<boolean>
  onClearCart: () => Promise<boolean>
}

function CartDetailModal({
  cart,
  isOpen,
  isLoading,
  isAddingItem,
  isUpdatingItem,
  isRemovingItem,
  isClearingCart,
  onClose,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
}: CartDetailModalProps) {
  const { t } = useLanguage()
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState(1)

  const handleAddItem = async () => {
    if (!variantId || !cart) return
    const success = await onAddItem({
      variant_id: parseInt(variantId),
      quantity,
    })
    if (success) {
      setVariantId('')
      setQuantity(1)
    }
  }

  const handleUpdateItem = async (itemId: number) => {
    if (!cart) return
    const success = await onUpdateItem(itemId, { quantity: editQuantity })
    if (success) {
      setEditingItemId(null)
    }
  }

  const handleStartEdit = (item: CartItem) => {
    setEditingItemId(item.id)
    setEditQuantity(item.quantity)
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditQuantity(1)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100">
                  {t.admin.carts.cartDetails}
                </h2>
                {cart && (
                  <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mt-1">
                    {cart.is_guest_cart ? t.admin.carts.guestCart : t.admin.carts.userCart} • {cart.item_count} {t.admin.carts.items}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {Icons.close}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  {Icons.loader}
                  <span className="mr-2">{t.admin.carts.loading}</span>
                </div>
              ) : !cart ? (
                <div className="text-center py-12 text-historical-charcoal/50">
                  {t.admin.carts.cartNotFound}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Info */}
                  <div className="bg-historical-stone/30 dark:bg-gray-700/30 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-1">
                          {t.admin.carts.owner}
                        </p>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200">
                          {cart.is_guest_cart
                            ? `${t.admin.carts.guest} (${cart.session_key?.substring(0, 8)}...)`
                            : cart.user_email || t.admin.carts.unknownUser}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-1">
                          {t.admin.carts.subtotal}
                        </p>
                        <p className="font-bold text-lg text-historical-charcoal dark:text-gray-200">
                          {formatCurrency(cart.subtotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-1">
                          {t.admin.carts.itemsCount}
                        </p>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200">
                          {cart.item_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 mb-1">
                          {t.admin.carts.lastUpdated}
                        </p>
                        <p className="font-medium text-historical-charcoal dark:text-gray-200">
                          {formatDate(cart.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Item Form */}
                  <div className="bg-historical-gold/5 dark:bg-yellow-900/10 rounded-xl p-4 border border-historical-gold/20">
                    <h3 className="font-semibold text-historical-charcoal dark:text-gray-200 mb-3">
                      {t.admin.carts.addItem}
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={variantId}
                        onChange={(e) => setVariantId(e.target.value)}
                        placeholder={t.admin.carts.variantIdPlaceholder}
                        className="flex-1 px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      />
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder={t.admin.carts.quantity}
                        className="w-24 px-4 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-700 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                      />
                      <button
                        onClick={handleAddItem}
                        disabled={!variantId || isAddingItem}
                        className="px-4 py-2 rounded-lg bg-historical-gold text-white hover:bg-historical-gold/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {isAddingItem ? Icons.loader : Icons.plus}
                        {t.admin.carts.add}
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-historical-charcoal dark:text-gray-200">
                        {t.admin.carts.items} ({cart.items.length})
                      </h3>
                      {cart.items.length > 0 && (
                        <button
                          onClick={onClearCart}
                          disabled={isClearingCart}
                          className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm"
                        >
                          {isClearingCart ? Icons.loader : Icons.clear}
                          {t.admin.carts.clearCart}
                        </button>
                      )}
                    </div>
                    {cart.items.length === 0 ? (
                      <div className="text-center py-12 text-historical-charcoal/50 dark:text-gray-400 bg-historical-stone/30 dark:bg-gray-700/30 rounded-xl">
                        {t.admin.carts.noItems}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                          >
                            {editingItemId === item.id ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-historical-charcoal dark:text-gray-200">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-historical-charcoal/50 dark:text-gray-400">
                                    {item.variant.sku} • {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <input
                                  type="number"
                                  min="1"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                                  className="w-20 px-3 py-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 bg-white dark:bg-gray-800 text-historical-charcoal dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-historical-gold/30"
                                />
                                <button
                                  onClick={() => handleUpdateItem(item.id)}
                                  disabled={isUpdatingItem}
                                  className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                >
                                  {t.admin.carts.save}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                >
                                  {t.admin.carts.cancel}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-historical-charcoal dark:text-gray-200">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-historical-charcoal/50 dark:text-gray-400">
                                    {item.variant.sku} • {t.admin.carts.quantity}: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                  <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 mt-1">
                                    {t.admin.carts.subtotal}: {formatCurrency(item.subtotal)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    title={t.admin.carts.edit}
                                  >
                                    {Icons.edit}
                                  </button>
                                  <button
                                    onClick={() => onRemoveItem(item.id)}
                                    disabled={isRemovingItem}
                                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    title={t.admin.carts.remove}
                                  >
                                    {isRemovingItem ? Icons.loader : Icons.trash}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-historical-stone/30 dark:bg-gray-700/30">
                <div>
                  <p className="text-sm text-historical-charcoal/50 dark:text-gray-400">
                    {t.admin.carts.total}
                  </p>
                  <p className="text-2xl font-bold text-historical-charcoal dark:text-gray-100">
                    {formatCurrency(cart.subtotal)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-historical-gold text-white hover:bg-historical-gold/90 transition-colors"
                >
                  {t.admin.carts.close}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


// =============================================================================
// Main Component
// المكون الرئيسي
// =============================================================================

export default function CartsPage() {
  const { t, language } = useLanguage()
  const {
    carts,
    selectedCart,
    stats,
    total,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingDetails,
    isAddingItem,
    isUpdatingItem,
    isRemovingItem,
    isClearingCart,
    isDeletingCart,
    error,
    filters,
    fetchCarts,
    fetchCartDetails,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    deleteCartById,
    setFilters,
    clearSelectedCart,
    refresh,
  } = useCarts()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterGuest, setFilterGuest] = useState<boolean | ''>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [cartToDelete, setCartToDelete] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const newFilters: CartFilters = { ...filters, search: searchQuery, page: 1 }
      if (filterGuest !== '') {
        newFilters.is_guest = filterGuest === true
      } else {
        delete newFilters.is_guest
      }
      setFilters(newFilters)
      fetchCarts(newFilters)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, filterGuest]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewCart = useCallback((cart: Cart) => {
    setIsModalOpen(true)
    fetchCartDetails(cart.id)
  }, [fetchCartDetails])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    clearSelectedCart()
  }, [clearSelectedCart])

  const handleAddItem = useCallback(async (data: CartItemAddPayload) => {
    if (!selectedCart) return false
    const success = await addItem(selectedCart.id, data)
    if (success) {
      await fetchCartDetails(selectedCart.id)
    }
    return success
  }, [selectedCart, addItem, fetchCartDetails])

  const handleUpdateItem = useCallback(async (itemId: number, data: CartItemUpdatePayload) => {
    if (!selectedCart) return false
    const success = await updateItem(selectedCart.id, itemId, data)
    if (success) {
      await fetchCartDetails(selectedCart.id)
    }
    return success
  }, [selectedCart, updateItem, fetchCartDetails])

  const handleRemoveItem = useCallback(async (itemId: number) => {
    if (!selectedCart) return false
    const success = await removeItem(selectedCart.id, itemId)
    if (success) {
      await fetchCartDetails(selectedCart.id)
    }
    return success
  }, [selectedCart, removeItem, fetchCartDetails])

  const handleClearCart = useCallback(async () => {
    if (!selectedCart) return false
    const success = await clearCartItems(selectedCart.id)
    if (success) {
      await fetchCartDetails(selectedCart.id)
    }
    return success
  }, [selectedCart, clearCartItems, fetchCartDetails])

  const handleDeleteCart = useCallback((cartId: number) => {
    setCartToDelete(cartId)
    setIsDeleteModalOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (cartToDelete) {
      await deleteCartById(cartToDelete)
      refresh()
      setIsDeleteModalOpen(false)
      setCartToDelete(null)
    }
  }, [cartToDelete, deleteCartById, refresh])

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false)
    setCartToDelete(null)
  }, [])

  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    fetchCarts(newFilters)
  }, [currentPage, filters, setFilters, fetchCarts])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-historical-charcoal dark:text-gray-100 transition-colors duration-300">
            {t.admin.carts.title}
          </h1>
          <p className="text-historical-charcoal/50 dark:text-gray-400 mt-1 transition-colors duration-300">
            {t.admin.carts.subtitle}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-historical-gold/10 text-historical-gold hover:bg-historical-gold/20 transition-colors disabled:opacity-50"
        >
          {isLoading ? Icons.loader : Icons.refresh}
          {t.admin.dashboard.refresh}
        </button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 transition-colors duration-300"
        >
          {error}
        </motion.div>
      )}

      {/* Stats Cards */}
      {stats && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {Icons.shoppingCart}
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                  {stats.total_carts}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {t.admin.carts.totalCarts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 dark:border-green-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                {Icons.shoppingCart}
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                  {stats.active_carts}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {t.admin.carts.activeCarts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                {Icons.user}
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">
                  {stats.authenticated_carts}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {t.admin.carts.authenticatedCarts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 dark:border-orange-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                {Icons.guest}
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">
                  {stats.guest_carts}
                </p>
                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                  {t.admin.carts.guestCarts}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[280px] relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-historical-charcoal/30 dark:text-gray-500 transition-colors duration-300">
            {Icons.search}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.carts.searchPlaceholder}
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
          />
        </div>

        <select
          value={filterGuest === '' ? '' : filterGuest ? 'guest' : 'authenticated'}
          onChange={(e) => {
            const value = e.target.value
            setFilterGuest(value === '' ? '' : value === 'guest')
          }}
          className="px-4 py-3 rounded-xl border border-historical-gold/20 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/30 dark:focus:ring-yellow-600 min-w-[150px] text-historical-charcoal dark:text-gray-200 transition-colors duration-300"
        >
          <option value="">{t.admin.carts.allCarts}</option>
          <option value="authenticated">{t.admin.carts.authenticated}</option>
          <option value="guest">{t.admin.carts.guest}</option>
        </select>
      </motion.div>

      {/* Carts Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-historical-gold/10 dark:border-gray-700 shadow-soft overflow-hidden transition-colors duration-300"
      >
        {isLoading && carts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            {Icons.loader}
            <span className="mr-2 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
              {t.admin.carts.loading}
            </span>
          </div>
        ) : carts.length === 0 ? (
          <div className="text-center py-12 text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
            <div className="text-4xl mb-4">🛒</div>
            {t.admin.carts.noCarts}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-historical-stone/50 dark:bg-gray-700/50 transition-colors duration-300">
                  <tr>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.id}
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.owner}
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.type}
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.itemsCount}
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.subtotal}
                    </th>
                    <th className="text-right text-xs font-medium text-historical-charcoal/50 dark:text-gray-400 px-4 py-4 transition-colors duration-300">
                      {t.admin.carts.lastUpdated}
                    </th>
                    <th className="w-32 px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-historical-gold/5 dark:divide-gray-700/50 transition-colors duration-300">
                  {carts.map((cart) => (
                    <motion.tr
                      key={cart.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-historical-gold/5 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                          #{cart.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {cart.is_guest_cart ? (
                            <>
                              <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                                {t.admin.carts.guest}
                              </p>
                              <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300 font-mono" title={cart.session_key || ''}>
                                {cart.session_key ? `${cart.session_key.substring(0, 12)}...` : t.admin.carts.unknownUser}
                              </p>
                              <p className="text-xs text-historical-charcoal/40 dark:text-gray-500 transition-colors duration-300 mt-1">
                                {t.admin.carts.createdAt}: {formatDate(cart.created_at)}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                                {cart.user_email || t.admin.carts.unknownUser}
                              </p>
                              {cart.user_name && (
                                <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                                  {cart.user_name}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                          cart.is_guest_cart
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {cart.is_guest_cart ? Icons.guest : Icons.user}
                          {cart.is_guest_cart ? t.admin.carts.guest : t.admin.carts.authenticated}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/70 dark:text-gray-300 transition-colors duration-300">
                          {cart.item_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                          {formatCurrency(cart.subtotal)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                          {new Date(cart.updated_at).toLocaleDateString('ar-SY')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCart(cart)}
                            className="p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-500 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                            title={t.admin.carts.viewDetails}
                          >
                            {Icons.eye}
                          </button>
                          <button
                            onClick={() => handleDeleteCart(cart.id)}
                            disabled={isDeletingCart}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
                            title={t.admin.carts.delete}
                          >
                            {isDeletingCart ? Icons.loader : Icons.delete}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-historical-gold/10 bg-historical-stone/30">
              <p className="text-sm text-historical-charcoal/50 dark:text-gray-400 transition-colors duration-300">
                {t.admin.carts.showingCarts.replace('{count}', carts.length.toString()).replace('{total}', (total ?? 0).toString())}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={!hasPreviousPage || isLoading}
                  className="p-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronRight}
                </button>
                <span className="px-4 py-2 text-sm text-historical-charcoal dark:text-gray-200 transition-colors duration-300">
                  {t.admin.carts.page} {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!hasNextPage || isLoading}
                  className="p-2 rounded-lg border border-historical-gold/20 dark:border-gray-600 text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {Icons.chevronLeft}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Cart Detail Modal */}
      <CartDetailModal
        cart={selectedCart}
        isOpen={isModalOpen}
        isLoading={isLoadingDetails}
        isAddingItem={isAddingItem}
        isUpdatingItem={isUpdatingItem}
        isRemovingItem={isRemovingItem}
        isClearingCart={isClearingCart}
        onClose={handleCloseModal}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCartModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingCart}
      />
    </motion.div>
  )
}

