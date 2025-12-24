"""
Site Settings Admin Configuration
إعدادات لوحة الإدارة لإعدادات الموقع

This module configures Django admin for site settings models.
يحدد هذا الملف إعدادات لوحة الإدارة لنماذج إعدادات الموقع.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
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
# Site Settings Admin
# إدارة إعدادات الموقع
# =============================================================================

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """
    Site Settings Admin Configuration
    إعدادات إدارة إعدادات الموقع
    
    Singleton model - only one instance allowed.
    نموذج Singleton - سجل واحد فقط مسموح.
    """
    
    # Fieldsets for organized display
    # مجموعات الحقول للعرض المنظم
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': (
                ('site_name', 'site_name_ar'),
                ('tagline', 'tagline_ar'),
            )
        }),
        (_('Branding / الهوية البصرية'), {
            'fields': (
                'logo_url',
                'logo_dark_url',
                'favicon_url',
            )
        }),
        (_('Description / الوصف'), {
            'fields': (
                'description',
                'description_ar',
            ),
            'classes': ('collapse',)
        }),
        (_('SEO Settings / إعدادات SEO'), {
            'fields': (
                ('meta_title', 'meta_title_ar'),
                ('meta_description', 'meta_description_ar'),
                ('meta_keywords', 'meta_keywords_ar'),
            ),
            'classes': ('collapse',)
        }),
        (_('Contact Information / معلومات الاتصال'), {
            'fields': (
                'contact_email',
                ('contact_phone', 'contact_whatsapp'),
            )
        }),
        (_('Address / العنوان'), {
            'fields': (
                ('address', 'address_ar'),
                'google_maps_url',
            ),
            'classes': ('collapse',)
        }),
        (_('Working Hours / ساعات العمل'), {
            'fields': (
                ('working_hours', 'working_hours_ar'),
            ),
            'classes': ('collapse',)
        }),
        (_('Currency Settings / إعدادات العملة'), {
            'fields': (
                ('currency_code', 'currency_symbol', 'currency_position'),
            )
        }),
        (_('Maintenance Mode / وضع الصيانة'), {
            'fields': (
                'is_maintenance_mode',
                ('maintenance_message', 'maintenance_message_ar'),
            ),
            'classes': ('collapse',)
        }),
    )
    
    # List display
    list_display = ('site_name', 'contact_email', 'is_maintenance_mode', 'updated_at')
    
    # Prevent adding new instances
    # منع إضافة سجلات جديدة
    def has_add_permission(self, request):
        # Only allow adding if no instance exists
        return not SiteSettings.objects.exists()
    
    # Prevent deleting
    # منع الحذف
    def has_delete_permission(self, request, obj=None):
        return False


# =============================================================================
# Social Link Admin
# إدارة روابط السوشيال
# =============================================================================

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    """
    Social Link Admin Configuration
    إعدادات إدارة روابط السوشيال
    """
    
    list_display = ('platform_icon', 'platform', 'name', 'url_display', 'order', 'is_active')
    list_filter = ('platform', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'url')
    ordering = ('order', 'platform')
    
    def platform_icon(self, obj):
        """Display platform icon."""
        return format_html('<span style="font-size: 1.5em;">{}</span>', obj.icon)
    platform_icon.short_description = _('Icon')
    
    def url_display(self, obj):
        """Display truncated URL as link."""
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            obj.url,
            obj.url[:50] + '...' if len(obj.url) > 50 else obj.url
        )
    url_display.short_description = _('URL')


# =============================================================================
# Language Admin
# إدارة اللغات
# =============================================================================

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """
    Language Admin Configuration
    إعدادات إدارة اللغات
    """
    
    list_display = ('flag_display', 'code', 'name', 'native_name', 'is_rtl', 'is_default', 'is_active', 'order')
    list_filter = ('is_rtl', 'is_default', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('code', 'name', 'native_name')
    ordering = ('order', 'name')
    
    def flag_display(self, obj):
        """Display flag emoji or image."""
        if obj.flag_emoji:
            return format_html('<span style="font-size: 1.5em;">{}</span>', obj.flag_emoji)
        elif obj.flag_url:
            return format_html('<img src="{}" height="20">', obj.flag_url)
        return '-'
    flag_display.short_description = _('Flag')


# =============================================================================
# Navigation Item Admin
# إدارة عناصر القوائم
# =============================================================================

@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    """
    Navigation Item Admin Configuration
    إعدادات إدارة عناصر القوائم
    """
    
    list_display = ('label', 'location', 'parent', 'url', 'visibility', 'order', 'is_active', 'highlight')
    list_filter = ('location', 'visibility', 'is_active', 'highlight')
    list_editable = ('order', 'is_active', 'highlight')
    search_fields = ('label', 'label_ar', 'url')
    ordering = ('location', 'order')
    autocomplete_fields = ('parent',)
    
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': (
                'location',
                'parent',
                ('label', 'label_ar'),
                'url',
                'icon',
            )
        }),
        (_('Display Settings / إعدادات العرض'), {
            'fields': (
                'order',
                'visibility',
                'is_active',
                'open_in_new_tab',
            )
        }),
        (_('Highlight / التمييز'), {
            'fields': (
                'highlight',
                'highlight_color',
            ),
            'classes': ('collapse',)
        }),
    )


# =============================================================================
# Trust Signal Admin
# إدارة مؤشرات الثقة
# =============================================================================

@admin.register(TrustSignal)
class TrustSignalAdmin(admin.ModelAdmin):
    """
    Trust Signal Admin Configuration
    إعدادات إدارة مؤشرات الثقة
    """
    
    list_display = ('icon_display', 'title', 'title_ar', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'title_ar', 'description', 'description_ar')
    ordering = ('order',)
    
    def icon_display(self, obj):
        """Display icon."""
        return format_html('<span style="font-size: 1.5em;">{}</span>', obj.icon)
    icon_display.short_description = _('Icon')


# =============================================================================
# Payment Method Admin
# إدارة طرق الدفع
# =============================================================================

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    """
    Payment Method Admin Configuration
    إعدادات إدارة طرق الدفع
    """
    
    list_display = ('icon_display', 'name', 'code', 'fee_display', 'order', 'is_active', 'is_default')
    list_filter = ('fee_type', 'is_active', 'is_default')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'name_ar', 'code')
    ordering = ('order', 'name')
    
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': (
                'code',
                ('name', 'name_ar'),
                'icon_url',
            )
        }),
        (_('Description / الوصف'), {
            'fields': (
                ('description', 'description_ar'),
                ('instructions', 'instructions_ar'),
            ),
            'classes': ('collapse',)
        }),
        (_('Fee Settings / إعدادات الرسوم'), {
            'fields': (
                ('fee_type', 'fee_amount'),
                ('min_order_amount', 'max_order_amount'),
            )
        }),
        (_('Display Settings / إعدادات العرض'), {
            'fields': (
                'order',
                ('is_active', 'is_default'),
            )
        }),
    )
    
    def icon_display(self, obj):
        """Display payment icon."""
        if obj.icon_url:
            return format_html('<img src="{}" height="24">', obj.icon_url)
        return '-'
    icon_display.short_description = _('Icon')
    
    def fee_display(self, obj):
        """Display fee information."""
        if obj.fee_type == 'none':
            return _('No fee')
        elif obj.fee_type == 'fixed':
            return f'{obj.fee_amount} (Fixed)'
        else:
            return f'{obj.fee_amount}%'
    fee_display.short_description = _('Fee')


# =============================================================================
# Shipping Method Admin
# إدارة طرق الشحن
# =============================================================================

@admin.register(ShippingMethod)
class ShippingMethodAdmin(admin.ModelAdmin):
    """
    Shipping Method Admin Configuration
    إعدادات إدارة طرق الشحن
    """
    
    list_display = ('name', 'code', 'rate_display', 'delivery_display', 'order', 'is_active', 'is_default')
    list_filter = ('rate_type', 'is_active', 'is_default')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'name_ar', 'code')
    ordering = ('order', 'name')
    
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': (
                'code',
                ('name', 'name_ar'),
            )
        }),
        (_('Description / الوصف'), {
            'fields': (
                ('description', 'description_ar'),
            ),
            'classes': ('collapse',)
        }),
        (_('Delivery Time / وقت التوصيل'), {
            'fields': (
                ('estimated_days_min', 'estimated_days_max'),
            )
        }),
        (_('Rate Settings / إعدادات التسعير'), {
            'fields': (
                ('rate_type', 'rate_amount'),
                'free_shipping_threshold',
            )
        }),
        (_('Display Settings / إعدادات العرض'), {
            'fields': (
                'order',
                ('is_active', 'is_default'),
            )
        }),
    )
    
    def rate_display(self, obj):
        """Display rate information."""
        if obj.rate_type == 'free':
            return _('Free')
        elif obj.rate_type == 'flat':
            return f'{obj.rate_amount} (Flat)'
        else:
            return f'{obj.rate_type.title()}'
    rate_display.short_description = _('Rate')
    
    def delivery_display(self, obj):
        """Display delivery time."""
        return obj.get_estimated_delivery()
    delivery_display.short_description = _('Delivery Time')


# =============================================================================
# Admin Site Configuration
# تكوين موقع الإدارة
# =============================================================================

# Customize admin site header
# تخصيص عنوان موقع الإدارة
admin.site.site_header = _('Yalla Buy Administration')
admin.site.site_title = _('Yalla Buy Admin')
admin.site.index_title = _('Dashboard')

