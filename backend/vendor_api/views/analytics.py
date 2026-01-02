"""
Vendor Analytics Views
عروض تحليلات البائع

This module contains views for vendor analytics and reporting.
هذا الملف يحتوي على عروض تحليلات البائع والتقارير.

API Endpoints:
    GET    /api/v1/vendor/analytics/overview/        - Analytics overview
    GET    /api/v1/vendor/analytics/sales/          - Sales analytics
    GET    /api/v1/vendor/analytics/products/        - Product analytics
    GET    /api/v1/vendor/analytics/customers/      - Customer analytics
    GET    /api/v1/vendor/analytics/time-analysis/   - Time-based analysis
    GET    /api/v1/vendor/analytics/comparison/     - Period comparison

Security:
    - All endpoints require vendor authentication
    - Returns data only for the vendor's products
    - Uses throttling to prevent abuse

الأمان:
    - جميع النقاط تتطلب مصادقة البائع
    - يعيد البيانات فقط لمنتجات البائع
    - يستخدم تحديد المعدل لمنع الإساءة
"""

from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count, Avg, Max, Min
from django.db.models.functions import TruncDate, TruncMonth, TruncHour, Extract
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiParameter
from collections import defaultdict

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.analytics import (
    VendorAnalyticsOverviewSerializer,
    VendorSalesAnalyticsSerializer,
    VendorProductAnalyticsSerializer,
    VendorCustomerAnalyticsSerializer,
    VendorTimeAnalysisSerializer,
    VendorComparisonAnalyticsSerializer,
)
from core.utils import success_response, error_response
from users.models import VendorUser
import hashlib


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def get_vendor_from_request(request):
    """
    Get vendor associated with the authenticated user.
    الحصول على البائع المرتبط بالمستخدم المسجل.
    """
    try:
        vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
        return vendor_user.vendor
    except VendorUser.DoesNotExist:
        return None


def generate_customer_key(vendor_id: int, user_id: int = None, guest_identifier: str = None) -> str:
    """
    Generate a unique customer key for vendor-specific customer identification.
    إنشاء مفتاح عميل فريد لتحديد هوية العميل الخاص بالبائع.
    """
    if user_id:
        raw_key = f"vendor_{vendor_id}_user_{user_id}"
    elif guest_identifier:
        raw_key = f"vendor_{vendor_id}_guest_{guest_identifier}"
    else:
        raw_key = f"vendor_{vendor_id}_unknown"
    
    hash_obj = hashlib.sha256(raw_key.encode())
    return hash_obj.hexdigest()[:16]


def parse_date_range(date_from: str = None, date_to: str = None):
    """
    Parse date range from query parameters.
    تحليل نطاق التاريخ من معاملات الاستعلام.
    """
    now = timezone.now()
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            date_from_obj = timezone.make_aware(datetime.combine(date_from_obj, datetime.min.time()))
        except ValueError:
            date_from_obj = None
    else:
        date_from_obj = None
    
    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            date_to_obj = timezone.make_aware(datetime.combine(date_to_obj, datetime.max.time()))
        except ValueError:
            date_to_obj = None
    else:
        date_to_obj = None
    
    return date_from_obj, date_to_obj


# =============================================================================
# Analytics Overview View
# عرض نظرة عامة على التحليلات
# =============================================================================

