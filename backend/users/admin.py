"""
Django Admin Configuration for User Models
إعدادات Django Admin لنماذج المستخدمين

This module registers User, UserProfile, and VendorUser models
in the Django admin interface for easy management.

هذا الوحدة يسجل نماذج User و UserProfile و VendorUser
في واجهة Django admin لإدارة سهلة.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile, VendorUser, EmailVerification


# ============================================================================
# User Profile Inline
# نموذج الملف الشخصي المضمن
# ============================================================================

class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile
    نموذج إداري مضمّن للملف الشخصي
    
    Allows editing user profile directly from the user admin page.
    يسمح بتعديل الملف الشخصي مباشرة من صفحة إدارة المستخدم.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = _('Profile')
    fk_name = 'user'


# ============================================================================
# Vendor User Inline
# نموذج مستخدم البائع المضمن
# ============================================================================

class VendorUserInline(admin.TabularInline):
    """
    Inline admin for VendorUser
    نموذج إداري مضمّن لمستخدم البائع
    
    Shows all vendors associated with a user.
    يعرض جميع البائعين المرتبطين بمستخدم.
    """
    model = VendorUser
    extra = 0
    verbose_name_plural = _('Vendor Associations')
    fields = ('vendor', 'is_owner', 'permissions')


# ============================================================================
# Custom User Admin
# إدارة المستخدمين المخصصة
# ============================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for User model
    واجهة إدارة مخصصة لنموذج المستخدم
    
    Extends Django's default UserAdmin with our custom fields.
    يمتد من UserAdmin الافتراضي في Django مع حقولنا المخصصة.
    """
    
    # Fields to display in the user list
    # الحقول المعروضة في قائمة المستخدمين
    list_display = [
        'email',
        'full_name',
        'phone',
        'role',
        'is_active',
        'is_staff',
        'created_at',
    ]
    
    # Fields to filter by
    # الحقول للفلترة
    list_filter = [
        'role',
        'is_active',
        'is_staff',
        'is_superuser',
        'created_at',
    ]
    
    # Default queryset - exclude superusers from default list
    # الاستعلام الافتراضي - استبعاد superusers من القائمة الافتراضية
    def get_queryset(self, request):
        """
        Exclude superusers from default user list
        استبعاد superusers من قائمة المستخدمين الافتراضية
        
        Superusers can still be accessed via filter or search.
        يمكن الوصول لـ superusers عبر الفلترة أو البحث.
        """
        qs = super().get_queryset(request)
        # Show all users to superusers, but hide superusers from regular staff
        # عرض جميع المستخدمين للمطورين، لكن إخفاء superusers من الموظفين العاديين
        if request.user.is_superuser:
            return qs
        return qs.filter(is_superuser=False)
    
    # Fields to search by
    # الحقول للبحث
    search_fields = [
        'email',
        'full_name',
        'phone',
    ]
    
    # Ordering
    # الترتيب
    ordering = ['-created_at']
    
    # Fieldsets for the add/edit form
    # مجموعات الحقول لنموذج الإضافة/التعديل
    fieldsets = (
        # Authentication fields
        # حقول المصادقة
        (None, {
            'fields': ('email', 'password')
        }),
        # Personal information
        # المعلومات الشخصية
        (_('Personal info'), {
            'fields': ('full_name', 'phone', 'role')
        }),
        # Permissions
        # الصلاحيات
        (_('Permissions'), {
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
        # Important dates
        # التواريخ المهمة
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )
    
    # Fieldsets for the add form (when creating a new user)
    # مجموعات الحقول لنموذج الإضافة (عند إنشاء مستخدم جديد)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'phone',
                'full_name',
                'role',
                'password1',
                'password2',
            ),
        }),
    )
    
    # Read-only fields
    # الحقول للقراءة فقط
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    # Inline models
    # النماذج المضمنة
    inlines = [UserProfileInline, VendorUserInline]
    
    def get_inline_instances(self, request, obj=None):
        """
        Only show inlines when editing an existing user
        عرض النماذج المضمنة فقط عند تعديل مستخدم موجود
        """
        if not obj:
            return []
        return super().get_inline_instances(request, obj)


# ============================================================================
# User Profile Admin
# إدارة الملف الشخصي
# ============================================================================

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for UserProfile model
    واجهة إدارة لنموذج الملف الشخصي
    """
    
    list_display = [
        'user',
        'preferred_language',
        'created_at',
    ]
    
    list_filter = [
        'preferred_language',
        'created_at',
    ]
    
    search_fields = [
        'user__email',
        'user__full_name',
        'address',
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        (_('Profile Information'), {
            'fields': ('address', 'avatar', 'preferred_language')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============================================================================
# Vendor User Admin
# إدارة مستخدم البائع
# ============================================================================

@admin.register(VendorUser)
class VendorUserAdmin(admin.ModelAdmin):
    """
    Admin interface for VendorUser model
    واجهة إدارة لنموذج مستخدم البائع
    """
    
    list_display = [
        'user',
        'vendor',
        'is_owner',
        'created_at',
    ]
    
    list_filter = [
        'is_owner',
        'vendor',
        'created_at',
    ]
    
    search_fields = [
        'user__email',
        'user__full_name',
        'vendor__name',
    ]
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'vendor', 'is_owner')
        }),
        (_('Permissions'), {
            'fields': ('permissions',),
            'description': _('JSON object with vendor-specific permissions. Example: {"can_manage_products": true}')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============================================================================
# Email Verification Admin
# إدارة التحقق من البريد الإلكتروني
# ============================================================================

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """
    Admin interface for EmailVerification model
    واجهة إدارة لنموذج التحقق من البريد الإلكتروني
    """
    
    list_display = [
        'user',
        'is_verified',
        'expires_at',
        'created_at',
    ]
    
    list_filter = [
        'is_verified',
        'created_at',
        'expires_at',
    ]
    
    search_fields = [
        'user__email',
        'user__full_name',
        'token',
    ]
    
    readonly_fields = ['token', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'token', 'is_verified')
        }),
        (_('Expiration'), {
            'fields': ('expires_at',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
