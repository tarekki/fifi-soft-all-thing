'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CartRepository } from '@/core/repositories/cart.repository';
import { CartService } from '@/core/services/cart.service';
import type { Cart, CartItem, AddCartItemDTO } from '@/types/cart';

/**
 * Cart Context Interface
 * واجهة سياق السلة
 */
interface CartContextType {
    // State
    items: CartItem[];
    isLoading: boolean;
    error: string | null;
    isCartOpen: boolean;
    cartCount: number;
    cartTotal: number;
    
    // Actions
    addToCart: (variantId: number, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Provider Component
 * مكون مزود السلة
 * 
 * Manages cart state and operations via API
 * يدير حالة السلة والعمليات عبر API
 * 
 * Features:
 * - Syncs with Backend API
 * - Supports authenticated and guest users
 * - Error handling and loading states
 * - Automatic cart refresh
 * 
 * المميزات:
 * - يتزامن مع Backend API
 * - يدعم المستخدمين المسجلين والضيوف
 * - معالجة الأخطاء وحالات التحميل
 * - تحديث تلقائي للسلة
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize repository and service
    // تهيئة المستودع والخدمة
    const cartRepository = new CartRepository();
    const cartService = new CartService(cartRepository);

    /**
     * Load cart from API
     * تحميل السلة من API
     */
    const loadCart = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const cartData = await cartService.getCart();
            setCart(cartData);
        } catch (err) {
            console.error('Failed to load cart:', err);
            
            // Don't show error for 404 (cart doesn't exist yet)
            // لا تعرض خطأ لـ 404 (السلة غير موجودة بعد)
            const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
            const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
            
            if (!isNotFound) {
                setError(errorMessage);
            }
            
            // Always set empty cart state on error (cart will be created on first add)
            // دائماً اضبط حالة سلة فارغة عند الخطأ (سيتم إنشاء السلة عند أول إضافة)
            setCart({
                id: 0,
                user: null,
                items: [],
                item_count: 0,
                subtotal: '0.00',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        } finally {
            setIsLoading(false);
        }
    }, [cartService]);

    /**
     * Initialize cart on mount
     * تهيئة السلة عند التحميل
     */
    useEffect(() => {
        if (!isInitialized) {
            loadCart();
            setIsInitialized(true);
        }
    }, [isInitialized, loadCart]);

    /**
     * Add item to cart
     * إضافة عنصر للسلة
     */
    const addToCart = useCallback(async (variantId: number, quantity: number = 1) => {
        try {
            setIsLoading(true);
            setError(null);

            const data: AddCartItemDTO = {
                variant_id: variantId,
                quantity,
            };

            const updatedCart = await cartService.addItem(data);
            setCart(updatedCart);
            setIsCartOpen(true); // Auto-open cart on add
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to add item to cart');
            throw err; // Re-throw to allow component to handle
        } finally {
            setIsLoading(false);
        }
    }, [cartService]);

    /**
     * Remove item from cart
     * إزالة عنصر من السلة
     */
    const removeFromCart = useCallback(async (itemId: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const updatedCart = await cartService.removeItem(itemId);
            setCart(updatedCart);
        } catch (err) {
            console.error('Failed to remove item from cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [cartService]);

    /**
     * Update item quantity
     * تحديث كمية عنصر
     */
    const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
        if (quantity < 1) {
            // If quantity is 0 or less, remove item
            // إذا كانت الكمية 0 أو أقل، أزل العنصر
            await removeFromCart(itemId);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const updatedCart = await cartService.updateItem(itemId, { quantity });
            setCart(updatedCart);
        } catch (err) {
            console.error('Failed to update cart item:', err);
            setError(err instanceof Error ? err.message : 'Failed to update cart item');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [cartService, removeFromCart]);

    /**
     * Clear cart
     * مسح السلة
     */
    const clearCart = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const updatedCart = await cartService.clear();
            setCart(updatedCart);
        } catch (err) {
            console.error('Failed to clear cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear cart');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [cartService]);

    /**
     * Refresh cart from API
     * تحديث السلة من API
     */
    const refreshCart = useCallback(async () => {
        await loadCart();
    }, [loadCart]);

    // Calculate derived values
    // حساب القيم المشتقة
    const items = cart?.items || [];
    const cartCount = cart?.item_count || 0;
    const cartTotal = parseFloat(cart?.subtotal || '0');

    return (
        <CartContext.Provider value={{
            items,
            isLoading,
            error,
            isCartOpen,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            refreshCart,
            setIsCartOpen,
        }}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * useCart Hook
 * Hook استخدام السلة
 * 
 * @returns Cart context
 */
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
