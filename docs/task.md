# Task Checklist: Syrian E-commerce Platform (Fifi & Soft)

## Phase 0: Planning & Requirements ✅
- [x] **Requirements Gathering**
    - [x] Identify initial brands: Fifi (Children's Shoes) & Soft (Women's Shoes/Bags)
    - [x] Define Revenue Model (10% commission)
    - [x] Confirm Tech Stack (Django + Next.js + React Native)
    - [x] Plan Multi-Vendor Architecture (Adapter Pattern)
- [x] **Deferred to Later Phase**
    - [x] Inventory Sync System (SQL Adapters)

## Phase 1: Foundation (Week 1-2) 🏗️
- [/] **Project Setup**
    - [x] Initialize Git Monorepo
    - [x] Setup Django Backend (PostgreSQL)
      - [x] Setup REST Framework + CORS
      - [x] Configure drf-spectacular for API docs
      - [x] Environment variables setup (.env.example)
      - [x] Remove hardcoded secrets from settings.py
      - [x] Implement production security validation
      - [x] Custom User System (User, UserProfile, VendorUser models)
      - [x] Update Order Model (user field, guest orders support)
      - [x] Apply migrations to database
      - [x] Setup pgAdmin for database access
    - [/] Setup Next.js Frontend
      - [x] Initialize Next.js 14 project (TypeScript + Tailwind)
      - [x] Project structure (app/, core/, lib/, types/)
      - [x] TypeScript configuration (strict mode)
      - [x] ESLint + Prettier setup
      - [x] Environment variables (.env.example)
      - [x] Basic app structure (layout, page, middleware)
      - [x] Core Layer foundation (Domain, Services, Ports)
      - [x] Type definitions (Product, User, Order, Vendor, API)
      - [x] API client (fetch wrapper)
      - [x] Server Actions structure
      - [ ] Complete Core Layer (all domains)
      - [ ] Complete Server Actions (all actions)
      - [ ] Auth system implementation
    - [ ] Setup React Native (Expo)
- [x] **Database Schema**
    - [x] Vendor Model
    - [x] Product & ProductVariant Models
    - [x] Order & Commission Models
    - [x] User Model (Custom - email-based authentication)
    - [x] UserProfile Model
    - [x] VendorUser Model (links users to vendors)
- [/] **Brand Identity**
    - [x] Extract colors from logos
    - [x] Create Design System

## Phase 2: Core Features (Week 3-4) 💎
- [ ] **Backend APIs**
    - [x] Vendor Management
      - [x] VendorSerializer
      - [x] VendorViewSet (list, retrieve)
      - [x] Filtering, Search, Ordering
      - [x] Pagination support
    - [x] Product CRUD (with variants)
      - [x] ProductSerializer, ProductDetailSerializer, ProductVariantSerializer
      - [x] ProductViewSet (list, retrieve, variants action)
      - [x] Advanced Filtering (vendor, type, color, size, price range)
      - [x] Search (name, description)
      - [x] Ordering (price, newest, name)
      - [x] Pagination support
    - [x] Manual Product Entry Interface (Enhanced Django Admin)
      - [x] Improved ProductAdmin with fieldsets, statistics, and actions
      - [x] Enhanced ProductVariantInline with better display
      - [x] Improved VendorAdmin with statistics and logo preview
      - [x] Added bulk actions (activate/deactivate, export CSV)
      - [x] Added admin dashboard statistics
    - [x] User Authentication APIs
      - [x] User Registration (with email verification)
      - [x] User Login (JWT tokens)
      - [x] User Profile Management
      - [x] Password Change
      - [x] Email Verification
    - [x] **Backend Architecture Improvements** ✅
      - [x] API Versioning (/api/v1/)
      - [x] Standard Response Wrapper (success, data, message, errors)
      - [x] Unified Pagination (works for both Web and Mobile)
      - [x] API Structure Reorganization (/api/v1/auth/, /api/v1/products/, etc.)
      - [x] Custom Middleware (Request Logging, Error Handling)
      - [x] Updated all existing APIs to use new structure
      - [x] Removed Legacy API endpoints (clean code, single API structure)
    - [x] Order APIs (Basic Implementation - ⚠️ **Requires Future Modifications for Inventory Sync**)
      - [x] Order Creation API (POST /api/v1/orders/)
      - [x] Order List API (GET /api/v1/orders/) - Filtered by user role
      - [x] Order Detail API (GET /api/v1/orders/{id}/)
      - [x] Order Status Update API (PATCH /api/v1/orders/{id}/update-status/)
      - [x] Commission Calculation Logic (Automatic 10%)
      - [x] Guest Orders Support
      - [x] Role-based Access Control (Customer/Vendor/Admin)
      - **⚠️ Future Modifications Required (When Inventory Sync is Implemented):**
        - [ ] Add stock validation in `OrderCreateSerializer.validate()` - Check if sufficient stock exists
        - [ ] Add stock reduction in `OrderCreateSerializer.create()` - Reduce stock when order is created
        - [ ] Add stock restoration in order cancellation - Restore stock when order is cancelled
        - [ ] Add stock sync service - Sync stock from accounting systems
        - [ ] Add scheduled stock sync tasks - Automatic stock synchronization
        - [ ] Update `OrderViewSet.update_status()` - Handle stock when status changes
        - **See**: `docs/order_api_future_modifications.md` for detailed modification plan
    - [⏸️] Bulk Product Import (Deferred - Waiting for accounting system integration method)
