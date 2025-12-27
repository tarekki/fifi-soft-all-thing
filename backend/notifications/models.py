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
    target_type = models.CharField(
        max_length=20,
        choices=TargetType.choices,
        null=True,
        blank=True,
        help_text=_('Type of object this notification is about')
    )
    
    target_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=_('ID of the object this notification is about')
    )
    
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
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.message[:50]}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


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

