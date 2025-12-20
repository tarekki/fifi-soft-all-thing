# UI Design Specifications

## Homepage (Unified Light Theme)

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header (White #FFFFFF)                      │
│ Logo | Home | Fifi | Soft | 🔍 | 🛒 | 👤   │
├─────────────────────────────────────────────┤
│ Hero Section (Soft Gray #F8F9FA)            │
│                                             │
│  "تسوق من أفضل الماركات السورية"           │
│                                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │ Fifi Card    │    │ Soft Card    │      │
│  │ (Pink #E91E63)│   │ (Purple)     │      │
│  │ أحذية أطفال  │    │ أحذية وحقائب │      │
│  └──────────────┘    └──────────────┘      │
├─────────────────────────────────────────────┤
│ Featured Products (White Background)        │
│                                             │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│ │ 1 │ │ 2 │ │ 3 │ │ 4 │  Product Cards    │
│ └───┘ └───┘ └───┘ └───┘                   │
├─────────────────────────────────────────────┤
│ Footer (Dark Gray #616161)                  │
└─────────────────────────────────────────────┘
```

### Components

#### Product Card
- **Image**: 1:1 ratio, white background
- **Brand Badge**: Pill shape, brand color background, white text
- **Product Name**: 16px, bold, #212121
- **Price**: 18px, bold, #E91E63 or #9C27B0 (brand color)
- **Button**: White with brand color border, hover fills with brand color

---

## Fifi Brand Page (Pink Theme)

### Color Scheme
- **Accent**: #E91E63 (Vibrant Pink)
- **Background Tint**: #FFE5EF (Very Light Pink)
- **Base**: #FFFFFF

### Filters Sidebar (RTL - Right Side)
```
┌─────────────────┐
│ الفلاتر         │
├─────────────────┤
│ الفئة ▼         │
│ □ رياضي         │
│ □ رسمي          │
│ □ صندل          │
├─────────────────┤
│ المقاس          │
│ [20][22][24]... │
├─────────────────┤
│ اللون           │
│ ⚫ 🔴 🔵 ⚪     │
├─────────────────┤
│ [تطبيق الفلتر]  │ ← Pink button
└─────────────────┘
```

---

## Soft Brand Page (Purple Theme)

### Color Scheme
- **Accent**: #9C27B0 (Deep Purple)
- **Background Tint**: #F3E5F5 (Very Light Purple)
- **Base**: #FFFFFF

### Product Types
- أحذية نسائية (Women's Shoes)
- حقائب يد (Handbags)
- حقائب كتف (Shoulder Bags)

---

## Mobile App Screens

### Bottom Navigation
```
┌────┬────┬────┬────┐
│ 🏠 │ 📂 │ 🛒 │ 👤 │
│الرئيسية│الأقسام│السلة│حسابي│
└────┴────┴────┴────┘
```

### Home Screen
- Search bar at top
- Brand cards (Fifi & Soft) - tappable
- Horizontal scrolling product list
- Bottom tabs

### Product Detail
- Image carousel (swipeable)
- Product name & price
- Color selector (circles)
- Size selector (buttons)
- Large "أضف إلى السلة" button (brand color)

---

## Design Tokens (CSS Variables)

```css
/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

---

## Mockup Reference

![Homepage Mockup](file:///C:/Users/tarek/.gemini/antigravity/brain/fc800d00-3e99-4166-91de-9c0a7b809a03/homepage_mockup_light_1766184560605.png)

---

## Next Steps
- [ ] Create detailed Figma prototypes
- [ ] Get user approval on design direction
- [ ] Begin frontend implementation
