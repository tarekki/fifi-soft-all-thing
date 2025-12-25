"""
Promotions Admin Configuration
إعدادات إدارة العروض والحملات

This module configures the Django Admin interface for Banner, Story, and Coupon models.
هذا الملف يهيئ واجهة Django Admin لنماذج البانرات والقصص والكوبونات.

Author: Yalla Buy Team
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from .models import Banner, Story, Coupon


# =============================================================================
# Banner Admin
# إدارة البانرات
# =============================================================================

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    """
    Admin interface for Banner model.
    واجهة إدارة لنموذج البانر.
    """
    
    list_display = [
        'id',
        'title_preview',
        'location_badge',
        'link_type',
        'is_active_badge',
        'is_currently_active_badge',
        'order',
        'views',
        'clicks',
        'start_date',
        'end_date',
        'created_at',
    ]
    list_filter = [
        'location',
        'link_type',
        'is_active',
        'start_date',
        'end_date',
    ]
    search_fields = [
        'title',
        'title_ar',
        'subtitle',
        'subtitle_ar',
        'link',
    ]
    readonly_fields = [
        'views',
        'clicks',
        'created_at',
        'updated_at',
        'image_preview',
        'is_currently_active_display',
    ]
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': ('title', 'title_ar', 'subtitle', 'subtitle_ar', 'image', 'image_preview')
        }),
        (_('Link Configuration / إعدادات الرابط'), {
            'fields': ('link_type', 'link')
        }),
        (_('Display Settings / إعدادات العرض'), {
            'fields': ('location', 'order', 'is_active')
        }),
        (_('Scheduling / الجدولة'), {
            'fields': ('start_date', 'end_date')
        }),
        (_('Analytics / التحليلات'), {
            'fields': ('views', 'clicks', 'is_currently_active_display')
        }),
        (_('Timestamps / الطوابع الزمنية'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['order', '-created_at']
    date_hierarchy = 'created_at'
    
    def title_preview(self, obj):
        """Display title with preview / عرض العنوان مع معاينة"""
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">{}</small>',
            obj.title,
            obj.title_ar
        )
    title_preview.short_description = _('Title / العنوان')
    
    def location_badge(self, obj):
        """Display location with colored badge / عرض الموقع مع شارة ملونة"""
        colors = {
            'hero': 'bg-blue-500',
            'sidebar': 'bg-green-500',
            'popup': 'bg-yellow-500',
            'category': 'bg-purple-500',
        }
        return format_html(
            '<span class="{} text-white px-2 py-1 rounded-full text-xs">{}</span>',
            colors.get(obj.location, 'bg-gray-500'),
            obj.get_location_display()
        )
    location_badge.short_description = _('Location / الموقع')
    
    def is_active_badge(self, obj):
        """Display active status with badge / عرض حالة النشاط مع شارة"""
        if obj.is_active:
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">نشط</span>'
            )
        return format_html(
            '<span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">غير نشط</span>'
        )
    is_active_badge.short_description = _('Active / نشط')
    
    def is_currently_active_badge(self, obj):
        """Display currently active status / عرض حالة النشاط الحالية"""
        if obj.is_currently_active():
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">✓ نشط حالياً</span>'
            )
        return format_html(
            '<span class="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">✗ غير نشط</span>'
        )
    is_currently_active_badge.short_description = _('Currently Active / نشط حالياً')
    
    def image_preview(self, obj):
        """Display image preview / عرض معاينة الصورة"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = _('Image Preview / معاينة الصورة')
    
    def is_currently_active_display(self, obj):
        """Display currently active status in detail view / عرض حالة النشاط الحالية في عرض التفاصيل"""
        return obj.is_currently_active()
    is_currently_active_display.boolean = True
    is_currently_active_display.short_description = _('Currently Active / نشط حالياً')


