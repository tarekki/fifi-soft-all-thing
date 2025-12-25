"""
Admin API Throttling
تحديد معدل طلبات API الإدارة

هذا الملف يحتوي على throttle classes مخصصة للـ Admin API.
This file contains custom throttle classes for the Admin API.
"""

from rest_framework.throttling import UserRateThrottle
from django.conf import settings


class AdminUserRateThrottle(UserRateThrottle):
    """
    Custom throttle for admin API endpoints.
    تحديد معدل مخصص لنقاط نهاية API الإدارة.
    
    Uses higher rate limits for admin users to allow for dashboard operations.
    يستخدم حدود معدل أعلى لمستخدمي الأدمن للسماح بعمليات لوحة التحكم.
    
    In development: 50000 requests/hour
    في التطوير: 50000 طلب في الساعة
    
    In production: 5000 requests/hour
    في الإنتاج: 5000 طلب في الساعة
    """
    
    scope = 'admin'
    
    def get_rate(self):
        """
        Get throttle rate based on DEBUG setting.
        الحصول على معدل التحديد بناءً على إعداد DEBUG.
        """
        if settings.DEBUG:
            return '50000/hour'  # Higher limit in development
        return '5000/hour'  # Stricter limit in production

