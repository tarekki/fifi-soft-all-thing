"""
User Views - API Endpoints
عروض المستخدمين - نقاط نهاية الـ API

This module defines API views for user authentication and management.
هذا الوحدة تعرّف عروض API للمصادقة وإدارة المستخدمين.

Endpoints:
- POST /api/users/register/ - User registration
- POST /api/users/login/ - User login (JWT tokens)
- POST /api/users/refresh/ - Refresh access token
- GET /api/users/profile/ - Get user profile
- PUT /api/users/profile/ - Update user profile
- POST /api/users/change-password/ - Change password
- POST /api/users/verify-email/ - Verify email address
- POST /api/users/resend-verification/ - Resend verification email
"""

from rest_framework import status, generics, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse

from core.utils import success_response, error_response

from .models import User, UserProfile, EmailVerification
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    EmailVerificationSerializer,
)
from .permissions import IsCustomer, IsVendor, IsAdmin


# ============================================================================
# User Registration View
# عرض تسجيل المستخدم
# ============================================================================

class UserRegistrationView(generics.CreateAPIView):
    """
    User Registration Endpoint
    نقطة نهاية تسجيل المستخدم
    
    POST /api/users/register/
    
    Creates a new user account and sends verification email.
    ينشئ حساب مستخدم جديد ويرسل بريد التحقق.
    """
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Anyone can register
    throttle_classes = [AnonRateThrottle]
    throttle_scope = 'register'  # 3 attempts per minute
    
    def create(self, request, *args, **kwargs):
        """
        Create user and send verification email
        إنشاء مستخدم وإرسال بريد التحقق
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create email verification token
        # إنشاء رمز التحقق من البريد الإلكتروني
        token = EmailVerification.generate_token()
        expires_at = timezone.now() + timedelta(days=1)  # Valid for 24 hours
        
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send verification email
        # إرسال بريد التحقق
        try:
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            send_mail(
                subject=f"{settings.EMAIL_SUBJECT_PREFIX}Verify Your Email",
                message=f"""
                مرحباً {user.full_name},
                
                شكراً لتسجيلك في Trendyol-SY!
                
                يرجى التحقق من بريدك الإلكتروني بالنقر على الرابط التالي:
                {verification_url}
                
                هذا الرابط صالح لمدة 24 ساعة.
                
                إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
                
                مع تحيات فريق Trendyol-SY
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log error but don't fail registration
            # تسجيل الخطأ ولكن لا تفشل عملية التسجيل
            print(f"Error sending verification email: {e}")
        
        # Generate JWT tokens
        # إنشاء JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Return user data and tokens using standard response format
        # إرجاع بيانات المستخدم والـ tokens باستخدام تنسيق الاستجابة الموحد
        return success_response(
            data={
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            },
            message='User registered successfully. Please check your email for verification.',
            status_code=status.HTTP_201_CREATED
        )


# ============================================================================
# User Login View
# عرض تسجيل الدخول
# ============================================================================

