"""
Vendor Dashboard Views
عروض لوحة تحكم البائع

هذا الملف يحتوي على جميع views للـ Vendor Dashboard.
This file contains all Vendor Dashboard views.

Endpoints:
- GET /api/v1/vendor/dashboard/overview/        - KPIs and statistics
"""

from rest_framework.views import APIView
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate, TruncMonth
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.dashboard import VendorDashboardOverviewSerializer
from core.utils import success_response
from users.models import VendorUser


# =============================================================================
# Vendor Dashboard Overview View
# عرض نظرة عامة على لوحة تحكم البائع
# =============================================================================

class VendorDashboardOverviewView(APIView):
    """
    Get vendor dashboard overview statistics (KPIs).
    الحصول على إحصائيات نظرة عامة على لوحة تحكم البائع.
    
    Returns all key performance indicators for the authenticated vendor including:
    - Sales statistics (total, today, change percentage)
    - Order statistics (total, today, pending, processing, change percentage)
    - Product statistics (total, active, low stock, out of stock)
    - Shop visits statistics (total, today, change percentage)
    
    Security:
    - Only authenticated vendors can access
    - Returns data only for the vendor associated with the authenticated user
    - Uses throttling to prevent abuse
    
    الأمان:
    - فقط البائعون المسجلون يمكنهم الوصول
    - يعيد البيانات فقط للبائع المرتبط بالمستخدم المسجل
    - يستخدم تحديد المعدل لمنع الإساءة
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Dashboard Overview',
        description='Get all KPIs for the vendor dashboard',
        responses={
            200: VendorDashboardOverviewSerializer,
        },
        tags=['Vendor Dashboard'],
    )
    def get(self, request):
        """
        Get vendor dashboard overview statistics.
        الحصول على إحصائيات نظرة عامة على لوحة تحكم البائع.
        """
        # Import models here to avoid circular imports
        # استيراد النماذج هنا لتجنب الاستيراد الدائري
        from orders.models import Order, OrderItem
        from products.models import Product, ProductVariant
        
        # Get vendor associated with the authenticated user
        # الحصول على البائع المرتبط بالمستخدم المسجل
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return success_response(
                data={},
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user'),
                status_code=404
            )
        
        # Time calculations
        # حسابات الوقت
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)
        
        # =================================================================
        # Revenue Statistics (Sales)
        # إحصائيات الإيرادات (المبيعات)
        # =================================================================
        
        # Get all orders that contain products from this vendor
        # الحصول على جميع الطلبات التي تحتوي على منتجات من هذا البائع
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        )
        
        vendor_orders = Order.objects.filter(
            items__in=vendor_order_items
        ).distinct()
        
        # Total sales (all time) - only completed/delivered orders
        # إجمالي المبيعات (كل الأوقات) - فقط الطلبات المكتملة/المسلمة
        # Calculate total sales correctly (sum of price * quantity for each item)
        # حساب إجمالي المبيعات بشكل صحيح (مجموع السعر * الكمية لكل عنصر)
        completed_items = vendor_order_items.filter(
            order__status__in=['delivered', 'completed']
        )
        total_sales = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in completed_items
        ) or Decimal('0.00')
        
        # This month's sales
        # مبيعات هذا الشهر
        this_month_items = vendor_order_items.filter(
            order__status__in=['delivered', 'completed'],
            order__created_at__gte=month_start
        )
        this_month_sales = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in this_month_items
        ) or Decimal('0.00')
        
        # Last month's sales
        # مبيعات الشهر الماضي
        last_month_items = vendor_order_items.filter(
            order__status__in=['delivered', 'completed'],
            order__created_at__gte=last_month_start,
            order__created_at__lt=month_start
        )
        last_month_sales = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in last_month_items
        ) or Decimal('0.00')
        
        # Sales change percentage
        # نسبة التغيير في المبيعات
        if last_month_sales > 0:
            sales_change = float(
                ((this_month_sales - last_month_sales) / last_month_sales) * 100
            )
        else:
            sales_change = 100.0 if this_month_sales > 0 else 0.0
        
        # Today's sales
        # مبيعات اليوم
        today_items = vendor_order_items.filter(
            order__created_at__gte=today_start
        )
        today_sales = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in today_items
        ) or Decimal('0.00')
        
        # =================================================================
        # Order Statistics
        # إحصائيات الطلبات
        # =================================================================
        
        total_orders = vendor_orders.count()
        today_orders = vendor_orders.filter(created_at__gte=today_start).count()
        pending_orders = vendor_orders.filter(status='pending').count()
        processing_orders = vendor_orders.filter(status__in=['processing', 'confirmed']).count()
        
        # This month's orders
        this_month_orders = vendor_orders.filter(created_at__gte=month_start).count()
        last_month_orders = vendor_orders.filter(
            created_at__gte=last_month_start,
            created_at__lt=month_start
        ).count()
        
        if last_month_orders > 0:
            orders_change = ((this_month_orders - last_month_orders) / last_month_orders) * 100
        else:
            orders_change = 100.0 if this_month_orders > 0 else 0.0
        
        # =================================================================
        # Product Statistics
        # إحصائيات المنتجات
        # =================================================================
        
        vendor_products = Product.objects.filter(vendor=vendor)
        total_products = vendor_products.count()
        active_products = vendor_products.filter(is_active=True).count()
        
        # Low stock products (stock < 10) - check through variants
        # منتجات بمخزون منخفض (مخزون < 10) - التحقق من خلال المتغيرات
        low_stock_products = 0
        out_of_stock_products = 0
        
        for product in vendor_products.filter(is_active=True):
            variants = ProductVariant.objects.filter(product=product)
            if not variants.exists():
                out_of_stock_products += 1
                continue
            
            # Check if any variant has stock
            # التحقق من وجود مخزون في أي متغير
            has_stock = False
            has_low_stock = False
            
            for variant in variants:
                # Assuming stock is stored in variant or calculated
                # افتراض أن المخزون مخزن في المتغير أو محسوب
                # TODO: Adjust based on actual stock field location
                stock = getattr(variant, 'stock', 0) if hasattr(variant, 'stock') else 0
                
                if stock > 0:
                    has_stock = True
                    if stock < 10:
                        has_low_stock = True
                        break
            
            if not has_stock:
                out_of_stock_products += 1
            elif has_low_stock:
                low_stock_products += 1
        
        # =================================================================
        # Shop Visits Statistics
        # إحصائيات زيارات المتجر
        # =================================================================
        
        # TODO: Implement shop visits tracking when analytics system is ready
        # TODO: تنفيذ تتبع زيارات المتجر عندما يكون نظام التحليلات جاهزاً
        
        # For now, return placeholder values
        # في الوقت الحالي، إرجاع قيم مؤقتة
        total_visits = 0
        today_visits = 0
        visits_change = 0.0
        
        # =================================================================
        # Build Response
        # بناء الاستجابة
        # =================================================================
        
        data = {
            # Sales (Revenue)
            'total_sales': str(total_sales),  # Convert Decimal to string for serializer
            'total_sales_change': round(sales_change, 1),
            'today_sales': str(today_sales),  # Convert Decimal to string for serializer
            
            # Orders
            'total_orders': total_orders,
            'total_orders_change': round(orders_change, 1),
            'today_orders': today_orders,
            'pending_orders': pending_orders,
            'processing_orders': processing_orders,
            
            # Products
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock_products,
            'out_of_stock_products': out_of_stock_products,
            
            # Shop Visits
            'total_visits': total_visits,
            'total_visits_change': round(visits_change, 1),
            'today_visits': today_visits,
        }
        
        # Validate and serialize the data
        # التحقق من البيانات وتسلسلها
        serializer = VendorDashboardOverviewSerializer(data=data)
        
        if serializer.is_valid(raise_exception=True):
            return success_response(
                data=serializer.validated_data,
                message=_('تم جلب إحصائيات لوحة التحكم بنجاح / Dashboard statistics retrieved successfully')
            )

