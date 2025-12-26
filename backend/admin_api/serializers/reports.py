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


class OrderDetailSerializer(serializers.Serializer):
    """Detailed order information"""
    id = serializers.IntegerField(help_text=_('معرف الطلب / Order ID'))
    order_number = serializers.CharField(help_text=_('رقم الطلب / Order number'))
    customer_name = serializers.CharField(help_text=_('اسم العميل / Customer name'))
    customer_phone = serializers.CharField(help_text=_('هاتف العميل / Customer phone'))
    status = serializers.CharField(help_text=_('حالة الطلب / Order status'))
    status_display = serializers.CharField(help_text=_('حالة الطلب للعرض / Status display'))
    total = serializers.DecimalField(max_digits=12, decimal_places=2, help_text=_('الإجمالي / Total'))
    items_count = serializers.IntegerField(help_text=_('عدد العناصر / Items count'))
    created_at = serializers.DateTimeField(help_text=_('تاريخ الإنشاء / Created at'))


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
    
    # Detailed orders list
    orders = OrderDetailSerializer(
        many=True,
        help_text=_('قائمة الطلبات التفصيلية / Detailed orders list')
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
    id = serializers.IntegerField(help_text=_('معرف المنتج / Product ID'))
    name = serializers.CharField(help_text=_('اسم المنتج / Product name'))
    vendor_name = serializers.CharField(help_text=_('اسم البائع / Vendor name'))
    category_name = serializers.CharField(help_text=_('اسم الفئة / Category name'))
    sales = serializers.IntegerField(help_text=_('عدد المبيعات / Sales count'))
    revenue = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text=_('الإيرادات / Revenue')
    )
    stock_quantity = serializers.IntegerField(help_text=_('الكمية المتوفرة / Stock quantity'))


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

class UserDetailSerializer(serializers.Serializer):
    """Detailed user information"""
    id = serializers.IntegerField(help_text=_('معرف المستخدم / User ID'))
    email = serializers.EmailField(help_text=_('البريد الإلكتروني / Email'))
    first_name = serializers.CharField(help_text=_('الاسم الأول / First name'))
    last_name = serializers.CharField(help_text=_('الاسم الأخير / Last name'))
    phone = serializers.CharField(help_text=_('الهاتف / Phone'))
    orders_count = serializers.IntegerField(help_text=_('عدد الطلبات / Orders count'))
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, help_text=_('إجمالي الإنفاق / Total spent'))
    date_joined = serializers.DateTimeField(help_text=_('تاريخ الانضمام / Date joined'))
    last_login = serializers.DateTimeField(help_text=_('آخر تسجيل دخول / Last login'))
    is_active = serializers.BooleanField(help_text=_('نشط / Is active'))


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
    
    # Detailed users list
    users = UserDetailSerializer(
        many=True,
        help_text=_('قائمة المستخدمين التفصيلية / Detailed users list')
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

class CommissionDetailSerializer(serializers.Serializer):
    """Detailed commission information"""
    order_id = serializers.IntegerField(help_text=_('معرف الطلب / Order ID'))
    order_number = serializers.CharField(help_text=_('رقم الطلب / Order number'))
    customer_name = serializers.CharField(help_text=_('اسم العميل / Customer name'))
    vendor_name = serializers.CharField(help_text=_('اسم البائع / Vendor name'))
    order_total = serializers.DecimalField(max_digits=12, decimal_places=2, help_text=_('إجمالي الطلب / Order total'))
    commission_amount = serializers.DecimalField(max_digits=12, decimal_places=2, help_text=_('مبلغ العمولة / Commission amount'))
    commission_percentage = serializers.FloatField(help_text=_('نسبة العمولة / Commission percentage'))
    created_at = serializers.DateTimeField(help_text=_('تاريخ الطلب / Order date'))


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
    
    # Detailed commissions list
    commissions = CommissionDetailSerializer(
        many=True,
        help_text=_('قائمة العمولات التفصيلية / Detailed commissions list')
    )
    
    # Date range
    date_from = serializers.DateField(
        help_text=_('تاريخ البداية / Start date')
    )
    date_to = serializers.DateField(
        help_text=_('تاريخ النهاية / End date')
    )

