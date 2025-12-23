'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';

export function HeroSection() {
    const { t, direction } = useTranslation();

    return (
        <section className="relative w-full h-[500px] lg:h-[600px] overflow-hidden flex items-center bg-[#FDFBF7] mx-4 lg:mx-8 mt-4 lg:mt-6 rounded-[2.5rem] shadow-sm border border-stone-100" dir={direction}>
            {/* Elegant Background Blobs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-historical-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-historical-red/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]" />

            <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* Text Content - Minimal & Clean */}
                <motion.div
                    initial={{ opacity: 0, x: direction === 'rtl' ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="lg:w-1/2 text-start"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-100 shadow-sm mb-8">
                        <Sparkles className="w-4 h-4 text-historical-gold" />
                        <span className="text-xs font-bold text-stone-500 tracking-wide uppercase">{t.hero.modernExperience}</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-display font-bold text-stone-800 leading-[1.1] mb-6">
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

                {/* Visual/Image Area (Simulated for now) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="lg:w-1/2 relative h-[400px] w-full hidden lg:flex items-center justify-center"
                >
                    <div className="relative w-full h-full">
                        {/* Main Floating Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] z-20 flex items-center justify-center">
                            <span className="text-6xl animate-bounce">🛍️</span>
                        </div>

                        {/* Floating Sphere */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-10 w-32 h-32 bg-gradient-to-br from-historical-gold/20 to-transparent rounded-full backdrop-blur-md border border-white/20 z-10"
                        />

                        {/* Floating Card Small */}
                        <motion.div
                            animate={{ y: [0, 30, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-10 left-10 w-48 h-32 bg-white/60 backdrop-blur-lg rounded-3xl shadow-lg border border-white/40 z-30 flex items-center justify-between px-6"
                        >
                            <div className="w-10 h-10 rounded-full bg-historical-red/10 flex items-center justify-center text-historical-red">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-400">خصومات تصل لـ</p>
                                <p className="text-2xl font-bold text-stone-800">50%</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
