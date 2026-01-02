"""
Vendor Order Views
عروض طلبات البائع

This module contains views for managing orders in the vendor panel.
هذا الملف يحتوي على عروض لإدارة الطلبات في لوحة البائع.

API Endpoints:
    GET    /api/v1/vendor/orders/                    - List all orders (with pagination, filters)
    GET    /api/v1/vendor/orders/{id}/               - Get order details
    PUT    /api/v1/vendor/orders/{id}/status/        - Update order status

Security:
    - All endpoints require vendor authentication
    - Returns orders only for the vendor's products
    - Status transitions are validated

الأمان:
    - جميع النقاط تتطلب مصادقة البائع
    - يعيد الطلبات فقط لمنتجات البائع
    - يتم التحقق من انتقالات الحالة
"""

from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiParameter

from vendor_api.permissions import IsVendorUser, IsVendorOwner
from vendor_api.throttling import VendorUserRateThrottle
from vendor_api.serializers.orders import (
    VendorOrderListSerializer,
    VendorOrderDetailSerializer,
    VendorOrderStatusUpdateSerializer,
)
from orders.models import Order, OrderItem
from users.models import VendorUser
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination
import hashlib


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def generate_customer_key(vendor_id: int, user_id: int = None, guest_identifier: str = None) -> str:
    """
    Generate a unique customer key for vendor-specific customer identification.
    إنشاء مفتاح عميل فريد لتحديد هوية العميل الخاص بالبائع.
    
    Args:
        vendor_id: Vendor ID
        user_id: User ID (for authenticated customers)
        guest_identifier: Guest identifier (for guest orders)
    
    Returns:
        Unique customer key (hash)
    """
    if user_id:
        # Authenticated customer: hash(vendor_id + user_id)
        raw_key = f"vendor_{vendor_id}_user_{user_id}"
    elif guest_identifier:
        # Guest customer: hash(vendor_id + guest_identifier)
        raw_key = f"vendor_{vendor_id}_guest_{guest_identifier}"
    else:
        # Fallback: should not happen
        raw_key = f"vendor_{vendor_id}_unknown"
    
    # Generate SHA256 hash and take first 16 characters
    # إنشاء hash SHA256 وأخذ أول 16 حرف
    hash_obj = hashlib.sha256(raw_key.encode())
    return hash_obj.hexdigest()[:16]


# =============================================================================
# Order List View
# عرض قائمة الطلبات
# =============================================================================

