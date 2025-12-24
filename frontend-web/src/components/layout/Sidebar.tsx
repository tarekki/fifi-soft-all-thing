'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, Percent, User, X, Menu, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useCart } from '@/lib/cart/context';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { t, direction, language } = useTranslation();
    const { cartCount, setIsCartOpen } = useCart();

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Close on navigation
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Don't show public sidebar on vendor or admin pages
    if (pathname.startsWith('/vendor') || pathname.startsWith('/admin')) {
        return null;
    }

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const navItems = [
        { name: t.sidebar.home, href: '/', icon: Home },
        { name: t.sidebar.brands, href: '/brands', icon: ShoppingBag },
        { name: t.sidebar.offers, href: '/offers', icon: Percent },
        { name: language === 'ar' ? 'السلة' : 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
        { name: t.sidebar.profile, href: '/profile', icon: User },
    ];

    return (
        <>
            {/* Floating Menu Button - "The Key to Heritage" */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className={cn(
                    "fixed top-6 z-[60] w-14 h-14 bg-white/80 backdrop-blur-xl border border-historical-gold/20 rounded-2xl shadow-2xl flex items-center justify-center text-historical-blue hover:text-historical-red transition-colors group",
                    direction === 'rtl' ? "right-6 lg:right-10" : "left-6 lg:left-10"
                )}
            >
                <div className="relative">
                    <Menu className="w-6 h-6 transition-transform duration-500 group-hover:rotate-180" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-historical-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-historical-blue/20 backdrop-blur-sm z-[70]"
                        />

                        {/* Sidebar Drawer */}
                        <motion.aside
                            initial={{ x: direction === 'rtl' ? '100%' : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: direction === 'rtl' ? '100%' : '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={cn(
                                "fixed top-0 bottom-0 w-80 bg-white shadow-2xl z-[80] flex flex-col font-sans border-historical-gold/10",
                                direction === 'rtl' ? "right-0 border-l" : "left-0 border-r"
                            )}
                        >
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-texture opacity-5 pointer-events-none" />

                            {/* Header */}
                            <div className="relative h-24 border-b border-historical-gold/5 flex items-center justify-between px-6 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-historical-red rounded-xl flex items-center justify-center text-historical-gold font-bold text-lg shadow-sm rotate-3">
                                        YB
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-xl text-historical-blue tracking-tight">
                                            Yalla<span className="text-historical-red">Buy</span>
                                        </h2>
                                        <p className="text-[10px] text-gray-400 font-medium tracking-wide">
                                            {t.common.slogan}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full hover:bg-historical-stone flex items-center justify-center text-gray-400 hover:text-historical-red transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="relative flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const isCart = item.name === (language === 'ar' ? 'السلة' : 'Cart');

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={(e) => {
                                                if (isCart) {
                                                    e.preventDefault();
                                                    setIsCartOpen(true);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className={cn(
                                                "group flex items-center px-4 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                                isActive
                                                    ? "bg-historical-stone text-historical-red shadow-sm border border-historical-gold/10"
                                                    : "text-gray-500 hover:bg-historical-stone/50 hover:text-historical-red"
                                            )}
                                        >
                                            <div className="w-8 flex-shrink-0">
                                                <item.icon className={cn("w-6 h-6", isActive ? "text-historical-red" : "text-gray-400 group-hover:text-historical-red")} />
                                            </div>

                                            <span className="text-base font-bold ms-3">
                                                {item.name}
                                            </span>

                                            {/* Badge */}
                                            {(item as any).badge > 0 && (
                                                <span className="ms-auto bg-historical-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                                    {(item as any).badge}
                                                </span>
                                            )}

                                            {/* Arrow for non-active */}
                                            {!isActive && (
                                                <div className={cn(
                                                    "ms-auto opacity-0 group-hover:opacity-100 transition-opacity",
                                                    direction === 'rtl' ? "rotate-180" : ""
                                                )}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Footer / Account */}
                            <div className="relative p-4 border-t border-historical-gold/5 space-y-4">
                                <div className="px-2">
                                    <LanguageToggle />
                                </div>

                                <button className="w-full flex items-center p-3 rounded-2xl hover:bg-historical-stone transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-full bg-historical-blue text-white flex items-center justify-center shadow-lg shadow-historical-blue/20 transition-transform group-hover:scale-110">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="ms-4 text-start">
                                        <p className="text-sm font-bold text-gray-800">{t.sidebar.profile}</p>
                                        <p className="text-[10px] text-gray-400">{t.sidebar.orders}</p>
                                    </div>
                                    <div className={cn("ms-auto text-gray-300", direction === 'rtl' ? "rotate-180" : "")}>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
