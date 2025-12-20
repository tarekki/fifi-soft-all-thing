# Brand Identity & Design System

## Brand Analysis

### Fifi (Children's Shoes)
**Logo Analysis:**
- **Primary Color**: Vibrant Pink/Magenta (`#E91E63` - `#FF4081`)
- **Style**: Playful, youthful, energetic
- **Typography**: Bold, rounded, friendly
- **Target Audience**: Parents shopping for children (0-12 years)

**Brand Personality:**
- Fun & Cheerful
- Trustworthy & Safe
- Colorful & Vibrant

---

### Soft (Women's Shoes & Bags)
**Logo Analysis:**
- **Primary Color**: Deep Purple/Violet (`#6A1B9A` - `#9C27B0`)
- **Style**: Elegant, sophisticated, modern
- **Typography**: Clean, refined
- **Target Audience**: Women (18-45 years)

**Brand Personality:**
- Elegant & Stylish
- Premium Quality
- Feminine & Confident

---

## Unified Platform Design System

### Color Palette

#### Theme Strategy
**Base Theme**: Light & Airy (مريح للعين)
**Brand Pages**: Dynamic theming based on active brand

#### Primary Colors
```css
/* Fifi Brand Accent */
--fifi-primary: #E91E63;      /* Vibrant Pink */
--fifi-primary-light: #FFE5EF; /* Very light pink background */
--fifi-primary-dark: #C2185B;

/* Soft Brand Accent */
--soft-primary: #9C27B0;      /* Deep Purple */
--soft-primary-light: #F3E5F5; /* Very light purple background */
--soft-primary-dark: #7B1FA2;

/* Platform Base (Light Theme) */
--background-primary: #FFFFFF;    /* Pure white */
--background-secondary: #F8F9FA;  /* Soft gray */
--background-tertiary: #F1F3F5;   /* Slightly darker gray */
```

#### Neutral Colors (Shared)
```css
--neutral-50: #FAFAFA;
--neutral-100: #F5F5F5;
--neutral-200: #EEEEEE;
--neutral-300: #E0E0E0;
--neutral-400: #BDBDBD;
--neutral-500: #9E9E9E;
--neutral-600: #757575;
--neutral-700: #616161;
--neutral-800: #424242;
--neutral-900: #212121;
```

#### Semantic Colors
```css
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;
```

---

### Typography

#### Font Stack
```css
/* Primary Font (Headings) */
font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;

/* Secondary Font (Body) */
font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Arabic Support */
font-family: 'Cairo', 'Tajawal', 'Inter', sans-serif;
```

#### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

---

### Design Principles

#### 1. Dynamic Brand Theming
- **Platform Base**: Clean white background with soft gray accents
- **Fifi Brand Pages** (`/fifi/*`):
  - Pink accent colors for buttons, badges, links
  - Light pink background sections (#FFE5EF)
  - Playful, rounded UI elements
- **Soft Brand Pages** (`/soft/*`):
  - Purple accent colors for buttons, badges, links
  - Light purple background sections (#F3E5F5)
  - Elegant, refined UI elements
- **Unified Pages** (Homepage, Cart, Checkout):
  - Neutral light theme
  - Both brand colors visible in product cards/badges

#### 2. Visual Hierarchy
- Large product images (hero shots)
- Clear CTAs with brand colors
- Generous white space

#### 3. Mobile-First
- Touch-friendly buttons (min 44px)
- Readable text (min 16px body)
- Fast loading images (WebP format)

#### 4. Accessibility
- WCAG AA contrast ratios
- Alt text for all images
- Keyboard navigation support

---

### Component Examples

#### Product Card
```
┌─────────────────────┐
│   [Product Image]   │ ← 1:1 aspect ratio
├─────────────────────┤
│ Product Name        │ ← Bold, 18px
│ Brand: Fifi/Soft    │ ← Brand color badge
│ 150,000 SYP         │ ← Large, prominent
│ [Add to Cart] ←───────── Brand color button
└─────────────────────┘
```

#### Brand Badge
- Fifi: Pink pill with white text
- Soft: Purple pill with white text

---

## Next Steps
- [ ] Create Figma/Design mockups
- [ ] Implement Tailwind config with these colors
- [ ] Design Homepage (dual-brand hero)
- [ ] Design Product Listing Page
