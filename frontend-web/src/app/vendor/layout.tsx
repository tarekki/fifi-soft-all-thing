'use client';

import type { ReactNode } from 'react';
import { VendorSidebar } from '@/components/vendor/VendorSidebar';
import { VendorTopBar } from '@/components/vendor/VendorTopBar';
import { useTranslation } from '@/lib/i18n/use-translation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

export default function VendorLayout({
  children,
}: {
  children: ReactNode
}) {
  const { dir } = useTranslation();
  const isCollapsed = useUIStore((state) => state.isVendorSidebarCollapsed);

  return (
    <div className="min-h-screen bg-gray-50/50" dir={dir}>
      {/* Heavy Duty Sidebar */}
      <VendorSidebar />

      {/* Main Container */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-500 ease-in-out",
          dir === 'rtl'
            ? (isCollapsed ? "pr-20" : "pr-72")
            : (isCollapsed ? "pl-20" : "pl-72")
        )}
      >
        {/* Navigation / Control Bar */}
        <VendorTopBar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

