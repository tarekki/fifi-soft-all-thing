'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Direction, translations } from './translations';

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: typeof translations.ar;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');
    const [direction, setDirection] = useState<Direction>('rtl');

    useEffect(() => {
        // Load from localStorage or default
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        setDirection(dir);
        localStorage.setItem('language', lang);
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    };

    // Update DOM on mount/change
    useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = language;
    }, [language, direction]);

    const value = {
        language,
        direction,
        setLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
