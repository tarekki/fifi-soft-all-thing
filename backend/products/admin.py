"""
Product Admin Configuration
إعدادات إدارة المنتجات

This module provides enhanced admin interfaces for Product and ProductVariant models.
هذا الوحدة يوفر واجهات إدارة محسّنة لنماذج Product و ProductVariant.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Q
from django.contrib import messages
from django.http import HttpResponse
import csv

from .models import Category, Product, ProductVariant, ProductImage


# ============================================================================
# Category Admin
# إدارة الفئات
# ============================================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Enhanced Category Admin Interface
    واجهة إدارة محسّنة للفئات
    """
    
    # List Display
    list_display = [
        'name',
        'name_ar',
        'parent',
        'display_order',
        'products_count_display',
        'status_badge',
        'is_featured_badge',
        'created_at',
    ]
    
    # List Filter
    list_filter = [
        'is_active',
        'is_featured',
        'parent',
        'created_at',
    ]
    
    # Search Fields
    search_fields = [
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
    ]
    
    # Readonly Fields
    # slug is auto-generated in Category.save() method, so make it read-only
    # slug يتم توليده تلقائياً في Category.save() method، لذا جعله للقراءة فقط
    readonly_fields = [
        'slug',
        'created_at',
        'updated_at',
        'image_preview',
    ]
    
    # Fieldsets
    fieldsets = (
        ('Basic Information / المعلومات الأساسية', {
            'fields': ('name', 'name_ar', 'slug', 'parent')
        }),
        ('Description / الوصف', {
            'fields': ('description', 'description_ar'),
            'classes': ('collapse',)
        }),
        ('Visual / العناصر المرئية', {
            'fields': ('image', 'image_preview', 'icon')
        }),
        ('Display & Status / العرض والحالة', {
            'fields': ('display_order', 'is_active', 'is_featured')
        }),
        ('Timestamps / الطوابع الزمنية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Ordering
    ordering = ['display_order', 'name']
    
    def products_count_display(self, obj):
        """Display products count"""
        count = obj.products_count
        if count == 0:
            return format_html('<span style="color: #999;">0</span>')
        return format_html('<span style="color: #007bff; font-weight: bold;">{}</span>', count)
    products_count_display.short_description = 'Products'
    
    def status_badge(self, obj):
        """Display status badge"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #dc3545; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Inactive</span>'
        )
    status_badge.short_description = 'Status'
    
    def is_featured_badge(self, obj):
        """Display featured badge"""
        if obj.is_featured:
            return format_html(
                '<span style="background-color: #ffc107; color: #000; padding: 3px 8px; border-radius: 3px; font-size: 11px;">⭐ Featured</span>'
            )
        return '-'
    is_featured_badge.short_description = 'Featured'
    
    def image_preview(self, obj):
        """Display image preview"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = 'Image Preview'


# ============================================================================
# Product Image Inline (for adding images when creating/editing products)
# Inline للصور (لإضافة صور عند إنشاء/تعديل المنتجات)
# ============================================================================

class ProductImageInline(admin.TabularInline):
    """
    Inline admin for ProductImage
    إدارة صور المنتج داخل صفحة المنتج
    """
    model = ProductImage
    extra = 1  # Number of empty forms to show
    min_num = 0  # Minimum number of images (0 = optional)
    
    # Fields to display in the inline form
    # الحقول المعروضة في النموذج
    fields = [
        'image',
        'image_preview',
        'display_order',
        'is_primary',
        'alt_text',
    ]
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        """Display image preview"""
        if obj and obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = 'Preview'


# ============================================================================
# Product Variant Inline (for adding variants when creating/editing products)
# Inline للمتغيرات (لإضافة متغيرات عند إنشاء/تعديل المنتجات)
# ============================================================================

class ProductVariantInline(admin.TabularInline):
    """
    Inline admin for ProductVariant
    إدارة متغيرات المنتج داخل صفحة المنتج
    
    Note: Inline admin doesn't support fieldsets, only fields
    ملاحظة: Inline admin لا يدعم fieldsets، فقط fields
    """
    model = ProductVariant
    extra = 1  # Number of empty forms to show
    min_num = 1  # Minimum number of variants required
    
    # Fields to display in the inline form
    # الحقول المعروضة في النموذج
    fields = [
        'color', 
        'color_hex', 
        'size', 
        'model', 
        'stock_quantity', 
        'price_override', 
        'image',
        'is_available'
    ]
    
    # Help text for fields (shown as tooltips)
    # نص المساعدة للحقول (يظهر كـ tooltips)
    # Note: help_texts is not directly supported in TabularInline
    # ملاحظة: help_texts غير مدعوم مباشرة في TabularInline


# ============================================================================
# Product Admin Actions
# إجراءات إدارة المنتجات
# ============================================================================

@admin.action(description='Activate selected products')
def activate_products(modeladmin, request, queryset):
    """
    Activate selected products
    تفعيل المنتجات المحددة
    """
    count = queryset.update(is_active=True)
    modeladmin.message_user(
        request,
        f'{count} product(s) have been activated.',
        messages.SUCCESS
    )


@admin.action(description='Deactivate selected products')
def deactivate_products(modeladmin, request, queryset):
    """
    Deactivate selected products
    تعطيل المنتجات المحددة
    """
    count = queryset.update(is_active=False)
    modeladmin.message_user(
        request,
        f'{count} product(s) have been deactivated.',
        messages.SUCCESS
    )


@admin.action(description='Export selected products to CSV')
def export_products_csv(modeladmin, request, queryset):
    """
    Export selected products to CSV
    تصدير المنتجات المحددة إلى CSV
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="products_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Product Name', 'Vendor', 'Type', 'Base Price', 
        'Variants Count', 'Total Stock', 'Status', 'Created At'
    ])
    
    for product in queryset:
        variants_count = product.variants.count()
        total_stock = product.variants.aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
        
        writer.writerow([
            product.name,
            product.vendor.name,
            product.get_product_type_display(),
            product.base_price,
            variants_count,
            total_stock,
            'Active' if product.is_active else 'Inactive',
            product.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return response


# ============================================================================
# Product Admin
# إدارة المنتجات
# ============================================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Enhanced Product Admin Interface
    واجهة إدارة محسّنة للمنتجات
    
    Features:
    - Organized fieldsets
    - Product statistics
    - Bulk actions
    - CSV export
    - Variant management inline
    """
    
    # List Display - Columns shown in the product list
    # عرض القائمة - الأعمدة المعروضة في قائمة المنتجات
    list_display = [
        'name',
        'vendor',
        'category',
        'product_type',
        'base_price',
        'variants_count',
        'total_stock',
        'status_badge',
        'created_at',
        'actions_column'
    ]
    
    # List Filter - Filters shown in the sidebar
    # الفلاتر - الفلاتر المعروضة في الشريط الجانبي
    list_filter = [
        'vendor',
        'category',
        'product_type',
        'is_active',
        'created_at',
    ]
    
    # Search Fields - Fields searchable in the search box
    # حقول البحث - الحقول القابلة للبحث
    search_fields = [
        'name',
        'description',
        'vendor__name',
        'variants__color',
        'variants__model',
    ]
    
    # Inlines - Show images and variants when editing product
    # Inlines - عرض الصور والمتغيرات عند تعديل المنتج
    inlines = [ProductImageInline, ProductVariantInline]
    
    # Readonly Fields - Fields that cannot be edited
    # الحقول للقراءة فقط - الحقول التي لا يمكن تعديلها
    # slug is auto-generated in Product.save() method, so make it read-only
    # slug يتم توليده تلقائياً في Product.save() method، لذا جعله للقراءة فقط
    readonly_fields = [
        'slug',
        'created_at',
        'updated_at',
        'variants_count',
        'total_stock',
        'low_stock_variants',
    ]
    
    # Fieldsets - Organize fields into sections
    # Fieldsets - تنظيم الحقول في أقسام
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor', 'category', 'name', 'slug', 'description')
        }),
        ('Product Details', {
            'fields': ('product_type', 'base_price', 'is_active')
        }),
        ('Statistics', {
            'fields': ('variants_count', 'total_stock', 'low_stock_variants'),
            'classes': ('collapse',)  # Collapsible section
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Actions - Bulk actions available in the admin
    # الإجراءات - الإجراءات الجماعية المتاحة
    actions = [
        activate_products,
        deactivate_products,
        export_products_csv,
    ]
    
    # Date Hierarchy - Enable date-based navigation
    # التسلسل الزمني - تمكين التنقل حسب التاريخ
    date_hierarchy = 'created_at'
    
    # List Per Page - Number of items per page
    # عدد العناصر في الصفحة
    list_per_page = 25
    
    # Ordering - Default ordering
    # الترتيب الافتراضي
    ordering = ['-created_at']
    
    def variants_count(self, obj):
        """
        Display number of variants for this product
        عرض عدد المتغيرات لهذا المنتج
        """
        count = obj.variants.count()
        if count == 0:
            return format_html('<span style="color: red;">No variants</span>')
        return count
    variants_count.short_description = 'Variants'
    variants_count.admin_order_field = 'variants__count'
    
    def total_stock(self, obj):
        """
        Display total stock quantity across all variants
        عرض إجمالي المخزون عبر جميع المتغيرات
        """
        total = obj.variants.aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
        
        if total == 0:
            return format_html('<span style="color: red; font-weight: bold;">0</span>')
        elif total < 10:
            return format_html('<span style="color: orange; font-weight: bold;">{}</span>', total)
        return format_html('<span style="color: green;">{}</span>', total)
    total_stock.short_description = 'Total Stock'
    total_stock.admin_order_field = 'variants__stock_quantity__sum'
    
    def status_badge(self, obj):
        """
        Display product status with colored badge
        عرض حالة المنتج مع شارة ملونة
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
    
    def low_stock_variants(self, obj):
        """
        Display variants with low stock (less than 10)
        عرض المتغيرات ذات المخزون المنخفض (أقل من 10)
        """
        low_stock = obj.variants.filter(stock_quantity__lt=10, stock_quantity__gt=0)
        if not low_stock.exists():
            return format_html('<span style="color: green;">No low stock variants</span>')
        
        variants_list = []
        for variant in low_stock:
            variants_list.append(
                f"{variant.color} {variant.size or ''} - Stock: {variant.stock_quantity}"
            )
        return format_html('<br>'.join(variants_list))
    low_stock_variants.short_description = 'Low Stock Variants'
    
    def actions_column(self, obj):
        """
        Display quick action links
        عرض روابط الإجراءات السريعة
        """
        view_url = reverse('admin:products_product_change', args=[obj.pk])
        return format_html(
            '<a href="{}" class="button">Edit</a>',
            view_url
        )
    actions_column.short_description = 'Actions'
    
    def get_queryset(self, request):
        """
        Optimize queryset with prefetch_related and annotations
        تحسين queryset مع prefetch_related و annotations
        """
        qs = super().get_queryset(request)
        return qs.select_related('vendor').prefetch_related('variants').annotate(
            variants__count=Count('variants'),
            variants__stock_quantity__sum=Sum('variants__stock_quantity')
        )


# ============================================================================
# Product Variant Admin
# إدارة متغيرات المنتج
# ============================================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    """
    Enhanced Product Variant Admin Interface
    واجهة إدارة محسّنة لمتغيرات المنتج
    """
    
    # List Display
    list_display = [
        'product',
        'color_display',
        'size',
        'model',
        'stock_quantity',
        'price_display',
        'image_preview',
        'status_badge',
        'created_at'
    ]
    
    # List Filter
    list_filter = [
        'product__vendor',
        'product__product_type',
        'color',
        'is_available',
        'created_at',
    ]
    
    # Search Fields
    search_fields = [
        'product__name',
        'sku',
        'color',
        'model',
        'product__vendor__name',
    ]
    
    # Readonly Fields
    readonly_fields = [
        'created_at',
        'updated_at',
        'final_price',
        'image_preview_large',
    ]
    
    # Fieldsets
    fieldsets = (
        ('Product', {
            'fields': ('product',)
        }),
        ('Variant Attributes', {
            'fields': ('color', 'color_hex', 'size', 'model', 'sku')
        }),
        ('Pricing', {
            'fields': ('price_override', 'final_price'),
            'description': 'Leave price_override empty to use product base price'
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'is_available')
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Ordering
    ordering = ['product', 'color', 'size']
    
    def color_display(self, obj):
        """
        Display color with hex code if available
        عرض اللون مع رمز hex إن وجد
        """
        if obj.color_hex:
            return format_html(
                '<span style="display: inline-block; width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc; margin-right: 5px; vertical-align: middle;"></span>{}',
                obj.color_hex,
                obj.color
            )
        return obj.color
    color_display.short_description = 'Color'
    color_display.admin_order_field = 'color'
    
    def price_display(self, obj):
        """
        Display price with indication if it's overridden
        عرض السعر مع إشارة إذا كان مخصصاً
        """
        price = obj.final_price
        if obj.price_override:
            return format_html(
                '<span style="color: #007bff;">{} SYP</span> <small>(override)</small>',
                price
            )
        return format_html('{} SYP', price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'final_price'
    
    def image_preview(self, obj):
        """
        Display small image preview in list view
        عرض معاينة صغيرة للصورة في عرض القائمة
        """
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        """
        Display large image preview in detail view
        عرض معاينة كبيرة للصورة في عرض التفاصيل
        """
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image uploaded</span>')
    image_preview_large.short_description = 'Image Preview'
    
    def status_badge(self, obj):
        """
        Display variant status with colored badge
        عرض حالة المتغير مع شارة ملونة
        """
        if obj.is_available and obj.stock_quantity > 0:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Available</span>'
            )
        elif obj.stock_quantity == 0:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Out of Stock</span>'
            )
        return format_html(
            '<span style="background-color: #ffc107; color: #000; padding: 3px 8px; border-radius: 3px; font-size: 11px;">Unavailable</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_available'
    
    def get_queryset(self, request):
        """
        Optimize queryset
        تحسين queryset
        """
        return super().get_queryset(request).select_related('product', 'product__vendor')


# ============================================================================
# Product Image Admin
# إدارة صور المنتج
# ============================================================================

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """
    Enhanced Product Image Admin Interface
    واجهة إدارة محسّنة لصور المنتج
    """
    
    # List Display
    list_display = [
        'product',
        'image_preview',
        'display_order',
        'is_primary_badge',
        'alt_text',
        'created_at',
    ]
    
    # List Filter
    list_filter = [
        'product__vendor',
        'product__category',
        'is_primary',
        'created_at',
    ]
    
    # Search Fields
    search_fields = [
        'product__name',
        'alt_text',
        'product__vendor__name',
    ]
    
    # Readonly Fields
    readonly_fields = [
        'created_at',
        'updated_at',
        'image_preview_large',
    ]
    
    # Fieldsets
    fieldsets = (
        ('Product', {
            'fields': ('product',)
        }),
        ('Image', {
            'fields': ('image', 'image_preview_large', 'alt_text')
        }),
        ('Display Settings', {
            'fields': ('display_order', 'is_primary'),
            'description': 'Set display_order to control image sequence. Only one image can be primary.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Ordering
    ordering = ['product', 'display_order', 'created_at']
    
    def image_preview(self, obj):
        """Display small image preview in list view"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image</span>')
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        """Display large image preview in detail view"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        return format_html('<span style="color: #999;">No image uploaded</span>')
    image_preview_large.short_description = 'Image Preview'
    
    def is_primary_badge(self, obj):
        """Display primary badge"""
        if obj.is_primary:
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">⭐ Primary</span>'
            )
        return '-'
    is_primary_badge.short_description = 'Primary'
    is_primary_badge.admin_order_field = 'is_primary'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related('product', 'product__vendor', 'product__category')
