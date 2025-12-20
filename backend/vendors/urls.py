"""
Vendor URL Configuration
إعدادات URLs للبائعين

This module defines URL routes for Vendor API endpoints.
هذا الملف يحدد مسارات URLs لـ endpoints البائعين
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet

# Create router instance
# إنشاء مثيل router
router = DefaultRouter()

# Register VendorViewSet with router
# تسجيل VendorViewSet مع router
# This automatically creates:
# - GET /api/vendors/          (list)
# - GET /api/vendors/{id}/     (retrieve)
router.register(r'vendors', VendorViewSet, basename='vendor')

# URL patterns
# قائمة مسارات URLs
urlpatterns = [
    # Include router URLs
    # تضمين URLs من router
    path('', include(router.urls)),
]

