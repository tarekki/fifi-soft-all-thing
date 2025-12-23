'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames

interface ProductGalleryProps {
    images: string[];
    productName: string;
    className?: string;
}

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // If no images provided, show a placeholder
    const safeImages = images.length > 0 ? images : ['/placeholder-image.jpg'];

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Main Image Stage */}
            <div className="relative aspect-[4/5] bg-[#FDFBF7] rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm group">

                {/* Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-historical-gold/5 rounded-full blur-3xl" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={safeImages[selectedIndex]}
                            alt={`${productName} - View ${selectedIndex + 1}`}
                            fill
                            priority={selectedIndex === 0}
                            className="object-cover mix-blend-multiply cursor-zoom-in"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Zoom Hint Overlay */}
                <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {safeImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                            "relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                            selectedIndex === idx
                                ? "border-historical-gold shadow-md scale-105"
                                : "border-transparent opacity-70 hover:opacity-100 ring-1 ring-stone-100"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`${productName} thumb ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
