"""
Product Serializers
مسلسلات المنتجات

This module contains serializers for Product and ProductVariant models.
هذا الملف يحتوي على مسلسلات لنماذج Product و ProductVariant
"""

from rest_framework import serializers
from vendors.serializers import VendorSerializer
from .models import Product, ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):
    """
    Product Variant Serializer
    مسلسل متغير المنتج
    
    Serializes ProductVariant model data.
    يسلسل بيانات نموذج ProductVariant
    
    A variant represents a specific SKU with:
    - Color, Size, Model
    - Stock quantity
    - Price (can override product base price)
    - Image
    
    Fields:
    - id: Variant unique identifier
    - color: Variant color name
    - color_hex: Hex color code
    - size: Size (for shoes)
    - model: Model/Style name
    - sku: Stock Keeping Unit
    - stock_quantity: Available stock
    - price_override: Custom price (if different from base price)
    - final_price: Final price (price_override or base_price)
    - image_url: Variant image URL
    - is_available: Whether variant is available
    """
    
    # Final price - calculated property
    # السعر النهائي - خاصية محسوبة
    final_price = serializers.ReadOnlyField()
    
    # Image URL - returns full URL instead of just path
    # رابط الصورة - يعيد الرابط الكامل بدلاً من المسار فقط
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',                    # معرف المتغير الفريد
            'color',                 # اللون
            'color_hex',             # كود اللون (hex)
            'size',                  # المقاس
            'model',                 # الموديل/النمط
            'sku',                   # رمز المخزون (SKU)
            'stock_quantity',        # الكمية المتوفرة
            'price_override',        # سعر مخصص (إذا كان مختلف عن السعر الأساسي)
            'final_price',           # السعر النهائي (محسوب)
            'image_url',             # رابط الصورة الكامل
            'is_available',          # متوفر/غير متوفر
            'created_at',            # تاريخ الإنشاء
            'updated_at',            # تاريخ آخر تحديث
        ]
        read_only_fields = [
            'id',                    # لا يمكن تعديله
            'final_price',           # محسوب تلقائياً
            'created_at',            # يُضاف تلقائياً
            'updated_at',            # يُحدث تلقائياً
        ]
    
    def get_image_url(self, obj):
        """
        Get full image URL
        الحصول على رابط الصورة الكامل
        
        Args:
            obj: ProductVariant instance
            
        Returns:
            str: Full URL to variant image, or None if no image
        """
        if obj.image and hasattr(obj.image, 'url'):
            # Build full URL from request
            # بناء الرابط الكامل من الطلب
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    """
    Product Serializer (List View)
    مسلسل المنتج (عرض القائمة)
    
    Serializes Product model data for list views.
    يسلسل بيانات نموذج Product لعروض القائمة
    
    Includes basic product info and vendor summary.
    يتضمن معلومات المنتج الأساسية وملخص البائع.
    
    Fields:
    - id: Product unique identifier
    - name: Product name
    - slug: URL-friendly identifier
    - description: Product description
    - base_price: Base price in Syrian Pounds
    - product_type: Type (shoes/bags)
    - vendor: Vendor information (nested)
    - is_active: Whether product is active
    - created_at: Creation timestamp
    """
    
    # Vendor information (nested serializer)
    # معلومات البائع (مسلسل متداخل)
    vendor = VendorSerializer(read_only=True)
    
    # Vendor ID for filtering (write-only)
    # معرف البائع للفلترة (للكتابة فقط)
    vendor_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id',                    # معرف المنتج الفريد
            'name',                   # اسم المنتج
            'slug',                   # المعرف المستخدم في URLs
            'description',            # وصف المنتج
            'base_price',             # السعر الأساسي (بالليرة السورية)
            'product_type',          # نوع المنتج (أحذية/حقائب)
            'vendor',                # معلومات البائع (متداخل)
            'vendor_id',             # معرف البائع (للكتابة)
            'is_active',             # حالة المنتج (نشط/غير نشط)
            'created_at',            # تاريخ الإنشاء
            'updated_at',            # تاريخ آخر تحديث
        ]
        read_only_fields = [
            'id',                    # لا يمكن تعديله
            'slug',                  # يُولد تلقائياً
            'vendor',                # للقراءة فقط (يُملأ تلقائياً)
            'created_at',           # يُضاف تلقائياً
            'updated_at',            # يُحدث تلقائياً
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Product Detail Serializer
    مسلسل تفاصيل المنتج
    
    Serializes Product with all variants for detail views.
    يسلسل المنتج مع جميع المتغيرات لعروض التفاصيل
    
    Used when retrieving a single product.
    يُستخدم عند استرجاع منتج واحد.
    
    Includes:
    - Full product information
    - Vendor details
    - All product variants (colors, sizes, models)
    """
    
    # Vendor information (nested)
    # معلومات البائع (متداخل)
    vendor = VendorSerializer(read_only=True)
    
    # All variants for this product (nested)
    # جميع المتغيرات لهذا المنتج (متداخلة)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id',                    # معرف المنتج الفريد
            'name',                   # اسم المنتج
            'slug',                   # المعرف المستخدم في URLs
            'description',            # وصف المنتج
            'base_price',             # السعر الأساسي
            'product_type',          # نوع المنتج
            'vendor',                # معلومات البائع
            'variants',               # جميع المتغيرات
            'is_active',             # حالة المنتج
            'created_at',            # تاريخ الإنشاء
            'updated_at',             # تاريخ آخر تحديث
        ]
        read_only_fields = [
            'id',
            'slug',
            'vendor',
            'variants',
            'created_at',
            'updated_at',
        ]

