"""
Vendor Application Serializers
متسلسلات طلب انضمام البائع

هذا الملف يحتوي على serializers لطلب انضمام البائعين.
This file contains serializers for vendor applications.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from vendors.models import VendorApplication


# =============================================================================
# Vendor Application Serializer (Public)
# متسلسل طلب انضمام البائع (عام)
# =============================================================================

class VendorApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating vendor applications (public endpoint).
    متسلسل لإنشاء طلبات انضمام البائعين (نقطة عامة).
    
    This serializer is used by regular users to submit vendor applications.
    هذا المتسلسل يُستخدم من قبل المستخدمين العاديين لتقديم طلبات انضمام.
    
    Security:
    - Validates store name uniqueness
    - Validates email format
    - Validates phone format
    - Links to authenticated user if available
    
    الأمان:
    - يتحقق من تفرد اسم المتجر
    - يتحقق من صيغة البريد الإلكتروني
    - يتحقق من صيغة رقم الهاتف
    - يربط بالمستخدم المسجل إذا كان متاحاً
    """
    
    class Meta:
        model = VendorApplication
        fields = [
            'applicant_name',
            'applicant_email',
            'applicant_phone',
            'store_name',
            'store_description',
            'store_logo',
            'business_type',
            'business_address',
            'business_license',
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate_store_name(self, value):
        """
        Validate store name uniqueness.
        التحقق من تفرد اسم المتجر.
        """
        # Check if vendor with this name already exists
        # التحقق من وجود بائع بهذا الاسم
        from vendors.models import Vendor
        if Vendor.objects.filter(name=value).exists():
            raise serializers.ValidationError(
                _('اسم المتجر مستخدم مسبقاً / Store name already exists')
            )
        
        # Check if pending application with this name exists
        # التحقق من وجود طلب معلق بهذا الاسم
        if VendorApplication.objects.filter(
            store_name=value,
            status=VendorApplication.Status.PENDING
        ).exists():
            raise serializers.ValidationError(
                _('يوجد طلب انضمام معلق بهذا الاسم / Pending application with this name exists')
            )
        
        return value
    
    def validate_applicant_email(self, value):
        """
        Validate email format and check for existing applications.
        التحقق من صيغة البريد الإلكتروني والتحقق من وجود طلبات سابقة.
        """
        value = value.lower().strip()
        
        # Check if user with this email already has an approved vendor
        # التحقق من أن المستخدم بهذا البريد لديه بائع موافق عليه
        from django.contrib.auth import get_user_model
        from users.models import VendorUser
        
        User = get_user_model()
        try:
            user = User.objects.get(email=value)
            if VendorUser.objects.filter(user=user).exists():
                raise serializers.ValidationError(
                    _('هذا البريد الإلكتروني مرتبط ببائع موجود / This email is already associated with a vendor')
                )
        except User.DoesNotExist:
            pass
        
        return value
    
    def validate(self, attrs):
        """
        Additional validation.
        التحقق الإضافي.
        """
        # If user is authenticated, link application to user
        # إذا كان المستخدم مسجل دخول، ربط الطلب بالمستخدم
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user already has a vendor
            # التحقق من أن المستخدم لديه بائع بالفعل
            from users.models import VendorUser
            if VendorUser.objects.filter(user=request.user).exists():
                raise serializers.ValidationError(
                    _('لديك بائع مرتبط بالفعل / You already have an associated vendor')
                )
            
            # Check if user has pending application
            # التحقق من وجود طلب معلق للمستخدم
            if VendorApplication.objects.filter(
                user=request.user,
                status=VendorApplication.Status.PENDING
            ).exists():
                raise serializers.ValidationError(
                    _('لديك طلب انضمام معلق بالفعل / You already have a pending application')
            )
        
        return attrs
    
    def create(self, validated_data):
        """
        Create vendor application.
        إنشاء طلب انضمام بائع.
        """
        request = self.context.get('request')
        
        # Link to authenticated user if available
        # الربط بالمستخدم المسجل إذا كان متاحاً
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        # Set status to pending
        # تعيين الحالة إلى معلق
        validated_data['status'] = VendorApplication.Status.PENDING
        
        return super().create(validated_data)

