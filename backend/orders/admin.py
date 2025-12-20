from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']
    fields = ['product_variant', 'quantity', 'price', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'status', 'order_type', 'total', 'platform_commission', 'created_at']
    list_filter = ['status', 'order_type', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    readonly_fields = ['order_number', 'subtotal', 'total', 'platform_commission', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Info', {
            'fields': ('order_number', 'order_type', 'status')
        }),
        ('Customer Info', {
            'fields': ('customer_name', 'customer_phone', 'customer_address')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'delivery_fee', 'total', 'platform_commission')
        }),
        ('Additional', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_variant', 'quantity', 'price', 'subtotal']
    list_filter = ['order__status', 'created_at']
    readonly_fields = ['subtotal', 'created_at']
