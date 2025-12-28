"""
Vendor Models
نماذج البائعين

This module contains models for vendors and vendor applications.
هذا الملف يحتوي على نماذج البائعين وطلبات الانضمام.

Models:
    - Vendor: نموذج البائع (العلامة التجارية)
    - VendorApplication: نموذج طلب الانضمام

Author: Yalla Buy Team
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.conf import settings


# =============================================================================
# Vendor Model
# نموذج البائع
# =============================================================================

class Vendor(models.Model):
    """
    Represents a brand/vendor (e.g., Fifi, Soft)
    يمثل علامة تجارية/بائع
    
    Fields:
        - name: اسم البائع (فريد)
        - slug: المعرف URL-friendly
        - logo: شعار البائع
        - description: وصف البائع
        - primary_color: اللون الأساسي للعلامة التجارية
        - commission_rate: نسبة العمولة
        - is_active: هل البائع نشط
    """
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('اسم البائع / Vendor Name'),
        help_text=_('اسم العلامة التجارية')
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        verbose_name=_('المعرف / Slug')
    )
    logo = models.ImageField(
        upload_to='vendors/logos/',
        null=True,
        blank=True,
        verbose_name=_('الشعار / Logo')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('الوصف / Description')
    )
    
    # Brand colors for dynamic theming
    # ألوان العلامة التجارية للتنسيق الديناميكي
    primary_color = models.CharField(
        max_length=7,
        default='#000000',
        verbose_name=_('اللون الأساسي / Primary Color'),
        help_text=_('Hex color code (e.g., #E91E63)')
    )
    
    # Commission rate (percentage)
    # نسبة العمولة
    commission_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('نسبة العمولة / Commission Rate'),
        help_text=_('Commission percentage (0-100)')
    )
    
    # Status
    # الحالة
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('نشط / Active')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('تاريخ الإنشاء / Created At')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('تاريخ التحديث / Updated At')
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = _('البائع / Vendor')
        verbose_name_plural = _('البائعون / Vendors')
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['slug']),
        ]
    
    def save(self, *args, **kwargs):
        """Generate slug from name if not provided"""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


# =============================================================================
# Vendor Application Model
# نموذج طلب انضمام البائع
# =============================================================================

class VendorApplication(models.Model):
    """
    Represents a vendor application (request to join as a vendor)
    يمثل طلب انضمام بائع جديد
    
    Workflow / سير العمل:
        1. المتقدم يرسل الطلب (pending)
        2. الأدمن يراجع الطلب
        3. الأدمن يوافق (approved) أو يرفض (rejected)
        4. إذا تمت الموافقة، يتم إنشاء Vendor تلقائياً
    
    Fields:
        Applicant Info / معلومات المتقدم:
            - applicant_name: اسم المتقدم
            - applicant_email: البريد الإلكتروني
            - applicant_phone: رقم الهاتف
        
        Store Info / معلومات المتجر:
            - store_name: اسم المتجر المقترح
            - store_description: وصف المتجر
            - store_logo: شعار المتجر
            - business_type: نوع النشاط التجاري
            - business_address: عنوان النشاط
        
        Application Status / حالة الطلب:
            - status: حالة الطلب (pending/approved/rejected)
            - admin_notes: ملاحظات الأدمن
            - reviewed_by: من راجع الطلب
            - reviewed_at: تاريخ المراجعة
        
        Result / النتيجة:
            - created_vendor: البائع الذي تم إنشاؤه (إذا تمت الموافقة)
    """
    
    # ==========================================================================
    # Status Choices
    # خيارات الحالة
    # ==========================================================================
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('قيد المراجعة / Pending')
        APPROVED = 'approved', _('مقبول / Approved')
        REJECTED = 'rejected', _('مرفوض / Rejected')
    
    # ==========================================================================
    # Business Type Choices
    # خيارات نوع النشاط
    # ==========================================================================
    
    class BusinessType(models.TextChoices):
        INDIVIDUAL = 'individual', _('فردي / Individual')
        COMPANY = 'company', _('شركة / Company')
        BRAND = 'brand', _('علامة تجارية / Brand')
        OTHER = 'other', _('أخرى / Other')
    
    # ==========================================================================
    # Applicant Information
    # معلومات المتقدم
    # ==========================================================================
    
    applicant_name = models.CharField(
        max_length=100,
        verbose_name=_('اسم المتقدم / Applicant Name')
    )
    applicant_email = models.EmailField(
        verbose_name=_('البريد الإلكتروني / Email')
    )
    applicant_phone = models.CharField(
        max_length=20,
        verbose_name=_('رقم الهاتف / Phone')
    )
    
    # Link to user if registered
    # الربط بالمستخدم إذا كان مسجلاً
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vendor_applications',
        verbose_name=_('المستخدم / User'),
        help_text=_('المستخدم المرتبط (إذا كان مسجلاً)')
    )
    
    # ==========================================================================
    # Store Information
    # معلومات المتجر
    # ==========================================================================
    
    store_name = models.CharField(
        max_length=100,
        verbose_name=_('اسم المتجر / Store Name'),
        help_text=_('اسم المتجر المقترح')
    )
    store_description = models.TextField(
        blank=True,
        verbose_name=_('وصف المتجر / Store Description'),
        help_text=_('وصف مختصر عن المتجر والمنتجات')
    )
    store_logo = models.ImageField(
        upload_to='vendor_applications/logos/',
        null=True,
        blank=True,
        verbose_name=_('شعار المتجر / Store Logo')
    )
    
    business_type = models.CharField(
        max_length=20,
        choices=BusinessType.choices,
        default=BusinessType.INDIVIDUAL,
        verbose_name=_('نوع النشاط / Business Type')
    )
    business_address = models.TextField(
        blank=True,
        verbose_name=_('عنوان النشاط / Business Address')
    )
    
    # Additional documents
    # مستندات إضافية
    business_license = models.FileField(
        upload_to='vendor_applications/documents/',
        null=True,
        blank=True,
        verbose_name=_('رخصة النشاط / Business License'),
        help_text=_('صورة رخصة النشاط التجاري (اختياري)')
    )
    
    # ==========================================================================
    # Application Status
    # حالة الطلب
    # ==========================================================================
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_('الحالة / Status'),
        db_index=True
    )
    
    admin_notes = models.TextField(
        blank=True,
        verbose_name=_('ملاحظات الأدمن / Admin Notes'),
        help_text=_('ملاحظات داخلية للأدمن')
    )
    
    rejection_reason = models.TextField(
        blank=True,
        verbose_name=_('سبب الرفض / Rejection Reason'),
        help_text=_('سبب الرفض (يُرسل للمتقدم)')
    )
    
    # Review info
    # معلومات المراجعة
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_vendor_applications',
        verbose_name=_('تمت المراجعة بواسطة / Reviewed By')
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('تاريخ المراجعة / Reviewed At')
    )
    
    # ==========================================================================
    # Result
    # النتيجة
    # ==========================================================================
    
    created_vendor = models.OneToOneField(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='application',
        verbose_name=_('البائع المُنشأ / Created Vendor'),
        help_text=_('البائع الذي تم إنشاؤه بعد الموافقة')
    )
    
    # ==========================================================================
    # Timestamps
    # الطوابع الزمنية
    # ==========================================================================
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('تاريخ التقديم / Submitted At')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('تاريخ التحديث / Updated At')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('طلب انضمام بائع / Vendor Application')
        verbose_name_plural = _('طلبات انضمام البائعين / Vendor Applications')
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['applicant_email']),
        ]
    
    def __str__(self):
        return f"{self.store_name} - {self.applicant_name} ({self.get_status_display()})"
    
    @property
    def is_pending(self):
        """Check if application is pending review"""
        return self.status == self.Status.PENDING
    
    @property
    def is_approved(self):
        """Check if application is approved"""
        return self.status == self.Status.APPROVED
    
    @property
    def is_rejected(self):
        """Check if application is rejected"""
        return self.status == self.Status.REJECTED
    
    def approve(self, admin_user, commission_rate=10.00):
        """
        Approve the application and create a vendor
        الموافقة على الطلب وإنشاء بائع
        
        Args:
            admin_user: الأدمن الذي يوافق
            commission_rate: نسبة العمولة للبائع الجديد
        
        Returns:
            Vendor: البائع المُنشأ
        """
        from django.utils import timezone
        
        if self.status != self.Status.PENDING:
            raise ValueError("يمكن الموافقة فقط على الطلبات المعلقة / Can only approve pending applications")
        
        # Create the vendor
        # إنشاء البائع
        vendor = Vendor.objects.create(
            name=self.store_name,
            description=self.store_description,
            logo=self.store_logo.name if self.store_logo else None,
            commission_rate=commission_rate,
            is_active=True,
        )
        
        # Update application
        # تحديث الطلب
        self.status = self.Status.APPROVED
        self.created_vendor = vendor
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save()
        
        return vendor
    
    def reject(self, admin_user, reason=''):
        """
        Reject the application
        رفض الطلب
        
        Args:
            admin_user: الأدمن الذي يرفض
            reason: سبب الرفض
        """
        from django.utils import timezone
        
        if self.status != self.Status.PENDING:
            raise ValueError("يمكن رفض الطلبات المعلقة فقط / Can only reject pending applications")
        
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.save()
