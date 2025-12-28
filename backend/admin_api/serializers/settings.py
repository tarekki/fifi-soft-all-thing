"""
Admin Settings Serializers
سيريالايزرز إعدادات الأدمن

This module contains serializers for admin settings management.
يحتوي هذا الملف على سيريالايزرز لإدارة إعدادات الأدمن.

Features:
- Full CRUD serializers for all settings models
- Write-enabled serializers for admin panel
- Validation with Arabic error messages
- Nested serializers for relationships

@author Yalla Buy Team
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from settings_app.models import (
    SiteSettings,
    SocialLink,
    Language,
    NavigationItem,
    TrustSignal,
    PaymentMethod,
    ShippingMethod
)


# =============================================================================
# Site Settings Admin Serializer
# سيريالايزر إعدادات الموقع للأدمن
# =============================================================================

class AdminSiteSettingsSerializer(serializers.ModelSerializer):
    """
    Admin Site Settings Serializer - Full CRUD
    سيريالايزر إعدادات الموقع للأدمن - CRUD كامل
    
    Allows admins to update all site settings.
    يسمح للأدمن بتحديث جميع إعدادات الموقع.
    """
    
    class Meta:
        model = SiteSettings
        fields = [
            'id',
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
            
            # Timestamps
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_site_name(self, value):
        """Validate site name is not empty."""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                _("اسم الموقع يجب أن يكون حرفين على الأقل / Site name must be at least 2 characters")
            )
        return value.strip()
    
    def validate_contact_email(self, value):
        """Validate email format."""
        if value and '@' not in value:
            raise serializers.ValidationError(
                _("البريد الإلكتروني غير صالح / Invalid email address")
            )
        return value


# =============================================================================
# Social Link Admin Serializer
# سيريالايزر روابط السوشيال للأدمن
# =============================================================================

class AdminSocialLinkSerializer(serializers.ModelSerializer):
    """
    Admin Social Links Serializer - Full CRUD
    سيريالايزر روابط السوشيال للأدمن - CRUD كامل
    """
    
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
        read_only_fields = ['id', 'platform_display']
    
    def validate_url(self, value):
        """Validate URL format."""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                _("الرابط يجب أن يبدأ بـ http:// أو https:// / URL must start with http:// or https://")
            )
        return value


class AdminSocialLinkBulkSerializer(serializers.Serializer):
    """
    Bulk Social Links Serializer
    سيريالايزر تحديث روابط السوشيال بالجملة
    """
    
    links = AdminSocialLinkSerializer(many=True)
    
    def create(self, validated_data):
        """Create or update multiple social links."""
        links_data = validated_data.get('links', [])
        created_links = []
        
        for link_data in links_data:
            link_id = link_data.pop('id', None)
            if link_id:
                # Update existing
                link = SocialLink.objects.filter(id=link_id).first()
                if link:
                    for key, value in link_data.items():
                        setattr(link, key, value)
                    link.save()
                    created_links.append(link)
            else:
                # Create new
                link = SocialLink.objects.create(**link_data)
                created_links.append(link)
        
        return created_links


# =============================================================================
# Language Admin Serializer
# سيريالايزر اللغات للأدمن
# =============================================================================

class AdminLanguageSerializer(serializers.ModelSerializer):
    """
    Admin Languages Serializer - Full CRUD
    سيريالايزر اللغات للأدمن - CRUD كامل
    """
    
    class Meta:
        model = Language
        fields = [
            'id',
            'code',
            'name',
            'native_name',
            'flag_emoji',
            'flag_url',
            'is_rtl',
            'is_default',
            'is_active',
            'order',
        ]
        read_only_fields = ['id']
    
    def validate_code(self, value):
        """Validate language code format."""
        if value and len(value) < 2:
            raise serializers.ValidationError(
                _("رمز اللغة يجب أن يكون حرفين على الأقل / Language code must be at least 2 characters")
            )
        return value.lower()


# =============================================================================
# Navigation Item Admin Serializer
# سيريالايزر عناصر التنقل للأدمن
# =============================================================================

class AdminNavigationItemSerializer(serializers.ModelSerializer):
    """
    Admin Navigation Items Serializer - Full CRUD
    سيريالايزر عناصر التنقل للأدمن - CRUD كامل
    """
    
    location_display = serializers.CharField(
        source='get_location_display',
        read_only=True
    )
    visibility_display = serializers.CharField(
        source='get_visibility_display',
        read_only=True
    )
    children = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = NavigationItem
        fields = [
            'id',
            'location',
            'location_display',
            'parent',
            'label',
            'label_ar',
            'url',
            'icon',
            'order',
            'is_active',
            'visibility',
            'visibility_display',
            'open_in_new_tab',
            'highlight',
            'highlight_color',
            'children',
            'children_count',
        ]
        read_only_fields = ['id', 'location_display', 'visibility_display', 'children', 'children_count']
    
    def get_children(self, obj):
        """Get child items recursively."""
        children = obj.children.filter(is_active=True).order_by('order')
        return AdminNavigationItemSerializer(children, many=True, context=self.context).data
    
    def get_children_count(self, obj):
        """Get total children count."""
        return obj.children.count()
    
    def validate_url(self, value):
        """Validate URL format."""
        if value and not value.startswith(('/', 'http://', 'https://', '#')):
            raise serializers.ValidationError(
                _("الرابط يجب أن يبدأ بـ / أو http:// أو https:// / URL must start with / or http:// or https://")
            )
        return value
    
    def validate(self, attrs):
        """Validate parent is not self and no circular reference."""
        parent = attrs.get('parent')
        instance = self.instance
        
        if parent and instance:
            if parent.id == instance.id:
                raise serializers.ValidationError({
                    'parent': _("العنصر لا يمكن أن يكون أباً لنفسه / Item cannot be its own parent")
                })
            
            # Check for circular reference
            current_parent = parent
            while current_parent:
                if current_parent.id == instance.id:
                    raise serializers.ValidationError({
                        'parent': _("مرجع دائري غير مسموح / Circular reference not allowed")
                    })
                current_parent = current_parent.parent
        
        return attrs


class AdminNavigationMenuSerializer(serializers.Serializer):
    """
    Admin Navigation Menu Serializer
    سيريالايزر قوائم التنقل للأدمن
    
    Groups navigation items by location.
    يجمع عناصر التنقل حسب الموقع.
    """
    
    header = AdminNavigationItemSerializer(many=True, required=False)
    header_mobile = AdminNavigationItemSerializer(many=True, required=False)
    footer_about = AdminNavigationItemSerializer(many=True, required=False)
    footer_support = AdminNavigationItemSerializer(many=True, required=False)
    footer_legal = AdminNavigationItemSerializer(many=True, required=False)
    sidebar = AdminNavigationItemSerializer(many=True, required=False)


class AdminNavigationBulkUpdateSerializer(serializers.Serializer):
    """
    Bulk update navigation items
    تحديث عناصر التنقل بالجملة
    """
    
    location = serializers.ChoiceField(
        choices=NavigationItem.LOCATION_CHOICES,
        required=True
    )
    items = AdminNavigationItemSerializer(many=True)
    
    def update_items(self, validated_data):
        """Update navigation items for a location."""
        location = validated_data['location']
        items_data = validated_data['items']
        updated_items = []
        
        for idx, item_data in enumerate(items_data):
            item_id = item_data.pop('id', None)
            item_data['location'] = location
            item_data['order'] = idx
            
            if item_id:
                # Update existing
                item = NavigationItem.objects.filter(id=item_id).first()
                if item:
                    for key, value in item_data.items():
                        if key != 'children':
                            setattr(item, key, value)
                    item.save()
                    updated_items.append(item)
            else:
                # Create new
                children_data = item_data.pop('children', [])
                item = NavigationItem.objects.create(**item_data)
                updated_items.append(item)
        
        return updated_items


# =============================================================================
# Trust Signal Admin Serializer
# سيريالايزر مؤشرات الثقة للأدمن
# =============================================================================

class AdminTrustSignalSerializer(serializers.ModelSerializer):
    """
    Admin Trust Signals Serializer - Full CRUD
    سيريالايزر مؤشرات الثقة للأدمن - CRUD كامل
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
            'is_active',
        ]
        read_only_fields = ['id']


