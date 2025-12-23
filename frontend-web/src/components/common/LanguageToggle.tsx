'use client';

import { useLanguage } from '@/lib/i18n/context';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-historical-stone border border-stone-200 text-stone-600 hover:text-historical-gold hover:border-historical-gold/50 transition-all text-sm font-medium"
            title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
        >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>
    );
}
