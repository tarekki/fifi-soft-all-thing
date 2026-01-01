"""
Vendor Order Serializers
متسلسلات طلبات البائع

This file contains serializers for vendor order data.
هذا الملف يحتوي على متسلسلات لبيانات طلبات البائع.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Vendor Order Item Serializer
# متسلسل عنصر طلب البائع
# =============================================================================

class VendorOrderItemSerializer(serializers.Serializer):
    """
    Serializer for order item in vendor order.
    متسلسل لعنصر الطلب في طلب البائع.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف العنصر / Item ID')
    )
    product_name = serializers.CharField(
        help_text=_('اسم المنتج / Product name')
    )
    variant_name = serializers.CharField(
        help_text=_('اسم المتغير / Variant name')
    )
    quantity = serializers.IntegerField(
        help_text=_('الكمية / Quantity')
    )
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('السعر / Price')
    )
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('المجموع الفرعي / Subtotal')
    )
    product_image = serializers.URLField(
        allow_null=True,
        help_text=_('صورة المنتج / Product image')
    )


# =============================================================================
# Vendor Order List Serializer
# متسلسل قائمة طلبات البائع
# =============================================================================

class VendorOrderListSerializer(serializers.Serializer):
    """
    Serializer for order list in vendor panel.
    متسلسل لقائمة الطلبات في لوحة البائع.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف الطلب / Order ID')
    )
    order_number = serializers.CharField(
        help_text=_('رقم الطلب / Order number')
    )
    customer_name = serializers.CharField(
        help_text=_('اسم العميل / Customer name')
    )
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('إجمالي الطلب (لعناصر البائع فقط) / Order total (vendor items only)')
    )
    status = serializers.CharField(
        help_text=_('حالة الطلب / Order status')
    )
    status_display = serializers.CharField(
        help_text=_('عرض حالة الطلب / Order status display')
    )
    items_count = serializers.IntegerField(
        help_text=_('عدد العناصر (للبائع فقط) / Items count (vendor only)')
    )
    created_at = serializers.DateTimeField(
        help_text=_('تاريخ الإنشاء / Created at')
    )


# =============================================================================
# Vendor Order Detail Serializer
# متسلسل تفاصيل طلب البائع
# =============================================================================

class VendorOrderDetailSerializer(serializers.Serializer):
    """
    Serializer for order details in vendor panel.
    متسلسل لتفاصيل الطلب في لوحة البائع.
    """
    
    id = serializers.IntegerField(
        help_text=_('معرف الطلب / Order ID')
    )
    order_number = serializers.CharField(
        help_text=_('رقم الطلب / Order number')
    )
    status = serializers.CharField(
        help_text=_('حالة الطلب / Order status')
    )
    status_display = serializers.CharField(
        help_text=_('عرض حالة الطلب / Order status display')
    )
    order_type = serializers.CharField(
        help_text=_('نوع الطلب / Order type')
    )
    customer_name = serializers.CharField(
        help_text=_('اسم العميل / Customer name')
    )
    customer_email = serializers.EmailField(
        allow_null=True,
        help_text=_('بريد العميل / Customer email')
    )
    customer_phone = serializers.CharField(
        allow_null=True,
        help_text=_('هاتف العميل / Customer phone')
    )
    customer_address = serializers.CharField(
        help_text=_('عنوان العميل / Customer address')
    )
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('المجموع الفرعي (لعناصر البائع فقط) / Subtotal (vendor items only)')
    )
    items = VendorOrderItemSerializer(
        many=True,
        help_text=_('عناصر الطلب (للبائع فقط) / Order items (vendor only)')
    )
    items_count = serializers.IntegerField(
        help_text=_('عدد العناصر / Items count')
    )
    created_at = serializers.DateTimeField(
        help_text=_('تاريخ الإنشاء / Created at')
    )
    updated_at = serializers.DateTimeField(
        help_text=_('تاريخ آخر تحديث / Updated at')
    )
    notes = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        help_text=_('ملاحظات / Notes')
    )


# =============================================================================
# Vendor Order Status Update Serializer
# متسلسل تحديث حالة طلب البائع
# =============================================================================

class VendorOrderStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating order status.
    متسلسل لتحديث حالة الطلب.
    """
    
    status = serializers.ChoiceField(
        choices=['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        help_text=_('حالة الطلب / Order status')
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('ملاحظات إضافية / Additional notes')
    )

