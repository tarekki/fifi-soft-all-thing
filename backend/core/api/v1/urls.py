"""
API v1 URL Configuration
إعدادات URLs لـ API الإصدار الأول

This module defines all URL patterns for API version 1.
هذا الوحدة يعرّف جميع أنماط URL لـ API الإصدار الأول.

API Structure:
/api/v1/
  /auth/          - Authentication endpoints (register, login, etc.)
  /users/         - User management endpoints
  /vendors/       - Vendor management endpoints
  /products/      - Product management endpoints
  /orders/        - Order management endpoints (future)
"""

from django.urls import path, include

# Import v1 API URLs
# استيراد URLs لـ API الإصدار الأول
from .auth_urls import urlpatterns as auth_urls
from .users_urls import urlpatterns as users_urls
from vendors.urls import urlpatterns as vendors_urls
from products.urls import urlpatterns as products_urls
from orders.urls import urlpatterns as orders_urls
from .views import api_v1_home

# ============================================================================
# API v1 URL Patterns
# أنماط URL لـ API الإصدار الأول
# ============================================================================

urlpatterns = [
    # API v1 Home - Information about API v1 endpoints
    # الصفحة الرئيسية لـ API v1 - معلومات عن endpoints
    path("", api_v1_home, name="api-v1-home"),
    
    # Authentication endpoints
    # نقاط نهاية المصادقة
    # /api/v1/auth/register/, /api/v1/auth/login/, etc.
    path("auth/", include(auth_urls), name="api-v1-auth"),
    
    # User management endpoints
    # نقاط نهاية إدارة المستخدمين
    # /api/v1/users/profile/, etc.
    path("users/", include(users_urls), name="api-v1-users"),
    
    # Vendor endpoints
    # نقاط نهاية البائعين
    # /api/v1/vendors/, /api/v1/vendors/{id}/
    path("vendors/", include(vendors_urls), name="api-v1-vendors"),
    
    # Product endpoints
    # نقاط نهاية المنتجات
    # /api/v1/products/, /api/v1/products/{id}/
    path("products/", include(products_urls), name="api-v1-products"),
    
    # Order endpoints
    # نقاط نهاية الطلبات
    # /api/v1/orders/, /api/v1/orders/{id}/
    path("orders/", include(orders_urls), name="api-v1-orders"),
]

