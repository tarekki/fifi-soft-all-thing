"""
Admin Vendor Application Serializers
مسلسلات طلبات انضمام البائعين للإدارة

This module contains serializers for managing vendor applications in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة طلبات انضمام البائعين.

Serializers:
    - AdminVendorApplicationListSerializer: قائمة الطلبات (مُحسّن للأداء)
    - AdminVendorApplicationDetailSerializer: تفاصيل الطلب الكاملة
    - AdminVendorApplicationApproveSerializer: الموافقة على الطلب
    - AdminVendorApplicationRejectSerializer: رفض الطلب
    - AdminVendorApplicationStatsSerializer: إحصائيات الطلبات

Author: Yalla Buy Team
"""

from decimal import Decimal
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

from vendors.models import VendorApplication, Vendor


# =============================================================================
# Vendor Application List Serializer
# مسلسل قائمة طلبات الانضمام
# =============================================================================

class AdminVendorApplicationListSerializer(serializers.ModelSerializer):
    """
    Admin Vendor Application List Serializer
    مسلسل قائمة طلبات الانضمام للإدارة
    
    Optimized for list view - includes essential fields only.
    مُحسّن لعرض القائمة - يتضمن الحقول الأساسية فقط.
    """
    
    # Computed fields
    # الحقول المحسوبة
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    business_type_display = serializers.CharField(
        source='get_business_type_display',
        read_only=True
    )
    store_logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorApplication
        fields = [
            'id',
            'store_name',
            'applicant_name',
            'applicant_email',
            'applicant_phone',
            'business_type',
            'business_type_display',
            'status',
            'status_display',
            'store_logo_url',
            'created_at',
            'reviewed_at',
        ]
    
    def get_store_logo_url(self, obj) -> str | None:
        """Get full store logo URL"""
        if obj.store_logo and hasattr(obj.store_logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.store_logo.url)
            return obj.store_logo.url
        return None


# =============================================================================
# Vendor Application Detail Serializer
# مسلسل تفاصيل طلب الانضمام
# =============================================================================

class AdminVendorApplicationDetailSerializer(serializers.ModelSerializer):
    """
    Admin Vendor Application Detail Serializer
    مسلسل تفاصيل طلب الانضمام للإدارة
    
    Complete application information.
    معلومات الطلب الكاملة.
    """
    
    # Computed fields
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    business_type_display = serializers.CharField(
        source='get_business_type_display',
        read_only=True
    )
    store_logo_url = serializers.SerializerMethodField()
    business_license_url = serializers.SerializerMethodField()
    
    # Related fields
    reviewed_by_name = serializers.SerializerMethodField()
    created_vendor_info = serializers.SerializerMethodField()
    user_info = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorApplication
        fields = [
            'id',
            # Applicant info
            'applicant_name',
            'applicant_email',
            'applicant_phone',
            'user',
            'user_info',
            # Store info
            'store_name',
            'store_description',
            'store_logo',
            'store_logo_url',
            # Business info
            'business_type',
            'business_type_display',
            'business_address',
            'business_license',
            'business_license_url',
            # Status
            'status',
            'status_display',
            'admin_notes',
            'rejection_reason',
            # Review info
            'reviewed_by',
            'reviewed_by_name',
            'reviewed_at',
            # Result
            'created_vendor',
            'created_vendor_info',
            # Timestamps
            'created_at',
            'updated_at',
        ]
    
    def get_store_logo_url(self, obj) -> str | None:
        """Get full store logo URL"""
        if obj.store_logo and hasattr(obj.store_logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.store_logo.url)
            return obj.store_logo.url
        return None
    
    def get_business_license_url(self, obj) -> str | None:
        """Get full business license URL"""
        if obj.business_license and hasattr(obj.business_license, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.business_license.url)
            return obj.business_license.url
        return None
    
    def get_reviewed_by_name(self, obj) -> str | None:
        """Get reviewer name"""
        if obj.reviewed_by:
            return obj.reviewed_by.full_name or obj.reviewed_by.email
        return None
    
    def get_created_vendor_info(self, obj) -> dict | None:
        """Get created vendor info"""
        if obj.created_vendor:
            return {
                'id': obj.created_vendor.id,
                'name': obj.created_vendor.name,
                'slug': obj.created_vendor.slug,
                'is_active': obj.created_vendor.is_active,
            }
        return None
    
    def get_user_info(self, obj) -> dict | None:
        """Get linked user info"""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': obj.user.full_name,
            }
        return None


# =============================================================================
# Vendor Application Approve Serializer
# مسلسل الموافقة على طلب الانضمام
# =============================================================================

class AdminVendorApplicationApproveSerializer(serializers.Serializer):
    """
    Admin Vendor Application Approve Serializer
    مسلسل الموافقة على طلب الانضمام
    
    Used for approving vendor applications.
    يُستخدم للموافقة على طلبات الانضمام.
    """
    
    commission_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        default=Decimal("10.00"),
        min_value=0,
        max_value=100,
        help_text=_('نسبة العمولة للبائع الجديد (افتراضي: 10%)')
    )
    admin_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('ملاحظات داخلية')
    )
    
    def validate(self, data):
        """Validate that the application is pending"""
        application = self.context.get('application')
        if application and application.status != VendorApplication.Status.PENDING:
            raise serializers.ValidationError(
                _('يمكن الموافقة فقط على الطلبات المعلقة / Can only approve pending applications')
            )
        return data


# =============================================================================
# Vendor Application Reject Serializer
# مسلسل رفض طلب الانضمام
# =============================================================================

class AdminVendorApplicationRejectSerializer(serializers.Serializer):
    """
    Admin Vendor Application Reject Serializer
    مسلسل رفض طلب الانضمام
    
    Used for rejecting vendor applications.
    يُستخدم لرفض طلبات الانضمام.
    """
    
    rejection_reason = serializers.CharField(
        required=True,
        min_length=10,
        help_text=_('سبب الرفض (سيُرسل للمتقدم)')
    )
    admin_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('ملاحظات داخلية')
    )
    
    def validate(self, data):
        """Validate that the application is pending"""
        application = self.context.get('application')
        if application and application.status != VendorApplication.Status.PENDING:
            raise serializers.ValidationError(
                _('يمكن رفض الطلبات المعلقة فقط / Can only reject pending applications')
            )
        return data


# =============================================================================
# Vendor Application Stats Serializer
# مسلسل إحصائيات طلبات الانضمام
# =============================================================================

class AdminVendorApplicationStatsSerializer(serializers.Serializer):
    """
    Admin Vendor Application Stats Serializer
    مسلسل إحصائيات طلبات الانضمام
    """
    
    total = serializers.IntegerField(help_text=_('إجمالي الطلبات'))
    pending = serializers.IntegerField(help_text=_('قيد المراجعة'))
    approved = serializers.IntegerField(help_text=_('مقبولة'))
    rejected = serializers.IntegerField(help_text=_('مرفوضة'))
    this_week = serializers.IntegerField(help_text=_('هذا الأسبوع'))
    this_month = serializers.IntegerField(help_text=_('هذا الشهر'))