- [/] **Web Frontend**
    - [x] Project Setup (Next.js 14 + TypeScript + Tailwind)
    - [x] Basic Project Structure (app/, core/, lib/, types/)
    - [x] TypeScript Types (Product, User, Order, Vendor, API)
    - [x] Core Layer Foundation (Domain, Services, Ports)
    - [x] API Client (fetch wrapper for public read-only)
    - [x] Server Actions Structure (product.actions.ts)
    - [x] Middleware Setup (placeholder for auth)
    - [x] Complete Core Layer (Order, User, Vendor domains)
      - [x] Order Domain (entity, types, policy with business rules)
      - [x] User Domain (entity, types, policy with validation)
      - [x] Vendor Domain (entity, types, policy)
      - [x] Order Service (business logic)
      - [x] Auth Service (secure authentication logic)
      - [x] Vendor Service (business logic)
      - [x] All Ports/Interfaces (Order, Auth, Vendor repositories)
      - [x] Repository Implementations (Product, Order, Auth, Vendor)
        - [x] ProductRepository (implements ProductPort using Public API)
        - [x] OrderRepository (implements OrderPort using Authenticated API)
        - [x] AuthRepository (implements AuthPort using Authenticated API)
        - [x] VendorRepository (implements VendorPort using Public API)
    - [x] Complete Server Actions (Order, Auth, Vendor)
      - [x] Order Actions (getOrders, getOrderById, createOrder, updateStatus, cancel) - Uses OrderService with OrderRepository
      - [x] Auth Actions (register, login, refreshToken, getCurrentUser, verifyEmail, resendVerification, changePassword, logout) - Uses AuthService with AuthRepository
      - [x] Vendor Actions (getVendors, getVendorById, getVendorBySlug) - Uses VendorService with VendorRepository
      - [x] Product Actions (getProducts, getProductBySlug) - Uses ProductService with ProductRepository
      - [x] Public Vendors API (read-only)
    - [x] Complete API Clients (Orders, Auth) - For authenticated requests
      - [x] Authenticated API Client (JWT support from HttpOnly cookies)
      - [x] Orders API Client (create, get, update status, cancel)
      - [x] Auth API Client (register, login, refresh, profile, verify email, change password, logout)
      - [x] Updated Server Actions to use new API clients
    - [x] Auth System (JWT, Cookies, Permissions)
      - [x] JWT Token Handling (decode, validate, extract user data)
      - [x] HttpOnly Cookies Management (secure, safe, XSS protection)
      - [x] Session Management (get current user, refresh, clear)
      - [x] Permissions System (role-based: Admin, Vendor, Customer)
      - [x] Middleware with Auth Protection (route protection, redirects)
    - [x] Shadcn/ui Setup
      - [x] Install dependencies (class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot, tailwindcss-animate)
      - [x] Configure components.json
      - [x] Update tailwind.config.js with Shadcn/ui theme
      - [x] Update globals.css with CSS variables
      - [x] Create lib/utils.ts with cn() helper
    - [x] Route-level Layouts (Structure only, no design)
      - [x] (public)/layout.tsx - Public layout structure
      - [x] (customer)/layout.tsx - Customer layout structure
      - [x] (vendor)/layout.tsx - Vendor layout structure
      - [x] (admin)/layout.tsx - Admin layout structure
    - [x] Custom Hooks
      - [x] useAuth - Authentication state and operations
      - [x] useProducts - Product data fetching
      - [x] useOrders - Order data fetching and management
      - [x] useCart - Shopping cart management
      - [x] useVendors - Vendor data fetching
    - [x] Enhanced Middleware
      - [x] Centralized route definitions (constants.ts)
      - [x] Route matching utilities (utils.ts)
      - [x] Comprehensive logging (logger.ts)
      - [x] Smart redirects with context preservation
      - [x] Enhanced error handling
      - [x] Better security checks
    - [x] Error Handling & Loading States
      - [x] ErrorBoundary component
      - [x] LoadingSpinner component (multiple sizes)
      - [x] ErrorMessage component (dismissible, multiple types)
      - [x] EmptyState component
      - [x] Error handlers utilities (AppError, getUserFriendlyErrorMessage)
    - [x] Zustand Stores
      - [x] authStore - Authentication state
      - [x] cartStore - Shopping cart state
      - [x] uiStore - UI state (theme, language, modals, toasts, sidebar)
    - [x] SEO Helpers
      - [x] Metadata generators (generateMetadata, generateProductMetadata, generateVendorMetadata)
      - [x] Structured Data (JSON-LD) - Organization, Product, Breadcrumb, WebSite, LocalBusiness schemas
      - [x] Sitemap generation utilities (static, products, vendors, complete sitemap)
      - [x] Security: Sanitization, XSS prevention, URL validation
      - [x] Central export (lib/seo/index.ts)
    - [ ] **UI/UX Design System** (Enterprise-Grade Marketplace)
      - [x] Design System Foundation
        - [x] Color Palette (Historical Syrian: Damask Red, Umayyad Blue, Aged Gold, Limestone)
        - [x] Typography Scale (Tajawal Font + Inter)
        - [x] Spacing Scale (Generous spacing, consistent scale)
        - [x] Component Tokens (Buttons, badges, cards, modals, shadows, borders)
        - [x] Design Tokens File (Centralized design system - lib/design/tokens.ts)
        - [x] Tailwind Config Integration (Extended with Historical tokens)
        - [x] CSS Variables (globals.css with texture and theme variables)
      - [x] Core Components (Shadcn/ui based)
        - [x] Product Card (Rounded, soft shadow, discount badge, rating, hover effects) - components/product/ProductCard.tsx
        - [x] Navigation Header (Sticky, centered search, mega-menu, cart preview, user menu) - components/layout/NavigationHeader.tsx
        - [x] Campaign Slider (Horizontal stories-style, circular cards, brand deals, flash sales) - components/campaign/CampaignSlider.tsx
        - [x] Category Grid (Featured categories with icons) - components/category/CategoryGrid.tsx
        - [x] Skeleton Loaders (For all lists and cards) - components/common/Skeleton.tsx
        - [x] Filter Sidebar (Sticky filters for category pages) - components/filters/FilterSidebar.tsx
        - [x] Modal Components (Quick view, product details) - components/modal/Modal.tsx, QuickViewModal.tsx
      - [ ] Layout Components
        - [ ] Public Layout (Header, Footer, Navigation)
        - [x] Customer Layout (Cart icon, account menu, order history)
          - [x] Sidebar (Collapsible, Sticky, Yalla Buy branding)
        - [ ] Vendor Layout (Dashboard sidebar, vendor-specific navigation)
        - [ ] Admin Layout (Admin panel UI, full privileges navigation)
      - [x] Homepage Implementation
        - [x] Hero Section (Dynamic discount banners & Historical Theme)
        - [x] Campaign Slider / Brands Flow (3D Flip Interaction)
        - [x] Featured Categories Grid (Integrated in Sidebar)
        - [x] Product Grid (Flip Grid with "Book" paging experience)
        - [x] Vendor Spotlight Section (Covered by Brands Flow)
        - [x] Trust Signals (Secure badges in Footer/Sidebar)
      - [ ] Product Pages
        - [ ] Product Listing Page (PLP)
          - [ ] Sticky Filters Sidebar (Brand, Color, Size, Price Range)
          - [ ] Product Grid (Responsive, infinite scroll ready)
          - [ ] Sorting Options (Price, Newest, Rating)
          - [ ] Pagination (Or infinite scroll)
        - [ ] Product Detail Page (PDP)
          - [ ] Image Gallery (Swipeable, zoom, thumbnails)
          - [ ] Variant Selector (Color, Size, Model - smooth interactions)
          - [ ] Price Display (Old price strikethrough, new price bold)
          - [ ] Rating & Reviews Section
          - [ ] Add to Cart Button (Clear CTA, trust signals)
          - [ ] Quick View Modal (For product grid)
      - [ ] Cart & Checkout
        - [ ] Cart Page (Product list, quantity controls, total calculation)
        - [ ] Checkout Form (Name, Phone, Address - pre-filled from profile)
        - [ ] Order Summary (Products, subtotal, delivery fee, total)
        - [ ] Order Confirmation Page (Order number, details, next steps)
      - [ ] Mobile Responsive Design
        - [ ] Mobile-First Approach (All components mobile-optimized)
        - [ ] Bottom Navigation (Home, Categories, Cart, Orders, Profile)
        - [ ] Swipeable Campaigns (Stories-style on mobile)
        - [ ] Thumb-Friendly Product Cards (Large touch targets)
        - [ ] Mobile Filters (Drawer/modal on mobile)
      - [ ] UX Enhancements
        - [ ] Smooth Micro-Interactions (Hover effects, transitions)
        - [ ] Clear Focus States (Accessibility-friendly)
        - [ ] Loading States (Skeleton loaders everywhere)
        - [ ] Error States (User-friendly error messages)
        - [ ] Empty States (Helpful empty state messages)
        - [ ] Accessibility (WCAG compliant, keyboard navigation)
    - [ ] Homepage (Dual Brand) - Implementation following Design System
    - [ ] **Dynamic Homepage Integration** (For long-term professionalism)
        - [ ] Backend: Setup `promotions` app (Banners, Campaigns)
        - [ ] Backend: Convert `PRODUCT_TYPES` to `Category` model
        - [ ] Backend: Add `is_featured` flags and localization fields
        - [ ] Frontend: Integrate Banners API in `HeroSection`
        - [ ] Frontend: Integrate Campaigns API in `DiscountSlider`
        - [ ] Frontend: Integrate dynamic Categories in `CategoriesGrid`
        - [ ] Frontend: Dynamic Brands in `BrandsFlow`
    - [ ] Product Listing (Filters: Color/Size/Model) - Deferred until design is ready
    - [ ] Product Detail Page - Deferred until design is ready
    - [ ] Cart & Checkout (Manual) - Deferred until design is ready
