'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
    TrendingUp,
    ShoppingBag,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Eye,
    MoreVertical,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StatCard = ({ stat, t }: { stat: any, t: any }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
        <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-16 -mt-16", stat.bg)} />
        <div className="flex items-center justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.up ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            )}>
                {stat.trend}
                {stat.up ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />}
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                {t.vendor[stat.labelKey]}
            </span>
            <span className="text-2xl font-black text-[#0A0A0B]">{stat.value}</span>
        </div>
    </div>
);

export default function DashboardPage() {
    const { t, dir } = useTranslation();

    const STATS = [
        {
            labelKey: 'totalSales',
            value: dir === 'rtl' ? '12,450,000 ل.س' : '12,450,000 SYP',
            trend: '+12.5%',
            up: true,
            icon: TrendingUp,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            labelKey: 'totalOrders',
            value: '154',
            trend: '+8.2%',
            up: true,
            icon: ShoppingBag,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            labelKey: 'activeProducts',
            value: '42',
            trend: 'Stable',
            up: true,
            icon: Package,
            color: 'text-[#C5A065]',
            bg: 'bg-[#C5A065]/10'
        },
        {
            labelKey: 'shopVisits',
            value: '3,842',
            trend: '-2.4%',
            up: false,
            icon: Users,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
    ];

    const RECENT_ORDERS = [
        { id: '#ORD-7281', customer: dir === 'rtl' ? 'أحمد المحمد' : 'Ahmad Al-Mohammad', date: dir === 'rtl' ? 'منذ ساعتين' : '2 hours ago', total: dir === 'rtl' ? '450,000 ل.س' : '450,000 SYP', status: 'Pending', statusAr: 'قيد الانتظار' },
        { id: '#ORD-7275', customer: dir === 'rtl' ? 'سارة العلي' : 'Sara Al-Ali', date: dir === 'rtl' ? 'منذ 5 ساعات' : '5 hours ago', total: dir === 'rtl' ? '120,000 ل.س' : '120,000 SYP', status: 'Shipping', statusAr: 'قيد الشحن' },
        { id: '#ORD-7260', customer: dir === 'rtl' ? 'ياسين خليل' : 'Yassin Khalil', date: dir === 'rtl' ? 'أمس' : 'Yesterday', total: dir === 'rtl' ? '890,000 ل.س' : '890,000 SYP', status: 'Completed', statusAr: 'مكتمل' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0A0A0B] tracking-tight">
                        {t.vendor.welcomeBack.replace('{name}', 'Tarek')}
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">
                        {t.vendor.performanceToday}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <History className="w-5 h-5" />
                        {t.vendor.exportReport}
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0B] text-[#C5A065] font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#0A0A0B]/20">
                        <Plus className="w-5 h-5" />
                        {t.vendor.addProduct}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, idx) => (
                    <StatCard key={idx} stat={stat} t={t} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-[#0A0A0B] flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-[#C5A065]" />
                            {t.vendor.recentOrders}
                        </h3>
                        <button className="text-xs font-bold text-[#C5A065] hover:underline uppercase tracking-widest">
                            {t.vendor.viewAll}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
                                    <th className="px-6 py-4">{t.vendor.orderId}</th>
                                    <th className="px-6 py-4">{t.vendor.customer}</th>
                                    <th className="px-6 py-4">{t.vendor.date}</th>
                                    <th className="px-6 py-4">{t.vendor.total}</th>
                                    <th className="px-6 py-4">{t.vendor.status}</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {RECENT_ORDERS.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-700">{order.id}</td>
                                        <td className="px-6 py-4 font-bold text-[#0A0A0B]">{order.customer}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 font-black">{order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[11px] font-bold tracking-wide",
                                                order.status === 'Completed' ? "bg-green-100 text-green-700" :
                                                    order.status === 'Shipping' ? "bg-blue-100 text-blue-700" :
                                                        "bg-orange-100 text-orange-700"
                                            )}>
                                                {dir === 'rtl' ? order.statusAr : order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-gray-100">
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Sidebar / Tips */}
                <div className="space-y-6">
                    <div className="bg-[#0A0A0B] p-6 rounded-3xl text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A065] opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-20 transition-opacity" />
                        <h4 className="text-[#C5A065] font-black uppercase tracking-widest text-xs mb-4">{t.vendor.tipOfDay}</h4>
                        <p className="font-medium text-gray-300 leading-relaxed">
                            {dir === 'rtl'
                                ? <>لقد نفذت كمية <b>"حذاء فيفي أطفال - أحمر"</b>. قم بتحديث المخزون الآن لضمان عدم ضياع أي طلبات محتملة.</>
                                : <>The stock for <b>"Fifi Kids Shoes - Red"</b> is out. Update inventory now to avoid losing potential orders.</>
                            }
                        </p>
                        <button className="mt-6 w-full py-3 bg-[#C5A065] text-[#0A0A0B] font-black rounded-xl hover:scale-105 transition-all text-sm">
                            {t.vendor.updateStock}
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">{t.vendor.responseSpeed}</h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#0A0A0B]">{t.vendor.responseRate}</span>
                            <span className="font-bold text-green-500">98%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="w-[98%] h-full bg-green-500 rounded-full" />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-4 italic font-medium">
                            {t.vendor.keepItUp}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
