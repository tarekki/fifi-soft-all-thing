"""
Dashboard Views
عروض لوحة التحكم

هذا الملف يحتوي على جميع views للـ Dashboard.
This file contains all Dashboard views.

Endpoints:
- GET /api/v1/admin/dashboard/overview/        - KPIs and statistics
- GET /api/v1/admin/dashboard/sales-chart/     - Sales chart data
- GET /api/v1/admin/dashboard/recent-orders/   - Recent orders list
- GET /api/v1/admin/dashboard/recent-activity/ - Recent activity log
"""

from rest_framework.views import APIView
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncMonth
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.throttling import AdminUserRateThrottle
from admin_api.serializers.dashboard import (
    DashboardOverviewSerializer,
    SalesChartSerializer,
    RecentOrderSerializer,
    RecentActivitySerializer,
)
from core.utils import success_response


# =============================================================================
# Dashboard Overview View
# عرض نظرة عامة على لوحة التحكم
# =============================================================================

class DashboardOverviewView(APIView):
    """
    Get dashboard overview statistics (KPIs).
    الحصول على إحصائيات نظرة عامة على لوحة التحكم.
    
    Returns all key performance indicators including:
    - Revenue statistics
    - Order statistics
    - Product statistics
    - User statistics
    - Vendor statistics
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Dashboard Overview',
        description='Get all KPIs for the admin dashboard',
        responses={
            200: DashboardOverviewSerializer,
        },
        tags=['Admin Dashboard'],
    )
    def get(self, request):
        """
        Get dashboard overview statistics.
        الحصول على إحصائيات نظرة عامة على لوحة التحكم.
        """
        # Import models here to avoid circular imports
        # استيراد النماذج هنا لتجنب الاستيراد الدائري
        from django.contrib.auth import get_user_model
        from orders.models import Order
        from products.models import Product
        from vendors.models import Vendor
        
        User = get_user_model()
        
        # Time calculations
        # حسابات الوقت
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)
        last_month_start = (month_start - timedelta(days=1)).replace(day=1)
        
        # =================================================================
        # Revenue Statistics
        # إحصائيات الإيرادات
        # =================================================================
        
        # Total revenue (all time)
        # إجمالي الإيرادات (كل الأوقات)
        total_revenue = Order.objects.filter(
            status__in=['delivered', 'completed']
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        # This month's revenue
        # إيرادات هذا الشهر
        this_month_revenue = Order.objects.filter(
            status__in=['delivered', 'completed'],
            created_at__gte=month_start
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        # Last month's revenue
        # إيرادات الشهر الماضي
        last_month_revenue = Order.objects.filter(
            status__in=['delivered', 'completed'],
            created_at__gte=last_month_start,
            created_at__lt=month_start
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        # Revenue change percentage
        # نسبة التغيير في الإيرادات
        if last_month_revenue > 0:
            revenue_change = float(
                ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
            )
        else:
            revenue_change = 100.0 if this_month_revenue > 0 else 0.0
        
        # Today's revenue
        # إيرادات اليوم
        today_revenue = Order.objects.filter(
            status__in=['delivered', 'completed', 'processing', 'pending'],
            created_at__gte=today_start
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        # =================================================================
        # Order Statistics
        # إحصائيات الطلبات
        # =================================================================
        
        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__gte=today_start).count()
        pending_orders = Order.objects.filter(status='pending').count()
        processing_orders = Order.objects.filter(status='processing').count()
        
        # This month's orders
        this_month_orders = Order.objects.filter(created_at__gte=month_start).count()
        last_month_orders = Order.objects.filter(
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
        
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        
        # Low stock products (stock < 10)
        # منتجات بمخزون منخفض
        low_stock_products = Product.objects.filter(
            is_active=True,
            # Assuming there's a stock field or related variants
            # افتراض وجود حقل مخزون أو متغيرات مرتبطة
        ).count()  # TODO: Implement when stock field is added
        
        out_of_stock_products = 0  # TODO: Implement when stock field is added
        
        # =================================================================
        # User Statistics
        # إحصائيات المستخدمين
        # =================================================================
        
        # Include all users (customers + staff + admins)
        # شمل جميع المستخدمين (العملاء + الموظفين + المدراء)
        total_users = User.objects.count()
        new_users_today = User.objects.filter(
            created_at__gte=today_start
        ).count()
        new_users_week = User.objects.filter(
            created_at__gte=week_start
        ).count()
        
        # =================================================================
        # Vendor Statistics
        # إحصائيات البائعين
        # =================================================================
        
        total_vendors = Vendor.objects.count()
        active_vendors = Vendor.objects.filter(is_active=True).count()
        pending_vendors = Vendor.objects.filter(is_active=False).count()  # Assuming pending = inactive
        
        # =================================================================
        # Build Response
        # بناء الاستجابة
        # =================================================================
        
        data = {
            # Revenue
            'total_revenue': total_revenue,
            'total_revenue_change': round(revenue_change, 1),
            'today_revenue': today_revenue,
            
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
            
            # Users
            'total_users': total_users,
            'new_users_today': new_users_today,
            'new_users_week': new_users_week,
            
            # Vendors
            'total_vendors': total_vendors,
            'active_vendors': active_vendors,
            'pending_vendors': pending_vendors,
        }
        
        serializer = DashboardOverviewSerializer(data)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب إحصائيات لوحة التحكم / Dashboard stats retrieved')
        )


# =============================================================================
# Dashboard Sales Chart View
# عرض رسم بياني المبيعات
# =============================================================================

class DashboardSalesChartView(APIView):
    """
    Get sales chart data.
    الحصول على بيانات رسم بياني المبيعات.
    
    Supports different time periods:
    - week: Last 7 days
    - month: Last 30 days
    - year: Last 12 months
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Sales Chart Data',
        description='Get sales data for charts',
        parameters=[
            OpenApiParameter(
                name='period',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Time period: week, month, or year',
                enum=['week', 'month', 'year'],
                default='week'
            ),
        ],
        responses={
            200: SalesChartSerializer,
        },
        tags=['Admin Dashboard'],
    )
    def get(self, request):
        """
        Get sales chart data.
        الحصول على بيانات رسم بياني المبيعات.
        """
        from orders.models import Order
        
        period = request.query_params.get('period', 'week')
        now = timezone.now()
        
        # Determine date range and grouping
        # تحديد نطاق التاريخ والتجميع
        if period == 'week':
            start_date = now - timedelta(days=7)
            trunc_func = TruncDate
            date_format = '%Y-%m-%d'
        elif period == 'month':
            start_date = now - timedelta(days=30)
            trunc_func = TruncDate
            date_format = '%Y-%m-%d'
        else:  # year
            start_date = now - timedelta(days=365)
            trunc_func = TruncMonth
            date_format = '%Y-%m'
        
        # Query orders grouped by date
        # استعلام الطلبات مجمعة حسب التاريخ
        orders_data = Order.objects.filter(
            created_at__gte=start_date,
            status__in=['delivered', 'completed', 'processing', 'pending']
        ).annotate(
            date=trunc_func('created_at')
        ).values('date').annotate(
            revenue=Sum('total'),
            count=Count('id')
        ).order_by('date')
        
        # Build labels and data arrays
        # بناء مصفوفات التسميات والبيانات
        labels = []
        revenue = []
        orders = []
        
        for item in orders_data:
            labels.append(item['date'].strftime(date_format))
            revenue.append(str(item['revenue'] or Decimal('0.00')))
            orders.append(item['count'])
        
        data = {
            'labels': labels,
            'revenue': revenue,
            'orders': orders,
            'period': period,
        }
        
        serializer = SalesChartSerializer(data)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب بيانات الرسم البياني / Chart data retrieved')
        )


