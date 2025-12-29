"""
Dashboard Serializers
متسلسلات لوحة التحكم

هذا الملف يحتوي على serializers لبيانات Dashboard.
This file contains serializers for Dashboard data.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Dashboard Overview Serializer
# متسلسل نظرة عامة على لوحة التحكم
# =============================================================================

class DashboardOverviewSerializer(serializers.Serializer):
    """
    Serializer for dashboard overview statistics.
    متسلسل لإحصائيات نظرة عامة على لوحة التحكم.
    
    Contains all KPIs shown on the main dashboard.
    يحتوي على جميع مؤشرات الأداء الرئيسية المعروضة في لوحة التحكم الرئيسية.
    """
    
    # Revenue Statistics - إحصائيات الإيرادات
    total_revenue = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إجمالي الإيرادات / Total revenue')
    )
    total_revenue_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الإيرادات / Revenue change percentage')
    )
    today_revenue = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إيرادات اليوم / Today\'s revenue')
    )
    
    # Order Statistics - إحصائيات الطلبات
    total_orders = serializers.IntegerField(
        help_text=_('إجمالي الطلبات / Total orders')
    )
    total_orders_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الطلبات / Orders change percentage')
    )
    today_orders = serializers.IntegerField(
        help_text=_('طلبات اليوم / Today\'s orders')
    )
    pending_orders = serializers.IntegerField(
        help_text=_('الطلبات المعلقة / Pending orders')
    )
    processing_orders = serializers.IntegerField(
        help_text=_('الطلبات قيد المعالجة / Processing orders')
    )
    
    # Product Statistics - إحصائيات المنتجات
    total_products = serializers.IntegerField(
        help_text=_('إجمالي المنتجات / Total products')
    )
    active_products = serializers.IntegerField(
        help_text=_('المنتجات النشطة / Active products')
    )
    low_stock_products = serializers.IntegerField(
        help_text=_('منتجات بمخزون منخفض / Low stock products')
    )
    out_of_stock_products = serializers.IntegerField(
        help_text=_('منتجات نفذت من المخزون / Out of stock products')
    )
    
    # User Statistics - إحصائيات المستخدمين
    total_users = serializers.IntegerField(
        help_text=_('إجمالي المستخدمين / Total users')
    )
    new_users_today = serializers.IntegerField(
        help_text=_('المستخدمين الجدد اليوم / New users today')
    )
    new_users_week = serializers.IntegerField(
        help_text=_('المستخدمين الجدد هذا الأسبوع / New users this week')
    )
    
    # Vendor Statistics - إحصائيات البائعين
    total_vendors = serializers.IntegerField(
        help_text=_('إجمالي البائعين / Total vendors')
    )
    active_vendors = serializers.IntegerField(
        help_text=_('البائعين النشطين / Active vendors')
    )
    pending_vendors = serializers.IntegerField(
        help_text=_('البائعين المعلقين / Pending vendor applications')
    )


# =============================================================================
# Sales Chart Serializer
# متسلسل رسم بياني المبيعات
# =============================================================================

class SalesChartSerializer(serializers.Serializer):
    """
    Serializer for sales chart data.
    متسلسل لبيانات رسم بياني المبيعات.
    """
    
    labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('تواريخ/أسماء الفترات / Date/period labels')
    )
    revenue = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('بيانات الإيرادات / Revenue data points (as strings for consistent formatting)')
    )
    orders = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('بيانات عدد الطلبات / Order count data points')
    )
    period = serializers.CharField(
        help_text=_('الفترة الزمنية (day, week, month, year) / Time period')
    )


# =============================================================================
# Recent Order Serializer
# متسلسل الطلبات الأخيرة
# =============================================================================

class RecentOrderSerializer(serializers.Serializer):
    """
    Serializer for recent orders in dashboard.
    متسلسل للطلبات الأخيرة في لوحة التحكم.
    
    Lightweight serializer for quick display.
    متسلسل خفيف للعرض السريع.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف الطلب / Order ID')
    )
    order_number = serializers.CharField(
        help_text=_('رقم الطلب / Order number')
    )
    customer_name = serializers.CharField(
        help_text=_('اسم العميل / Customer name')
    )
    customer_email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text=_('بريد العميل / Customer email (null for guest orders)')
    )
    total = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إجمالي الطلب / Order total')
    )
    status = serializers.CharField(
        help_text=_('حالة الطلب / Order status')
    )
    status_display = serializers.CharField(
        help_text=_('حالة الطلب للعرض / Order status display')
    )
    items_count = serializers.IntegerField(
        help_text=_('عدد المنتجات / Number of items')
    )
    created_at = serializers.DateTimeField(
        help_text=_('تاريخ الإنشاء / Created at')
    )


# =============================================================================
# Target Reference Serializer
# متسلسل مرجع الهدف
# =============================================================================

class TargetRefSerializer(serializers.Serializer):
    """
    Serializer for target reference in activities and notifications.
    متسلسل لمرجع الهدف في النشاطات والإشعارات.
    
    Provides structured reference for frontend navigation.
    يوفر مرجعًا منظمًا للتنقل في الواجهة الأمامية.
    """
    
    type = serializers.CharField(
        help_text=_('نوع الهدف / Target type (e.g., "order", "product", "user")')
    )
    id = serializers.IntegerField(
        help_text=_('معرف الهدف / Target ID')
    )
    action = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text=_('نوع العملية / Action type (e.g., "order_created", "product_updated")')
    )


# =============================================================================
# Recent Activity Serializer
# متسلسل النشاطات الأخيرة
# =============================================================================

class RecentActivitySerializer(serializers.Serializer):
    """
    Serializer for recent activity log entries.
    متسلسل لسجل النشاطات الأخيرة.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف النشاط / Activity ID')
    )
    user_name = serializers.CharField(
        help_text=_('اسم المستخدم / User name')
    )
    user_email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text=_('بريد المستخدم / User email (null for guest/system activities)')
    )
    action = serializers.CharField(
        help_text=_('نوع العملية / Action type')
    )
    action_display = serializers.CharField(
        help_text=_('وصف العملية / Action description')
    )
    target_type = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text=_('نوع الهدف / Target type (order, product, user, etc.)')
    )
    target_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text=_('معرف الهدف / Target ID')
    )
    target_name = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text=_('اسم الهدف / Target name')
    )
    timestamp = serializers.DateTimeField(
        help_text=_('وقت النشاط / Activity timestamp')
    )
    ip_address = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
        help_text=_('عنوان IP / IP address')
    )
    target_ref = TargetRefSerializer(
        required=False,
        allow_null=True,
        help_text=_('Reference for frontend navigation / مرجع للتنقل في الواجهة الأمامية')
    )

