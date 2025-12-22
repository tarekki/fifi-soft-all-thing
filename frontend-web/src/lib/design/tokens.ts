/**
 * Design Tokens - Enterprise Marketplace UI
 * توكينات التصميم - واجهة السوق الإلكتروني
 * 
 * Centralized design system configuration
 * إعدادات نظام التصميم المركزي
 * 
 * This file contains all design tokens:
 * - Colors (Palette, Semantic Colors)
 * - Typography (Font Families, Sizes, Weights, Line Heights)
 * - Spacing (Consistent spacing scale)
 * - Shadows (Elevation system)
 * - Borders (Radius, Width)
 * - Transitions (Animation timings)
 * 
 * هذا الملف يحتوي على جميع توكينات التصميم:
 * - الألوان (لوحة الألوان، الألوان الدلالية)
 * - الطباعة (عائلات الخطوط، الأحجام، الأوزان، ارتفاعات الأسطر)
 * - المسافات (مقياس المسافات المتسق)
 * - الظلال (نظام الارتفاع)
 * - الحدود (نصف القطر، العرض)
 * - الانتقالات (توقيتات الرسوم المتحركة)
 * 
 * Security:
 * - All values are type-safe
 * - No user input accepted
 * - Constants only
 * 
 * الأمان:
 * - جميع القيم آمنة من ناحية الأنواع
 * - لا يتم قبول إدخال المستخدم
 * - ثوابت فقط
 */

/**
 * Color Palette
 * لوحة الألوان
 * 
 * Soft neutral background with one accent color
 * خلفية محايدة ناعمة مع لون مميز واحد
 */
export const colors = {
  // Neutral Colors (Soft, Calm Background)
  // الألوان المحايدة (خلفية ناعمة وهادئة)
  neutral: {
    50: '#FAFAFA', // Off-white background
    100: '#F5F5F5', // Light gray background
    200: '#E5E7EB', // Border color
    300: '#D1D5DB', // Subtle borders
    400: '#9CA3AF', // Muted text
    500: '#6B7280', // Default text
    600: '#4B5563', // Dark text
    700: '#374151', // Darker text
    800: '#1F2937', // Very dark text
    900: '#111827', // Almost black
  },

  // Accent Color (Muted Orange - can be changed to modern blue or calm green)
  // اللون المميز (برتقالي خفيف - يمكن تغييره إلى أزرق حديث أو أخضر هادئ)
  accent: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF8A65', // Primary accent (Muted Orange)
    600: '#FF7043',
    700: '#F4511E',
    800: '#E64A19',
    900: '#D84315',
  },

  // Alternative Accent Colors (for future use)
  // ألوان مميزة بديلة (للاستخدام المستقبلي)
  accentBlue: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6', // Modern Blue
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  accentGreen: {
    50: '#F1F8E9',
    100: '#DCEDC8',
    200: '#C5E1A5',
    300: '#AED581',
    400: '#9CCC65',
    500: '#81C784', // Calm Green
    600: '#66BB6A',
    700: '#4CAF50',
    800: '#43A047',
    900: '#388E3C',
  },

  // Semantic Colors (Status, Actions)
  // الألوان الدلالية (الحالة، الإجراءات)
  semantic: {
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#22C55E', // Success green
      600: '#16A34A',
      700: '#15803D',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B', // Warning amber
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444', // Error red
      600: '#DC2626',
      700: '#B91C1C',
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6', // Info blue
      600: '#2563EB',
      700: '#1D4ED8',
    },
  },

  // Background Colors
  // ألوان الخلفية
  background: {
    primary: '#FAFAFA', // Off-white (soft neutral)
    secondary: '#FFFFFF', // Pure white
    tertiary: '#F8F9FA', // Light gray
    muted: '#F5F5F5', // Very light gray
  },

  // Text Colors
  // ألوان النص
  text: {
    primary: '#111827', // Almost black (high contrast)
    secondary: '#374151', // Dark gray
    tertiary: '#6B7280', // Medium gray
    muted: '#9CA3AF', // Light gray (disabled)
    inverse: '#FFFFFF', // White (for dark backgrounds)
  },
} as const

/**
 * Typography Scale
 * مقياس الطباعة
 * 
 * Premium modern sans-serif with high readability
 * خط sans-serif حديث ومميز مع قابلية قراءة عالية
 */
