"""
Notifications Admin
إدارة الإشعارات في لوحة Django Admin
"""

from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'message', 'recipient', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'target_type', 'created_at']
    search_fields = ['message', 'message_ar', 'action']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('recipient', 'type', 'message', 'message_ar')
        }),
        ('Target Information', {
            'fields': ('target_type', 'target_id', 'action')
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