- [ ] **Mobile App**
    - [ ] Bottom Tab Navigation
    - [ ] Product Browsing
    - [ ] Basic Checkout

## Phase 3: Launch Prep (Week 5) 🚀
- [ ] **Testing**
    - [ ] Load Testing (10k products)
    - [ ] Mobile Responsiveness
- [ ] **Deployment**
    - [ ] Backend to VPS/Cloud
    - [ ] Frontend to Vercel
    - [ ] App to TestFlight/Internal Testing

## Phase 4: Post-Launch (Future) 🔮
- [ ] Inventory Sync Adapters (SQL)
- [ ] Yalla Go Integration
- [ ] Payment Gateway
- [ ] Barcode System

## Phase 4.5: Admin Dashboard (لوحة تحكم الأدمن) 🎛️
> **الهدف**: بناء واجهة إدارة مخصصة لـ Yalla Buy بدلاً من Django Admin

### 🎨 Admin Layout & Theme ✅
- [x] **Layout Components**:
  - [x] Admin Sidebar (قائمة جانبية قابلة للطي + Animations)
  - [x] Admin Header (شريط علوي مع البحث والإشعارات)
  - [x] Admin Footer
  - [ ] Breadcrumbs Component
- [ ] **Theme**:
  - [ ] Dark/Light Mode Toggle (UI جاهز، التطبيق لاحقاً)
  - [x] RTL Support (عربي/إنجليزي)
  - [x] Responsive Design (Desktop + Tablet + Mobile)
  - [x] تصميم عصري يطابق هوية Yalla Buy (Glassmorphism)

### 📊 Dashboard الرئيسي ✅
- [x] **إحصائيات سريعة (Stats Cards)**:
  - [x] إجمالي الطلبات اليوم
  - [x] إجمالي الإيرادات اليوم
  - [x] عدد المنتجات النشطة
  - [x] عدد البائعين النشطين
  - [x] عدد المستخدمين الجدد
- [x] **رسوم بيانية (Charts)**:
  - [x] مبيعات الأسبوع (Bar Chart)
  - [ ] مبيعات الشهر (Bar Chart)
  - [ ] توزيع الطلبات حسب الحالة (Pie Chart)
  - [ ] أكثر المنتجات مبيعاً (Horizontal Bar)
- [x] **آخر النشاطات**:
  - [x] آخر 5 طلبات
  - [ ] آخر 5 مستخدمين مسجلين
  - [x] آخر 5 منتجات مضافة (Activity Log)

### ⚙️ إعدادات الموقع (Settings) - ✅ Backend جاهز + ✅ Frontend جاهز
- [x] **صفحة إعدادات الموقع (General)**:
  - [x] تعديل اسم الموقع والشعار
  - [x] رفع الشعار والأيقونة (UI جاهز)
  - [x] إعدادات العملة
  - [x] وضع الصيانة
- [x] **صفحة SEO**:
  - [x] العنوان والوصف (EN + AR)
  - [x] الكلمات المفتاحية
  - [x] أكواد التتبع (GA, GTM, FB Pixel)
  - [x] إعدادات الفهرسة
- [x] **صفحة معلومات الاتصال**:
  - [x] البريد والهاتف والواتساب
  - [x] العنوان (EN + AR)
  - [x] خرائط Google
  - [x] ساعات العمل
