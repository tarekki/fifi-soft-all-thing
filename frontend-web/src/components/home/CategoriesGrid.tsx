'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shirt, Watch, Home, Sparkles, Monitor, Footprints, Baby } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function CategoriesGrid() {
    const { t } = useTranslation();

    const categories = [
        { id: 'women', name: t.categories.women, icon: Shirt, color: 'bg-rose-50 text-rose-600', href: '/category/women' },
        { id: 'men', name: t.categories.men, icon: Watch, color: 'bg-blue-50 text-blue-600', href: '/category/men' },
        { id: 'kids', name: t.categories.kids, icon: Baby, color: 'bg-yellow-50 text-yellow-600', href: '/category/kids' },
        { id: 'home', name: t.categories.home, icon: Home, color: 'bg-emerald-50 text-emerald-600', href: '/category/home' },
        { id: 'electronics', name: t.categories.electronics, icon: Monitor, color: 'bg-neutral-100 text-neutral-600', href: '/category/electronics' },
        { id: 'shoes', name: t.categories.shoes, icon: Footprints, color: 'bg-orange-50 text-orange-600', href: '/category/shoes' },
    ];

    return (
        <section className="py-8 px-4">
            <div className="container mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display px-2">{t.categories.title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {categories.map((category, index) => (
                        <Link key={category.id} href={category.href}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl ${category.color} hover:shadow-lg transition-all cursor-pointer h-32 border border-white/50 backdrop-blur-sm`}
                            >
                                <category.icon className="w-8 h-8 mb-3" />
                                <span className="font-bold text-sm">{category.name}</span>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
