"""
Vendor Product Serializers
متسلسلات منتجات البائع

This module contains serializers for vendor product management.
هذا الملف يحتوي على متسلسلات لإدارة منتجات البائع.

Security Features:
- Vendor isolation (vendor_id from session, not from request)
- Ownership verification
- Optimized queries

ميزات الأمان:
- عزل البائع (vendor_id من الجلسة، وليس من الطلب)
- التحقق من الملكية
- استعلامات محسّنة
"""

from rest_framework import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from products.models import Product, ProductVariant, ProductImage, Category


# =============================================================================
# Product Image Serializers
# متسلسلات صور المنتج
# =============================================================================

class VendorProductImageSerializer(serializers.ModelSerializer):
    """
    Vendor Product Image Serializer
    متسلسل صورة منتج البائع
    
    Used for displaying product images.
    يُستخدم لعرض صور المنتج.
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
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj) -> str | None:
        """Get full image URL"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class VendorProductImageCreateSerializer(serializers.ModelSerializer):
    """
    Vendor Product Image Create Serializer
    متسلسل إنشاء صورة منتج البائع
    """
    
    class Meta:
        model = ProductImage
        fields = [
            'image',
            'display_order',
            'is_primary',
            'alt_text',
        ]


# =============================================================================
# Product Variant Serializers
# متسلسلات متغيرات المنتج
# =============================================================================

class VendorProductVariantSerializer(serializers.ModelSerializer):
    """
    Vendor Product Variant Serializer
    متسلسل متغير منتج البائع
    
    Used for displaying product variants.
    يُستخدم لعرض متغيرات المنتج.
    """
    
    # Computed fields
    # الحقول المحسوبة
    final_price = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'color',
            'color_hex',
            'size',
            'model',
            'sku',
            'stock_quantity',
            'price_override',
            'final_price',
            'image',
            'image_url',
            'is_available',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'final_price', 'created_at', 'updated_at']
    
    def get_image_url(self, obj) -> str | None:
        """Get full image URL"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class VendorProductVariantCreateSerializer(serializers.ModelSerializer):
    """
    Vendor Product Variant Create Serializer
    متسلسل إنشاء متغير منتج البائع
    """
    
    class Meta:
        model = ProductVariant
        fields = [
            'color',
            'color_hex',
            'size',
            'model',
            'sku',
            'stock_quantity',
            'price_override',
            'image',
            'is_available',
        ]


# =============================================================================
# Product List Serializer
# متسلسل قائمة المنتجات
# =============================================================================

class VendorProductListSerializer(serializers.ModelSerializer):
    """
    Vendor Product List Serializer
    متسلسل قائمة منتجات البائع
    
    Optimized for vendor list view.
    مُحسّن لعرض قائمة البائع.
    """
    
    # Category info
    # معلومات الفئة
    category_name = serializers.SerializerMethodField()
    category_name_ar = serializers.SerializerMethodField()
    
    # Computed fields
    # الحقول المحسوبة
    variants_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'base_price',
            'product_type',
            'category',
            'category_name',
            'category_name_ar',
            'variants_count',
            'total_stock',
            'main_image',
            'status',
            'is_active',
            'created_at',
            'updated_at',
        ]
    
    def get_category_name(self, obj) -> str | None:
        """Get category name"""
        if obj.category:
            return obj.category.name
        return None
    
    def get_category_name_ar(self, obj) -> str | None:
        """Get category Arabic name"""
        if obj.category:
            return obj.category.name_ar
        return None
    
    def get_variants_count(self, obj) -> int:
        """Get variants count"""
        return obj.variants.count()
    
    def get_total_stock(self, obj) -> int:
        """Get total stock across all variants"""
        return sum(variant.stock_quantity for variant in obj.variants.all())
    
    def get_main_image(self, obj) -> str | None:
        """Get main product image URL"""
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None
    
    def get_status(self, obj) -> str:
        """Get product status"""
        if not obj.is_active:
            return 'draft'
        
        total_stock = self.get_total_stock(obj)
        if total_stock == 0:
            return 'out_of_stock'
        
        return 'active'


# =============================================================================
# Product Detail Serializer
# متسلسل تفاصيل المنتج
# =============================================================================

class VendorProductDetailSerializer(serializers.ModelSerializer):
    """
    Vendor Product Detail Serializer
    متسلسل تفاصيل منتج البائع
    
    Used for displaying full product details.
    يُستخدم لعرض تفاصيل المنتج الكاملة.
    """
    
    # Category info
    # معلومات الفئة
    category_name = serializers.SerializerMethodField()
    category_name_ar = serializers.SerializerMethodField()
    
    # Related data
    # البيانات المرتبطة
    images = VendorProductImageSerializer(many=True, read_only=True)
    variants = VendorProductVariantSerializer(many=True, read_only=True)
    
    # Computed fields
    # الحقول المحسوبة
    variants_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'base_price',
            'product_type',
            'category',
            'category_name',
            'category_name_ar',
            'images',
            'variants',
            'variants_count',
            'total_stock',
            'status',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_category_name(self, obj) -> str | None:
        """Get category name"""
        if obj.category:
            return obj.category.name
        return None
    
    def get_category_name_ar(self, obj) -> str | None:
        """Get category Arabic name"""
        if obj.category:
            return obj.category.name_ar
        return None
    
    def get_variants_count(self, obj) -> int:
        """Get variants count"""
        return obj.variants.count()
    
    def get_total_stock(self, obj) -> int:
        """Get total stock across all variants"""
        return sum(variant.stock_quantity for variant in obj.variants.all())
    
    def get_status(self, obj) -> str:
        """Get product status"""
        if not obj.is_active:
            return 'draft'
        
        total_stock = self.get_total_stock(obj)
        if total_stock == 0:
            return 'out_of_stock'
        
        return 'active'


# =============================================================================
# Product Create Serializer
# متسلسل إنشاء المنتج
# =============================================================================

class VendorProductCreateSerializer(serializers.ModelSerializer):
    """
    Vendor Product Create Serializer
    متسلسل إنشاء منتج البائع
    
    Used for creating new products.
    vendor_id is automatically set from session (not from request).
    
    يُستخدم لإنشاء منتجات جديدة.
    vendor_id يُضاف تلقائياً من الجلسة (وليس من الطلب).
    """
    
    # Category ID (optional)
    # معرف الفئة (اختياري)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Variants (optional, can be added later)
    # المتغيرات (اختيارية، يمكن إضافتها لاحقاً)
    variants = VendorProductVariantCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name',
            'description',
            'base_price',
            'product_type',
            'category_id',
            'is_active',
            'variants',
        ]
    
    def validate_category_id(self, value):
        """Validate category exists (if provided)"""
        if value is not None:
            try:
                Category.objects.get(pk=value)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    _("الفئة غير موجودة / Category not found")
                )
        return value
    
    def validate_base_price(self, value):
        """Validate base price is positive"""
        if value <= 0:
            raise serializers.ValidationError(
                _("السعر يجب أن يكون أكبر من صفر / Price must be greater than zero")
            )
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Create product with variants.
        vendor_id is set from context (session).
        
        إنشاء المنتج مع المتغيرات.
        vendor_id يُضاف من السياق (الجلسة).
        """
        # Get vendor from context (set by view)
        # الحصول على البائع من السياق (يُضاف من الـ view)
        vendor = self.context.get('vendor')
        if not vendor:
            raise serializers.ValidationError(
                _("البائع غير موجود في السياق / Vendor not found in context")
            )
        
        # Extract nested data
        # استخراج البيانات المتداخلة
        variants_data = validated_data.pop('variants', [])
        category_id = validated_data.pop('category_id', None)
        
        # Create product with vendor from session
        # إنشاء المنتج مع البائع من الجلسة
        product = Product.objects.create(
            vendor=vendor,  # vendor_id from session (security)
            category_id=category_id,
            **validated_data
        )
        
        # Create variants if provided
        # إنشاء المتغيرات إذا كانت موجودة
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product


