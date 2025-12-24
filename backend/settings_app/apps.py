"""
Settings App Configuration
إعدادات تطبيق الإعدادات

This app manages dynamic site settings that can be changed from admin panel.
هذا التطبيق يدير إعدادات الموقع الديناميكية التي يمكن تغييرها من لوحة الإدارة.
"""

from django.apps import AppConfig


class SettingsAppConfig(AppConfig):
    """
    Settings App Configuration Class
    كلاس إعدادات تطبيق الإعدادات
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'settings_app'
    verbose_name = 'Site Settings'  # الاسم المعروض في لوحة الإدارة
    verbose_name_ar = 'إعدادات الموقع'