export const typography = {
  // Font Families
  // عائلات الخطوط
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
    display: [
      'Poppins',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ],
  },

  // Font Sizes
  // أحجام الخطوط
  fontSize: {
    // Display (Large Headings)
    // العرض (عناوين كبيرة)
    'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 72px
    'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 60px
    'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 48px
    'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 36px

    // Headings
    // العناوين
    'heading-1': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }], // 32px
    'heading-2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }], // 28px
    'heading-3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }], // 24px
    'heading-4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }], // 20px

    // Body
    // النص الأساسي
    'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }], // 18px
    'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }], // 16px
    'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }], // 14px

    // Small
    // صغير
    'small': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }], // 12px
    'caption': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.01em' }], // 10px
  },

  // Font Weights
  // أوزان الخطوط
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  // ارتفاعات الأسطر
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8',
  },

  // Letter Spacing
  // تباعد الأحرف
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em',
  },
} as const

/**
 * Spacing Scale
 * مقياس المسافات
 * 
 * Generous spacing with consistent scale
 * مسافات واسعة بمقياس متسق
 */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
} as const

/**
 * Shadows (Elevation System)
 * الظلال (نظام الارتفاع)
 * 
 * Subtle shadows for depth without heaviness
 * ظلال خفيفة للعمق بدون ثقل
 */
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)', // Default card shadow
  lg: '0 4px 12px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
  '2xl': '0 12px 32px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const

/**
 * Border Radius
 * نصف قطر الحدود
 * 
 * Rounded corners for modern, premium feel
 * زوايا مستديرة لمظهر حديث ومميز
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px', // Fully rounded
} as const

/**
 * Border Width
 * عرض الحدود
 */
export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

/**
 * Transitions & Animations
 * الانتقالات والرسوم المتحركة
 * 
 * Smooth micro-interactions
 * تفاعلات دقيقة سلسة
 */
export const transitions = {
  // Durations
  // المدد
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Timing Functions
  // دوال التوقيت
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Premium smooth
  },

  // Default Transition
  // الانتقال الافتراضي
  default: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const

/**
 * Z-Index Scale
 * مقياس Z-Index
 * 
 * Layering system for proper stacking
 * نظام الطبقات للتراص الصحيح
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

/**
 * Breakpoints (Responsive Design)
 * نقاط التوقف (التصميم المتجاوب)
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Component-Specific Tokens
 * توكينات خاصة بالمكونات
 */

// Product Card Tokens
// توكينات بطاقة المنتج
export const productCard = {
  borderRadius: borderRadius.xl, // 16px
  padding: spacing[4], // 16px
  shadow: shadows.md, // Soft shadow
  hoverShadow: shadows.lg, // Elevated on hover
  hoverScale: '1.02', // Subtle scale on hover
  transition: transitions.default,
  imageAspectRatio: '1 / 1', // Square images
} as const

// Button Tokens
// توكينات الأزرار
export const buttons = {
  borderRadius: {
    sm: borderRadius.md, // 8px
    md: borderRadius.lg, // 12px
    lg: borderRadius.xl, // 16px
  },
  padding: {
    sm: `${spacing[2]} ${spacing[4]}`, // 8px 16px
    md: `${spacing[3]} ${spacing[6]}`, // 12px 24px
    lg: `${spacing[4]} ${spacing[8]}`, // 16px 32px
  },
  fontSize: {
    sm: typography.fontSize['body-sm'][0], // 14px
    md: typography.fontSize['body-md'][0], // 16px
    lg: typography.fontSize['body-lg'][0], // 18px
  },
  fontWeight: typography.fontWeight.medium,
  transition: transitions.default,
} as const

// Badge Tokens
// توكينات الشارات
export const badges = {
  borderRadius: borderRadius.full, // Fully rounded
  padding: {
    sm: `${spacing[1]} ${spacing[2]}`, // 4px 8px
    md: `${spacing[2]} ${spacing[3]}`, // 8px 12px
  },
  fontSize: typography.fontSize.small[0], // 12px
  fontWeight: typography.fontWeight.semibold,
} as const

// Navigation Tokens
// توكينات التنقل
export const navigation = {
  height: '4rem', // 64px
  stickyZIndex: zIndex.sticky,
  backgroundColor: colors.background.secondary, // White
  borderBottom: `1px solid ${colors.neutral[200]}`, // Light border
  shadow: shadows.sm,
} as const

// Export all tokens as a single object
// تصدير جميع التوكينات ككائن واحد
export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  borderWidth,
  transitions,
  zIndex,
  breakpoints,
  productCard,
  buttons,
  badges,
  navigation,
} as const

// Type exports for TypeScript
// تصدير الأنواع لـ TypeScript
export type DesignTokens = typeof designTokens
export type ColorPalette = typeof colors
export type TypographyScale = typeof typography
export type SpacingScale = typeof spacing

