"""
Vendor Customer Serializers
متسلسلات زبائن البائع

This file contains serializers for vendor customer data.
هذا الملف يحتوي على متسلسلات لبيانات زبائن البائع.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _


# =============================================================================
# Vendor Customer List Serializer
# متسلسل قائمة زبائن البائع
# =============================================================================

class VendorCustomerListSerializer(serializers.Serializer):
    """
    Serializer for customer list in vendor panel.
    متسلسل لقائمة الزبائن في لوحة البائع.
    
    This serializer aggregates customer data from orders:
    - customer_key: Unique identifier for the customer (vendor-specific)
    - name: Customer name
    - phone: Masked phone number (for privacy)
    - orders_count: Number of orders from this vendor
    - total_spent: Total amount spent on this vendor's products
    - last_order_at: Date of last order
    
    هذا المتسلسل يجمع بيانات الزبائن من الطلبات:
    - customer_key: معرف فريد للعميل (خاص بالبائع)
    - name: اسم العميل
    - phone: رقم الهاتف المخفي (للخصوصية)
    - orders_count: عدد الطلبات من هذا البائع
    - total_spent: المبلغ الإجمالي المنفق على منتجات هذا البائع
    - last_order_at: تاريخ آخر طلب
    """
    
    customer_key = serializers.CharField(
        help_text=_('معرف فريد للعميل (خاص بالبائع) / Unique customer identifier (vendor-specific)')
    )
    name = serializers.CharField(
        help_text=_('اسم العميل / Customer name')
    )
    email = serializers.EmailField(
        allow_null=True,
        help_text=_('بريد العميل / Customer email')
    )
    phone = serializers.CharField(
        allow_null=True,
        help_text=_('رقم الهاتف (مخفي) / Phone number (masked)')
    )
    orders_count = serializers.IntegerField(
        help_text=_('عدد الطلبات من هذا البائع / Number of orders from this vendor')
    )
    total_spent = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_('المبلغ الإجمالي المنفق على منتجات هذا البائع / Total amount spent on this vendor\'s products')
    )
    last_order_at = serializers.DateTimeField(
        allow_null=True,
        help_text=_('تاريخ آخر طلب / Date of last order')
    )
    first_order_at = serializers.DateTimeField(
        allow_null=True,
        help_text=_('تاريخ أول طلب / Date of first order')
    )