class VendorOrderListView(APIView):
    """
    List all orders for the vendor with filtering and pagination.
    عرض جميع الطلبات للبائع مع التصفية والترقيم.
    
    Returns only orders that contain products from this vendor.
    يعيد فقط الطلبات التي تحتوي على منتجات من هذا البائع.
    
    Supports:
        - Search by order number, customer name
        - Filter by status, date range
        - Pagination
        - Sorting
    
    يدعم:
        - البحث برقم الطلب، اسم العميل
        - التصفية حسب الحالة، نطاق التاريخ
        - الترقيم
        - الترتيب
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='List Vendor Orders',
        description='Get all orders for this vendor with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by order number, customer name'),
            OpenApiParameter(name='status', type=str, description='Filter by status (pending, confirmed, shipped, delivered, cancelled)'),
            OpenApiParameter(name='customer_key', type=str, description='Filter by customer key (from customers API)'),
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
            OpenApiParameter(name='sort_by', type=str, description='Sort field (created_at, total, status)'),
            OpenApiParameter(name='sort_dir', type=str, description='Sort direction (asc, desc)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='page_size', type=int, description='Items per page'),
        ],
        tags=['Vendor Orders'],
    )
    def get(self, request):
        """
        List all orders for the vendor.
        عرض جميع الطلبات للبائع.
        """
        # Get vendor associated with the authenticated user
        # الحصول على البائع المرتبط بالمستخدم المسجل
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get orders for this vendor (using denormalized vendor field - no deep JOINs needed)
        # الحصول على الطلبات لهذا البائع (باستخدام حقل vendor المطبيع - لا حاجة لـ JOINs عميقة)
        queryset = Order.objects.filter(
            vendor=vendor
        ).select_related('user', 'vendor').prefetch_related(
            'items',
            'items__product_variant',
            'items__product_variant__product',
        )
        
        # =================================================================
        # Search Filter
        # فلتر البحث
        # =================================================================
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(order_number__icontains=search) |
                Q(customer_name__icontains=search)
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
        # Customer Key Filter
        # فلتر مفتاح العميل
        # =================================================================
        customer_key_filter = request.query_params.get('customer_key', '').strip()
        if customer_key_filter:
            # Filter orders by customer_key
            # We need to match orders where the customer_key matches
            # تصفية الطلبات حسب customer_key
            # نحتاج لمطابقة الطلبات حيث customer_key يطابق
            filtered_order_ids = []
            for order in queryset:
                # Calculate customer_key for this order
                # حساب customer_key لهذا الطلب
                if order.user:
                    customer_key = generate_customer_key(vendor.id, order.user.id)
                else:
                    guest_identifier = order.customer_name or order.customer_phone or f"guest_{order.id}"
                    customer_key = generate_customer_key(vendor.id, None, guest_identifier)
                
                if customer_key == customer_key_filter:
                    filtered_order_ids.append(order.id)
            
            # Filter queryset to only include matching orders
            # تصفية queryset لتشمل فقط الطلبات المطابقة
            if filtered_order_ids:
                queryset = queryset.filter(id__in=filtered_order_ids)
            else:
                # No matching orders
                # لا توجد طلبات مطابقة
                queryset = queryset.none()
        
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
                pass
        
        if date_to:
            try:
                queryset = queryset.filter(created_at__date__lte=date_to)
            except ValueError:
                pass
        
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
        
        # Build response data with vendor-specific totals
        # بناء بيانات الاستجابة مع الإجماليات الخاصة بالبائع
        if page is not None:
            data = self._build_order_list_data(page, vendor_order_items)
            # Return data directly (already validated and formatted)
            # إرجاع البيانات مباشرة (محققة ومنسقة بالفعل)
            return paginator.get_paginated_response(data)
        
        data = self._build_order_list_data(queryset, vendor_order_items)
        # Return data directly (already validated and formatted)
        # إرجاع البيانات مباشرة (محققة ومنسقة بالفعل)
        return success_response(data=data)
    
    def _build_order_list_data(self, orders, vendor_order_items):
        """Build order list data with vendor-specific totals"""
        data = []
        
        # Status display mapping
        # ربط حالة العرض
        status_display_map = {
            'pending': _('قيد الانتظار / Pending'),
            'confirmed': _('مؤكد / Confirmed'),
            'shipped': _('تم الشحن / Shipped'),
            'delivered': _('تم التسليم / Delivered'),
            'cancelled': _('ملغي / Cancelled'),
        }
        
        for order in orders:
            # Get customer name
            # الحصول على اسم العميل
            if order.user:
                customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
                if not customer_name:
                    customer_name = order.user.email.split('@')[0] if order.user.email else _('مستخدم / User')
                # Calculate customer_key for authenticated customer
                # حساب customer_key للعميل المسجل
                customer_key = generate_customer_key(vendor.id, order.user.id)
            else:
                customer_name = order.customer_name or _('ضيف / Guest')
                # Calculate customer_key for guest customer
                # حساب customer_key للعميل الضيف
                guest_identifier = order.customer_name or order.customer_phone or f"guest_{order.id}"
                customer_key = generate_customer_key(vendor.id, None, guest_identifier)
            
            # Calculate total for this vendor's items only
            # حساب الإجمالي لعناصر هذا البائع فقط
            vendor_items = vendor_order_items.filter(order=order)
            vendor_total = sum(
                Decimal(str(item.price)) * Decimal(str(item.quantity))
                for item in vendor_items
            ) or Decimal('0.00')
            
            # Count vendor items
            # عد عناصر البائع
            vendor_items_count = vendor_items.count()
            
            data.append({
                'id': order.id,
                'order_number': order.order_number or f"ORD-{order.id:06d}",
                'customer_name': customer_name,
                'customer_key': customer_key,
                'total': str(vendor_total),
                'status': order.status,
                'status_display': status_display_map.get(order.status, order.status),
                'items_count': vendor_items_count,
                'created_at': order.created_at,
            })
        
        return data


# =============================================================================
# Order Detail View
# عرض تفاصيل الطلب
# =============================================================================

class VendorOrderDetailView(APIView):
    """
    Get order details for the vendor.
    الحصول على تفاصيل الطلب للبائع.
    
    Returns only the vendor's items from the order.
    يعيد فقط عناصر البائع من الطلب.
    """
    
    permission_classes = [IsVendorUser, IsVendorOwner]
    throttle_classes = [VendorUserRateThrottle]
    
    @extend_schema(
        summary='Get Order Details',
        description='Get detailed information about a specific order',
        tags=['Vendor Orders'],
    )
    def get(self, request, pk):
        """
        Get order details.
        الحصول على تفاصيل الطلب.
        """
        # Get vendor associated with the authenticated user
        # الحصول على البائع المرتبط بالمستخدم المسجل
        try:
            vendor_user = VendorUser.objects.select_related('vendor').get(user=request.user)
            vendor = vendor_user.vendor
        except VendorUser.DoesNotExist:
            return error_response(
                message=_('لا يوجد بائع مرتبط بهذا المستخدم / No vendor associated with this user')
            )
        
        # Get order
        # الحصول على الطلب
        try:
            order = Order.objects.select_related('user', 'vendor').prefetch_related(
                'items',
                'items__product_variant',
                'items__product_variant__product',
            ).get(id=pk)
        except Order.DoesNotExist:
            return error_response(
                message=_('الطلب غير موجود / Order not found'),
                status_code=404
            )
        
        # Check if order belongs to this vendor (using denormalized vendor field)
        # التحقق من أن الطلب ينتمي لهذا البائع (باستخدام حقل vendor المطبيع)
        if order.vendor != vendor:
            return error_response(
                message=_('هذا الطلب لا يحتوي على منتجات من متجرك / This order does not contain products from your store'),
                status_code=403
            )
        
        # Get order items for this vendor (using denormalized vendor field)
        # الحصول على عناصر الطلب لهذا البائع (باستخدام حقل vendor المطبيع)
        vendor_order_items = OrderItem.objects.filter(
            order=order,
            vendor=vendor
        )
        
        # Build order detail data
        # بناء بيانات تفاصيل الطلب
        data = self._build_order_detail_data(order, vendor_order_items, vendor)
        
        # Return data directly (already validated and formatted)
        # إرجاع البيانات مباشرة (محققة ومنسقة بالفعل)
        return success_response(
            data=data,
            message=_('تم جلب تفاصيل الطلب / Order details retrieved')
        )
    
    def _build_order_detail_data(self, order, vendor_order_items, vendor):
        """Build order detail data with vendor-specific information"""
        # Get customer information
        # الحصول على معلومات العميل
        if order.user:
            customer_name = f"{order.user.first_name} {order.user.last_name}".strip()
            if not customer_name:
                customer_name = order.user.email.split('@')[0] if order.user.email else _('مستخدم / User')
            customer_email = order.user.email
            customer_phone = getattr(order.user, 'phone', None)
        else:
            customer_name = order.customer_name or _('ضيف / Guest')
            customer_email = None
            customer_phone = order.customer_phone
        
        # Calculate vendor totals
        # حساب إجماليات البائع
        vendor_subtotal = sum(
            Decimal(str(item.price)) * Decimal(str(item.quantity))
            for item in vendor_order_items
        ) or Decimal('0.00')
        
        # Build items data
        # بناء بيانات العناصر
        items_data = []
        for item in vendor_order_items:
            product = item.product_variant.product
            items_data.append({
                'id': item.id,
                'product_name': product.name,
                'variant_name': f"{item.product_variant.color or ''} {item.product_variant.size or ''}".strip(),
                'quantity': item.quantity,
                'price': str(item.price),
                'subtotal': str(Decimal(str(item.price)) * Decimal(str(item.quantity))),
                'product_image': product.main_image.url if product.main_image else None,
            })
        
        # Status display mapping
        # ربط حالة العرض
        status_display_map = {
            'pending': _('قيد الانتظار / Pending'),
            'confirmed': _('مؤكد / Confirmed'),
            'shipped': _('تم الشحن / Shipped'),
            'delivered': _('تم التسليم / Delivered'),
            'cancelled': _('ملغي / Cancelled'),
        }
        
        return {
            'id': order.id,
            'order_number': order.order_number or f"ORD-{order.id:06d}",
            'status': order.status,
            'status_display': status_display_map.get(order.status, order.status),
            'order_type': order.order_type,
            'customer_name': customer_name,
            'customer_email': customer_email,
            'customer_phone': customer_phone,
            'customer_address': order.customer_address,
            'subtotal': str(vendor_subtotal),
            'items': items_data,
            'items_count': len(items_data),
            'created_at': order.created_at,
            'updated_at': order.updated_at,
            'notes': order.notes,
        }

