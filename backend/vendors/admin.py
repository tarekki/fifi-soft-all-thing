"""
Vendor Admin Configuration
إعدادات إدارة البائعين

This module provides enhanced admin interface for Vendor model.
هذا الوحدة يوفر واجهة إدارة محسّنة لنموذج Vendor.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Sum, Q
from django.utils import timezone
from django.contrib import messages
from .models import Vendor, VendorApplication, VendorSettings


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


# ============================================================================
# Vendor Application Admin
# إدارة طلبات انضمام البائعين
# ============================================================================

@admin.action(description='Approve selected applications')
def approve_applications(modeladmin, request, queryset):
    """
    Approve selected vendor applications
    الموافقة على طلبات البائعين المحددة
    """
    approved = 0
    for application in queryset.filter(status=VendorApplication.Status.PENDING):
        try:
            application.approve(admin_user=request.user)
            approved += 1
        except Exception as e:
            modeladmin.message_user(
                request,
                f'فشل الموافقة على طلب {application.store_name}: {str(e)}',
                messages.ERROR
            )
    
    if approved:
        modeladmin.message_user(
            request,
            f'تمت الموافقة على {approved} طلب(ات)',
            messages.SUCCESS
        )


@admin.action(description='Reject selected applications')
def reject_applications(modeladmin, request, queryset):
    """
    Reject selected vendor applications
    رفض طلبات البائعين المحددة
    """
    rejected = queryset.filter(status=VendorApplication.Status.PENDING).update(
        status=VendorApplication.Status.REJECTED,
        reviewed_by=request.user,
        reviewed_at=timezone.now(),
    )
    
    if rejected:
        modeladmin.message_user(
            request,
            f'تم رفض {rejected} طلب(ات)',
            messages.SUCCESS
        )


@admin.register(VendorApplication)
class VendorApplicationAdmin(admin.ModelAdmin):
    """
    Enhanced Vendor Application Admin Interface
    واجهة إدارة محسّنة لطلبات انضمام البائعين
    
    Features:
    - Status badges with colors
    - Quick approve/reject actions
    - Organized fieldsets
    - Filtering and search
    """
    
    # List Display
    list_display = [
        'store_name',
        'applicant_name',
        'applicant_email',
        'business_type_badge',
        'status_badge',
        'created_at',
        'reviewed_at',
        'quick_actions',
    ]
    
    # List Filter
    list_filter = [
        'status',
        'business_type',
        'created_at',
        'reviewed_at',
    ]
    
    # Search Fields
    search_fields = [
        'store_name',
        'applicant_name',
        'applicant_email',
        'applicant_phone',
    ]
    
    # Readonly Fields
    readonly_fields = [
        'created_at',
        'updated_at',
        'reviewed_at',
        'reviewed_by',
        'created_vendor',
        'logo_preview',
    ]
    
    # Fieldsets
    fieldsets = (
        ('Applicant Information / معلومات المتقدم', {
            'fields': (
                'applicant_name',
                'applicant_email',
                'applicant_phone',
                'user',
            )
        }),
        ('Store Information / معلومات المتجر', {
            'fields': (
                'store_name',
                'store_description',
                'store_logo',
                'logo_preview',
            )
        }),
        ('Business Details / تفاصيل النشاط', {
            'fields': (
                'business_type',
                'business_address',
                'business_license',
            )
        }),
        ('Application Status / حالة الطلب', {
            'fields': (
                'status',
                'admin_notes',
                'rejection_reason',
            )
        }),
        ('Review Information / معلومات المراجعة', {
            'fields': (
                'reviewed_by',
                'reviewed_at',
                'created_vendor',
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps / الطوابع الزمنية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Actions
    actions = [approve_applications, reject_applications]
    
    # Ordering
    ordering = ['-created_at']
    
    # Date Hierarchy
    date_hierarchy = 'created_at'
    
    def status_badge(self, obj):
        """
        Display status with colored badge
        عرض الحالة مع شارة ملونة
        """
        colors = {
            'pending': ('orange', '#fff'),
            'approved': ('#28a745', 'white'),
            'rejected': ('#dc3545', 'white'),
        }
        bg, text = colors.get(obj.status, ('gray', 'white'))
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 10px; '
            'border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            bg, text, obj.get_status_display()
        )
    status_badge.short_description = 'الحالة / Status'
    status_badge.admin_order_field = 'status'
    
    def business_type_badge(self, obj):
        """
        Display business type badge
        عرض شارة نوع النشاط
        """
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 2px 8px; '
            'border-radius: 8px; font-size: 11px;">{}</span>',
            obj.get_business_type_display()
        )
    business_type_badge.short_description = 'النوع / Type'
    business_type_badge.admin_order_field = 'business_type'
    
    def logo_preview(self, obj):
        """
        Display logo preview
        عرض معاينة الشعار
        """
        if obj.store_logo:
            return format_html(
                '<img src="{}" style="max-width: 150px; max-height: 150px; '
                'border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.store_logo.url
            )
        return format_html('<span style="color: #999;">لا يوجد شعار</span>')
    logo_preview.short_description = 'معاينة الشعار / Logo Preview'
    
    def quick_actions(self, obj):
        """
        Display quick action links
        عرض روابط الإجراءات السريعة
        """
        if obj.status == 'pending':
            return format_html(
                '<span style="color: #007bff; font-weight: bold;">⏳ بانتظار المراجعة</span>'
            )
        elif obj.status == 'approved':
            if obj.created_vendor:
                return format_html(
                    '<a href="/admin/vendors/vendor/{}/change/" '
                    'style="color: #28a745; font-weight: bold;">✅ عرض البائع</a>',
                    obj.created_vendor.id
                )
            return format_html('<span style="color: #28a745;">✅ مقبول</span>')
        else:
            return format_html('<span style="color: #dc3545;">❌ مرفوض</span>')
    quick_actions.short_description = 'إجراءات / Actions'
    
    def save_model(self, request, obj, form, change):
        """
        Handle approval/rejection when status changes
        معالجة الموافقة/الرفض عند تغيير الحالة
        """
        if change:
            old_obj = VendorApplication.objects.get(pk=obj.pk)
            
            # If status changed to approved
            # إذا تغيرت الحالة إلى مقبول
            if old_obj.status == 'pending' and obj.status == 'approved':
                if not obj.created_vendor:
                    # Create vendor
                    vendor = Vendor.objects.create(
                        name=obj.store_name,
                        description=obj.store_description,
                        is_active=True,
                    )
                    # Copy logo if exists
                    if obj.store_logo:
                        vendor.logo = obj.store_logo
                        vendor.save()
                    obj.created_vendor = vendor
                obj.reviewed_by = request.user
                obj.reviewed_at = timezone.now()
            
            # If status changed to rejected
            # إذا تغيرت الحالة إلى مرفوض
            elif old_obj.status == 'pending' and obj.status == 'rejected':
                obj.reviewed_by = request.user
                obj.reviewed_at = timezone.now()
        
        super().save_model(request, obj, form, change)


# ============================================================================
# Vendor Settings Admin
# إدارة إعدادات البائعين
# ============================================================================

@admin.register(VendorSettings)
class VendorSettingsAdmin(admin.ModelAdmin):
    """
    Vendor Settings Admin Interface
    واجهة إدارة إعدادات البائعين
    """
    
    list_display = [
        'vendor',
        'email_notifications_enabled',
        'auto_confirm_orders',
        'stock_alert_threshold',
        'updated_at',
    ]
    
    list_filter = [
        'email_notifications_enabled',
        'auto_confirm_orders',
        'default_order_status',
        'updated_at',
    ]
    
    search_fields = [
        'vendor__name',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Vendor / البائع', {
            'fields': ('vendor',)
        }),
        ('Notification Preferences / تفضيلات الإشعارات', {
            'fields': (
                'notify_new_orders',
                'notify_order_status_changes',
                'notify_order_cancellations',
                'notify_low_stock',
                'notify_out_of_stock',
                'notify_new_customers',
                'email_notifications_enabled',
            )
        }),
        ('Store Settings / إعدادات المتجر', {
            'fields': (
                'auto_confirm_orders',
                'default_order_status',
                'stock_alert_threshold',
                'auto_archive_orders_after_days',
            )
        }),
        ('Timestamps / الطوابع الزمنية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['vendor__name']