- [x] **صفحة روابط السوشيال**:
  - [x] إضافة/تعديل/حذف روابط
  - [x] تفعيل/تعطيل الروابط
  - [x] دعم 8 منصات (FB, IG, X, YT, TikTok, LinkedIn, WhatsApp, Telegram)
- [ ] **صفحة اللغات** (قريباً):
  - [ ] إدارة اللغات المدعومة
  - [ ] تعيين اللغة الافتراضية
- [ ] **صفحة قوائم التنقل** (قريباً):
  - [ ] إدارة عناصر Header
  - [ ] إدارة عناصر Footer
  - [ ] قوائم فرعية (Nested)
- [ ] **صفحة مؤشرات الثقة** (قريباً):
  - [ ] إضافة/تعديل/حذف مؤشرات
- [ ] **صفحة طرق الدفع** (قريباً):
  - [ ] إدارة طرق الدفع
  - [ ] تفعيل/تعطيل
  - [ ] إعدادات الرسوم
- [ ] **صفحة طرق الشحن** (قريباً):
  - [ ] إدارة طرق الشحن
  - [ ] إعدادات التسعير
  - [ ] حد الشحن المجاني

### 📂 إدارة الفئات (Categories) ✅
- [x] **صفحة الفئات**:
  - [x] عرض شجرة الفئات (Tree View)
  - [x] إضافة فئة جديدة (Modal)
  - [x] تعديل فئة
  - [x] حذف فئة
  - [x] توسيع/طي الفئات الفرعية
  - [x] تعيين فئات مميزة (Featured)
  - [x] بحث في الفئات

### 📦 إدارة المنتجات (Products) ✅
- [x] **صفحة قائمة المنتجات**:
  - [x] جدول المنتجات مع Pagination
  - [x] فلترة (بائع، فئة، حالة)
  - [x] بحث (اسم، SKU)
  - [x] تحديد متعدد
  - [x] عمليات جماعية (Bulk Actions)
  - [x] تبديل عرض (Table/Grid)
  - [x] Sorting (سعر، مخزون)
- [ ] **صفحة إضافة/تعديل منتج** (قريباً):
  - [ ] معلومات المنتج الأساسية
  - [ ] الصور (رفع متعدد + Drag & Drop)
  - [ ] المتغيرات (ألوان، مقاسات، موديلات)
  - [ ] التسعير والخصومات
  - [ ] إعدادات SEO
  - [ ] حالة النشر

### 🏪 إدارة البائعين (Vendors) ✅
- [x] **صفحة قائمة البائعين**:
  - [x] بطاقات البائعين (Cards View)
  - [x] فلترة (حالة)
  - [x] بحث
  - [x] إحصائيات لكل بائع
  - [x] موافقة/رفض البائعين
  - [x] تعيين بائعين مميزين
- [ ] **صفحة تفاصيل البائع** (قريباً):
  - [ ] معلومات البائع
  - [ ] إحصائيات البائع
  - [ ] منتجات البائع
  - [ ] طلبات البائع
  - [ ] تعديل العمولة
- [ ] **طلبات الانضمام** (قريباً):
  - [ ] قائمة الطلبات المعلقة
  - [ ] مراجعة وموافقة/رفض

### 📋 إدارة الطلبات (Orders) ✅
- [x] **صفحة قائمة الطلبات**:
  - [x] جدول الطلبات
  - [x] فلترة (حالة)
  - [x] بحث برقم الطلب
  - [x] إحصائيات الحالات (Stats Cards)
  - [x] تحديد متعدد
- [x] **Modal تفاصيل الطلب**:
  - [x] معلومات الطلب
  - [x] منتجات الطلب
  - [x] معلومات العميل
  - [x] تحديث الحالة
  - [ ] ملاحظات داخلية (قريباً)
  - [ ] طباعة الفاتورة (قريباً)

### 👥 إدارة المستخدمين (Users) ✅
- [x] **صفحة قائمة المستخدمين**:
  - [x] جدول المستخدمين
  - [x] فلترة (نوع، حالة)
  - [x] بحث
  - [x] إحصائيات الأدوار (Stats Cards)
  - [x] تحديد متعدد
  - [x] حظر/إلغاء حظر المستخدم
- [ ] **صفحة تفاصيل المستخدم** (قريباً):
  - [ ] معلومات المستخدم
  - [ ] طلبات المستخدم
  - [ ] تعديل الصلاحيات
  - [ ] تفعيل/تعطيل الحساب

### 🎯 إدارة العروض والحملات (Promotions) ✅
- [x] **صفحة العروض الرئيسية**:
  - [x] بطاقات الأقسام (Banners, Stories, Coupons)
  - [x] إحصائيات لكل قسم
  - [x] جدول النشاط الأخير
  - [x] تصفية حسب النوع
- [x] **صفحة البانرات** ✅:
  - [x] إضافة/تعديل/حذف بانر
  - [x] تحديد الموقع (Hero, Sidebar, Popup, Category)
  - [x] جدولة العرض (تاريخ البداية/النهاية)
  - [x] إحصائيات (Views, Clicks, CTR)
  - [x] تفعيل/تعطيل البانر
- [x] **صفحة القصص (Stories)** ✅:
  - [x] إدارة القصص بأسلوب Instagram
  - [x] ربط بمنتج/فئة/عرض/رابط خارجي
  - [x] معاينة حية للقصص النشطة
  - [x] تاريخ انتهاء تلقائي
  - [x] سحب وإفلات للترتيب
- [x] **صفحة كوبونات الخصم** ✅:
  - [x] إنشاء/تعديل/حذف كوبون
  - [x] نوع الخصم (نسبة مئوية / مبلغ ثابت)
  - [x] إعدادات (حد أدنى، حد أقصى، صلاحية)
  - [x] تتبع الاستخدام مع Progress Bar
  - [x] نسخ الكود بنقرة واحدة

### 📊 التقارير والإحصائيات (Reports) ✅
- [x] **صفحة التقارير الرئيسية**:
  - [x] بطاقات الملخص (Revenue, Orders, Avg Order, New Users)
  - [x] رسم بياني للمبيعات اليومية
  - [x] رسم بياني للمبيعات حسب الفئة
  - [x] جدول أكثر المنتجات مبيعاً
  - [x] فلترة حسب الفترة الزمنية
  - [x] زر تصدير التقرير (UI)
