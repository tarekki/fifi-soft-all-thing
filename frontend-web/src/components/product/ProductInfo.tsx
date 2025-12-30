'use client';

import { useState } from 'react';
import { Star, Minus, Plus, ShoppingBag, Share2, Heart } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart/context';

interface ProductInfoProps {
    product: {
        id: string;
        slug: string;
        name: { ar: string; en: string };
        vendor: { ar: string; en: string };
        price: number;
        originalPrice?: number;
        rating: number;
        reviewCount: number;
        description: { ar: string; en: string };
        images: string[];
        colors?: string[];
        sizes?: string[];
        isAvailable: boolean;
    };
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart();
    const { t, language } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
    const [isWishlisted, setIsWishlisted] = useState(false);

    const name = language === 'ar' ? product.name.ar : product.name.en;
    const vendor = language === 'ar' ? product.vendor.ar : product.vendor.en;
    const description = language === 'ar' ? product.description.ar : product.description.en;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-SY' : 'en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = async () => {
        // Find the variant based on selected color and size
        // البحث عن المتغير بناءً على اللون والمقاس المحدد
        const variant = product.variants?.find(
            (v) => v.color === selectedColor && v.size === selectedSize
        );

        if (!variant) {
            // If no variant found, use first available variant
            // إذا لم يتم العثور على متغير، استخدم أول متغير متاح
            const firstVariant = product.variants?.[0];
            if (!firstVariant) {
                console.error('No variant available');
                return;
            }
            await addToCart(firstVariant.id, quantity);
        } else {
            await addToCart(variant.id, quantity);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Info */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-historical-gold uppercase tracking-[0.2em]">
                        {vendor}
                    </span>
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-historical-gold">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold text-stone-700">{product.rating}</span>
                        <span className="text-stone-400 text-sm">({product.reviewCount} {t.product.reviews})</span>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-stone-800 leading-tight mb-4">
                    {name}
                </h1>

                {/* Price Block */}
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-historical-blue font-display">
                        {formatPrice(product.price)} <span className="text-base font-sans font-normal text-stone-500">{t.common.currency}</span>
                    </span>
                    {product.originalPrice && (
                        <>
                            <span className="text-xl text-stone-400 line-through decoration-historical-red/30">
                                {formatPrice(product.originalPrice)}
                            </span>
                            <span className="bg-historical-red/10 text-historical-red px-3 py-1 rounded-full text-xs font-bold">
                                {t.product.sale} {discount}%
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* Description Preview */}
            <p className="text-stone-600 leading-relaxed">
                {description}
            </p>

            {/* Selectors */}
            <div className="space-y-4">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-stone-900 mb-3">{t.product.color}</h3>
                        <div className="flex gap-3">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-10 h-10 rounded-full border-2 transition-all duration-200",
                                        selectedColor === color
                                            ? "border-historical-gold ring-2 ring-historical-gold/20 scale-110"
                                            : "border-stone-200 hover:border-historical-gold/50"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-stone-900 mb-3">{t.product.size}</h3>
                        <div className="flex flex-wrap gap-3">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={cn(
                                        "min-w-[3rem] px-4 py-2 rounded-xl border font-bold text-sm transition-all duration-200",
                                        selectedSize === size
                                            ? "bg-historical-blue text-white border-historical-blue shadow-md"
                                            : "bg-white text-stone-600 border-stone-200 hover:border-historical-gold hover:text-historical-gold"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {/* Quantity */}
                <div className="flex items-center bg-[#FDFBF7] rounded-2xl border border-stone-200 w-fit">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-historical-blue"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-stone-800">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-historical-blue"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Add to Cart */}
                <button
                    disabled={!product.isAvailable}
                    onClick={handleAddToCart}
                    className="flex-1 bg-historical-blue text-white h-12 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-historical-blue/20 hover:bg-historical-blue/90 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                >
                    <ShoppingBag className="w-5 h-5" />
                    {product.isAvailable ? t.product.addToCart : t.product.soldOut}
                </button>

                {/* Wishlist & Share */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-2xl border transition-colors duration-300",
                            isWishlisted
                                ? "bg-red-50 border-red-200 text-red-500"
                                : "bg-white border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200"
                        )}
                    >
                        <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400 hover:text-historical-blue hover:border-historical-blue transition-colors duration-300">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
