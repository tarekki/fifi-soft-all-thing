"""
Vendor API Application Configuration
إعدادات تطبيق API البائعين
"""

from django.apps import AppConfig


class VendorApiConfig(AppConfig):
    """
    Configuration class for Vendor API application.
    كلاس إعدادات تطبيق API البائعين.
    """
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'vendor_api'
    verbose_name = 'Vendor API'
    verbose_name_ar = 'API البائعين'
    
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

