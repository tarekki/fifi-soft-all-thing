'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Send, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-white border-t border-stone-100 pt-16 pb-8 text-stone-600 font-sans mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-historical-red rounded-xl flex items-center justify-center text-historical-gold font-bold text-xl shadow-sm rotate-3">
                                YB
                            </div>
                            <div>
                                <span className="font-display font-bold text-2xl text-historical-blue tracking-tight">
                                    Yalla<span className="text-historical-red">Buy</span>
                                </span>
                                <p className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">E-Commerce</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-stone-500">
                            {t.footer.description}
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-stone-900 mb-6 text-lg">{t.footer.quickLinks}</h4>
                        <ul className="space-y-4 text-sm">
                            {[
                                { label: t.footer.about, href: '#' },
                                { label: t.footer.faq, href: '#' },
                                { label: t.footer.privacy, href: '#' },
                                { label: t.footer.terms, href: '#' },
                                { label: t.footer.joinSeller, href: '#' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-historical-red transition-colors flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-stone-900 mb-6 text-lg">{t.footer.contactUs}</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-historical-gold shrink-0" />
                                <span>{t.footer.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-historical-gold shrink-0" />
                                <span dir="ltr">+963 11 123 4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-historical-gold shrink-0" />
                                <span>support@yallabuy.sy</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter & App */}
                    <div>
                        <h4 className="font-bold text-stone-900 mb-6 text-lg">{t.footer.newsletter}</h4>
                        <p className="text-sm text-stone-500 mb-4">{t.footer.newsletterDesc}</p>
                        <div className="flex gap-2 mb-8">
                            <input
                                type="email"
                                placeholder={t.footer.emailPlaceholder}
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-historical-gold/20"
                            />
                            <button className="bg-historical-blue text-white p-2.5 rounded-xl hover:bg-historical-red transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-stone-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-400">
                    <p>© {new Date().getFullYear()} {t.footer.rights}</p>
                    <div className="flex items-center gap-4 grayscale opacity-70">
                        {/* Payment Icons Placeholder */}
                        <div className="h-6 w-10 bg-stone-200 rounded" />
                        <div className="h-6 w-10 bg-stone-200 rounded" />
                        <div className="h-6 w-10 bg-stone-200 rounded" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
