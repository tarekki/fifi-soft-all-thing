"""
Product Serializers
مسلسلات المنتجات

This module contains serializers for Category, Product and ProductVariant models.
هذا الملف يحتوي على مسلسلات لنماذج Category و Product و ProductVariant
"""

from rest_framework import serializers
from vendors.serializers import VendorSerializer
from .models import Category, Product, ProductVariant, ProductImage


# =============================================================================
# Category Serializers
# مسلسلات الفئات
# =============================================================================

class CategorySerializer(serializers.ModelSerializer):
    """
    Category Serializer (List View)
    مسلسل الفئة (عرض القائمة)
    
    Used for listing categories.
    يُستخدم لعرض قائمة الفئات.
    """
    
    # Computed fields
    # الحقول المحسوبة
    products_count = serializers.ReadOnlyField()
    is_parent = serializers.ReadOnlyField()
    depth = serializers.ReadOnlyField()
    full_path = serializers.ReadOnlyField()
    
    # Parent name for display
    # اسم الأب للعرض
    parent_name = serializers.SerializerMethodField()
    
    # Image URL
    # رابط الصورة
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'image_url',
            'icon',
            'parent',
            'parent_name',
            'display_order',
            'is_active',
            'is_featured',
            'products_count',
            'is_parent',
            'depth',
            'full_path',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'products_count',
            'is_parent',
            'depth',
            'full_path',
            'created_at',
            'updated_at',
        ]
    
    def get_parent_name(self, obj):
        """Get parent category name"""
        if obj.parent:
            return obj.parent.name
        return None
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Category Create/Update Serializer
    مسلسل إنشاء/تحديث الفئة
    
    Used for creating and updating categories.
    يُستخدم لإنشاء وتحديث الفئات.
    """
    
    class Meta:
        model = Category
        fields = [
            'name',
            'name_ar',
            'slug',
            'description',
            'description_ar',
            'image',
            'icon',
            'parent',
            'display_order',
            'is_active',
            'is_featured',
        ]
    
    def validate_parent(self, value):
        """
        Validate parent category
        التحقق من الفئة الأم
        
        Prevents circular references.
        يمنع المراجع الدائرية.
        """
        if value:
            # Check if parent is the same as current (on update)
            # التحقق من أن الأب ليس نفس الفئة الحالية
            if self.instance and value.pk == self.instance.pk:
                raise serializers.ValidationError(
                    "A category cannot be its own parent."
                )
            
            # Check for circular reference
            # التحقق من المرجع الدائري
            if self.instance:
                parent = value
                while parent:
                    if parent.pk == self.instance.pk:
                        raise serializers.ValidationError(
                            "Circular reference detected. This would create an infinite loop."
                        )
                    parent = parent.parent
        
        return value


class CategoryTreeSerializer(serializers.ModelSerializer):
    """
    Category Tree Serializer (Hierarchical)
    مسلسل شجرة الفئات (هرمي)
    
    Used for displaying categories as a tree structure.
    يُستخدم لعرض الفئات كهيكل شجري.
    """
    
    children = serializers.SerializerMethodField()
    products_count = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'name_ar',
            'slug',
            'icon',
            'image_url',
            'is_active',
            'is_featured',
            'display_order',
            'products_count',
            'children',
        ]
    
    def get_children(self, obj):
        """Get child categories recursively"""
        children = obj.children.filter(is_active=True).order_by('display_order', 'name')
        return CategoryTreeSerializer(children, many=True, context=self.context).data
    
    def get_image_url(self, obj):
        """Get full image URL"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


# =============================================================================
# Product Image Serializers
# مسلسلات صور المنتج
# =============================================================================

class ProductImageSerializer(serializers.ModelSerializer):
    """
    Product Image Serializer
    مسلسل صورة المنتج
    
    Serializes ProductImage model data.
    يسلسل بيانات نموذج ProductImage
    """
    
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = [
            'id',
            'image',
            'image_url',
            'display_order',
            'is_primary',
            'alt_text',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
    
    def get_image_url(self, obj):
        """
        Get full image URL
        الحصول على رابط الصورة الكامل
        """
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


# =============================================================================
# Product Variant Serializers
# مسلسلات متغيرات المنتجات
# =============================================================================


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
    
    Includes basic product info, vendor summary, and category.
    يتضمن معلومات المنتج الأساسية وملخص البائع والفئة.
    """
    
    # Vendor information (nested serializer)
    # معلومات البائع (مسلسل متداخل)
    vendor = VendorSerializer(read_only=True)
    
    # Category information (nested serializer)
    # معلومات الفئة (مسلسل متداخل)
    category = CategorySerializer(read_only=True)
    
    # Vendor ID for filtering (write-only)
    # معرف البائع للفلترة (للكتابة فقط)
    vendor_id = serializers.IntegerField(write_only=True, required=False)
    
    # Category ID for filtering (write-only)
    # معرف الفئة للفلترة (للكتابة فقط)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Main image URL for list view
    # رابط الصورة الرئيسية لعرض القائمة
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'base_price',
            'product_type',
            'vendor',
            'vendor_id',
            'category',
            'category_id',
            'main_image_url',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'vendor',
            'category',
            'main_image_url',
            'created_at',
            'updated_at',
        ]
    
    def get_main_image_url(self, obj):
        """Get main product image URL"""
        primary = obj.primary_image
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        # Fallback to first variant image
        first_variant = obj.variants.filter(image__isnull=False).first()
        if first_variant and first_variant.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_variant.image.url)
            return first_variant.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Product Detail Serializer
    مسلسل تفاصيل المنتج
    
    Serializes Product with all variants for detail views.
    يسلسل المنتج مع جميع المتغيرات لعروض التفاصيل
    
    Includes:
    - Full product information
    - Vendor details
    - Category details
    - All product images
    - All product variants (colors, sizes, models)
    """
    
    # Vendor information (nested)
    # معلومات البائع (متداخل)
    vendor = VendorSerializer(read_only=True)
    
    # Category information (nested)
    # معلومات الفئة (متداخل)
    category = CategorySerializer(read_only=True)
    
    # All images for this product (nested)
    # جميع الصور لهذا المنتج (متداخلة)
    images = ProductImageSerializer(many=True, read_only=True)
    
    # All variants for this product (nested)
    # جميع المتغيرات لهذا المنتج (متداخلة)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    # Main image URL for backward compatibility
    # رابط الصورة الرئيسية للتوافق مع الإصدارات السابقة
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'base_price',
            'product_type',
            'vendor',
            'category',
            'images',
            'main_image_url',
            'variants',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'slug',
            'vendor',
            'category',
            'images',
            'main_image_url',
            'variants',
            'created_at',
            'updated_at',
        ]
    
    def get_main_image_url(self, obj):
        """Get main product image URL"""
        primary = obj.primary_image
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        # Fallback to first variant image
        first_variant = obj.variants.filter(image__isnull=False).first()
        if first_variant and first_variant.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_variant.image.url)
            return first_variant.image.url
        return None

