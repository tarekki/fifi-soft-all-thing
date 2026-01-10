'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram, Twitter, Send, Mail, Phone, MapPin, Share2, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useSocialLinks, useSettings } from '@/lib/settings/context';
import type { SocialLink } from '@/types/settings';

export function Footer() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { socialLinks } = useSocialLinks();
    const { site, currentLanguage } = useSettings();

    // Don't show public footer on vendor or admin pages
    if (pathname.startsWith('/vendor') || pathname.startsWith('/admin')) {
        return null;
    }

    // Platform icons - All platforms supported in admin dashboard
    // أيقونات المنصات - جميع المنصات المدعومة في الأدمن داشبورد
    const getPlatformIcon = (platform: string) => {
        const platformLower = platform.toLowerCase();
        
        // Facebook
        if (platformLower.includes('facebook')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            );
        }
        
        // Instagram
        if (platformLower.includes('instagram')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
            );
        }
        
        // Twitter / X
        if (platformLower.includes('twitter') || platformLower.includes('x')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            );
        }
        
        // YouTube
        if (platformLower.includes('youtube')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            );
        }
        
        // TikTok
        if (platformLower.includes('tiktok')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
            );
        }
        
        // LinkedIn
        if (platformLower.includes('linkedin')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            );
        }
        
        // WhatsApp
        if (platformLower.includes('whatsapp')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            );
        }
        
        // Telegram
        if (platformLower.includes('telegram')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15.056-.216s.084-.13.133-.08c.06.053.38 2.35.525 3.214.06.31.126.41.203.41.57 0 1.598-1.06 2.18-1.52.79-.63 1.384-1.28 1.247-1.49-.11-.16-.39-.24-.83-.39z"/>
                </svg>
            );
        }
        
        // Snapchat
        if (platformLower.includes('snapchat')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.122.112.228.083.351l-.334 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/>
                </svg>
            );
        }
        
        // Pinterest
        if (platformLower.includes('pinterest')) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.122.112.228.083.351l-.334 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641 0 12.017 0z"/>
                </svg>
            );
        }
        
        // Other / Default
        return (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
        );
    };

    // Backend already filters by is_active=True, so use all links from API
    // الباك إند يفلتر بالفعل بـ is_active=True، لذا استخدم جميع الروابط من API
    // No additional filtering needed - backend handles it
    // لا حاجة لفلترة إضافية - الباك إند يتعامل معها
    const displaySocialLinks = socialLinks;

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
                            {displaySocialLinks
                                .sort((a, b) => a.order - b.order)
                                .map((socialLink) => {
                                    // Use the URL from API, or '#' as fallback
                                    // استخدام الرابط من API، أو '#' كاحتياطي
                                    const url = (socialLink.url && socialLink.url.trim() !== '' && socialLink.url !== '#') 
                                        ? socialLink.url 
                                        : '#';
                                    
                                    return (
                                        <a
                                            key={socialLink.id}
                                            href={url}
                                            target={socialLink.open_in_new_tab ? '_blank' : '_self'}
                                            rel={socialLink.open_in_new_tab ? 'noopener noreferrer' : undefined}
                                            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-historical-gold hover:text-white transition-all"
                                            aria-label={socialLink.name || socialLink.platform_display}
                                        >
                                            {getPlatformIcon(socialLink.platform)}
                                        </a>
                                    );
                                })}
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
                            {/* Address - العنوان */}
                            {site?.address || site?.address_ar ? (
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-historical-gold shrink-0 mt-0.5" />
                                    <span>
                                        {currentLanguage === 'ar' && site?.address_ar
                                            ? site.address_ar
                                            : site?.address || t.footer.address}
                                    </span>
                                </li>
                            ) : null}
                            
                            {/* Phone - الهاتف */}
                            {site?.contact_phone ? (
                                <li className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-historical-gold shrink-0" />
                                    <a 
                                        href={`tel:${site.contact_phone.replace(/\s/g, '')}`}
                                        className="hover:text-historical-red transition-colors"
                                        dir="ltr"
                                    >
                                        {site.contact_phone}
                                    </a>
                                </li>
                            ) : null}
                            
                            {/* WhatsApp - واتساب */}
                            {site?.contact_whatsapp ? (
                                <li className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-historical-gold shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    <a 
                                        href={`https://wa.me/${site.contact_whatsapp.replace(/\s/g, '').replace(/\+/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-historical-red transition-colors"
                                        dir="ltr"
                                    >
                                        {site.contact_whatsapp}
                                    </a>
                                </li>
                            ) : null}
                            
                            {/* Email - البريد الإلكتروني */}
                            {site?.contact_email ? (
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-historical-gold shrink-0" />
                                    <a 
                                        href={`mailto:${site.contact_email}`}
                                        className="hover:text-historical-red transition-colors"
                                    >
                                        {site.contact_email}
                                    </a>
                                </li>
                            ) : null}
                            
                            {/* Working Hours - ساعات العمل */}
                            {site?.working_hours || site?.working_hours_ar ? (
                                <li className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-historical-gold shrink-0 mt-0.5" />
                                    <span>
                                        {currentLanguage === 'ar' && site?.working_hours_ar
                                            ? site.working_hours_ar
                                            : site?.working_hours || ''}
                                    </span>
                                </li>
                            ) : null}
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
