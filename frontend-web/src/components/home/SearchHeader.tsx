'use client';

import { Search, Bell, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

import { useCart } from '@/lib/cart/context';

export function SearchHeader() {
    const { cartCount, setIsCartOpen } = useCart();

    return (
        <div className="sticky top-0 z-40 w-full px-4 lg:px-10 py-4 pointer-events-none">
            <div className="max-w-5xl mx-auto flex items-center gap-3 pointer-events-auto">
                {/* Search Bar */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex-1 relative shadow-lg rounded-full"
                >
                    <input
                        type="text"
                        placeholder="ابحث عن منتج، ماركة، أو فئة..."
                        className="w-full h-12 pl-4 pr-12 rounded-full border-none bg-white/90 backdrop-blur-md text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-historical-gold/50 shadow-sm"
                    />
                    <div className="absolute right-1 top-1 w-10 h-10 bg-historical-primary rounded-full flex items-center justify-center text-historical-gold">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                </motion.div>

                {/* Icons */}
                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-gray-600 hover:text-historical-blue transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-12 h-12 bg-historical-blue text-white rounded-full flex items-center justify-center shadow-lg hover:bg-historical-red transition-colors relative"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-historical-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