# =============================================================================
# Dashboard Recent Orders View
# عرض الطلبات الأخيرة
# =============================================================================

class DashboardRecentOrdersView(APIView):
    """
    Get recent orders for dashboard.
    الحصول على الطلبات الأخيرة للوحة التحكم.
    
    Returns the 10 most recent orders.
    يعيد آخر 10 طلبات.
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Recent Orders',
        description='Get the most recent orders',
        parameters=[
            OpenApiParameter(
                name='limit',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Number of orders to return (default: 10)',
                default=10
            ),
        ],
        responses={
            200: RecentOrderSerializer(many=True),
        },
        tags=['Admin Dashboard'],
    )
    def get(self, request):
        """
        Get recent orders.
        الحصول على الطلبات الأخيرة.
        """
        from orders.models import Order
        
        limit = int(request.query_params.get('limit', 10))
        limit = min(limit, 50)  # Max 50 orders
        
        orders = (
            Order.objects.select_related('user')
            .annotate(items_count=Count('items', distinct=True))
            .order_by('-created_at')[:limit]
        )
        
        # Build response data
        # بناء بيانات الاستجابة
        data = []
        
        # Status display mapping
        # ربط حالة العرض
        status_display_map = {
            'pending': _('قيد الانتظار / Pending'),
            'processing': _('قيد المعالجة / Processing'),
            'shipped': _('تم الشحن / Shipped'),
            'delivered': _('تم التوصيل / Delivered'),
            'cancelled': _('ملغي / Cancelled'),
            'completed': _('مكتمل / Completed'),
        }
        
        for order in orders:
            # Get customer name and email
            # الحصول على اسم العميل والبريد الإلكتروني
            if order.user:
                customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
                if not customer_name:
                    customer_name = order.user.email.split('@')[0]
                customer_email = order.user.email
            else:
                # Guest orders don't have email in Order model
                # الطلبات بدون تسجيل لا يوجد لها email في Order model
                customer_name = order.customer_name or _('ضيف / Guest')
                customer_email = None  # Guest orders have no email
            
            data.append({
                'id': order.id,
                'order_number': f"ORD-{order.id:06d}",
                'customer_name': customer_name,
                'customer_email': customer_email,
                'total': order.total,
                'status': order.status,
                'status_display': status_display_map.get(order.status, order.status),
                'items_count': getattr(order, 'items_count', 0),
                'created_at': order.created_at,
            })
        
        serializer = RecentOrderSerializer(data, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب الطلبات الأخيرة / Recent orders retrieved')
        )


# =============================================================================
# Dashboard Recent Activity View
# عرض النشاطات الأخيرة
# =============================================================================

class DashboardRecentActivityView(APIView):
    """
    Get recent activity log.
    الحصول على سجل النشاطات الأخيرة.
    
    Returns recent admin/system activities.
    يعيد النشاطات الإدارية/النظامية الأخيرة.
    """
    
    permission_classes = [IsAdminUser]
    throttle_classes = [AdminUserRateThrottle]
    
    @extend_schema(
        summary='Recent Activity',
        description='Get recent activity log',
        parameters=[
            OpenApiParameter(
                name='limit',
                type=int,
                location=OpenApiParameter.QUERY,
                description='Number of activities to return (default: 10)',
                default=10
            ),
        ],
        responses={
            200: RecentActivitySerializer(many=True),
        },
        tags=['Admin Dashboard'],
    )
    def get(self, request):
        """
        Get recent activity.
        الحصول على النشاطات الأخيرة.
        
        Returns activities from all system entities:
        - Orders (order_created)
        - Products (product_created)
        - Users (user_registered)
        - Vendors (vendor_created)
        - Categories (category_created)
        - Vendor Applications (vendor_application_created)
        
        يعيد الأنشطة من جميع كيانات النظام:
        - الطلبات
        - المنتجات
        - المستخدمين
        - البائعين
        - الفئات
        - طلبات الانضمام
        """
        from orders.models import Order
        from products.models import Product, Category
        from vendors.models import Vendor, VendorApplication
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        limit = int(request.query_params.get('limit', 50))
        limit = min(limit, 200)  # Increased max limit for comprehensive activity log
        
        activities = []
        SYSTEM_EMAIL = 'system@yallabuy.com'
        
        # Helper function to build activity dict
        # دالة مساعدة لبناء قاموس النشاط
        def build_activity(*, activity_id, user_name, user_email, action, action_display, target_ref, target_name, timestamp, ip_address=None):
            """Build activity payload; derive target_type/target_id from target_ref."""
            return {
                'id': activity_id,
                'user_name': user_name,
                'user_email': user_email,
                'action': action,
                'action_display': action_display,
                'target_ref': target_ref,
                'target_type': (target_ref or {}).get('type'),
                'target_id': (target_ref or {}).get('id'),
                'target_name': target_name,
                'timestamp': timestamp,
                'ip_address': ip_address,
            }
        
        # Calculate items per type (distribute limit across 6 types)
        # حساب العناصر لكل نوع (توزيع limit على 6 أنواع)
        items_per_type = max(limit // 6, 5)  # At least 5 items per type, or limit/6
        
        # 1. Recent orders as activities
        # الطلبات الأخيرة كنشاطات
        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:items_per_type]
        for order in recent_orders:
            # Get customer name and email
            # الحصول على اسم العميل والبريد الإلكتروني
            if order.user:
                customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
                if not customer_name:
                    customer_name = order.user.full_name or order.user.email.split('@')[0]
                customer_email = order.user.email
            else:
                # Guest orders don't have email in Order model
                # الطلبات بدون تسجيل لا يوجد لها email في Order model
                customer_name = order.customer_name or _('ضيف / Guest')
                customer_email = None  # Guest orders have no email
            
            activities.append(build_activity(
                activity_id=order.id,
                user_name=customer_name,
                user_email=customer_email,
                action='order_created',
                action_display=_('قام بإنشاء طلب جديد / Created a new order'),
                target_ref={'type': 'order', 'id': order.id, 'action': 'order_created'},
                target_name=f"ORD-{order.id:06d}",
                timestamp=order.created_at,
            ))
        
        # 2. Recent products as activities
        # المنتجات الأخيرة كنشاطات
        recent_products = Product.objects.select_related('vendor', 'category').order_by('-created_at')[:items_per_type]
        for product in recent_products:
            # Try to get vendor name or use system
            # محاولة الحصول على اسم البائع أو استخدام النظام
            user_name = _('النظام / System')
            user_email = SYSTEM_EMAIL
            if product.vendor:
                user_name = product.vendor.name
                user_email = SYSTEM_EMAIL
            
            activities.append(build_activity(
                activity_id=product.id + 10000,  # Offset to avoid ID conflicts
                user_name=user_name,
                user_email=user_email,
                action='product_created',
                action_display=_('تمت إضافة منتج جديد / New product added'),
                target_ref={'type': 'product', 'id': product.id, 'action': 'product_created'},
                target_name=product.name,
                timestamp=product.created_at,
            ))
        
        # 3. Recent users as activities
        # المستخدمين الجدد كنشاطات
        # Include all users (customers + staff + admins)
        # شمل جميع المستخدمين (العملاء + الموظفين + المدراء)
        recent_users = User.objects.order_by('-created_at')[:items_per_type]
        for user in recent_users:
            user_name = user.full_name or f"{user.first_name} {user.last_name}".strip()
            if not user_name:
                user_name = user.email.split('@')[0]
            
            activities.append(build_activity(
                activity_id=user.id + 20000,  # Offset to avoid ID conflicts
                user_name=user_name,
                user_email=user.email,
                action='user_registered',
                action_display=_('انضم مستخدم جديد / New user registered'),
                target_ref={'type': 'user', 'id': user.id, 'action': 'user_registered'},
                target_name=user_name,
                timestamp=user.created_at,
            ))
        
        # 4. Recent vendors as activities
        # البائعين الجدد كنشاطات
        recent_vendors = Vendor.objects.order_by('-created_at')[:items_per_type]
        for vendor in recent_vendors:
            activities.append(build_activity(
                activity_id=vendor.id + 30000,  # Offset to avoid ID conflicts
                user_name=_('الإدارة / Administration'),
                user_email=SYSTEM_EMAIL,
                action='vendor_created',
                action_display=_('تمت إضافة بائع جديد / New vendor added'),
                target_ref={'type': 'vendor', 'id': vendor.id, 'action': 'vendor_created'},
                target_name=vendor.name,
                timestamp=vendor.created_at,
            ))
        
        # 5. Recent categories as activities
        # الفئات الجديدة كنشاطات
        recent_categories = Category.objects.order_by('-created_at')[:items_per_type]
        for category in recent_categories:
            activities.append(build_activity(
                activity_id=category.id + 40000,  # Offset to avoid ID conflicts
                user_name=_('الإدارة / Administration'),
                user_email=SYSTEM_EMAIL,
                action='category_created',
                action_display=_('تمت إضافة فئة جديدة / New category added'),
                target_ref={'type': 'category', 'id': category.id, 'action': 'category_created'},
                target_name=category.name,
                timestamp=category.created_at,
            ))
        
        # 6. Recent vendor applications as activities
        # طلبات الانضمام الجديدة كنشاطات
        recent_applications = VendorApplication.objects.select_related('user').order_by('-created_at')[:items_per_type]
        for application in recent_applications:
            # Handle both authenticated and guest applications
            # معالجة الطلبات المسجلة وغير المسجلة
            if application.user:
                user_name = application.user.full_name or f"{application.user.first_name} {application.user.last_name}".strip()
                if not user_name:
                    user_name = application.user.email.split('@')[0]
                user_email = application.user.email
            else:
                # Guest application - use applicant info
                # طلب ضيف - استخدام معلومات المتقدم
                user_name = application.applicant_name or _('ضيف / Guest')
                user_email = application.applicant_email
            
            activities.append(build_activity(
                activity_id=application.id + 50000,  # Offset to avoid ID conflicts
                user_name=user_name,
                user_email=user_email,
                action='vendor_application_created',
                action_display=_('تم تقديم طلب انضمام جديد / New vendor application submitted'),
                target_ref={'type': 'vendor_application', 'id': application.id, 'action': 'vendor_application_created'},
                target_name=application.store_name or user_email,
                timestamp=application.created_at,
            ))
        
        # Sort by timestamp and limit
        # ترتيب حسب الوقت وتحديد العدد
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:limit]
        
        serializer = RecentActivitySerializer(activities, many=True)
        
        return success_response(
            data=serializer.data,
            message=_('تم جلب سجل النشاطات / Activity log retrieved')
        )