class UserLoginView(generics.GenericAPIView):
    """
    User Login Endpoint
    نقطة نهاية تسجيل الدخول
    
    POST /api/users/login/
    
    Authenticates user and returns JWT tokens.
    يتحقق من المستخدم ويعيد JWT tokens.
    """
    
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]  # Anyone can login
    throttle_classes = [AnonRateThrottle]
    throttle_scope = 'login'  # 5 attempts per minute
    
    def post(self, request, *args, **kwargs):
        """
        Authenticate user and return tokens
        التحقق من المستخدم وإرجاع tokens
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        # إنشاء JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Return user data and tokens using standard response format
        # إرجاع بيانات المستخدم والـ tokens باستخدام تنسيق الاستجابة الموحد
        return success_response(
            data={
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            },
            message='Login successful.',
            status_code=status.HTTP_200_OK
        )


# ============================================================================
# User Profile ViewSet
# ViewSet للملف الشخصي
# ============================================================================

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    User Profile Management
    إدارة الملف الشخصي
    
    GET /api/users/profile/ - Get current user profile
    PUT /api/users/profile/ - Update current user profile
    """
    
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]  # Must be authenticated
    
    def get_queryset(self):
        """
        Return only current user
        إرجاع المستخدم الحالي فقط
        """
        return User.objects.filter(id=self.request.user.id)
    
    def get_serializer_class(self):
        """
        Use update serializer for PUT/PATCH
        استخدام مسلسل التحديث لـ PUT/PATCH
        """
        if self.action in ['update', 'partial_update']:
            return UserProfileUpdateSerializer
        return UserProfileSerializer
    
    def get_object(self):
        """
        Return current user
        إرجاع المستخدم الحالي
        """
        return self.request.user
    
    @action(detail=False, methods=['post'], serializer_class=PasswordChangeSerializer)
    def change_password(self, request):
        """
        Change user password
        تغيير كلمة مرور المستخدم
        
        POST /api/users/profile/change_password/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(
            data=None,
            message='Password changed successfully.',
            status_code=status.HTTP_200_OK
        )


# ============================================================================
# Email Verification View
# عرض التحقق من البريد الإلكتروني
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email address
    التحقق من البريد الإلكتروني
    
    POST /api/users/verify-email/
    
    Body: {"token": "verification_token"}
    """
    serializer = EmailVerificationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    token = serializer.validated_data['token']
    
    try:
        verification = EmailVerification.objects.get(token=token)
    except EmailVerification.DoesNotExist:
        return error_response(
            message='Invalid verification token.',
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already verified
    # التحقق من إذا كان تم التحقق بالفعل
    if verification.is_verified:
        return success_response(
            data=None,
            message='Email already verified.',
            status_code=status.HTTP_200_OK
        )
    
    # Check if token expired
    # التحقق من إذا انتهت صلاحية الرمز
    if verification.is_expired():
        return error_response(
            message='Verification token has expired. Please request a new one.',
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Mark as verified
    # وضع علامة كـ verified
    verification.is_verified = True
    verification.save()
    
    # Activate user account
    # تفعيل حساب المستخدم
    user = verification.user
    user.is_active = True
    user.save()
    
    return success_response(
        data=None,
        message='Email verified successfully. Your account is now active.',
        status_code=status.HTTP_200_OK
    )


# ============================================================================
# Resend Verification Email View
# عرض إعادة إرسال بريد التحقق
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """
    Resend verification email
    إعادة إرسال بريد التحقق
    
    POST /api/users/resend-verification/
    """
    user = request.user
    
    # Check if already verified
    # التحقق من إذا كان تم التحقق بالفعل
    try:
        verification = user.email_verification
        if verification.is_verified:
            return success_response(
                data=None,
                message='Email already verified.',
                status_code=status.HTTP_200_OK
            )
    except EmailVerification.DoesNotExist:
        # Create new verification if doesn't exist
        # إنشاء تحقق جديد إذا لم يكن موجوداً
        token = EmailVerification.generate_token()
        expires_at = timezone.now() + timedelta(days=1)
        verification = EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
    else:
        # Generate new token
        # إنشاء رمز جديد
        verification.token = EmailVerification.generate_token()
        verification.expires_at = timezone.now() + timedelta(days=1)
        verification.is_verified = False
        verification.save()
    
    # Send verification email
    # إرسال بريد التحقق
    try:
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification.token}"
        send_mail(
            subject=f"{settings.EMAIL_SUBJECT_PREFIX}Verify Your Email",
            message=f"""
            مرحباً {user.full_name},
            
            يرجى التحقق من بريدك الإلكتروني بالنقر على الرابط التالي:
            {verification_url}
            
            هذا الرابط صالح لمدة 24 ساعة.
            
            مع تحيات فريق Trendyol-SY
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return success_response(
            data=None,
            message='Verification email sent successfully.',
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        return error_response(
            message=f'Failed to send verification email: {str(e)}',
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
