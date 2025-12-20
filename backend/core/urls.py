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
        "message": "Welcome to Trendyol-SY API",
        "version": "1.0.0",
        "description": "Multi-vendor e-commerce platform API for Syrian market",
        "endpoints": {
            "admin": "/admin/",
            "api_schema": "/api/schema/",
            "swagger_ui": "/api/schema/swagger-ui/",
            "redoc": "/api/schema/redoc/",
        },
        "docs": "Visit /api/schema/swagger-ui/ for interactive API documentation"
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
    # مسارات الـ API (vendors, products, orders)
    
    # Vendor API
    # API البائعين
    # Endpoints:
    #   GET /api/vendors/          - قائمة جميع البائعين
    #   GET /api/vendors/{id}/     - تفاصيل بائع معين
    path("api/", include("vendors.urls")),
    
    # Product API
    # API المنتجات
    # Endpoints:
    #   GET /api/products/                    - قائمة جميع المنتجات
    #   GET /api/products/{id}/               - تفاصيل منتج معين (مع جميع المتغيرات)
    #   GET /api/products/{id}/variants/      - متغيرات منتج معين
    #   GET /api/products/?vendor_slug=fifi   - فلترة حسب البائع
    #   GET /api/products/?product_type=shoes - فلترة حسب النوع
    #   GET /api/products/?color=red          - فلترة حسب اللون
    #   GET /api/products/?size=38             - فلترة حسب المقاس
    #   GET /api/products/?min_price=100000   - فلترة حسب السعر الأدنى
    #   GET /api/products/?max_price=500000   - فلترة حسب السعر الأعلى
    #   GET /api/products/?search=sneaker     - بحث في الاسم والوصف
    #   GET /api/products/?ordering=-base_price - ترتيب حسب السعر
    path("api/", include("products.urls")),
    
    # Order API - سيتم إضافتها لاحقاً
    # API الطلبات - سيتم إضافتها لاحقاً
    # path("api/", include("orders.urls")),
]

# Media Files Configuration (Development Only)
# إعدادات ملفات Media (الصور والملفات المرفوعة) - للتطوير فقط
# في الإنتاج يجب استخدام خادم ويب (Nginx/Apache) لخدمة الملفات الثابتة
if settings.DEBUG:
    # إضافة مسار لخدمة ملفات Media في وضع التطوير
    # يسمح بالوصول للملفات المرفوعة مثل صور المنتجات
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