- [ ] **تقارير تفصيلية** (قريباً):
  - [ ] تقرير عمولات مفصل
  - [ ] تقرير مستخدمين
  - [ ] تصدير CSV/Excel
  - [ ] منتجات بدون مخزون
- [ ] **تصدير التقارير**:
  - [ ] PDF
  - [ ] Excel
  - [ ] CSV

### 🔔 نظام الإشعارات (Notifications)
- [ ] **إشعارات داخلية**:
  - [ ] طلب جديد
  - [ ] طلب انضمام بائع
  - [ ] مخزون منخفض
- [ ] **مركز الإشعارات**:
  - [ ] قائمة الإشعارات
  - [ ] تحديد كمقروء

---

## Phase 4.6: Dynamic Homepage Integration (Current Sprint) 🏠
> **الهدف**: ربط واجهة Yalla Buy الرئيسية بالـ Backend بشكل كامل (100% Dynamic)

### ✅ Feature #1: Site Settings (اكتمل)
- [x] **Backend**:
  - [x] `SiteSettings` Model (Singleton - اسم الموقع، الشعار، العملة، SEO، الصيانة)
  - [x] `SocialLink` Model (روابط السوشيال ميديا)
  - [x] `Language` Model (اللغات المدعومة - AR/EN)
  - [x] `NavigationItem` Model (قوائم Header/Footer/Sidebar)
  - [x] `TrustSignal` Model (مؤشرات الثقة - شحن مجاني، دفع آمن)
  - [x] `PaymentMethod` Model (طرق الدفع - COD، سيريتل كاش، MTN)
  - [x] `ShippingMethod` Model (طرق الشحن - عادي، سريع، استلام)
  - [x] Serializers (Public + Full)
  - [x] Views مع Caching
  - [x] URLs مربوطة (`/api/v1/settings/...`)
  - [x] Admin Panel (مع Fieldsets منظمة)
  - [x] Initial Data Migration (بيانات افتراضية)
- [x] **Frontend**:
  - [x] Types (`src/types/settings.ts`)
  - [x] API Client (`src/lib/api/public/settings.ts`)
  - [x] Context & Provider (`src/lib/settings/context.tsx`)
  - [x] Hooks: `useSettings`, `useSiteInfo`, `useNavigation`, `useLanguage`, `useSocialLinks`, `useTrustSignals`, `usePaymentMethods`, `useShippingMethods`
  - [x] Layout Integration (`SettingsProvider` في `layout.tsx`)
- [x] **API Endpoints**:
  - `GET /api/v1/settings/site/` - إعدادات الموقع
  - `GET /api/v1/settings/social/` - روابط السوشيال
  - `GET /api/v1/settings/languages/` - اللغات
  - `GET /api/v1/settings/navigation/` - قوائم التنقل
  - `GET /api/v1/settings/trust-signals/` - مؤشرات الثقة
  - `GET /api/v1/settings/payment-methods/` - طرق الدفع
  - `GET /api/v1/settings/shipping-methods/` - طرق الشحن
  - `GET /api/v1/settings/all/` - جميع الإعدادات مجمعة

### 🔄 Feature #2: Categories (قيد العمل)
- [ ] **Backend**:
  - [ ] `Category` Model (parent, name, slug, icon, image, is_featured)
  - [ ] CategorySerializer
  - [ ] CategoryViewSet
  - [ ] URLs (`/api/v1/categories/`)
  - [ ] Admin Panel
  - [ ] Initial Data Migration
- [ ] **Frontend**:
  - [ ] Types (`src/types/category.ts`)
  - [ ] API Client (`src/lib/api/public/categories.ts`)
  - [ ] Hook: `useCategories`
  - [ ] تحديث Categories Grid في الصفحة الرئيسية

### ⏳ Feature #3: Products Update (في الانتظار)
- [ ] **Backend**:
  - [ ] إضافة `is_featured`, `is_new`, `is_bestseller` للـ Product
  - [ ] إضافة `compare_at_price` (السعر قبل الخصم)
  - [ ] إضافة `badge_text`, `badge_color`
  - [ ] إضافة `view_count`, `order_count`, `wishlist_count`
  - [ ] ربط Product بـ Category
  - [ ] تحسين الـ API Response
- [ ] **Frontend**:
  - [ ] تحديث Types
  - [ ] تحديث Product Cards

### ⏳ Feature #4: Vendors Update (في الانتظار)
- [ ] **Backend**:
  - [ ] إضافة `is_featured`, `is_verified`
  - [ ] إضافة `rating_average`, `rating_count`
  - [ ] إضافة `followers_count`
  - [ ] إضافة `response_time`, `shipping_speed`
- [ ] **Frontend**:
  - [ ] تحديث Types
  - [ ] تحديث Vendor Cards

### ⏳ Feature #5: Banners (في الانتظار)
- [ ] **Backend**:
  - [ ] `Banner` Model (hero, sidebar, popup)
  - [ ] BannerSerializer
  - [ ] BannerViewSet
  - [ ] Admin Panel
- [ ] **Frontend**:
  - [ ] Hook: `useBanners`
  - [ ] تحديث Hero Section

### ⏳ Feature #6: Reviews & Ratings (في الانتظار)
- [ ] **Backend**:
  - [ ] `Review` Model
  - [ ] ReviewSerializer
  - [ ] ReviewViewSet
  - [ ] Admin Panel
- [ ] **Frontend**:
  - [ ] Hook: `useReviews`
  - [ ] Review Components

### ⏳ Feature #7: Wishlist (في الانتظار)
- [ ] **Backend**:
  - [ ] `Wishlist` Model
  - [ ] WishlistSerializer
  - [ ] WishlistViewSet
- [ ] **Frontend**:
  - [ ] Hook: `useWishlist`
  - [ ] Wishlist Toggle Button

### ⏳ Feature #8: Cart (Server-side) (في الانتظار)
- [ ] **Backend**:
  - [ ] `Cart` Model (للـ guest و authenticated)
  - [ ] `CartItem` Model
  - [ ] CartSerializer
  - [ ] CartViewSet
