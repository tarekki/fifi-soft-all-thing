"""
Vendor API URL Configuration
إعدادات URLs لـ API البائعين

This module defines all URL patterns for Vendor API.
هذا الوحدة يعرّف جميع أنماط URL لـ API البائعين.

API Structure:
/api/v1/vendor/
  /auth/login/                - Vendor login
  /auth/refresh/              - Refresh access token (future)
  /dashboard/overview/        - Dashboard KPIs and statistics
  /dashboard/sales-chart/     - Sales chart data (future)
  /dashboard/recent-orders/   - Recent orders list (future)
"""

from django.urls import path, include
from vendor_api.views.dashboard import VendorDashboardOverviewView
from vendor_api.views.auth import VendorLoginView, VendorMeView, VendorPasswordChangeView
from vendor_api.views.application import VendorApplicationView
from vendor_api.views.products import VendorProductListCreateView, VendorProductDetailView
from vendor_api.views.categories import VendorCategoryListView


# =============================================================================
# Authentication URL Patterns
# أنماط URLs للمصادقة
# =============================================================================

auth_urlpatterns = [
    # POST /api/v1/vendor/auth/login/
    # تسجيل دخول البائع
    path(
        'login/',
        VendorLoginView.as_view(),
        name='vendor-auth-login'
    ),
    # GET /api/v1/vendor/auth/me/
    # معلومات البائع الحالي
    path(
        'me/',
        VendorMeView.as_view(),
        name='vendor-auth-me'
    ),
    # POST /api/v1/vendor/auth/change-password/
    # تغيير كلمة مرور البائع
    path(
        'change-password/',
        VendorPasswordChangeView.as_view(),
        name='vendor-auth-change-password'
    ),
]


# =============================================================================
# Dashboard URL Patterns
# أنماط URLs للوحة التحكم
# =============================================================================

dashboard_urlpatterns = [
    # GET /api/v1/vendor/dashboard/overview/
    # نظرة عامة (KPIs)
    path(
        'overview/',
        VendorDashboardOverviewView.as_view(),
        name='vendor-dashboard-overview'
    ),
]


# =============================================================================
# Categories URL Patterns
# أنماط URLs للفئات
# =============================================================================

categories_urlpatterns = [
    # GET /api/v1/vendor/categories/
    # قائمة الفئات (قراءة فقط)
    path(
        '',
        VendorCategoryListView.as_view(),
        name='vendor-categories-list'
    ),
]


# =============================================================================
# Products URL Patterns
# أنماط URLs للمنتجات
# =============================================================================

products_urlpatterns = [
    # GET, POST /api/v1/vendor/products/
    # قائمة المنتجات وإنشاء منتج جديد
    path(
        '',
        VendorProductListCreateView.as_view(),
        name='vendor-products-list-create'
    ),
    # GET, PUT, DELETE /api/v1/vendor/products/{id}/
    # تفاصيل المنتج، تحديث، حذف
    path(
        '<int:pk>/',
        VendorProductDetailView.as_view(),
        name='vendor-products-detail'
    ),
]


# =============================================================================
# Main URL Patterns
# أنماط URLs الرئيسية
# =============================================================================

urlpatterns = [
    # Authentication endpoints
    # نقاط نهاية المصادقة
    path('auth/', include((auth_urlpatterns, 'auth'))),
    
    # Vendor Application endpoint (public)
    # نقطة نهاية طلب انضمام البائع (عامة)
    path(
        'apply/',
        VendorApplicationView.as_view(),
        name='vendor-apply'
    ),
    
    # Dashboard endpoints
    # نقاط نهاية لوحة التحكم
    path('dashboard/', include((dashboard_urlpatterns, 'dashboard'))),
    
    # Categories endpoints (read-only)
    # نقاط نهاية الفئات (قراءة فقط)
    path('categories/', include((categories_urlpatterns, 'categories'))),
    
    # Products endpoints
    # نقاط نهاية المنتجات
    path('products/', include((products_urlpatterns, 'products'))),
]

