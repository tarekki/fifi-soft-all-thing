"""
Site Settings Serializers
سيريالايزرز إعدادات الموقع

This module contains serializers for site settings API endpoints.
يحتوي هذا الملف على سيريالايزرز لنقاط API إعدادات الموقع.

All serializers are read-only for public access.
جميع السيريالايزرز للقراءة فقط للوصول العام.
"""

from rest_framework import serializers
from .models import (
    SiteSettings,
    SocialLink,
    Language,
    NavigationItem,
    TrustSignal,
    PaymentMethod,
    ShippingMethod
)


# =============================================================================
# Site Settings Serializer
# سيريالايزر إعدادات الموقع
# =============================================================================

class SiteSettingsSerializer(serializers.ModelSerializer):
    """
    Site Settings Serializer
    سيريالايزر إعدادات الموقع الرئيسية
    
    Returns all site configuration settings.
    يُرجع جميع إعدادات تكوين الموقع.
    """
    
    class Meta:
        model = SiteSettings
        fields = [
            # Basic Info
            'site_name',
            'site_name_ar',
            'tagline',
            'tagline_ar',
            
            # Branding
            'logo_url',
            'logo_dark_url',
            'favicon_url',
            
            # Description
            'description',
            'description_ar',
            
            # SEO
            'meta_title',
            'meta_title_ar',
            'meta_description',
            'meta_description_ar',
            'meta_keywords',
            'meta_keywords_ar',
            
            # Contact
            'contact_email',
            'contact_phone',
            'contact_whatsapp',
            
            # Address
            'address',
            'address_ar',
            'google_maps_url',
            
            # Working Hours
            'working_hours',
            'working_hours_ar',
            
            # Currency
            'currency_code',
            'currency_symbol',
            'currency_position',
            
            # Maintenance
            'is_maintenance_mode',
            'maintenance_message',
            'maintenance_message_ar',
        ]
        read_only_fields = fields


class SiteSettingsPublicSerializer(serializers.ModelSerializer):
    """
    Public Site Settings Serializer
    سيريالايزر إعدادات الموقع العامة
    
    Returns only essential public settings (without sensitive data).
    يُرجع فقط الإعدادات العامة الأساسية (بدون البيانات الحساسة).
    """
    
    class Meta:
        model = SiteSettings
        fields = [
            # Basic Info
            'site_name',
            'site_name_ar',
            'tagline',
            'tagline_ar',
            
            # Branding
            'logo_url',
            'logo_dark_url',
            'favicon_url',
            
            # SEO
            'meta_title',
            'meta_title_ar',
            'meta_description',
            'meta_description_ar',
            
            # Currency
            'currency_code',
            'currency_symbol',
            'currency_position',
            
            # Maintenance
            'is_maintenance_mode',
            'maintenance_message',
            'maintenance_message_ar',
        ]
        read_only_fields = fields


# =============================================================================
# Social Links Serializer
# سيريالايزر روابط السوشيال
# =============================================================================

class SocialLinkSerializer(serializers.ModelSerializer):
    """
    Social Links Serializer
    سيريالايزر روابط السوشيال ميديا
    """
    
    # Add platform display name
    # إضافة اسم المنصة المعروض
    platform_display = serializers.CharField(
        source='get_platform_display',
        read_only=True
    )
    
    class Meta:
        model = SocialLink
        fields = [
            'id',
            'platform',
            'platform_display',
            'name',
            'url',
            'icon',
            'order',
            'is_active',
            'open_in_new_tab',
        ]
        read_only_fields = fields


# =============================================================================
# Language Serializer
# سيريالايزر اللغات
# =============================================================================

class LanguageSerializer(serializers.ModelSerializer):
    """
    Language Serializer
    سيريالايزر اللغات المدعومة
    """
    
    class Meta:
        model = Language
        fields = [
            'code',
            'name',
            'native_name',
            'flag_emoji',
            'flag_url',
            'is_rtl',
            'is_default',
            'order',
        ]
        read_only_fields = fields


# =============================================================================
# Navigation Item Serializer
# سيريالايزر عناصر القوائم
# =============================================================================