class VendorAnalyticsOverviewView(APIView):
    """
    Get vendor analytics overview with key metrics.
    الحصول على نظرة عامة على تحليلات البائع مع المؤشرات الرئيسية.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Analytics Overview',
        description='Get analytics overview with key metrics (AOV, CLV, conversion rate, etc.)',
        parameters=[
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get analytics overview.
        الحصول على نظرة عامة على التحليلات.
        """
        from orders.models import Order, OrderItem
        from products.models import Product
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Parse date range
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        # Get vendor order items
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        ).select_related('order', 'product_variant', 'product_variant__product')
        
        # Apply date filter
        if date_from:
            vendor_order_items = vendor_order_items.filter(order__created_at__gte=date_from)
        if date_to:
            vendor_order_items = vendor_order_items.filter(order__created_at__lte=date_to)
        
        # Get unique orders
        order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()
        orders = Order.objects.filter(id__in=order_ids)
        
        # Calculate date range for comparison
        now = timezone.now()
        if date_from and date_to:
            period_days = (date_to - date_from).days
            previous_start = date_from - timedelta(days=period_days + 1)
            previous_end = date_from - timedelta(days=1)
        else:
            # Default: last 30 days
            date_from = now - timedelta(days=30)
            date_to = now
            previous_start = date_from - timedelta(days=30)
            previous_end = date_from
        
        # Current period calculations
        current_items = vendor_order_items.filter(
            order__created_at__gte=date_from,
            order__created_at__lte=date_to
        )
        current_revenue = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in current_items
        ) or Decimal('0.00')
        current_orders_count = orders.filter(
            created_at__gte=date_from,
            created_at__lte=date_to
        ).count()
        
        # Previous period calculations
        previous_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=previous_start,
            order__created_at__lte=previous_end
        )
        previous_revenue = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in previous_items
        ) or Decimal('0.00')
        previous_orders_count = Order.objects.filter(
            id__in=previous_items.values_list('order_id', flat=True).distinct(),
            created_at__gte=previous_start,
            created_at__lte=previous_end
        ).count()
        
        # Calculate changes
        if previous_revenue > 0:
            revenue_change = float(((current_revenue - previous_revenue) / previous_revenue) * 100)
        else:
            revenue_change = 100.0 if current_revenue > 0 else 0.0
        
        if previous_orders_count > 0:
            orders_change = float(((current_orders_count - previous_orders_count) / previous_orders_count) * 100)
        else:
            orders_change = 100.0 if current_orders_count > 0 else 0.0
        
        # Calculate AOV
        average_order_value = Decimal('0.00')
        if current_orders_count > 0:
            average_order_value = current_revenue / Decimal(str(current_orders_count))
        
        # Calculate customer metrics
        current_orders_list = orders.filter(
            created_at__gte=date_from,
            created_at__lte=date_to
        )
        unique_customers = set()
        for order in current_orders_list:
            if order.user:
                unique_customers.add(order.user.id)
            else:
                guest_id = order.customer_name or order.customer_phone or f"guest_{order.id}"
                unique_customers.add(f"guest_{guest_id}")
        
        total_customers = len(unique_customers)
        
        # New customers (first order in this period)
        all_orders = orders.filter(created_at__lte=date_to)
        new_customers = 0
        for order in current_orders_list:
            if order.user:
                # Check if this is first order
                first_order = all_orders.filter(user=order.user).order_by('created_at').first()
                if first_order and first_order.id == order.id:
                    new_customers += 1
            else:
                # Guest - count as new if first order
                guest_id = order.customer_name or order.customer_phone or f"guest_{order.id}"
                first_order = all_orders.filter(
                    Q(customer_name=order.customer_name) | Q(customer_phone=order.customer_phone)
                ).order_by('created_at').first()
                if first_order and first_order.id == order.id:
                    new_customers += 1
        
        # Repeat customer rate
        repeat_customer_rate = None
        if total_customers > 0:
            repeat_customers = total_customers - new_customers
            repeat_customer_rate = float((repeat_customers / total_customers) * 100)
        
        # Customer Lifetime Value (CLV)
        customer_lifetime_value = None
        if total_customers > 0:
            customer_lifetime_value = current_revenue / Decimal(str(total_customers))
        
        # Conversion rate (orders / visits) - simplified
        conversion_rate = None
        # Note: Actual conversion rate requires visit tracking
        
        # Product metrics
        vendor_products = Product.objects.filter(vendor=vendor)
        total_products = vendor_products.count()
        active_products = vendor_products.filter(is_active=True).count()
        
        # Top product revenue
        top_product_revenue = None
        product_revenue = vendor_order_items.filter(
            order__created_at__gte=date_from,
            order__created_at__lte=date_to
        ).values('product_variant__product').annotate(
            total=Sum('price') * Sum('quantity')
        ).order_by('-total').first()
        
        if product_revenue:
            top_product_revenue = product_revenue['total']
        
        data = {
            'total_revenue': str(current_revenue),
            'average_order_value': str(average_order_value),
            'revenue_change': revenue_change,
            'total_orders': current_orders_count,
            'orders_change': orders_change,
            'conversion_rate': conversion_rate,
            'total_customers': total_customers,
            'new_customers': new_customers,
            'repeat_customer_rate': repeat_customer_rate,
            'customer_lifetime_value': str(customer_lifetime_value) if customer_lifetime_value else None,
            'total_products': total_products,
            'active_products': active_products,
            'top_product_revenue': str(top_product_revenue) if top_product_revenue else None,
        }
        
        return success_response(data=data)


