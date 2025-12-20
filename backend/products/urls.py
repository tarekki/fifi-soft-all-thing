"""
Product URL Configuration
إعدادات URLs للمنتجات

This module defines URL routes for Product API endpoints.
هذا الملف يحدد مسارات URLs لـ endpoints المنتجات
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

# Create router instance
# إنشاء مثيل router
router = DefaultRouter()

# Register ProductViewSet with router
# تسجيل ProductViewSet مع router
# This automatically creates:
# - GET /api/products/                    (list)
# - GET /api/products/{id}/               (retrieve)
# - GET /api/products/{id}/variants/      (custom action)
router.register(r'products', ProductViewSet, basename='product')

# URL patterns
# قائمة مسارات URLs
urlpatterns = [
    # Include router URLs
    # تضمين URLs من router
    path('', include(router.urls)),
]

