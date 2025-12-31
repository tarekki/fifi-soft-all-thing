"""
Admin Product Serializers
مسلسلات المنتجات للإدارة

This module contains serializers for managing products in the admin panel.
هذا الملف يحتوي على مسلسلات لإدارة المنتجات في لوحة الإدارة.
"""

from rest_framework import serializers
from django.db import transaction
from products.models import Product, ProductVariant, ProductImage, Category
from vendors.models import Vendor


# =============================================================================
# Product Image Serializers
# مسلسلات صور المنتج
# =============================================================================

class AdminProductImageSerializer(serializers.ModelSerializer):
    """
    Admin Product Image Serializer
    مسلسل صورة المنتج للإدارة
    
    Used for displaying and managing product images.
    يُستخدم لعرض وإدارة صور المنتج.
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


class AdminProductImageCreateSerializer(serializers.ModelSerializer):
    """
    Admin Product Image Create Serializer
    مسلسل إنشاء صورة المنتج للإدارة
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
# مسلسلات متغيرات المنتج
# =============================================================================

class AdminProductVariantSerializer(serializers.ModelSerializer):
    """
    Admin Product Variant Serializer
    مسلسل متغير المنتج للإدارة
    
    Used for displaying and managing product variants.
    يُستخدم لعرض وإدارة متغيرات المنتج.
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


class AdminProductVariantCreateSerializer(serializers.ModelSerializer):
    """
    Admin Product Variant Create Serializer
    مسلسل إنشاء متغير المنتج للإدارة
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
# مسلسل قائمة المنتجات
# =============================================================================

class AdminProductListSerializer(serializers.ModelSerializer):
    """
    Admin Product List Serializer
    مسلسل قائمة المنتجات للإدارة
    
    Optimized for admin list view with all needed fields.
    مُحسّن لعرض القائمة في الإدارة مع جميع الحقول المطلوبة.
    """
    
    # Vendor info
    # معلومات البائع
    vendor_name = serializers.SerializerMethodField()
    vendor_logo = serializers.SerializerMethodField()
    
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
            'vendor',
            'vendor_name',
            'vendor_logo',
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
    
    def get_vendor_name(self, obj) -> str | None:
        """Get vendor name"""
        if obj.vendor:
            return obj.vendor.name
        return None
    
    def get_vendor_logo(self, obj) -> str | None:
        """Get vendor logo URL"""
        if obj.vendor and obj.vendor.logo and hasattr(obj.vendor.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.vendor.logo.url)
            return obj.vendor.logo.url
        return None
    
    def get_category_name(self, obj) -> str | None:
        """Get category name (English)"""
        if obj.category:
            return obj.category.name
        return None
    
    def get_category_name_ar(self, obj) -> str | None:
        """Get category name (Arabic)"""
        if obj.category:
            return obj.category.name_ar
        return None
    
    def get_variants_count(self, obj) -> int:
        """Get total variants count"""
        return obj.variants.count()
    
    def get_total_stock(self, obj) -> int:
        """Get total stock across all variants"""
        return sum(v.stock_quantity for v in obj.variants.all())
    
    def get_main_image(self, obj) -> str | None:
        """Get main product image (primary image or first variant's image)"""
        # Try to get primary product image first
        primary_image = obj.primary_image
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        # Fallback to first variant image
        first_variant = obj.variants.filter(image__isnull=False).first()
        if first_variant and first_variant.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_variant.image.url)
            return first_variant.image.url
        return None
    
    def get_status(self, obj) -> str:
        """
        Get product status based on is_active and stock
        تحديد حالة المنتج بناءً على التفعيل والمخزون
        """
        if not obj.is_active:
            return 'draft'
        
        total_stock = sum(v.stock_quantity for v in obj.variants.all())
        if total_stock == 0:
            return 'out_of_stock'
        
        return 'active'


# =============================================================================
# Product Detail Serializer
# مسلسل تفاصيل المنتج
# =============================================================================

class AdminProductDetailSerializer(serializers.ModelSerializer):
    """
    Admin Product Detail Serializer
    مسلسل تفاصيل المنتج للإدارة
    
    Complete product details including all variants.
    تفاصيل المنتج الكاملة بما في ذلك جميع المتغيرات.
    """
    
    # Vendor info
    vendor_name = serializers.SerializerMethodField()
    vendor_logo = serializers.SerializerMethodField()
    
    # Category info
    category_name = serializers.SerializerMethodField()
    category_name_ar = serializers.SerializerMethodField()
    
    # Images (nested)
    # الصور (متداخلة)
    images = AdminProductImageSerializer(many=True, read_only=True)
    
    # Variants (nested)
    # المتغيرات (متداخلة)
    variants = AdminProductVariantSerializer(many=True, read_only=True)
    
    # Computed fields
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
            'vendor',
            'vendor_name',
            'vendor_logo',
            'category',
            'category_name',
            'category_name_ar',
            'images',
            'variants',
            'variants_count',
            'total_stock',
            'main_image',
            'status',
            'is_active',
            'created_at',
            'updated_at',
        ]
    
    def get_vendor_name(self, obj) -> str | None:
        if obj.vendor:
            return obj.vendor.name
        return None
    
    def get_vendor_logo(self, obj) -> str | None:
        if obj.vendor and obj.vendor.logo and hasattr(obj.vendor.logo, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.vendor.logo.url)
            return obj.vendor.logo.url
        return None
    
    def get_category_name(self, obj) -> str | None:
        if obj.category:
            return obj.category.name
        return None
    
    def get_category_name_ar(self, obj) -> str | None:
        if obj.category:
            return obj.category.name_ar
        return None
    
    def get_variants_count(self, obj) -> int:
        return obj.variants.count()
    
    def get_total_stock(self, obj) -> int:
        return sum(v.stock_quantity for v in obj.variants.all())
    
    def get_main_image(self, obj) -> str | None:
        """Get main product image (primary image or first variant's image)"""
        # Try to get primary product image first
        primary_image = obj.primary_image
        if primary_image and primary_image.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        # Fallback to first variant image
        first_variant = obj.variants.filter(image__isnull=False).first()
        if first_variant and first_variant.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_variant.image.url)
            return first_variant.image.url
        return None
    
    def get_status(self, obj) -> str:
        if not obj.is_active:
            return 'draft'
        total_stock = sum(v.stock_quantity for v in obj.variants.all())
        if total_stock == 0:
            return 'out_of_stock'
        return 'active'


