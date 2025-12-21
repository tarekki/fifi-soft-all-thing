"""
Order URL Configuration
إعدادات URLs للطلبات

This module defines URL patterns for order-related API endpoints.
هذا الوحدة يعرّف أنماط URL لـ endpoints الطلبات في الـ API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import OrderViewSet

# ============================================================================
# Router Configuration
# إعدادات Router
# ============================================================================

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

# ============================================================================
# URL Patterns
# أنماط URL
# ============================================================================

urlpatterns = [
    # Include router URLs
    # تضمين URLs من router
    path('', include(router.urls)),
]

