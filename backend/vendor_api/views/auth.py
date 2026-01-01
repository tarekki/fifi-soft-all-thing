"""
Vendor Authentication Views
عروض مصادقة البائعين

هذا الملف يحتوي على views للمصادقة في Vendor API.
This file contains views for authentication in Vendor API.
"""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from vendor_api.serializers.auth import VendorLoginSerializer, VendorPasswordChangeSerializer
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.permissions import IsVendorUser
from core.utils import success_response, error_response
from users.models import VendorUser
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# Vendor Login View
# عرض تسجيل دخول البائع
# =============================================================================

class VendorLoginView(APIView):
    """
    Vendor login endpoint.
    نقطة نهاية تسجيل دخول البائع.
    
    Authenticates vendor users and returns JWT tokens.
    يصادق مستخدمي البائعين ويعيد JWT tokens.
    
    Security Features:
    - Rate limiting (throttling)
    - Validates vendor role
    - Validates VendorUser association
    - Validates vendor is active
    - Returns vendor information with tokens
    
    ميزات الأمان:
    - تحديد معدل الطلبات (throttling)
    - التحقق من دور البائع
    - التحقق من ربط VendorUser
    - التحقق من أن البائع نشط
    - إرجاع معلومات البائع مع tokens
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Login',
        description='Authenticate vendor user and get JWT tokens',
        request=VendorLoginSerializer,
        responses={
            200: OpenApiResponse(
                description='Login successful',
                response={
                    'type': 'object',
                    'properties': {
                        'success': {'type': 'boolean'},
                        'message': {'type': 'string'},
                        'data': {
                            'type': 'object',
                            'properties': {
                                'access': {'type': 'string'},
                                'refresh': {'type': 'string'},
                                'user': {'type': 'object'},
                                'vendor': {'type': 'object'},
                                'vendor_user': {'type': 'object'},
                            }
                        }
                    }
                }
            ),
            400: OpenApiResponse(description='Invalid credentials or validation error'),
            429: OpenApiResponse(description='Too many login attempts'),
        },
        tags=['Vendor Auth'],
    )
    def post(self, request):
        """
        Authenticate vendor user.
        مصادقة مستخدم البائع.
        
        Request Body:
            - email: Vendor email address
            - password: Vendor password
            
        Returns:
            - access: JWT access token (15 minutes)
            - refresh: JWT refresh token (7 days)
            - user: User information
            - vendor: Vendor information
            - vendor_user: VendorUser information (is_owner, permissions)
        """
        serializer = VendorLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            # Log failed login attempt (for security monitoring)
            # تسجيل محاولة تسجيل دخول فاشلة (لمراقبة الأمان)
            email = request.data.get('email', 'unknown')
            logger.warning(f'Failed vendor login attempt: {email}')
            
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.validated_data['user']
        vendor_user = serializer.validated_data['vendor_user']
        vendor = vendor_user.vendor
        
        # Additional security check: Verify vendor is still active
        # فحص أمان إضافي: التحقق من أن البائع لا يزال نشطاً
        if not vendor.is_active:
            logger.warning(f'Vendor login attempt for inactive vendor: {vendor.name} (User: {user.email})')
            return error_response(
                message=_('البائع غير نشط. يرجى التواصل مع الدعم / Vendor is inactive. Please contact support'),
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Log successful login (for audit trail)
        # تسجيل تسجيل الدخول الناجح (للتتبع)
        logger.info(f'Vendor login successful: {user.email} (Vendor: {vendor.name})')
        
        # Generate JWT tokens
        # إنشاء JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Prepare user data
        # إعداد بيانات المستخدم
        user_data = {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone': user.phone,
            'role': user.role,
            'is_active': user.is_active,
        }
        
        # Prepare vendor data
        # إعداد بيانات البائع
        logo_url = None
        if vendor.logo:
            try:
                logo_url = request.build_absolute_uri(vendor.logo.url)
            except:
                logo_url = None
        
        vendor_data = {
            'id': vendor.id,
            'name': vendor.name,
            'slug': vendor.slug,
            'description': vendor.description,
            'logo': logo_url,
            'commission_rate': str(vendor.commission_rate),
            'is_active': vendor.is_active,
        }
        
        # Prepare vendor_user data
        # إعداد بيانات VendorUser
        vendor_user_data = {
            'id': vendor_user.id,
            'is_owner': vendor_user.is_owner,
            'permissions': vendor_user.permissions or {},
        }
        
        return success_response(
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
                'vendor': vendor_data,
                'vendor_user': vendor_user_data,
            },
            message=_('تم تسجيل الدخول بنجاح / Login successful'),
            status_code=status.HTTP_200_OK
        )


# =============================================================================
# Vendor Me View
# عرض معلومات البائع الحالي
# =============================================================================

class VendorMeView(APIView):
    """
    Get current vendor information.
    الحصول على معلومات البائع الحالي.
    
    Returns:
        - user: User information
        - vendor: Vendor information
        - vendor_user: VendorUser information
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Current Vendor Info',
        description='Get authenticated vendor user information',
        responses={
            200: OpenApiResponse(
                description='Vendor information',
                response={
                    'type': 'object',
                    'properties': {
                        'user': {'type': 'object'},
                        'vendor': {'type': 'object'},
                        'vendor_user': {'type': 'object'},
                    }
                }
            ),
            401: OpenApiResponse(description='Unauthorized'),
        },
        tags=['Vendor Auth'],
    )
    def get(self, request):
        """
        Get current vendor information.
        الحصول على معلومات البائع الحالي.
        """
        try:
            vendor_user = VendorUser.objects.select_related('vendor', 'user').get(user=request.user)
            vendor = vendor_user.vendor
            user = request.user
            
            # Prepare user data
            # إعداد بيانات المستخدم
            user_data = {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'role': user.role,
                'is_active': user.is_active,
            }
            
            # Prepare vendor data
            # إعداد بيانات البائع
            logo_url = None
            if vendor.logo:
                try:
                    logo_url = request.build_absolute_uri(vendor.logo.url)
                except:
                    logo_url = None
            
            vendor_data = {
                'id': vendor.id,
                'name': vendor.name,
                'slug': vendor.slug,
                'description': vendor.description,
                'logo': logo_url,
                'commission_rate': str(vendor.commission_rate),
                'is_active': vendor.is_active,
            }
            
            # Prepare vendor_user data
            # إعداد بيانات VendorUser
            vendor_user_data = {
                'id': vendor_user.id,
                'is_owner': vendor_user.is_owner,
                'permissions': vendor_user.permissions or {},
            }
            
            return success_response(
                data={
                    'user': user_data,
                    'vendor': vendor_data,
                    'vendor_user': vendor_user_data,
                },
                message=_('تم جلب معلومات البائع بنجاح / Vendor information retrieved successfully'),
                status_code=status.HTTP_200_OK
            )
            
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا الحساب / No vendor associated with this account'),
                status_code=status.HTTP_404_NOT_FOUND
            )


