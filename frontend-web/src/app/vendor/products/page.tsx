'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
    const { t, dir } = useTranslation();
    const [search, setSearch] = useState("");

    const DUMMY_PRODUCTS = [
        {
            id: 1,
            name: dir === 'rtl' ? "حذاء رياضي فيفي - أزرق ملكي" : "Fifi Sneakers - Royal Blue",
            category: dir === 'rtl' ? "أحذية أطفال" : "Kids Shoes",
            price: dir === 'rtl' ? "125,000 ل.س" : "125,000 SYP",
            stock: 24,
            status: "active",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop"
        },
        {
            id: 2,
            name: dir === 'rtl' ? "حقيبة يد جلدية - سوفت كوليكشن" : "Leather Handbag - Soft Collection",
            category: dir === 'rtl' ? "حقائب نسائية" : "Women Bags",
            price: dir === 'rtl' ? "350,000 ل.س" : "350,000 SYP",
            stock: 0,
            status: "out_of_stock",
            image: "https://images.unsplash.com/photo-1584917033904-493bb3c3cc08?w=100&h=100&fit=crop"
        },
        {
            id: 3,
            name: dir === 'rtl' ? "قميص صيفي قطني - رجالي" : "Summer Cotton Shirt - Men",
            category: dir === 'rtl' ? "ملابس رجالية" : "Men's Clothing",
            price: dir === 'rtl' ? "85,000 ل.س" : "85,000 SYP",
            stock: 12,
            status: "draft",
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"
        },
        {
            id: 4,
            name: dir === 'rtl' ? "فستان سهرة مطرز" : "Embroidered Evening Dress",
            category: dir === 'rtl' ? "ملابس نسائية" : "Women's Clothing",
            price: dir === 'rtl' ? "1,200,000 ل.س" : "1,200,000 SYP",
            stock: 5,
            status: "active",
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=100&h=100&fit=crop"
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return "bg-green-100 text-green-700 border-green-200";
            case 'out_of_stock': return "bg-red-100 text-red-700 border-red-200";
            case 'draft': return "bg-gray-100 text-gray-700 border-gray-200";
            default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle2 className="w-3 h-3" />;
            case 'out_of_stock': return <AlertCircle className="w-3 h-3" />;
            case 'draft': return <Clock className="w-3 h-3" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-historical-charcoal dark:text-gray-100 tracking-tight flex items-center gap-3 transition-colors duration-300">
                        <Package className="w-8 h-8 text-[#C5A065] dark:text-yellow-400 transition-colors duration-300" />
                        {t.vendor.products}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors duration-300">
                        {t.vendor.manageProductsDesc}
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-historical-gold/10 dark:bg-yellow-900/20 text-[#C5A065] dark:text-yellow-400 font-black rounded-2xl hover:bg-historical-gold/20 dark:hover:bg-yellow-900/30 hover:scale-105 transition-all shadow-xl shadow-historical-gold/10 dark:shadow-yellow-900/20 group">
                    <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                    {t.vendor.addProduct}
                </button>
            </div>

            {/* Filters & Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#C5A065] transition-colors",
                        dir === 'rtl' ? "right-4" : "left-4"
                    )} />
                    <input
                        type="text"
                        placeholder={t.vendor.searchProducts}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(
                            "w-full h-14 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#C5A065]/5 focus:border-[#C5A065]/30 outline-none transition-all",
                            dir === 'rtl' ? "pr-12 pl-6" : "pl-12 pr-6"
                        )}
                    />
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 h-14 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                        <Filter className="w-5 h-5" />
                        {t.vendor.filter}
                    </button>
                    <button className="flex items-center gap-2 px-6 h-14 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                        <ArrowUpDown className="w-5 h-5" />
                        {t.vendor.sort}
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.product}</th>
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.category}</th>
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.price}</th>
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.stock}</th>
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.status}</th>
                                <th className={cn("px-8 py-5 text-[11px] font-black uppercase text-gray-400 tracking-[2px]", dir === 'rtl' ? "text-right" : "text-left")}>{t.vendor.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {DUMMY_PRODUCTS.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 group-hover:scale-110 transition-transform">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("font-bold text-[#0A0A0B] line-clamp-1", dir === 'rtl' ? "text-right" : "text-left")}>
                                                    {product.name}
                                                </span>
                                                <span className={cn("text-xs text-gray-400 font-medium mt-0.5", dir === 'rtl' ? "text-right" : "text-left")}>ID: #P-283{product.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cn("px-8 py-6 text-sm font-bold text-gray-600", dir === 'rtl' ? "text-right" : "text-left")}>
                                        <span className="bg-gray-100 px-3 py-1 rounded-lg">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                                        <span className="font-black text-[#0A0A0B]">
                                            {product.price}
                                        </span>
                                    </td>
                                    <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                                        <div className="flex flex-col gap-1">
                                            <span className={cn(
                                                "font-bold text-sm",
                                                product.stock === 0 ? "text-red-500" : "text-gray-700"
                                            )}>
                                                {product.stock} {t.vendor.unit}
                                            </span>
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        product.stock === 0 ? "bg-red-500 w-0" :
                                                            product.stock < 10 ? "bg-orange-500 w-1/3" : "bg-green-500 w-full"
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cn("px-8 py-6", dir === 'rtl' ? "text-right" : "text-left")}>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black border",
                                            getStatusStyle(product.status)
                                        )}>
                                            {getStatusIcon(product.status)}
                                            {product.status === 'active' ? t.vendor.activeStatus :
                                                product.status === 'out_of_stock' ? t.vendor.outOfStockStatus :
                                                    t.vendor.draftStatus}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all justify-center">
                                            <button className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-white hover:border-[#C5A065]/30 hover:text-[#C5A065] transition-all text-gray-400">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-white hover:border-red-100 hover:text-red-500 transition-all text-gray-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {t.vendor.showingItems.replace('{start}', '1').replace('{end}', '4').replace('{total}', '42')}
                    </span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-400 cursor-not-allowed">
                            {t.vendor.previous}
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-black text-[#0A0A0B] hover:border-[#C5A065]">
                            {t.vendor.next}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
