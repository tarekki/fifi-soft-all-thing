"""
Cart Admin Configuration
إعدادات إدارة السلة

This module configures Django admin interface for cart models.
هذا الوحدة يكوّن واجهة إدارة Django لنماذج السلة.
"""

from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    """
    Inline admin for cart items
    إدارة مضمنة لعناصر السلة
    """
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal', 'created_at', 'updated_at']
    fields = ['variant', 'quantity', 'price', 'subtotal', 'created_at', 'updated_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """
    Admin configuration for Cart model
    إعدادات الإدارة لنموذج السلة
    """
    list_display = [
        'id',
        'user',
        'session_key',
        'item_count',
        'subtotal',
        'created_at',
        'updated_at',
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'session_key']
    readonly_fields = ['item_count', 'subtotal', 'created_at', 'updated_at']
    inlines = [CartItemInline]
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'session_key')
        }),
        ('Cart Summary', {
            'fields': ('item_count', 'subtotal')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related and prefetch_related
        تحسين queryset مع select_related و prefetch_related
        """
        qs = super().get_queryset(request)
        return qs.select_related('user').prefetch_related('items__variant__product')


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """
    Admin configuration for CartItem model
    إعدادات الإدارة لنموذج عنصر السلة
    """
    list_display = [
        'id',
        'cart',
        'variant',
        'quantity',
        'price',
        'subtotal',
        'created_at',
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['cart__user__email', 'variant__product__name', 'variant__sku']
    readonly_fields = ['subtotal', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Cart Information', {
            'fields': ('cart',)
        }),
        ('Product Information', {
            'fields': ('variant',)
        }),
        ('Item Details', {
            'fields': ('quantity', 'price', 'subtotal')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related
        تحسين queryset مع select_related
        """
        qs = super().get_queryset(request)
        return qs.select_related('cart', 'cart__user', 'variant', 'variant__product')
