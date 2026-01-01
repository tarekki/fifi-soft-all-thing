"""
Vendor Dashboard Serializers
متسلسلات لوحة تحكم البائع

هذا الملف يحتوي على serializers لبيانات Vendor Dashboard.
This file contains serializers for Vendor Dashboard data.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Vendor Dashboard Overview Serializer
# متسلسل نظرة عامة على لوحة تحكم البائع
# =============================================================================

class VendorDashboardOverviewSerializer(serializers.Serializer):
    """
    Serializer for vendor dashboard overview statistics.
    متسلسل لإحصائيات نظرة عامة على لوحة تحكم البائع.
    
    Contains all KPIs shown on the vendor dashboard.
    يحتوي على جميع مؤشرات الأداء الرئيسية المعروضة في لوحة تحكم البائع.
    """
    
    # Revenue Statistics - إحصائيات الإيرادات
    total_sales = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إجمالي المبيعات / Total sales')
    )
    total_sales_change = serializers.FloatField(
        help_text=_('نسبة التغيير في المبيعات / Sales change percentage')
    )
    today_sales = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('مبيعات اليوم / Today\'s sales')
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
    
    # Shop Visits Statistics - إحصائيات زيارات المتجر
    total_visits = serializers.IntegerField(
        help_text=_('إجمالي زيارات المتجر / Total shop visits')
    )
    total_visits_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الزيارات / Visits change percentage')
    )
    today_visits = serializers.IntegerField(
        help_text=_('زيارات اليوم / Today\'s visits')
    )
    
    # Response Rate Statistics - إحصائيات معدل الاستجابة
    response_rate = serializers.FloatField(
        allow_null=True,
        required=False,
        help_text=_('معدل الاستجابة (نسبة الطلبات المكتملة) / Response rate (completed orders percentage). Null if no orders available.')
    )


# =============================================================================
# Vendor Recent Order Serializer
# متسلسل الطلبات الأخيرة للبائع
# =============================================================================

class VendorRecentOrderSerializer(serializers.Serializer):
    """
    Serializer for recent orders in vendor dashboard.
    متسلسل للطلبات الأخيرة في لوحة تحكم البائع.
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
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('إجمالي الطلب / Order total')
    )
    status = serializers.CharField(
        help_text=_('حالة الطلب / Order status')
    )
    status_display = serializers.CharField(
        help_text=_('عرض حالة الطلب / Order status display')
    )
    created_at = serializers.DateTimeField(
        help_text=_('تاريخ الإنشاء / Created at')
    )


# =============================================================================
# Vendor Sales Chart Serializer
# متسلسل رسم بياني مبيعات البائع
# =============================================================================

class VendorSalesChartSerializer(serializers.Serializer):
    """
    Serializer for vendor sales chart data.
    متسلسل لبيانات رسم بياني مبيعات البائع.
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
        help_text=_('الفترة الزمنية (week, month, year) / Time period')
    )


# =============================================================================
# Vendor Dashboard Tip Serializer
# متسلسل نصيحة لوحة تحكم البائع
# =============================================================================

class VendorDashboardTipSerializer(serializers.Serializer):
    """
    Serializer for vendor dashboard tip.
    متسلسل لنصيحة لوحة تحكم البائع.
    """
    
    type = serializers.CharField(
        help_text=_('نوع النصيحة (out_of_stock, low_stock, inactive, general) / Tip type')
    )
    priority = serializers.IntegerField(
        help_text=_('أولوية النصيحة (1 = أعلى) / Tip priority (1 = highest)')
    )
    title_ar = serializers.CharField(
        help_text=_('عنوان النصيحة بالعربية / Tip title in Arabic')
    )
    title_en = serializers.CharField(
        help_text=_('عنوان النصيحة بالإنجليزية / Tip title in English')
    )
    message_ar = serializers.CharField(
        help_text=_('رسالة النصيحة بالعربية / Tip message in Arabic')
    )
    message_en = serializers.CharField(
        help_text=_('رسالة النصيحة بالإنجليزية / Tip message in English')
    )
    action_text_ar = serializers.CharField(
        help_text=_('نص الزر بالعربية / Button text in Arabic')
    )
    action_text_en = serializers.CharField(
        help_text=_('نص الزر بالإنجليزية / Button text in English')
    )
    action_url = serializers.CharField(
        help_text=_('رابط الإجراء / Action URL')
    )
    product_id = serializers.IntegerField(
        allow_null=True,
        help_text=_('معرف المنتج (إن وجد) / Product ID (if applicable)')
    )
    product_name = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        help_text=_('اسم المنتج (إن وجد) / Product name (if applicable)')
    )