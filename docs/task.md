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
    - [ ] Homepage (Dual Brand) - Deferred until design is ready
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
│   │   ├── seo/                # SEO utilities
│   │   │   ├── metadata.ts     # Metadata generators
│   │   │   └── sitemap.ts      # Sitemap generation
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
