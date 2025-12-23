'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Tag, ShoppingBag, Crown } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';

export function HeroSection() {
    const { t, direction } = useTranslation();

    return (
        <section className="relative w-full h-[450px] sm:h-[500px] lg:h-[600px] overflow-hidden flex items-center bg-[#FDFBF7] mx-0 sm:mx-4 lg:mx-8 mt-4 lg:mt-6 rounded-[2.5rem] shadow-sm border border-stone-100" dir={direction}>
            {/* Elegant Background Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-historical-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-historical-red/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* Text Content - Minimal & Clean */}
                <motion.div
                    initial={{ opacity: 0, x: direction === 'rtl' ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="lg:w-1/2 text-start"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-100 shadow-sm mb-4 sm:mb-8">
                        <Sparkles className="w-4 h-4 text-historical-gold" />
                        <span className="text-xs font-bold text-stone-500 tracking-wide uppercase">{t.hero.modernExperience}</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-stone-800 leading-[1.1] mb-4 sm:mb-6">
                        {t.hero.discoverBeauty} <span className="text-transparent bg-clip-text bg-gradient-to-l from-historical-gold to-historical-red">{t.hero.inDetails}</span>
                    </h1>

                    <p className="text-lg text-stone-500 mb-10 max-w-lg font-light leading-relaxed">
                        {t.hero.heroDesc}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/offers">
                            <button className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold shadow-xl hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                {t.hero.startShopping}
                                {direction === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </Link>

                        <Link href="/brands">
                            <button className="px-8 py-4 bg-white text-stone-600 border border-stone-200 rounded-2xl font-bold hover:bg-stone-50 hover:border-stone-300 transition-all">
                                {t.hero.browseBrands}
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Visual/Image Area - Modern Heritage Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="lg:w-1/2 relative h-[450px] w-full hidden lg:flex items-center justify-center p-8"
                >
                    <div className="relative w-full h-full group/image">
                        {/* Elegant Frame */}
                        <div className="absolute inset-0 border-[12px] border-white rounded-[3.5rem] shadow-2xl z-10 overflow-hidden">
                            <img
                                src="/images/hero_main.png"
                                alt="Modern Heritage Luxury"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                            />
                            {/* Overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-historical-blue/20 to-transparent" />
                        </div>

                        {/* Floating Sphere - Red Accent */}
                        <motion.div
                            animate={{ y: [0, -30, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 w-24 h-24 bg-historical-red/10 rounded-full backdrop-blur-md border border-historical-red/20 z-20 flex items-center justify-center"
                        >
                            <Sparkles className="w-8 h-8 text-historical-red/40" />
                        </motion.div>

                        {/* Small Floating Card - Offer */}
                        <motion.div
                            animate={{ y: [0, 40, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-8 -left-8 w-56 h-36 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 z-30 flex flex-col justify-center px-8"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-historical-gold/20 flex items-center justify-center text-historical-gold">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">عرض خاص</span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-stone-800 leading-none">50%</p>
                                <p className="text-xs text-stone-500 font-medium">على قسم التحف</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
