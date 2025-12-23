'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/use-translation';

const brands = [
    { id: 1, name: 'Fifi', color: '#BCA179', bg: '#FDFBF7' }, // Champagne Gold
    { id: 2, name: 'Soft', color: '#9E6D64', bg: '#FAF9F6' }, // Dusty Clay
    { id: 3, name: 'Adidas', color: '#475569', bg: '#F1F5F9' }, // Slate
    { id: 4, name: 'Nike', color: '#2D2A26', bg: '#FDFBF7' },  // Warm Charcoal
    { id: 5, name: 'Zara', color: '#1A1A1A', bg: '#F5F5F4' },
    { id: 6, name: 'H&M', color: '#C5A065', bg: '#FFFBEB' },
];

export function BrandsFlow() {
    const [activeIndex, setActiveIndex] = useState(0);
    const { t, direction } = useTranslation();

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % brands.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + brands.length) % brands.length);
    };

    return (
        <section className="py-20 overflow-hidden bg-gradient-to-b from-white to-stone-50/50" dir={direction}>
            {/* Background Flair */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-historical-gold/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 mb-12 flex items-end justify-between relative z-10">
                <div>
                    <span className="text-historical-gold font-bold text-xs tracking-[0.2em] uppercase mb-2 block">{t.brands.partners}</span>
                    <h2 className="text-4xl font-display font-bold text-stone-800">
                        {t.brands.title}
                    </h2>
                </div>

                {/* Navigation Pills */}
                <div className="flex gap-3">
                    <button
                        onClick={direction === 'rtl' ? handleNext : handlePrev}
                        className="w-12 h-12 rounded-full border border-stone-200 bg-white text-stone-600 flex items-center justify-center hover:bg-historical-gold hover:text-white hover:border-historical-gold transition-all shadow-sm active:scale-90"
                    >
                        {direction === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={direction === 'rtl' ? handlePrev : handleNext}
                        className="w-12 h-12 rounded-full border border-stone-200 bg-white text-stone-600 flex items-center justify-center hover:bg-historical-gold hover:text-white hover:border-historical-gold transition-all shadow-sm active:scale-90"
                    >
                        {direction === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="relative h-[450px] flex items-center justify-center perspective-[1200px]">
                {brands.map((brand, index) => {
                    let offset = index - activeIndex;
                    if (offset < -2) offset += brands.length;
                    if (offset > 2) offset -= brands.length;

                    const isActive = offset === 0;

                    return (
                        <motion.div
                            key={brand.id}
                            className={cn(
                                "absolute w-72 h-96 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center cursor-pointer border border-white/50 backdrop-blur-md overflow-hidden transition-all duration-500",
                                isActive ? "z-20 border-historical-gold/30 shadow-[0_20px_50px_-12px_rgba(197,160,101,0.25)]" : "z-10 grayscale-[0.5] opacity-80"
                            )}
                            style={{
                                backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                            }}
                            initial={false}
                            animate={{
                                x: offset * 260,
                                z: -Math.abs(offset) * 100,
                                rotateY: offset * -15,
                                scale: isActive ? 1.05 : 0.9,
                                opacity: isActive ? 1 : 1 - Math.abs(offset) * 0.3,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            {/* Card Content */}
                            <div className="relative z-10 flex flex-col items-center">
                                {/* Logo Circle */}
                                <div
                                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg mb-8 text-white text-3xl font-bold relative group"
                                    style={{ backgroundColor: brand.color }}
                                >
                                    <div className="absolute inset-0 rounded-full border border-white/20" />
                                    {brand.name[0]}

                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-historical-gold"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </div>

                                <h3 className="text-3xl font-display font-bold text-stone-800 mb-2">{brand.name}</h3>
                                <p className="text-stone-400 font-medium text-sm tracking-wide">{t.brands.premiumPartner}</p>

                                <motion.div
                                    className={cn(
                                        "mt-8 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold shadow-xl transition-all",
                                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                    )}
                                >
                                    {t.brands.viewProducts}
                                </motion.div>
                            </div>

                            {/* Decorative Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-100/50 pointer-events-none" />
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
