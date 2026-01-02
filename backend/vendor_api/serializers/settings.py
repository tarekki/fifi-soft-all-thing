"""
Vendor Settings Serializers
متسلسلات إعدادات البائع

This file contains serializers for Vendor Settings data.
هذا الملف يحتوي على serializers لبيانات إعدادات البائع.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()


# =============================================================================
# Profile Settings Serializer
# متسلسل إعدادات الملف الشخصي
# =============================================================================

class VendorProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating vendor user profile.
    متسلسل لتحديث ملف البائع الشخصي.
    """
    
    email = serializers.EmailField(
        required=False,
        help_text=_('البريد الإلكتروني / Email')
    )
    first_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text=_('الاسم الأول / First name')
    )
    last_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
        help_text=_('الاسم الأخير / Last name')
    )
    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        help_text=_('رقم الهاتف / Phone number')
    )
    preferred_language = serializers.ChoiceField(
        choices=UserProfile.Language.choices,
        required=False,
        help_text=_('اللغة المفضلة / Preferred language')
    )
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            user = self.context['request'].user
            if User.objects.filter(email=value).exclude(id=user.id).exists():
                raise serializers.ValidationError(
                    _('البريد الإلكتروني مستخدم بالفعل / Email is already taken')
                )
        return value


class VendorProfileSerializer(serializers.Serializer):
    """
    Serializer for vendor profile information.
    متسلسل لمعلومات ملف البائع الشخصي.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف المستخدم / User ID')
    )
    email = serializers.EmailField(
        help_text=_('البريد الإلكتروني / Email')
    )
    first_name = serializers.CharField(
        help_text=_('الاسم الأول / First name')
    )
    last_name = serializers.CharField(
        help_text=_('الاسم الأخير / Last name')
    )
    full_name = serializers.CharField(
        help_text=_('الاسم الكامل / Full name')
    )
    phone = serializers.CharField(
        allow_null=True,
        help_text=_('رقم الهاتف / Phone number')
    )
    avatar_url = serializers.URLField(
        allow_null=True,
        help_text=_('رابط الصورة الشخصية / Avatar URL')
    )
    preferred_language = serializers.CharField(
        help_text=_('اللغة المفضلة / Preferred language')
    )
    preferred_language_display = serializers.CharField(
        help_text=_('عرض اللغة المفضلة / Preferred language display')
    )


# =============================================================================
# Vendor Info Settings Serializer
# متسلسل إعدادات معلومات البائع
# =============================================================================

class VendorInfoUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating vendor information.
    متسلسل لتحديث معلومات البائع.
    """
    
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('وصف البائع / Vendor description')
    )
    primary_color = serializers.CharField(
        max_length=7,
        required=False,
        help_text=_('اللون الأساسي (Hex) / Primary color (Hex)')
    )
    
    def validate_primary_color(self, value):
        """Validate hex color format"""
        if value:
            import re
            if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
                raise serializers.ValidationError(
                    _('تنسيق اللون غير صحيح. استخدم تنسيق Hex (مثل: #E91E63) / Invalid color format. Use Hex format (e.g., #E91E63)')
                )
        return value


class VendorInfoSerializer(serializers.Serializer):
    """
    Serializer for vendor information.
    متسلسل لمعلومات البائع.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف البائع / Vendor ID')
    )
    name = serializers.CharField(
        help_text=_('اسم البائع / Vendor name')
    )
    slug = serializers.SlugField(
        help_text=_('المعرف / Slug')
    )
    description = serializers.CharField(
        allow_blank=True,
        help_text=_('وصف البائع / Vendor description')
    )
    logo_url = serializers.URLField(
        allow_null=True,
        help_text=_('رابط الشعار / Logo URL')
    )
    primary_color = serializers.CharField(
        help_text=_('اللون الأساسي / Primary color')
    )
    commission_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text=_('نسبة العمولة / Commission rate')
    )
    is_active = serializers.BooleanField(
        help_text=_('نشط / Active')
    )


# =============================================================================
# Notification Preferences Serializer
# متسلسل تفضيلات الإشعارات
# =============================================================================

class VendorNotificationPreferencesUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating notification preferences.
    متسلسل لتحديث تفضيلات الإشعارات.
    """
    
    # Order notifications
    notify_new_orders = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات الطلبات الجديدة / New order notifications')
    )
    notify_order_status_changes = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات تغيير حالة الطلب / Order status change notifications')
    )
    notify_order_cancellations = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات إلغاء الطلبات / Order cancellation notifications')
    )
    
    # Product notifications
    notify_low_stock = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات المخزون المنخفض / Low stock notifications')
    )
    notify_out_of_stock = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات نفاد المخزون / Out of stock notifications')
    )
    
    # Customer notifications
    notify_new_customers = serializers.BooleanField(
        required=False,
        help_text=_('إشعارات الزبائن الجدد / New customer notifications')
    )
    
    # Email notifications
    email_notifications_enabled = serializers.BooleanField(
        required=False,
        help_text=_('تفعيل إشعارات البريد الإلكتروني / Enable email notifications')
    )


