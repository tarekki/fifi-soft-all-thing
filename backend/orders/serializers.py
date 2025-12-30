"""
Order Serializers
مسلسلات الطلبات

This module defines serializers for Order and OrderItem models.
هذا الوحدة يعرّف مسلسلات لنماذج Order و OrderItem.
"""

from rest_framework import serializers
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem
from products.models import ProductVariant
from products.serializers import ProductVariantSerializer


# =============================================================================
# Constants
# الثوابت
# =============================================================================

ZERO_DECIMAL = Decimal("0.00")


# ============================================================================
# Order Item Serializer
# مسلسل عنصر الطلب
# ============================================================================

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem
    مسلسل لعنصر الطلب
    
    Used in Order detail view to show order items.
    يُستخدم في عرض تفاصيل الطلب لإظهار عناصر الطلب.
    """
    product_variant_detail = ProductVariantSerializer(
        source='product_variant',
        read_only=True,
        help_text='Full product variant details'
    )
    subtotal = serializers.ReadOnlyField(help_text='Item subtotal (price * quantity)')
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_variant',
            'product_variant_detail',
            'quantity',
            'price',
            'subtotal',
            'created_at',
        ]
        read_only_fields = ['id', 'subtotal', 'created_at']


# ============================================================================
# Order Item Create Serializer (for order creation)
# مسلسل إنشاء عنصر الطلب (لإنشاء الطلب)
# ============================================================================

class OrderItemCreateSerializer(serializers.Serializer):
    """
    Serializer for creating order items
    مسلسل لإنشاء عناصر الطلب
    
    Used when creating a new order.
    يُستخدم عند إنشاء طلب جديد.
    """
    variant_id = serializers.IntegerField(
        help_text='Product variant ID'
    )
    quantity = serializers.IntegerField(
        min_value=1,
        help_text='Quantity to order'
    )
    
    def validate_variant_id(self, value):
        """
        Validate that variant exists and is available
        التحقق من وجود المتغير وأنه متاح
        """
        try:
            variant = ProductVariant.objects.get(id=value)
        except ProductVariant.DoesNotExist:
            raise serializers.ValidationError(
                "Product variant not found. / متغير المنتج غير موجود."
            )
        
        # Check if variant is available
        # التحقق من إذا كان المتغير متاحاً
        if not variant.is_available:
            raise serializers.ValidationError(
                "This product variant is not available. / هذا المتغير غير متاح."
            )
        
        # Note: Stock check will be added when Inventory Sync is implemented
        # ملاحظة: فحص المخزون سيُضاف عند تنفيذ Inventory Sync
        # For now, we only check if variant exists and is marked as available
        # حالياً، نتحقق فقط من وجود المتغير وأنه معلم كمتاح
        
        return value


# ============================================================================
# Order Create Serializer
# مسلسل إنشاء الطلب
# ============================================================================

class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating orders
    مسلسل لإنشاء الطلبات
    
    Handles order creation with items.
    يتعامل مع إنشاء الطلبات مع العناصر.
    """
    items = OrderItemCreateSerializer(
        many=True,
        help_text='List of order items'
    )
    
    # Customer info (can be pre-filled from user profile if authenticated)
    # معلومات العميل (يمكن ملؤها من الملف الشخصي إذا كان مسجلاً)
    customer_name = serializers.CharField(
        max_length=200,
        help_text='Customer name'
    )
    customer_phone = serializers.CharField(
        max_length=20,
        help_text='Customer phone number'
    )
    customer_address = serializers.CharField(
        help_text='Delivery address'
    )
    
    # Optional fields
    # حقول اختيارية
    delivery_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=ZERO_DECIMAL,
        help_text='Yalla Go delivery fee (calculated automatically if not provided)'
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Order notes'
    )
    
    class Meta:
        model = Order
        fields = [
            'items',
            'customer_name',
            'customer_phone',
            'customer_address',
            'delivery_fee',
            'notes',
            'order_type',
        ]
    
    def validate_items(self, value):
        """
        Validate that items list is not empty
        التحقق من أن قائمة العناصر ليست فارغة
        """
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "Order must have at least one item. / يجب أن يحتوي الطلب على عنصر واحد على الأقل."
            )
        return value
    
    def validate(self, data):
        """
        Validate order data
        التحقق من بيانات الطلب
        """
        # Validate that all variants exist and are available
        # التحقق من أن جميع المتغيرات موجودة ومتاحة
        variant_ids = [item['variant_id'] for item in data['items']]
        variants = ProductVariant.objects.filter(id__in=variant_ids)
        
        if variants.count() != len(variant_ids):
            raise serializers.ValidationError(
                "One or more product variants not found. / واحد أو أكثر من متغيرات المنتج غير موجودة."
            )
        
        # Check availability
        # التحقق من التوفر
        unavailable_variants = variants.filter(is_available=False)
        if unavailable_variants.exists():
            variant_names = [str(v) for v in unavailable_variants]
            raise serializers.ValidationError(
                f"The following variants are not available: {', '.join(variant_names)} / "
                f"المتغيرات التالية غير متاحة: {', '.join(variant_names)}"
            )
        
        # Note: Stock quantity check will be added when Inventory Sync is implemented
        # ملاحظة: فحص كمية المخزون سيُضاف عند تنفيذ Inventory Sync
        # For now, we only check if variants are marked as available
        # حالياً، نتحقق فقط من أن المتغيرات معلمة كمتاحة
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Create order with items
        إنشاء طلب مع العناصر
        
        Note: This implementation does NOT automatically reduce stock quantities.
        This will be added when Inventory Sync system is implemented.
        
        ملاحظة: هذا التنفيذ لا يقلل كميات المخزون تلقائياً.
        سيتم إضافته عند تنفيذ نظام Inventory Sync.
        """
        items_data = validated_data.pop('items')
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        
        # Create order
        # إنشاء الطلب
        order = Order.objects.create(
            user=user,
            customer_name=validated_data['customer_name'],
            customer_phone=validated_data['customer_phone'],
            customer_address=validated_data['customer_address'],
            delivery_fee=validated_data.get('delivery_fee', ZERO_DECIMAL),
            notes=validated_data.get('notes', ''),
            order_type=validated_data.get('order_type', 'online'),
        )
        
        # Calculate subtotal and create order items
        # حساب المجموع الفرعي وإنشاء عناصر الطلب
        subtotal = ZERO_DECIMAL
        
        for item_data in items_data:
            variant = ProductVariant.objects.get(id=item_data['variant_id'])
            quantity = item_data['quantity']
            price = variant.final_price
            
            # Create order item
            # إنشاء عنصر الطلب
            OrderItem.objects.create(
                order=order,
                product_variant=variant,
                quantity=quantity,
                price=price,
            )
            
            # Add to subtotal (using Decimal for precision)
            # إضافة إلى المجموع الفرعي (باستخدام Decimal للدقة)
            item_subtotal = (price * Decimal(str(quantity))).quantize(Order.MONEY_Q)
            subtotal += item_subtotal
            
            # TODO: When Inventory Sync is implemented, reduce stock here:
            # TODO: عند تنفيذ Inventory Sync، قلل المخزون هنا:
            # variant.stock_quantity -= quantity
            # variant.save()
        
        # Update order subtotal (this will trigger commission and total calculation in save method)
        # تحديث المجموع الفرعي للطلب (هذا سيؤدي إلى حساب العمولة والإجمالي في طريقة save)
        order.subtotal = subtotal
        order.save()
        
        return order


# ============================================================================
# Order Serializer (for list and detail views)
# مسلسل الطلب (لعرض القائمة والتفاصيل)
# ============================================================================

class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order (read operations)
    مسلسل للطلب (عمليات القراءة)
    
    Used for listing and retrieving orders.
    يُستخدم لعرض قائمة الطلبات واسترجاع الطلبات.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'user',
            'user_email',
            'is_guest_order',
            'customer_name',
            'customer_phone',
            'customer_address',
            'order_type',
            'order_type_display',
            'status',
            'status_display',
            'subtotal',
            'delivery_fee',
            'platform_commission',
            'total',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'order_number',
            'is_guest_order',
            'platform_commission',
            'total',
            'created_at',
            'updated_at',
        ]


# ============================================================================
# Order Status Update Serializer
# مسلسل تحديث حالة الطلب
# ============================================================================

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating order status
    مسلسل لتحديث حالة الطلب
    
    Used by vendors/admins to update order status.
    يُستخدم من قبل البائعين/المسؤولين لتحديث حالة الطلب.
    """
    class Meta:
        model = Order
        fields = ['status']
    
    def validate_status(self, value):
        """
        Validate status transition
        التحقق من انتقال الحالة
        
        Prevents invalid status transitions, especially for finalized orders.
        يمنع انتقالات الحالة غير الصالحة، خاصة للطلبات الملفوظة.
        
        Note: Status transition rules can be enhanced later
        ملاحظة: قواعد انتقال الحالة يمكن تحسينها لاحقاً
        """
        # Get current order status
        # الحصول على حالة الطلب الحالية
        if self.instance:
            current_status = self.instance.status
            
            # Prevent invalid transitions for finalized orders
            # منع الانتقالات غير الصالحة للطلبات الملفوظة
            if current_status in Order.FINAL_STATUSES:
                # Cancelled orders cannot be changed
                # الطلبات الملغاة لا يمكن تغييرها
                if current_status == 'cancelled' and value != 'cancelled':
                    raise serializers.ValidationError(
                        "Cannot change status of a cancelled order. / لا يمكن تغيير حالة طلب ملغي."
                    )
                
                # Delivered orders can only be changed to cancelled
                # الطلبات المسلمة يمكن تغييرها فقط إلى ملغي
                if current_status == 'delivered' and value not in Order.FINAL_STATUSES:
                    raise serializers.ValidationError(
                        "Delivered orders can only be changed to cancelled. / الطلبات المسلمة يمكن تغييرها فقط إلى ملغي."
                    )
        
        return value

