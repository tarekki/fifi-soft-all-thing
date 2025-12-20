"""
User Models - Custom User System
نماذج المستخدمين - نظام المستخدمين المخصص

This module defines the custom user models for the e-commerce platform.
هذا الوحدة تعرّف نماذج المستخدمين المخصصة لمنصة التجارة الإلكترونية.

Models:
- User: Custom user model with role-based access control
- UserProfile: Extended user profile information
- VendorUser: Links users to vendors (for vendor management)
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


# ============================================================================
# Custom User Manager
# مدير المستخدمين المخصص
# ============================================================================

class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    مدير مستخدمين مخصص حيث البريد الإلكتروني هو المعرف الفريد
    
    Instead of username, we use email for authentication.
    بدلاً من اسم المستخدم، نستخدم البريد الإلكتروني للمصادقة.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a regular user with the given email and password.
        إنشاء وحفظ مستخدم عادي بالبريد الإلكتروني وكلمة المرور المعطاة.
        
        Args:
            email: User email address (required)
            password: User password
            **extra_fields: Additional user fields
        
        Returns:
            User instance
        """
        if not email:
            raise ValueError(_('The Email field must be set'))
        
        # Normalize email (lowercase)
        # توحيد البريد الإلكتروني (أحرف صغيرة)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a superuser with the given email and password.
        إنشاء وحفظ مستخدم فائق بالبريد الإلكتروني وكلمة المرور المعطاة.
        
        Args:
            email: Superuser email address (required)
            password: Superuser password
            **extra_fields: Additional user fields
        
        Returns:
            User instance with superuser privileges
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


# ============================================================================
# User Model
# نموذج المستخدم
# ============================================================================

class User(AbstractUser):
    """
    Custom User Model - Extends Django's AbstractUser
    نموذج المستخدم المخصص - يمتد من AbstractUser الخاص بـ Django
    
    This model replaces Django's default User model.
    هذا النموذج يحل محل نموذج المستخدم الافتراضي في Django.
    
    Key Features:
    - Email-based authentication (instead of username)
    - Role-based access control (Customer, Vendor, Admin)
    - Phone number support
    - Full name field
    
    الميزات الرئيسية:
    - المصادقة بالبريد الإلكتروني (بدلاً من اسم المستخدم)
    - التحكم بالوصول بناءً على الأدوار (زبون، بائع، مطور)
    - دعم رقم الهاتف
    - حقل الاسم الكامل
    """
    
    # ========================================================================
    # Role Choices
    # خيارات الأدوار
    # ========================================================================
    class Role(models.TextChoices):
        """
        User role choices
        خيارات دور المستخدم
        
        CUSTOMER: Regular customer who can browse and purchase
        VENDOR: Vendor who can manage their products and orders
        ADMIN: Platform administrator with full access
        """
        CUSTOMER = 'customer', _('Customer')  # زبون
        VENDOR = 'vendor', _('Vendor')       # بائع
        ADMIN = 'admin', _('Admin')          # مطور
    
    # ========================================================================
    # User Fields
    # حقول المستخدم
    # ========================================================================
    
    # Email is the primary identifier (replaces username)
    # البريد الإلكتروني هو المعرف الأساسي (يحل محل اسم المستخدم)
    email = models.EmailField(
        _('email address'),
        unique=True,
        help_text=_('Required. Unique email address for authentication.')
    )
    
    # Phone number (unique, required)
    # رقم الهاتف (فريد، مطلوب)
    phone = models.CharField(
        _('phone number'),
        max_length=20,
        unique=True,
        help_text=_('Required. Unique phone number.')
    )
    
    # Full name
    # الاسم الكامل
    full_name = models.CharField(
        _('full name'),
        max_length=200,
        blank=True,
        help_text=_('User full name.')
    )
    
    # User role (Customer, Vendor, or Admin)
    # دور المستخدم (زبون، بائع، أو مطور)
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        help_text=_('User role: Customer, Vendor, or Admin.')
    )
    
    # Remove username field (we use email instead)
    # إزالة حقل اسم المستخدم (نستخدم البريد الإلكتروني بدلاً منه)
    username = None
    
    # ========================================================================
    # Timestamps
    # الطوابع الزمنية
    # ========================================================================
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ========================================================================
    # Model Configuration
    # إعدادات النموذج
    # ========================================================================
    
    # Use email as the username field
    # استخدام البريد الإلكتروني كحقل اسم المستخدم
    USERNAME_FIELD = 'email'
    
    # Required fields for user creation
    # الحقول المطلوبة لإنشاء مستخدم
    REQUIRED_FIELDS = ['phone', 'full_name']
    
    # Use custom user manager
    # استخدام مدير المستخدمين المخصص
    objects = CustomUserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
        # Database indexes for performance
        # فهارس قاعدة البيانات للأداء
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        """
        String representation of the user
        التمثيل النصي للمستخدم
        """
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def is_customer(self):
        """Check if user is a customer"""
        return self.role == self.Role.CUSTOMER
    
    @property
    def is_vendor(self):
        """Check if user is a vendor"""
        return self.role == self.Role.VENDOR
    
    @property
    def is_admin(self):
        """Check if user is an admin"""
        return self.role == self.Role.ADMIN or self.is_superuser