# =============================================================================
# Sales Analytics View
# عرض تحليلات المبيعات
# =============================================================================

class VendorSalesAnalyticsView(APIView):
    """
    Get detailed sales analytics with charts and metrics.
    الحصول على تحليلات مبيعات مفصلة مع الرسوم البيانية والمؤشرات.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Sales Analytics',
        description='Get detailed sales analytics with revenue, orders, AOV charts and revenue by status',
        parameters=[
            OpenApiParameter(name='period', type=str, description='Time period: week, month, year', enum=['week', 'month', 'year']),
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get sales analytics.
        الحصول على تحليلات المبيعات.
        """
        from orders.models import Order, OrderItem
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get period or date range
        period = request.query_params.get('period', 'month')
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        now = timezone.now()
        
        # Determine date range based on period or custom dates
        if date_from and date_to:
            start_date = date_from
            end_date = date_to
            # Determine grouping based on range length
            days_diff = (date_to - date_from).days
            if days_diff <= 7:
                trunc_func = TruncDate
                label_format = '%d/%m'
            elif days_diff <= 90:
                trunc_func = TruncDate
                label_format = '%d/%m'
            else:
                trunc_func = TruncMonth
                label_format = '%b %Y'
        else:
            # Use period
            if period == 'week':
                start_date = now - timedelta(days=7)
                trunc_func = TruncDate
                label_format = '%d/%m'
            elif period == 'month':
                start_date = now - timedelta(days=30)
                trunc_func = TruncDate
                label_format = '%d/%m'
            else:  # year
                start_date = now - timedelta(days=365)
                trunc_func = TruncMonth
                label_format = '%b %Y'
            end_date = now
        
        # Get vendor order items
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=start_date,
            order__created_at__lte=end_date
        ).select_related('order', 'product_variant', 'product_variant__product')
        
        # Get unique orders
        order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()
        orders = Order.objects.filter(
            id__in=order_ids,
            created_at__gte=start_date,
            created_at__lte=end_date
        ).select_related('user')
        
        # Group by date
        orders_by_date = orders.annotate(
            date_group=trunc_func('created_at')
        ).values('date_group').annotate(
            orders_count=Count('id')
        ).order_by('date_group')
        
        # Build chart data
        labels = []
        revenue = []
        orders_count = []
        aov_data = []
        
        revenue_by_date = defaultdict(Decimal)
        orders_by_date_dict = defaultdict(int)
        
        for order in orders:
            date_key = trunc_func(order.created_at)
            order_items = vendor_order_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            
            revenue_by_date[date_key] += order_revenue
            orders_by_date_dict[date_key] += 1
        
        # Sort by date and build arrays
        sorted_dates = sorted(revenue_by_date.keys())
        for date_key in sorted_dates:
            if trunc_func == TruncDate:
                labels.append(date_key.strftime(label_format))
            else:
                labels.append(date_key.strftime(label_format))
            
            revenue.append(str(revenue_by_date[date_key]))
            orders_count.append(orders_by_date_dict[date_key])
            
            # Calculate AOV for this date
            if orders_by_date_dict[date_key] > 0:
                aov = revenue_by_date[date_key] / Decimal(str(orders_by_date_dict[date_key]))
                aov_data.append(str(aov))
            else:
                aov_data.append('0')
        
        # Calculate totals
        total_revenue = sum(revenue_by_date.values()) or Decimal('0.00')
        total_orders = len(orders)
        average_order_value_overall = total_revenue / Decimal(str(total_orders)) if total_orders > 0 else Decimal('0.00')
        
        # Revenue by status
        revenue_by_status = defaultdict(Decimal)
        for order in orders:
            order_items = vendor_order_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            revenue_by_status[order.status] += order_revenue
        
        revenue_by_status_dict = {
            status: str(revenue) for status, revenue in revenue_by_status.items()
        }
        
        data = {
            'labels': labels,
            'revenue': revenue,
            'orders': orders_count,
            'average_order_value': aov_data,
            'total_revenue': str(total_revenue),
            'total_orders': total_orders,
            'average_order_value_overall': str(average_order_value_overall),
            'revenue_by_status': revenue_by_status_dict,
            'period': period if not (date_from and date_to) else 'custom',
        }
        
        return success_response(data=data)


# =============================================================================
# Product Analytics View
# عرض تحليلات المنتجات
# =============================================================================

