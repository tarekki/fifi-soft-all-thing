"""
Admin Authentication Serializers
متسلسلات المصادقة للأدمن

هذا الملف يحتوي على serializers للمصادقة في لوحة التحكم.
This file contains serializers for admin panel authentication.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
from admin_api.permissions import get_admin_role, get_user_permissions, AdminRoles

User = get_user_model()


# =============================================================================
# Admin Login Serializer
# متسلسل تسجيل دخول الأدمن
# =============================================================================

class AdminLoginSerializer(serializers.Serializer):
    """
    Serializer for admin login.
    متسلسل لتسجيل دخول الأدمن.
    
    Validates:
    - Email and password are correct
    - User is staff (admin)
    - User account is active
    
    Returns:
    - Access and refresh tokens
    - Admin user information
    """
    
    email = serializers.EmailField(
        required=True,
        help_text=_('البريد الإلكتروني للأدمن / Admin email address')
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text=_('كلمة المرور / Password')
    )
    
    def validate(self, attrs):
        """
        Validate admin credentials.
        التحقق من بيانات اعتماد الأدمن.
        """
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError(
                _('يجب إدخال البريد الإلكتروني وكلمة المرور. / Email and password are required.')
            )
        
        # Try to get user by email
        # محاولة الحصول على المستخدم بالبريد الإلكتروني
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                _('بيانات الاعتماد غير صحيحة. / Invalid credentials.')
            )
        
        # Check if user is staff
        # التحقق من أن المستخدم staff
        if not user.is_staff:
            raise serializers.ValidationError(
                _('ليس لديك صلاحية للوصول للوحة التحكم. / You do not have admin access.')
            )
        
        # Check if account is active
        # التحقق من أن الحساب مفعل
        if not user.is_active:
            raise serializers.ValidationError(
                _('حسابك معطل. تواصل مع الدعم. / Your account is disabled. Contact support.')
            )
        
        # Authenticate user
        # مصادقة المستخدم
        # Check password directly since authenticate may not work with custom User model
        # التحقق من كلمة المرور مباشرة
        if not user.check_password(password):
            raise serializers.ValidationError(
                _('بيانات الاعتماد غير صحيحة. / Invalid credentials.')
            )
        
        authenticated_user = user
        
        attrs['user'] = authenticated_user
        return attrs
    
    def create(self, validated_data):
        """
        Create tokens for authenticated admin.
        إنشاء tokens للأدمن المصادق عليه.
        """
        user = validated_data['user']
        
        # Generate JWT tokens
        # إنشاء JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        # Update last login
        # تحديث آخر تسجيل دخول
        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return {
            'access': str(access),
            'refresh': str(refresh),
            'user': user,
        }


# =============================================================================
# Admin User Serializer
# متسلسل بيانات الأدمن
# =============================================================================

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for admin user information.
    متسلسل لمعلومات المستخدم الأدمن.
    
    Returns comprehensive admin user data including:
    - Basic info (id, email, name)
    - Role and permissions
    - Last login time
    """
    
    role = serializers.SerializerMethodField(
        help_text=_('دور الأدمن / Admin role')
    )
    role_display = serializers.SerializerMethodField(
        help_text=_('اسم الدور للعرض / Role display name')
    )
    permissions = serializers.SerializerMethodField(
        help_text=_('قائمة الصلاحيات / List of permissions')
    )
    full_name = serializers.SerializerMethodField(
        help_text=_('الاسم الكامل / Full name')
    )
    avatar_url = serializers.SerializerMethodField(
        help_text=_('رابط الصورة الشخصية / Avatar URL')
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'first_name',
            'last_name',
            'role',
            'role_display',
            'permissions',
            'is_active',
            'is_staff',
            'is_superuser',
            'avatar_url',
            'last_login',
            'date_joined',
        ]
        read_only_fields = fields
    
    def get_role(self, obj):
        """
        Get admin role constant.
        الحصول على ثابت دور الأدمن.
        """
        return get_admin_role(obj)
    
    def get_role_display(self, obj):
        """
        Get human-readable role name.
        الحصول على اسم الدور للعرض.
        """
        role = get_admin_role(obj)
        role_names = {
            AdminRoles.SUPER_ADMIN: _('مسؤول فائق / Super Admin'),
            AdminRoles.ADMIN: _('مسؤول / Admin'),
            AdminRoles.MODERATOR: _('مشرف / Moderator'),
        }
        return role_names.get(role, _('غير محدد / Unknown'))
    
    def get_permissions(self, obj):
        """
        Get list of permissions for admin.
        الحصول على قائمة صلاحيات الأدمن.
        """
        return get_user_permissions(obj)
    
    def get_full_name(self, obj):
        """
        Get full name or email as fallback.
        الحصول على الاسم الكامل أو البريد كبديل.
        """
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name if full_name else obj.email.split('@')[0]
    
    def get_avatar_url(self, obj):
        """
        Get avatar URL if exists.
        الحصول على رابط الصورة الشخصية إن وجد.
        """
        # Check if user has profile with avatar
        # التحقق من وجود صورة شخصية
        if hasattr(obj, 'profile') and obj.profile and hasattr(obj.profile, 'avatar'):
            if obj.profile.avatar:
                return obj.profile.avatar.url
        return None


# =============================================================================
# Admin Token Refresh Serializer
# متسلسل تجديد التوكن
# =============================================================================

class AdminTokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for refreshing admin access token.
    متسلسل لتجديد access token للأدمن.
    """
    
    refresh = serializers.CharField(
        required=True,
        help_text=_('Refresh token لتجديد الجلسة')
    )
    
    def validate(self, attrs):
        """
        Validate refresh token and generate new access token.
        التحقق من refresh token وإنشاء access token جديد.
        """
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        try:
            refresh = RefreshToken(attrs['refresh'])
            
            # Get user from token
            # الحصول على المستخدم من التوكن
            user_id = refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Verify user is still admin
            # التحقق من أن المستخدم لا يزال أدمن
            if not user.is_staff:
                raise serializers.ValidationError(
                    _('تم إلغاء صلاحيات الأدمن. / Admin access revoked.')
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    _('الحساب معطل. / Account is disabled.')
                )
            
            attrs['access'] = str(refresh.access_token)
            attrs['user'] = user
            
            return attrs
            
        except TokenError as e:
            raise serializers.ValidationError(
                _('التوكن غير صالح أو منتهي الصلاحية. / Invalid or expired token.')
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                _('المستخدم غير موجود. / User not found.')
            )

