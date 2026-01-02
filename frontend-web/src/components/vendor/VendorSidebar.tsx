'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    BarChart3,
    Settings,
    Store,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';

import { useUIStore } from '@/store/uiStore';
import { useVendorAuth } from '@/lib/vendor/context';

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    collapsed: boolean;
}

const NavItem = ({ href, icon: Icon, label, active, collapsed }: NavItemProps) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out group relative",
            active
                ? "bg-gradient-to-l from-historical-gold/20 dark:from-historical-gold/30 to-historical-gold/5 dark:to-gray-700/50 text-historical-charcoal dark:text-gray-100 border-r-2 border-historical-gold dark:border-gray-600"
                : "text-historical-charcoal/70 dark:text-gray-300 hover:bg-historical-gold/10 dark:hover:bg-gray-700/50 hover:text-historical-charcoal dark:hover:text-gray-100",
            collapsed && "justify-center px-0 border-r-0"
        )}
        title={collapsed ? label : ""}
    >
        <Icon className={cn(
            "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
            active ? "text-historical-gold dark:text-yellow-400" : "text-historical-charcoal/70 dark:text-gray-300"
        )} />
        {!collapsed && <span className="whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}

        {collapsed && active && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-historical-gold dark:bg-yellow-400 rounded-l-full shadow-[0_0_10px_rgba(197,160,101,0.5)] dark:shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-colors duration-300" />
        )}
    </Link>
);

export const VendorSidebar = () => {
    const pathname = usePathname();
    const { t, dir } = useTranslation();
    const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleVendorSidebar);
    const { vendor, logout } = useVendorAuth();

    // Get first letter of vendor name for avatar fallback
    // الحصول على الحرف الأول من اسم البائع كبديل للصورة
    const getVendorInitial = () => {
        if (!vendor?.name) return 'V';
        return vendor.name.charAt(0).toUpperCase();
    };

    const navItems = [
        { href: '/vendor/dashboard', icon: LayoutDashboard, label: t.vendor.dashboard },
        { href: '/vendor/products', icon: Package, label: t.vendor.products },
        { href: '/vendor/orders', icon: ShoppingBag, label: t.vendor.orders },
        { href: '/vendor/customers', icon: Users, label: t.vendor.customers },
        { href: '/vendor/analytics', icon: BarChart3, label: t.vendor.analytics },
        { href: '/vendor/settings', icon: Settings, label: t.vendor.settings },
    ];

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-l border-historical-gold/20 dark:border-gray-700 shadow-soft-xl overflow-hidden transition-colors duration-300",
                isCollapsed ? "w-20" : "w-72",
                dir === 'rtl' && "border-l-0 border-r border-historical-gold/20 dark:border-gray-700"
            )}
        >
            {/* Brand Header */}
            <div className={cn("flex items-center justify-between p-4 border-b border-historical-gold/10 dark:border-gray-700 transition-colors duration-300", isCollapsed && "flex-col gap-2")}>
                <Link href="/vendor/dashboard" className="flex items-center gap-3 group">
                    {vendor?.logo ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0 relative">
                            <img
                                src={vendor.logo}
                                alt={vendor.name || 'Vendor Logo'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback to default icon if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        parent.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-historical-gold to-historical-red dark:from-yellow-500 dark:to-red-600 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="flex flex-col transition-all duration-300">
                            <span className="text-xl font-bold text-historical-charcoal dark:text-gray-100 tracking-tight line-height-1 transition-colors duration-300">
                                {vendor?.name ? (
                                    vendor.name
                                ) : (
                                    <>
                                        Yalla<span className="text-historical-gold dark:text-yellow-400 transition-colors duration-300">Buy</span>
                                    </>
                                )}
                            </span>
                            <span className="text-[10px] text-historical-charcoal/50 dark:text-gray-400 font-bold tracking-widest uppercase transition-colors duration-300">
                                SELLER HUB
                            </span>
                        </div>
                    )}
                </Link>
                
                {/* Collapse Button */}
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "p-2 rounded-lg text-historical-charcoal/50 dark:text-gray-400 hover:text-historical-charcoal dark:hover:text-gray-200 hover:bg-historical-gold/10 dark:hover:bg-gray-700 transition-all duration-200",
                        isCollapsed && "mx-auto mt-2"
                    )}
                    title={isCollapsed ? (dir === 'rtl' ? 'توسيع القائمة' : 'Expand menu') : (dir === 'rtl' ? 'تصغير القائمة' : 'Collapse menu')}
                >
                    {isCollapsed ? (
                        dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                    ) : (
                        dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar transition-all duration-300", isCollapsed && "px-2")}>
                {!isCollapsed && (
                    <div className="mb-4 px-3 text-[11px] font-bold text-historical-charcoal/50 dark:text-gray-400 uppercase tracking-[2px] transition-colors duration-300">
                        {t.common.menu}
                    </div>
                )}
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        active={pathname === item.href}
                        collapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* Bottom Profile Section */}
            <div className={cn("p-3 border-t border-historical-gold/10 dark:border-gray-700 transition-colors duration-300", isCollapsed && "p-2")}>
                <div className={cn("flex items-center gap-3 px-3 py-2 rounded-xl bg-historical-gold/5 dark:bg-gray-700/50 transition-colors duration-300", isCollapsed && "justify-center")}>
                    {vendor?.logo ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative">
                            <img
                                src={vendor.logo}
                                alt={vendor.name || 'Vendor'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback to initial if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        parent.innerHTML = `<span class="text-white text-sm font-medium">${getVendorInitial()}</span>`;
                                        parent.className = "w-8 h-8 rounded-lg bg-gradient-to-br from-historical-gold to-historical-charcoal dark:from-yellow-500 dark:to-gray-700 flex items-center justify-center overflow-hidden shrink-0";
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-historical-gold to-historical-charcoal dark:from-yellow-500 dark:to-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                            <span className="text-white text-sm font-medium">{getVendorInitial()}</span>
                        </div>
                    )}
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-historical-charcoal dark:text-gray-200 truncate transition-colors duration-300">
                                {vendor?.name || t.vendor.store}
                            </p>
                            <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate transition-colors duration-300 flex items-center gap-1">
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    vendor?.is_active 
                                        ? "bg-green-500 dark:bg-green-400" 
                                        : "bg-gray-400 dark:bg-gray-500"
                                )} />
                                {vendor?.is_active ? t.vendor.active : t.vendor.inactive}
                            </p>
                        </div>
                    )}
                </div>

                {!isCollapsed && (
                    <button 
                        onClick={logout}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    >
                        <LogOut className="w-4 h-4" />
                        {t.common.logout}
                    </button>
                )}
            </div>
        </aside>
    );
};
