'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';

import { useTranslation } from '@/lib/i18n/use-translation';

import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';

// Generate products from MOCK_PRODUCTS
const generateProducts = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const baseProduct = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
        return {
            ...baseProduct,
            id: i + 1, // distinct IDs for React keys
            // Keep original slug for routing to work, or maybe append ID if we wanted unique pages per card?
            // ideally we want to test the page, so let's stick to baseProduct.slug
            slug: baseProduct.slug,
            image: baseProduct.images[0],
            basePrice: baseProduct.originalPrice?.toString() || (baseProduct.price * 1.2).toString(),
            finalPrice: baseProduct.price.toString(),
            discountPercentage: baseProduct.originalPrice ? Math.round(((baseProduct.originalPrice - baseProduct.price) / baseProduct.originalPrice) * 100) : 0,
            vendorName: baseProduct.vendor, // Keep object structure {ar, en}
            // MOCK_PRODUCTS uses 'vendor' key, ProductCard expects 'vendorName' (string) passed in prop mapping below
            // Wait, ProductCard mapping below handles language selection.
            itemVendor: baseProduct.vendor // renaming to avoid confusion in mapping below
        };
    });
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
        <section className="py-12 px-2 sm:px-4 lg:px-12 bg-historical-stone relative overflow-hidden group">
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
                <button
                    onClick={() => paginate(direction === 'rtl' ? -1 : 1)}
                    className="absolute -right-2 sm:-right-4 lg:-right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-historical-blue shadow-lg border border-historical-gold/20 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Previous page"
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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

                <button
                    onClick={() => paginate(direction === 'rtl' ? 1 : -1)}
                    className="absolute -left-2 sm:-left-4 lg:-left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-historical-blue shadow-lg border border-historical-gold/20 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all hover:scale-110 active:scale-95"
                    aria-label="Next page"
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </div>
        </section>
    );
}
