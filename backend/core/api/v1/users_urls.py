"""
User Management URLs for API v1
مسارات إدارة المستخدمين لـ API الإصدار الأول

This module defines user management endpoints.
هذا الوحدة يعرّف نقاط نهاية إدارة المستخدمين.

Endpoints:
- GET /api/v1/users/profile/ - Get user profile
- PUT /api/v1/users/profile/ - Update user profile
- POST /api/v1/users/profile/change_password/ - Change password
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from users.views import UserProfileViewSet

# ============================================================================
# Router Configuration
# إعدادات Router
# ============================================================================

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='api-v1-user-profile')

# ============================================================================
# User Management URL Patterns
# أنماط URL لإدارة المستخدمين
# ============================================================================

urlpatterns = [
    # Profile endpoints (from router)
    # نقاط نهاية الملف الشخصي (من router)
    path('', include(router.urls)),
]

