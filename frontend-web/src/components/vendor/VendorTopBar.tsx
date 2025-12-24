import React from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cn } from '@/lib/utils';
import { Search, Bell, Menu, ExternalLink, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { LanguageToggle } from '@/components/common/LanguageToggle';

export const VendorTopBar = () => {
    const { t, dir } = useTranslation();
    const pathname = usePathname();
    const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleVendorSidebar);

    // Get current page title from pathname
    const getPageTitle = () => {
        const parts = pathname.split('/');
        const lastPart = parts[parts.length - 1];
        // Special case for root vendor path or dashboard
        if (lastPart === 'vendor' || lastPart === 'dashboard') return t.vendor.dashboard;
        return t.vendor[lastPart as keyof typeof t.vendor] || lastPart;
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-40 flex items-center h-20 px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-500 ease-in-out",
                dir === 'rtl'
                    ? (isCollapsed ? "mr-20" : "mr-72")
                    : (isCollapsed ? "ml-20" : "ml-72")
            )}
        >
            <div className="flex items-center justify-between w-full">
                {/* Left: Title & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => toggleSidebar()}
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-[#0A0A0B] hover:bg-gray-100 transition-all"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-[#0A0A0B] tracking-tight">
                            {getPageTitle()}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            <span>{t.common.appName}</span>
                            <span className="opacity-30">/</span>
                            <span className="text-[#C5A065]">{getPageTitle()}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* View Website */}
                    <a
                        href="/"
                        target="_blank"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-[#0A0A0B] hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t.vendor.viewStore}
                    </a>

                    <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                    {/* Language Toggle */}
                    <div className="scale-90 flex-shrink-0">
                        <LanguageToggle />
                    </div>

                    <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

                    {/* Notifications */}
                    <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all group">
                        <Bell className="w-5 h-5 text-gray-500 group-hover:text-[#0A0A0B] transition-colors" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                    </button>

                    {/* Theme Toggle Placeholder */}
                    <button className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all group">
                        <Sun className="w-5 h-5 text-gray-500 group-hover:text-[#0A0A0B] transition-colors" />
                    </button>
                </div>
            </div>
        </header>
    );
};
