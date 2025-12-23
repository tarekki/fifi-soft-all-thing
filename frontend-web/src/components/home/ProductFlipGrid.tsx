'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';

import { useTranslation } from '@/lib/i18n/use-translation';

// Temporary Mock Data Generator
const generateProducts = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        name: {
            ar: `منتج فاخر رقم ${i + 1}`,
            en: `Luxury Product #${i + 1}`,
        },
        slug: `product-${i + 1}`,
        image: '',
        basePrice: `${(150000 + i * 5000)}`,
        finalPrice: `${(120000 + i * 4000)}`,
        discountPercentage: 15,
        rating: 4.5,
        reviewCount: 12 + i,
        vendorName: {
            ar: i % 2 === 0 ? 'فيفي' : 'سوفت',
            en: i % 2 === 0 ? 'Fifi' : 'Soft',
        },
        isAvailable: true,
    }));
};

const allProducts = generateProducts(24);

export function ProductFlipGrid({ title }: { title?: string }) {
    const { language, direction } = useTranslation(); // Use language from context
    const [page, setPage] = useState(0);
    const itemsPerPage = 8; // 4 columns x 2 rows
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);

    const paginate = (newDirection: number) => {
        let newPage = page + newDirection;
        if (newPage < 0) newPage = totalPages - 1;
        if (newPage >= totalPages) newPage = 0;
        setPage(newPage);
    };

    const currentProducts = allProducts.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    return (
        <section className="py-12 px-4 lg:px-12 bg-historical-stone relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-historical-gold/5 rounded-full blur-3xl" />

            <div className="flex items-center justify-between mb-8 px-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-historical-blue relative inline-block">
                        {title}
                        <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-historical-red rounded-full" />
                    </h2>
                </div>
                {/* Page Indicator */}
                <div className="flex items-center gap-1 text-sm font-bold text-gray-400">
                    <span className="text-historical-red">{page + 1}</span>
                    <span>/</span>
                    <span>{totalPages}</span>
                </div>
            </div>

            <div className="relative min-h-[600px] flex items-center">
                {/* Right Button (Previous/Start) - RTL aware */}
                <button
                    onClick={() => paginate(direction === 'rtl' ? -1 : 1)}
                    className="absolute -right-4 lg:-right-6 z-20 w-12 h-12 rounded-full bg-white text-historical-blue shadow-lg border border-historical-gold/20 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Previous page"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div className="flex-1 w-full mx-auto">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1"
                        >
                            {currentProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    {...product}
                                    name={language === 'ar' ? product.name.ar : product.name.en}
                                    vendorName={language === 'ar' ? product.vendorName.ar : product.vendorName.en}
                                    className="h-full"
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Left Button (Next/End) - RTL aware */}
                <button
                    onClick={() => paginate(direction === 'rtl' ? 1 : -1)}
                    className="absolute -left-4 lg:-left-6 z-20 w-12 h-12 rounded-full bg-white text-historical-blue shadow-lg border border-historical-gold/20 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Next page"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
}
