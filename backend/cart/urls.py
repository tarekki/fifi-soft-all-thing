"""
Cart URL Configuration
إعدادات URLs للسلة

This module defines URL patterns for cart endpoints.
هذا الوحدة يعرّف أنماط URL لنقاط نهاية السلة.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet

# =============================================================================
# Router Configuration
# إعدادات Router
# =============================================================================

router = DefaultRouter()
router.register(r'', CartViewSet, basename='cart')

# =============================================================================
# URL Patterns
# أنماط URL
# =============================================================================

urlpatterns = [
    path('', include(router.urls)),
]

