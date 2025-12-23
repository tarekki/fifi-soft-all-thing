'use client';

import { Truck, ShieldCheck, Headphones, Smartphone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function TrustStrip() {
    const { t } = useTranslation();

    const features = [
        {
            icon: Truck,
            title: t.trust.fastDelivery,
            description: t.trust.fastDeliveryDesc
        },
        {
            icon: ShieldCheck,
            title: t.trust.securePayment,
            description: t.trust.securePaymentDesc
        },
        {
            icon: Headphones,
            title: t.trust.support,
            description: t.trust.supportDesc
        },
        {
            icon: Smartphone,
            title: t.trust.easyShop,
            description: t.trust.easyShopDesc
        }
    ];

    return (
        <section className="py-12 px-4 container mx-auto mb-12">
            <div className="bg-white/60 backdrop-blur-md border border-stone-200 rounded-[2rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                            <div className="w-14 h-14 rounded-2xl bg-historical-stone flex items-center justify-center text-historical-gold group-hover:bg-historical-gold group-hover:text-white transition-all duration-300 shadow-sm">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-800 text-sm mb-1">{feature.title}</h3>
                                <p className="text-xs text-stone-500">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