# =============================================================================
# Payment Method Admin Serializer
# سيريالايزر طرق الدفع للأدمن
# =============================================================================

class AdminPaymentMethodSerializer(serializers.ModelSerializer):
    """
    Admin Payment Methods Serializer - Full CRUD
    سيريالايزر طرق الدفع للأدمن - CRUD كامل
    """
    
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
            'is_active',
            'is_default',
        ]
        read_only_fields = ['id', 'fee_type_display']
    
    def validate_code(self, value):
        """Validate code is unique and formatted."""
        code = value.lower().strip()
        instance = self.instance
        
        # Check uniqueness
        existing = PaymentMethod.objects.filter(code=code)
        if instance:
            existing = existing.exclude(pk=instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                _("رمز طريقة الدفع مستخدم بالفعل / Payment method code already exists")
            )
        
        return code
    
    def validate_fee_amount(self, value):
        """Validate fee is not negative."""
        if value and value < 0:
            raise serializers.ValidationError(
                _("الرسوم لا يمكن أن تكون سالبة / Fee cannot be negative")
            )
        return value


# =============================================================================
# Shipping Method Admin Serializer
# سيريالايزر طرق الشحن للأدمن
# =============================================================================

class AdminShippingMethodSerializer(serializers.ModelSerializer):
    """
    Admin Shipping Methods Serializer - Full CRUD
    سيريالايزر طرق الشحن للأدمن - CRUD كامل
    """
    
    rate_type_display = serializers.CharField(
        source='get_rate_type_display',
        read_only=True
    )
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
            'is_active',
            'is_default',
        ]
        read_only_fields = ['id', 'rate_type_display', 'estimated_delivery']
    
    def validate_code(self, value):
        """Validate code is unique and formatted."""
        code = value.lower().strip()
        instance = self.instance
        
        # Check uniqueness
        existing = ShippingMethod.objects.filter(code=code)
        if instance:
            existing = existing.exclude(pk=instance.pk)
        
        if existing.exists():
            raise serializers.ValidationError(
                _("رمز طريقة الشحن مستخدم بالفعل / Shipping method code already exists")
            )
        
        return code
    
    def validate(self, attrs):
        """Validate estimated days range."""
        min_days = attrs.get('estimated_days_min', 1)
        max_days = attrs.get('estimated_days_max', 3)
        
        if min_days > max_days:
            raise serializers.ValidationError({
                'estimated_days_min': _("الحد الأدنى يجب أن يكون أقل من الحد الأقصى / Minimum must be less than maximum")
            })
        
        return attrs


# =============================================================================
# Combined Admin Settings Response
# استجابة الإعدادات المجمعة للأدمن
# =============================================================================

class AdminAllSettingsSerializer(serializers.Serializer):
    """
    All Admin Settings Combined Serializer
    سيريالايزر جميع إعدادات الأدمن مجمعة
    
    Returns all settings for admin panel.
    يُرجع جميع الإعدادات للوحة الأدمن.
    """
    
    site = AdminSiteSettingsSerializer(read_only=True)
    social_links = AdminSocialLinkSerializer(many=True, read_only=True)
    languages = AdminLanguageSerializer(many=True, read_only=True)
    navigation = AdminNavigationMenuSerializer(read_only=True)
    trust_signals = AdminTrustSignalSerializer(many=True, read_only=True)
    payment_methods = AdminPaymentMethodSerializer(many=True, read_only=True)
    shipping_methods = AdminShippingMethodSerializer(many=True, read_only=True)

