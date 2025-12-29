"""
Notifications Models
نماذج الإشعارات

This module defines notification models for the admin dashboard.
هذه الوحدة تعرّف نماذج الإشعارات للوحة تحكم الإدارة.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


# =============================================================================
# Notification Model
# نموذج الإشعار
# =============================================================================

class Notification(models.Model):
    """
    Admin Notification Model
    نموذج إشعار الإدارة
    
    Stores notifications for admin users about various system events.
    يخزن الإشعارات لمستخدمي الإدارة حول أحداث النظام المختلفة.
    """
    
    # Notification Type Choices
    # خيارات نوع الإشعار
    class NotificationType(models.TextChoices):
        ORDER = 'order', _('Order')
        USER = 'user', _('User')
        VENDOR = 'vendor', _('Vendor')
        SYSTEM = 'system', _('System')
        PRODUCT = 'product', _('Product')
        CATEGORY = 'category', _('Category')
    
    # Target Type Choices (what the notification is about)
    # خيارات نوع الهدف (ما الذي يتعلق به الإشعار)
    class TargetType(models.TextChoices):
        ORDER = 'order', _('Order')
        USER = 'user', _('User')
        VENDOR = 'vendor', _('Vendor')
        PRODUCT = 'product', _('Product')
        CATEGORY = 'category', _('Category')
        SYSTEM = 'system', _('System')
    
    # Recipient (admin user who should see this notification)
    # المستلم (مستخدم الإدارة الذي يجب أن يرى هذا الإشعار)
    # If None, notification is for all admins
    # إذا كان None، الإشعار لجميع المدراء
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
        help_text=_('Admin user who should receive this notification. If null, notification is for all admins.')
    )
    
    # Notification Type
    # نوع الإشعار
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        help_text=_('Type of notification')
    )
    
    # Message (English)
    # الرسالة (الإنجليزية)
    message = models.CharField(
        max_length=500,
        help_text=_('Notification message in English')
    )
    
    # Message (Arabic)
    # الرسالة (العربية)
    message_ar = models.CharField(
        max_length=500,
        blank=True,
        help_text=_('Notification message in Arabic')
    )
    
    # Target Information (what this notification is about)
    # معلومات الهدف (ما الذي يتعلق به هذا الإشعار)
    # Using GenericForeignKey for flexible relationship with any model
    # استخدام GenericForeignKey لعلاقة مرنة مع أي نموذج
    target_content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text=_('Type of object this notification is about')
    )
    target_object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_('ID of the object this notification is about')
    )
    target = GenericForeignKey('target_content_type', 'target_object_id')
    
    # Action (what happened)
    # الإجراء (ما الذي حدث)
    action = models.CharField(
        max_length=100,
        blank=True,
        help_text=_('Action that triggered this notification (e.g., "order_created", "user_registered")')
    )
    
    # Read Status
    # حالة القراءة
    is_read = models.BooleanField(
        default=False,
        help_text=_('Whether this notification has been read')
    )
    
    # Metadata (additional data as JSON)
    # البيانات الوصفية (بيانات إضافية كـ JSON)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text=_('Additional metadata about the notification')
    )
    
    # Timestamps
    # الطوابع الزمنية
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text=_('When this notification was created')
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_('When this notification was marked as read')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        indexes = [
            models.Index(fields=['recipient', 'is_read', 'created_at']),
            models.Index(fields=['type', 'is_read']),
            models.Index(fields=['target_content_type', 'target_object_id']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.message[:50]}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def set_target(self, obj):
        """
        Helper method to set target object
        طريقة مساعدة لتعيين الكائن المستهدف
        
        Args:
            obj: The target object instance (Order, Product, User, etc.)
                 كائن الهدف (Order, Product, User, إلخ)
        """
        if obj is None:
            self.target_content_type = None
            self.target_object_id = None
        else:
            self.target_content_type = ContentType.objects.get_for_model(obj)
            self.target_object_id = obj.pk
        self.save(update_fields=['target_content_type', 'target_object_id'])
    
    @property
    def target_object(self):
        """
        Get the target object instance
        الحصول على كائن الهدف
        
        This is an alias for the GenericForeignKey 'target' field
        for backward compatibility and clearer naming.
        
        هذا اسم بديل لحقل GenericForeignKey 'target'
        للتوافق مع الكود القديم والتسمية الأوضح.
        
        Returns:
            The target object instance or None if not set
            كائن الهدف أو None إذا لم يكن معيناً
        """
        return self.target
    
    def has_target(self):
        """
        Check if notification has a valid target
        التحقق من وجود هدف صالح للإشعار
        
        Returns:
            bool: True if target exists, False otherwise
        """
        return self.target_object is not None


# =============================================================================
# Notification Preferences (Future Enhancement)
# تفضيلات الإشعارات (تحسين مستقبلي)
# =============================================================================

class NotificationPreference(models.Model):
    """
    User notification preferences
    تفضيلات إشعارات المستخدم
    
    Allows admins to customize which notifications they want to receive.
    يسمح للمدراء بتخصيص الإشعارات التي يريدون تلقيها.
    """
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        help_text=_('User these preferences belong to')
    )
    
    # Enable/disable notification types
    # تفعيل/تعطيل أنواع الإشعارات
    enable_order_notifications = models.BooleanField(default=True)
    enable_user_notifications = models.BooleanField(default=True)
    enable_vendor_notifications = models.BooleanField(default=True)
    enable_system_notifications = models.BooleanField(default=True)
    enable_product_notifications = models.BooleanField(default=True)
    enable_category_notifications = models.BooleanField(default=True)
    
    # Email notifications
    # إشعارات البريد الإلكتروني
    email_notifications_enabled = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Notification Preference')
        verbose_name_plural = _('Notification Preferences')
    
    def __str__(self):
        return f"Preferences for {self.user.email}"

