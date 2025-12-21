/**
 * Utility Functions
 * دوال مساعدة
 * 
 * Common utility functions used throughout the application
 * دوال مساعدة مشتركة مستخدمة في جميع أنحاء التطبيق
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 * دمج فئات Tailwind CSS
 * 
 * Combines clsx and tailwind-merge to handle class conflicts
 * يجمع clsx و tailwind-merge للتعامل مع تعارضات الفئات
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * Example:
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

