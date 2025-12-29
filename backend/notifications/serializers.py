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
    
    Provides backward compatibility by exposing target_id and target_type
    derived from GenericForeignKey fields (target_content_type, target_object_id).
    يوفر التوافق مع الكود القديم من خلال عرض target_id و target_type
    المستمدة من حقول GenericForeignKey.
    
    ⚠️ Performance Note / ملاحظة الأداء:
    Make sure views using this serializer apply:
    .select_related('target_content_type', 'recipient')
    
    تأكد من أن الـ views التي تستخدم هذا الـ serializer تطبق:
    .select_related('target_content_type', 'recipient')
    
    This prevents N+1 queries when accessing target_content_type.model
    in get_target_type() and get_target_model_label() methods.
    
    هذا يمنع N+1 queries عند الوصول إلى target_content_type.model
    في methods get_target_type() و get_target_model_label().
    
    Note: Accessing obj.target (in get_target_label()) may still trigger
    separate queries depending on the target object's relationships.
    
    ملاحظة: الوصول إلى obj.target (في get_target_label()) قد يسبب
    queries منفصلة حسب علاقات الكائن المستهدف.
    """
    
    # Target fields (derived from GenericForeignKey for backward compatibility)
    # حقول الهدف (مستمدة من GenericForeignKey للتوافق مع الكود القديم)
    target_id = serializers.IntegerField(
        source='target_object_id',
        read_only=True,
        allow_null=True,
        help_text=_('ID of the target object')
    )
    target_type = serializers.SerializerMethodField(
        help_text=_('Type/model name of the target object (e.g., "order", "product")')
    )
    target_model_label = serializers.SerializerMethodField(
        help_text=_('Human-readable model name (e.g., "Order", "Product") from verbose_name')
    )
    target_label = serializers.SerializerMethodField(
        help_text=_('Human-readable label for the target object (e.g., order number, product name)')
    )
    target_ref = serializers.SerializerMethodField(
        help_text=_('Reference information for frontend navigation (type, id, action)')
    )
    
    # Custom field: formatted time
    # حقل مخصص: الوقت المنسق
    time = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    
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
            'target_model_label',
            'target_label',
            'target_ref',
            'action',
            'metadata',
        ]
        read_only_fields = [
            'id',
            'timestamp',
            'time',
            'target_id',
            'target_type',
            'target_model_label',
            'target_label',
            'target_ref',
            'is_read',
        ]
    
    def get_time(self, obj):
        """
        Format time as relative string
        تنسيق الوقت كسلسلة نسبية
        """
        # This will be formatted on the frontend
        # سيتم تنسيقه في الواجهة الأمامية
        return obj.created_at.isoformat()
    
    def get_target_type(self, obj):
        """
        Get target object type/model name
        الحصول على نوع/اسم نموذج الكائن المستهدف
        
        Returns:
            str: Model name (e.g., 'order', 'product', 'user') or None
        """
        return obj.target_content_type.model if obj.target_content_type else None
    
    def get_target_model_label(self, obj):
        """
        Get human-readable model name from verbose_name
        الحصول على اسم نموذج قابل للقراءة من verbose_name
        
        Returns a cleaner, localized model name (e.g., "Order" instead of "order").
        Useful for frontend display where you want proper capitalization.
        
        يرجع اسم نموذج أنظف ومحلي (مثلاً "Order" بدلاً من "order").
        مفيد لعرض الواجهة الأمامية حيث تريد الحروف الكبيرة المناسبة.
        
        Returns:
            str: Verbose model name (e.g., 'Order', 'Product', 'User') or None
        """
        if obj.target_content_type:
            try:
                model_class = obj.target_content_type.model_class()
                if model_class:
                    # Convert to string to handle LazyText (translation strings)
                    # التحويل إلى string للتعامل مع LazyText (سلاسل الترجمة)
                    return str(model_class._meta.verbose_name)
            except Exception:
                # Fallback to model name if verbose_name is not available
                # العودة إلى اسم النموذج إذا كان verbose_name غير متاح
                return obj.target_content_type.model
        return None
    
    def get_target_label(self, obj):
        """
        Get human-readable label for target object
        الحصول على تسمية قابلة للقراءة للكائن المستهدف
        
        Tries multiple strategies to extract a meaningful label:
        - Uses __str__ if it's well-defined
        - Falls back to specific attributes (order_number, name, email, etc.)
        - Returns type#id as last resort
        
        يحاول استراتيجيات متعددة لاستخراج تسمية مفيدة:
        - يستخدم __str__ إذا كان معرّف بشكل جيد
        - يعود إلى خصائص محددة (order_number, name, email, إلخ)
        - يرجع type#id كحل أخير
        """
        t = obj.target
        if not t:
            return None
        
        # Try using __str__ first (if well-defined)
        # محاولة استخدام __str__ أولاً (إذا كان معرّف بشكل جيد)
        try:
            label = str(t)
            low = label.lower()
            # Exclude default object representation
            # استبعاد تمثيل الكائن الافتراضي
            if (' object at 0x' not in low) and ('<' not in label) and ('>' not in label):
                return label
        except Exception:
            pass
        
        # Try specific attributes (in priority order)
        # محاولة الخصائص المحددة (بترتيب الأولوية)
        # Micro-optimization: use loop instead of multiple hasattr/getattr calls
        # تحسين دقيق: استخدام loop بدلاً من عدة استدعاءات hasattr/getattr
        for attr in ('order_number', 'name', 'email', 'full_name', 'name_ar'):
            val = getattr(t, attr, None)
            if val:
                return str(val)
        
        # Fallback: type + ID
        # الحل الأخير: نوع + معرف
        if obj.target_content_type and obj.target_object_id:
            return f"{obj.target_content_type.model} #{obj.target_object_id}"
        
        return None
    
    def get_target_ref(self, obj):
        """
        Get reference information for frontend navigation
        الحصول على معلومات المرجع للتنقل في الواجهة الأمامية
        
        Returns a lightweight reference that helps frontend decide where to navigate.
        Does not return a static URL, just type + id + action.
        
        يرجع مرجع خفيف يساعد الواجهة الأمامية على تحديد أين تذهب.
        لا يرجع URL ثابت، فقط type + id + action.
        
        Returns:
            dict: {'type': str, 'id': int, 'action': str} or None
        """
        if not obj.target_content_type or not obj.target_object_id:
            return None
        
        return {
            'type': obj.target_content_type.model,
            'id': obj.target_object_id,
            'action': obj.action or None,
        }


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