# =============================================================================
# Product Update Serializer
# متسلسل تحديث المنتج
# =============================================================================

class VendorProductUpdateSerializer(serializers.ModelSerializer):
    """
    Vendor Product Update Serializer
    متسلسل تحديث منتج البائع
    
    Used for updating existing products.
    vendor_id cannot be changed (security).
    
    يُستخدم لتحديث المنتجات الموجودة.
    vendor_id لا يمكن تغييره (أمان).
    """
    
    # Category ID (optional)
    # معرف الفئة (اختياري)
    category_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'name',
            'description',
            'base_price',
            'product_type',
            'category_id',
            'is_active',
        ]
    
    def validate_category_id(self, value):
        """Validate category exists (if provided)"""
        if value is not None:
            try:
                Category.objects.get(pk=value)
            except Category.DoesNotExist:
                raise serializers.ValidationError(
                    _("الفئة غير موجودة / Category not found")
                )
        return value
    
    def validate_base_price(self, value):
        """Validate base price is positive"""
        if value <= 0:
            raise serializers.ValidationError(
                _("السعر يجب أن يكون أكبر من صفر / Price must be greater than zero")
            )
        return value
    
    def update(self, instance, validated_data):
        """
        Update product.
        vendor_id cannot be changed (security).
        
        تحديث المنتج.
        vendor_id لا يمكن تغييره (أمان).
        """
        # Extract category_id
        # استخراج category_id
        category_id = validated_data.pop('category_id', None)
        
        # Update product
        # تحديث المنتج
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update category if provided
        # تحديث الفئة إذا كانت موجودة
        if category_id is not None:
            instance.category_id = category_id
        
        instance.save()
        return instance

