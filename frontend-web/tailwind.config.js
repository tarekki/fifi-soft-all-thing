/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    // Exclude unnecessary paths to reduce memory usage
    // استبعاد المسارات غير الضرورية لتقليل استهلاك الذاكرة
    '!./src/**/*.test.{js,ts,jsx,tsx}',
    '!./src/**/*.spec.{js,ts,jsx,tsx}',
    '!./src/**/__tests__/**',
    '!./src/**/__mocks__/**',
    '!./src/**/node_modules/**',
    '!./src/**/.next/**',
    '!./src/**/dist/**',
    '!./src/**/build/**',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#8D5B4C', // Antique Copper (softer than red)
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#475569', // Slate (Professional neutral)
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: '#D4C4A8', // Champagne Gold (Lighter)
          foreground: '#1A1A1A',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Historical Syrian Palette (Light & Professional)
        'historical': {
          stone: '#FAFAF9', // Warm White
          gold: '#C5A065',  // Muted Antique Gold
          red: '#9E6D64',   // Dusty Clay/Rose (Not bright red)
          blue: '#556B85',  // Soft Slate Blue
          charcoal: '#2D2A26', // Warm Black
        },
      },
      fontFamily: {
        sans: [
          'Tajawal',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Tajawal',
          'Playfair Display',
          'serif',
        ],
      },
      fontSize: {
        // Display
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        // Headings
        'heading-1': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'heading-4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        // Body
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        // Small
        small: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        caption: ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      spacing: {
        // Extended spacing scale
        // مقياس المسافات الممتد
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        26: '6.5rem', // 104px
        30: '7.5rem', // 120px
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Design System Border Radius
        // نصف قطر الحدود لنظام التصميم
        'card': '1rem', // 16px for product cards
        'card-lg': '1.5rem', // 24px for larger cards
      },
      boxShadow: {
        // Design System Shadows
        // ظلال نظام التصميم
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)', // Default card shadow
        'soft-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Premium smooth
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

