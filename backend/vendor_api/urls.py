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
]

