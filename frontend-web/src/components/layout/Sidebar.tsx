'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, Percent, User, ChevronLeft, ChevronRight, Menu, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useCart } from '@/lib/cart/context';

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t, direction, language } = useTranslation();
    const { cartCount, setIsCartOpen } = useCart();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const navItems = [
        { name: t.sidebar.home, href: '/', icon: Home },
        { name: t.sidebar.brands, href: '/brands', icon: ShoppingBag },
        { name: t.sidebar.offers, href: '/offers', icon: Percent },
        { name: language === 'ar' ? 'السلة' : 'Cart', href: '/cart', icon: ShoppingCart, badge: cartCount },
        { name: t.sidebar.profile, href: '/profile', icon: User },
    ];

    return (
        <aside
            className={cn(
                "sticky top-0 h-screen bg-white/90 backdrop-blur-xl border-r border-historical-gold/10 shadow-xl z-50 transition-all duration-300 flex flex-col font-sans",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-texture opacity-10 pointer-events-none" />

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    "absolute top-8 bg-white border border-historical-gold/20 rounded-full p-1 shadow-md text-historical-blue hover:text-historical-red transition-colors z-50 lg:flex hidden",
                    direction === 'rtl' ? "-left-3" : "-right-3"
                )}
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {/* Arrow should flip based on direction */}
                {direction === 'rtl' ? (
                    // RTL (Right Sidebar): Expand -> Left, Collapse -> Right
                    isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                ) : (
                    // LTR (Left Sidebar): Expand -> Right, Collapse -> Left
                    isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                )}
            </button>

            {/* Logo Area */}
            <div className={cn("relative flex items-center border-b border-historical-gold/5 transition-all duration-300", isCollapsed ? "h-20 justify-center" : "h-24 px-6")}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 min-w-[2.5rem] bg-historical-red rounded-xl flex items-center justify-center text-historical-gold font-bold text-lg shadow-sm rotate-3">
                        YB
                    </div>
                    <div className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                        <span className="font-display font-bold text-xl text-historical-blue tracking-tight whitespace-nowrap">
                            Yalla<span className="text-historical-red">Buy</span>
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wide whitespace-nowrap">
                            {t.common.slogan}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                if (item.name === (language === 'ar' ? 'السلة' : 'Cart')) {
                                    e.preventDefault();
                                    setIsCartOpen(true);
                                }
                            }}
                            className={cn(
                                "group flex items-center rounded-xl transition-all duration-200 relative",
                                isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3",
                                "hover:bg-historical-stone hover:text-historical-red",
                                isActive
                                    ? "bg-historical-stone/50 text-historical-red font-semibold shadow-sm border border-historical-gold/10"
                                    : "text-gray-500 font-medium"
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon className={cn("w-6 h-6 min-w-[1.5rem]", isActive ? "text-historical-red" : "text-gray-400 group-hover:text-historical-red")} />

                            {/* Badge */}
                            {(item as any).badge > 0 && (
                                <span className={cn(
                                    "absolute top-2 bg-historical-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white",
                                    isCollapsed ? "w-4 h-4 right-2" : "w-5 h-5 right-4"
                                )}>
                                    {(item as any).badge}
                                </span>
                            )}

                            {!isCollapsed && (
                                <span className="ms-3 text-sm truncate">
                                    {item.name}
                                </span>
                            )}

                            {/* Active Indicator */}
                            {isActive && (
                                <div className={cn("absolute bg-historical-red rounded-full", isCollapsed ? "right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5" : "right-0 h-full w-1 rounded-l-none rounded-r-xl")} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Language Toggle & Footer */}
            <div className="relative p-3 border-t border-historical-gold/5 flex flex-col gap-2">
                {!isCollapsed && (
                    <div className="mb-2 px-2">
                        <LanguageToggle />
                    </div>
                )}

                <button className={cn("w-full flex items-center p-2 rounded-xl hover:bg-historical-stone transition-colors group", isCollapsed ? "justify-center" : "justify-start")}>
                    <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-historical-blue/5 text-historical-blue flex items-center justify-center border border-historical-blue/10">
                        <User className="w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="mr-3 text-right overflow-hidden">
                            <p className="text-sm font-bold text-gray-700 group-hover:text-historical-blue truncate">{t.sidebar.profile}</p>
                            <p className="text-[10px] text-gray-400 truncate">{t.sidebar.orders}</p>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}
