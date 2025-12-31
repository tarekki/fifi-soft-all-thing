"""
Notifications Signals - Triggers for system events
إشارات الإشعارات - محفزات أحداث النظام

This module contains signal receivers that create notifications when specific events occur.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db.models import Q

from vendors.models import VendorApplication
from orders.models import Order
from .models import Notification

User = get_user_model()

@receiver(post_save, sender=VendorApplication)
def notify_new_vendor_application(sender, instance, created, **kwargs):
    """
    Create a notification when a new vendor application is submitted
    إنشاء إشعار عند تقديم طلب انضمام بائع جديد
    """
    if created:
        # Message in both languages
        message_en = f"New vendor application from '{instance.store_name}'"
        message_ar = f"طلب انضمام بائع جديد من '{instance.store_name}'"
        
        # Target: Admins and Support Staff
        # If recipient is None, it appears for all authorized users in some systems,
        # but here we follow the recipient logic or create for specific roles.
        
        # We can either create one notification without a recipient (for all admins)
        # or create specific ones. The model supports recipient=None for "all admins".
        
        Notification.objects.create(
            type=Notification.NotificationType.VENDOR,
            message=message_en,
            message_ar=message_ar,
            action='vendor_application_created',
            target_content_type_id=None, # Will set below
            target_object_id=instance.pk,
            metadata={
                'store_name': instance.store_name,
                'applicant_name': instance.applicant_name
            }
        ).set_target(instance)

@receiver(post_save, sender=Order)
def notify_new_order(sender, instance, created, **kwargs):
    """
    Create a notification when a new order is placed
    إنشاء إشعار عند تقديم طلب جديد
    """
    if created:
        message_en = f"New order received: #{instance.order_number}"
        message_ar = f"تم استلام طلب جديد: #{instance.order_number}"
        
        Notification.objects.create(
            type=Notification.NotificationType.ORDER,
            message=message_en,
            message_ar=message_ar,
            action='order_created',
            target_object_id=instance.pk,
            metadata={
                'order_number': instance.order_number,
                'total_amount': str(instance.total_amount),
                'customer_name': instance.user.full_name if instance.user else "Guest"
            }
        ).set_target(instance)
