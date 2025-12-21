"""
Vendor Admin Configuration
إعدادات إدارة البائعين

This module provides enhanced admin interface for Vendor model.
هذا الوحدة يوفر واجهة إدارة محسّنة لنموذج Vendor.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Sum, Q
from .models import Vendor


# ============================================================================
# Vendor Admin
# إدارة البائعين
# ============================================================================

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    """
    Enhanced Vendor Admin Interface
    واجهة إدارة محسّنة للبائعين
    
    Features:
    - Vendor statistics (products count, total stock)
    - Logo preview
    - Status badges
    - Organized fieldsets
    """
    
    # List Display
    list_display = [
        'logo_preview',
        'name',
        'products_count',
        'total_products_stock',
        'commission_rate_display',
        'status_badge',
        'created_at'
    ]
    
    # List Filter
    list_filter = [
        'is_active',
        'commission_rate',
        'created_at',
    ]
    
    # Search Fields
    search_fields = [
        'name',
        'description',
        'slug',
    ]
    
    # Prepopulated Fields
    prepopulated_fields = {'slug': ('name',)}
    
    # Readonly Fields
    readonly_fields = [
        'created_at',
        'updated_at',
        'products_count',
        'total_products_stock',
        'logo_preview_large',
    ]
    
    # Fieldsets - Organize fields into sections
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Logo', {
            'fields': ('logo', 'logo_preview_large')
        }),
        ('Settings', {
            'fields': ('commission_rate', 'is_active')
        }),
        ('Statistics', {
            'fields': ('products_count', 'total_products_stock'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Ordering
    ordering = ['name']
    
    def logo_preview(self, obj):
        """
        Display small logo preview in list view
        عرض معاينة صغيرة للشعار في عرض القائمة
        """
        if obj.logo:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px;" />',
                obj.logo.url
            )
        return format_html('<span style="color: #999;">No logo</span>')
    logo_preview.short_description = 'Logo'
    
    def logo_preview_large(self, obj):
        """
        Display large logo preview in detail view
        عرض معاينة كبيرة للشعار في عرض التفاصيل
        """
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.logo.url
            )
        return format_html('<span style="color: #999;">No logo uploaded</span>')
    logo_preview_large.short_description = 'Logo Preview'
    
    def products_count(self, obj):
        """
        Display number of products for this vendor
        عرض عدد المنتجات لهذا البائع
        """
        count = obj.products.count()
        if count == 0:
            return format_html('<span style="color: orange;">No products</span>')
        return format_html('<strong>{}</strong>', count)
    products_count.short_description = 'Products'
    products_count.admin_order_field = 'products__count'
    
    def total_products_stock(self, obj):
        """
        Display total stock across all vendor products
        عرض إجمالي المخزون عبر جميع منتجات البائع
        """
        from products.models import ProductVariant
        total = ProductVariant.objects.filter(
            product__vendor=obj
        ).aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
        
        if total == 0:
            return format_html('<span style="color: red; font-weight: bold;">0</span>')
        elif total < 50:
            return format_html('<span style="color: orange; font-weight: bold;">{}</span>', total)
        return format_html('<span style="color: green;">{}</span>', total)
    total_products_stock.short_description = 'Total Stock'
    
    def commission_rate_display(self, obj):
        """
        Display commission rate with percentage
        عرض نسبة العمولة مع النسبة المئوية
        """
        return format_html(
            '<strong style="color: #007bff;">{}%</strong>',
            obj.commission_rate
        )
    commission_rate_display.short_description = 'Commission'
    commission_rate_display.admin_order_field = 'commission_rate'
    
    def status_badge(self, obj):
        """
        Display vendor status with colored badge
        عرض حالة البائع مع شارة ملونة
        """
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Inactive</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'
    
    def get_queryset(self, request):
        """
        Optimize queryset with annotations
        تحسين queryset مع annotations
        """
        return super().get_queryset(request).annotate(
            products__count=Count('products')
        )
