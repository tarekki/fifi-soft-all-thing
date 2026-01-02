"""
Vendor Authentication Serializers
متسلسلات مصادقة البائعين

هذا الملف يحتوي على serializers للمصادقة في Vendor API.
This file contains serializers for authentication in Vendor API.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


# =============================================================================
# Vendor Login Serializer
# متسلسل تسجيل دخول البائع
# =============================================================================

class VendorLoginSerializer(serializers.Serializer):
    """
    Serializer for vendor login.
    متسلسل لتسجيل دخول البائع.
    
    Validates email and password, and ensures user is a vendor
    with an associated VendorUser.
    
    يتحقق من البريد الإلكتروني وكلمة المرور، ويتأكد من أن المستخدم بائع
    وله VendorUser مرتبط.
    """
    
    email = serializers.EmailField(
        required=True,
        help_text=_('البريد الإلكتروني / Email address')
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text=_('كلمة المرور / Password')
    )
    
    def validate(self, attrs):
        """
        Validate credentials and check vendor status.
        التحقق من بيانات الاعتماد وحالة البائع.
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                _('يجب إدخال البريد الإلكتروني وكلمة المرور / Email and password are required')
            )
        
        # Authenticate user
        # التحقق من المستخدم
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )
        
        if not user:
            raise serializers.ValidationError(
                _('بيانات اعتماد غير صحيحة / Invalid credentials')
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                _('الحساب غير نشط. يرجى التواصل مع الدعم / Account is inactive. Please contact support')
            )
        
        # Check if user is a vendor
        # التحقق من أن المستخدم بائع
        if user.role != User.Role.VENDOR:
            raise serializers.ValidationError(
                _('هذا الحساب ليس حساب بائع / This account is not a vendor account')
            )
        
        # Check if user has associated VendorUser
        # التحقق من وجود VendorUser مرتبط
        # Use select_related to avoid N+1 queries
        # استخدام select_related لتجنب استعلامات N+1
        from users.models import VendorUser
        vendor_user = VendorUser.objects.select_related('vendor').filter(user=user).first()
        
        if not vendor_user:
            raise serializers.ValidationError(
                _('لا يوجد بائع مرتبط بهذا الحساب. يرجى التواصل مع الدعم / No vendor associated with this account. Please contact support')
            )
        
        # Check if vendor is active
        # التحقق من أن البائع نشط
        # vendor is already loaded via select_related, no additional query
        # vendor محمل بالفعل عبر select_related، لا يوجد استعلام إضافي
        if not vendor_user.vendor.is_active:
            raise serializers.ValidationError(
                _('البائع غير نشط. يرجى التواصل مع الدعم / Vendor is inactive. Please contact support')
            )
        
        attrs['user'] = user
        attrs['vendor_user'] = vendor_user
        return attrs


# =============================================================================
# Vendor Password Change Serializer
# متسلسل تغيير كلمة مرور البائع
# =============================================================================

class VendorPasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for vendor password change.
    متسلسل لتغيير كلمة مرور البائع.
    
    Requires current password and new password.
    يتطلب كلمة المرور الحالية وكلمة المرور الجديدة.
    """
    
    current_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text=_('كلمة المرور الحالية / Current password')
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        min_length=8,
        help_text=_('كلمة المرور الجديدة (8 أحرف على الأقل) / New password (minimum 8 characters)')
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text=_('تأكيد كلمة المرور الجديدة / Confirm new password')
    )
    
    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                _('كلمة المرور الحالية غير صحيحة / Current password is incorrect')
            )
        return value
    
    def validate(self, attrs):
        """Validate new password matches confirmation"""
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            raise serializers.ValidationError({
                'confirm_password': _('كلمات المرور غير متطابقة / Passwords do not match')
            })
        
        # Validate password strength using Django's validators
        # التحقق من قوة كلمة المرور باستخدام validators Django
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user=self.context['request'].user)
        except Exception as e:
            raise serializers.ValidationError({
                'new_password': str(e)
            })
        
        return attrs

