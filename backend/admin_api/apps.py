"""
Admin API Application Configuration
إعدادات تطبيق API الإدارة
"""

from django.apps import AppConfig


class AdminApiConfig(AppConfig):
    """
    Configuration class for Admin API application.
    كلاس إعدادات تطبيق API الإدارة.
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_api'
    verbose_name = 'Admin API'
    verbose_name_ar = 'API الإدارة'
    
    def ready(self):
        """
        Called when the application is ready.
        يُستدعى عندما يكون التطبيق جاهزاً.
        
        Used to import signals and perform initialization.
        يُستخدم لاستيراد الإشارات وإجراء التهيئة.
        """
        # Import signals if needed
        # استيراد الإشارات إذا لزم الأمر
        pass