class VendorProductAnalyticsView(APIView):
    """
    Get product analytics including top products, category breakdown, and stock alerts.
    الحصول على تحليلات المنتجات بما في ذلك أفضل المنتجات وتوزيع الفئات وتنبيهات المخزون.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Product Analytics',
        description='Get product analytics with top products, category breakdown, and stock alerts',
        parameters=[
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
            OpenApiParameter(name='limit', type=int, description='Number of top products to return (default: 10)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get product analytics.
        الحصول على تحليلات المنتجات.
        """
        from orders.models import OrderItem
        from products.models import Product
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Parse date range
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        limit = int(request.query_params.get('limit', 10))
        
        # Get vendor order items
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        ).select_related('order', 'product_variant', 'product_variant__product', 'product_variant__product__category')
        
        # Apply date filter
        if date_from:
            vendor_order_items = vendor_order_items.filter(order__created_at__gte=date_from)
        if date_to:
            vendor_order_items = vendor_order_items.filter(order__created_at__lte=date_to)
        
        # Aggregate by product
        product_stats_queryset = vendor_order_items.values(
            'product_variant__product__id',
            'product_variant__product__name',
            'product_variant__product__category__name',
        ).annotate(
            revenue=Sum('price') * Sum('quantity'),
            units_sold=Sum('quantity'),
            orders_count=Count('order_id', distinct=True),
        ).order_by('-revenue')
        
        # Convert to list to support negative indexing
        product_stats = list(product_stats_queryset)
        
        # Build top products list
        top_products = []
        for stat in product_stats[:limit]:
            product = Product.objects.get(id=stat['product_variant__product__id'])
            top_products.append({
                'product_id': stat['product_variant__product__id'],
                'product_name': stat['product_variant__product__name'],
                'product_image': product.images.first().image.url if product.images.exists() else None,
                'revenue': str(stat['revenue'] or Decimal('0.00')),
                'units_sold': stat['units_sold'] or 0,
                'orders_count': stat['orders_count'],
                'average_price': str(Decimal(str(stat['revenue'] or 0)) / Decimal(str(stat['units_sold'] or 1))),
            })
        
        # Worst products (lowest revenue)
        # Get products with lowest revenue (but still > 0)
        worst_products = []
        # Reverse the list to get lowest revenue first, then filter
        worst_stats = [s for s in reversed(product_stats) if s.get('revenue') and s['revenue'] > 0][:limit]
        for stat in worst_stats:
            product = Product.objects.get(id=stat['product_variant__product__id'])
            worst_products.append({
                'product_id': stat['product_variant__product__id'],
                'product_name': stat['product_variant__product__name'],
                'product_image': product.images.first().image.url if product.images.exists() else None,
                'revenue': str(stat['revenue'] or Decimal('0.00')),
                'units_sold': stat['units_sold'] or 0,
                'orders_count': stat['orders_count'],
                'average_price': str(Decimal(str(stat['revenue'] or 0)) / Decimal(str(stat['units_sold'] or 1))),
            })
        
        # Revenue by category
        revenue_by_category = defaultdict(Decimal)
        for stat in product_stats:
            category_name = stat['product_variant__product__category__name'] or _('بدون فئة / No category')
            revenue_by_category[category_name] += Decimal(str(stat['revenue'] or 0))
        
        revenue_by_category_dict = {
            category: str(revenue) for category, revenue in revenue_by_category.items()
        }
        
        # Stock alerts
        vendor_products = Product.objects.filter(vendor=vendor)
        low_stock_count = 0
        out_of_stock_count = 0
        
        for product in vendor_products:
            total_stock = product.variants.aggregate(total=Sum('stock_quantity'))['total'] or 0
            if total_stock == 0:
                out_of_stock_count += 1
            elif total_stock < 10:
                low_stock_count += 1
        
        data = {
            'top_products': top_products,
            'worst_products': worst_products,
            'revenue_by_category': revenue_by_category_dict,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        }
        
        return success_response(data=data)


# =============================================================================
# Customer Analytics View
# عرض تحليلات الزبائن
# =============================================================================