- [ ] **Frontend**:
  - [ ] تحديث `useCart` للعمل مع الـ API

## Phase 6: Frontend Architecture Enhancements (Deferred - Future) 🏗️
- [⏸️] **Domain Events System** (Deferred - For future notifications, analytics, webhooks)
  - [ ] Product Created Event
  - [ ] Order Paid Event
  - [ ] Order Cancelled Event
  - **Note**: Will be implemented when notifications/analytics system is needed
- [⏸️] **Background Jobs System** (Deferred - For async tasks)
  - [ ] Email Sending Jobs
  - [ ] Vendor Sync Jobs
  - [ ] Token Cleanup Jobs
  - **Note**: Will use Next.js API Routes + Cron initially, then BullMQ if needed
- [⏸️] **Comprehensive Testing Suite** (Deferred - After MVP launch)
  - [ ] Unit Tests (Core Services, Policies)
  - [ ] Integration Tests (API Actions)
  - [ ] Component Tests (React Components)
  - [ ] E2E Tests (Critical User Flows)
  - **Note**: Testing will be added after MVP is stable and in production

---

## 📁 Frontend Architecture - Final Structure
## بنية الفرونت إند - الهيكل النهائي

### Project Structure (البنية النهائية)

```
frontend-web/
├── .env.local                    # Environment variables (local)
├── .env.example                  # Environment variables template
├── .eslintrc.json                # ESLint configuration (strict)
├── .prettierrc                   # Prettier configuration
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration (strict)
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── logos/
│   │   │   ├── fifi-logo.png
│   │   │   └── soft-logo.png
│   │   └── placeholders/
│   │       └── product-placeholder.png
│   ├── icons/
│   │   └── favicon.ico
│   └── fonts/                    # Custom fonts (if needed)
│
├── src/
│   ├── app/                      # Next.js 14 App Router (UI Only)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root page (redirect to homepage)
│   │   ├── loading.tsx           # Global loading UI
│   │   ├── error.tsx             # Global error UI
│   │   ├── not-found.tsx         # 404 page
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── (public)/            # Public routes group
│   │   │   ├── layout.tsx       # Public layout (Header + Footer)
│   │   │   ├── page.tsx         # Homepage
│   │   │   │
│   │   │   ├── products/        # Products routes
│   │   │   │   ├── page.tsx     # All products listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Product detail (SEO-friendly)
│   │   │   │
│   │   │   ├── vendors/         # Vendors routes
│   │   │   │   └── [vendorSlug]/
│   │   │   │       ├── page.tsx        # Vendor page
│   │   │   │       └── products/
│   │   │   │           └── page.tsx    # Vendor products
│   │   │   │
│   │   │   └── auth/           # Authentication routes
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       ├── register/
│   │   │       │   └── page.tsx
│   │   │       ├── verify-email/
│   │   │       │   └── page.tsx
│   │   │       └── forgot-password/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (customer)/         # Customer routes group
│   │   │   ├── layout.tsx      # Customer layout (Header + Cart + Account)
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   └── page.tsx    # Shopping cart
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx    # Checkout page
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx    # Order history
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Order details
│   │   │   │
│   │   │   └── profile/
│   │   │       └── page.tsx    # User profile
│   │   │
│   │   ├── (vendor)/           # Vendor routes group
│   │   │   ├── layout.tsx      # Vendor layout (Sidebar + TopBar)
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # Vendor dashboard
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── page.tsx   # Manage products
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Create product
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit product
│   │   │   │
│   │   │   └── orders/
│   │   │       ├── page.tsx   # Vendor orders
│   │   │       └── [id]/
│   │   │           └── page.tsx # Order details
│   │   │
│   │   └── (admin)/            # Admin routes group
│   │       ├── layout.tsx     # Admin layout (Admin Sidebar + TopBar)
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.tsx   # Admin dashboard
│   │       │
│   │       ├── vendors/
│   │       │   ├── page.tsx   # Manage vendors
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       │
│   │       ├── products/
│   │       │   └── page.tsx   # All products
│   │       │
│   │       ├── orders/
│   │       │   ├── page.tsx   # All orders
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       │
│   │       └── users/
│   │           └── page.tsx   # User management
│   │
│   ├── core/                    # 🎯 Business Logic Layer (الأهم)
│   │   ├── domain/             # Domain Models & Business Rules
│   │   │   ├── product/
│   │   │   │   ├── product.entity.ts      # Product entity
│   │   │   │   ├── product.types.ts       # Product types
│   │   │   │   └── product.policy.ts      # Business rules (validation, permissions)
│   │   │   │
│   │   │   ├── order/
│   │   │   │   ├── order.entity.ts       # Order entity
│   │   │   │   ├── order.types.ts        # Order types
│   │   │   │   └── order.policy.ts      # Business rules
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── user.entity.ts        # User entity
│   │   │   │   ├── user.types.ts         # User types
│   │   │   │   └── user.policy.ts        # Business rules
│   │   │   │
│   │   │   └── vendor/
│   │   │       ├── vendor.entity.ts      # Vendor entity
│   │   │       ├── vendor.types.ts        # Vendor types
│   │   │       └── vendor.policy.ts       # Business rules
│   │   │
│   │   ├── services/           # Business Logic Services
│   │   │   ├── product.service.ts        # Product business logic
│   │   │   ├── order.service.ts          # Order business logic
│   │   │   ├── auth.service.ts           # Auth business logic
│   │   │   └── vendor.service.ts         # Vendor business logic
│   │   │
│   │   └── ports/              # Interfaces/Contracts (Repository Pattern)
│   │       ├── product.port.ts           # Product repository interface
│   │       ├── order.port.ts             # Order repository interface
│   │       ├── auth.port.ts              # Auth repository interface
│   │       └── vendor.port.ts             # Vendor repository interface
│   │
│   ├── lib/
│   │   ├── actions/             # 🎯 Server Actions (Next.js 14)
│   │   │   ├── product.actions.ts        # Product server actions
│   │   │   ├── order.actions.ts         # Order server actions
│   │   │   ├── auth.actions.ts          # Auth server actions
│   │   │   └── vendor.actions.ts        # Vendor server actions
│   │   │
│   │   ├── api/                # ⚠️ Public Read-Only Only
│   │   │   ├── public/        # فقط GET public data
│   │   │   │   ├── products.ts           # fetch فقط (no Axios)
│   │   │   │   └── vendors.ts            # fetch فقط (no Axios)
│   │   │   │
│   │   │   └── client.ts      # fetch wrapper (no Axios)
│   │   │
│   │   ├── auth/               # Authentication utilities
│   │   │   ├── jwt.ts          # JWT token handling
│   │   │   ├── cookies.ts      # HttpOnly cookies management
│   │   │   ├── session.ts      # Session management
│   │   │   └── permissions.ts  # Role-based permissions (used in middleware + services)
│   │   │
│   │   ├── seo/                # SEO utilities ✅
│   │   │   ├── index.ts        # Central export ✅
│   │   │   ├── metadata.ts     # Metadata generators ✅
│   │   │   ├── structured-data.ts  # JSON-LD schemas ✅
│   │   │   └── sitemap.ts      # Sitemap generation ✅
│   │   │
│   │   ├── validation/         # Validation utilities
│   │   │   ├── schemas.ts      # Zod schemas
│   │   │   └── rules.ts        # Custom validation rules
│   │   │
│   │   └── utils/              # General utilities
│   │       ├── format.ts       # Formatting functions (currency, dates)
│   │       ├── constants.ts    # Constants
│   │       └── helpers.ts      # Helper functions
│   │
│   ├── hooks/                   # ⚠️ Data Fetching Only
│   │   ├── useAuth.ts          # ✅ Calls auth.actions.ts
│   │   ├── useCart.ts          # ✅ Calls order.actions.ts
│   │   ├── useProducts.ts      # ✅ Calls product.actions.ts
│   │   ├── useOrders.ts        # ✅ Calls order.actions.ts
│   │   ├── useVendors.ts       # ✅ Calls vendor.actions.ts
│   │   └── useDebounce.ts      # Debounce hook
│   │
│   ├── components/              # UI Components (No Business Logic)
│   │   ├── ui/                 # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── headers/
│   │   │   │   ├── PublicHeader.tsx
│   │   │   │   ├── CustomerHeader.tsx
│   │   │   │   ├── VendorHeader.tsx
│   │   │   │   └── AdminHeader.tsx
│   │   │   │
│   │   │   ├── sidebars/
│   │   │   │   ├── VendorSidebar.tsx
│   │   │   │   └── AdminSidebar.tsx
│   │   │   │
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── product/            # Product components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductList.tsx
│   │   │
│   │   ├── cart/               # Cart components
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartIcon.tsx
│   │   │
│   │   ├── order/              # Order components
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── OrderStatus.tsx
│   │   │
│   │   ├── auth/               # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── EmailVerification.tsx
│   │   │
│   │   ├── vendor/             # Vendor components
│   │   │   ├── VendorCard.tsx
│   │   │   └── VendorStats.tsx
│   │   │
│   │   └── common/             # Common components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── EmptyState.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── store/                   # Zustand (UI State Only)
│   │   ├── authStore.ts        # Auth state (user, tokens)
│   │   ├── cartStore.ts        # Cart state (items, totals)
│   │   └── uiStore.ts           # UI state (theme, language, modals)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── api.ts              # API response types
│   │   ├── product.ts          # Product types
│   │   ├── order.ts            # Order types
│   │   ├── user.ts             # User types
│   │   ├── vendor.ts           # Vendor types
│   │   └── common.ts           # Common types
│   │
│   ├── styles/                  # Global styles
│   │   ├── themes.css          # Theme variables (Fifi/Soft)
│   │   └── animations.css      # Custom animations
│   │
│   └── middleware.ts            # Next.js middleware (Auth & Role protection)
│
└── README.md                     # Project documentation
```

