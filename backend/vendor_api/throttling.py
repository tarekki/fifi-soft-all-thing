"""
Vendor API Throttling
تحديد معدل طلبات API البائعين

هذا الملف يحتوي على throttle classes مخصصة للـ Vendor API.
This file contains custom throttle classes for the Vendor API.
"""

from rest_framework.throttling import UserRateThrottle
from django.conf import settings


class VendorUserRateThrottle(UserRateThrottle):
    """
    Custom throttle for vendor API endpoints.
    تحديد معدل مخصص لنقاط نهاية API البائعين.
    
    Uses appropriate rate limits for vendor users to allow for dashboard operations.
    يستخدم حدود معدل مناسبة لمستخدمي البائعين للسماح بعمليات لوحة التحكم.
    
    In development: 10000 requests/hour
    في التطوير: 10000 طلب في الساعة
    
    In production: 2000 requests/hour
    في الإنتاج: 2000 طلب في الساعة
    """
    
    scope = 'vendor'
    
    def get_rate(self):
        """
        Get throttle rate based on DEBUG setting.
        الحصول على معدل التحديد بناءً على إعداد DEBUG.
        """
        if settings.DEBUG:
            return '10000/hour'  # Higher limit in development
        return '2000/hour'  # Stricter limit in production

