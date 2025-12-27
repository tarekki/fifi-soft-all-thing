"""
Notifications Serializers
متسلسلات الإشعارات

This file contains serializers for notification data.
هذا الملف يحتوي على متسلسلات لبيانات الإشعارات.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Notification, NotificationPreference


# =============================================================================
# Notification Serializer
# متسلسل الإشعار
# =============================================================================

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    متسلسل لنموذج الإشعار
    """
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'message',
            'message_ar',
            'time',
            'timestamp',
            'is_read',
            'target_id',
            'target_type',
            'action',
            'metadata',
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    # Custom field: formatted time
    # حقل مخصص: الوقت المنسق
    time = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    
    def get_time(self, obj):
        """Format time as relative string"""
        # This will be formatted on the frontend
        # سيتم تنسيقه في الواجهة الأمامية
        return obj.created_at.isoformat()


# =============================================================================
# Notification Response Serializer
# متسلسل استجابة الإشعارات
# =============================================================================

class NotificationResponseSerializer(serializers.Serializer):
    """
    Serializer for notification list response
    متسلسل لاستجابة قائمة الإشعارات
    """
    
    notifications = NotificationSerializer(many=True)
    unread_count = serializers.IntegerField()
    total_count = serializers.IntegerField()


# =============================================================================
# Notification Stats Serializer
# متسلسل إحصائيات الإشعارات
# =============================================================================

class NotificationStatsSerializer(serializers.Serializer):
    """
    Serializer for notification statistics
    متسلسل لإحصائيات الإشعارات
    """
    
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    by_type = serializers.DictField(
        child=serializers.IntegerField(),
        help_text=_('Count of notifications by type')
    )


# =============================================================================
# Mark as Read Payload Serializer
# متسلسل payload تحديد كمقروء
# =============================================================================

class MarkAsReadPayloadSerializer(serializers.Serializer):
    """
    Serializer for mark as read payload
    متسلسل لـ payload تحديد كمقروء
    """
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('List of notification IDs to mark as read')
    )