class VendorCustomerAnalyticsView(APIView):
    """
    Get customer analytics including growth, top customers, and retention metrics.
    الحصول على تحليلات الزبائن بما في ذلك النمو وأفضل الزبائن ومقاييس الاحتفاظ.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Customer Analytics',
        description='Get customer analytics with growth chart, top customers, and retention metrics',
        parameters=[
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
            OpenApiParameter(name='limit', type=int, description='Number of top customers to return (default: 10)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get customer analytics.
        الحصول على تحليلات الزبائن.
        """
        from orders.models import Order, OrderItem
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Parse date range
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        limit = int(request.query_params.get('limit', 10))
        
        # Default to last 30 days if no date range
        now = timezone.now()
        if not date_from:
            date_from = now - timedelta(days=30)
        if not date_to:
            date_to = now
        
        # Get vendor order items
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor
        ).select_related('order', 'order__user')
        
        # Get orders in date range
        order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()
        orders = Order.objects.filter(
            id__in=order_ids,
            created_at__gte=date_from,
            created_at__lte=date_to
        ).select_related('user').order_by('created_at')
        
        # Customer growth chart (grouped by date)
        customer_growth_by_date = defaultdict(set)
        for order in orders:
            date_key = order.created_at.date()
            if order.user:
                customer_growth_by_date[date_key].add(order.user.id)
            else:
                guest_id = order.customer_name or order.customer_phone or f"guest_{order.id}"
                customer_growth_by_date[date_key].add(f"guest_{guest_id}")
        
        # Build growth chart data
        sorted_dates = sorted(customer_growth_by_date.keys())
        customer_growth_labels = []
        customer_growth_data = []
        cumulative_customers = set()
        
        for date_key in sorted_dates:
            customer_growth_labels.append(date_key.strftime('%d/%m'))
            cumulative_customers.update(customer_growth_by_date[date_key])
            customer_growth_data.append(len(cumulative_customers))
        
        # Aggregate customer data
        customers_data = {}
        for order in orders:
            if order.user:
                customer_key = generate_customer_key(vendor.id, order.user.id)
                customer_id = order.user.id
                customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
                if not customer_name:
                    customer_name = order.user.email.split('@')[0] if order.user.email else _('مستخدم / User')
            else:
                guest_identifier = order.customer_name or order.customer_phone or f"guest_{order.id}"
                customer_key = generate_customer_key(vendor.id, None, guest_identifier)
                customer_id = None
                customer_name = order.customer_name or _('ضيف / Guest')
            
            if customer_key not in customers_data:
                customers_data[customer_key] = {
                    'customer_key': customer_key,
                    'customer_name': customer_name,
                    'total_spent': Decimal('0.00'),
                    'orders_count': 0,
                    'last_order_at': None,
                }
            
            # Calculate revenue for this order
            order_items = vendor_order_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            
            customers_data[customer_key]['total_spent'] += order_revenue
            customers_data[customer_key]['orders_count'] += 1
            
            if not customers_data[customer_key]['last_order_at'] or order.created_at > customers_data[customer_key]['last_order_at']:
                customers_data[customer_key]['last_order_at'] = order.created_at
        
        # Build top customers list
        customers_list = list(customers_data.values())
        customers_list.sort(key=lambda x: x['total_spent'], reverse=True)
        
        top_customers = []
        for customer in customers_list[:limit]:
            aov = customer['total_spent'] / Decimal(str(customer['orders_count'])) if customer['orders_count'] > 0 else Decimal('0.00')
            top_customers.append({
                'customer_key': customer['customer_key'],
                'customer_name': customer['customer_name'],
                'total_spent': str(customer['total_spent']),
                'orders_count': customer['orders_count'],
                'average_order_value': str(aov),
                'last_order_at': customer['last_order_at'],
            })
        
        # Calculate statistics
        total_customers = len(customers_list)
        
        # New vs returning customers
        all_orders = Order.objects.filter(
            id__in=vendor_order_items.values_list('order_id', flat=True).distinct(),
            created_at__lte=date_to
        )
        new_customers = 0
        for customer_key, customer_data in customers_data.items():
            # Check if first order in date range
            first_order = all_orders.filter(
                created_at__lte=date_to
            ).order_by('created_at').first()
            # Simplified: count as new if only 1 order
            if customer_data['orders_count'] == 1:
                new_customers += 1
        
        returning_customers = total_customers - new_customers
        
        # Repeat purchase rate
        repeat_purchase_rate = None
        if total_customers > 0:
            repeat_purchase_rate = float((returning_customers / total_customers) * 100)
        
        # Average customer value
        average_customer_value = None
        if total_customers > 0:
            total_revenue = sum(Decimal(str(c['total_spent'])) for c in customers_list)
            average_customer_value = total_revenue / Decimal(str(total_customers))
        
        data = {
            'customer_growth_labels': customer_growth_labels,
            'customer_growth_data': customer_growth_data,
            'top_customers': top_customers,
            'total_customers': total_customers,
            'new_customers': new_customers,
            'returning_customers': returning_customers,
            'repeat_purchase_rate': repeat_purchase_rate,
            'average_customer_value': str(average_customer_value) if average_customer_value else None,
        }
        
        return success_response(data=data)