# =============================================================================
# Product Create Serializer
# مسلسل إنشاء المنتج
# =============================================================================

class AdminProductCreateSerializer(serializers.ModelSerializer):
    """
    Admin Product Create Serializer
    مسلسل إنشاء المنتج للإدارة
    
    Used for creating new products with optional variants.
    يُستخدم لإنشاء منتجات جديدة مع متغيرات اختيارية.
    """
    
    # Vendor and Category IDs
    # معرفات البائع والفئة
    vendor_id = serializers.IntegerField(write_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Variants (optional, can be added later)
    # المتغيرات (اختيارية، يمكن إضافتها لاحقاً)
    variants = AdminProductVariantCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name',
            'description',
            'base_price',
            'product_type',
            'vendor_id',
            'category_id',
            'is_active',
            'variants',
        ]
    
    def validate_vendor_id(self, value):
        """Validate vendor exists"""
        try:
            Vendor.objects.get(pk=value)
        except Vendor.DoesNotExist:
            raise serializers.ValidationError("البائع غير موجود / Vendor not found")
        return value
    
    def validate_category_id(self, value):
        """Validate category exists (if provided)"""
        if value is not None:
            try:
                Category.objects.get(pk=value)
            except Category.DoesNotExist:
                raise serializers.ValidationError("الفئة غير موجودة / Category not found")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Create product with variants
        إنشاء المنتج مع المتغيرات
        """
        # Extract nested data
        # استخراج البيانات المتداخلة
        variants_data = validated_data.pop('variants', [])
        vendor_id = validated_data.pop('vendor_id')
        category_id = validated_data.pop('category_id', None)
        
        # Create product
        # إنشاء المنتج
        product = Product.objects.create(
            vendor_id=vendor_id,
            category_id=category_id,
            **validated_data
        )
        
        # Create variants
        # إنشاء المتغيرات
        for variant_data in variants_data:
            ProductVariant.objects.create(product=product, **variant_data)
        
        return product


# =============================================================================
# Product Update Serializer
# مسلسل تحديث المنتج
# =============================================================================

class AdminProductUpdateSerializer(serializers.ModelSerializer):
    """
    Admin Product Update Serializer
    مسلسل تحديث المنتج للإدارة
    
    Used for updating existing products.
    يُستخدم لتحديث المنتجات الموجودة.
    """
    
    # Vendor and Category IDs
    vendor_id = serializers.IntegerField(write_only=True, required=False)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'name',
            'description',
            'base_price',
            'product_type',
            'vendor_id',
            'category_id',
            'is_active',
        ]
    
    def validate_vendor_id(self, value):
        """Validate vendor exists"""
        try:
            Vendor.objects.get(pk=value)
        except Vendor.DoesNotExist:
            raise serializers.ValidationError("البائع غير موجود / Vendor not found")
        return value
    
    def validate_category_id(self, value):
        """Validate category exists (if provided)"""
        if value is not None:
            try:
                Category.objects.get(pk=value)
            except Category.DoesNotExist:
                raise serializers.ValidationError("الفئة غير موجودة / Category not found")
        return value
    
    def update(self, instance, validated_data):
        """
        Update product
        تحديث المنتج
        """
        # Handle vendor_id
        vendor_id = validated_data.pop('vendor_id', None)
        if vendor_id is not None:
            instance.vendor_id = vendor_id
        
        # Handle category_id
        category_id = validated_data.pop('category_id', None)
        if 'category_id' in self.initial_data:  # Only update if explicitly provided
            instance.category_id = category_id
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# =============================================================================
# Product Bulk Action Serializer
# مسلسل العمليات المجمعة للمنتجات
# =============================================================================

class AdminProductBulkActionSerializer(serializers.Serializer):
    """
    Admin Product Bulk Action Serializer
    مسلسل العمليات المجمعة للمنتجات
    
    Used for performing bulk actions on multiple products.
    يُستخدم لتنفيذ عمليات مجمعة على عدة منتجات.
    """
    
    ACTION_CHOICES = [
        ('activate', 'تفعيل'),
        ('deactivate', 'إلغاء التفعيل'),
        ('delete', 'حذف'),
    ]
    
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="قائمة معرفات المنتجات"
    )
    action = serializers.ChoiceField(
        choices=ACTION_CHOICES,
        help_text="نوع العملية"
    )
    
    def validate_product_ids(self, value):
        """Validate all product IDs exist"""
        existing_ids = set(
            Product.objects.filter(pk__in=value).values_list('pk', flat=True)
        )
        missing_ids = set(value) - existing_ids
        if missing_ids:
            raise serializers.ValidationError(
                f"المنتجات غير موجودة: {list(missing_ids)}"
            )
        return value

