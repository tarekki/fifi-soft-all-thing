"""
User URLs - API Routing
مسارات المستخدمين - توجيه الـ API

This module defines URL patterns for user-related API endpoints.
هذا الوحدة تعرّف أنماط URL لـ endpoints المستخدمين في الـ API.

URL Patterns:
- POST /api/users/register/ - User registration
- POST /api/users/login/ - User login
- POST /api/users/refresh/ - Refresh access token
- GET /api/users/profile/ - Get user profile
- PUT /api/users/profile/ - Update user profile
- POST /api/users/profile/change_password/ - Change password
- POST /api/users/verify-email/ - Verify email address
- POST /api/users/resend-verification/ - Resend verification email
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserRegistrationView,
    UserLoginView,
    UserProfileViewSet,
    verify_email,
    resend_verification_email,
)

# ============================================================================
# Router Configuration
# إعدادات Router
# ============================================================================

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')

# ============================================================================
# URL Patterns
# أنماط URL
# ============================================================================

urlpatterns = [
    # Authentication endpoints
    # نقاط نهاية المصادقة
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Email verification endpoints
    # نقاط نهاية التحقق من البريد الإلكتروني
    path('verify-email/', verify_email, name='verify-email'),
    path('resend-verification/', resend_verification_email, name='resend-verification'),
    
    # Profile endpoints (from router)
    # نقاط نهاية الملف الشخصي (من router)
    path('', include(router.urls)),
]

