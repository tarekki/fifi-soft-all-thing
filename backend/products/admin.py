from django.contrib import admin
from .models import Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['color', 'color_hex', 'size', 'model', 'stock_quantity', 'price_override', 'is_available']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'product_type', 'base_price', 'is_active', 'created_at']
    list_filter = ['vendor', 'product_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'color', 'size', 'model', 'stock_quantity', 'final_price', 'is_available']
    list_filter = ['product__vendor', 'color', 'is_available']
    search_fields = ['product__name', 'sku', 'color', 'model']
    readonly_fields = ['created_at', 'updated_at', 'final_price']
