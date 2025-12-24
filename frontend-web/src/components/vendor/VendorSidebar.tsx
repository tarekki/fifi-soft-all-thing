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
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
            active
                ? "bg-gradient-to-r from-[#C5A065]/20 to-transparent border-r-4 border-[#C5A065] text-[#C5A065]"
                : "text-gray-400 hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0 border-r-0"
        )}
        title={collapsed ? label : ""}
    >
        <Icon className={cn(
            "w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0",
            active ? "text-[#C5A065]" : "text-gray-500 group-hover:text-[#C5A065]"
        )} />
        {!collapsed && <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}

        {collapsed && active && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C5A065] rounded-l-full shadow-[0_0_10px_rgba(197,160,101,0.5)]" />
        )}
    </Link>
);

export const VendorSidebar = () => {
    const pathname = usePathname();
    const { t, dir } = useTranslation();
    const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleVendorSidebar);

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
                "fixed inset-y-0 z-50 flex flex-col bg-[#0A0A0B] border-white/5 transition-all duration-500 ease-in-out",
                isCollapsed ? "w-20" : "w-72",
                dir === 'rtl' ? "right-0 border-l" : "left-0 border-r"
            )}
        >
            {/* Brand Header */}
            <div className={cn("p-8 transition-all duration-500", isCollapsed && "p-5")}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C5A065] to-[#8A6D3B] rounded-xl flex items-center justify-center shadow-lg shadow-[#C5A065]/20 transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0">
                        <Store className="w-6 h-6 text-[#0A0A0B]" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col transition-all duration-300">
                            <span className="text-xl font-black tracking-tight text-white line-height-1">
                                Yalla<span className="text-[#C5A065]">Buy</span>
                            </span>
                            <span className="text-[10px] text-[#C5A065] font-bold tracking-widest uppercase">
                                SELLER HUB
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className={cn("flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar transition-all duration-300", isCollapsed && "px-2")}>
                {!isCollapsed && (
                    <div className="mb-4 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-[2px]">
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
            <div className={cn("p-4 mt-auto transition-all duration-300", isCollapsed && "p-2")}>
                <div className={cn("bg-white/5 rounded-2xl p-4 border border-white/10 transition-all duration-300", isCollapsed && "p-2 rounded-xl")}>
                    <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "mb-0 justify-center")}>
                        <div className="w-10 h-10 rounded-full bg-[#C5A065] flex items-center justify-center text-[#0A0A0B] font-bold text-lg shrink-0">
                            T
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden transition-all duration-300">
                                <span className="text-sm font-bold text-white truncate">
                                    {dir === 'rtl' ? 'متجر طارق' : "Tarek's Store"}
                                </span>
                                <span className="text-[10px] text-green-500 flex items-center gap-1 font-bold italic uppercase">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    {t.vendor.active}
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/20">
                            <LogOut className="w-4 h-4" />
                            {t.common.logout}
                        </button>
                    )}
                </div>

                {/* Collapse Toggle Button (Inside Sidebar for desktop) */}
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "hidden lg:flex mt-4 w-full items-center justify-center p-2 rounded-xl border border-white/5 text-gray-500 hover:text-[#C5A065] hover:bg-white/5 transition-all group",
                        isCollapsed && "mt-2"
                    )}
                >
                    {isCollapsed ? (
                        dir === 'rtl' ? <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    ) : (
                        dir === 'rtl' ? <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    )}
                </button>
            </div>
        </aside>
    );
};
