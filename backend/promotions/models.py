"""
Promotions Models
نماذج العروض والحملات

This module contains models for banners, stories, and coupons.
هذا الملف يحتوي على نماذج البانرات والقصص والكوبونات.

Models:
    - Banner: نموذج البانر الإعلاني
    - Story: نموذج القصة (Story)
    - Coupon: نموذج الكوبون

Author: Yalla Buy Team
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# =============================================================================
# Banner Model
# نموذج البانر الإعلاني
# =============================================================================

class Banner(models.Model):
    """
    Banner Model for promotional banners
    نموذج البانر الإعلاني
    
    Used for hero banners, sidebar ads, popups, and category banners.
    يُستخدم للبانرات الرئيسية وإعلانات الشريط الجانبي والنوافذ المنبثقة وبانرات الفئات.
    """
    
    class Location(models.TextChoices):
        """Banner location choices / خيارات موقع البانر"""
        HERO = 'hero', _('Hero Banner / البانر الرئيسي')
        SIDEBAR = 'sidebar', _('Sidebar / الشريط الجانبي')
        POPUP = 'popup', _('Popup / النافذة المنبثقة')
        CATEGORY = 'category', _('Category / الفئة')
    
    class LinkType(models.TextChoices):
        """Link type choices / خيارات نوع الرابط"""
        URL = 'url', _('URL / رابط مباشر')
        PRODUCT = 'product', _('Product / منتج')
        CATEGORY = 'category', _('Category / فئة')
    
    # Basic Information / المعلومات الأساسية
    title = models.CharField(
        max_length=200,
        verbose_name=_('Title / العنوان'),
        help_text=_('Banner title in English / عنوان البانر بالإنجليزية')
    )
    title_ar = models.CharField(
        max_length=200,
        verbose_name=_('Title (Arabic) / العنوان (عربي)'),
        help_text=_('Banner title in Arabic / عنوان البانر بالعربية')
    )
    subtitle = models.CharField(
        max_length=300,
        blank=True,
        verbose_name=_('Subtitle / العنوان الفرعي'),
        help_text=_('Banner subtitle in English / العنوان الفرعي بالإنجليزية')
    )
    subtitle_ar = models.CharField(
        max_length=300,
        blank=True,
        verbose_name=_('Subtitle (Arabic) / العنوان الفرعي (عربي)'),
        help_text=_('Banner subtitle in Arabic / العنوان الفرعي بالعربية')
    )
    
    # Media / الوسائط
    image = models.ImageField(
        upload_to='promotions/banners/',
        verbose_name=_('Image / الصورة'),
        help_text=_('Banner image / صورة البانر')
    )
    
    # Link Configuration / إعدادات الرابط
    link_type = models.CharField(
        max_length=20,
        choices=LinkType.choices,
        default=LinkType.URL,
        verbose_name=_('Link Type / نوع الرابط'),
        help_text=_('Type of link / نوع الرابط')
    )
    link = models.CharField(
        max_length=500,
        verbose_name=_('Link / الرابط'),
        help_text=_('URL, product slug, or category slug / رابط URL أو معرف المنتج أو الفئة')
    )
    
    # Location and Display / الموقع والعرض
    location = models.CharField(
        max_length=20,
        choices=Location.choices,
        default=Location.HERO,
        verbose_name=_('Location / الموقع'),
        help_text=_('Where the banner will be displayed / مكان عرض البانر')
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Order / الترتيب'),
        help_text=_('Display order (lower numbers appear first) / ترتيب العرض (الأرقام الأقل تظهر أولاً)')
    )
    
    # Scheduling / الجدولة
    start_date = models.DateTimeField(
        verbose_name=_('Start Date / تاريخ البدء'),
        help_text=_('When the banner should start showing / متى يبدأ عرض البانر')
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('End Date / تاريخ الانتهاء'),
        help_text=_('When the banner should stop showing (optional) / متى يتوقف عرض البانر (اختياري)')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active / نشط'),
        help_text=_('Whether the banner is currently active / هل البانر نشط حالياً')
    )
    
    # Analytics / التحليلات
    views = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Views / المشاهدات'),
        help_text=_('Number of times the banner was viewed / عدد مرات مشاهدة البانر')
    )
    clicks = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Clicks / النقرات'),
        help_text=_('Number of times the banner was clicked / عدد مرات النقر على البانر')
    )
    
    # Timestamps / الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Banner / البانر')
        verbose_name_plural = _('Banners / البانرات')
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['location', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_location_display()})"
    
    def is_currently_active(self):
        """
        Check if banner is currently active based on dates
        التحقق من أن البانر نشط حالياً بناءً على التواريخ
        """
        now = timezone.now()
        if not self.is_active:
            return False
        # Check if start_date exists before comparing
        # التحقق من وجود start_date قبل المقارنة
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True
    
    def increment_view(self):
        """Increment view count / زيادة عدد المشاهدات"""
        self.views = models.F('views') + 1
        self.save(update_fields=['views'])
    
    def increment_click(self):
        """Increment click count / زيادة عدد النقرات"""
        self.clicks = models.F('clicks') + 1
        self.save(update_fields=['clicks'])


# =============================================================================
# Story Model
# نموذج القصة
# =============================================================================

class Story(models.Model):
    """
    Story Model for Instagram-like stories
    نموذج القصة (مثل قصص إنستغرام)
    
    Used for temporary promotional content that expires after a set time.
    يُستخدم للمحتوى الترويجي المؤقت الذي ينتهي بعد فترة محددة.
    """
    
    class LinkType(models.TextChoices):
        """Link type choices / خيارات نوع الرابط"""
        URL = 'url', _('URL / رابط مباشر')
        PRODUCT = 'product', _('Product / منتج')
        CATEGORY = 'category', _('Category / فئة')
    
    # Basic Information / المعلومات الأساسية
    title = models.CharField(
        max_length=200,
        verbose_name=_('Title / العنوان'),
        help_text=_('Story title in English / عنوان القصة بالإنجليزية')
    )
    title_ar = models.CharField(
        max_length=200,
        verbose_name=_('Title (Arabic) / العنوان (عربي)'),
        help_text=_('Story title in Arabic / عنوان القصة بالعربية')
    )
    
    # Media / الوسائط
    image = models.ImageField(
        upload_to='promotions/stories/',
        verbose_name=_('Image / الصورة'),
        help_text=_('Story image / صورة القصة')
    )
    
    # Link Configuration / إعدادات الرابط
    link_type = models.CharField(
        max_length=20,
        choices=LinkType.choices,
        default=LinkType.URL,
        verbose_name=_('Link Type / نوع الرابط'),
        help_text=_('Type of link / نوع الرابط')
    )
    link = models.CharField(
        max_length=500,
        blank=True,
        verbose_name=_('Link / الرابط'),
        help_text=_('URL, product slug, or category slug (optional) / رابط URL أو معرف المنتج أو الفئة (اختياري)')
    )
    
    # Scheduling / الجدولة
    expires_at = models.DateTimeField(
        verbose_name=_('Expires At / ينتهي في'),
        help_text=_('When the story should expire / متى تنتهي القصة')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active / نشط'),
        help_text=_('Whether the story is currently active / هل القصة نشطة حالياً')
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Order / الترتيب'),
        help_text=_('Display order (lower numbers appear first) / ترتيب العرض (الأرقام الأقل تظهر أولاً)')
    )
    
    # Analytics / التحليلات
    views = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Views / المشاهدات'),
        help_text=_('Number of times the story was viewed / عدد مرات مشاهدة القصة')
    )
    
    # Timestamps / الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Story / القصة')
        verbose_name_plural = _('Stories / القصص')
        ordering = ['order', '-created_at']
        indexes = [
            models.Index(fields=['is_active', 'expires_at']),
        ]
    
    def __str__(self):
        return f"{self.title}"
    
    def is_currently_active(self):
        """
        Check if story is currently active
        التحقق من أن القصة نشطة حالياً
        """
        now = timezone.now()
        if not self.is_active:
            return False
        # Check if expires_at exists before comparing
        # التحقق من وجود expires_at قبل المقارنة
        if self.expires_at and self.expires_at < now:
            return False
        return True
    
    def increment_view(self):
        """Increment view count / زيادة عدد المشاهدات"""
        self.views = models.F('views') + 1
        self.save(update_fields=['views'])


# =============================================================================
# Coupon Model
# نموذج الكوبون
# =============================================================================

class Coupon(models.Model):
    """
    Coupon Model for discount codes
    نموذج الكوبون للرموز الترويجية
    
    Supports percentage and fixed discounts with various applicability rules.
    يدعم الخصومات النسبية والثابتة مع قواعد تطبيق متنوعة.
    """
    
    class DiscountType(models.TextChoices):
        """Discount type choices / خيارات نوع الخصم"""
        PERCENTAGE = 'percentage', _('Percentage / نسبة مئوية')
        FIXED = 'fixed', _('Fixed Amount / مبلغ ثابت')
    
    class ApplicableTo(models.TextChoices):
        """Applicability choices / خيارات التطبيق"""
        ALL = 'all', _('All Products / جميع المنتجات')
        CATEGORY = 'category', _('Category / فئة')
        PRODUCT = 'product', _('Product / منتج')
        USER = 'user', _('Specific Users / مستخدمون محددون')
    
    # Basic Information / المعلومات الأساسية
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Code / الرمز'),
        help_text=_('Coupon code (must be unique) / رمز الكوبون (يجب أن يكون فريداً)')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Description / الوصف'),
        help_text=_('Coupon description in English / وصف الكوبون بالإنجليزية')
    )
    description_ar = models.TextField(
        blank=True,
        verbose_name=_('Description (Arabic) / الوصف (عربي)'),
        help_text=_('Coupon description in Arabic / وصف الكوبون بالعربية')
    )
    
    # Discount Configuration / إعدادات الخصم
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
        verbose_name=_('Discount Type / نوع الخصم'),
        help_text=_('Type of discount / نوع الخصم')
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name=_('Discount Value / قيمة الخصم'),
        help_text=_('Discount amount (percentage or fixed) / قيمة الخصم (نسبة مئوية أو مبلغ ثابت)')
    )
    
    # Order Requirements / متطلبات الطلب
    min_order = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name=_('Minimum Order / أقل قيمة طلب'),
        help_text=_('Minimum order value to use this coupon / أقل قيمة طلب لاستخدام هذا الكوبون')
    )
    max_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name=_('Maximum Discount / أقصى خصم'),
        help_text=_('Maximum discount amount (for percentage discounts) / أقصى مبلغ خصم (للخصومات النسبية)')
    )
    
    # Usage Limits / حدود الاستخدام
    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name=_('Usage Limit / حد الاستخدام'),
        help_text=_('Maximum number of times this coupon can be used (null = unlimited) / الحد الأقصى لاستخدام الكوبون (null = غير محدود)')
    )
    used_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Used Count / عدد مرات الاستخدام'),
        help_text=_('Number of times this coupon has been used / عدد مرات استخدام الكوبون')
    )
    
    # Applicability / التطبيق
    applicable_to = models.CharField(
        max_length=20,
        choices=ApplicableTo.choices,
        default=ApplicableTo.ALL,
        verbose_name=_('Applicable To / قابل للتطبيق على'),
        help_text=_('What this coupon applies to / ما يمكن تطبيق الكوبون عليه')
    )
    
    # Many-to-Many relationships for specific applicability
    # علاقات Many-to-Many للتطبيق المحدد
    applicable_categories = models.ManyToManyField(
        'products.Category',
        blank=True,
        related_name='coupons',
        verbose_name=_('Applicable Categories / الفئات القابلة للتطبيق'),
        help_text=_('Categories this coupon applies to (if applicable_to = category) / الفئات التي ينطبق عليها الكوبون (إذا applicable_to = category)')
    )
    applicable_products = models.ManyToManyField(
        'products.Product',
        blank=True,
        related_name='coupons',
        verbose_name=_('Applicable Products / المنتجات القابلة للتطبيق'),
        help_text=_('Products this coupon applies to (if applicable_to = product) / المنتجات التي ينطبق عليها الكوبون (إذا applicable_to = product)')
    )
    applicable_users = models.ManyToManyField(
        'users.User',
        blank=True,
        related_name='coupons',
        verbose_name=_('Applicable Users / المستخدمون القابلون للتطبيق'),
        help_text=_('Users who can use this coupon (if applicable_to = user) / المستخدمون الذين يمكنهم استخدام الكوبون (إذا applicable_to = user)')
    )
    
    # Scheduling / الجدولة
    start_date = models.DateTimeField(
        verbose_name=_('Start Date / تاريخ البدء'),
        help_text=_('When the coupon becomes valid / متى يصبح الكوبون صالحاً')
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('End Date / تاريخ الانتهاء'),
        help_text=_('When the coupon expires (optional) / متى ينتهي الكوبون (اختياري)')
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active / نشط'),
        help_text=_('Whether the coupon is currently active / هل الكوبون نشط حالياً')
    )
    
    # Timestamps / الطوابع الزمنية
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Coupon / الكوبون')
        verbose_name_plural = _('Coupons / الكوبونات')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active', 'start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.code} ({self.get_discount_type_display()})"
    
    def is_currently_valid(self):
        """
        Check if coupon is currently valid
        التحقق من أن الكوبون صالح حالياً
        """
        now = timezone.now()
        if not self.is_active:
            return False
        # Check if start_date exists before comparing
        # التحقق من وجود start_date قبل المقارنة
        if self.start_date and self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True
    
    def calculate_discount(self, order_total):
        """
        Calculate discount amount for a given order total
        حساب مبلغ الخصم لإجمالي طلب معين
        
        Args:
            order_total: Total order amount / إجمالي مبلغ الطلب
            
        Returns:
            Discount amount / مبلغ الخصم
        """
        if not self.is_currently_valid():
            return 0
        
        if order_total < self.min_order:
            return 0
        
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (order_total * self.discount_value) / 100
            if self.max_discount:
                discount = min(discount, self.max_discount)
            return discount
        else:  # FIXED
            return min(self.discount_value, order_total)
    
    def can_be_used_by_user(self, user):
        """
        Check if coupon can be used by a specific user
        التحقق من إمكانية استخدام الكوبون من قبل مستخدم معين
        
        Args:
            user: User instance / كائن المستخدم
            
        Returns:
            bool: True if user can use coupon / True إذا كان المستخدم يمكنه استخدام الكوبون
        """
        if self.applicable_to == self.ApplicableTo.USER:
            return self.applicable_users.filter(id=user.id).exists()
        return True
    
    def can_be_applied_to_product(self, product):
        """
        Check if coupon can be applied to a specific product
        التحقق من إمكانية تطبيق الكوبون على منتج معين
        
        Args:
            product: Product instance / كائن المنتج
            
        Returns:
            bool: True if coupon applies to product / True إذا كان الكوبون ينطبق على المنتج
        """
        if self.applicable_to == self.ApplicableTo.ALL:
            return True
        elif self.applicable_to == self.ApplicableTo.PRODUCT:
            return self.applicable_products.filter(id=product.id).exists()
        elif self.applicable_to == self.ApplicableTo.CATEGORY:
            if product.category:
                return self.applicable_categories.filter(id=product.category.id).exists()
            return False
        return False
    
    def increment_usage(self):
        """Increment usage count / زيادة عدد مرات الاستخدام"""
        self.used_count = models.F('used_count') + 1
        self.save(update_fields=['used_count'])