# ============================================================================
# User Profile Model
# نموذج الملف الشخصي للمستخدم
# ============================================================================

class UserProfile(models.Model):
    """
    Extended user profile information
    معلومات الملف الشخصي الموسعة للمستخدم
    
    This model stores additional user information that is not required
    for authentication but useful for the platform.
    
    هذا النموذج يخزن معلومات إضافية عن المستخدم غير مطلوبة
    للمصادقة ولكنها مفيدة للمنصة.
    """
    
    # One-to-one relationship with User
    # علاقة واحد لواحد مع User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text=_('Associated user account.')
    )
    
    # Default address for orders
    # العنوان الافتراضي للطلبات
    address = models.TextField(
        _('address'),
        blank=True,
        help_text=_('Default delivery address.')
    )
    
    # User avatar/profile picture
    # صورة الملف الشخصي
    avatar = models.ImageField(
        _('avatar'),
        upload_to='users/avatars/',
        null=True,
        blank=True,
        help_text=_('User profile picture.')
    )
    
    # Preferred language (Arabic or English)
    # اللغة المفضلة (عربي أو إنجليزي)
    class Language(models.TextChoices):
        ARABIC = 'ar', _('Arabic')
        ENGLISH = 'en', _('English')
    
    preferred_language = models.CharField(
        _('preferred language'),
        max_length=2,
        choices=Language.choices,
        default=Language.ARABIC,
        help_text=_('User preferred language.')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('user profile')
        verbose_name_plural = _('user profiles')
    
    def __str__(self):
        """String representation"""
        return f"Profile of {self.user.email}"


# ============================================================================
# Vendor User Model
# نموذج مستخدم البائع
# ============================================================================

class VendorUser(models.Model):
    """
    Links users to vendors (for vendor management)
    يربط المستخدمين بالبائعين (لإدارة البائعين)
    
    This model allows multiple users to be associated with a vendor,
    with different permission levels.
    
    هذا النموذج يسمح بربط عدة مستخدمين ببائع واحد،
    بمستويات صلاحيات مختلفة.
    """
    
    # User associated with vendor
    # المستخدم المرتبط بالبائع
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vendor_users',
        help_text=_('User associated with this vendor.')
    )
    
    # Vendor associated with user
    # البائع المرتبط بالمستخدم
    vendor = models.ForeignKey(
        'vendors.Vendor',
        on_delete=models.CASCADE,
        related_name='vendor_users',
        help_text=_('Vendor associated with this user.')
    )
    
    # Is this user the owner of the vendor?
    # هل هذا المستخدم هو مالك البائع؟
    is_owner = models.BooleanField(
        _('is owner'),
        default=False,
        help_text=_('Is this user the owner of the vendor?')
    )
    
    # Vendor-specific permissions (stored as JSON)
    # صلاحيات خاصة بالبائع (مخزنة كـ JSON)
    # Example: {"can_manage_products": true, "can_view_orders": true}
    permissions = models.JSONField(
        _('permissions'),
        default=dict,
        blank=True,
        help_text=_('Vendor-specific permissions for this user.')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('vendor user')
        verbose_name_plural = _('vendor users')
        # Ensure one user can only be associated with a vendor once
        # التأكد من أن المستخدم يمكن أن يكون مرتبطاً ببائع واحد فقط
        unique_together = [['user', 'vendor']]
        indexes = [
            models.Index(fields=['user', 'vendor']),
            models.Index(fields=['is_owner']),
        ]
    
    def __str__(self):
        """String representation"""
        owner_text = " (Owner)" if self.is_owner else ""
        return f"{self.user.email} - {self.vendor.name}{owner_text}"


# ============================================================================
# Email Verification Model
# نموذج التحقق من البريد الإلكتروني
# ============================================================================

class EmailVerification(models.Model):
    """
    Email verification tokens
    رموز التحقق من البريد الإلكتروني
    
    Stores verification tokens for email verification.
    يخزن رموز التحقق للتحقق من البريد الإلكتروني.
    """
    
    # User to verify
    # المستخدم المراد التحقق منه
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification',
        help_text=_('User to verify.')
    )
    
    # Verification token
    # رمز التحقق
    token = models.CharField(
        _('verification token'),
        max_length=100,
        unique=True,
        help_text=_('Unique verification token.')
    )
    
    # Verification status
    # حالة التحقق
    is_verified = models.BooleanField(
        _('is verified'),
        default=False,
        help_text=_('Whether the email has been verified.')
    )
    
    # Token expiration
    # انتهاء صلاحية الرمز
    expires_at = models.DateTimeField(
        _('expires at'),
        help_text=_('Token expiration date and time.')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('email verification')
        verbose_name_plural = _('email verifications')
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'is_verified']),
        ]
    
    def __str__(self):
        """String representation"""
        status = "Verified" if self.is_verified else "Pending"
        return f"{self.user.email} - {status}"
    
    def is_expired(self):
        """Check if token is expired"""
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    @classmethod
    def generate_token(cls):
        """
        Generate a unique verification token
        إنشاء رمز تحقق فريد
        """
        import secrets
        return secrets.token_urlsafe(32)  # 32 bytes = 44 characters
