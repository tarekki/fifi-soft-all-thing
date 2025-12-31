"""
Notifications App Configuration
إعدادات تطبيق الإشعارات
"""

from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    verbose_name = 'Notifications'
    verbose_name_plural = 'Notifications'

    def ready(self):
        """
        Connect signals when the app is ready
        """
        import notifications.signals

