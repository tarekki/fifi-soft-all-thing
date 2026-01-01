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