class VendorNotificationPreferencesSerializer(serializers.Serializer):
    """
    Serializer for notification preferences.
    متسلسل لتفضيلات الإشعارات.
    """
    
    notify_new_orders = serializers.BooleanField(
        help_text=_('إشعارات الطلبات الجديدة / New order notifications')
    )
    notify_order_status_changes = serializers.BooleanField(
        help_text=_('إشعارات تغيير حالة الطلب / Order status change notifications')
    )
    notify_order_cancellations = serializers.BooleanField(
        help_text=_('إشعارات إلغاء الطلبات / Order cancellation notifications')
    )
    notify_low_stock = serializers.BooleanField(
        help_text=_('إشعارات المخزون المنخفض / Low stock notifications')
    )
    notify_out_of_stock = serializers.BooleanField(
        help_text=_('إشعارات نفاد المخزون / Out of stock notifications')
    )
    notify_new_customers = serializers.BooleanField(
        help_text=_('إشعارات الزبائن الجدد / New customer notifications')
    )
    email_notifications_enabled = serializers.BooleanField(
        help_text=_('تفعيل إشعارات البريد الإلكتروني / Enable email notifications')
    )


# =============================================================================
# Store Settings Serializer
# متسلسل إعدادات المتجر
# =============================================================================

class VendorStoreSettingsUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating store settings.
    متسلسل لتحديث إعدادات المتجر.
    """
    
    auto_confirm_orders = serializers.BooleanField(
        required=False,
        help_text=_('تأكيد الطلبات تلقائياً / Auto-confirm orders')
    )
    default_order_status = serializers.ChoiceField(
        choices=[
            ('pending', _('معلق / Pending')),
            ('confirmed', _('مؤكد / Confirmed')),
            ('processing', _('قيد المعالجة / Processing')),
        ],
        required=False,
        help_text=_('حالة الطلب الافتراضية / Default order status')
    )
    stock_alert_threshold = serializers.IntegerField(
        min_value=0,
        required=False,
        help_text=_('حد تنبيه المخزون / Stock alert threshold')
    )
    auto_archive_orders_after_days = serializers.IntegerField(
        min_value=0,
        max_value=365,
        required=False,
        allow_null=True,
        help_text=_('أرشفة الطلبات تلقائياً بعد X يوم / Auto-archive orders after X days')
    )


class VendorStoreSettingsSerializer(serializers.Serializer):
    """
    Serializer for store settings.
    متسلسل لإعدادات المتجر.
    """
    
    is_active = serializers.BooleanField(
        help_text=_('المتجر نشط / Store is active')
    )
    auto_confirm_orders = serializers.BooleanField(
        help_text=_('تأكيد الطلبات تلقائياً / Auto-confirm orders')
    )
    default_order_status = serializers.CharField(
        help_text=_('حالة الطلب الافتراضية / Default order status')
    )
    stock_alert_threshold = serializers.IntegerField(
        help_text=_('حد تنبيه المخزون / Stock alert threshold')
    )
    auto_archive_orders_after_days = serializers.IntegerField(
        allow_null=True,
        help_text=_('أرشفة الطلبات تلقائياً بعد X يوم / Auto-archive orders after X days')
    )


# =============================================================================
# Active Session Serializer
# متسلسل الجلسة النشطة
# =============================================================================

class VendorActiveSessionSerializer(serializers.Serializer):
    """
    Serializer for active session information.
    متسلسل لمعلومات الجلسة النشطة.
    """
    
    session_key = serializers.CharField(
        help_text=_('مفتاح الجلسة / Session key')
    )
    ip_address = serializers.IPAddressField(
        allow_null=True,
        help_text=_('عنوان IP / IP address')
    )
    user_agent = serializers.CharField(
        allow_null=True,
        help_text=_('وكيل المستخدم / User agent')
    )
    last_activity = serializers.DateTimeField(
        help_text=_('آخر نشاط / Last activity')
    )
    is_current = serializers.BooleanField(
        help_text=_('الجلسة الحالية / Current session')
    )