# =============================================================================
# Story Admin
# إدارة القصص
# =============================================================================

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    """
    Admin interface for Story model.
    واجهة إدارة لنموذج القصة.
    """
    
    list_display = [
        'id',
        'title_preview',
        'link_type',
        'is_active_badge',
        'is_currently_active_badge',
        'order',
        'expires_at',
        'views',
        'created_at',
    ]
    list_filter = [
        'link_type',
        'is_active',
        'expires_at',
        'created_at',
    ]
    search_fields = [
        'title',
        'title_ar',
        'link',
    ]
    readonly_fields = [
        'views',
        'created_at',
        'updated_at',
        'image_preview',
        'is_currently_active_display',
    ]
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': ('title', 'title_ar', 'image', 'image_preview')
        }),
        (_('Link Configuration / إعدادات الرابط'), {
            'fields': ('link_type', 'link')
        }),
        (_('Display Settings / إعدادات العرض'), {
            'fields': ('order', 'is_active')
        }),
        (_('Scheduling / الجدولة'), {
            'fields': ('expires_at',)
        }),
        (_('Analytics / التحليلات'), {
            'fields': ('views', 'is_currently_active_display')
        }),
        (_('Timestamps / الطوابع الزمنية'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['order', '-created_at']
    date_hierarchy = 'created_at'
    
    def title_preview(self, obj):
        """Display title with preview / عرض العنوان مع معاينة"""
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">{}</small>',
            obj.title,
            obj.title_ar
        )
    title_preview.short_description = _('Title / العنوان')
    
    def is_active_badge(self, obj):
        """Display active status with badge / عرض حالة النشاط مع شارة"""
        if obj.is_active:
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">نشط</span>'
            )
        return format_html(
            '<span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">غير نشط</span>'
        )
    is_active_badge.short_description = _('Active / نشط')
    
    def is_currently_active_badge(self, obj):
        """Display currently active status / عرض حالة النشاط الحالية"""
        if obj.is_currently_active():
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">✓ نشط حالياً</span>'
            )
        return format_html(
            '<span class="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">✗ غير نشط</span>'
        )
    is_currently_active_badge.short_description = _('Currently Active / نشط حالياً')
    
    def image_preview(self, obj):
        """Display image preview / عرض معاينة الصورة"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = _('Image Preview / معاينة الصورة')
    
    def is_currently_active_display(self, obj):
        """Display currently active status in detail view / عرض حالة النشاط الحالية في عرض التفاصيل"""
        return obj.is_currently_active()
    is_currently_active_display.boolean = True
    is_currently_active_display.short_description = _('Currently Active / نشط حالياً')


# =============================================================================
# Coupon Admin
# إدارة الكوبونات
# =============================================================================

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    """
    Admin interface for Coupon model.
    واجهة إدارة لنموذج الكوبون.
    """
    
    list_display = [
        'id',
        'code',
        'discount_display',
        'applicable_to_badge',
        'is_active_badge',
        'is_currently_valid_badge',
        'usage_display',
        'start_date',
        'end_date',
        'created_at',
    ]
    list_filter = [
        'discount_type',
        'applicable_to',
        'is_active',
        'start_date',
        'end_date',
    ]
    search_fields = [
        'code',
        'description',
        'description_ar',
    ]
    readonly_fields = [
        'used_count',
        'created_at',
        'updated_at',
        'is_currently_valid_display',
    ]
    filter_horizontal = [
        'applicable_categories',
        'applicable_products',
        'applicable_users',
    ]
    fieldsets = (
        (_('Basic Information / المعلومات الأساسية'), {
            'fields': ('code', 'description', 'description_ar')
        }),
        (_('Discount Configuration / إعدادات الخصم'), {
            'fields': ('discount_type', 'discount_value', 'min_order', 'max_discount')
        }),
        (_('Usage Limits / حدود الاستخدام'), {
            'fields': ('usage_limit', 'used_count')
        }),
        (_('Applicability / التطبيق'), {
            'fields': ('applicable_to', 'applicable_categories', 'applicable_products', 'applicable_users')
        }),
        (_('Scheduling / الجدولة'), {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        (_('Status / الحالة'), {
            'fields': ('is_currently_valid_display',)
        }),
        (_('Timestamps / الطوابع الزمنية'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def discount_display(self, obj):
        """Display discount information / عرض معلومات الخصم"""
        if obj.discount_type == 'percentage':
            return format_html(
                '<strong>{}%</strong><br><small style="color: #666;">خصم نسبي</small>',
                obj.discount_value
            )
        else:
            return format_html(
                '<strong>{} SYP</strong><br><small style="color: #666;">خصم ثابت</small>',
                obj.discount_value
            )
    discount_display.short_description = _('Discount / الخصم')
    
    def applicable_to_badge(self, obj):
        """Display applicability with badge / عرض التطبيق مع شارة"""
        colors = {
            'all': 'bg-blue-500',
            'category': 'bg-green-500',
            'product': 'bg-purple-500',
            'user': 'bg-yellow-500',
        }
        return format_html(
            '<span class="{} text-white px-2 py-1 rounded-full text-xs">{}</span>',
            colors.get(obj.applicable_to, 'bg-gray-500'),
            obj.get_applicable_to_display()
        )
    applicable_to_badge.short_description = _('Applicable To / قابل للتطبيق على')
    
    def is_active_badge(self, obj):
        """Display active status with badge / عرض حالة النشاط مع شارة"""
        if obj.is_active:
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">نشط</span>'
            )
        return format_html(
            '<span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs">غير نشط</span>'
        )
    is_active_badge.short_description = _('Active / نشط')
    
    def is_currently_valid_badge(self, obj):
        """Display currently valid status / عرض حالة الصلاحية الحالية"""
        if obj.is_currently_valid():
            return format_html(
                '<span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">✓ صالح</span>'
            )
        return format_html(
            '<span class="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">✗ غير صالح</span>'
        )
    is_currently_valid_badge.short_description = _('Currently Valid / صالح حالياً')
    
    def usage_display(self, obj):
        """Display usage information / عرض معلومات الاستخدام"""
        if obj.usage_limit:
            percentage = (obj.used_count / obj.usage_limit) * 100
            return format_html(
                '<strong>{}/{}</strong><br><small style="color: #666;">{}%</small>',
                obj.used_count,
                obj.usage_limit,
                int(percentage)
            )
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">غير محدود</small>',
            obj.used_count
        )
    usage_display.short_description = _('Usage / الاستخدام')
    
    def is_currently_valid_display(self, obj):
        """Display currently valid status in detail view / عرض حالة الصلاحية الحالية في عرض التفاصيل"""
        return obj.is_currently_valid()
    is_currently_valid_display.boolean = True
    is_currently_valid_display.short_description = _('Currently Valid / صالح حالياً')