# =============================================================================
# Time Analysis View
# عرض التحليل الزمني
# =============================================================================

class VendorTimeAnalysisView(APIView):
    """
    Get time-based analysis including hourly sales, day of week, and seasonal trends.
    الحصول على التحليل الزمني بما في ذلك المبيعات بالساعة ويوم الأسبوع والاتجاهات الموسمية.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Time Analysis',
        description='Get time-based analysis with hourly sales, day of week analysis, and monthly trends',
        parameters=[
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get time analysis.
        الحصول على التحليل الزمني.
        """
        from orders.models import Order, OrderItem
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Parse date range
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        # Default to last 30 days
        now = timezone.now()
        if not date_from:
            date_from = now - timedelta(days=30)
        if not date_to:
            date_to = now
        
        # Get vendor order items
        vendor_order_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=date_from,
            order__created_at__lte=date_to
        ).select_related('order')
        
        # Get orders
        order_ids = vendor_order_items.values_list('order_id', flat=True).distinct()
        orders = Order.objects.filter(
            id__in=order_ids,
            created_at__gte=date_from,
            created_at__lte=date_to
        )
        
        # Hourly analysis
        hourly_revenue = defaultdict(Decimal)
        hourly_orders = defaultdict(int)
        
        for order in orders:
            hour = order.created_at.hour
            order_items = vendor_order_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            
            hourly_revenue[hour] += order_revenue
            hourly_orders[hour] += 1
        
        # Build hourly arrays (0-23)
        hourly_labels = [f"{i:02d}:00" for i in range(24)]
        hourly_revenue_data = []
        hourly_orders_data = []
        
        for hour in range(24):
            hourly_revenue_data.append(str(hourly_revenue[hour]))
            hourly_orders_data.append(hourly_orders[hour])
        
        # Find best selling hour
        best_selling_hour = None
        max_revenue = Decimal('0.00')
        for hour, revenue in hourly_revenue.items():
            if revenue > max_revenue:
                max_revenue = revenue
                best_selling_hour = hour
        
        # Day of week analysis
        day_names = {
            0: _('الاثنين / Monday'),
            1: _('الثلاثاء / Tuesday'),
            2: _('الأربعاء / Wednesday'),
            3: _('الخميس / Thursday'),
            4: _('الجمعة / Friday'),
            5: _('السبت / Saturday'),
            6: _('الأحد / Sunday'),
        }
        
        day_of_week_revenue = defaultdict(Decimal)
        day_of_week_orders = defaultdict(int)
        
        for order in orders:
            day_of_week = order.created_at.weekday()
            order_items = vendor_order_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            
            day_of_week_revenue[day_of_week] += order_revenue
            day_of_week_orders[day_of_week] += 1
        
        # Build day of week arrays
        day_of_week_labels = []
        day_of_week_revenue_data = []
        day_of_week_orders_data = []
        
        for day in range(7):
            day_of_week_labels.append(day_names[day])
            day_of_week_revenue_data.append(str(day_of_week_revenue[day]))
            day_of_week_orders_data.append(day_of_week_orders[day])
        
        # Find best selling day
        best_selling_day = None
        max_revenue_day = Decimal('0.00')
        for day, revenue in day_of_week_revenue.items():
            if revenue > max_revenue_day:
                max_revenue_day = revenue
                best_selling_day = day_names[day]
        
        # Monthly trends (last 12 months)
        monthly_revenue = defaultdict(Decimal)
        monthly_orders = defaultdict(int)
        
        monthly_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=now - timedelta(days=365),
            order__created_at__lte=now
        )
        
        for item in monthly_items:
            month_key = item.order.created_at.strftime('%Y-%m')
            monthly_revenue[month_key] += Decimal(str(item.price)) * Decimal(str(item.quantity))
        
        monthly_order_ids = monthly_items.values_list('order_id', flat=True).distinct()
        monthly_orders_list = Order.objects.filter(
            id__in=monthly_order_ids,
            created_at__gte=now - timedelta(days=365),
            created_at__lte=now
        )
        
        for order in monthly_orders_list:
            month_key = order.created_at.strftime('%Y-%m')
            monthly_orders[month_key] += 1
        
        # Build monthly arrays
        monthly_labels = []
        monthly_revenue_data = []
        monthly_orders_data = []
        
        for i in range(12):
            month_date = now - timedelta(days=30 * (11 - i))
            month_key = month_date.strftime('%Y-%m')
            month_label = month_date.strftime('%b %Y')
            
            monthly_labels.append(month_label)
            monthly_revenue_data.append(str(monthly_revenue[month_key]))
            monthly_orders_data.append(monthly_orders[month_key])
        
        data = {
            'hourly_labels': hourly_labels,
            'hourly_revenue': hourly_revenue_data,
            'hourly_orders': hourly_orders_data,
            'best_selling_hour': best_selling_hour,
            'day_of_week_labels': day_of_week_labels,
            'day_of_week_revenue': day_of_week_revenue_data,
            'day_of_week_orders': day_of_week_orders_data,
            'best_selling_day': best_selling_day,
            'monthly_labels': monthly_labels,
            'monthly_revenue': monthly_revenue_data,
            'monthly_orders': monthly_orders_data,
        }
        
        return success_response(data=data)


