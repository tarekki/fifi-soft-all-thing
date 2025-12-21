"""
Authentication URLs for API v1
مسارات المصادقة لـ API الإصدار الأول

This module defines authentication-related endpoints.
هذا الوحدة يعرّف نقاط نهاية المصادقة.

Endpoints:
- POST /api/v1/auth/register/ - User registration
- POST /api/v1/auth/login/ - User login
- POST /api/v1/auth/refresh/ - Refresh access token
- POST /api/v1/auth/verify-email/ - Verify email address
- POST /api/v1/auth/resend-verification/ - Resend verification email
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import (
    UserRegistrationView,
    UserLoginView,
    verify_email,
    resend_verification_email,
)

# ============================================================================
# Authentication URL Patterns
# أنماط URL للمصادقة
# ============================================================================

urlpatterns = [
    # User Registration
    # تسجيل المستخدم
    path('register/', UserRegistrationView.as_view(), name='api-v1-auth-register'),
    
    # User Login
    # تسجيل الدخول
    path('login/', UserLoginView.as_view(), name='api-v1-auth-login'),
    
    # Refresh Token
    # تجديد Token
    path('refresh/', TokenRefreshView.as_view(), name='api-v1-auth-refresh'),
    
    # Email Verification
    # التحقق من البريد الإلكتروني
    path('verify-email/', verify_email, name='api-v1-auth-verify-email'),
    
    # Resend Verification Email
    # إعادة إرسال بريد التحقق
    path('resend-verification/', resend_verification_email, name='api-v1-auth-resend-verification'),
]

