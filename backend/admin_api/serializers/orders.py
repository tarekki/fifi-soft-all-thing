"""
Admin Order Serializers
مسلسلات الطلبات للإدارة

This module contains serializers for managing orders in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة الطلبات في لوحة الإدارة.

Serializers:
    - AdminOrderItemSerializer: عرض عناصر الطلب
    - AdminOrderListSerializer: قائمة الطلبات (مُحسّن للأداء)
    - AdminOrderDetailSerializer: تفاصيل الطلب الكاملة
    - AdminOrderStatusUpdateSerializer: تحديث حالة الطلب
    - AdminOrderNoteSerializer: إضافة ملاحظة للطلب

Author: Yalla Buy Team
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from orders.models import Order, OrderItem
from products.models import ProductVariant


# =============================================================================
# Constants: Order Status Configuration
# ثوابت: إعدادات حالات الطلب
# =============================================================================

# Valid status transitions (from_status -> allowed_to_statuses)
# انتقالات الحالة الصالحة (من_الحالة -> الحالات_المسموحة)
VALID_STATUS_TRANSITIONS = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [],  # Final state - لا يمكن التغيير
    'cancelled': [],  # Final state - لا يمكن التغيير
}


# =============================================================================
# Order Item Serializer
# مسلسل عنصر الطلب
# =============================================================================

class AdminOrderItemSerializer(serializers.ModelSerializer):
    """
    Admin Order Item Serializer
    مسلسل عنصر الطلب للإدارة
    
    Displays order item details including product information.
    يعرض تفاصيل عنصر الطلب بما في ذلك معلومات المنتج.
    """
    
    # Product info from variant
    # معلومات المنتج من المتغير
    product_name = serializers.SerializerMethodField(
        help_text="اسم المنتج"
    )
    product_image = serializers.SerializerMethodField(
        help_text="صورة المنتج"
    )
    variant_info = serializers.SerializerMethodField(
        help_text="معلومات المتغير (اللون، المقاس)"
    )
    vendor_name = serializers.SerializerMethodField(
        help_text="اسم البائع"
    )
    
    # Computed field
    # حقل محسوب
    subtotal = serializers.ReadOnlyField(
        help_text="المجموع الفرعي (السعر × الكمية)"
    )
    
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_variant',
            'product_name',
            'product_image',
            'variant_info',
            'vendor_name',
            'quantity',
            'price',
            'subtotal',
            'created_at',
        ]
    
    def get_product_name(self, obj) -> str:
        """
        Get product name from variant
        الحصول على اسم المنتج من المتغير
        """
        if obj.product_variant and obj.product_variant.product:
            return obj.product_variant.product.name
        return "Unknown Product"
    
    def get_product_image(self, obj) -> str | None:
        """
        Get product image URL
        الحصول على رابط صورة المنتج
        """
        if obj.product_variant and obj.product_variant.image:
            request = self.context.get('request')
            if request and hasattr(obj.product_variant.image, 'url'):
                return request.build_absolute_uri(obj.product_variant.image.url)
            return obj.product_variant.image.url if hasattr(obj.product_variant.image, 'url') else None
        return None
    
    def get_variant_info(self, obj) -> str:
        """
        Get variant info (color, size, model)
        الحصول على معلومات المتغير (اللون، المقاس، الموديل)
        """
        if not obj.product_variant:
            return ""
        
        parts = []
        if obj.product_variant.color:
            parts.append(obj.product_variant.color)
        if obj.product_variant.size:
            parts.append(f"Size: {obj.product_variant.size}")
        if obj.product_variant.model:
            parts.append(obj.product_variant.model)
        
        return " - ".join(parts) if parts else ""
    
    def get_vendor_name(self, obj) -> str | None:
        """
        Get vendor name from product
        الحصول على اسم البائع من المنتج
        """
        if obj.product_variant and obj.product_variant.product and obj.product_variant.product.vendor:
            return obj.product_variant.product.vendor.name
        return None


# =============================================================================
# Order List Serializer (Optimized for Performance)
# مسلسل قائمة الطلبات (مُحسّن للأداء)
# =============================================================================

class AdminOrderListSerializer(serializers.ModelSerializer):
    """
    Admin Order List Serializer
    مسلسل قائمة الطلبات للإدارة
    
    Optimized for list view - includes only essential fields.
    مُحسّن لعرض القائمة - يتضمن الحقول الأساسية فقط.
    
    Performance Note:
    - Does NOT include items (use detail view for that)
    - Uses SerializerMethodField for computed values
    
    ملاحظة الأداء:
    - لا يتضمن العناصر (استخدم عرض التفاصيل لذلك)
    - يستخدم SerializerMethodField للقيم المحسوبة
    """
    
    # Display values
    # قيم العرض
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True,
        help_text="حالة الطلب للعرض"
    )
    order_type_display = serializers.CharField(
        source='get_order_type_display',
        read_only=True,
        help_text="نوع الطلب للعرض"
    )
    
    # User info
    # معلومات المستخدم
    user_email = serializers.SerializerMethodField(
        help_text="البريد الإلكتروني للمستخدم"
    )
    
    # Computed fields
    # الحقول المحسوبة
    items_count = serializers.SerializerMethodField(
        help_text="عدد العناصر في الطلب"
    )
    
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
            'order_type',
            'order_type_display',
            'status',
            'status_display',
            'subtotal',
            'delivery_fee',
            'total',
            'items_count',
            'created_at',
            'updated_at',
        ]
    
    def get_user_email(self, obj) -> str | None:
        """Get user email if exists"""
        if obj.user:
            return obj.user.email
        return None
    
    def get_items_count(self, obj) -> int:
        """Get total items count"""
        # Use prefetched items if available
        # استخدام العناصر المجلوبة مسبقاً إذا كانت متاحة
        if hasattr(obj, '_prefetched_objects_cache') and 'items' in obj._prefetched_objects_cache:
            return len(obj.items.all())
        return obj.items.count()


# =============================================================================
# Order Detail Serializer (Complete Information)
# مسلسل تفاصيل الطلب (معلومات كاملة)
# =============================================================================

class AdminOrderDetailSerializer(serializers.ModelSerializer):
    """
    Admin Order Detail Serializer
    مسلسل تفاصيل الطلب للإدارة
    
    Complete order information including all items.
    معلومات الطلب الكاملة بما في ذلك جميع العناصر.
    """
    
    # Items (nested)
    # العناصر (متداخلة)
    items = AdminOrderItemSerializer(
        many=True,
        read_only=True,
        help_text="عناصر الطلب"
    )
    
    # Display values
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    order_type_display = serializers.CharField(
        source='get_order_type_display',
        read_only=True
    )
    
    # User info
    user_email = serializers.SerializerMethodField()
    
    # Available status transitions
    # انتقالات الحالة المتاحة
    available_statuses = serializers.SerializerMethodField(
        help_text="الحالات المتاحة للانتقال إليها"
    )
    
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
            'available_statuses',
            'subtotal',
            'delivery_fee',
            'platform_commission',
            'total',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]
    
    def get_user_email(self, obj) -> str | None:
        """Get user email if exists"""
        if obj.user:
            return obj.user.email
        return None
    
    def get_available_statuses(self, obj) -> list[dict]:
        """
        Get available status transitions
        الحصول على انتقالات الحالة المتاحة
        
        Returns list of {value, label} for dropdown
        يُرجع قائمة {value, label} للقائمة المنسدلة
        """
        current_status = obj.status
        allowed_statuses = VALID_STATUS_TRANSITIONS.get(current_status, [])
        
        # Map to display labels
        # تحويل إلى تسميات العرض
        status_labels = {
            'pending': _('قيد الانتظار / Pending'),
            'confirmed': _('مؤكد / Confirmed'),
            'shipped': _('تم الشحن / Shipped'),
            'delivered': _('تم التسليم / Delivered'),
            'cancelled': _('ملغى / Cancelled'),
        }
        
        return [
            {'value': status, 'label': str(status_labels.get(status, status))}
            for status in allowed_statuses
        ]


# =============================================================================
# Order Status Update Serializer
# مسلسل تحديث حالة الطلب
# =============================================================================

class AdminOrderStatusUpdateSerializer(serializers.Serializer):
    """
    Admin Order Status Update Serializer
    مسلسل تحديث حالة الطلب للإدارة
    
    Validates status transitions and updates order status.
    يتحقق من انتقالات الحالة ويحدث حالة الطلب.
    
    Security:
    - Only allows valid status transitions
    - Prevents changing cancelled/delivered orders
    
    الأمان:
    - يسمح فقط بانتقالات الحالة الصالحة
    - يمنع تغيير الطلبات الملغاة/المسلمة
    """
    
    status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES,
        help_text="الحالة الجديدة للطلب"
    )
    note = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text="ملاحظة اختيارية عند تغيير الحالة"
    )
    
    def validate_status(self, value):
        """
        Validate status transition is allowed
        التحقق من أن انتقال الحالة مسموح
        """
        order = self.context.get('order')
        
        if not order:
            raise serializers.ValidationError(
                _("الطلب غير موجود / Order not found")
            )
        
        current_status = order.status
        
        # Check if transition is valid
        # التحقق من صحة الانتقال
        allowed_statuses = VALID_STATUS_TRANSITIONS.get(current_status, [])
        
        if value not in allowed_statuses:
            if not allowed_statuses:
                raise serializers.ValidationError(
                    _(f"لا يمكن تغيير حالة الطلب من '{current_status}' / Cannot change status from '{current_status}'")
                )
            else:
                allowed_str = ', '.join(allowed_statuses)
                raise serializers.ValidationError(
                    _(f"الانتقال غير صالح. الحالات المسموحة: {allowed_str} / Invalid transition. Allowed: {allowed_str}")
                )
        
        return value
    
    def update(self, instance, validated_data):
        """
        Update order status
        تحديث حالة الطلب
        """
        instance.status = validated_data['status']
        instance.save(update_fields=['status', 'updated_at'])
        
        # TODO: Add status change history logging
        # TODO: إضافة تسجيل تاريخ تغيير الحالة
        
        # TODO: Send notification to customer
        # TODO: إرسال إشعار للعميل
        
        return instance


# =============================================================================
# Order Bulk Action Serializer
# مسلسل العمليات المجمعة للطلبات
# =============================================================================

class AdminOrderBulkActionSerializer(serializers.Serializer):
    """
    Admin Order Bulk Action Serializer
    مسلسل العمليات المجمعة للطلبات
    
    Performs bulk status updates on multiple orders.
    ينفذ تحديثات حالة مجمعة على عدة طلبات.
    
    Security:
    - Validates all order IDs exist
    - Only allows valid transitions for each order
    
    الأمان:
    - يتحقق من وجود جميع معرفات الطلبات
    - يسمح فقط بالانتقالات الصالحة لكل طلب
    """
    
    order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="قائمة معرفات الطلبات"
    )
    action = serializers.ChoiceField(
        choices=[
            ('confirm', _('تأكيد / Confirm')),
            ('ship', _('شحن / Ship')),
            ('deliver', _('تسليم / Deliver')),
            ('cancel', _('إلغاء / Cancel')),
        ],
        help_text="نوع العملية"
    )
    
    # Action to status mapping
    # تعيين العملية إلى الحالة
    ACTION_TO_STATUS = {
        'confirm': 'confirmed',
        'ship': 'shipped',
        'deliver': 'delivered',
        'cancel': 'cancelled',
    }
    
    def validate_order_ids(self, value):
        """
        Validate all order IDs exist
        التحقق من وجود جميع معرفات الطلبات
        """
        existing_ids = set(
            Order.objects.filter(pk__in=value).values_list('pk', flat=True)
        )
        missing_ids = set(value) - existing_ids
        
        if missing_ids:
            raise serializers.ValidationError(
                _(f"الطلبات غير موجودة: {list(missing_ids)} / Orders not found: {list(missing_ids)}")
            )
        
        return value
    
    def validate(self, data):
        """
        Validate that all orders can transition to the target status
        التحقق من أن جميع الطلبات يمكنها الانتقال إلى الحالة المستهدفة
        """
        order_ids = data['order_ids']
        action = data['action']
        target_status = self.ACTION_TO_STATUS[action]
        
        # Get orders and check transitions
        # الحصول على الطلبات والتحقق من الانتقالات
        orders = Order.objects.filter(pk__in=order_ids)
        invalid_orders = []
        
        for order in orders:
            allowed = VALID_STATUS_TRANSITIONS.get(order.status, [])
            if target_status not in allowed:
                invalid_orders.append(
                    f"{order.order_number} ({order.status})"
                )
        
        if invalid_orders:
            raise serializers.ValidationError({
                'order_ids': _(
                    f"الطلبات التالية لا يمكن تحويلها: {', '.join(invalid_orders)} / "
                    f"Cannot transition these orders: {', '.join(invalid_orders)}"
                )
            })
        
        data['target_status'] = target_status
        return data

