'use client'

/**
 * AdminSearchModal Component
 * مودال البحث العالمي للإدارة
 * 
 * This component provides a global command palette (Ctrl+K) for searching
 * products, orders, users, and vendors.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    X,
    Package,
    ShoppingCart,
    Users,
    Store,
    ArrowRight,
    Command,
    Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n/context'
import { searchGlobal } from '@/lib/admin/api'
import type { GlobalSearchResult } from '@/lib/admin/types'

export function AdminSearchModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<GlobalSearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { t, language } = useLanguage()
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    // Open/Close handlers
    const openSearch = useCallback(() => {
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    const closeSearch = useCallback(() => {
        setIsOpen(false)
        setQuery('')
        setResults([])
    }, [])

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                if (isOpen) closeSearch()
                else openSearch()
            }
            if (e.key === 'Escape' && isOpen) {
                closeSearch()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, openSearch, closeSearch])

    // Search logic with debounce
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setIsLoading(true)
            try {
                const res = await searchGlobal(query)
                if (res.success && res.data) {
                    setResults(res.data.results)
                    setSelectedIndex(0)
                }
            } catch (err) {
                console.error('Search error:', err)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Navigation logic
    const handleSelect = useCallback((item: GlobalSearchResult) => {
        router.push(item.url)
        closeSearch()
    }, [router, closeSearch])

    // Accessibility & Arrow navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex])
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'product': return <Package className="w-5 h-5 text-blue-500" />
            case 'order': return <ShoppingCart className="w-5 h-5 text-green-500" />
            case 'user': return <Users className="w-5 h-5 text-purple-500" />
            case 'vendor': return <Store className="w-5 h-5 text-orange-500" />
            default: return <Search className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <>
            {/* Trigger Button (Invisible, but allows searching for a visible toggle in Header) */}
            <button
                onClick={openSearch}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-historical-charcoal/50 dark:text-gray-400 bg-historical-charcoal/5 dark:bg-gray-800/50 rounded-lg border border-historical-charcoal/10 dark:border-gray-700 hover:border-historical-gold/50 transition-all duration-300"
            >
                <Search className="w-4 h-4" />
                <span>{t.admin.header.search}</span>
                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-historical-charcoal/10 dark:bg-gray-700 rounded border border-historical-charcoal/10 dark:border-gray-600">
                    <Command className="w-2.5 h-2.5" />
                    <span>K</span>
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeSearch}
                            className="absolute inset-0 bg-historical-charcoal/40 dark:bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-historical-gold/20 dark:border-gray-700 overflow-hidden"
                        >
                            {/* Searchbox */}
                            <div className="flex items-center gap-3 p-4 border-b border-historical-charcoal/5 dark:border-gray-800">
                                <Search className="w-6 h-6 text-historical-gold" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.admin.header.globalSearch.placeholder}
                                    className="flex-1 bg-transparent border-none outline-none text-lg text-historical-charcoal dark:text-gray-100 placeholder:text-historical-charcoal/30 dark:placeholder:text-gray-500"
                                />
                                <button
                                    onClick={closeSearch}
                                    className="p-1 hover:bg-historical-charcoal/5 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center p-12 gap-3">
                                        <Loader2 className="w-8 h-8 text-historical-gold animate-spin" />
                                        <p className="text-sm text-gray-500">{t.admin.header.globalSearch.searching}</p>
                                    </div>
                                ) : results.length > 0 ? (
                                    <div className="p-2">
                                        {results.map((item, index) => (
                                            <motion.div
                                                key={`${item.type}-${item.id}`}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                onClick={() => handleSelect(item)}
                                                className={`
                          group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200
                          ${index === selectedIndex ? 'bg-historical-gold/10 dark:bg-historical-gold/5' : 'hover:bg-historical-charcoal/5 dark:hover:bg-gray-800/50'}
                        `}
                                            >
                                                <div className={`
                          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden
                          ${item.image ? '' : 'bg-historical-charcoal/5 dark:bg-gray-800'}
                        `}>
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                    ) : getIcon(item.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-historical-gold opacity-70">
                                                            {item.type}
                                                        </span>
                                                        {item.status && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.status === 'delivered' || item.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-historical-charcoal dark:text-gray-200 truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-historical-charcoal/50 dark:text-gray-400 truncate">
                                                        {item.subtitle}
                                                    </p>
                                                </div>

                                                <ArrowRight className={`
                          w-5 h-5 text-historical-gold transition-all duration-300
                          ${index === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                        `} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : query.length >= 2 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-historical-charcoal dark:text-gray-200 font-semibold mb-1">
                                            {t.admin.header.globalSearch.noResults}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t.admin.header.globalSearch.noResultsMsg}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-gray-400">
                                            {t.admin.header.globalSearch.startTyping}
                                        </p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                            {['Products', 'Orders', 'Users', 'Vendors'].map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full border border-gray-200 dark:border-gray-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Shortcut Help */}
                            <div className="p-3 bg-historical-charcoal/5 dark:bg-gray-800/30 border-t border-historical-charcoal/5 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↵</kbd>
                                        {t.admin.header.globalSearch.select}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↑↓</kbd>
                                        {t.admin.header.globalSearch.navigate}
                                    </span>
                                </div>
                                <div>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">ESC</kbd>
                                    <span className="ml-1">{t.admin.header.globalSearch.close}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
