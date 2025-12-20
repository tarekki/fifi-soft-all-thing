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
    - [ ] Setup Next.js Frontend
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
    - [ ] Manual Product Entry Interface
    - [x] User Authentication APIs
      - [x] User Registration (with email verification)
      - [x] User Login (JWT tokens)
      - [x] User Profile Management
      - [x] Password Change
      - [x] Email Verification
    - [⏸️] Order APIs (Deferred - Waiting for Inventory Sync Solution)
      - [ ] Order Creation API
      - [ ] Order Detail & List APIs
      - [ ] Order Status Management
      - [ ] Commission Calculation Logic
      - **Note**: Requires inventory sync system to handle stock management properly
- [ ] **Web Frontend**
    - [ ] Homepage (Dual Brand)
    - [ ] Product Listing (Filters: Color/Size/Model)
    - [ ] Product Detail Page
    - [ ] Cart & Checkout (Manual)
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

## Phase 5: Security & Hardening (Newly Added) 🛡️
- [/] **Backend Security**
    - [x] User System with Roles (Customer, Vendor, Admin)
    - [x] Implement JWT Authentication
      - [x] Install djangorestframework-simplejwt
      - [x] Configure JWT settings (Access Token: 15min, Refresh Token: 7days)
      - [x] Token Rotation & Blacklist
      - [x] User Registration API (POST /api/users/register/)
      - [x] User Login API (POST /api/users/login/)
      - [x] Refresh Token API (POST /api/users/refresh/)
      - [x] User Profile API (GET/PUT /api/users/profile/)
      - [x] Password Change API (POST /api/users/profile/change_password/)
      - [x] Email Verification System
        - [x] EmailVerification Model
        - [x] Verify Email API (POST /api/users/verify-email/)
        - [x] Resend Verification API (POST /api/users/resend-verification/)
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