# =============================================================================
# Vendor Password Change View
# عرض تغيير كلمة مرور البائع
# =============================================================================

class VendorPasswordChangeView(APIView):
    """
    Change vendor password.
    تغيير كلمة مرور البائع.
    
    Requires:
    - Current password (for verification)
    - New password (minimum 8 characters)
    - Confirm password (must match new password)
    
    Security:
    - Only authenticated vendors can change their password
    - Current password must be verified
    - New password must meet strength requirements
    
    يتطلب:
    - كلمة المرور الحالية (للتحقق)
    - كلمة المرور الجديدة (8 أحرف على الأقل)
    - تأكيد كلمة المرور (يجب أن تطابق كلمة المرور الجديدة)
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم تغيير كلمة المرور
    - يجب التحقق من كلمة المرور الحالية
    - يجب أن تلبي كلمة المرور الجديدة متطلبات القوة
    """
    
    permission_classes = [IsVendorUser]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Change Vendor Password',
        description='Change vendor account password',
        request=VendorPasswordChangeSerializer,
        responses={
            200: OpenApiResponse(description='Password changed successfully'),
            400: OpenApiResponse(description='Validation error or incorrect current password'),
            401: OpenApiResponse(description='Unauthorized'),
        },
        tags=['Vendor Auth'],
    )
    def post(self, request):
        """
        Change vendor password.
        تغيير كلمة مرور البائع.
        
        Request Body:
            - current_password: Current password (for verification)
            - new_password: New password (minimum 8 characters)
            - confirm_password: Confirm new password (must match)
            
        Returns:
            Success message
        """
        serializer = VendorPasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data['new_password']
            
            # Set new password
            # تعيين كلمة المرور الجديدة
            user.set_password(new_password)
            user.save(update_fields=['password'])
            
            return success_response(
                message=_('تم تغيير كلمة المرور بنجاح / Password changed successfully'),
                status_code=status.HTTP_200_OK
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

