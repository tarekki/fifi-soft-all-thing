"""
Notifications Admin
إدارة الإشعارات في لوحة Django Admin
"""

from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for Notification model
    واجهة الإدارة لنموذج الإشعار
    
    Features:
    - Optimized queryset with select_related for performance
    - Custom target_summary display method
    - Read-only target fields (notifications are typically created by the system)
    
    الميزات:
    - استعلام محسّن مع select_related للأداء
    - method مخصص لعرض ملخص الهدف
    - حقول الهدف للقراءة فقط (الإشعارات عادة تُنشأ من النظام)
    """
    
    list_display = ['id', 'type', 'message', 'recipient', 'target_summary', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'target_content_type', 'created_at']
    search_fields = ['message', 'message_ar', 'action', 'metadata']
    readonly_fields = ['created_at', 'read_at', 'target_content_type', 'target_object_id', 'target_summary']
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related to avoid N+1 queries
        تحسين الاستعلام مع select_related لتجنب N+1 queries
        
        This is essential for performance when displaying notifications list,
        especially when accessing recipient and target_content_type.
        
        هذا ضروري للأداء عند عرض قائمة الإشعارات،
        خاصة عند الوصول إلى recipient و target_content_type.
        """
        qs = super().get_queryset(request)
        return qs.select_related('recipient', 'target_content_type')
    
    @admin.display(description='Target', ordering='target_content_type')
    def target_summary(self, obj):
        """
        Display target object summary in admin list
        عرض ملخص الكائن المستهدف في قائمة الإدارة
        
        Shows: model_name #id — label (if available)
        Example: "order #123 — ORD-000123"
        
        Note: Accessing obj.target may trigger an additional query
        depending on the target object's relationships.
        
        ملاحظة: الوصول إلى obj.target قد يسبب query إضافي
        حسب علاقات الكائن المستهدف.
        """
        if not obj.target_content_type or not obj.target_object_id:
            return '-'
        
        model = obj.target_content_type.model
        base = f"{model} #{obj.target_object_id}"
        
        # Try to get human-readable label (may trigger additional query)
        # محاولة الحصول على تسمية قابلة للقراءة (قد يسبب query إضافي)
        try:
            if obj.target:
                label = str(obj.target)
                # Avoid default Python object representation (e.g., "Order object at 0x...")
                # Only reject truly unhelpful representations, allow Django's <Model: something> format
                # تجنب تمثيل كائن Python الافتراضي (مثلاً "Order object at 0x...")
                # رفض التمثيلات غير المفيدة فقط، السماح بصيغة Django <Model: something>
                label_lower = label.lower()
                if 'object at 0x' not in label_lower:
                    return f"{base} — {label}"
        except Exception:
            # Target object might have been deleted or inaccessible
            # الكائن المستهدف قد يكون محذوفاً أو غير قابل للوصول
            pass
        
        return base
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('recipient', 'type', 'message', 'message_ar')
        }),
        ('Target Information', {
            'fields': ('target_content_type', 'target_object_id', 'target_summary', 'action'),
            'description': 'Target object information. These fields are read-only as notifications are typically created by the system.'
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_notifications_enabled', 'updated_at']
    list_filter = ['email_notifications_enabled']
    search_fields = ['user__email', 'user__full_name']

