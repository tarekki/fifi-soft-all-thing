'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
    id: string; // Product ID
    slug: string;
    name: { ar: string; en: string };
    price: number;
    image: string;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    vendor: { ar: string; en: string };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, selectedColor?: string, selectedSize?: string) => void;
    updateQuantity: (itemId: string, quantity: number, selectedColor?: string, selectedSize?: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('yalla-buy-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('yalla-buy-cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (newItem: CartItem) => {
        setItems((currentItems) => {
            const existingItemIndex = currentItems.findIndex(
                (item) =>
                    item.id === newItem.id &&
                    item.selectedColor === newItem.selectedColor &&
                    item.selectedSize === newItem.selectedSize
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...currentItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                return updatedItems;
            }

            return [...currentItems, newItem];
        });
        setIsCartOpen(true); // Auto-open cart on add
    };

    const removeFromCart = (itemId: string, selectedColor?: string, selectedSize?: string) => {
        setItems((currentItems) =>
            currentItems.filter((item) =>
                !(item.id === itemId &&
                    item.selectedColor === selectedColor &&
                    item.selectedSize === selectedSize)
            )
        );
    };

    const updateQuantity = (itemId: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
        if (quantity < 1) return;
        setItems((currentItems) =>
            currentItems.map((item) =>
                (item.id === itemId && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
