"""
Admin Order Views
عروض الطلبات للإدارة

This module contains views for managing orders in the admin panel.
هذا الملف يحتوي على عروض لإدارة الطلبات في لوحة الإدارة.

API Endpoints:
    GET    /api/v1/admin/orders/                    - List all orders (with pagination, filters)
    GET    /api/v1/admin/orders/{id}/               - Get order details
    PUT    /api/v1/admin/orders/{id}/status/        - Update order status
    POST   /api/v1/admin/orders/bulk-action/        - Bulk status updates
    GET    /api/v1/admin/orders/stats/              - Order statistics

Security:
    - All endpoints require admin authentication
    - Status transitions are validated
    - Bulk actions validate each order individually

الأمان:
    - جميع النقاط تتطلب مصادقة الأدمن
    - يتم التحقق من انتقالات الحالة
    - العمليات المجمعة تتحقق من كل طلب على حدة

Author: Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.orders import (
    AdminOrderListSerializer,
    AdminOrderDetailSerializer,
    AdminOrderStatusUpdateSerializer,
    AdminOrderBulkActionSerializer,
)
from orders.models import Order, OrderItem
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Order List View
# عرض قائمة الطلبات
# =============================================================================

class AdminOrderListView(APIView):
    """
    List all orders with filtering and pagination.
    عرض جميع الطلبات مع التصفية والترقيم.
    
    Supports:
        - Search by order number, customer name, phone
        - Filter by status, order type, date range
        - Pagination
        - Sorting
    
    يدعم:
        - البحث برقم الطلب، اسم العميل، الهاتف
        - التصفية حسب الحالة، نوع الطلب، نطاق التاريخ
        - الترقيم
        - الترتيب
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='List Orders',
        description='Get all orders with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by order number, customer name, phone'),
            OpenApiParameter(name='status', type=str, description='Filter by status (pending, confirmed, shipped, delivered, cancelled)'),
            OpenApiParameter(name='order_type', type=str, description='Filter by order type (online, pos)'),
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
            OpenApiParameter(name='is_guest', type=bool, description='Filter by guest orders'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (created_at, total, status)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        responses={200: AdminOrderListSerializer(many=True)},
        tags=['Admin Orders'],
    )
    def get(self, request):
        """
        List all orders with filtering and pagination.
        عرض جميع الطلبات مع التصفية والترقيم.
        """
        # Start with all orders, prefetch items for performance
        # البدء بجميع الطلبات، مع جلب العناصر مسبقاً للأداء
        queryset = Order.objects.select_related('user').prefetch_related(
            'items',
            'items__product_variant',
            'items__product_variant__product',
            'items__product_variant__product__vendor',
        )
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer_phone__icontains=search)
            )
        
        # =================================================================
        # Status Filter
        # فلتر الحالة
        # =================================================================
        status_filter = request.query_params.get('status')
        if status_filter:
            # Support multiple statuses (comma-separated)
            # دعم حالات متعددة (مفصولة بفاصلة)
            statuses = [s.strip() for s in status_filter.split(',')]
            valid_statuses = [s for s in statuses if s in dict(Order.STATUS_CHOICES)]
            if valid_statuses:
                queryset = queryset.filter(status__in=valid_statuses)
        
        # =================================================================
        # Order Type Filter
        # فلتر نوع الطلب
        # =================================================================
        order_type = request.query_params.get('order_type')
        if order_type and order_type in dict(Order.ORDER_TYPES):
            queryset = queryset.filter(order_type=order_type)
        
        # =================================================================
        # Date Range Filter
        # فلتر نطاق التاريخ
        # =================================================================
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            try:
                queryset = queryset.filter(created_at__date__gte=date_from)
            except ValueError:
                pass  # Invalid date format, ignore
        
        if date_to:
            try:
                queryset = queryset.filter(created_at__date__lte=date_to)
            except ValueError:
                pass  # Invalid date format, ignore
        
        # =================================================================
        # Guest Order Filter
        # فلتر الطلبات بدون تسجيل
        # =================================================================
        is_guest = request.query_params.get('is_guest')
        if is_guest is not None:
            is_guest_bool = is_guest.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_guest_order=is_guest_bool)
        
        # =================================================================
        # Sorting
        # الترتيب
        # =================================================================
        sort_by = request.query_params.get('sort_by', 'created_at')
        sort_dir = request.query_params.get('sort_dir', 'desc')
        
        sort_fields = {
            'created_at': 'created_at',
            'total': 'total',
            'status': 'status',
            'order_number': 'order_number',
        }
        
        if sort_by in sort_fields:
            order_field = sort_fields[sort_by]
            if sort_dir == 'desc':
                order_field = f'-{order_field}'
            queryset = queryset.order_by(order_field)
        else:
            queryset = queryset.order_by('-created_at')
        
        # =================================================================
        # Pagination
        # الترقيم
        # =================================================================
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminOrderListSerializer(
                page,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminOrderListSerializer(
            queryset,
            many=True,
            context={'request': request}
        )
        return success_response(data=serializer.data)


# =============================================================================
# Order Detail View
# عرض تفاصيل الطلب
# =============================================================================

class AdminOrderDetailView(APIView):
    """
    Get order details.
    الحصول على تفاصيل الطلب.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """
        Get order by ID with related data
        الحصول على الطلب بمعرفه مع البيانات المرتبطة
        """
        try:
            return Order.objects.select_related('user').prefetch_related(
                'items',
                'items__product_variant',
                'items__product_variant__product',
                'items__product_variant__product__vendor',
            ).get(pk=pk)
        except Order.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Order Details',
        description='Get complete order details including all items',
        responses={200: AdminOrderDetailSerializer},
        tags=['Admin Orders'],
    )
    def get(self, request, pk):
        """
        Get order details.
        الحصول على تفاصيل الطلب.
        """
        order = self.get_object(pk)
        
        if not order:
            return error_response(
                message=_('الطلب غير موجود / Order not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminOrderDetailSerializer(
            order,
            context={'request': request}
        )
        return success_response(data=serializer.data)


# =============================================================================
# Order Status Update View
# عرض تحديث حالة الطلب
# =============================================================================

class AdminOrderStatusUpdateView(APIView):
    """
    Update order status.
    تحديث حالة الطلب.
    
    Security:
        - Validates status transitions
        - Prevents invalid transitions
        - Logs status changes (TODO)
    
    الأمان:
        - يتحقق من انتقالات الحالة
        - يمنع الانتقالات غير الصالحة
        - يسجل تغييرات الحالة (مهمة مستقبلية)
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get order by ID"""
        try:
            return Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Update Order Status',
        description='Update the status of an order with validation',
        request=AdminOrderStatusUpdateSerializer,
        responses={200: AdminOrderDetailSerializer},
        tags=['Admin Orders'],
    )
    def put(self, request, pk):
        """
        Update order status.
        تحديث حالة الطلب.
        """
        order = self.get_object(pk)
        
        if not order:
            return error_response(
                message=_('الطلب غير موجود / Order not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Validate and update
        # التحقق والتحديث
        serializer = AdminOrderStatusUpdateSerializer(
            data=request.data,
            context={'request': request, 'order': order}
        )
        
        if serializer.is_valid():
            old_status = order.status
            serializer.update(order, serializer.validated_data)
            new_status = order.status
            
            # Return updated order details
            # إرجاع تفاصيل الطلب المحدثة
            detail_serializer = AdminOrderDetailSerializer(
                order,
                context={'request': request}
            )
            
            return success_response(
                data=detail_serializer.data,
                message=_(f'تم تحديث حالة الطلب من "{old_status}" إلى "{new_status}" / Status updated from "{old_status}" to "{new_status}"')
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Order Bulk Action View
# عرض العمليات المجمعة للطلبات
# =============================================================================

class AdminOrderBulkActionView(APIView):
    """
    Perform bulk actions on multiple orders.
    تنفيذ عمليات مجمعة على عدة طلبات.
    
    Supported Actions:
        - confirm: Confirm pending orders
        - ship: Mark orders as shipped
        - deliver: Mark orders as delivered
        - cancel: Cancel orders
    
    العمليات المدعومة:
        - confirm: تأكيد الطلبات المعلقة
        - ship: تحديد الطلبات كمشحونة
        - deliver: تحديد الطلبات كمسلمة
        - cancel: إلغاء الطلبات
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Bulk Order Actions',
        description='Perform bulk actions (confirm, ship, deliver, cancel) on multiple orders',
        request=AdminOrderBulkActionSerializer,
        responses={200: None},
        tags=['Admin Orders'],
    )
    @transaction.atomic
    def post(self, request):
        """
        Perform bulk action on orders.
        تنفيذ عملية مجمعة على الطلبات.
        """
        serializer = AdminOrderBulkActionSerializer(data=request.data)
        
        if serializer.is_valid():
            order_ids = serializer.validated_data['order_ids']
            target_status = serializer.validated_data['target_status']
            
            # Update all orders
            # تحديث جميع الطلبات
            updated_count = Order.objects.filter(pk__in=order_ids).update(
                status=target_status,
                updated_at=timezone.now()
            )
            
            # Get action label for message
            # الحصول على تسمية العملية للرسالة
            action_labels = {
                'confirmed': _('تأكيد / confirmed'),
                'shipped': _('شحن / shipped'),
                'delivered': _('تسليم / delivered'),
                'cancelled': _('إلغاء / cancelled'),
            }
            action_label = action_labels.get(target_status, target_status)
            
            return success_response(
                message=_(f'تم {action_label} {updated_count} طلب / {updated_count} orders {action_label}'),
                data={'affected_count': updated_count}
            )
        
        return error_response(
            message=_('بيانات غير صالحة / Invalid data'),
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# =============================================================================
# Order Statistics View
# عرض إحصائيات الطلبات
# =============================================================================

class AdminOrderStatsView(APIView):
    """
    Get order statistics for admin dashboard.
    الحصول على إحصائيات الطلبات للوحة الإدارة.
    
    Returns:
        - Total orders count by status
        - Today's orders
        - Revenue statistics
    
    يُرجع:
        - إجمالي عدد الطلبات حسب الحالة
        - طلبات اليوم
        - إحصائيات الإيرادات
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Order Statistics',
        description='Get order statistics for admin dashboard',
        responses={200: None},
        tags=['Admin Orders'],
    )
    def get(self, request):
        """
        Get order statistics.
        الحصول على إحصائيات الطلبات.
        """
        today = timezone.now().date()
        
        # Orders count by status
        # عدد الطلبات حسب الحالة
        status_counts = Order.objects.values('status').annotate(
            count=Count('id')
        )
        status_dict = {item['status']: item['count'] for item in status_counts}
        
        # Today's orders
        # طلبات اليوم
        today_orders = Order.objects.filter(created_at__date=today)
        today_count = today_orders.count()
        today_revenue = today_orders.filter(
            status__in=['confirmed', 'shipped', 'delivered']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Total revenue (all time)
        # إجمالي الإيرادات (كل الوقت)
        total_revenue = Order.objects.filter(
            status__in=['confirmed', 'shipped', 'delivered']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Pending orders that need attention
        # الطلبات المعلقة التي تحتاج انتباه
        pending_count = status_dict.get('pending', 0)
        
        stats = {
            'by_status': {
                'pending': status_dict.get('pending', 0),
                'confirmed': status_dict.get('confirmed', 0),
                'shipped': status_dict.get('shipped', 0),
                'delivered': status_dict.get('delivered', 0),
                'cancelled': status_dict.get('cancelled', 0),
            },
            'today': {
                'count': today_count,
                'revenue': float(today_revenue),
            },
            'total': {
                'count': Order.objects.count(),
                'revenue': float(total_revenue),
            },
            'needs_attention': pending_count,
        }
        
        return success_response(data=stats)

