'use client';

import { notFound } from 'next/navigation';
import { MOCK_PRODUCTS } from '@/lib/mock-data'; // Adjust path if needed
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductFlipGrid } from '@/components/home/ProductFlipGrid';
import { SearchHeader } from '@/components/home/SearchHeader';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useState, use } from 'react';
import { cn } from '@/lib/utils';
import { Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const { t, language } = useTranslation();
    const product = MOCK_PRODUCTS.find((p) => p.slug === resolvedParams.slug);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

    if (!product) {
        // In a real app, you might want to show a custom 404
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-stone-400">{t.product.soldOut}</h1>
            </div>
        )
    }

    const features = [
        { icon: Truck, label: t.product.freeDelivery, sub: 'For orders > 500k' },
        { icon: ShieldCheck, label: 'Authentic', sub: '100% Original' },
        { icon: RotateCcw, label: t.product.returnPolicy, sub: '7 Days Return' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-historical-stone/20">
            <SearchHeader />

            <main className="container mx-auto px-4 py-8 md:py-12">
                {/* Top Section: Gallery + Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left Column: Gallery */}
                    <ProductGallery
                        images={product.images}
                        productName={language === 'ar' ? product.name.ar : product.name.en}
                        className="sticky top-24"
                    />

                    {/* Right Column: Info */}
                    <div className="flex flex-col gap-8">
                        <ProductInfo product={product} />

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-y border-stone-100">
                            {features.map((feat, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-historical-gold/10 flex items-center justify-center text-historical-gold">
                                        <feat.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-700">{feat.label}</p>
                                        <p className="text-[10px] text-stone-400">{feat.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Section: Tabs (Description, Specs, Reviews) */}
                <div className="mb-16">
                    <div className="flex items-center gap-8 border-b border-stone-200 mb-8">
                        {(['description', 'specs', 'reviews'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "pb-4 text-lg font-bold transition-all duration-300 relative",
                                    activeTab === tab
                                        ? "text-historical-blue"
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                {t.product[tab as keyof typeof t.product] || tab}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-historical-gold" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[200px] text-stone-600 leading-relaxed max-w-4xl">
                        {activeTab === 'description' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-lg whitespace-pre-line">
                                    {language === 'ar' ? product.description.ar : product.description.en}
                                </p>
                            </div>
                        )}
                        {activeTab === 'specs' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <table className="w-full text-sm text-left">
                                    <tbody>
                                        <tr className="border-b border-stone-100">
                                            <td className="py-3 font-bold text-stone-800 w-1/4">{t.product.sku}</td>
                                            <td className="py-3 text-stone-600">{product.id.padStart(6, '0')}</td>
                                        </tr>
                                        <tr className="border-b border-stone-100">
                                            <td className="py-3 font-bold text-stone-800">{t.product.category}</td>
                                            <td className="py-3 text-stone-600 capitalize">{product.category}</td>
                                        </tr>
                                        {/* more technical specs could go here */}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeTab === 'reviews' && ( // Fixed typo in state 'reviwes' -> 'reviews' in logic but component state was initialised with typo? No, let's fix keys.
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center h-48 bg-white/50 rounded-2xl border border-dashed border-stone-300">
                                <p className="text-stone-400 mb-4">{t.product.reviews} Coming Soon</p>
                                <button className="text-historical-blue hover:underline text-sm font-bold">Write a review</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Related Products */}
                <div className="border-t border-stone-200 pt-12">
                    <ProductFlipGrid title={t.product.relatedProducts} />
                </div>

            </main>
        </div>
    );
}