---

## 🎨 Design System Specifications - Enterprise Marketplace UI

### Core Product Vision
- **Large-scale "sell anything" marketplace**
- **Multi-vendor support**
- **High conversion focus**
- **Designed for long browsing sessions**
- **Trust, clarity, and speed are top priorities**

### Visual Style & Mood
- **Clean, calm, and elegant** (no visual noise)
- **Soft neutral background** (off-white / light gray: `#F8F9FA` or `#FAFAFA`)
- **One strong but soft accent color** (muted orange `#FF8A65`, modern blue `#64B5F6`, or calm green `#81C784`)
- **Rounded cards** (border-radius: `12px` or `16px`)
- **Subtle shadows** (soft elevation: `0 2px 8px rgba(0,0,0,0.08)`)
- **Depth without heaviness** (layered but light)
- **Generous spacing** (consistent scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px)
- **Clear visual hierarchy** (typography scale, color contrast)
- **Premium modern sans-serif typography** (Inter, Poppins, or similar - high readability)

### Layout & Navigation Requirements
- **Sticky top navigation** (always visible, z-index: 100)
- **Centered global search bar** with autocomplete (prominent, accessible)
- **Category mega-menu** (Amazon-style but lighter - hover/click to reveal)
- **Cart icon with preview** (badge count, hover preview of items)
- **User account menu** with quick actions (dropdown with profile, orders, logout)

### Homepage Structure
1. **Hero Section**
   - Dynamic discount banners (rotating, auto-play)
   - Full-width or contained
   - Clear CTA buttons

2. **Horizontal Stories-Style Campaign Slider** (Trendyol-inspired)
   - Circular cards (avatar-style)
   - Brand deals
   - Flash sales
   - Swipeable on mobile

3. **Featured Categories Grid**
   - Icons or images
   - Category names
   - Modern grid layout (responsive)

4. **Modern Product Grid**
   - Consistent card design
   - Grid: 4 columns desktop, 2 columns tablet, 1 column mobile
   - Personalized recommendation section

5. **Vendor Spotlight Section**
   - Featured vendors
   - Vendor cards with logo and product preview

### Product Card Design (Critical Component)
**Visual Elements:**
- Rounded corners (`border-radius: 12px`)
- Soft shadow or thin border (`border: 1px solid #E5E7EB` or shadow)
- Large product image (aspect-ratio: 1:1, object-fit: cover)
- Discount percentage badge (top-right corner, bright accent color)
- Old price (strikethrough, gray) + new price (bold, accent color)
- Rating stars (5-star system, filled/unfilled)
- Review count (small text, gray)

