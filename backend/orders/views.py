"""
Order Views - API Endpoints
عروض الطلبات - نقاط نهاية الـ API

This module defines API views for order management.
هذا الوحدة يعرّف عروض API لإدارة الطلبات.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer,
)
from users.permissions import IsCustomer, IsVendor, IsAdmin
from .permissions import IsVendorOrAdmin


# ============================================================================
# Order ViewSet
# ViewSet للطلبات
# ============================================================================

class OrderViewSet(viewsets.ModelViewSet):
    """
    Order Management ViewSet
    ViewSet لإدارة الطلبات
    
    Endpoints:
    - POST /api/v1/orders/ - Create new order (customers, guests)
    - GET /api/v1/orders/ - List orders (filtered by user role)
    - GET /api/v1/orders/{id}/ - Get order details
    - PATCH /api/v1/orders/{id}/update_status/ - Update order status (vendors/admins)
    
    Permissions:
    - Customers: Can create orders and view their own orders
    - Vendors: Can view orders for their products and update status
    - Admins: Can view all orders and update any order status
    - Guests: Can create orders (but cannot view them later without login)
    """
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter fields
    filterset_fields = [
        'status',
        'order_type',
        'is_guest_order',
    ]
    
    # Search fields
    search_fields = [
        'order_number',
        'customer_name',
        'customer_phone',
    ]
    
    # Ordering fields
    ordering_fields = [
        'created_at',
        'total',
        'status',
    ]
    ordering = ['-created_at']  # Default: newest first
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        إرجاع المسلسل المناسب حسب الإجراء
        """
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return OrderSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action
        تعيين الصلاحيات حسب الإجراء
        """
        if self.action == 'create':
            # Anyone can create orders (customers and guests)
            # أي شخص يمكنه إنشاء طلبات (العملاء والضيوف)
            return [AllowAny()]
        elif self.action in ['list', 'retrieve']:
            # Authenticated users can view orders
            # المستخدمون المسجلون يمكنهم عرض الطلبات
            return [IsAuthenticated()]
        elif self.action == 'update_status':
            # Only vendors and admins can update order status
            # فقط البائعون والمسؤولون يمكنهم تحديث حالة الطلب
            return [IsAuthenticated(), IsVendorOrAdmin()]
        # Default: authenticated users
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter queryset based on user role
        تصفية queryset حسب دور المستخدم
        
        - Customers: Only their own orders
        - Vendors: Only orders containing their products
        - Admins: All orders
        """
        user = self.request.user
        
        if not user.is_authenticated:
            return Order.objects.none()
        
        # Admin can see all orders
        # المسؤول يمكنه رؤية جميع الطلبات
        if user.role == 'admin' or user.is_superuser:
            return Order.objects.all().prefetch_related('items', 'items__product_variant', 'items__product_variant__product')
        
        # Customer can see only their own orders
        # العميل يمكنه رؤية طلباته فقط
        if user.role == 'customer':
            return Order.objects.filter(user=user).prefetch_related('items', 'items__product_variant', 'items__product_variant__product')
        
        # Vendor can see orders for their vendor (using denormalized vendor field)
        # البائع يمكنه رؤية الطلبات لبائعه (باستخدام حقل vendor المطبيع)
        if user.role == 'vendor':
            # Get vendor IDs associated with this user
            # الحصول على معرفات البائعين المرتبطة بهذا المستخدم
            from users.models import VendorUser
            vendor_ids = VendorUser.objects.filter(user=user).values_list('vendor_id', flat=True)
            
            if not vendor_ids:
                return Order.objects.none()
            
            # Get orders for this vendor (using denormalized vendor field - no deep JOINs needed)
            # الحصول على الطلبات لهذا البائع (باستخدام حقل vendor المطبيع - لا حاجة لـ JOINs عميقة)
            return Order.objects.filter(
                vendor_id__in=vendor_ids
            ).select_related('vendor').prefetch_related('items', 'items__product_variant', 'items__product_variant__product')
        
        return Order.objects.none()
    
    def create(self, request, *args, **kwargs):
        """
        Create a new order
        إنشاء طلب جديد
        
        Supports both authenticated users and guest orders.
        يدعم المستخدمين المسجلين والطلبات بدون تسجيل دخول.
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return success_response(
            data=OrderSerializer(order, context={'request': request}).data,
            message='Order created successfully.',
            status_code=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Update order status
        تحديث حالة الطلب
        
        Only vendors (for their products) and admins can update status.
        فقط البائعون (لمنتجاتهم) والمسؤولون يمكنهم تحديث الحالة.
        
        PATCH /api/v1/orders/{id}/update-status/
        Body: {"status": "confirmed"}
        """
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Check permissions
        # التحقق من الصلاحيات
        user = request.user
        
        # Admin can update any order
        # المسؤول يمكنه تحديث أي طلب
        if user.role == 'admin' or user.is_superuser:
            serializer.save()
            return success_response(
                data=OrderSerializer(order, context={'request': request}).data,
                message='Order status updated successfully.',
                status_code=status.HTTP_200_OK
            )
        
        # Vendor can only update orders containing their products
        # البائع يمكنه تحديث الطلبات التي تحتوي على منتجاته فقط
        if user.role == 'vendor':
            from users.models import VendorUser
            vendor_ids = VendorUser.objects.filter(user=user).values_list('vendor_id', flat=True)
            
            # Check if order belongs to this vendor (using denormalized vendor field)
            # التحقق من إذا كان الطلب ينتمي لهذا البائع (باستخدام حقل vendor المطبيع)
            if order.vendor_id not in vendor_ids:
                return error_response(
                    message='You do not have permission to update this order.',
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            serializer.save()
            return success_response(
                data=OrderSerializer(order, context={'request': request}).data,
                message='Order status updated successfully.',
                status_code=status.HTTP_200_OK
            )
        
        return error_response(
            message='You do not have permission to update order status.',
            status_code=status.HTTP_403_FORBIDDEN
        )

