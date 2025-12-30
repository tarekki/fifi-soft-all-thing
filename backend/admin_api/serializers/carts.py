"""
Admin Cart Serializers
مسلسلات السلة للإدارة

This module contains serializers for managing carts in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة السلل في لوحة الإدارة.

Serializers:
    - AdminCartItemSerializer: عرض عنصر السلة
    - AdminCartListSerializer: قائمة السلل (مُحسّن للأداء)
    - AdminCartDetailSerializer: تفاصيل السلة الكاملة
    - AdminCartItemAddSerializer: إضافة عنصر لسلة مستخدم
    - AdminCartItemUpdateSerializer: تحديث عنصر في سلة مستخدم
    - AdminCartClearSerializer: مسح سلة مستخدم

Author: Yalla Buy Team
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from decimal import Decimal

from cart.models import Cart, CartItem
from products.models import ProductVariant
from products.serializers import ProductVariantSerializer, ProductSerializer


# =============================================================================
# Cart Item Serializer
# مسلسل عنصر السلة
# =============================================================================

class AdminCartItemSerializer(serializers.ModelSerializer):
    """
    Admin Cart Item Serializer
    مسلسل عنصر السلة للإدارة
    
    Used for displaying cart items in admin panel.
    يُستخدم لعرض عناصر السلة في لوحة الإدارة.
    """
    
    variant = ProductVariantSerializer(read_only=True)
    product = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Item subtotal (quantity * price) / المجموع الفرعي للعنصر (الكمية * السعر)'
    )
    
    class Meta:
        model = CartItem
        fields = [
            'id',
            'variant',
            'product',
            'quantity',
            'price',
            'subtotal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'price', 'subtotal', 'created_at', 'updated_at']
    
    def get_product(self, obj):
        """Get product info from variant"""
        if obj.variant and obj.variant.product:
            return ProductSerializer(obj.variant.product, context=self.context).data
        return None


# =============================================================================
# Cart List Serializer (Optimized for listing)
# مسلسل قائمة السلل (محسّن للعرض)
# =============================================================================

class AdminCartListSerializer(serializers.ModelSerializer):
    """
    Admin Cart List Serializer
    مسلسل قائمة السلل للإدارة
    
    Optimized serializer for listing carts with minimal data.
    مسلسل محسّن لعرض قائمة السلل مع بيانات محدودة.
    """
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Cart subtotal / المجموع الفرعي للسلة'
    )
    is_guest_cart = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'session_key',
            'is_guest_cart',
            'item_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'session_key',
            'is_guest_cart',
            'item_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]


# =============================================================================
# Cart Detail Serializer
# مسلسل تفاصيل السلة
# =============================================================================

class AdminCartDetailSerializer(serializers.ModelSerializer):
    """
    Admin Cart Detail Serializer
    مسلسل تفاصيل السلة للإدارة
    
    Full cart details including all items.
    تفاصيل السلة الكاملة بما في ذلك جميع العناصر.
    """
    
    items = AdminCartItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Cart subtotal / المجموع الفرعي للسلة'
    )
    is_guest_cart = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'session_key',
            'is_guest_cart',
            'items',
            'item_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'session_key',
            'is_guest_cart',
            'item_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]


# =============================================================================
# Cart Item Add Serializer (Admin can add items to any cart)
# مسلسل إضافة عنصر للسلة (Admin يمكنه إضافة عناصر لأي سلة)
# =============================================================================

class AdminCartItemAddSerializer(serializers.Serializer):
    """
    Admin Cart Item Add Serializer
    مسلسل إضافة عنصر للسلة للإدارة
    
    Allows admin to add items to any user's cart.
    يسمح للمسؤول بإضافة عناصر لأي سلة مستخدم.
    """
    
    variant_id = serializers.IntegerField(
        required=True,
        help_text='Product variant ID / معرف متغير المنتج'
    )
    quantity = serializers.IntegerField(
        default=1,
        min_value=1,
        help_text='Quantity to add (default: 1) / الكمية للإضافة (افتراضي: 1)'
    )
    
    def validate_variant_id(self, value):
        """
        Validate variant exists and is available
        التحقق من وجود المتغير وتوافره
        """
        try:
            variant = ProductVariant.objects.select_related('product').get(id=value)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError(
                _("Product variant not found. / متغير المنتج غير موجود.")
            )
        
        # Check if product is active
        # التحقق من إذا كان المنتج نشطاً
        if not variant.product.is_active:
            raise serializers.ValidationError(
                _("Product is not available. / المنتج غير متاح.")
            )
        
        # Check if variant is available
        # التحقق من إذا كان المتغير متاحاً
        if not variant.is_available:
            raise serializers.ValidationError(
                _("Product variant is not available. / متغير المنتج غير متاح.")
            )
        
        return value


# =============================================================================
# Cart Item Update Serializer (Admin can update items in any cart)
# مسلسل تحديث عنصر السلة (Admin يمكنه تحديث عناصر في أي سلة)
# =============================================================================

class AdminCartItemUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Cart Item Update Serializer
    مسلسل تحديث عنصر السلة للإدارة
    
    Allows admin to update item quantity in any user's cart.
    يسمح للمسؤول بتحديث كمية عنصر في أي سلة مستخدم.
    """
    
    class Meta:
        model = CartItem
        fields = ['quantity']
    
    def validate_quantity(self, value):
        """
        Validate quantity is positive
        التحقق من أن الكمية موجبة
        """
        if value < 1:
            raise serializers.ValidationError(
                _("Quantity must be at least 1. / الكمية يجب أن تكون على الأقل 1.")
            )
        return value


# =============================================================================
# Cart Statistics Serializer
# مسلسل إحصائيات السلل
# =============================================================================

class AdminCartStatisticsSerializer(serializers.Serializer):
    """
    Admin Cart Statistics Serializer
    مسلسل إحصائيات السلل للإدارة
    
    Cart statistics for admin dashboard.
    إحصائيات السلل للوحة تحكم المسؤول.
    """
    
    total_carts = serializers.IntegerField(help_text='Total number of carts / إجمالي عدد السلل')
    active_carts = serializers.IntegerField(help_text='Active carts (updated in last 7 days) / السلل النشطة (محدثة في آخر 7 أيام)')
    guest_carts = serializers.IntegerField(help_text='Number of guest carts / عدد السلل الضيفية')
    authenticated_carts = serializers.IntegerField(help_text='Number of authenticated user carts / عدد سلل المستخدمين المسجلين')
    total_items = serializers.IntegerField(help_text='Total items in all carts / إجمالي العناصر في جميع السلل')
    total_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Total value of all carts / القيمة الإجمالية لجميع السلل'
    )
    average_items_per_cart = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Average items per cart / متوسط العناصر لكل سلة'
    )
    average_cart_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Average cart value / متوسط قيمة السلة'
    )