# =============================================================================
# Comparison Analytics View
# عرض تحليلات المقارنة
# =============================================================================

class VendorComparisonAnalyticsView(APIView):
    """
    Get period comparison analytics (current vs previous period).
    الحصول على تحليلات مقارنة الفترات (الفترة الحالية مقابل السابقة).
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Vendor Comparison Analytics',
        description='Get period comparison analytics (current vs previous period)',
        parameters=[
            OpenApiParameter(name='period', type=str, description='Period type: week, month, quarter, year', enum=['week', 'month', 'quarter', 'year']),
            OpenApiParameter(name='date_from', type=str, description='Current period start (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Current period end (YYYY-MM-DD)'),
        ],
        tags=['Vendor Analytics'],
    )
    def get(self, request):
        """
        Get comparison analytics.
        الحصول على تحليلات المقارنة.
        """
        from orders.models import Order, OrderItem
        
        vendor = get_vendor_from_request(request)
        if not vendor:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        period = request.query_params.get('period', 'month')
        date_from, date_to = parse_date_range(
            request.query_params.get('date_from'),
            request.query_params.get('date_to')
        )
        
        now = timezone.now()
        
        # Determine current period
        if date_from and date_to:
            current_start = date_from
            current_end = date_to
            period_days = (date_to - date_from).days
            previous_start = date_from - timedelta(days=period_days + 1)
            previous_end = date_from - timedelta(days=1)
            current_label = f"{date_from.strftime('%d/%m/%Y')} - {date_to.strftime('%d/%m/%Y')}"
            previous_label = f"{previous_start.strftime('%d/%m/%Y')} - {previous_end.strftime('%d/%m/%Y')}"
        else:
            # Use period
            if period == 'week':
                current_end = now
                current_start = now - timedelta(days=7)
                previous_end = current_start - timedelta(days=1)
                previous_start = previous_end - timedelta(days=7)
                current_label = _('آخر 7 أيام / Last 7 days')
                previous_label = _('الأسبوع السابق / Previous week')
            elif period == 'month':
                current_end = now
                current_start = now - timedelta(days=30)
                previous_end = current_start - timedelta(days=1)
                previous_start = previous_end - timedelta(days=30)
                current_label = _('آخر 30 يوم / Last 30 days')
                previous_label = _('الشهر السابق / Previous month')
            elif period == 'quarter':
                current_end = now
                current_start = now - timedelta(days=90)
                previous_end = current_start - timedelta(days=1)
                previous_start = previous_end - timedelta(days=90)
                current_label = _('آخر 90 يوم / Last 90 days')
                previous_label = _('الربع السابق / Previous quarter')
            else:  # year
                current_end = now
                current_start = now - timedelta(days=365)
                previous_end = current_start - timedelta(days=1)
                previous_start = previous_end - timedelta(days=365)
                current_label = _('آخر سنة / Last year')
                previous_label = _('السنة السابقة / Previous year')
        
        # Current period calculations
        current_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=current_start,
            order__created_at__lte=current_end
        )
        current_revenue = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in current_items
        ) or Decimal('0.00')
        
        current_order_ids = current_items.values_list('order_id', flat=True).distinct()
        current_orders = Order.objects.filter(
            id__in=current_order_ids,
            created_at__gte=current_start,
            created_at__lte=current_end
        )
        current_orders_count = current_orders.count()
        
        # Current customers
        current_customers_set = set()
        for order in current_orders:
            if order.user:
                current_customers_set.add(order.user.id)
            else:
                guest_id = order.customer_name or order.customer_phone or f"guest_{order.id}"
                current_customers_set.add(f"guest_{guest_id}")
        current_customers_count = len(current_customers_set)
        
        # Previous period calculations
        previous_items = OrderItem.objects.filter(
            product_variant__product__vendor=vendor,
            order__created_at__gte=previous_start,
            order__created_at__lte=previous_end
        )
        previous_revenue = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in previous_items
        ) or Decimal('0.00')
        
        previous_order_ids = previous_items.values_list('order_id', flat=True).distinct()
        previous_orders = Order.objects.filter(
            id__in=previous_order_ids,
            created_at__gte=previous_start,
            created_at__lte=previous_end
        )
        previous_orders_count = previous_orders.count()
        
        # Previous customers
        previous_customers_set = set()
        for order in previous_orders:
            if order.user:
                previous_customers_set.add(order.user.id)
            else:
                guest_id = order.customer_name or order.customer_phone or f"guest_{order.id}"
                previous_customers_set.add(f"guest_{guest_id}")
        previous_customers_count = len(previous_customers_set)
        
        # Calculate changes
        if previous_revenue > 0:
            revenue_change = float(((current_revenue - previous_revenue) / previous_revenue) * 100)
        else:
            revenue_change = 100.0 if current_revenue > 0 else 0.0
        
        if previous_orders_count > 0:
            orders_change = float(((current_orders_count - previous_orders_count) / previous_orders_count) * 100)
        else:
            orders_change = 100.0 if current_orders_count > 0 else 0.0
        
        if previous_customers_count > 0:
            customers_change = float(((current_customers_count - previous_customers_count) / previous_customers_count) * 100)
        else:
            customers_change = 100.0 if current_customers_count > 0 else 0.0
        
        # Build comparison chart data (grouped by date)
        if period == 'week' or (date_from and (date_to - date_from).days <= 7):
            trunc_func = TruncDate
            label_format = '%d/%m'
        elif period == 'month' or (date_from and (date_to - date_from).days <= 90):
            trunc_func = TruncDate
            label_format = '%d/%m'
        else:
            trunc_func = TruncMonth
            label_format = '%b %Y'
        
        # Current period chart data
        current_revenue_by_date = defaultdict(Decimal)
        for order in current_orders:
            date_key = trunc_func(order.created_at)
            order_items = current_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            current_revenue_by_date[date_key] += order_revenue
        
        # Previous period chart data
        previous_revenue_by_date = defaultdict(Decimal)
        for order in previous_orders:
            date_key = trunc_func(order.created_at)
            order_items = previous_items.filter(order=order)
            order_revenue = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in order_items
            ) or Decimal('0.00')
            previous_revenue_by_date[date_key] += order_revenue
        
        # Build comparison arrays
        all_dates = sorted(set(list(current_revenue_by_date.keys()) + list(previous_revenue_by_date.keys())))
        comparison_labels = []
        current_period_data = []
        previous_period_data = []
        
        for date_key in all_dates:
            if trunc_func == TruncDate:
                comparison_labels.append(date_key.strftime(label_format))
            else:
                comparison_labels.append(date_key.strftime(label_format))
            
            current_period_data.append(str(current_revenue_by_date[date_key]))
            previous_period_data.append(str(previous_revenue_by_date[date_key]))
        
        data = {
            'current_period_label': current_label,
            'current_revenue': str(current_revenue),
            'current_orders': current_orders_count,
            'current_customers': current_customers_count,
            'previous_period_label': previous_label,
            'previous_revenue': str(previous_revenue),
            'previous_orders': previous_orders_count,
            'previous_customers': previous_customers_count,
            'revenue_change': revenue_change,
            'orders_change': orders_change,
            'customers_change': customers_change,
            'comparison_labels': comparison_labels,
            'current_period_data': current_period_data,
            'previous_period_data': previous_period_data,
        }
        
        return success_response(data=data)