class NavigationItemSerializer(serializers.ModelSerializer):
    """
    Navigation Item Serializer
    سيريالايزر عناصر القوائم
    """
    
    # Nested children for submenu items
    # العناصر الفرعية المتداخلة
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = NavigationItem
        fields = [
            'id',
            'label',
            'label_ar',
            'url',
            'icon',
            'order',
            'visibility',
            'open_in_new_tab',
            'highlight',
            'highlight_color',
            'children',
        ]
        read_only_fields = fields
    
    def get_children(self, obj):
        """
        Get active child items.
        الحصول على العناصر الفرعية النشطة.
        """
        children = obj.children.filter(is_active=True).order_by('order')
        return NavigationItemSerializer(children, many=True).data


class NavigationMenuSerializer(serializers.Serializer):
    """
    Navigation Menu Serializer
    سيريالايزر قائمة التنقل الكاملة
    
    Groups navigation items by location.
    يجمع عناصر التنقل حسب الموقع.
    """
    
    header = NavigationItemSerializer(many=True, read_only=True)
    header_mobile = NavigationItemSerializer(many=True, read_only=True)
    footer_about = NavigationItemSerializer(many=True, read_only=True)
    footer_support = NavigationItemSerializer(many=True, read_only=True)
    footer_legal = NavigationItemSerializer(many=True, read_only=True)


# =============================================================================
# Trust Signal Serializer
# سيريالايزر مؤشرات الثقة
# =============================================================================

class TrustSignalSerializer(serializers.ModelSerializer):
    """
    Trust Signal Serializer
    سيريالايزر مؤشرات الثقة
    """
    
    class Meta:
        model = TrustSignal
        fields = [
            'id',
            'icon',
            'title',
            'title_ar',
            'description',
            'description_ar',
            'order',
        ]
        read_only_fields = fields


# =============================================================================
# Payment Method Serializer
# سيريالايزر طرق الدفع
# =============================================================================

class PaymentMethodSerializer(serializers.ModelSerializer):
    """
    Payment Method Serializer
    سيريالايزر طرق الدفع
    """
    
    # Fee type display
    # عرض نوع الرسوم
    fee_type_display = serializers.CharField(
        source='get_fee_type_display',
        read_only=True
    )
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'code',
            'name',
            'name_ar',
            'description',
            'description_ar',
            'instructions',
            'instructions_ar',
            'icon_url',
            'fee_type',
            'fee_type_display',
            'fee_amount',
            'min_order_amount',
            'max_order_amount',
            'order',
            'is_default',
        ]
        read_only_fields = fields


# =============================================================================
# Shipping Method Serializer
# سيريالايزر طرق الشحن
# =============================================================================

class ShippingMethodSerializer(serializers.ModelSerializer):
    """
    Shipping Method Serializer
    سيريالايزر طرق الشحن
    """
    
    # Rate type display
    # عرض نوع التسعير
    rate_type_display = serializers.CharField(
        source='get_rate_type_display',
        read_only=True
    )
    
    # Formatted estimated delivery
    # وقت التوصيل المتوقع المنسق
    estimated_delivery = serializers.CharField(
        source='get_estimated_delivery',
        read_only=True
    )
    
    class Meta:
        model = ShippingMethod
        fields = [
            'id',
            'code',
            'name',
            'name_ar',
            'description',
            'description_ar',
            'estimated_days_min',
            'estimated_days_max',
            'estimated_delivery',
            'rate_type',
            'rate_type_display',
            'rate_amount',
            'free_shipping_threshold',
            'order',
            'is_default',
        ]
        read_only_fields = fields


# =============================================================================
# Combined Settings Response Serializer
# سيريالايزر الاستجابة المجمعة للإعدادات
# =============================================================================

class AllSettingsSerializer(serializers.Serializer):
    """
    All Settings Combined Serializer
    سيريالايزر جميع الإعدادات مجمعة
    
    Returns all site settings in a single response.
    يُرجع جميع إعدادات الموقع في استجابة واحدة.
    
    This is useful for initial page load to fetch all settings at once.
    مفيد للتحميل الأولي للصفحة لجلب جميع الإعدادات مرة واحدة.
    """
    
    site = SiteSettingsPublicSerializer(read_only=True)
    social_links = SocialLinkSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    navigation = NavigationMenuSerializer(read_only=True)
    trust_signals = TrustSignalSerializer(many=True, read_only=True)
    payment_methods = PaymentMethodSerializer(many=True, read_only=True)
    shipping_methods = ShippingMethodSerializer(many=True, read_only=True)