**Interaction:**
- "Add to cart" button (primary CTA, clear and prominent)
- "Quick view" button (secondary, appears on hover)
- Hover effects (smooth scale `transform: scale(1.02)`, shadow elevation)
- Smooth transitions (`transition: all 0.2s ease`)

**Layout:**
```
┌─────────────────────┐
│   [Product Image]   │
│   [Discount Badge]  │
├─────────────────────┤
│ Product Name        │
│ Rating: ⭐⭐⭐⭐⭐ (123)│
│ ~~Old Price~~       │
│ New Price (Bold)    │
│ [Add to Cart]       │
└─────────────────────┘
```

### UX & Interaction Details
- **Skeleton loaders** for all lists (matching card structure)
- **Smooth micro-interactions** (hover, click, focus states)
- **Clear focus states** (keyboard navigation, accessibility)
- **Accessibility-friendly contrast** (WCAG AA compliant)
- **Sticky filters** on category pages (desktop sidebar, mobile drawer)
- **Fast scanning UX** (Amazon-level clarity - clear hierarchy, readable text)

### Mobile & Responsive Design
- **Mobile-first design** (design for mobile, enhance for desktop)
- **Bottom navigation** (sticky, always visible):
  - Home
  - Categories
  - Cart
  - Orders
  - Profile
- **Swipeable story campaigns** (horizontal scroll, snap points)
- **Thumb-friendly product cards** (large touch targets, min 44x44px)
- **Mobile filters** (drawer/modal, easy to open/close)

### Design System Requirements
1. **Reusable Components**
   - Buttons (primary, secondary, outline, ghost, sizes: sm, md, lg)
   - Badges (status, discount, category)
   - Cards (product, category, vendor, campaign)
   - Modals (quick view, filters, confirmations)
   - Inputs (text, search, select, checkbox, radio)
   - Navigation (header, footer, sidebar, bottom nav)

2. **Consistent Spacing Scale**
   - 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
   - Use Tailwind spacing scale

3. **Token-Based Colors**
   - Primary (accent color)
   - Secondary (neutral grays)
   - Success, Warning, Error
   - Background (off-white, light gray)
   - Text (dark gray, black)

4. **Typography Scale**
   - Display (large headings)
   - Heading 1, 2, 3, 4
   - Body (regular, medium, bold)
   - Small, Caption

5. **Component Library**
   - All components in `components/ui/` (Shadcn/ui)
   - Custom components in `components/` (product, cart, etc.)

### Advanced Requirements
- **Conversion-optimized layout** (clear CTAs, trust signals, easy navigation)
- **Trust signals** (ratings, reviews, secure checkout indicators, vendor badges)
- **Scalable for thousands of products** (pagination, infinite scroll, filters)
- **Ready for vendor and admin dashboards** (consistent design system)

### Implementation Order
1. **Design System Foundation** (colors, typography, spacing, tokens)
2. **Core Components** (Product Card, Navigation, Buttons, Badges)
3. **Layout Components** (Public, Customer, Vendor, Admin layouts)
4. **Homepage** (Hero, Campaigns, Categories, Product Grid)
5. **Product Pages** (Listing, Detail, Filters)
6. **Cart & Checkout** (Cart page, Checkout form, Confirmation)
7. **Mobile Optimization** (Bottom nav, responsive adjustments)
8. **UX Enhancements** (Loading states, error states, accessibility)

### 📊 Data Flow (تدفق البيانات)

```
Component (UI)
  ↓
Server Action (lib/actions/)
  ↓
Service (core/services/)
  ↓
Policy / Permission (core/domain/*/policy.ts)
  ↓
Port / Repository (core/ports/)
  ↓
API Call (lib/api/public/ or fetch)
  ↓
Backend (Django API)
```

### 🎯 Key Principles (المبادئ الأساسية)

1. **Separation of Concerns**: UI / Business Logic / Data
2. **Server Actions First**: Use Server Actions for mutations
3. **Core Layer**: All business logic in `core/`
4. **Type Safety**: 100% TypeScript coverage
5. **Security**: Middleware + Permissions
6. **SEO**: Clean URLs + Metadata

### ⏸️ Deferred Features (المؤجلة للمستقبل)

1. **Domain Events System** (`core/events/`) - For notifications, analytics, webhooks
2. **Background Jobs System** (`src/jobs/` + `app/api/cron/`) - For async tasks
3. **Comprehensive Testing Suite** (`tests/`) - After MVP launch

## Phase 5: Security & Hardening (Newly Added) 🛡️
- [/] **Backend Security**
    - [x] User System with Roles (Customer, Vendor, Admin)
    - [x] Implement JWT Authentication
      - [x] Install djangorestframework-simplejwt
      - [x] Configure JWT settings (Access Token: 15min, Refresh Token: 7days)
      - [x] Token Rotation & Blacklist
      - [x] User Registration API (POST /api/v1/auth/register/)
      - [x] User Login API (POST /api/v1/auth/login/)
      - [x] Refresh Token API (POST /api/v1/auth/refresh/)
      - [x] User Profile API (GET/PUT /api/v1/users/profile/)
      - [x] Password Change API (POST /api/v1/users/profile/change_password/)
      - [x] Email Verification System
        - [x] EmailVerification Model
        - [x] Verify Email API (POST /api/v1/auth/verify-email/)
        - [x] Resend Verification API (POST /api/v1/auth/resend-verification/)
        - [x] Gmail SMTP configuration
    - [x] Setup Role-Based Access Control (RBAC)
      - [x] Custom Permissions (IsCustomer, IsVendor, IsAdmin, IsVendorOwner)
      - [x] Permission classes in views
    - [x] Configure Rate Limiting & Throttling
      - [x] Login: 5 attempts/minute
      - [x] Register: 3 attempts/minute
      - [x] API calls: 1000/hour (authenticated), 100/hour (anonymous)
- [ ] **Frontend & Mobile Security**
    - [ ] Secure JWT Storage (HttpOnly / Secure Store)
    - [ ] Implement Content Security Policy (CSP)
- [/] **Infrastructure**
    - [x] Secure Environment Variables (Remove hardcoded secrets)
    - [ ] Setup SSL/TLS Certificates
