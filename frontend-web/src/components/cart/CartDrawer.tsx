'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart/context';
import { useTranslation } from '@/lib/i18n/use-translation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CartDrawer() {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { t, language, direction } = useTranslation();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SY' : 'en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: direction === 'rtl' ? '-100%' : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: direction === 'rtl' ? '-100%' : '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed top-0 bottom-0 w-full max-w-md bg-[#FAF9F6] shadow-2xl z-[101] flex flex-col border-historical-gold/10",
                            direction === 'rtl' ? "left-0 border-r" : "right-0 border-l"
                        )}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-historical-blue text-white rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-xl text-historical-blue">
                                        {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
                                    </h2>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">
                                        {items.length} {language === 'ar' ? 'منتجات' : 'Items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-historical-red transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-200">
                                        <ShoppingBag className="w-10 h-10" />
                                    </div>
                                    <p className="text-stone-400 font-medium">
                                        {language === 'ar' ? 'سلتك فارغة حالياً' : 'Your cart is empty'}
                                    </p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 text-historical-blue font-bold text-sm hover:underline"
                                    >
                                        {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 group">
                                        {/* Image wrapper with heritage style */}
                                        <div className="relative w-20 h-24 bg-white rounded-2xl overflow-hidden border border-stone-100 flex-shrink-0 group-hover:border-historical-gold/30 transition-colors">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={language === 'ar' ? item.name.ar : item.name.en}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-200">
                                                    🧺
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-stone-800 text-sm leading-tight line-clamp-1">
                                                        {language === 'ar' ? item.name.ar : item.name.en}
                                                    </h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                                                        className="text-stone-300 hover:text-historical-red transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
                                                    {language === 'ar' ? item.vendor.ar : item.vendor.en}
                                                </p>
                                                {(item.selectedColor || item.selectedSize) && (
                                                    <div className="flex gap-2 mt-2">
                                                        {item.selectedColor && (
                                                            <div
                                                                className="w-3 h-3 rounded-full border border-stone-200"
                                                                style={{ backgroundColor: item.selectedColor }}
                                                            />
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-500">
                                                                {item.selectedSize}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-white rounded-lg border border-stone-100 shadow-sm overflow-hidden scale-90 -ms-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                                                        className="p-1 px-2 hover:bg-stone-50 text-stone-400"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-bold text-stone-700">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                                                        className="p-1 px-2 hover:bg-stone-50 text-stone-400"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <span className="font-display font-bold text-historical-blue text-sm">
                                                    {formatPrice(item.price)} <span className="text-[10px] font-sans font-normal text-stone-400">{t.common.currency}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 bg-white border-t border-stone-200 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-stone-500 font-medium">
                                        {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                                    </span>
                                    <span className="text-2xl font-display font-bold text-historical-blue">
                                        {formatPrice(cartTotal)} <span className="text-xs font-sans font-normal text-stone-400">{t.common.currency}</span>
                                    </span>
                                </div>
                                <button className="w-full bg-historical-blue text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-historical-blue/20 hover:bg-historical-blue/90 transition-all hover:-translate-y-1 active:scale-95">
                                    <ShoppingBag className="w-5 h-5" />
                                    {language === 'ar' ? 'إتمام عملية الشراء' : 'Checkout Now'}
                                </button>
                                <p className="text-[10px] text-center text-stone-400 font-medium">
                                    {language === 'ar'
                                        ? 'سيتم إضافة رسوم التوصيل عند الدفع.'
                                        : 'Shipping fees will be calculated at checkout.'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
