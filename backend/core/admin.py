"""
Custom Admin Site Configuration
إعدادات موقع الإدارة المخصص

This module customizes the Django Admin interface with:
- Custom admin site title and header
- Enhanced admin experience

هذا الوحدة يخصص واجهة Django Admin مع:
- عنوان ورأس موقع الإدارة المخصص
- تجربة إدارة محسّنة
"""

from django.contrib import admin


# ============================================================================
# Admin Site Customization
# تخصيص موقع الإدارة
# ============================================================================

# Customize default admin site
# تخصيص موقع الإدارة الافتراضي
admin.site.site_header = "Trendyol-SY Administration"
admin.site.site_title = "Trendyol-SY Admin"
admin.site.index_title = "Welcome to Trendyol-SY Administration"

