"""
Reports Serializers
متسلسلات التقارير

هذا الملف يحتوي على serializers لبيانات التقارير.
This file contains serializers for Reports data.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Sales Report Serializer
# متسلسل تقرير المبيعات
# =============================================================================

class DailySalesSerializer(serializers.Serializer):
    """Daily sales data"""
    day = serializers.CharField(help_text=_('اليوم / Day name'))
    sales = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('المبيعات / Sales amount')
    )


class SalesReportSerializer(serializers.Serializer):
    """
    Serializer for sales report.
    متسلسل لتقرير المبيعات.
    """
    
    # Summary Statistics
    total_revenue = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إجمالي الإيرادات / Total revenue')
    )
    total_orders = serializers.IntegerField(
        help_text=_('إجمالي الطلبات / Total orders')
    )
    avg_order_value = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('متوسط قيمة الطلب / Average order value')
    )
    new_users = serializers.IntegerField(
        help_text=_('المستخدمين الجدد / New users')
    )
    
    # Changes from previous period
    revenue_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الإيرادات / Revenue change percentage')
    )
    orders_change = serializers.FloatField(
        help_text=_('نسبة التغيير في الطلبات / Orders change percentage')
    )
    avg_order_value_change = serializers.FloatField(
        help_text=_('نسبة التغيير في متوسط قيمة الطلب / AOV change percentage')
    )
    new_users_change = serializers.FloatField(
        help_text=_('نسبة التغيير في المستخدمين الجدد / New users change percentage')
    )
    
    # Daily sales data
    daily_sales = DailySalesSerializer(
        many=True,
        help_text=_('المبيعات اليومية / Daily sales')
    )
    
    # Date range
    date_from = serializers.DateField(
        help_text=_('تاريخ البداية / Start date')
    )
    date_to = serializers.DateField(
        help_text=_('تاريخ النهاية / End date')
    )


# =============================================================================
# Products Report Serializer
# متسلسل تقرير المنتجات
# =============================================================================

class TopProductSerializer(serializers.Serializer):
    """Top selling product data"""
    name = serializers.CharField(help_text=_('اسم المنتج / Product name'))
    sales = serializers.IntegerField(help_text=_('عدد المبيعات / Sales count'))
    revenue = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('الإيرادات / Revenue')
    )


class CategorySalesSerializer(serializers.Serializer):
    """Sales by category data"""
    category = serializers.CharField(help_text=_('اسم الفئة / Category name'))
    sales = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('المبيعات / Sales amount')
    )
    percentage = serializers.FloatField(
        help_text=_('النسبة المئوية / Percentage')
    )


class ProductsReportSerializer(serializers.Serializer):
    """
    Serializer for products report.
    متسلسل لتقرير المنتجات.
    """
    
    top_products = TopProductSerializer(
        many=True,
        help_text=_('المنتجات الأكثر مبيعاً / Top selling products')
    )
    sales_by_category = CategorySalesSerializer(
        many=True,
        help_text=_('المبيعات حسب الفئة / Sales by category')
    )
    
    # Date range
    date_from = serializers.DateField(
        help_text=_('تاريخ البداية / Start date')
    )
    date_to = serializers.DateField(
        help_text=_('تاريخ النهاية / End date')
    )


# =============================================================================
# Users Report Serializer
# متسلسل تقرير المستخدمين
# =============================================================================

class UsersReportSerializer(serializers.Serializer):
    """
    Serializer for users report.
    متسلسل لتقرير المستخدمين.
    """
    
    new_users = serializers.IntegerField(
        help_text=_('المستخدمين الجدد / New users')
    )
    new_users_change = serializers.FloatField(
        help_text=_('نسبة التغيير في المستخدمين الجدد / New users change percentage')
    )
    total_users = serializers.IntegerField(
        help_text=_('إجمالي المستخدمين / Total users')
    )
    active_users = serializers.IntegerField(
        help_text=_('المستخدمين النشطين / Active users')
    )
    
    # Date range
    date_from = serializers.DateField(
        help_text=_('تاريخ البداية / Start date')
    )
    date_to = serializers.DateField(
        help_text=_('تاريخ النهاية / End date')
    )


# =============================================================================
# Commissions Report Serializer
# متسلسل تقرير العمولات
# =============================================================================

class CommissionsReportSerializer(serializers.Serializer):
    """
    Serializer for commissions report.
    متسلسل لتقرير العمولات.
    """
    
    total_commissions = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('إجمالي العمولات / Total commissions')
    )
    commissions_change = serializers.FloatField(
        help_text=_('نسبة التغيير في العمولات / Commissions change percentage')
    )
    total_orders = serializers.IntegerField(
        help_text=_('إجمالي الطلبات / Total orders')
    )
    avg_commission_per_order = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('متوسط العمولة لكل طلب / Average commission per order')
    )
    
    # Date range
    date_from = serializers.DateField(
        help_text=_('تاريخ البداية / Start date')
    )
    date_to = serializers.DateField(
        help_text=_('تاريخ النهاية / End date')
    )

