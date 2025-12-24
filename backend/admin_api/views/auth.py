"""
Admin Authentication Views
عروض المصادقة للأدمن

هذا الملف يحتوي على جميع views للمصادقة في لوحة التحكم.
This file contains all authentication views for the admin panel.

Endpoints:
- POST /api/v1/admin/auth/login/   - Admin login
- POST /api/v1/admin/auth/logout/  - Admin logout
- POST /api/v1/admin/auth/refresh/ - Refresh access token
- GET  /api/v1/admin/auth/me/      - Get current admin info
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from admin_api.permissions import IsAdminUser
from admin_api.serializers.auth import (
    AdminLoginSerializer,
    AdminUserSerializer,
    AdminTokenRefreshSerializer,
)
from core.utils import success_response, error_response


# =============================================================================
# Custom Throttle for Admin Login
# معدل تحديد مخصص لتسجيل دخول الأدمن
# =============================================================================

class AdminLoginThrottle(AnonRateThrottle):
    """
    Rate limiting for admin login attempts.
    تحديد معدل محاولات تسجيل دخول الأدمن.
    
    Limits: 5 attempts per minute to prevent brute force attacks.
    الحدود: 5 محاولات في الدقيقة لمنع هجمات القوة الغاشمة.
    """
    rate = '5/minute'


# =============================================================================
# Admin Login View
# عرض تسجيل دخول الأدمن
# =============================================================================

class AdminLoginView(APIView):
    """
    Admin login endpoint.
    نقطة نهاية تسجيل دخول الأدمن.
    
    Authenticates admin users and returns JWT tokens.
    يصادق مستخدمي الأدمن ويعيد JWT tokens.
    
    Security:
    - Rate limited (5 attempts/minute)
    - Only staff users can login
    - Returns both access and refresh tokens
    - Logs login activity
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AdminLoginThrottle]
    
    @extend_schema(
        summary='Admin Login',
        description='Authenticate admin user and get JWT tokens',
        request=AdminLoginSerializer,
        responses={
            200: OpenApiResponse(
                description='Login successful',
                response=AdminUserSerializer
            ),
            400: OpenApiResponse(description='Invalid credentials'),
            429: OpenApiResponse(description='Too many login attempts'),
        },
        tags=['Admin Auth'],
    )
    def post(self, request):
        """
        Authenticate admin user.
        مصادقة المستخدم الأدمن.
        
        Request Body:
            - email: Admin email address
            - password: Admin password
            
        Returns:
            - access: JWT access token (15 minutes)
            - refresh: JWT refresh token (7 days)
            - user: Admin user information
        """
        serializer = AdminLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تسجيل الدخول / Login failed'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Create tokens and get user
        # إنشاء tokens والحصول على المستخدم
        result = serializer.save()
        
        # Serialize user data
        # تحويل بيانات المستخدم
        user_serializer = AdminUserSerializer(result['user'])
        
        # Log successful login
        # تسجيل تسجيل الدخول الناجح
        self._log_login(request, result['user'])
        
        return success_response(
            data={
                'access': result['access'],
                'refresh': result['refresh'],
                'user': user_serializer.data,
            },
            message=_('تم تسجيل الدخول بنجاح / Login successful')
        )
    
    def _log_login(self, request, user):
        """
        Log admin login activity.
        تسجيل نشاط تسجيل الدخول.
        """
        # TODO: Implement activity logging
        # يمكن إضافة تسجيل النشاط لاحقاً
        pass


# =============================================================================
# Admin Logout View
# عرض تسجيل خروج الأدمن
# =============================================================================

class AdminLogoutView(APIView):
    """
    Admin logout endpoint.
    نقطة نهاية تسجيل خروج الأدمن.
    
    Blacklists the refresh token to prevent reuse.
    يضيف refresh token للقائمة السوداء لمنع إعادة الاستخدام.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Admin Logout',
        description='Logout admin and blacklist refresh token',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'refresh': {'type': 'string', 'description': 'Refresh token to blacklist'}
                },
                'required': ['refresh']
            }
        },
        responses={
            200: OpenApiResponse(description='Logout successful'),
            400: OpenApiResponse(description='Invalid token'),
        },
        tags=['Admin Auth'],
    )
    def post(self, request):
        """
        Logout admin user.
        تسجيل خروج المستخدم الأدمن.
        
        Request Body:
            - refresh: Refresh token to blacklist
        """
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return error_response(
                message=_('Refresh token مطلوب / Refresh token required'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Blacklist the refresh token
            # إضافة refresh token للقائمة السوداء
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return success_response(
                message=_('تم تسجيل الخروج بنجاح / Logout successful')
            )
            
        except TokenError:
            return error_response(
                message=_('التوكن غير صالح / Invalid token'),
                status_code=status.HTTP_400_BAD_REQUEST
            )


# =============================================================================
# Admin Me View
# عرض معلومات الأدمن الحالي
# =============================================================================

class AdminMeView(APIView):
    """
    Get current admin user information.
    الحصول على معلومات المستخدم الأدمن الحالي.
    
    Returns comprehensive admin data including:
    - Basic info (id, email, name)
    - Role and permissions
    - Last login time
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Get Current Admin',
        description='Get current authenticated admin user information',
        responses={
            200: AdminUserSerializer,
            401: OpenApiResponse(description='Not authenticated'),
            403: OpenApiResponse(description='Not an admin'),
        },
        tags=['Admin Auth'],
    )
    def get(self, request):
        """
        Get current admin info.
        الحصول على معلومات الأدمن الحالي.
        
        Returns:
            Admin user information with role and permissions.
        """
        serializer = AdminUserSerializer(request.user)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب معلومات الأدمن / Admin info retrieved')
        )


# =============================================================================
# Admin Token Refresh View
# عرض تجديد توكن الأدمن
# =============================================================================

class AdminTokenRefreshView(APIView):
    """
    Refresh admin access token.
    تجديد access token للأدمن.
    
    Uses refresh token to get a new access token.
    يستخدم refresh token للحصول على access token جديد.
    
    Security:
    - Verifies user is still admin
    - Verifies user is still active
    """
    
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary='Refresh Admin Token',
        description='Get new access token using refresh token',
        request=AdminTokenRefreshSerializer,
        responses={
            200: OpenApiResponse(description='Token refreshed successfully'),
            400: OpenApiResponse(description='Invalid or expired token'),
        },
        tags=['Admin Auth'],
    )
    def post(self, request):
        """
        Refresh access token.
        تجديد access token.
        
        Request Body:
            - refresh: Valid refresh token
            
        Returns:
            - access: New access token
        """
        serializer = AdminTokenRefreshSerializer(data=request.data)
        
        if not serializer.is_valid():
            return error_response(
                message=_('فشل تجديد التوكن / Token refresh failed'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        return success_response(
            data={
                'access': serializer.validated_data['access'],
            },
            message=_('تم تجديد التوكن بنجاح / Token refreshed successfully')
        )

