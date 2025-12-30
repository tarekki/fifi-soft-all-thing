"""
Admin Cart Views
عروض السلة للإدارة

This module contains views for managing carts in the admin panel.
هذا الملف يحتوي على عروض لإدارة السلل في لوحة الإدارة.

API Endpoints:
    GET    /api/v1/admin/carts/                    - List all carts (with pagination, filters)
    GET    /api/v1/admin/carts/{id}/               - Get cart details
    POST   /api/v1/admin/carts/{id}/add_item/      - Add item to user's cart
    PATCH  /api/v1/admin/carts/{id}/items/{item_id}/ - Update item in user's cart
    DELETE /api/v1/admin/carts/{id}/items/{item_id}/ - Remove item from user's cart
    DELETE /api/v1/admin/carts/{id}/clear/        - Clear user's cart
    DELETE /api/v1/admin/carts/{id}/               - Delete cart
    GET    /api/v1/admin/carts/stats/              - Cart statistics

Security:
    - All endpoints require admin authentication
    - Admin can view and modify any user's cart
    - All operations are logged for audit

الأمان:
    - جميع النقاط تتطلب مصادقة الأدمن
    - المسؤول يمكنه عرض وتعديل أي سلة مستخدم
    - جميع العمليات مسجلة للمراجعة

Author: Yalla Buy Team
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum, Count, Avg
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiParameter

from admin_api.permissions import IsAdminUser
from admin_api.serializers.carts import (
    AdminCartListSerializer,
    AdminCartDetailSerializer,
    AdminCartItemAddSerializer,
    AdminCartItemUpdateSerializer,
    AdminCartStatisticsSerializer,
)
from cart.models import Cart, CartItem
from products.models import ProductVariant
from core.utils import success_response, error_response
from core.pagination import StandardResultsSetPagination


# =============================================================================
# Cart List View
# عرض قائمة السلل
# =============================================================================

class AdminCartListView(APIView):
    """
    List all carts with filtering and pagination.
    عرض جميع السلل مع التصفية والترقيم.
    
    Supports:
        - Search by user email, session key
        - Filter by user, guest/authenticated, date range
        - Pagination
        - Sorting
    
    يدعم:
        - البحث بالبريد الإلكتروني للمستخدم، مفتاح الجلسة
        - التصفية حسب المستخدم، ضيف/مسجل، نطاق التاريخ
        - الترقيم
        - الترتيب
    """
    
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    
    @extend_schema(
        summary='List Carts',
        description='Get all carts with optional filtering and pagination',
        parameters=[
            OpenApiParameter(name='search', type=str, description='Search by user email, session key'),
            OpenApiParameter(name='user_id', type=int, description='Filter by user ID'),
            OpenApiParameter(name='is_guest', type=bool, description='Filter by guest/authenticated'),
            OpenApiParameter(name='date_from', type=str, description='Filter by date from (YYYY-MM-DD)'),
            OpenApiParameter(name='date_to', type=str, description='Filter by date to (YYYY-MM-DD)'),
            OpenApiParameter(name='page', type=int, description='Page number'),
            OpenApiParameter(name='ordering', type=str, description='Order by field (e.g., -created_at, subtotal)'),
        ],
        responses={200: AdminCartListSerializer(many=True)},
        tags=['Admin Carts'],
    )
    def get(self, request):
        """
        Get all carts with filtering and pagination.
        الحصول على جميع السلل مع التصفية والترقيم.
        """
        queryset = Cart.objects.select_related('user').prefetch_related('items', 'items__variant', 'items__variant__product').all()
        
        # Search
        # البحث
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__email__icontains=search) |
                Q(session_key__icontains=search)
            )
        
        # Filter by user
        # التصفية حسب المستخدم
        user_id = request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by guest/authenticated
        # التصفية حسب ضيف/مسجل
        is_guest = request.query_params.get('is_guest', None)
        if is_guest is not None:
            is_guest_bool = is_guest.lower() in ('true', '1', 'yes')
            if is_guest_bool:
                queryset = queryset.filter(user__isnull=True)
            else:
                queryset = queryset.filter(user__isnull=False)
        
        # Filter by date range
        # التصفية حسب نطاق التاريخ
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        # Ordering
        # الترتيب
        ordering = request.query_params.get('ordering', '-updated_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        # Pagination
        # الترقيم
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = AdminCartListSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = AdminCartListSerializer(queryset, many=True, context={'request': request})
        return success_response(data=serializer.data)


# =============================================================================
# Cart Detail View
# عرض تفاصيل السلة
# =============================================================================

class AdminCartDetailView(APIView):
    """
    Get, update, or delete a specific cart.
    الحصول على، تحديث، أو حذف سلة محددة.
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get cart by ID"""
        try:
            return Cart.objects.select_related('user').prefetch_related(
                'items',
                'items__variant',
                'items__variant__product',
                'items__variant__product__vendor'
            ).get(pk=pk)
        except Cart.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Get Cart Details',
        description='Get complete cart details including all items',
        responses={200: AdminCartDetailSerializer},
        tags=['Admin Carts'],
    )
    def get(self, request, pk):
        """
        Get cart details.
        الحصول على تفاصيل السلة.
        """
        cart = self.get_object(pk)
        if not cart:
            return error_response(
                message=_('السلة غير موجودة / Cart not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCartDetailSerializer(cart, context={'request': request})
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary='Delete Cart',
        description='Delete a cart (use with caution)',
        responses={200: {'description': 'Cart deleted successfully'}},
        tags=['Admin Carts'],
    )
    def delete(self, request, pk):
        """
        Delete cart.
        حذف السلة.
        
        Warning: This will permanently delete the cart and all its items.
        تحذير: سيتم حذف السلة وعناصرها نهائياً.
        """
        cart = self.get_object(pk)
        if not cart:
            return error_response(
                message=_('السلة غير موجودة / Cart not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        cart.delete()
        return success_response(
            message=_('تم حذف السلة بنجاح / Cart deleted successfully')
        )


# =============================================================================
# Cart Item Management Views
# عروض إدارة عناصر السلة
# =============================================================================

class AdminCartAddItemView(APIView):
    """
    Add item to user's cart (Admin can add items to any cart).
    إضافة عنصر لسلة مستخدم (المسؤول يمكنه إضافة عناصر لأي سلة).
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get cart by ID"""
        try:
            return Cart.objects.select_related('user').get(pk=pk)
        except Cart.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Add Item to Cart',
        description='Add item to user\'s cart (Admin operation)',
        request=AdminCartItemAddSerializer,
        responses={200: AdminCartDetailSerializer},
        tags=['Admin Carts'],
    )
    def post(self, request, pk):
        """
        Add item to cart.
        إضافة عنصر للسلة.
        """
        cart = self.get_object(pk)
        if not cart:
            return error_response(
                message=_('السلة غير موجودة / Cart not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCartItemAddSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message=_('بيانات غير صحيحة / Invalid data'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        variant_id = serializer.validated_data['variant_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            variant = ProductVariant.objects.select_related('product').get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return error_response(
                message=_('متغير المنتج غير موجود / Product variant not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check availability
        # التحقق من التوفر
        if not variant.product.is_active:
            return error_response(
                message=_('المنتج غير متاح / Product is not available'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if not variant.is_available:
            return error_response(
                message=_('متغير المنتج غير متاح / Product variant is not available'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Get or create cart item
            # الحصول على أو إنشاء عنصر السلة
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                variant=variant,
                defaults={
                    'quantity': quantity,
                    'price': variant.price,
                }
            )
            
            if not created:
                # Update quantity if item already exists
                # تحديث الكمية إذا كان العنصر موجوداً
                cart_item.quantity += quantity
                cart_item.price = variant.price  # Update price snapshot
                cart_item.save()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = AdminCartDetailSerializer(cart, context={'request': request})
        return success_response(
            data=serializer.data,
            message=_('تم إضافة العنصر للسلة بنجاح / Item added to cart successfully')
        )


class AdminCartItemUpdateView(APIView):
    """
    Update item in user's cart (Admin can update items in any cart).
    تحديث عنصر في سلة مستخدم (المسؤول يمكنه تحديث عناصر في أي سلة).
    """
    
    permission_classes = [IsAdminUser]
    
    def get_cart_item(self, cart_id, item_id):
        """Get cart item by IDs"""
        try:
            return CartItem.objects.select_related('cart', 'variant').get(
                id=item_id,
                cart_id=cart_id
            )
        except CartItem.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Update Cart Item',
        description='Update item quantity in user\'s cart (Admin operation)',
        request=AdminCartItemUpdateSerializer,
        responses={200: AdminCartDetailSerializer},
        tags=['Admin Carts'],
    )
    def patch(self, request, pk, item_id):
        """
        Update cart item.
        تحديث عنصر السلة.
        """
        cart_item = self.get_cart_item(pk, item_id)
        if not cart_item:
            return error_response(
                message=_('عنصر السلة غير موجود / Cart item not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminCartItemUpdateSerializer(cart_item, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message=_('بيانات غير صحيحة / Invalid data'),
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            serializer.save()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart_item.cart.updated_at = timezone.now()
            cart_item.cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart_item.cart.refresh_from_db()
        cart_serializer = AdminCartDetailSerializer(cart_item.cart, context={'request': request})
        return success_response(
            data=cart_serializer.data,
            message=_('تم تحديث عنصر السلة بنجاح / Cart item updated successfully')
        )


class AdminCartItemDeleteView(APIView):
    """
    Remove item from user's cart (Admin can remove items from any cart).
    إزالة عنصر من سلة مستخدم (المسؤول يمكنه إزالة عناصر من أي سلة).
    """
    
    permission_classes = [IsAdminUser]
    
    def get_cart_item(self, cart_id, item_id):
        """Get cart item by IDs"""
        try:
            return CartItem.objects.select_related('cart').get(
                id=item_id,
                cart_id=cart_id
            )
        except CartItem.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Remove Cart Item',
        description='Remove item from user\'s cart (Admin operation)',
        responses={200: AdminCartDetailSerializer},
        tags=['Admin Carts'],
    )
    def delete(self, request, pk, item_id):
        """
        Remove cart item.
        إزالة عنصر السلة.
        """
        cart_item = self.get_cart_item(pk, item_id)
        if not cart_item:
            return error_response(
                message=_('عنصر السلة غير موجود / Cart item not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        cart = cart_item.cart
        
        with transaction.atomic():
            cart_item.delete()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = AdminCartDetailSerializer(cart, context={'request': request})
        return success_response(
            data=serializer.data,
            message=_('تم إزالة العنصر من السلة بنجاح / Item removed from cart successfully')
        )


class AdminCartClearView(APIView):
    """
    Clear all items from user's cart (Admin can clear any cart).
    مسح جميع العناصر من سلة مستخدم (المسؤول يمكنه مسح أي سلة).
    """
    
    permission_classes = [IsAdminUser]
    
    def get_object(self, pk):
        """Get cart by ID"""
        try:
            return Cart.objects.select_related('user').get(pk=pk)
        except Cart.DoesNotExist:
            return None
    
    @extend_schema(
        summary='Clear Cart',
        description='Clear all items from user\'s cart (Admin operation)',
        responses={200: AdminCartDetailSerializer},
        tags=['Admin Carts'],
    )
    def delete(self, request, pk):
        """
        Clear cart.
        مسح السلة.
        """
        cart = self.get_object(pk)
        if not cart:
            return error_response(
                message=_('السلة غير موجودة / Cart not found'),
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            cart.items.all().delete()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = AdminCartDetailSerializer(cart, context={'request': request})
        return success_response(
            data=serializer.data,
            message=_('تم مسح السلة بنجاح / Cart cleared successfully')
        )


# =============================================================================
# Cart Statistics View
# عرض إحصائيات السلل
# =============================================================================

class AdminCartStatsView(APIView):
    """
    Get cart statistics for admin dashboard.
    الحصول على إحصائيات السلل للوحة تحكم المسؤول.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary='Cart Statistics',
        description='Get cart statistics for admin dashboard',
        responses={200: AdminCartStatisticsSerializer},
        tags=['Admin Carts'],
    )
    def get(self, request):
        """
        Get cart statistics.
        الحصول على إحصائيات السلل.
        """
        # Calculate statistics
        # حساب الإحصائيات
        total_carts = Cart.objects.count()
        
        # Active carts (updated in last 7 days)
        # السلل النشطة (محدثة في آخر 7 أيام)
        seven_days_ago = timezone.now() - timedelta(days=7)
        active_carts = Cart.objects.filter(updated_at__gte=seven_days_ago).count()
        
        # Guest vs Authenticated
        # ضيف مقابل مسجل
        guest_carts = Cart.objects.filter(user__isnull=True).count()
        authenticated_carts = Cart.objects.filter(user__isnull=False).count()
        
        # Total items and value
        # إجمالي العناصر والقيمة
        from django.db.models import F
        total_items_result = CartItem.objects.aggregate(
            total=Sum('quantity')
        )
        total_items = total_items_result['total'] or 0
        
        total_value_result = CartItem.objects.aggregate(
            total=Sum(F('quantity') * F('price'))
        )
        total_value = total_value_result['total'] or Decimal('0.00')
        
        # Averages
        # المتوسطات
        if total_carts > 0:
            average_items_per_cart = Decimal(str(total_items)) / Decimal(str(total_carts))
            average_cart_value = total_value / Decimal(str(total_carts))
        else:
            average_items_per_cart = Decimal('0.00')
            average_cart_value = Decimal('0.00')
        
        stats = {
            'total_carts': total_carts,
            'active_carts': active_carts,
            'guest_carts': guest_carts,
            'authenticated_carts': authenticated_carts,
            'total_items': total_items,
            'total_value': str(total_value.quantize(Decimal('0.01'))),
            'average_items_per_cart': str(average_items_per_cart.quantize(Decimal('0.01'))),
            'average_cart_value': str(average_cart_value.quantize(Decimal('0.01'))),
        }
        
        serializer = AdminCartStatisticsSerializer(stats)
        return success_response(data=serializer.data)

