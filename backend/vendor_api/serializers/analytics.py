"""
Vendor Analytics Serializers
متسلسلات تحليلات البائع

This file contains serializers for Vendor Analytics data.
هذا الملف يحتوي على serializers لبيانات تحليلات البائع.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Analytics Overview Serializer
# متسلسل نظرة عامة على التحليلات
# =============================================================================

class VendorAnalyticsOverviewSerializer(serializers.Serializer):
    """
    Serializer for vendor analytics overview.
    متسلسل لنظرة عامة على تحليلات البائع.
    """
    
    # Revenue Metrics
    total_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_('إجمالي الإيرادات / Total revenue')
    )
    average_order_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('متوسط قيمة الطلب / Average Order Value (AOV)')
    )
    revenue_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الإيرادات / Revenue change percentage')
    )
    
    # Order Metrics
    total_orders = serializers.IntegerField(
        help_text=_('إجمالي الطلبات / Total orders')
    )
    orders_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الطلبات / Orders change percentage')
    )
    conversion_rate = serializers.FloatField(
        allow_null=True,
        help_text=_('معدل التحويل / Conversion rate')
    )
    
    # Customer Metrics
    total_customers = serializers.IntegerField(
        help_text=_('إجمالي الزبائن / Total customers')
    )
    new_customers = serializers.IntegerField(
        help_text=_('زبائن جدد / New customers')
    )
    repeat_customer_rate = serializers.FloatField(
        allow_null=True,
        help_text=_('معدل تكرار الشراء / Repeat customer rate')
    )
    customer_lifetime_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        help_text=_('قيمة العميل مدى الحياة / Customer Lifetime Value (CLV)')
    )
    
    # Product Metrics
    total_products = serializers.IntegerField(
        help_text=_('إجمالي المنتجات / Total products')
    )
    active_products = serializers.IntegerField(
        help_text=_('المنتجات النشطة / Active products')
    )
    top_product_revenue = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        help_text=_('إيرادات أفضل منتج / Top product revenue')
    )


# =============================================================================
# Sales Analytics Serializer
# متسلسل تحليلات المبيعات
# =============================================================================

class VendorSalesAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for sales analytics data.
    متسلسل لبيانات تحليلات المبيعات.
    """
    
    # Chart Data
    labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('تواريخ/أسماء الفترات / Date/period labels')
    )
    revenue = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('بيانات الإيرادات / Revenue data')
    )
    orders = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('بيانات عدد الطلبات / Orders count data')
    )
    average_order_value = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('متوسط قيمة الطلب لكل فترة / Average Order Value per period')
    )
    
    # Summary Statistics
    total_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_('إجمالي الإيرادات / Total revenue')
    )
    total_orders = serializers.IntegerField(
        help_text=_('إجمالي الطلبات / Total orders')
    )
    average_order_value_overall = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('متوسط قيمة الطلب الإجمالي / Overall Average Order Value')
    )
    
    # Revenue by Status
    revenue_by_status = serializers.DictField(
        help_text=_('الإيرادات حسب الحالة / Revenue by order status')
    )
    
    period = serializers.CharField(
        help_text=_('الفترة الزمنية / Time period')
    )


# =============================================================================
# Product Analytics Serializer
# متسلسل تحليلات المنتجات
# =============================================================================

class VendorProductAnalyticsItemSerializer(serializers.Serializer):
    """
    Serializer for individual product analytics item.
    متسلسل لعنصر تحليلات منتج واحد.
    """
    
    product_id = serializers.IntegerField(
        help_text=_('معرف المنتج / Product ID')
    )
    product_name = serializers.CharField(
        help_text=_('اسم المنتج / Product name')
    )
    product_image = serializers.URLField(
        allow_null=True,
        help_text=_('صورة المنتج / Product image URL')
    )
    revenue = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('الإيرادات / Revenue')
    )
    units_sold = serializers.IntegerField(
        help_text=_('الوحدات المباعة / Units sold')
    )
    orders_count = serializers.IntegerField(
        help_text=_('عدد الطلبات / Orders count')
    )
    average_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('متوسط السعر / Average price')
    )


class VendorProductAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for product analytics data.
    متسلسل لبيانات تحليلات المنتجات.
    """
    
    top_products = VendorProductAnalyticsItemSerializer(
        many=True,
        help_text=_('أفضل المنتجات / Top products')
    )
    worst_products = VendorProductAnalyticsItemSerializer(
        many=True,
        help_text=_('أسوأ المنتجات أداءً / Worst performing products')
    )
    
    # Category Breakdown
    revenue_by_category = serializers.DictField(
        help_text=_('الإيرادات حسب الفئة / Revenue by category')
    )
    
    # Stock Alerts
    low_stock_count = serializers.IntegerField(
        help_text=_('عدد المنتجات بمخزون منخفض / Low stock products count')
    )
    out_of_stock_count = serializers.IntegerField(
        help_text=_('عدد المنتجات نفذت من المخزون / Out of stock products count')
    )


# =============================================================================
# Customer Analytics Serializer
# متسلسل تحليلات الزبائن
# =============================================================================

class VendorCustomerAnalyticsItemSerializer(serializers.Serializer):
    """
    Serializer for individual customer analytics item.
    متسلسل لعنصر تحليلات زبون واحد.
    """
    
    customer_key = serializers.CharField(
        help_text=_('مفتاح العميل / Customer key')
    )
    customer_name = serializers.CharField(
        help_text=_('اسم العميل / Customer name')
    )
    total_spent = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('إجمالي الإنفاق / Total spent')
    )
    orders_count = serializers.IntegerField(
        help_text=_('عدد الطلبات / Orders count')
    )
    average_order_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('متوسط قيمة الطلب / Average order value')
    )
    last_order_at = serializers.DateTimeField(
        allow_null=True,
        help_text=_('تاريخ آخر طلب / Last order date')
    )


class VendorCustomerAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for customer analytics data.
    متسلسل لبيانات تحليلات الزبائن.
    """
    
    # Growth Chart
    customer_growth_labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('تواريخ نمو الزبائن / Customer growth date labels')
    )
    customer_growth_data = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('بيانات نمو الزبائن / Customer growth data')
    )
    
    # Top Customers
    top_customers = VendorCustomerAnalyticsItemSerializer(
        many=True,
        help_text=_('أفضل الزبائن / Top customers')
    )
    
    # Statistics
    total_customers = serializers.IntegerField(
        help_text=_('إجمالي الزبائن / Total customers')
    )
    new_customers = serializers.IntegerField(
        help_text=_('زبائن جدد / New customers')
    )
    returning_customers = serializers.IntegerField(
        help_text=_('زبائن متكررون / Returning customers')
    )
    repeat_purchase_rate = serializers.FloatField(
        allow_null=True,
        help_text=_('معدل تكرار الشراء / Repeat purchase rate')
    )
    average_customer_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
        help_text=_('متوسط قيمة العميل / Average customer value')
    )


# =============================================================================
# Time Analysis Serializer
# متسلسل التحليل الزمني
# =============================================================================

class VendorTimeAnalysisSerializer(serializers.Serializer):
    """
    Serializer for time-based analysis data.
    متسلسل لبيانات التحليل الزمني.
    """
    
    # Hourly Sales
    hourly_labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('الساعات (0-23) / Hour labels')
    )
    hourly_revenue = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('الإيرادات حسب الساعة / Revenue by hour')
    )
    hourly_orders = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('عدد الطلبات حسب الساعة / Orders by hour')
    )
    best_selling_hour = serializers.IntegerField(
        allow_null=True,
        help_text=_('أفضل ساعة بيع (0-23) / Best selling hour')
    )
    
    # Day of Week Analysis
    day_of_week_labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('أيام الأسبوع / Day of week labels')
    )
    day_of_week_revenue = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('الإيرادات حسب يوم الأسبوع / Revenue by day of week')
    )
    day_of_week_orders = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('عدد الطلبات حسب يوم الأسبوع / Orders by day of week')
    )
    best_selling_day = serializers.CharField(
        allow_null=True,
        help_text=_('أفضل يوم بيع / Best selling day')
    )
    
    # Seasonal Trends (Monthly)
    monthly_labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('الشهور / Month labels')
    )
    monthly_revenue = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('الإيرادات الشهرية / Monthly revenue')
    )
    monthly_orders = serializers.ListField(
        child=serializers.IntegerField(),
        help_text=_('عدد الطلبات الشهرية / Monthly orders')
    )


# =============================================================================
# Comparison Analytics Serializer
# متسلسل تحليلات المقارنة
# =============================================================================

class VendorComparisonAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for period comparison analytics.
    متسلسل لتحليلات مقارنة الفترات.
    """
    
    # Current Period
    current_period_label = serializers.CharField(
        help_text=_('تسمية الفترة الحالية / Current period label')
    )
    current_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_('إيرادات الفترة الحالية / Current period revenue')
    )
    current_orders = serializers.IntegerField(
        help_text=_('طلبات الفترة الحالية / Current period orders')
    )
    current_customers = serializers.IntegerField(
        help_text=_('زبائن الفترة الحالية / Current period customers')
    )
    
    # Previous Period
    previous_period_label = serializers.CharField(
        help_text=_('تسمية الفترة السابقة / Previous period label')
    )
    previous_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_('إيرادات الفترة السابقة / Previous period revenue')
    )
    previous_orders = serializers.IntegerField(
        help_text=_('طلبات الفترة السابقة / Previous period orders')
    )
    previous_customers = serializers.IntegerField(
        help_text=_('زبائن الفترة السابقة / Previous period customers')
    )
    
    # Changes
    revenue_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الإيرادات / Revenue change percentage')
    )
    orders_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الطلبات / Orders change percentage')
    )
    customers_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الزبائن / Customers change percentage')
    )
    
    # Chart Data for Comparison
    comparison_labels = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('تواريخ المقارنة / Comparison date labels')
    )
    current_period_data = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('بيانات الفترة الحالية / Current period data')
    )
    previous_period_data = serializers.ListField(
        child=serializers.CharField(),
        help_text=_('بيانات الفترة السابقة / Previous period data')
    )

