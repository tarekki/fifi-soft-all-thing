"""
Vendor Serializers
مسلسلات البائعين

This module contains serializers for the Vendor model.
هذا الملف يحتوي على مسلسلات لنموذج Vendor
"""

from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    """
    Vendor Serializer
    مسلسل البائع
    
    Serializes Vendor model data for API responses.
    يسلسل بيانات نموذج Vendor لاستجابات الـ API
    
    Fields:
    - id: Vendor unique identifier
    - name: Vendor name (e.g., "Fifi", "Soft")
    - slug: URL-friendly identifier
    - logo: Vendor logo image URL
    - primary_color: Brand primary color (hex code)
    - description: Vendor description
    - commission_rate: Platform commission percentage
    - is_active: Whether vendor is active
    - created_at: Creation timestamp
    - updated_at: Last update timestamp
    """
    
    # Logo URL field - returns full URL instead of just path
    # حقل URL الشعار - يعيد الرابط الكامل بدلاً من المسار فقط
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id',                    # معرف البائع الفريد
            'name',                  # اسم البائع
            'slug',                  # المعرف المستخدم في URLs
            'logo_url',              # رابط الشعار الكامل
            'primary_color',         # اللون الأساسي للعلامة التجارية
            'description',           # وصف البائع
            'commission_rate',       # نسبة العمولة
            'is_active',             # حالة البائع (نشط/غير نشط)
            'created_at',            # تاريخ الإنشاء
            'updated_at',            # تاريخ آخر تحديث
        ]
        read_only_fields = [
            'id',                    # لا يمكن تعديله
            'slug',                  # يُولد تلقائياً
            'created_at',            # يُضاف تلقائياً
            'updated_at',            # يُحدث تلقائياً
        ]
    
    def get_logo_url(self, obj):
        """
        Get full logo URL
        الحصول على رابط الشعار الكامل
        
        Args:
            obj: Vendor instance
            
        Returns:
            str: Full URL to logo image, or None if no logo
        """
        if obj.logo and hasattr(obj.logo, 'url'):
            # Build full URL from request
            # بناء الرابط الكامل من الطلب
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

