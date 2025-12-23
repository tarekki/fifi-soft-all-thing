'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function DiscountSlider() {
    const { t, direction } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [directionState, setDirectionState] = useState(0);

    const offers = [
        {
            id: 1,
            title: t.offers.summerTitle,
            subtitle: t.offers.summerSubtitle,
            discount: "50%",
            bg: "bg-gradient-to-r from-rose-400 to-orange-300",
            icon: "☀️",
            code: "SUMMER50"
        },
        {
            id: 2,
            title: t.offers.winterTitle,
            subtitle: t.offers.winterSubtitle,
            discount: "30%",
            bg: "bg-gradient-to-r from-blue-400 to-indigo-400",
            icon: "❄️",
            code: "WINTER30"
        },
        {
            id: 3,
            title: t.offers.brandsTitle,
            subtitle: t.offers.brandsSubtitle,
            discount: "20%",
            bg: "bg-gradient-to-r from-emerald-400 to-teal-400",
            icon: "🛍️",
            code: "BRANDS20"
        }
    ];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirectionState(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + offers.length) % offers.length);
    };

    return (
        <section className="py-8 px-4 overflow-hidden" dir={direction}>
            <div className="container mx-auto relative h-48 md:h-64">

                {/* Navigation Buttons */}
                <div className="absolute inset-0 z-10 flex items-center justify-between px-2 pointer-events-none">
                    <button
                        className="pointer-events-auto w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/50 transition-all shadow-lg active:scale-95"
                        onClick={() => paginate(direction === 'rtl' ? -1 : 1)}
                    >
                        {direction === 'rtl' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </button>
                    <button
                        className="pointer-events-auto w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/50 transition-all shadow-lg active:scale-95"
                        onClick={() => paginate(direction === 'rtl' ? 1 : -1)}
                    >
                        {direction === 'rtl' ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>

                <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl">
                    <AnimatePresence initial={false} custom={directionState} mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            custom={directionState}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            className={`absolute inset-0 w-full h-full flex items-center justify-center ${offers[currentIndex].bg}`}
                        >
                            <div className="absolute inset-0 bg-damascene-pattern opacity-10 mix-blend-overlay" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-3xl px-8 gap-6 text-center md:text-start transition-all">

                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold mb-3 border border-white/30">
                                        <Tag className="w-3 h-3" />
                                        <span>{t.offers.limitedOffer}</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 drop-shadow-md">
                                        {offers[currentIndex].title}
                                    </h3>
                                    <p className="text-white/90 text-lg font-medium mb-4">
                                        {offers[currentIndex].subtitle}
                                    </p>

                                    <div className="flex flex-col md:flex-row gap-3 justify-center md:justify-start">
                                        <div className="bg-white text-gray-800 px-6 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2">
                                            <span>{t.offers.discountCode}:</span>
                                            <span className="font-mono text-historical-red tracking-wider">{offers[currentIndex].code}</span>
                                        </div>
                                        <button className="px-6 py-2 bg-black/20 text-white rounded-xl font-bold backdrop-blur-sm hover:bg-black/30 transition-colors border border-white/20">
                                            {t.offers.shopNow}
                                        </button>
                                    </div>
                                </div>

                                {/* Discount Circle */}
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/30 flex flex-col items-center justify-center text-white shadow-xl rotate-12">
                                    <span className="text-sm font-bold opacity-90">{t.offers.discountUpTo}</span>
                                    <span className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-sm">{offers[currentIndex].discount}</span>
                                    <span className="text-3xl animate-pulse">{offers[currentIndex].icon}</span>
                                </div>

                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
