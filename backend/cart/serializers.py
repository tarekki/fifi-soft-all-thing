"""
Cart Serializers
مسلسلات السلة

This module contains serializers for cart operations.
يحتوي هذا الوحدة على مسلسلات عمليات السلة.
"""

from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from .models import Cart, CartItem
from products.serializers import ProductVariantSerializer, ProductSerializer


# =============================================================================
# Constants
# الثوابت
# =============================================================================

ZERO_DECIMAL = Decimal("0.00")
MONEY_Q = Decimal("0.01")


# =============================================================================
# Cart Item Serializers
# مسلسلات عنصر السلة
# =============================================================================

class CartItemSerializer(serializers.ModelSerializer):
    """
    Cart Item Serializer (Read)
    مسلسل عنصر السلة (قراءة)
    
    Used for displaying cart items.
    يُستخدم لعرض عناصر السلة.
    """
    
    variant = ProductVariantSerializer(read_only=True)
    # Include product info in variant for easier access
    # تضمين معلومات المنتج في المتغير للوصول الأسهل
    product = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Item subtotal (quantity * price) / المجموع الفرعي للعنصر (الكمية * السعر)'
    )
    
    def get_product(self, obj):
        """Get product info from variant"""
        if obj.variant and obj.variant.product:
            return ProductSerializer(obj.variant.product, context=self.context).data
        return None
    
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


class CartItemCreateSerializer(serializers.Serializer):
    """
    Cart Item Create Serializer
    مسلسل إنشاء عنصر السلة
    
    Used for adding items to cart.
    يُستخدم لإضافة عناصر للسلة.
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
        from products.models import ProductVariant
        
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


class CartItemUpdateSerializer(serializers.ModelSerializer):
    """
    Cart Item Update Serializer
    مسلسل تحديث عنصر السلة
    
    Used for updating item quantity.
    يُستخدم لتحديث كمية العنصر.
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
# Cart Serializers
# مسلسلات السلة
# =============================================================================

class CartSerializer(serializers.ModelSerializer):
    """
    Cart Serializer (Read)
    مسلسل السلة (قراءة)
    
    Used for displaying cart with items.
    يُستخدم لعرض السلة مع العناصر.
    """
    
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        help_text='Cart subtotal / المجموع الفرعي للسلة'
    )
    
    class Meta:
        model = Cart
        fields = [
            'id',
            'user',
            'items',
            'item_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'item_count', 'subtotal', 'created_at', 'updated_at']


class CartAddItemSerializer(serializers.Serializer):
    """
    Cart Add Item Serializer
    مسلسل إضافة عنصر للسلة
    
    Used for adding items to cart.
    يُستخدم لإضافة عناصر للسلة.
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
        from products.models import ProductVariant
        
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


class CartUpdateItemSerializer(serializers.Serializer):
    """
    Cart Update Item Serializer
    مسلسل تحديث عنصر في السلة
    
    Used for updating item quantity in cart.
    يُستخدم لتحديث كمية عنصر في السلة.
    """
    
    quantity = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text='New quantity / الكمية الجديدة'
    )
    
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

