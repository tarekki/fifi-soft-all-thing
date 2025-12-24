"""
URL configuration for core project.
إعدادات URLs للمشروع الرئيسي

This file defines all the URL routes for the application.
هذا الملف يحدد جميع مسارات URLs للتطبيق

For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,      # View للحصول على schema الـ API
    SpectacularRedocView,    # View لـ ReDoc documentation
    SpectacularSwaggerView,  # View لـ Swagger UI documentation
)


# Home Page View
# عرض الصفحة الرئيسية
def home_view(request):
    """
    Home page view - displays API information
    عرض الصفحة الرئيسية - يعرض معلومات عن الـ API
    """
    return JsonResponse({
        "success": True,
        "message": "Welcome to Trendyol-SY API",
        "data": {
            "version": "1.0.0",
            "description": "Multi-vendor e-commerce platform API for Syrian market",
            "api_version": "v1",
            "endpoints": {
                "admin": "/admin/",
                "api_v1": "/api/v1/",
                "api_schema": "/api/schema/",
                "swagger_ui": "/api/schema/swagger-ui/",
                "redoc": "/api/schema/redoc/",
            },
            "api_structure": {
                "auth": "/api/v1/auth/",
                "users": "/api/v1/users/",
                "vendors": "/api/v1/vendors/",
                "products": "/api/v1/products/",
            },
            "note": "Legacy API endpoints have been removed. Please use /api/v1/ endpoints only.",
            "docs": "Visit /api/schema/swagger-ui/ for interactive API documentation"
        },
        "errors": None
    })

# URL Patterns
# قائمة مسارات URLs للتطبيق
urlpatterns = [
    # Home Page
    # الصفحة الرئيسية
    path("", home_view, name="home"),
    
    # Django Admin Panel
    # لوحة إدارة Django
    path("admin/", admin.site.urls),
    
    # API Documentation (drf-spectacular)
    # توثيق الـ API - Swagger UI
    # الوصول: http://localhost:8000/api/schema/swagger-ui/
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    
    # Swagger UI - واجهة تفاعلية لاختبار الـ API
    # الوصول: http://localhost:8000/api/schema/swagger-ui/
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    
    # ReDoc - واجهة توثيق بديلة
    # الوصول: http://localhost:8000/api/schema/redoc/
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    
    # API URLs
    # مسارات الـ API
    
    # ========================================================================
    # API Version 1 (Main API)
    # API الإصدار الأول (الـ API الرئيسي)
    # ========================================================================
    # Structured API with versioning for future compatibility
    # API منظم مع versioning للتوافق المستقبلي
    # 
    # Endpoints:
    #   Authentication:
    #     POST /api/v1/auth/register/        - User registration
    #     POST /api/v1/auth/login/           - User login
    #     POST /api/v1/auth/refresh/          - Refresh token
    #     POST /api/v1/auth/verify-email/     - Verify email
    #     POST /api/v1/auth/resend-verification/ - Resend verification
    #   
    #   User Management:
    #     GET  /api/v1/users/profile/        - Get user profile
    #     PUT  /api/v1/users/profile/        - Update user profile
    #     POST /api/v1/users/profile/change_password/ - Change password
    #   
    #   Vendors:
    #     GET /api/v1/vendors/               - List all vendors
    #     GET /api/v1/vendors/{id}/          - Vendor details
    #   
    #   Products:
    #     GET /api/v1/products/              - List all products
    #     GET /api/v1/products/{id}/         - Product details
    #     GET /api/v1/products/{id}/variants/ - Product variants
    #     GET /api/v1/products/?vendor_slug=fifi - Filter by vendor
    #     GET /api/v1/products/?product_type=shoes - Filter by type
    #     GET /api/v1/products/?color=red    - Filter by color
    #     GET /api/v1/products/?size=38       - Filter by size
    #     GET /api/v1/products/?min_price=100000 - Filter by min price
    #     GET /api/v1/products/?max_price=500000 - Filter by max price
    #     GET /api/v1/products/?search=sneaker - Search products
    #     GET /api/v1/products/?ordering=-base_price - Order by price
    #
    #   Settings:
    #     GET /api/v1/settings/site/           - Site settings (name, logo, contact)
    #     GET /api/v1/settings/social/         - Social media links
    #     GET /api/v1/settings/languages/      - Available languages
    #     GET /api/v1/settings/navigation/     - Navigation menus
    #     GET /api/v1/settings/trust-signals/  - Trust signals
    #     GET /api/v1/settings/payment-methods/ - Payment methods
    #     GET /api/v1/settings/shipping-methods/ - Shipping methods
    #     GET /api/v1/settings/all/            - All settings combined
    path("api/v1/", include("core.api.v1.urls"), name="api-v1"),
    
    # ========================================================================
    # Settings API
    # API الإعدادات
    # ========================================================================
    # Public endpoints for site configuration (no authentication required)
    # نقاط عامة لتكوين الموقع (لا تتطلب مصادقة)
    path("api/v1/settings/", include("settings_app.urls", namespace="settings")),
]

# Media Files Configuration (Development Only)
# إعدادات ملفات Media (الصور والملفات المرفوعة) - للتطوير فقط
# في الإنتاج يجب استخدام خادم ويب (Nginx/Apache) لخدمة الملفات الثابتة
if settings.DEBUG:
    # إضافة مسار لخدمة ملفات Media في وضع التطوير
    # يسمح بالوصول للملفات المرفوعة مثل صور المنتجات
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
