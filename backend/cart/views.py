"""
Cart Views - API Endpoints
عروض السلة - نقاط نهاية الـ API

This module defines API views for cart management.
هذا الوحدة يعرّف عروض API لإدارة السلة.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.utils import timezone
from django.http import Http404

from core.utils import success_response, error_response
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    CartAddItemSerializer,
    CartUpdateItemSerializer,
)
from products.models import ProductVariant


# =============================================================================
# Helper Functions
# دوال مساعدة
# =============================================================================

def get_or_create_cart(request):
    """
    Get or create cart for user (authenticated or guest)
    الحصول على أو إنشاء سلة للمستخدم (مسجل أو ضيف)
    
    Args:
        request: HTTP request object
        
    Returns:
        Cart: User's cart
    """
    user = request.user if request.user.is_authenticated else None
    session_key = request.session.session_key if not user else None
    
    # Ensure session exists for guest users
    # التأكد من وجود جلسة للمستخدمين الضيوف
    if not user and not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    # Get or create cart
    # الحصول على أو إنشاء سلة
    if user:
        cart, created = Cart.objects.get_or_create(user=user)
    else:
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    
    return cart


# =============================================================================
# Cart ViewSet
# ViewSet للسلة
# =============================================================================

class CartViewSet(viewsets.ModelViewSet):
    """
    Cart Management ViewSet
    ViewSet لإدارة السلة
    
    Endpoints:
    - GET /api/v1/cart/ - Get current user's cart
    - POST /api/v1/cart/add_item/ - Add item to cart
    - PATCH /api/v1/cart/update_item/{item_id}/ - Update item quantity
    - DELETE /api/v1/cart/remove_item/{item_id}/ - Remove item from cart
    - DELETE /api/v1/cart/clear/ - Clear all items from cart
    
    Permissions:
    - Anyone can access their own cart (authenticated or guest)
    - Users can only access their own cart
    
    الصلاحيات:
    - أي شخص يمكنه الوصول لسلته (مسجل أو ضيف)
    - المستخدمون يمكنهم الوصول لسلتهم فقط
    """
    
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]  # Allow both authenticated and guest users
    
    def get_queryset(self):
        """
        Filter queryset to only return user's own cart
        تصفية queryset لإرجاع سلة المستخدم فقط
        """
        user = self.request.user if self.request.user.is_authenticated else None
        session_key = self.request.session.session_key if not user else None
        
        if user:
            return Cart.objects.filter(user=user)
        elif session_key:
            return Cart.objects.filter(session_key=session_key)
        else:
            return Cart.objects.none()
    
    def get_object(self):
        """
        Get or create cart for current user
        الحصول على أو إنشاء سلة للمستخدم الحالي
        """
        # Override to get/create cart instead of using pk
        # تجاوز للحصول على/إنشاء سلة بدلاً من استخدام pk
        return get_or_create_cart(self.request)
    
    def list(self, request):
        """
        List cart (same as retrieve for cart - one cart per user)
        عرض السلة (نفس retrieve للسلة - سلة واحدة لكل مستخدم)
        
        Note: Only creates cart if it doesn't exist. Does NOT create empty carts.
        ملاحظة: ينشئ السلة فقط إذا لم تكن موجودة. لا ينشئ سلل فارغة.
        """
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key if not user else None
        
        # Try to get existing cart first (don't create if doesn't exist)
        # محاولة الحصول على السلة الموجودة أولاً (لا تنشئ إذا لم تكن موجودة)
        try:
            if user:
                cart = Cart.objects.get(user=user)
            elif session_key:
                cart = Cart.objects.get(session_key=session_key)
            else:
                # No user and no session - return empty cart
                # لا يوجد مستخدم ولا جلسة - إرجاع سلة فارغة
                return Response({
                    "success": True,
                    "data": {
                        "id": 0,
                        "user": None,
                        "items": [],
                        "item_count": 0,
                        "subtotal": "0.00",
                        "created_at": None,
                        "updated_at": None,
                    },
                    "message": "No cart found. / لم يتم العثور على سلة.",
                    "errors": None,
                })
        except Cart.DoesNotExist:
            # Cart doesn't exist - return empty cart (don't create until user adds item)
            # السلة غير موجودة - إرجاع سلة فارغة (لا تنشئ حتى يضيف المستخدم عنصر)
            return Response({
                "success": True,
                "data": {
                    "id": 0,
                    "user": None,
                    "items": [],
                    "item_count": 0,
                    "subtotal": "0.00",
                    "created_at": None,
                    "updated_at": None,
                },
                "message": "No cart found. / لم يتم العثور على سلة.",
                "errors": None,
            })
        
        serializer = self.get_serializer(cart)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Cart retrieved successfully. / تم جلب السلة بنجاح.",
            "errors": None,
        })
    
    def retrieve(self, request, pk=None):
        """
        Get current user's cart
        الحصول على سلة المستخدم الحالي
        
        Returns cart with all items and totals.
        إرجاع السلة مع جميع العناصر والإجماليات.
        """
        return self.list(request)
    
    @action(detail=False, methods=['post'], url_path='add_item')
    def add_item(self, request):
        """
        Add item to cart
        إضافة عنصر للسلة
        
        If item already exists, quantity is increased.
        إذا كان العنصر موجوداً، يتم زيادة الكمية.
        """
        serializer = CartAddItemSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message="Invalid data. / بيانات غير صحيحة.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        variant_id = serializer.validated_data['variant_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            variant = ProductVariant.objects.select_related('product').get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return error_response(
                message="Product variant not found. / متغير المنتج غير موجود.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check availability
        # التحقق من التوفر
        if not variant.product.is_active:
            return error_response(
                message="Product is not available. / المنتج غير متاح.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if not variant.is_available:
            return error_response(
                message="Product variant is not available. / متغير المنتج غير متاح.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            cart = get_or_create_cart(request)
            
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
        serializer = self.get_serializer(cart)
        return success_response(
            data=serializer.data,
            message="Item added to cart successfully. / تم إضافة العنصر للسلة بنجاح.",
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['patch'], url_path='update_item/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        """
        Update item quantity in cart
        تحديث كمية عنصر في السلة
        """
        serializer = CartUpdateItemSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                errors=serializer.errors,
                message="Invalid data. / بيانات غير صحيحة.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        new_quantity = serializer.validated_data['quantity']
        
        try:
            cart = get_or_create_cart(request)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return error_response(
                message="Cart item not found. / عنصر السلة غير موجود.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            cart_item.quantity = new_quantity
            cart_item.save()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = self.get_serializer(cart)
        return success_response(
            data=serializer.data,
            message="Cart item updated successfully. / تم تحديث عنصر السلة بنجاح."
        )
    
    @action(detail=False, methods=['delete'], url_path='remove_item/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        """
        Remove item from cart
        إزالة عنصر من السلة
        """
        try:
            cart = get_or_create_cart(request)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return error_response(
                message="Cart item not found. / عنصر السلة غير موجود.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        with transaction.atomic():
            cart_item.delete()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = self.get_serializer(cart)
        return success_response(
            data=serializer.data,
            message="Item removed from cart successfully. / تم إزالة العنصر من السلة بنجاح."
        )
    
    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        """
        Clear all items from cart
        مسح جميع العناصر من السلة
        """
        cart = get_or_create_cart(request)
        
        with transaction.atomic():
            cart.items.all().delete()
            
            # Update cart updated_at
            # تحديث updated_at للسلة
            cart.updated_at = timezone.now()
            cart.save(update_fields=['updated_at'])
        
        # Return updated cart
        # إرجاع السلة المحدثة
        cart.refresh_from_db()
        serializer = self.get_serializer(cart)
        return success_response(
            data=serializer.data,
            message="Cart cleared successfully. / تم مسح السلة بنجاح."
        )
